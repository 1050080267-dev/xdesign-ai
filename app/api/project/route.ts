import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateProjectName } from "@/app/action/action";
import { inngest } from "@/inngest/client";

// export async function GET(request: Request) {
//   try {
//     const session = await getKindeServerSession();
//     const user = await session.getUser();
//     if (!user) throw new Error("Unauthorized");

//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get("search") || "";


//     const projects = await prisma.project.findMany({
//     where: {
//         OR: [
//             { userId: user.id },
//             {
//                 members: {
//                     some: {
//                         OR: [
//                             { email: user.email as string },
//                             { userId: user.id },
//                         ]
//                     }
//                 }
//             }
//         ]
//     },
//     orderBy: { createdAt: "desc" },
// });

//     return NextResponse.json({ success: true, data: projects });
//   } catch (error) {
//     console.log("Error occured ", error);
//     return NextResponse.json(
//       { error: "Failed to fetch project" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: Request) {
    try {
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        const projects = await prisma.project.findMany({
            where: {
                AND: [
                    ...(search
                        ? [
                              {
                                  name: {
                                      contains: search,
                                      mode: "insensitive" as const,
                                  },
                              },
                          ]
                        : []),

                    {
                        OR: [
                            {
                                userId: user.id, // project mình tạo
                            },
                            {
                                members: {
                                    some: {
                                        userId: user.id, // project được share
                                    },
                                },
                            },
                        ],
                    },
                ],
            },

            include: {
                members: {
                    where: {
                        userId: user.id,
                    },
                    select: {
                        role: true,
                    },
                },
            },

            orderBy: {
                updatedAt: "desc",
            },
        });

        // 👇 thêm role cho frontend biết
        const formattedProjects = projects.map((project) => ({
            ...project,
            currentUserRole:
                project.userId === user.id
                    ? "owner"
                    : project.members?.[0]?.role || "viewer",
        }));

        return NextResponse.json({
            success: true,
            data: formattedProjects,
        });
    } catch (error) {
        console.log("Error occured ", error);

        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json()
        const session = await getKindeServerSession();
        const user = await session.getUser();

        if (!user) throw new Error("Unauthorized");
        if (!prompt) throw new Error("Missing Prompt");

        const userId = user.id

        const projectName = await generateProjectName(prompt)

        const project = await prisma.project.create({
            data: {
                userId,
                name: projectName,
            }
        });

        //Trigger the Inngest
        try {
            await inngest.send({
                name: "ui/generate.screens",
                data: {
                    userId,
                    projectId: project.id,
                    prompt,

                },
            });
        } catch (error) {
            console.log(error);
        }
        return NextResponse.json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.log("Error occured ", error)
        return NextResponse.json({
            error: "Failed to create project"
        },
            { status: 500 }
        );
    }
}