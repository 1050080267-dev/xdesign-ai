"use client"
import { useGetEditLogs } from "@/features/use-project";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { ClipboardListIcon, ImageIcon, MapPinIcon, SmileIcon, TypeIcon } from "lucide-react";
import { Spinner } from "../ui/spinner";

type PropsType = {
    frameId: string;
    isOpen: boolean;
    onHighlight?: (selector: string) => void;
};

const actionConfig = {
    text: { icon: <TypeIcon className="size-3.5" />, label: "Sửa chữ", color: "text-blue-500 bg-blue-50" },
    image: { icon: <ImageIcon className="size-3.5" />, label: "Đổi ảnh", color: "text-yellow-500 bg-yellow-50" },
    icon: { icon: <SmileIcon className="size-3.5" />, label: "Đổi icon", color: "text-green-500 bg-green-50" },
};

const EditLogPanel = ({ frameId, isOpen, onHighlight }: PropsType) => {
    const { data: logs, isLoading } = useGetEditLogs(frameId);

    if (!isOpen) return null;

    return (
        <div className="absolute right-0 top-10 z-50 w-72 bg-background border rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b bg-muted/50">
                <ClipboardListIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Lịch sử chỉnh sửa</span>
                {logs?.length > 0 && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                        {logs.length}
                    </span>
                )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
                {isLoading ? (
                    <div className="flex justify-center py-6">
                        <Spinner />
                    </div>
                ) : !logs || logs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        Chưa có chỉnh sửa nào
                    </p>
                ) : (
                    <div className="divide-y">
                        {logs.map((log: any) => {
                            const config = actionConfig[log.action as keyof typeof actionConfig];
                            const hasSelector = !!log.selector;

                            return (
                                <div
                                    key={log.id}
                                    className={`px-3 py-2.5 hover:bg-muted/50 transition-colors ${hasSelector ? "cursor-pointer" : ""}`}
                                    onClick={() => {
                                        if (hasSelector && onHighlight) {
                                            onHighlight(log.selector);
                                        }
                                    }}
                                    title={hasSelector ? "Click để xem vị trí trên giao diện" : ""}
                                >
                                    {/* Action badge + thời gian */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <span className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config?.color}`}>
                                            {config?.icon}
                                            {config?.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground ml-auto">
                                            {formatDistanceToNow(new Date(log.createdAt), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                    </div>

                                    {/* Element */}
                                    <p className="text-xs font-medium truncate">{log.element}</p>

                                    {/* Old → New */}
                                    {log.oldValue && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[10px] text-red-400 line-through truncate max-w-[80px]">
                                                {log.oldValue}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">→</span>
                                            <span className="text-[10px] text-green-500 truncate max-w-[80px]">
                                                {log.newValue}
                                            </span>
                                        </div>
                                    )}

                                    {/* User */}
                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                        bởi {log.userName}
                                    </p>

                                    {/* Hint xem vị trí */}
                                    {hasSelector && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <MapPinIcon className="size-3 text-blue-400" />
                                            <span className="text-[10px] text-blue-400">
                                                Click để xem vị trí
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditLogPanel;