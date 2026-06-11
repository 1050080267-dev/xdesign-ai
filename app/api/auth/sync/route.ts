import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST() {
    try {
        const session = await getKindeServerSession();
        const user = await session.getUser();
        if (!user) throw new Error("Unauthorized");

        // Log ra xem user info từ Kinde
        console.log("Sync user:", {
            id: user.id,
            email: user.email,
            name: `${user.given_name} ${user.family_name}`
        });

        // Log xem có bản ghi nào match không
        const existing = await prisma.projectMember.findMany({
            where: { email: user.email as string }
        });
        console.log("Found members:", existing);

        await prisma.projectMember.updateMany({
            where: {
                email: user.email as string,
                userId: "",
            },
            data: {
                userId: user.id,
                name: `${user.given_name || ""} ${user.family_name || ""}`.trim(),
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to sync" }, { status: 500 });
    }
}