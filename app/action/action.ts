"use server";
import { openrouter } from "@/lib/openrouter";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateProjectName(prompt: string) {
    try {
        const { text } = await generateText({
            // model: openrouter.chat("google/gemini-2.5-flash-lite"),
            // model: google('gemini-1.5-pro'),
            // model: google('gemini-2.5-flash-preview-05-20'),
            // model: google('gemini-2.0-flash-001'),
            // Bỏ comment dòng này
        // model: openrouter.chat("google/gemini-2.5-flash-lite"),
        model: openrouter.chat("google/gemini-2.5-flash-lite-preview-09-2025"),
          maxOutputTokens: 100, // 👈 thêm dòng này
            system: `
          You are an AI assistant that generates very very short project names based on the user's prompt.
          - Keep it under 5 words.
          - Captitalize words appropriately.
          - Do not include special characters.
        `,
            prompt: prompt,
        });
        return text?.trim() || "Untitled Project";
    } catch (error) {
        console.log(error);
        return "Untitled Project";
    }
}