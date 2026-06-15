import { useInngestSubscription } from "@inngest/realtime/hooks";
import { THEME_LIST, ThemeType } from "@/lib/themes";
import { FrameType } from "@/types/project";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { fetchRealtimeSubscriptionToken } from "@/app/action/realtime";

export type LoadingStatusType =
    | "idle"
    | "running"
    | "analyzing"
    | "generating"
    | "completed";

interface CanvasContextType {
    theme?: ThemeType
    setTheme: (id: string) => void;
    themes: ThemeType[];
    frames: FrameType[];
    setFrames: (frames: FrameType[]) => void;
    updateFrame: (id: string, data: Partial<FrameType>) => void
    addFrame: (frame: FrameType) => void;
    selectedFrameId: string | null
    selectedFrame: FrameType | null
    setSelectedFrameId: (id: string | null) => void;
    loadingStatus: LoadingStatusType
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider = ({
    children,
    initialFrames,
    initialThemeId,
    hasInitialData,
    projectId,
    userId, 
}: {
    children: ReactNode;
    initialFrames: FrameType[];
    initialThemeId?: string;
    hasInitialData: boolean;
    projectId: string | null;
    userId: string; 
}) => {
    const [themeId, setThemeId] = useState<string>(
        initialThemeId || THEME_LIST[0].id
    );

    const [frames, setFrames] = useState<FrameType[]>(initialFrames);
    const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
    const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>("idle");
    const isGeneratingRef = useRef(false);

    const [prevProjectId, setPrevProjectId] = useState(projectId);
    if (projectId !== prevProjectId) {
        setPrevProjectId(projectId);
        setFrames(initialFrames);
        setThemeId(initialThemeId || THEME_LIST[0].id);
        setSelectedFrameId(null);
    }

    const theme = THEME_LIST.find((t) => t.id === themeId);
    const selectedFrame = selectedFrameId && frames.length !== 0
        ? frames.find((f) => f.id === selectedFrameId) || null
        : null;

    // 🔥 BƯỚC 2: Cấu hình channel cụ thể cho Hook để bắt đúng tần số
    const { freshData, state, error } = useInngestSubscription({
        refreshToken: fetchRealtimeSubscriptionToken,
        bufferInterval: 100, // ← thêm dòng này
    });

    console.log("📡 Realtime State:", state);
    if (error) console.error("❌ Realtime Error:", error);

    useEffect(() => {
        if (!freshData || freshData.length === 0) return;
        console.log("📦 freshData mới nhận được:", freshData);

        freshData.forEach((message: any) => {
            const { data } = message;
            // Tránh lỗi lệch tên thuộc tính giữa các phiên bản SDK (topic / name / event)
            const eventName = message.topic || message.name || message.event;

            if (data.projectId && projectId && data.projectId !== projectId) return;

            switch (eventName) {
                case "generation.start":
                    isGeneratingRef.current = true; // 🔒 Lock
                    setLoadingStatus("running");
                    break;

                case "analysis.start":
                    setLoadingStatus("analyzing");
                    break;

                case "analysis.complete":
                    if (data.theme) setThemeId(data.theme);
                    if (data.screens && data.screens.length > 0) {
                        const skeletonFrames: FrameType[] = data.screens.map((s: any) => ({
                            id: s.id,
                            title: s.name,
                            htmlContent: "",
                            isLoading: true,
                        }));
                        setFrames((prev) => {
                            const existingIds = new Set(prev.map(f => f.id));
                            const newSkeletons = skeletonFrames.filter(s => !existingIds.has(s.id));
                            return [...prev, ...newSkeletons];
                        });
                    }
                    break;

                case "frame.created":
                    if (data.frame) {
                        setFrames((prev) => {
                            const newFrames = [...prev];
                            const idx = newFrames.findIndex((f) =>
                                f.id === data.screenId || f.id === data.frame.id
                            );
                            if (idx !== -1) {
                                newFrames[idx] = { ...data.frame, isLoading: false };
                            } else {
                                newFrames.push({ ...data.frame, isLoading: false });
                            }
                            return newFrames;
                        });
                    }
                    break;

                case "generation.complete":
                    setLoadingStatus("completed");
                    setTimeout(() => {
                        setLoadingStatus("idle");
                        isGeneratingRef.current = false; // 🔓 Unlock
                    }, 3000);
                    break;
            }
        });
    }, [projectId, freshData]);


    useEffect(() => {
        if (!initialFrames) return;

        setFrames((prev) => {
            // giữ lại frame loading đang generate
            const loadingFrames = prev.filter(
                (f) =>
                    f.isLoading &&
                    !initialFrames.some((dbFrame) => dbFrame.id === f.id)
            );

            // update frame từ DB luôn (bao gồm htmlContent mới)
            const syncedFrames = initialFrames.map((frame) => {
                const existing = prev.find((f) => f.id === frame.id);

                return existing
                    ? {
                        ...existing,
                        ...frame, // luôn lấy data mới từ DB
                        isLoading: false,
                    }
                    : frame;
            });

            return [...syncedFrames, ...loadingFrames];
        });
    }, [initialFrames]);

    const addFrame = useCallback((frame: FrameType) => {
        setFrames((prev) => [...prev, frame]);
    }, []);

    const updateFrame = useCallback((id: string, data: Partial<FrameType>) => {
        setFrames((prev) => {
            return prev.map((frame) =>
                frame.id === id ? { ...frame, ...data } : frame
            );
        });
    }, []);

    return (
        <CanvasContext.Provider
            value={{
                theme,
                setTheme: setThemeId,
                themes: THEME_LIST,
                frames,
                setFrames,
                selectedFrameId,
                selectedFrame,
                setSelectedFrameId,
                updateFrame,
                addFrame,
                loadingStatus,
            }}
        >
            {children}
        </CanvasContext.Provider>
    )
};

export const useCanvas = () => {
    const ctx = useContext(CanvasContext);
    if (!ctx) throw new Error("useCanvas must be used inside CanvasProvider");
    return ctx;
};