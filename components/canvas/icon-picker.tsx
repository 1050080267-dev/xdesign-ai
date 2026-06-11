"use client"
import { useState } from "react";
import { MATERIAL_ICONS, MaterialIcon } from "@/lib/material-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";

type PropsType = {
    open: boolean;
    onClose: () => void;
    onSelect: (icon: MaterialIcon) => void;
};

const IconPicker = ({ open, onClose, onSelect }: PropsType) => {
    const [search, setSearch] = useState("");

    const filtered = MATERIAL_ICONS.filter(icon =>
        icon.label.toLowerCase().includes(search.toLowerCase()) ||
        icon.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* Load Material Icons font */}
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/icon?family=Material+Icons"
            />

            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Chọn Icon</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Tìm icon..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mb-2"
                        autoFocus
                    />

                    <div className="overflow-y-auto grid grid-cols-5 gap-2 p-1">
                        {filtered.map((icon) => (
                            <button
                                key={icon.name + icon.flutter}
                                onClick={() => {
                                    onSelect(icon);
                                    onClose();
                                }}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
                                title={icon.flutter}
                            >
                                {/* Hiện icon bằng img từ Google Fonts API */}
                                <img
                                    src={`https://fonts.gstatic.com/s/i/materialicons/${icon.name}/v12/24px.svg`}
                                    alt={icon.label}
                                    className="w-6 h-6"
                                    onError={(e) => {
                                        // Fallback: dùng text nếu ảnh lỗi
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        const span = document.createElement("span");
                                        span.className = "material-icons text-2xl";
                                        span.textContent = icon.name;
                                        target.parentNode?.insertBefore(span, target);
                                    }}
                                />
                                <span className="text-[10px] text-muted-foreground text-center truncate w-full leading-tight">
                                    {icon.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default IconPicker;