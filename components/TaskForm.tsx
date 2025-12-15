import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { useTaskStore } from '@/store';
import { Task } from '@/types';
import { api } from '@/lib/api';

interface TaskFormProps {
  onSuccess?: () => void;
  initialData?: Partial<Task>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSuccess, initialData }) => {
  const { addTask } = useTaskStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium' as Task['priority'],
    assigneeId: initialData?.assignee?.id || '',
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user makes changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      // Create task data
      const taskData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };

      // Try to create via API first, fallback to local state
      try {
        const response = await api.post<Task>('/api/tasks', taskData);
        if (response.success && response.data) {
          addTask(response.data);
        } else {
          throw new Error(response.error || 'Failed to create task');
                }
              } catch {
                // Fallback to local task creation if API fails
                const newTask: Task = {
                  id: Date.now().toString(),
                  ...taskData as Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        addTask(newTask);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigneeId: '',
        dueDate: '',
      });

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-lg dark:bg-red-900/20 dark:text-red-400 dark:border-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Title"
            type="text"
            placeholder="Enter task title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
            error={error && !formData.title.trim() ? 'Title is required' : undefined}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 resize-none"
            rows={3}
            placeholder="Enter task description (optional)"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!formData.title.trim()}
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};