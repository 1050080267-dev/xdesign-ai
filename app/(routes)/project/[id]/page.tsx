"use client"

import { useGetProjectById } from "@/features/use-project-id";
import { useParams, useRouter } from "next/navigation";
import Header from "./_common/header";
import Canvas from "@/components/canvas";
import { CanvasProvider, useCanvas } from "@/context/canvas-context";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

// Component watch theme thay đổi từ server → cập nhật vào context
const ThemeWatcher = ({ themeId }: { themeId: string }) => {
    const { setTheme } = useCanvas();
    const prevThemeIdRef = useRef<string>("");

    useEffect(() => {
        if (themeId && themeId !== prevThemeIdRef.current) {
            prevThemeIdRef.current = themeId;
            setTheme(themeId);
        }
    }, [themeId, setTheme]);

    return null;
};

const Page = () => {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: project, isPending, isError } = useGetProjectById(id);
    const { user, isLoading: isAuthPending } = useKindeAuth();

    const hasShownToast = useRef(false);

    const frames = project?.frames || [];
    const themeId = project?.theme || "";
    const hasInitialData = frames.length > 0;

    // Xác định quyền chỉnh sửa
    const canEdit =
        project?.currentUserRole === "owner" ||
        project?.currentUserRole === "editor";

    // 🔥 FIX: Nếu project bị mất quyền share thì tự redirect
    useEffect(() => {
        if (
            !isPending &&
            !isAuthPending &&
            isError &&
            !hasShownToast.current
        ) {
            hasShownToast.current = true;

            toast.error("Chủ dự án đã thu hồi quyền truy cập");

            setTimeout(() => {
                router.push("/");
            }, 1500);
        }
    }, [isPending, isAuthPending, isError, router]);

    if (isPending || isAuthPending) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                Loading project...
            </div>
        );
    }

    if (!user?.id) {
        return <div>Unauthorized - Vui lòng đăng nhập lại</div>;
    }

    // 🔥 FIX: tránh hiện Project not found
    if (!project) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                Đang kiểm tra quyền truy cập...
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full flex flex-col">
            <Header projectName={project?.name} />

            <CanvasProvider
                initialFrames={frames}
                initialThemeId={themeId}
                hasInitialData={hasInitialData}
                projectId={project?.id}
                userId={user.id}
            >
                {/* Watch theme thay đổi từ server */}
                <ThemeWatcher themeId={project?.theme || ""} />

                <div className="flex flex-1 overflow-hidden">
                    <div className="relative flex-1">
                        <Canvas
                            projectId={project?.id}
                            projectName={project?.name}
                            isPending={isPending}
                            canEdit={canEdit}
                        />
                    </div>
                </div>
            </CanvasProvider>
        </div>
    );
};

export default Page;