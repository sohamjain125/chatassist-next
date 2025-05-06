'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Loading } from '@/components/ui/loading';

interface LoadingContextType {
  isLoading: boolean;
  loadingText: string;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const startLoading = useCallback((text = 'Loading...') => {
    setLoadingText(text);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingText, startLoading, stopLoading }}>
      {children}
      {isLoading && <Loading fullScreen text={loadingText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 