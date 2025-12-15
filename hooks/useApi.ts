import { useEffect, useState, useCallback } from 'react';
import { ApiResponse } from '@/types';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: unknown[]) => Promise<ApiResponse<T>>;
  reset: () => void;
}

export function useApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: unknown[]): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
        return response;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return response;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}

// Hook for fetching data with polling
export function usePollingApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
  interval: number = 30000,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const { immediate = false, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: unknown[]): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
        return response;
      } else {
        const errorMessage = response.error || 'An error occurred';
        setError(errorMessage);
        onError?.(errorMessage);
        return response;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  useEffect(() => {
    if (!immediate) return;
    
    const intervalId = setInterval(() => {
      execute();
    }, interval);

    return () => clearInterval(intervalId);
  }, [execute, interval, immediate]);

  return { data, loading, error, execute, reset };
}