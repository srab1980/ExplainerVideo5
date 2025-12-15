import { Metadata } from 'next';
import { Suspense } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { useTaskStore } from '@/store';
import { useState } from 'react';

export const metadata: Metadata = {
  title: 'Tasks - Next.js App',
  description: 'Manage your tasks efficiently.',
};

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
  const { loading } = useTaskStore();
  const [showForm, setShowForm] = useState(false);

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

      {/* Task List */}
      <Card title="Task List">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <Suspense fallback={<TaskListSkeleton />}>
            <TaskList />
          </Suspense>
        )}
      </Card>
    </div>
  );
}