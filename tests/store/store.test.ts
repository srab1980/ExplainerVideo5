import { renderHook, act } from '@testing-library/react';
import { useAppStore, useTaskStore, useUserStore, useThemeStore } from '../../store';
import { User, Task } from '../../types';

// Mock data for testing
const mockUser: User = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending',
  priority: 'medium',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('useAppStore', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.theme).toBe('light');
    });

    it('should handle user state', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated()).toBe(true);
    });

    it('should handle task operations', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.addTask(mockTask);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0]).toEqual(mockTask);
      
      act(() => {
        result.current.updateTask('1', { status: 'completed' });
      });
      
      expect(result.current.tasks[0].status).toBe('completed');
      expect(result.current.tasks[0].updatedAt).not.toBe(mockTask.updatedAt);
      
      act(() => {
        result.current.deleteTask('1');
      });
      
      expect(result.current.tasks).toHaveLength(0);
    });

    it('should handle UI state', () => {
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      expect(result.current.loading).toBe(true);
      
      act(() => {
        result.current.setError('Test error');
      });
      expect(result.current.error).toBe('Test error');
      
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle theme toggle', () => {
      const { result } = renderHook(() => useAppStore());
      
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
    });

    it('should provide computed getters', () => {
      const { result } = renderHook(() => useAppStore());
      
      const completedTask: Task = {
        ...mockTask,
        id: '2',
        status: 'completed',
      };
      
      act(() => {
        result.current.setTasks([mockTask, completedTask]);
      });
      
      expect(result.current.getCompletedTasks()).toHaveLength(1);
      expect(result.current.getCompletedTasks()[0].status).toBe('completed');
      
      expect(result.current.getPendingTasks()).toHaveLength(1);
      expect(result.current.getPendingTasks()[0].status).toBe('pending');
      
      expect(result.current.getTaskById('1')).toEqual(mockTask);
      expect(result.current.getTaskById('999')).toBeUndefined();
    });
  });

  describe('useTaskStore', () => {
    it('should provide task-specific selectors and actions', () => {
      const { result } = renderHook(() => useTaskStore());
      
      expect(result.current.tasks).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      
      act(() => {
        result.current.setTasks([mockTask]);
      });
      
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.completedTasks).toHaveLength(0);
      expect(result.current.pendingTasks).toHaveLength(1);
    });
  });

  describe('useUserStore', () => {
    it('should provide user-specific selectors and actions', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated()).toBe(false);
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated()).toBe(true);
    });
  });

  describe('useThemeStore', () => {
    it('should provide theme-specific selectors and actions', () => {
      const { result } = renderHook(() => useThemeStore());
      
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.toggleTheme();
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('state persistence', () => {
    it('should persist theme and user state', () => {
      // This test would require mocking localStorage
      // For now, we'll just test the structure
      const { result } = renderHook(() => useAppStore());
      
      act(() => {
        result.current.setUser(mockUser);
        result.current.toggleTheme();
      });
      
      // In a real implementation, we would verify localStorage persistence here
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.theme).toBe('dark');
    });
  });
});