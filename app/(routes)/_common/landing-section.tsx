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
            value: '"Màn hình thống kê ứng dụng tài chính. Số dư hiện tại ở trên cùng với số tiền Đô-la, biểu đồ cột hiển thị chi tiêu qua các tháng (Tháng 10 - Tháng 3) với các nút chọn tháng dạng viên thuốc ở phía dưới, danh sách giao dịch có icon ứng dụng, số tiền và danh mục. Thanh điều hướng phía dưới. Ứng dụng di động, giao diện một màn hình. Phong cách: Chế độ sáng, đậm nét và nhiều màu sắc. Nền xám đậm/gần như đen, không đổ màu gradient, các thẻ bo góc dày dặn, vui nhộn nhưng chuyên nghiệp, phông chữ sans-serif hiện đại, phong cách fintech Gen Z. Thú vị và tươi mới, không mang tính công sở gò bó."',
        },
        {
            label: "Theo dõi vận động",
            icon: "🔥",
            value: 'Màn hình tóm tắt hoạt động thể chất và theo dõi sức khỏe. Vòng tiến trình tròn lớn ở trung tâm hiển thị số bước chân và calo với hiệu ứng phát sáng neon. Biểu đồ đường hiển thị nhịp tim theo thời gian. Phần phía dưới là lưới các chỉ số sức khỏe (Giấc ngủ, Nước, SpO2). Ứng dụng di động, giao diện một màn hình. Phong cách: Chế độ tối sâu (Tối ưu cho màn hình OLED). Nền đen tuyền với các điểm nhấn màu xanh neon điện tử và màu xanh dương rực rỡ. Độ tương phản cao, nhiều dữ liệu nhưng được sắp xếp gọn gàng, thẩm mỹ bóng bẩy và mang phong cách thể thao.',
        },
        {
            label: "Đặt món & Giao hàng",
            icon: "🍔",
            value: 'Trang chủ ứng dụng giao đồ ăn. Thanh tìm kiếm trên cùng đi kèm ghim vị trí. Banner quảng cáo ưu đãi hàng ngày dạng trượt ngang (carousel). Danh sách nhà hàng xếp theo chiều dọc với ảnh thu nhỏ món ăn lớn nhìn ngon mắt, huy hiệu hiển thị thời gian giao hàng và sao đánh giá. Nút hành động nổi (FAB) cho giỏ hàng. Ứng dụng di động, giao diện một màn hình. Phong cách: Rực rỡ và Kích thích vị giác. Tông màu ấm (cam, đỏ, vàng), các góc thẻ bo tròn, đổ bóng mờ nhẹ để tạo chiều sâu. Giao diện thân thiện và lôi cuốn.',
        },
        {
            label: "Đặt chỗ du lịch",
            icon: "✈️",
            value: 'Màn hình chi tiết điểm đến du lịch. Ảnh chụp toàn màn hình tràn viền sống động về một bãi biển nhiệt đới. Một bảng kéo từ dưới lên (bottom sheet) che phủ phần dưới với các góc trên bo tròn, chứa tên khách sạn, xếp hạng sao, giá mỗi đêm và một nút (Đặt ngay lớn). Danh sách trượt ngang của các biểu tượng tiện ích. Ứng dụng di động, giao diện một màn hình. Phong cách: Sang trọng Tối giản. Nhiều khoảng trắng thoáng đãng, phông chữ serif thanh lịch cho tiêu đề, phông chữ sans-serif tinh gọn cho văn bản chính. Mang phong cách du lịch cao cấp, tinh tế và phóng khoáng.',
        },
        {
            label: "Thương mại điện tử (giày)",
            icon: "👟",
            value: 'Trang sản phẩm giày sneaker. Ảnh sản phẩm lớn chất lượng cao trên nền xám nhạt. Các ô chọn màu sắc (color swatches), lưới chọn kích cỡ (size grid), và một nút cố định "Thêm vào giỏ hàng" ở dưới đáy màn hình. Tiêu đề và giá tiền sử dụng phông chữ đậm, kích thước siêu lớn (oversized). Ứng dụng di động, giao diện một màn hình. Phong cách: Neo-Brutalism (Tân thô bạo). Độ tương phản cao, viền đen dày trên các nút bấm và thẻ, đổ bóng cứng (không làm mờ/blur), hình khối góc cạnh thô sơ, màu sắc nguyên bản đậm nét (vàng và đen). Mang thẩm mỹ thời trang đường phố (streetwear) thời thượng.',
        },
        {
            label: "Sức khỏe tinh thần",
            icon: "🧘",
            value: 'Màn hình trình phát nhạc thiền. Điểm nhấn trung tâm là hiệu ứng hoạt ảnh bong bóng hơi thở trừu tượng, nhẹ nhàng. Các nút điều khiển Phát/Tạm dừng và thanh trượt thời gian ở phía dưới. Nền ứng dụng là màu xanh xô thơm pastel (sage green) dịu mát. Ứng dụng di động, giao diện một màn hình. Phong cách: Tối giản Mềm mại (Soft Minimal). Mọi thành phần đều được bo góc tròn, văn bản có độ tương phản thấp giúp thư giãn mắt, bảng màu pastel, giao diện cực kỳ tinh gọn không rối mắt. Mang bầu không khí Zen (Thiền), bình yên và có tính trị liệu.',
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