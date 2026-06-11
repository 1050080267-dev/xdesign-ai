// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// export const useGetProjectById = (projectId: string) => {
//     return useQuery({
//         queryKey: ["project", projectId],
//         queryFn: async () => {
//             const res = await axios.get(`/api/project/${projectId}`);
//             return res.data;
//         },
//         enabled: !!projectId,
//     });
// };

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

// export const useGetProjectById = (projectId: string) => {
//     return useQuery({
//         queryKey: ["project", projectId],
//         queryFn: async () => {
//             const res = await axios.get(`/api/project/${projectId}`);
//             return res.data;
//         },
//         enabled: !!projectId,
//         // Sửa lỗi ở đây: destruct lấy { state } từ query
//         refetchInterval: (query) => {
//             const data = query.state.data as any; // Ép kiểu any để truy cập nhanh các thuộc tính

//             // Nếu đã có frames (AI đã làm xong) thì dừng refetch (false)
//             // Nếu chưa có frames hoặc mảng trống thì cứ 3 giây refetch 1 lần
//             if (data?.frames && data.frames.length > 0) {
//                 return false;
//             }
//             return 3000;
//         },
//         refetchOnWindowFocus: true,
//     });
// };

export const useGetProjectById = (projectId: string) => {
    return useQuery({
        queryKey: ["project", projectId],
        queryFn: async () => {
            const res = await axios.get(`/api/project/${projectId}`);
            return res.data;
        },
        enabled: !!projectId,
        refetchInterval: 2000, // 👈 giảm xuống 2 giây cho nhanh hơn
        refetchOnWindowFocus: true,
        // Chỉ re-render khi data thực sự thay đổi
        structuralSharing: true,
    });
};


export const useGenerateDesignById = (projectId: string) => {
    return useMutation({
        mutationFn: async (prompt: string) =>
            await axios.post(`/api/project/${projectId}`, {
                prompt,
            })
                .then((res) => res.data),
        onSuccess: () => {
            toast.success("Đã bắt đầu tạo giao diện");
        },
        onError: (error) => {
            console.log("Cập nhật dự án thất bại", error);
            toast.error("Không thể tạo màn hình");
        },
    });

};

export const useUpdateProject = (projectId: string) => {
    return useMutation({
        mutationFn: async (themeId: string) =>
            await axios.patch(`/api/project/${projectId}`, {
                themeId,
            })
                .then((res) => res.data),
        onSuccess: () => {
            toast.success("Đã cập nhật dự án");
        },
        onError: (error) => {
            console.log("Cập nhật dự án thất bại", error);
            toast.error("Không thể cập nhật dự án");
        },
    });

};