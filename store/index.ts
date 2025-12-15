// Global State Management using Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Task, AppState, AppActions } from '@/types';

// Initial state
const initialState: Omit<AppState, keyof AppActions> = {
  user: null,
  tasks: [],
  loading: false,
  error: null,
  theme: 'light',
};

// Create the store with persistence
export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,
      
      // User actions
      setUser: (user: User | null) => set({ user }),
      
      // Task actions
      setTasks: (tasks: Task[]) => set({ tasks }),
      addTask: (task: Task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      updateTask: (id: string, updates: Partial<Task>) => set((state) => ({
        tasks: state.tasks.map((task) => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        ),
      })),
      deleteTask: (id: string) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
      
      // UI state actions
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Theme actions
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      // Utility actions
      reset: () => set(initialState),
      clearTasks: () => set({ tasks: [] }),
      
      // Computed getters (selectors)
      getCompletedTasks: () => get().tasks.filter((task) => task.status === 'completed'),
      getPendingTasks: () => get().tasks.filter((task) => task.status === 'pending'),
      getTasksByPriority: (priority: Task['priority']) => 
        get().tasks.filter((task) => task.priority === priority),
      getTaskById: (id: string) => get().tasks.find((task) => task.id === id),
      isAuthenticated: () => !!get().user,
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        tasks: state.tasks,
      }),
    }
  )
);

// Custom hooks for specific state slices
export const useUserStore = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  
  return { user, setUser, isAuthenticated };
};

export const useTaskStore = () => {
  const tasks = useAppStore((state) => state.tasks);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const setTasks = useAppStore((state) => state.setTasks);
  const addTask = useAppStore((state) => state.addTask);
  const updateTask = useAppStore((state) => state.updateTask);
  const deleteTask = useAppStore((state) => state.deleteTask);
  const setLoading = useAppStore((state) => state.setLoading);
  const setError = useAppStore((state) => state.setError);
  const clearError = useAppStore((state) => state.clearError);
  
  const completedTasks = useAppStore((state) => state.getCompletedTasks());
  const pendingTasks = useAppStore((state) => state.getPendingTasks());
  
  return {
    tasks,
    loading,
    error,
    completedTasks,
    pendingTasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    setLoading,
    setError,
    clearError,
  };
};

export const useThemeStore = () => {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  
  return { theme, toggleTheme };
};

export default useAppStore;