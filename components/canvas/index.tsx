// import React, { useState } from "react";
// import DeviceFrame from "./device-frame";
// import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
// import { cn } from "@/lib/utils";
// import { Spinner } from "../ui/spinner";
// import CanvasFloatingToolbar from "./canvas-floating-toolbar";
// import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
// import CanvasControls from "./canvas-controls";
// import DeviceFrameSkeleton from "./device-frame-skeleton";
// import HtmlDialog from "./html-dialog";



// const DEMO_HTML = `
// <div class=\"flex flex-col w-full min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pt-pb-24 px-6 overflow-y-auto relative\">

//   <header class=\"flex justify-between items-center mb-8\">
//     <div>
//       <p class=\"text-[var(--muted-foreground)] text-xs uppercase tracking-widest font-semibold mb-1\">Welcome Back</p>
//       <h1 class=\"text-2xl font-bold tracking-tight text-[var(--foreground)]\">Alex Runner</h1>
//     </div>
//     <div class=\"h-12 w-12 rounded-full border-2 border-[var(--primary)] p-1 overflow-hidden shadow-[0_0_10px_var(--primary)]\">
//       <img src=\"https://i.pravatar.cc/150?img=11\" alt=\"User\" class=\"w-full h-full object-cover rounded-full\" />
//     </div>
//   </header>

//   <div class=\"relative flex items-center justify-center mb-10\">
//     <div class=\"absolute inset-0 bg-[var(--primary)] opacity-20 blur-3xl rounded-full transform scale-75\"></div>
//     <div class=\"relative w-64 h-64\">
//       <svg class=\"w-full h-full transform -rotate-90\">
//         <circle cx=\"128\" cy=\"128\" r=\"120\" stroke=\"var(--muted)\" stroke-width=\"8\" fill=\"transparent\" />
//         <circle cx=\"128\" cy=\"128\" r=\"120\" stroke=\"var(--primary)\" stroke-width=\"8\" fill=\"transparent\" 
//         stroke-dasharray=\"753.6\" stroke-dashoffset=\"188\" stroke-linecap=\"round\" class=\"drop-shadow-[0_0_8px_var(--primary)]\" />

//         <circle cx=\"128\" cy=\"128\" r=\"100\" stroke=\"var(--muted)\" stroke-width=\"6\" fill=\"transparent\" />
//         <circle cx=\"128\" cy=\"128\" r=\"100\" stroke=\"var(--accent)\" stroke-width=\"6\" fill=\"transparent\" 
//         stroke-dasharray=\"628\" stroke-dashoffset=\"200\" stroke-linecap=\"round\" class=\"drop-shadow-[0_0_8px_var(--accent)]\" />
//       </svg>

//       <div class=\"absolute inset-0 flex flex-col items-center justify-center\">
//         <iconify-icon icon=\"lucide:footprints\" class=\"text-[var(--primary)] text-3xl mb-1\"></iconify-icon>
//         <span class=\"text-5xl font-black italic tracking-tighter text-[var(--foreground)]\">8,432</span>
//         <span class=\"text-[var(--muted-foreground)] text-sm font-medium uppercase tracking-widest\">Steps</span>
//         <div class=\"mt-2 flex items-center gap-1 text-[var(--accent)]\">
//           <iconify-icon icon=\"lucide:flame\" width=\"14\"></iconify-icon>
//           <span class=\"text-sm font-bold\">420 kcal</span>
//         </div>
//       </div>
//     </div>
//   </div>

//   <div class=\"mb-6\">
//     <div class=\"flex justify-between items-end mb-4\">
//       <h2 class=\"text-lg font-bold flex items-center gap-2\">
//         <iconify-icon icon=\"lucide:activity\" class=\"text-[var(--accent)]\"></iconify-icon>
//         Heart Rate
//       </h2>
//       <span class=\"text-[var(--accent)] font-mono font-bold text-xl drop-shadow-[0_0_5px_var(--accent)]\">112 BPM</span>
//     </div>

//     <div class=\"h-32 w-full bg-[var(--card)] rounded-[var(--radius)] border border-[var(--muted)] relative overflow-hidden p-4 flex items-end\">
//       <div class=\"absolute inset-0 grid grid-rows-4 w-full h-full opacity-10 pointer-events-none\">
//         <div class=\"border-b border-[var(--foreground)]\"></div>
//         <div class=\"border-b border-[var(--foreground)]\"></div>
//         <div class=\"border-b border-[var(--foreground)]\"></div>
//         <div class=\"border-b border-[var(--foreground)]\"></div>
//       </div>

//       <svg class=\"w-full h-full overflow-visible\">
//         <path d=\"M0,80 C20,80 40,50 60,60 S100,20 120,40 S160,80 180,70 S220,10 240,30 S280,60 350,50 V150 H0 Z\" fill=\"var(--accent)\" fill-opacity=\"0.1\" />
//       </svg>
//     </div>
//   </div>

//   <div class=\"grid grid-cols-2 gap-4\">
//     <button class=\"bg-[var(--card)] p-5 rounded-[var(--radius)] border border-[var(--muted)] flex flex-col items-start active:scale-95 transition-transform\">
//       <div class=\"bg-[var(--muted)] p-2 rounded-full mb-3 text-[var(--primary)]\">
//         <iconify-icon icon=\"lucide:moon\" width=\"24\" height=\"24\"></iconify-icon>
//       </div>
//       <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">Sleep</span>
//       <span class=\"text-xl font-bold text-[var(--foreground)]\">7h 20m</span>
//     </button>

//     <button class=\"bg-[var(--card)] p-5 rounded-[var(--radius)] border border-[var(--muted)] flex flex-col items-start active:scale-95 transition-transform\">
//       <div class=\"bg-[var(--muted)] p-2 rounded-full mb-3 text-[var(--accent)]\">
//         <iconify-icon icon=\"lucide:droplets\" width=\"24\" height=\"24\"></iconify-icon>
//       </div>
//       <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">Water</span>
//       <span class=\"text-xl font-bold text-[var(--foreground)]\">1,250ml</span>
//     </button>

//     <button class=\"col-span-2 bg-[var(--card)] p-4 rounded-[var(--radius)] border border-[var(--muted)] flex items-center justify-between active:scale-95 transition-transform\">
//       <div class=\"flex items-center gap-4\">
//         <div class=\"bg-[var(--muted)] p-2 rounded-full text-white\">
//           <iconify-icon icon=\"lucide:wind\" width=\"24\" height=\"24\"></iconify-icon>
//         </div>
//         <div class=\"flex flex-col text-left\">
//           <span class=\"text-[var(--muted-foreground)] text-xs font-bold uppercase\">SpO2 Levels</span>
//           <span class=\"text-lg font-bold text-[var(--foreground)]\">98% Normal</span>
//         </div>
//       </div>
//       <div class=\"h-2 w-24 bg-[var(--muted)] rounded-full overflow-hidden\">
//         <div class=\"h-full w-[98%] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]\"></div>
//       </div>
//     </button>
//   </div>

//   <nav class=\"mobile-bottom-nav\">
//     <a href=\"#\" class=\"mobile-bottom-nav-item active\">
//       <iconify-icon icon=\"lucide:home\"></iconify-icon>
//       <span>Home</span>
//       <div class=\"nav-indicator\"></div>
//     </a>
//     <a href=\"#\" class=\"mobile-bottom-nav-item\">
//       <iconify-icon icon=\"lucide:activity\"></iconify-icon>
//       <span>Stats</span>
//       <div class=\"nav-indicator\"></div>
//     </a>
//     <a href=\"#\" class=\"mobile-bottom-nav-item\">
//       <iconify-icon icon=\"lucide:dumbbell\"></iconify-icon>
//       <span>Gym</span>
//       <div class=\"nav-indicator\"></div>
//     </a>
//     <a href=\"#\" class=\"mobile-bottom-nav-item\">
//       <iconify-icon icon=\"lucide:user\"></iconify-icon>
//       <span>Profile</span>
//       <div class=\"nav-indicator\"></div>
//     </a>
//   </nav>

// </div>
// `;

// const Canvas = ({
//     projectId,
//     isPending,
//     projectName,
// }: {
//     projectId: string;
//     isPending: boolean;
//     projectName: string | null;
// }) => {
//     const { theme, frames, selectedFrame, loadingStatus } =useCanvas();
//     const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT)
//     const [zoomPercent, setZoomPercent] = useState<number>(53)
//     const [currentScale, setCurrentScale] = useState<number>(0.53)
//     const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
//     const currentStatus = isPending
//         ? "fetching"
//         : loadingStatus !== "idle" 
//             ? loadingStatus
//             : null;

//     const onOpenHtmlDialog = () => {
//       setOpenHtmlDialog(true);
//     };
//     return (
//         <>
//             <div className="relative w-full h-full overflow-hidden">
//                 <CanvasFloatingToolbar />

//                 {currentStatus && <CanvasLoader status={currentStatus} />}
//                 <TransformWrapper
//                     initialScale={0.53}
//                     initialPositionX={40}
//                     initialPositionY={5}
//                     minScale={0.1}
//                     maxScale={3}
//                     wheel={{ step: 0.1 }}
//                     pinch={{ step: 0.1 }}
//                     doubleClick={{ disabled: true }}
//                     centerZoomedOut={false}
//                     centerOnInit={false}
//                     smooth={true}
//                     limitToBounds={false}
//                     panning={{
//                         disabled: toolMode !== TOOL_MODE_ENUM.HAND,
//                     }}
//                     onTransformed={(ref) => {
//                         setZoomPercent(Math.round(ref.state.scale * 100));
//                         setCurrentScale(ref.state.scale);
//                     }}
//                 >
//                     {({ zoomIn, zoomOut }) => (
//                         <>
//                             <div className={cn(
//                                 `absolute inset-0 w-full h-full bg-[#eee]
//                      dark:bg-[#242423] p-3
//                     `,
//                                 toolMode === TOOL_MODE_ENUM.HAND
//                                     ? "cursor-grab active:cursor-grabbing"
//                                     : "cursor-default"
//                             )}
//                                 style={{
//                                     backgroundImage:
//                                         "radial-gradient(circle, var(--primary) 1px, transparent 1px",
//                                     backgroundSize: "20px 20px",
//                                 }}
//                             >
//                                 <TransformComponent
//                                     wrapperStyle={{
//                                         width: "100%",
//                                         height: "100%",
//                                         overflow: "unset",
//                                     }}
//                                     contentStyle={{
//                                         width: "100%",
//                                         height: "100%",
//                                     }}
//                                 >

//                                     <div>{frames?.map((frame, index: number) => {
//                                         const baseX = 100 + index * 480;
//                                         const y= 100;

//                                         if (frame.isLoading) {
//                                             return (
//                                               <DeviceFrameSkeleton
//                                                 key={index}
//                                                 style={{
//                                                     transform: `translate(${baseX}px 100px)`
//                                                 }}
//                                               />  
//                                             );
//                                         }

//                                         return (
//                                             <DeviceFrame
//                                                 key={frame.id}
//                                                 frameId={frame.id}
//                                                 title={frame.title}
//                                                 html={frame.htmlContent}
//                                                 scale={currentScale}
//                                                 initialPosition={{
//                                                     x: baseX,
//                                                     y,
//                                                 }}
//                                                 toolMode={toolMode}
//                                                 theme_style={theme?.style}
//                                                 onOpenHtmlDialog={onOpenHtmlDialog}
//                                             />
//                                         )
//                                     })}</div>
//                                     {/* <DeviceFrame
//                                         frameId="demo"
//                                         title="Demo Screen"
//                                         html={DEMO_HTML}
//                                         scale={currentScale}
//                                         initialPosition={{
//                                             x: 1000,
//                                             y: 100,
//                                         }}
//                                         toolMode={toolMode}
//                                         theme_style={theme?.style}
//                                         onOpenHtmlDialog={onOpenHtmlDialog}
//                                     /> */}

//                                 </TransformComponent>
//                             </div>

//                             <CanvasControls
//                                 zoomIn={zoomIn}
//                                 zoomOut={zoomOut}
//                                 zoomPercent={zoomPercent}
//                                 toolMode={toolMode}
//                                 setToolMode={setToolMode}
//                             />

//                         </>
//                     )}
//                 </TransformWrapper>
//             </div>

//             <HtmlDialog
//               html={selectedFrame?.htmlContent || DEMO_HTML}
//               theme_style={theme?.style}
//               open={openHtmlDialog}
//               onOpenChange={setOpenHtmlDialog}
//             />
//         </>
//     );
// };

// function CanvasLoader({ status }: { status?: LoadingStatusType | "fetching" }) {
//     return <div className={cn(
//         `absolute top-4 left-1/2 -translate-x-1/2 min-w-40
//         max-w-full px-4 pt-1.5 pb-2
//         rounded-br-xl rounded-bl-xl shadow-md
//         flex items-center space-x-2 z-50
//         `,
//         status === "fetching" && "bg-gray-500 text-white",
//         status === "running" && "bg-amber-500 text-white",
//         status === "analyzing" && "bg-blue-500 text-white",
//         status === "generating" && "bg-purple-500 text-white",
//     )}>
//         <Spinner className="w-4 h-4 stroke-3!" />
//         <span className="text-sm font-semibold capitalize">
//             {status === "fetching" ? "Loading Project" : status}
//         </span>
//     </div>;

// }

// export default Canvas;


import React, { useState, useEffect, useRef, useCallback } from "react"; // THÊM useEffect
import axios from "axios";
import DeviceFrame from "./device-frame";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { LoadingStatusType, useCanvas } from "@/context/canvas-context";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import CanvasFloatingToolbar from "./canvas-floating-toolbar";
import { TOOL_MODE_ENUM, ToolModeType } from "@/constant/canvas";
import CanvasControls from "./canvas-controls";
// import DeviceFrameSkeleton from "./device-frame-skeleton";
import HtmlDialog from "./html-dialog";
import { useRouter } from "next/navigation"; // THÊM useRouter
import { toast } from "sonner";

const Canvas = ({
  projectId,
  isPending,
  projectName,
  canEdit = true,
}: {
  projectId: string;
  isPending: boolean;
  projectName: string | null;
  canEdit?: boolean;
}) => {
  const router = useRouter(); // KHỞI TẠO ROUTER
  const { theme, frames, selectedFrame, setSelectedFrameId, loadingStatus } = useCanvas();
  //
  console.log("Trạng thái hiện tại nè:", loadingStatus);
  const [toolMode, setToolMode] = useState<ToolModeType>(TOOL_MODE_ENUM.SELECT)
  const [zoomPercent, setZoomPercent] = useState<number>(53)
  const [currentScale, setCurrentScale] = useState<number>(0.53)
  const [openHtmlDialog, setOpenHtmlDialog] = useState(false);
  const [isScreenshotting, setIsScreenshotting] = useState(false);
  const canvasRootRef = useRef<HTMLDivElement>(null);

  const currentStatus = isPending
    ? "fetching"
    : loadingStatus !== "idle"
      ? loadingStatus
      : null;

     const saveThumbnailToProject = useCallback(  
      async (projectId: string | null) => {
    try {
      if (!projectId) return null;
      const result = getCanvasHtmlContent();
      if (!result?.html) return null;
      setSelectedFrameId(null);
      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
          projectId,
        },
            );
            if (response.data) {
              console.log("Thumbnail saved", response.data)
            }
    } catch (error) {
      console.log(error);
    }
  }, 
  [setSelectedFrameId]
);

  // useEffect(() => {
  //   if (!projectId) return;
  //   if (loadingStatus !== "completed") return; // Tạm tắt dòng này để test

  //   saveThumbnailToProject(projectId);
  // }, [loadingStatus, projectId, saveThumbnailToProject]);

  // --- LOGIC TỰ ĐỘNG REFRESH MẠNH HƠN --- sửa chỗ này nè lưu ý
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;

  //   if (loadingStatus === "analyzing" || loadingStatus === "generating" || loadingStatus === "running") {
  //     interval = setInterval(() => {
  //       // Thay vì router.refresh(), mình dùng window.location.reload() 
  //       // để ép trình duyệt tải lại hoàn toàn dữ liệu từ DB
  //       window.location.reload();
  //       console.log("Đang ép trang web tải lại để lấy giao diện...");
  //     }, 5000); // Tăng lên 5 giây để AI có kịp thời gian ghi vào DB
  //   }

  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [loadingStatus]);
  // ---------------------------------------------

  useEffect(() => {
    // Log ra để xem nó có bao giờ chạm được vào mức "completed" không
    console.log("Check loadingStatus trước khi save:", loadingStatus);
    
    if (projectId && loadingStatus === "completed") {
        console.log("🎯 Bắt đầu lưu thumbnail...");
        saveThumbnailToProject(projectId);
    }
}, [loadingStatus, projectId, saveThumbnailToProject]);


  const onOpenHtmlDialog = () => {
    setOpenHtmlDialog(true);
  };

  function getCanvasHtmlContent() {
    const el = canvasRootRef.current;
    if (!el) {
      toast.error("Canvas element not found");
      return null;
    }
    let styles = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) styles += rule.cssText;
      } catch { }
    }

    return {
      element: el,
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>body{margin:0}*{box-sizing:border-box}${styles}</style>
          </head>
          <body>${el.outerHTML}</body>
          </html>
      `,
    }

  }

  const handleCanvasScreenshot = useCallback(async () => {
    try {
      const result = getCanvasHtmlContent();
      if (!result?.html) {
        toast.error("Failed to get canvas content");
        return null;
      }
      setSelectedFrameId(null);
      setIsScreenshotting(true);

      const response = await axios.post(
        "/api/screenshot",
        {
          html: result.html,
          width: result.element.scrollWidth,
          height: 700,
        },
        {
                    responseType: "blob",
                    validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
                }
            );
            const title = projectName || "Canvas";
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${title.replace(/\s+/g, "-").toLowerCase()}
            -${Date.now()}.png`;
            link.click();
            window.URL.revokeObjectURL(url);
            toast.success("Screenshot downloaded");
    } catch (error) {
      console.log(error);
      toast.error("Failed to screenshot canvas")
    } finally {
      setIsScreenshotting(false);
    }
  }, [projectName, setSelectedFrameId]);


  return (
    <>
      <div className="relative w-full h-full overflow-hidden">
        <CanvasFloatingToolbar
          projectId={projectId}
          isScreenshotting={isScreenshotting}
          onScreenshot={handleCanvasScreenshot}
        />

        {currentStatus && <CanvasLoader status={currentStatus} />}
        <TransformWrapper
          initialScale={0.53}
          initialPositionX={40}
          initialPositionY={5}
          minScale={0.1}
          maxScale={3}
          wheel={{ step: 0.1 }}
          pinch={{ step: 0.1 }}
          doubleClick={{ disabled: true }}
          centerZoomedOut={false}
          centerOnInit={false}
          smooth={true}
          limitToBounds={false}
          panning={{
            disabled: toolMode !== TOOL_MODE_ENUM.HAND,
          }}
          onTransformed={(ref) => {
            setZoomPercent(Math.round(ref.state.scale * 100));
            setCurrentScale(ref.state.scale);
          }}
        >
          {({ zoomIn, zoomOut }) => (
            <>
              <div
                ref={canvasRootRef}
                className={cn(
                  `absolute inset-0 w-full h-full bg-[#eee]
                     dark:bg-[#242423] p-3
                    `,
                  toolMode === TOOL_MODE_ENUM.HAND
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-default"
                )}
                style={{
                  backgroundImage:
                    "radial-gradient(circle, var(--primary) 1px, transparent 1px",
                  backgroundSize: "20px 20px",
                }}
              >
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    overflow: "unset",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                  }}
                >

                  <div>{frames?.map((frame, index: number) => {
                    const baseX = 100 + index * 480;
                    const y = 100;

                    // if (frame.isLoading) {
                    //   return (
                    //     <DeviceFrameSkeleton
                    //       key={index}
                    //       style={{
                    //         transform: `translate(${baseX}px 100px)`
                    //       }}
                    //     />
                    //   );
                    // }

                    return (
                      <DeviceFrame
                        key={frame.id}
                        frameId={frame.id}
                        projectId={projectId}
                        title={frame.title}
                        html={frame.htmlContent}
                        isLoading={frame.isLoading}
                        scale={currentScale}
                        initialPosition={{
                          x: baseX,
                          y,
                        }}
                        toolMode={toolMode}
                        theme_style={theme?.style}
                        onOpenHtmlDialog={onOpenHtmlDialog}
                        canEdit={canEdit} 
                      />
                    )
                  })}</div>
                </TransformComponent>
              </div>

              <CanvasControls
                zoomIn={zoomIn}
                zoomOut={zoomOut}
                zoomPercent={zoomPercent}
                toolMode={toolMode}
                setToolMode={setToolMode}
              />

            </>
          )}
        </TransformWrapper>
      </div>

      <HtmlDialog
        html={selectedFrame?.htmlContent || ""}
        theme_style={theme?.style}
        open={openHtmlDialog}
        onOpenChange={setOpenHtmlDialog}
      />
    </>
  );
};

function CanvasLoader({ status }: { status?: LoadingStatusType | "fetching" }) {
  return <div className={cn(
    `absolute top-4 left-1/2 -translate-x-1/2 min-w-40
        max-w-full px-4 pt-1.5 pb-2
        rounded-br-xl rounded-bl-xl shadow-md
        flex items-center space-x-2 z-50
        `,
    status === "fetching" && "bg-gray-500 text-white",
    status === "running" && "bg-amber-500 text-white",
    status === "analyzing" && "bg-blue-500 text-white",
    status === "generating" && "bg-purple-500 text-white",
  )}>
    <Spinner className="w-4 h-4 stroke-3!" />
    <span className="text-sm font-semibold capitalize">
      {status === "fetching" ? "Loading Project" : status}
    </span>
  </div>;

}

export default Canvas;