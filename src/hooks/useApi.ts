import { useLoading } from '@/contexts/LoadingContext';
import { useCallback } from 'react';

interface ApiOptions {
  loadingText?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi() {
  const { startLoading, stopLoading } = useLoading();

  const callApi = useCallback(async <T>(
    apiFunction: () => Promise<T>,
    options: ApiOptions = {}
  ): Promise<T | null> => {
    const { loadingText = 'Loading...', onSuccess, onError } = options;

    try {
      startLoading(loadingText);
      const data = await apiFunction();
      onSuccess?.(data);
      return data;
    } catch (error) {
      onError?.(error);
      return null;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return { callApi };
} 