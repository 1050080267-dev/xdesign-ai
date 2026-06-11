import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Lấy danh sách thành viên
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) throw new Error("Unauthorized");

    // Kiểm tra user có quyền xem project không
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// Invite thành viên
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { email, role } = await req.json();

    const session = await getKindeServerSession();
    const user = await session.getUser();
    if (!user) throw new Error("Unauthorized");

    if (!email) throw new Error("Missing email");

    // Chỉ owner mới được invite
    const project = await prisma.project.findFirst({
      where: { id, userId: user.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Chỉ owner mới được mời thành viên" },
        { status: 403 }
      );
    }

    // Kiểm tra đã invite chưa
    const existing = await prisma.projectMember.findFirst({
      where: { projectId: id, email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email này đã được mời rồi" },
        { status: 400 }
      );
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: "",        // Chưa có userId vì chưa đăng nhập
        email,
        role: role || "viewer",
      },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to invite member" },
      { status: 500 }
    );
  }
}