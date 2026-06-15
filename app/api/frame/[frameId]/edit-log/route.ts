import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Lấy danh sách edit log
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ frameId: string }> }
) {
    try {
        const { frameId } = await params;
        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        const logs = await prisma.editLog.findMany({
            where: { frameId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return NextResponse.json({ success: true, data: logs });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

// Thêm edit log
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ frameId: string }> }
) {
    try {
        const { frameId } = await params;

        // 👇 Thêm selector vào đây
        const { projectId, action, element, selector, oldValue, newValue } = await req.json();

        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        const userName = `${user.given_name || ""} ${user.family_name || ""}`.trim();

        const log = await prisma.editLog.create({
            data: {
                frameId,
                projectId,
                userId: user.id,
                userName,
                action,
                element,
                selector: selector || null, //  giờ selector đã được khai báo
                oldValue,
                newValue,
            }
        });

        return NextResponse.json({ success: true, data: log });
    } catch (error) {
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}