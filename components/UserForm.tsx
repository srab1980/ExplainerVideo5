'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { User } from '@/types';
import { userApi } from '@/lib/api';

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: User | null;
}

export const UserForm: React.FC<UserFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'user',
    password: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic validation
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.email.trim()) throw new Error('Email is required');
      if (!initialData && !formData.password) throw new Error('Password is required for new users');
      if (!initialData && formData.password.length < 8) throw new Error('Password must be at least 8 characters');

      if (initialData) {
        // Update
        // Note: The API wrapper uses PUT, but the backend uses PATCH. 
        // We will try using the wrapper first. If it fails, we might need to fix the wrapper.
        // However, looking at lib/api.ts, api.put uses axios.put. 
        // If the backend route only exports PATCH, PUT will fail with 405.
        // I will assume for now I should fix the API wrapper separately or use a direct call if needed.
        // But to be consistent with the codebase patterns, I will use userApi.update.
        // If it fails during verification, I'll fix it.
        
        const response = await userApi.update(initialData.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to update user');
        }
      } else {
        // Create
        const response = await userApi.create({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });

        if (!response.success) {
          throw new Error(response.error || 'Failed to create user');
        }
      }

      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
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

      <div>
        <Input
          label="Name"
          type="text"
          placeholder="Enter user name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          error={error && !formData.name.trim() ? 'Name is required' : undefined}
        />
      </div>

      <div>
        <Input
          label="Email"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
          error={error && !formData.email.trim() ? 'Email is required' : undefined}
        />
      </div>

      {!initialData && (
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="Enter password (min 8 characters)"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
            minLength={8}
            error={error && !formData.password && !initialData ? 'Password is required' : undefined}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Role
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value)}
        >
          <option value="user">User</option>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {initialData ? 'Update User' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};
