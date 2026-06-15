"use client"
import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import axios from "axios";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import { useCanvas } from "@/context/canvas-context";
import { getHTMLWrapper } from "@/lib/frame-wrapper";
import { cn } from "@/lib/utils";
import DeviceFrameToolbar from "./device-frame-toolbar";
import { toast } from "sonner";
import DeviceFrameSkeleton from "./device-frame-skeleton";
import { useAddEditLog, useDeleteFrame, useExportFlutter, useUpdateFrame } from "@/features/use-project";
import IconPicker from "./icon-picker";
import { MaterialIcon } from "@/lib/material-icons";
import EditLogPanel from "./edit-log-panel";

type PropsType = {
  html: string;
  title?: string;
  width?: number;
  minHeight?: number | string;
  initialPosition?: { x: number; y: number };
  frameId: string;
  projectId: string;
  scale?: number;
  toolMode: ToolModeType;
  theme_style?: string;
  isLoading?: boolean;
  onOpenHtmlDialog: () => void;
  canEdit?: boolean;
};

const DeviceFrame = ({
  html,
  title = "Untitled",
  width = 420,
  minHeight = 800,
  initialPosition = { x: 0, y: 0 },
  frameId,
  projectId,
  scale = 1,
  toolMode,
  theme_style,
  isLoading = false,
  onOpenHtmlDialog,
  canEdit = true,
}: PropsType) => {
  const { selectedFrameId, setSelectedFrameId } = useCanvas();
  const [frameSize, setFrameSize] = useState({ width, height: minHeight });
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExportingSvg, setIsExportingSvg] = useState(false);
  const [isExportingFlutter, setIsExportingFlutter] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [showLog, setShowLog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateFrame, isPending: isSaving } = useUpdateFrame();
  const { mutate: exportFlutter } = useExportFlutter();
  const { mutate: deleteFrame, isPending: isDeleting } = useDeleteFrame();
  const { mutate: addEditLog } = useAddEditLog(frameId);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedIconElRef = useRef<HTMLElement | null>(null);
  const isSelected = selectedFrameId === frameId;
  const fullHtml = getHTMLWrapper(html, title, theme_style, frameId);

  useEffect(() => {
    if (!isSelected) {
      handleCancelEdit();
      setShowLog(false);
    }
  }, [isSelected]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "FRAME_HEIGHT" && event.data.frameId === frameId) {
        setFrameSize((prev) => ({ ...prev, height: event.data.height }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [frameId]);

  // 👇 Fix: chỉ xử lý event đúng frameId
  useEffect(() => {
    const handleOpenIconPicker = (e: Event) => {
      const custom = e as CustomEvent;

      // Chỉ xử lý nếu đúng frame này
      if (custom.detail.frameId !== frameId) return;

      selectedIconElRef.current = custom.detail.iconEl;
      setIconPickerOpen(true);
    };
    window.addEventListener("open-icon-picker", handleOpenIconPicker);
    return () => window.removeEventListener("open-icon-picker", handleOpenIconPicker);
  }, [frameId]);


  const getElementSelector = useCallback((el: HTMLElement): string => {
    let editId = el.getAttribute("data-edit-id");

    // chưa có thì tạo unique id
    if (!editId) {
      editId =
        "edit-" +
        Date.now() +
        "-" +
        Math.random().toString(36).substring(2, 9);

      el.setAttribute("data-edit-id", editId);
    }

    return `[data-edit-id="${editId}"]`;
  }, []);

  const handleHighlightElement = useCallback((selector: string) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    doc.querySelectorAll<HTMLElement>("[data-highlighted]").forEach(el => {
      el.style.outline = "";
      el.style.boxShadow = "";
      el.removeAttribute("data-highlighted");
    });

    const el =
      doc.querySelector<HTMLElement>(selector) ||
      doc.body.querySelector<HTMLElement>(selector);
    if (!el) {
      toast.error("Không tìm thấy vị trí!");
      return;
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.setAttribute("data-highlighted", "true");
    el.style.outline = "3px solid #3b82f6";
    el.style.boxShadow = "0 0 0 6px rgba(59,130,246,0.3)";

    setTimeout(() => {
      el.style.outline = "";
      el.style.boxShadow = "";
      el.removeAttribute("data-highlighted");
    }, 3000);

    toast.info("Đang highlight vị trí đã sửa!");
  }, []);

  const handleDeleteFrame = useCallback(() => {
    if (!confirm(`Xóa giao diện "${title}"?`)) return;
    deleteFrame(frameId);
  }, [frameId, title, deleteFrame]);

  const handleSelectIcon = useCallback((icon: MaterialIcon) => {
    const iconEl = selectedIconElRef.current;
    if (!iconEl) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;
    const doc = iframe.contentDocument;

    if (!doc.querySelector('link[href*="Material+Icons"]')) {
      const fontLink = doc.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
      doc.head.appendChild(fontLink);
    }

    const oldIconName = iconEl.getAttribute("icon") || iconEl.textContent || "";

    const span = doc.createElement("span");
    span.className = "material-icons";
    span.style.cssText = `
      font-family: 'Material Icons';
      font-size: ${iconEl.getAttribute("width") || "24"}px;
      outline: 2px dashed #10b981;
      cursor: pointer;
      display: inline-block;
      font-style: normal;
      font-weight: normal;
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-feature-settings: 'liga';
      -webkit-font-smoothing: antialiased;
    `;
    span.setAttribute("data-flutter-icon", icon.flutter);
    span.textContent = icon.name;

    span.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      span.style.outline = "3px solid #10b981";
      span.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.3)";
      selectedIconElRef.current = span;
      // 👇 thêm frameId vào event
      const event = new CustomEvent("open-icon-picker", {
        detail: { iconEl: span, frameId }
      });
      window.dispatchEvent(event);
    };

    if (iconEl.parentNode) {
      iconEl.parentNode.insertBefore(span, iconEl);
      iconEl.parentNode.removeChild(iconEl);
    }

    selectedIconElRef.current = span;

    addEditLog({
      projectId,
      action: "icon",
      element: `Icon "${oldIconName}"`,
      selector: getElementSelector(span),
      oldValue: oldIconName,
      newValue: icon.label,
    });

    toast.success(`Đã đổi thành icon ${icon.label}!`);
  }, [addEditLog, projectId, getElementSelector, frameId]);

  const handleStartEdit = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    iframe.style.pointerEvents = "auto";

    if (!doc.querySelector('link[href*="Material+Icons"]')) {
      const fontLink = doc.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
      doc.head.appendChild(fontLink);
    }

    doc.body.querySelectorAll<HTMLElement>("*").forEach((el) => {
      const tag = el.tagName;
      const isMaterialIcon = el.classList.contains("material-icons");
      if (tag !== "IMG" && tag !== "ICONIFY-ICON" && tag !== "SVG" && tag !== "PATH" && !isMaterialIcon) {
        el.contentEditable = "true";
        el.style.outline = "1px dashed #6366f1";
        el.style.outlineOffset = "2px";
        el.setAttribute("data-original-text", el.textContent || "");
      }
    });

    doc.body.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      img.style.outline = "2px dashed #f59e0b";
      img.style.cursor = "pointer";
      img.contentEditable = "false";

      img.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        img.style.outline = "5px solid #ef4444";
        img.style.boxShadow = "0 0 0 6px rgba(239,68,68,0.3)";

        const oldSrc = img.src;
        const input = doc.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;

          try {
            toast.info("Đang upload ảnh...");

            const formData = new FormData();
            formData.append("file", file);

            // preset cloudinary
            formData.append(
              "upload_preset",
              "xdesign_upload"
            );

            const res = await fetch(
              "https://api.cloudinary.com/v1_1/dkawfcwsn/image/upload",
              {
                method: "POST",
                body: formData,
              }
            );

            const data = await res.json();

            if (!data.secure_url) {
              throw new Error("Upload failed");
            }

            // đổi ảnh sang URL cloudinary
            img.src = data.secure_url;

            img.style.outline = "2px dashed #f59e0b";
            img.style.boxShadow = "";

            addEditLog({
              projectId,
              action: "image",
              element: `Ảnh "${img.alt || "không tên"}"`,
              selector: getElementSelector(img),
              oldValue: oldSrc.substring(0, 50) + "...",
              newValue: file.name,
            });

            toast.success("Đã đổi ảnh!");
          } catch (error) {
            console.error(error);
            toast.error("Upload ảnh thất bại!");
          }
        };

        input.oncancel = () => {
          img.style.outline = "2px dashed #f59e0b";
          img.style.boxShadow = "";
        };
        input.click();
      };
    });

    // 👇 Fix: thêm frameId vào CustomEvent
    const attachIconClick = (icon: HTMLElement) => {
      icon.style.outline = "2px dashed #10b981";
      icon.style.cursor = "pointer";
      icon.contentEditable = "false";

      icon.onclick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        icon.style.outline = "3px solid #10b981";
        icon.style.boxShadow = "0 0 0 4px rgba(16,185,129,0.3)";
        const event = new CustomEvent("open-icon-picker", {
          detail: { iconEl: icon, frameId }  // 👈 thêm frameId
        });
        window.dispatchEvent(event);
      };
    };

    doc.body.querySelectorAll<HTMLElement>("iconify-icon").forEach(attachIconClick);
    doc.body.querySelectorAll<HTMLElement>("span.material-icons").forEach(attachIconClick);

    setIsEditing(true);
    toast.info("Click text để sửa — Click ảnh 🟡 để đổi ảnh — Click icon 🟢 để đổi icon");
  }, [addEditLog, projectId, getElementSelector, frameId]);

  const handleCancelEdit = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.style.pointerEvents = "none";
    iframe.srcdoc = fullHtml;
    setIsEditing(false);
    setIconPickerOpen(false);
  }, [fullHtml]);

  const handleSaveEdit = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;

    const root = doc.getElementById("root");
    const changedEls = doc.body.querySelectorAll<HTMLElement>("[data-original-text]");

    changedEls.forEach((el) => {
      const originalText = el.getAttribute("data-original-text") || "";
      const newText = el.textContent || "";

      const isLeafText = el.children.length === 0 ||
        Array.from(el.childNodes).every(n => n.nodeType === Node.TEXT_NODE);

      if (
        originalText.trim() !== newText.trim() &&
        newText.trim() &&
        newText.trim().length < 200 &&
        isLeafText
      ) {
        addEditLog({
          projectId,
          action: "text",
          element: `"${originalText.trim().substring(0, 30)}"`,
          selector: getElementSelector(el),
          oldValue: originalText.trim().substring(0, 50),
          newValue: newText.trim().substring(0, 50),
        });
      }

      el.removeAttribute("data-original-text");
    });

    doc.body.querySelectorAll<HTMLElement>("*").forEach((el) => {
      el.contentEditable = "false";
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
      el.style.cursor = "";
      el.removeAttribute("onclick");
    });

    if (!doc.querySelector('link[href*="Material+Icons"]')) {
      const fontLink = doc.createElement("link");
      fontLink.rel = "stylesheet";
      fontLink.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
      doc.head.appendChild(fontLink);
    }

    // const editedHtml = root?.innerHTML || doc.body.innerHTML;

    let editedHtml = root?.innerHTML || doc.body.innerHTML;

    // clone để cleanup
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editedHtml;

    // remove edit-mode artifacts
    tempDiv.querySelectorAll<HTMLElement>("*").forEach((el) => {
      el.removeAttribute("contenteditable");
      el.removeAttribute("data-original-text");
      el.removeAttribute("onclick");

      // remove style edit mode
      el.style.outline = "";
      el.style.outlineOffset = "";
      el.style.boxShadow = "";
      el.style.cursor = "";

      // remove empty style attr
      if (el.getAttribute("style")?.trim() === "") {
        el.removeAttribute("style");
      }
    });

    // fix ảnh base64 gây lỗi export flutter
    tempDiv.querySelectorAll<HTMLImageElement>("img").forEach((img) => {
      const src = img.getAttribute("src");

      if (src?.startsWith("data:image")) {
        img.setAttribute(
          "src",
          "https://placehold.co/600x400/png"
        );
      }
    });

    editedHtml = tempDiv.innerHTML;

    updateFrame(
      { frameId, htmlContent: editedHtml },
      {
        onSuccess: () => {
          iframe.style.pointerEvents = "none";
          setIsEditing(false);
          toast.success("Đã lưu thay đổi!");
        },
      }
    );
  }, [frameId, projectId, updateFrame, addEditLog, getElementSelector]);

  const handleDownloadPng = useCallback(async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const response = await axios.post(
        "/api/screenshot",
        { html: fullHtml, width: frameSize.width, height: frameSize.height },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải ảnh chụp màn hình xuống");
    } catch (error) {
      console.error(error);
      toast.error("Không thể chụp ảnh màn hình");
    } finally {
      setIsDownloading(false);
    }
  }, [frameSize.height, frameSize.width, fullHtml, isDownloading, title]);

  const handleExportSvg = useCallback(async () => {
    if (isExportingSvg) return;
    setIsExportingSvg(true);
    try {
      const iframe = iframeRef.current;
      if (!iframe) throw new Error("iframe not found");
      const doc = iframe.contentDocument;
      if (!doc) throw new Error("iframe document not found");
      const fullHtmlContent = doc.documentElement.outerHTML;
      const response = await axios.post(
        "/api/screenshot",
        {
          html: `<!DOCTYPE html>${fullHtmlContent}`,
          width: frameSize.width,
          height: Number(frameSize.height),
        },
        {
          responseType: "blob",
          validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
        }
      );
      const pngBlob = response.data;
      const pngUrl = URL.createObjectURL(pngBlob);
      const w = frameSize.width;
      const h = Number(frameSize.height);
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(pngBlob);
      });
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image x="0" y="0" width="${w}" height="${h}"
         xlink:href="${base64}"/>
</svg>`;
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      URL.revokeObjectURL(pngUrl);
      toast.success("Đã xuất SVG!");
    } catch (error) {
      console.error(error);
      toast.error("Xuất SVG thất bại!");
    } finally {
      setIsExportingSvg(false);
    }
  }, [frameSize, isExportingSvg, title, fullHtml]);

  
  const handleExportFlutter = useCallback(() => {
    if (isExportingFlutter) return;

    // Lấy HTML hiện tại từ iframe thay vì từ prop
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const currentHtml = doc?.getElementById("root")?.innerHTML 
        || doc?.body?.innerHTML 
        || html; // fallback về prop nếu không lấy được

    setIsExportingFlutter(true);
    toast.info("Đang tạo Flutter code, vui lòng chờ...");
    
    exportFlutter({ frameId, htmlContent: currentHtml }, {  // ← truyền object thay vì string
        onSuccess: (data) => {
            const blob = new Blob([data.data.dartCode], {
                type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = data.data.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("Đã xuất Flutter code!");
        },
        onError: () => {
            toast.error("Xuất Flutter thất bại!");
        },
        onSettled: () => {
            setIsExportingFlutter(false);
        },
    });
}, [frameId, exportFlutter, isExportingFlutter, html]);

  return (
    <Rnd
      default={{ x: initialPosition.x, y: initialPosition.y, width, height: Number(frameSize.height) }}
      minWidth={width}
      minHeight={minHeight}
      size={{ width: frameSize.width, height: Number(frameSize.height) }}
      disableDragging={toolMode === TOOL_MODE_ENUM.HAND || isEditing}
      enableResizing={isSelected && toolMode !== TOOL_MODE_ENUM.HAND && !isEditing}
      scale={scale}
      onClick={(e: any) => {
        e.stopPropagation();
        if (toolMode === TOOL_MODE_ENUM.SELECT) {
          setSelectedFrameId(frameId);
        }
      }}
      resizeHandleComponent={{
        topLeft: isSelected ? <Handle /> : undefined,
        topRight: isSelected ? <Handle /> : undefined,
        bottomLeft: isSelected ? <Handle /> : undefined,
        bottomRight: isSelected ? <Handle /> : undefined,
      }}
      onResize={(e, direction, ref) => {
        setFrameSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
      }}
      className={cn(
        "relative z-10",
        isSelected && toolMode !== TOOL_MODE_ENUM.HAND && "ring-3 ring-blue-400 ring-offset-1",
        isEditing && "ring-3 ring-indigo-500 ring-offset-1",
        toolMode === TOOL_MODE_ENUM.HAND ? "cursor-grab! active:cursor-grabbing!" : "cursor-move"
      )}
    >
      <div className="w-full h-full">
        <DeviceFrameToolbar
          title={title}
          isSelected={isSelected && toolMode !== TOOL_MODE_ENUM.HAND}
          disabled={isDownloading || isLoading}
          isDownloading={isDownloading}
          isEditing={isEditing}
          isSaving={isSaving}
          isExportingSvg={isExportingSvg}
          isExportingFlutter={isExportingFlutter}
          onOpenHtmlDialog={onOpenHtmlDialog}
          onDownloadPng={handleDownloadPng}
          onStartEdit={handleStartEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onExportSvg={handleExportSvg}
          onExportFlutter={handleExportFlutter}
          canEdit={canEdit}
          isDeleting={isDeleting}
          onDeleteFrame={handleDeleteFrame}
          onToggleLog={() => setShowLog(prev => !prev)}
          showLog={showLog}
        />

        <EditLogPanel
          frameId={frameId}
          isOpen={showLog && isSelected}
          onHighlight={handleHighlightElement}
        />

        <div className={cn(
          `relative w-full h-auto shadow-sm rounded-[36px] overflow-hidden`,
          isSelected && toolMode !== TOOL_MODE_ENUM.HAND && "rounded-none",
          isEditing && "ring-2 ring-indigo-400"
        )}>
          {isLoading ? (
            <DeviceFrameSkeleton
              style={{ position: "relative", width, height: minHeight }}
            />
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={fullHtml}
              title={title}
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: "100%",
                minHeight: `${minHeight}px`,
                height: `${frameSize.height}px`,
                border: "none",
                pointerEvents: isEditing ? "auto" : "none",
                display: "block",
                background: "white",
              }}
            />
          )}
        </div>
      </div>

      <IconPicker
        open={iconPickerOpen}
        onClose={() => {
          setIconPickerOpen(false);
          if (selectedIconElRef.current) {
            selectedIconElRef.current.style.outline = "2px dashed #10b981";
            selectedIconElRef.current.style.boxShadow = "";
          }
        }}
        onSelect={handleSelectIcon}
      />
    </Rnd>
  );
};

const Handle = () => (
  <div className="z-30 h-4 w-4 bg-white border-2 border-blue-500" />
);

export default DeviceFrame;

