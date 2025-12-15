'use client';

import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useTaskStore } from '@/store';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function DashboardPage() {
  const { tasks, completedTasks, loading } = useTaskStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome to your dashboard overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalTasks}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total Tasks
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {completedTasks.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Completed Tasks
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {completionRate}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Completion Rate
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Tasks" className="lg:col-span-2">
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : task.status === 'in-progress'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {task.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.priority === 'urgent'
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : task.priority === 'high'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                        : task.priority === 'medium'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No tasks found. Create your first task to get started.
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/tasks">
              <Button variant="outline">View All Tasks</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-4">
          <Link href="/tasks">
            <Button variant="primary">Create New Task</Button>
          </Link>
          <Link href="/users">
            <Button variant="secondary">Manage Users</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">Settings</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}