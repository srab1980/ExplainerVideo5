'use client';

import { Suspense, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { UserList } from '@/components/UserList';
import { Modal } from '@/components/Modal';
import { UserForm } from '@/components/UserForm';
import { User } from '@/types';

function UserListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage application users and their permissions
          </p>
        </div>
        <Button variant="primary" onClick={handleAddUser}>
          Add New User
        </Button>
      </div>

      {/* User List */}
      <Card title="User Management">
        <Suspense fallback={<UserListSkeleton />}>
          <UserList 
            onEdit={handleEditUser} 
            refreshTrigger={refreshKey}
          />
        </Suspense>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          initialData={editingUser}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}
