"use client"

import { useCanvas } from "@/context/canvas-context";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CameraIcon, ChevronDown, Palette, Save, UserPlus, Wand2, X, Crown, Eye, Pencil, Trash2 } from "lucide-react";
import PromptInput from "../prompt-input";
import { useState } from "react";
import { parseThemeColors } from "@/lib/themes";
import { cn } from "@/lib/utils";
import ThemeSelector from "./theme-selector";
import { Separator } from "../ui/separator";
import { useGenerateDesignById, useUpdateProject } from "@/features/use-project-id";
import { Spinner } from "../ui/spinner";
import { useGetMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from "@/features/use-project";
import { Input } from "../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

const CanvasFloatingToolbar = ({
    projectId,
    isScreenshotting,
    onScreenshot,
    isOwner = true,
}: {
    projectId: string;
    isScreenshotting: boolean;
    onScreenshot: () => void;
    isOwner?: boolean;
}) => {
    const { themes, theme: currentTheme, setTheme } = useCanvas();
    const [promptText, setPromptText] = useState<string>("");
    const [inviteOpen, setInviteOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");

    const { mutate, isPending } = useGenerateDesignById(projectId);
    const update = useUpdateProject(projectId);

    // Collaboration hooks
    const { data: members = [], isLoading: membersLoading } = useGetMembers(projectId);
    const { mutate: inviteMember, isPending: isInviting } = useInviteMember(projectId);
    const { mutate: removeMember } = useRemoveMember(projectId);
    const { mutate: updateRole } = useUpdateMemberRole(projectId);

    const handleAIGenerate = () => {
        if (!promptText) return;
        mutate(promptText);
    };

    const handleUpdate = () => {
        if (!currentTheme) return;
        update.mutate(currentTheme.id);
    };

    const handleInvite = () => {
        if (!email.trim()) return;
        inviteMember(
            { email: email.trim(), role },
            {
                onSuccess: () => {
                    setEmail("");
                    setRole("viewer");
                },
            }
        );
    };

    return (
        <>
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
                <div className="w-full max-w-2xl bg-background dark:bg-gray-950 rounded-full shadow-xl border">
                    <div className="flex flex-row items-center gap-2 px-3">

                        {/* AI Generate */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    size="icon-sm"
                                    className="px-4 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointer"
                                >
                                    <Wand2 className="size-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-2! rounded-xl! shadow-lg mt-1">
                                <PromptInput
                                    promptText={promptText}
                                    setPromptText={setPromptText}
                                    className="min-h-[150px] ring-1! ring-purple-500! rounded-xl! shadow-none border-muted"
                                    hideSubmitBtn={true}
                                />
                                <Button
                                    disabled={isPending}
                                    className="mt-2 w-full bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointer"
                                    onClick={handleAIGenerate}
                                >
                                    {isPending ? <Spinner /> : <>Thiết kế</>}
                                </Button>
                            </PopoverContent>
                        </Popover>

                        {/* Theme */}
                        <Popover>
                            <PopoverTrigger>
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <Palette className="size-4" />
                                    <div className="flex gap-1.5">
                                        {themes?.slice(0, 4)?.map((theme, index) => {
                                            const color = parseThemeColors(theme.style);
                                            return (
                                                <div
                                                    role="button"
                                                    key={index}
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        setTheme(theme.id);          // Đổi local ngay
                                                        update.mutate(theme.id);     // Lưu DB luôn không cần Save
                                                    }}
                                                    className={cn(
                                                        `w-6.5 h-6.5 rounded-full cursor-pointer`,
                                                        currentTheme?.id === theme.id && "ring-1 ring-offset-1"
                                                    )}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${color?.primary}, ${color?.accent})`
                                                    }}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-1 text-sm">
                                        +{themes?.length - 4} more
                                        <ChevronDown className="size-4" />
                                    </div>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="px-2 rounded-xl shadow border">
                                <ThemeSelector />
                            </PopoverContent>
                        </Popover>

                        <Separator orientation="vertical" className="h-4!" />

                        <div className="flex items-center gap-2">
                            {/* Screenshot */}
                            <Button
                                variant="outline"
                                size="icon-sm"
                                className="rounded-full cursor-pointer"
                                disabled={isScreenshotting}
                                onClick={onScreenshot}
                            >
                                {isScreenshotting ? <Spinner /> : <CameraIcon className="size-4.5" />}
                            </Button>

                            {/* Invite Members */}
                            {isOwner && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full cursor-pointer gap-1.5"
                                    onClick={() => setInviteOpen(true)}
                                >
                                    <UserPlus className="size-4" />
                                    <span>Mời</span>
                                    {members.length > 0 && (
                                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                                            {members.length}
                                        </span>
                                    )}
                                </Button>
                            )}

                            {/* Save */}
                            <Button
                                variant="default"
                                size="sm"
                                className="rounded-full cursor-pointer"
                                onClick={handleUpdate}
                            >
                                {update.isPending ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        <Save className="size-4" />
                                        Lưu
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog Invite Members */}
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="size-5" />
                            Mời thành viên
                        </DialogTitle>
                    </DialogHeader>

                    {/* Form invite */}
                    <div className="flex gap-2 mt-2">
                        <Input
                            placeholder="Nhập email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                            className="flex-1"
                        />
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="w-28">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="editor">
                                    <span className="flex items-center gap-1.5">
                                        <Pencil className="size-3" /> Sửa
                                    </span>
                                </SelectItem>
                                <SelectItem value="viewer">
                                    <span className="flex items-center gap-1.5">
                                        <Eye className="size-3" /> Xem
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleInvite}
                            disabled={isInviting || !email.trim()}
                            className="shrink-0"
                        >
                            {isInviting ? <Spinner /> : "Mời"}
                        </Button>
                    </div>

                    {/* Danh sách thành viên */}
                    <div className="mt-4 space-y-1">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                            Thành viên ({members.length})
                        </p>

                        {membersLoading ? (
                            <div className="flex justify-center py-4">
                                <Spinner />
                            </div>
                        ) : members.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có thành viên nào
                            </p>
                        ) : (
                            members.map((member: any) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted gap-2"
                                >
                                    {/* Avatar + Info */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
                                            {member.email[0].toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{member.email}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Select
                                            value={member.role}
                                            onValueChange={(newRole) =>
                                                updateRole({ memberId: member.id, role: newRole })
                                            }
                                        >
                                            <SelectTrigger className="h-7 w-24 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="editor">Sửa</SelectItem>
                                                <SelectItem value="viewer">Xem</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => removeMember(member.id)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CanvasFloatingToolbar;