"use client"

import { cn } from "@/lib/utils";
import { ClipboardListIcon, CodeIcon, DownloadIcon, FileCode2, GripVertical, PencilIcon, SaveIcon, Trash2Icon, XIcon } from "lucide-react";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type PropsType = {
  title: string;
  isSelected: boolean;
  disabled: boolean;
  isDownloading: boolean;
  isEditing?: boolean;
  isSaving?: boolean;
  scale?: number;
  isExportingSvg?: boolean;
  canEdit?: boolean;
  onOpenHtmlDialog: () => void;
  onDownloadPng: () => void;
  onStartEdit?: () => void;
  onSaveEdit?: () => void;
  onCancelEdit?: () => void;
  onExportSvg?: () => void;
  onExportFlutter?: () => void;
  isExportingFlutter?: boolean;
  onDeleteFrame?: () => void;
  isDeleting?: boolean;
  onToggleLog?: () => void;
  showLog?: boolean;
};

const DeviceFrameToolbar = ({
  title,
  isSelected,
  disabled,
  scale = 1.7,
  isDownloading,
  isEditing = false,
  isSaving = false,
  isExportingSvg = false,
  canEdit = true,
  onOpenHtmlDialog,
  onDownloadPng,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onExportSvg,
  onExportFlutter,
  isExportingFlutter,
  onDeleteFrame,
  isDeleting = false,
  onToggleLog,
  showLog = false,
}: PropsType) => {
  return (
    <div
      className={cn(
        `absolute flex items-center gap-2 rounded-full z-50`,
        isSelected
          ? `left-1/2 -translate-x-1/2 border bg-card
             dark:bg-muted pl-2 pr-4 py-1 shadow-sm
             min-w-[260px] h-[35px]`
          : "w-[150px] h-auto left-10"
      )}
      style={{
        top: isSelected ? "-70px" : "-38px",
        transformOrigin: "center top",
        transform: `scale(${scale})`,
      }}
    >
      {/* Title */}
      <div
        role="button"
        className="flex cursor-grab items-center justify-start gap-1.5 active:cursor-grabbing"
      >
        <GripVertical className="size-4 text-muted-foreground" />
        <div className={cn(
          `min-w-20 font-medium text-sm mx-px truncate`,
          isSelected && "w-[100px]"
        )}>
          {title}
        </div>
      </div>

      {isSelected && (
        <>
          <Separator orientation="vertical" className="h-5! bg-border" />

          {/* Chế độ xem thường */}
          {!isEditing && (
            <div className="flex items-center gap-px">

              {/* Nút Edit */}
              <Button
                disabled={disabled || !canEdit}
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer",
                  !canEdit && "opacity-40 cursor-not-allowed"
                )}
                onClick={canEdit ? onStartEdit : undefined}
                title={canEdit ? "Chỉnh sửa giao diện" : "Bạn không có quyền chỉnh sửa"}
              >
                <PencilIcon />
              </Button>

              {/* Nút Xem HTML */}
              <Button
                disabled={disabled}
                size="icon-sm"
                variant="ghost"
                className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
                onClick={onOpenHtmlDialog}
              >
                <CodeIcon />
              </Button>

              {/* Nút Download PNG */}
              <Button
                disabled={disabled || isDownloading}
                size="icon-sm"
                variant="ghost"
                className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
                onClick={onDownloadPng}
              >
                {isDownloading ? <Spinner /> : <DownloadIcon />}
              </Button>

              {/* Nút Export SVG */}
              <Button
                disabled={disabled || isExportingSvg}
                size="icon-sm"
                variant="ghost"
                className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
                onClick={onExportSvg}
                title="Xuất SVG"
              >
                {isExportingSvg ? <Spinner /> : <FileCode2 />}
              </Button>

              {/* Nút Export Flutter */}
              <Button
                disabled={disabled || isExportingFlutter}
                size="icon-sm"
                variant="ghost"
                className="rounded-full dark:hover:bg-white/20 hover:bg-muted cursor-pointer"
                onClick={onExportFlutter}
                title="Xuất Flutter code"
              >
                {isExportingFlutter ? <Spinner /> : (
                  <svg viewBox="0 0 24 24" className="size-4 fill-current">
                    <path d="M14.314 0L2.3 12 6 15.7 21.684 0h-7.37zm.014 11.072L7.857 17.53l6.47 6.47H21.7l-6.46-6.468 6.46-6.46h-7.37z" />
                  </svg>
                )}
              </Button>

              {/* Nút Xóa Frame */}
              <Button
                disabled={disabled || isDeleting}
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={onDeleteFrame}
                title="Xóa giao diện"
              >
                {isDeleting ? <Spinner /> : <Trash2Icon className="size-4" />}
              </Button>

              {/* Nút Lịch sử chỉnh sửa */}
              <Button
                size="icon-sm"
                variant="ghost"
                className={cn(
                  "rounded-full cursor-pointer",
                  showLog && "bg-muted text-primary"
                )}
                onClick={onToggleLog}
                title="Lịch sử chỉnh sửa"
              >
                <ClipboardListIcon className="size-4" />
              </Button>
            </div>
          )}

          {/* Chế độ đang edit */}
          {isEditing && (
            <div className="flex items-center gap-px">
              <Button
                disabled={isSaving}
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-green-500 hover:text-green-600 hover:bg-green-50 cursor-pointer"
                onClick={onSaveEdit}
                title="Lưu thay đổi"
              >
                {isSaving ? <Spinner /> : <SaveIcon />}
              </Button>

              <Button
                disabled={isSaving}
                size="icon-sm"
                variant="ghost"
                className="rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                onClick={onCancelEdit}
                title="Hủy chỉnh sửa"
              >
                <XIcon />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeviceFrameToolbar;