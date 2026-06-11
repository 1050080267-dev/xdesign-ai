import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateProject = () => {
    const router = useRouter();
    return useMutation({
        mutationFn: async (prompt: string) =>
            await axios.post("/api/project", {
                prompt,
            })
                .then((res) => res.data),
        onSuccess: (data) => {
            router.push(`/project/${data.data.id}`)
        },
        onError: (error) => {
            console.log("Project failed", error);
            toast.error("Failed to create project");
        },
    });

};


// export const useGetProjects = (userId?: string) => {
//     return useQuery({
//         queryKey:["projects"],
//         queryFn: async () => {
//           const res = await axios.get("/api/project");
//           return res.data.data;
//         },
//         enabled: !! userId,
//     });
// };

export const useGetProjects = (userId?: string) => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: async () => {
            const res = await axios.get("/api/project");
            return res.data.data;
        },
        enabled: !!userId,

        // 🔥 realtime gần như instant
        refetchInterval: 3000,

        // quay tab lại là load
        refetchOnWindowFocus: true,

        // tránh cache quá lâu
        staleTime: 0,
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) =>
            await axios.delete(`/api/project/${id}`).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"], exact: false });
            toast.success("Đã xóa dự án");
        },
        onError: () => {
            toast.error("Xóa dự án thất bại");
        },
    });
};

export const useRenameProject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) =>
            await axios.put(`/api/project/${id}`, { name }).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Đã đổi tên dự án");
        },
        onError: () => {
            toast.error("Đổi tên thất bại");
        },
    });
};

// export const useSearchProjects = (userId?: string, search?: string) => {
//     return useQuery({
//         queryKey: ["projects", search],
//         queryFn: async () => {
//             const res = await axios.get(`/api/project?search=${search || ""}`);
//             return res.data.data;
//         },
//         enabled: !!userId,
//     });
// };

export const useSearchProjects = (
    userId?: string,
    search?: string
) => {
    return useQuery({
        queryKey: ["projects", search],
        queryFn: async () => {
            const res = await axios.get(
                `/api/project?search=${search || ""}`
            );
            return res.data.data;
        },
        enabled: !!userId,

        // 🔥 realtime auto update
        refetchInterval: 2000,
        refetchOnWindowFocus: true,
        staleTime: 0,
    });
};
export const useUpdateFrame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ frameId, htmlContent }: { frameId: string; htmlContent: string }) =>
            await axios.put(`/api/frame/${frameId}`, { htmlContent }).then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Đã lưu thay đổi!");
        },
        onError: () => {
            toast.error("Lưu thất bại!");
        },
    });
};

export const useGetMembers = (projectId: string) => {
    return useQuery({
        queryKey: ["members", projectId],
        queryFn: async () => {
            const res = await axios.get(`/api/project/${projectId}/members`);
            return res.data.data;
        },
        enabled: !!projectId,
    });
};

export const useInviteMember = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ email, role }: { email: string; role: string }) =>
            await axios.post(`/api/project/${projectId}/members`, { email, role })
                .then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", projectId] });
            toast.success("Đã mời thành viên!");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || "Mời thất bại");
        },
    });
};

export const useRemoveMember = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (memberId: string) =>
            await axios.delete(`/api/project/${projectId}/members/${memberId}`)
                .then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", projectId] });
            toast.success("Đã xóa thành viên!");
        },
        onError: () => {
            toast.error("Xóa thành viên thất bại");
        },
    });
};

export const useUpdateMemberRole = (projectId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ memberId, role }: { memberId: string; role: string }) =>
            await axios.patch(`/api/project/${projectId}/members/${memberId}`, { role })
                .then((res) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["members", projectId] });
            toast.success("Đã cập nhật quyền!");
        },
        onError: () => {
            toast.error("Cập nhật quyền thất bại");
        },
    });
};

export const useExportFlutter = () => {
    return useMutation({
        mutationFn: async (frameId: string) =>
            await axios.post(`/api/frame/${frameId}/flutter`)
                .then(res => res.data),
        onError: () => {
            toast.error("Xuất Flutter thất bại!");
        },
    });
};

// export const useDeleteFrame = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: async (frameId: string) =>
//             await axios.delete(`/api/frame/${frameId}`).then(res => res.data),
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ["projects"] });
//             toast.success("Đã xóa giao diện!");
//         },
//         onError: () => {
//             toast.error("Xóa giao diện thất bại!");
//         },
//     });
// };

export const useDeleteFrame = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (frameId: string) =>
            await axios.delete(`/api/frame/${frameId}`)
                .then(res => ({
                    ...res.data,
                    frameId, // giữ id để remove local state
                })),

        onSuccess: (data) => {
            // refresh project hiện tại
            queryClient.invalidateQueries({
                queryKey: ["project"],
                exact: false,
            });

            queryClient.invalidateQueries({
                queryKey: ["projects"],
                exact: false,
            });

            toast.success("Đã xóa giao diện!");
        },

        onError: () => {
            toast.error("Xóa giao diện thất bại!");
        },
    });
};

export const useGetEditLogs = (frameId: string) => {
    return useQuery({
        queryKey: ["edit-logs", frameId],
        queryFn: async () => {
            const res = await axios.get(`/api/frame/${frameId}/edit-log`);
            return res.data.data;
        },
        enabled: !!frameId,
    });
};

export const useAddEditLog = (frameId: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            projectId: string;
            action: string;
            element: string;
            selector?: string;
            oldValue?: string;
            newValue: string;
        }) => await axios.post(`/api/frame/${frameId}/edit-log`, data).then(res => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["edit-logs", frameId] });
        },
    });
};