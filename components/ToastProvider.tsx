'use client';

import { useAppStore } from '@/store';
import { ToastContainer } from './Toast';

export function ToastProvider() {
  const toasts = useAppStore((state) => state.toasts);
  const removeToast = useAppStore((state) => state.removeToast);

  return <ToastContainer toasts={toasts} onClose={removeToast} />;
}
