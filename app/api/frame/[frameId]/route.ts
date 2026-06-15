import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ frameId: string }> }
) {
    try {
        const { frameId } = await params;
        const { htmlContent } = await req.json();

        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        const frame = await prisma.frame.findFirst({
            where: { id: frameId },
            include: { project: true },
        });

        if (!frame) {
            return NextResponse.json({ error: "Frame not found" }, { status: 404 });
        }

        // Kiểm tra quyền
        const isOwner = frame.project.userId === user.id;

        // Kiểm tra member có role editor không
        const member = await prisma.projectMember.findFirst({
            where: {
                projectId: frame.projectId,
                userId: user.id,        // 👈 check bằng userId
                role: "editor",
            }
        });

        if (!isOwner && !member) {
            return NextResponse.json(
                { error: "Bạn không có quyền chỉnh sửa" },
                { status: 403 }
            );
        }

        const updated = await prisma.frame.update({
            where: { id: frameId },
            data: { htmlContent, updatedAt: new Date() },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to update frame" },
            { status: 500 }
        );
    }
}

// Xóa 1 frame
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ frameId: string }> }
) {
  try {
    const { frameId } = await params;

    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) throw new Error("Unauthorized");

    const frame = await prisma.frame.findFirst({
      where: { id: frameId },
      include: { project: true },
    });

    if (!frame) {
      return NextResponse.json(
        { error: "Frame not found" },
        { status: 404 }
      );
    }

    // 👇 thêm đoạn này
    const isOwner = frame.project.userId === user.id;

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId: frame.projectId,
        userId: user.id,
        role: "editor",
      }
    });

    if (!isOwner && !member) {
      return NextResponse.json(
        { error: "Bạn không có quyền xóa giao diện" },
        { status: 403 }
      );
    }

    await prisma.frame.delete({
      where: { id: frameId }
    });

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to delete frame" },
      { status: 500 }
    );
  }
}