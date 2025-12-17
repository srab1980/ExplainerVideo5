'use client';

import { Suspense, useState, useMemo } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { TaskFilters, TaskFilterState } from '@/components/TaskFilters';
import { Modal } from '@/components/Modal';
import { useTaskStore } from '@/store';
import { filterAndSortTasks, DEFAULT_FILTERS } from '@/lib/taskFilters';
import { Task } from '@/types';

function TaskListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

export default function TasksPage() {
  const { tasks, loading } = useTaskStore();
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<TaskFilterState>(DEFAULT_FILTERS);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Apply filters and sorting
  const filteredTasks = useMemo(() => {
    return filterAndSortTasks(tasks, filters);
  }, [tasks, filters]);

  const handleFilterChange = (newFilters: Partial<TaskFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your tasks and track progress
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add New Task'}
        </Button>
      </div>

      {/* Task Form */}
      {showForm && (
        <Card title="Create New Task">
          <TaskForm onSuccess={() => setShowForm(false)} />
        </Card>
      )}

      {/* Task Filters */}
      <Card>
        <TaskFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          taskCount={tasks.length}
          filteredCount={filteredTasks.length}
        />
      </Card>

      {/* Task List */}
      <Card title="Task List">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Suspense fallback={<TaskListSkeleton />}>
            <TaskList 
              tasks={filteredTasks} 
              onTaskEdit={handleEditTask}
            />
          </Suspense>
        )}
      </Card>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        title="Edit Task"
      >
        <TaskForm
          initialData={editingTask || undefined}
          onSuccess={handleEditSuccess}
          onCancel={handleEditModalClose}
        />
      </Modal>
    </div>
  );
}