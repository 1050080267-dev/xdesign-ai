import { google } from '@ai-sdk/google';
import { openrouter } from "@/lib/openrouter";
import { inngest } from "../client";
import { z } from "zod";
import { FrameType } from "@/types/project";
import { generateObject, generateText, stepCountIs } from "ai";
import { ANALYSIS_PROMPT, GENERATION_SYSTEM_PROMPT, } from "@/lib/prompt";
import prisma from "@/lib/prisma";
import { BASE_VARIABLES, THEME_LIST } from "@/lib/themes";
import { unsplashTool } from "../tool";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Định nghĩa Schema cho AI
const AnalysisSchema = z.object({
  theme: z.string().describe("The specific visual theme ID (e.g., 'midnight', 'ocean-breeze', 'neo-brutalism')."),
  screens: z.array(
    z.object({
      id: z.string().describe("Unique identifier for the screen (e.g., 'home-dashboard'). Use kebab-case."),
      name: z.string().describe("Short, descriptive name of the screen"),
      purpose: z.string().describe("One clear sentence explaining what this screen accomplishes"),
      visualDescription: z.string().describe("A dense, high-fidelity visual directive (like an image generation prompt)."),
    })
  ).min(1).max(4),
});

export const generateScreens = inngest.createFunction(
  { id: "generate-ui-screen" },
  { event: "ui/generate.screens" },
  async ({ event, step }) => {

    const { userId, projectId, prompt, frames, theme: existingTheme } = event.data;
    console.log("userId từ event (generateScreens.ts):", userId); // THÊM DÒNG NÀY
    const CHANNEL = `user:${userId}`;
    const isExistingGeneration = Array.isArray(frames) && frames.length > 0;

    // BƯỚC 1: THÔNG BÁO BẮT ĐẦU
    await inngest.send({
      name: "generation.start",
      channel: CHANNEL,
      topic: "generation.start",
      data: { status: "running", projectId: projectId },
    });

    // BƯỚC 2: PHÂN TÍCH VÀ LẬP KẾ HOẠCH (ANALYZE)
    const analysis = await step.run("analyze-and-plan-screen", async () => {
      const contextHTML = isExistingGeneration
        ? frames.slice(0, 4).map((frame: FrameType) => frame.htmlContent).join("\n")
        : "";

      const analysisPrompt = isExistingGeneration
        ? `USER REQUEST: ${prompt}\nSELECTED THEME: ${existingTheme}\nCONTEXT HTML: ${contextHTML}`.trim()
        : `USER REQUEST: ${prompt}`.trim();

      const { object } = await generateObject({
        model: openrouter.chat("google/gemini-2.5-flash"),
        schema: AnalysisSchema,
        system: ANALYSIS_PROMPT,
        prompt: analysisPrompt,
        //có thể xóa
        // maxOutputTokens: 12000,
        maxOutputTokens: 6000,
      });

      const themeToUse = isExistingGeneration ? existingTheme : object.theme;

      if (!isExistingGeneration) {
        await prisma.project.update({
          where: { id: projectId, userId: userId },
          data: { theme: themeToUse },
        });
      }

      return { ...object, themeToUse };
    });

    // BƯỚC 3: GỬI TÍN HIỆU HOÀN TẤT PHÂN TÍCH (ĐỂ HIỆN SKELETON LOADING)
    await inngest.send({
      name: "analysis.complete",
      channel: CHANNEL,
      topic: "analysis.complete",
      data: {
        status: "generating",
        theme: analysis.themeToUse,
        screens: analysis.screens,
        projectId: projectId,
      },
    });

    // BƯỚC 4: VÒNG LẶP TẠO TỪNG MÀN HÌNH (GENERATION)
    for (let i = 0; i < analysis.screens.length; i++) {
      const screenPlan = analysis.screens[i];
      const selectedTheme = THEME_LIST.find((t) => t.id === analysis.themeToUse);
      const fullThemeCSS = `${BASE_VARIABLES}\n${selectedTheme?.style || ""}`;

      // Chạy bước tạo HTML cho từng màn hình
      const resultFrame = await step.run(`generated-screen-${i}`, async () => {
        const result = await generateText({
          model: openrouter.chat("google/gemini-2.5-pro"),
          system: GENERATION_SYSTEM_PROMPT,
          // maxOutputTokens: 12000,
          maxOutputTokens: 6000,
          tools: { searchUnsplash: unsplashTool },
          stopWhen: stepCountIs(5),
          prompt: `
          IMPORTANT: You MUST call searchUnsplash tool FIRST before writing HTML.
- Call searchUnsplash for EVERY image: restaurant photos, food banners, avatars, backgrounds
- Use returned URL in <img src="URL" class="w-full h-full object-cover rounded-xl">
- NEVER use placeholder text like [Restaurant], [Deal Image], [Avatar]
- If tool returns empty, use a colored gradient div instead
          - Screen ${i + 1}/${analysis.screens.length}
          - Screen ID: ${screenPlan.id}
          - Screen Name: ${screenPlan.name}
          - Screen Purpose: ${screenPlan.purpose}

          VISUAL DESCRIPTION: ${screenPlan.visualDescription}
          THEME STYLE (Use these for colors): ${fullThemeCSS}

          CRITICAL REQUIREMENTS:
          1. **Generate ONLY raw HTML markup for this mobile app screen using Tailwind CSS.**
             - Use Tailwind classes for layout, spacing, typography, shadows, etc.
             - Use theme CSS variables ONLY for color-related properties (bg-[var(--background)], text-[var(--foreground)], border-[var(--border)], ring-[var(--ring)], etc.)
          2. **All content must be inside a single root <div> that controls the layout.**
             - No overflow classes on the root.
             - All scrollable content must be in inner containers with hidden scrollbars: [&::-webkit-scrollbar]:hidden scrollbar-none
          3. **For absolute overlays (maps, bottom sheets, modals, etc.):**
             - Use \`relative w-full h-screen\` on the top div of the overlay.
          4. **For regular content:**
             - Use \`w-full h-full min-h-screen\` on the top div.
          5. **Do not use h-screen on inner content unless absolutely required.**
             - Height must grow with content; content must be fully visible inside an iframe.
          6. **For z-index layering:**
             - Ensure absolute elements do not block other content unnecessarily.
          7. **Output raw HTML only, starting with <div>.**
             - Do not include markdown, comments, <html>, <body>, or <head>.
          8. **Hardcode a style only if a theme variable is not needed for that element.**
          9. **Ensure iframe-friendly rendering:**
             - All elements must contribute to the final scrollHeight so your parent iframe can correctly resize.

          Generate the complete, production-ready HTML for this screen now`.trim(),
        });

        let finalHtml = result.text ?? "";
        const match = finalHtml.match(/<div[\s\S]*<\/div>/);
        finalHtml = match ? match[0] : finalHtml;
        finalHtml = finalHtml.replace(/```/g, "").trim();

        // Lưu vào Database
        return await prisma.frame.create({
          data: {
            projectId,
            title: screenPlan.name,
            htmlContent: finalHtml,
          },
        });
      });

      // ✅ Gửi tín hiệu Realtime NGAY SAU KHI một frame vừa được lưu xong
      await inngest.send({
        name: "frame.created",
        channel: CHANNEL,
        topic: "frame.created",
        data: {
          frame: resultFrame,
          screenId: screenPlan.id,
          projectId: projectId,
        },
      });
    }

    // BƯỚC 5: THÔNG BÁO HOÀN TẤT TOÀN BỘ
    await inngest.send({
      name: "generation.complete",
      channel: CHANNEL,
      topic: "generation.complete",
      data: {
        status: "completed",
        projectId: projectId,
      },
    });
  }
);