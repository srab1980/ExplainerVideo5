import { useAppStore } from '@/store';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requireAuth: boolean = false) {
  const router = useRouter();
  const { user, isAuthenticated, login, logout } = useAppStore();
  const authenticated = isAuthenticated();

  useEffect(() => {
    if (requireAuth && !authenticated) {
      router.push('/login');
    }
  }, [requireAuth, authenticated, router]);

  return {
    user,
    isAuthenticated: authenticated,
    login,
    logout,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}
