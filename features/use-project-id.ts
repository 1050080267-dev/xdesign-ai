import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";


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