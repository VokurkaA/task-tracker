import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {api} from '../lib/api';
import {Priority, type Task} from '../types';

export const useTasks = () => {
    return useQuery({
        queryKey: ['tasks'], queryFn: async () => {
            const {data} = await api.get<Task[]>('/tasks');
            return data;
        },
    });
};

export const useCreateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newTask: {
            title: string; description?: string; category: string; priority?: Priority; subtasks?: string[]; // Added
        }) => {
            const {data} = await api.post<Task>('/tasks', newTask);
            return data;
        }, onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });
};

export const useUpdateTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, updates}: { id: string; updates: Partial<Task> }) => {
            const {data} = await api.put(`/tasks/${id}`, updates);
            return data;
        }, onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });
};

export const useAddSubtask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({taskId, title}: { taskId: string; title: string }) => {
            const {data} = await api.post(`/tasks/${taskId}/subtasks`, {title});
            return data;
        }, onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });
};

export const useShareTask = () => {
    return useMutation({
        mutationFn: async ({taskId, email, role}: { taskId: string; email: string; role: string }) => {
            const {data} = await api.post(`/tasks/${taskId}/share`, {email, role});
            return data;
        },
    });
};

export const useRespondToInvite = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({taskId, accept}: { taskId: string; accept: boolean }) => {
            const {data} = await api.post(`/tasks/${taskId}/invite`, {accept});
            return data;
        }, onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });
};

export const useDeleteTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (taskId: string) => {
            const {data} = await api.delete(`/tasks/${taskId}`);
            return data;
        }, onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['tasks']});
        },
    });
};