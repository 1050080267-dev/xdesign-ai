import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { inngest } from "@/inngest/client";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        const project = await prisma.project.findFirst({
            where: {
                id,
                OR: [
                    { userId: user.id },
                    {
                        members: {
                            some: {
                                OR: [
                                    { email: user.email as string },
                                    { userId: user.id },
                                ]
                            }
                        }
                    }
                ]
            },
            include: { frames: true },
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        // Xác định role của user hiện tại
        const isOwner = project.userId === user.id;
        let currentUserRole = "viewer";

        if (isOwner) {
            currentUserRole = "owner";
        } else {
            const member = await prisma.projectMember.findFirst({
                where: {
                    projectId: id,
                    OR: [
                        { userId: user.id },
                        { email: user.email as string },
                    ]
                }
            });
            currentUserRole = member?.role || "viewer";
        }

        return NextResponse.json({
            ...project,
            currentUserRole,
        });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Fail to fetch Project" }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { prompt } = await request.json();
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");
        if (!prompt) throw new Error("Missing Prompt");

        const userId = user.id;

        const project = await prisma.project.findFirst({
            where: {
                id,
                OR: [
                    { userId: user.id },
                    {
                        members: {
                            some: {
                                OR: [
                                    { email: user.email as string },
                                    { userId: user.id },
                                ]
                            }
                        }
                    }
                ]
            },
            include: { frames: true },
        });

        if (!project) throw new Error("Project not found");

        // Kiểm tra quyền — viewer không được generate
        const isOwner = project.userId === user.id;
        const member = await prisma.projectMember.findFirst({
            where: {
                projectId: id,
                OR: [
                    { userId: user.id },
                    { email: user.email as string },
                ]
            }
        });
        const isEditor = member?.role === "editor";

        if (!isOwner && !isEditor) {
            return NextResponse.json(
                { error: "Bạn không có quyền chỉnh sửa project này" },
                { status: 403 }
            );
        }

        try {
            await inngest.send({
                name: "ui/generate.screens",
                data: {
                    userId,
                    projectId: id,
                    prompt,
                    frames: project?.frames,
                    theme: project.theme,
                },
            });
        } catch (error) {
            console.log(error);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log("Error occured ", error);
        return NextResponse.json(
            { error: "Failed to generate frame" },
            { status: 500 }
        );
    }
}

// export async function PATCH(
//     request: Request,
//     { params }: { params: Promise<{ id: string }> }
// ) {
//     try {
//         const { id } = await params;
//         const { themeId } = await request.json();
//         const session = await getKindeServerSession();
//         const user = await session.getUser();

//         if (!user) throw new Error("Unauthorized");
//         if (!themeId) throw new Error("Missing Theme");

//         const userId = user.id;

//         const project = await prisma.project.update({
//             where: { id, userId },
//             data: { theme: themeId },
//         });

//         return NextResponse.json({ success: true, project });
//     } catch (error) {
//         console.log("Error occured ", error);
//         return NextResponse.json(
//             { error: "Failed to update project" },
//             { status: 500 }
//         );
//     }
// }

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { themeId } = await request.json();
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");
        if (!themeId) throw new Error("Missing Theme");

        // Kiểm tra quyền — check cả userId lẫn email
        const project = await prisma.project.findFirst({
            where: {
                id,
                OR: [
                    { userId: user.id }, // owner
                    {
                        members: {
                            some: {
                                OR: [
                                    { userId: user.id },
                                    { email: user.email as string },
                                ],
                                role: "editor",
                            }
                        }
                    }
                ]
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: "Không có quyền cập nhật" },
                { status: 403 }
            );
        }

        const updated = await prisma.project.update({
            where: { id },
            data: { theme: themeId },
        });

        return NextResponse.json({ success: true, project: updated });
    } catch (error) {
        console.log("Error occured ", error);
        return NextResponse.json(
            { error: "Failed to update project" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name } = await request.json();
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");
        if (!name) throw new Error("Missing name");

        const project = await prisma.project.update({
            where: { id, userId: user.id },
            data: { name },
        });

        return NextResponse.json({ success: true, data: project });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to rename project" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");

        await prisma.frame.deleteMany({ where: { projectId: id } });
        await prisma.project.delete({ where: { id, userId: user.id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Failed to delete project" },
            { status: 500 }
        );
    }
}