import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ frameId: string }> }
) {
    try {
        const { frameId } = await params;
        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        // Lấy frame từ DB
        const frame = await prisma.frame.findFirst({
            where: { id: frameId },
            include: { project: true },
        });

        if (!frame) {
            return NextResponse.json({ error: "Frame not found" }, { status: 404 });
        }

        // Gọi Gemini convert HTML → Flutter
        //         const result = await generateText({
        //             model: openrouter.chat("google/gemini-2.5-flash-lite-preview-09-2025"),
        //             system: `You are an expert Flutter/Dart developer. 
        // Your job is to convert HTML/CSS mobile UI to Flutter Dart code.

        // RULES:
        // 1. Output ONLY valid Dart code, no markdown, no explanation
        // 2. Create a complete StatelessWidget or StatefulWidget
        // 3. Use Flutter Material widgets (Container, Column, Row, Stack, ListView, etc.)
        // 4. Convert Tailwind colors to Flutter Colors or hex colors
        // 5. Convert CSS flexbox to Flutter Row/Column
        // 6. Convert CSS grid to Flutter GridView
        // 7. Use proper Flutter padding, margin, decoration
        // 8. Include all imports at the top
        // 9. Widget class name should match the screen title
        // 10. Make it pixel-perfect matching the HTML design
        // 11. For images use Image.network() with the same URLs
        // 12. For icons use Icons.* from material library
        // 13. Output must be a complete runnable Flutter widget`,

        //             prompt: `Convert this HTML mobile UI screen to Flutter Dart code.
        // Screen Title: ${frame.title}
        // HTML Content:
        // ${frame.htmlContent}

        // Generate complete Flutter widget code now.`,
        //         });

        const result = await generateText({
            model: openrouter.chat(
                "google/gemini-2.5-flash-lite-preview-09-2025"
            ),
            maxOutputTokens: 4000, // 👈 giảm xuống 4000 là đủ cho 1 màn hình Flutter
            system: `
You are a senior Flutter engineer.

Your task is to convert HTML/CSS mobile UI into VALID Flutter Dart code.

STRICT REQUIREMENTS:

1. Return ONLY Dart code
2. No markdown
3. No explanation
4. No comments
5. Code MUST compile successfully in Flutter

FLUTTER RULES:
- Use ONLY Flutter built-in widgets
- Do NOT use any third-party packages
- Do NOT invent libraries
- Do NOT use unsupported widgets
- Use ONLY:
  Scaffold,
  SafeArea,
  Container,
  Column,
  Row,
  Stack,
  Expanded,
  ListView,
  GridView,
  Padding,
  Text,
  Image.network,
  Icon,
  ElevatedButton,
  TextField,
  BottomNavigationBar,
  Card

LAYOUT RULES:
- Mobile responsive UI
- Use SingleChildScrollView if content may overflow
- Prevent RenderFlex overflow
- Avoid nested scroll conflicts
- Use Expanded/Flexible when needed

STYLE RULES:
- Convert Tailwind colors to Flutter Color(0xFFxxxxxx)
- Convert flexbox to Row/Column
- Convert border radius properly
- Convert spacing using EdgeInsets

ICON RULES:
- Use ONLY Icons.* from material icons
- If unknown icon exists, replace with Icons.circle

IMAGE RULES:
- Use Image.network()
- Add errorBuilder fallback

OUTPUT RULES:
- Include:
import 'package:flutter/material.dart';

- Create ONE complete StatelessWidget
- Widget name:
${frame.title.replace(/\s+/g, "")}Screen

- Include:
Scaffold
SafeArea

- Return complete runnable code only
`,

            prompt: `
Convert this mobile UI into Flutter.

Screen title:
${frame.title}

HTML:
${frame.htmlContent}

Generate valid runnable Flutter code.
`,
        });

        const dartCode = result.text.trim();

        return NextResponse.json({
            success: true,
            data: {
                dartCode,
                fileName: `${frame.title.toLowerCase().replace(/\s+/g, "_")}_screen.dart`,
            }
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to generate Flutter code" },
            { status: 500 }
        );
    }
}