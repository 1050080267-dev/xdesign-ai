import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { openrouter } from "@/lib/openrouter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ frameId: string }> }
) {
    try {
        const { frameId } = await params;
        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        // 👇 Đọc htmlContent từ body nếu có
        const body = await req.json().catch(() => ({}));
        const htmlFromBody = body.htmlContent;

        const frame = await prisma.frame.findFirst({
            where: { id: frameId },
            include: { project: true },
        });

        if (!frame) {
            return NextResponse.json({ error: "Frame not found" }, { status: 404 });
        }

        // 👇 Ưu tiên HTML từ frontend, fallback về DB
        const finalHtml = htmlFromBody || frame.htmlContent;

        const result = await generateText({
            model: openrouter.chat("google/gemini-2.5-pro"),
            maxOutputTokens: 16000,
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
${finalHtml}

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