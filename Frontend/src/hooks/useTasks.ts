import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api, socket } from '../api/client';

export interface Subtask {
  id: string;
  title: string;
  isComplete: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed';
  subtasks: Subtask[];
  sharedWith: { userId: string; role: string }[];
}

// --- Fetcher Functions ---
const fetchTasks = async () => {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
};

// --- Hook ---
export const useTasks = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  // 1. Fetch Data
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
    enabled: !!userId, // Only fetch if logged in
  });

  // 2. Real-Time Sync
  useEffect(() => {
    if (!userId) return;

    // Connect socket with User ID context
    socket.auth = { userId };
    socket.connect();

    // Listen for updates
    socket.on('update', (event) => {
      console.log('⚡ Real-time update:', event);
      
      // OPTION A: Simple - Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['tasks'] });

      // OPTION B: Advanced - Optimistic updates could happen here
    });

    return () => {
      socket.off('update');
      socket.disconnect();
    };
  }, [userId, queryClient]);

  // 3. Mutations (Actions)
  const createTask = useMutation({
    mutationFn: (newTask: { title: string; priority: string }) => api.post('/tasks', newTask),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }: { id: string;yb: Partial<Task> }) => api.put(`/tasks/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const addSubtask = useMutation({
    mutationFn: ({ taskId, title }: { taskId: string; title: string }) => 
      api.post(`/tasks/${taskId}/subtasks`, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const toggleSubtask = useMutation({
    mutationFn: async ({ taskId, subtasks }: { taskId: string; subtasks: Subtask[] }) => {
        // We update the whole task or specific subtask endpoint depending on backend impl.
        // Based on provided backend, we use PUT /tasks/:id to update the subtasks array
        return api.put(`/tasks/${taskId}`, { subtasks });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const shareTask = useMutation({
    mutationFn: ({ taskId, email, role }: { taskId: string; email: string; role: string }) =>
      api.post(`/tasks/${taskId}/share`, { email, role }),
  });

  return { query, createTask, updateTask, addSubtask, toggleSubtask, shareTask };
};