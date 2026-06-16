"use client"
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import PromptInput from "@/components/prompt-input";
import React, { memo, useState } from "react";
import Header from "./header";
import { useCreateProject, useDeleteProject, useRenameProject, useSearchProjects } from "@/features/use-project";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Spinner } from "@/components/ui/spinner";
import { ProjectType } from "@/types/project";
import { useRouter } from "next/dist/client/components/navigation";
import { formatDistanceToNow } from "date-fns";
import { FolderOpenDotIcon, MoreVertical, Pencil, Search, Trash2, Users } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LandingSection = () => {
    const { user } = useKindeBrowserClient();
    const [promptText, setPromptText] = useState<string>("");
    const [search, setSearch] = useState<string>("");
    const userId = user?.id;


    const {
        data: projects,
        isLoading,
        isError,
    } = useSearchProjects(userId, search);
    const { mutate, isPending } = useCreateProject();

    const suggestions = [
        {
            label: "Quản lý tài chính",
            icon: "💸",
            value: 'Hãy tạo giao diện ứng dụng di động quản lý chi tiêu cá nhân, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
        {
            label: "Ứng dụng Chat App",
            icon: "💬",
            value: 'Hãy tạo giao diện ứng dụng di động Chat App hiện đại, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
        {
            label: "Quản lý công việc",
            icon: "✅",
            value: 'Hãy tạo giao diện ứng dụng di động quản lý công việc, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
        {
            label: "Ứng dụng đặt đồ ăn",
            icon: "🍔",
            value: 'Hãy tạo giao diện ứng dụng di động đặt đồ ăn, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
        {
            label: "Ứng dụng ghi chú",
            icon: "📝",
            value: 'Tạo giao diện ứng dụng di động ghi chú, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
        {
            label: "Ứng dụng xem thời tiết",
            icon: "☀️",
            value: 'Hãy tạo giao diện ứng dụng di động xem thời tiết, bao gồm 2 giao diện: giao diện trang đăng nhập và giao diện trang chủ.',
        },
    ];

    const handleSuggestionClick = (val: string) => {
        setPromptText(val);
    };

    const handleSubmit = () => {
        if (!promptText) return;
        mutate(promptText);
    };

    return (
        <div className="w-full min-h-screen">
            {isPending && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="size-8 rounded-full border-4 border-primary/10 border-t-primary/60 animate-spin [animation-direction:reverse]" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <p className="text-lg font-semibold text-foreground">Đang tạo giao diện...</p>
                            <p className="text-sm text-muted-foreground">AI đang xử lý yêu cầu của bạn</p>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex flex-col">
                <Header />
                <div className="relative overflow-hidden pt-28">
                    <div className="max-w-6xl mx-auto flex flex-col items-center justify-center">
                        <div className="space-y-3">
                            <h1 className="text-center font-semibold text-4xl tracking-tight sm:text-5xl">
                                Thiết kế ứng dụng di động <br className="md:hidden" />
                                <span className="text-primary">chỉ trong vài phút.</span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-center font-medium text-foreground leading-relaxed sm:text-lg">
                                Biến ý tưởng thành giao diện ứng dụng tuyệt đẹp trong vài phút chỉ bằng cách chat với AI.
                            </p>
                        </div>
                        <div className="flex w-full max-w-3xl flex-col item-center gap-8 relative z-50">
                            <div className="w-full">
                                <PromptInput
                                    className="ring-2 ring-primary"
                                    promptText={promptText}
                                    setPromptText={setPromptText}
                                    isLoading={isPending}
                                    onSubmit={handleSubmit}
                                />
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 px-5">
                                <Suggestions>
                                    {suggestions.map((s) => (
                                        <Suggestion
                                            key={s.label}
                                            suggestion={s.label}
                                            className="text-xs! h-7! px-2.5 pt-1!"
                                            onClick={() => handleSuggestionClick(s.value)}
                                        >
                                            {s.icon}
                                            <span>{s.label}</span>
                                        </Suggestion>
                                    ))}
                                </Suggestions>
                            </div>
                        </div>

                        <div className="absolute -translate-x-1/2 left-1/2 w-[5000px] h-[3000px] top-[80%] -z-10">
                            <div className="-translate-x-1/2 absolute bottom-[calc(100%-300px)] left-1/2 h-[2000px] w-[2000px] opacity-20 bg-radial-primary"></div>
                            <div className="absolute -mt-2.5 size-full rounded-[50%] bg-primary/20 opacity-70 [box-shadow:0_-15px_24.8px_var(--primary)]"></div>
                            <div className="absolute z-0 size-full rounded-[50%] bg-background"></div>
                        </div>
                    </div>
                </div>

                {/* PHẦN DỰ ÁN */}
                <div className="w-full py-10">
                    <div className="mx-auto max-w-3xl">
                        {userId && (
                            <div>
                                {/* Header + Search */}
                                <div className="flex items-center justify-between mb-3 gap-3">
                                    <h1 className="font-medium text-xl tracking-tight shrink-0">
                                        Dự án gần đây
                                    </h1>
                                    {/* Search box */}
                                    <div className="relative w-full max-w-xs">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Tìm kiếm dự án..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                {isLoading ? (
                                    <div className="flex items-center justify-center py-2">
                                        <Spinner className="size-10" />
                                    </div>
                                ) : projects?.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-6">
                                        {search ? `Không tìm thấy dự án "${search}"` : "Chưa có dự án nào"}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                                        {projects?.map((project: ProjectType) => (
                                            <ProjectCard key={project.id} project={project} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {isError && <p className="text-red-500">Failed to load projects</p>}
                    </div>
                </div>
            </div>
        </div>

    );
};

// ===== PROJECT CARD =====
const ProjectCard = memo(({ project }: { project: ProjectType }) => {
    const router = useRouter();
    const [renameOpen, setRenameOpen] = useState(false);
    const [newName, setNewName] = useState(project.name);

    const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject();
    const { mutate: renameProject, isPending: isRenaming } = useRenameProject();

    const createdAtDate = new Date(project.createdAt);
    const timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
    const thumbnail = project.thumbnail || null;

    const onRoute = () => router.push(`/project/${project.id}`);

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Xóa dự án "${project.name}"?`)) {
            deleteProject(project.id);
        }
    };

    const handleRenameOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewName(project.name);
        setRenameOpen(true);
    };

    const handleRenameSubmit = () => {
        if (!newName.trim()) return;
        renameProject({ id: project.id, name: newName.trim() });
        setRenameOpen(false);
    };

    return (
        <>
            <div
                role="button"
                className="w-full flex flex-col border rounded-xl cursor-pointer hover:shadow-md overflow-hidden relative group"
                onClick={onRoute}
            >
                {/* Thumbnail */}
                <div className="h-40 bg-[#eee] relative overflow-hidden flex items-center justify-center">
                    {thumbnail ? (
                        <img src={thumbnail} className="w-full h-full object-cover object-left scale-110" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            {project.currentUserRole !== "owner" ? (
                                <Users className="size-7" />
                            ) : (
                                <FolderOpenDotIcon className="size-7" />
                            )}
                        </div>
                    )}
                </div>

                {/* Info + Menu */}
                <div className="p-4 flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-sm truncate w-full mb-1">{project.name}</h3>
                        <p className="text-xs text-muted-foreground">{timeAgo}</p>
                    </div>

                    {/* 3-dot menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <button className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <MoreVertical className="size-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={handleRenameOpen}>
                                <Pencil className="size-4 mr-2" />
                                Đổi tên
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-red-500 focus:text-red-500"
                            >
                                <Trash2 className="size-4 mr-2" />
                                {isDeleting ? "Đang xóa..." : "Xóa dự án"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Dialog đổi tên */}
            <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle>Đổi tên dự án</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
                        placeholder="Nhập tên mới..."
                        autoFocus
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleRenameSubmit} disabled={isRenaming}>
                            {isRenaming ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
});

ProjectCard.displayName = "ProjectCard";

export default LandingSection;