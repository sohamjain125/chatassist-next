'use client';

// src/app/layout.tsx

import './globals.css'
import { ReactNode, useState, useEffect } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from '@/components/layout/AppLayout';
import { usePathname, useRouter } from 'next/navigation';
import { Footer } from '@/components/ui/footer';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    window.addEventListener('beforeunload', handleRouteChangeStart);
    window.addEventListener('load', handleRouteChangeComplete);

    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
      window.removeEventListener('load', handleRouteChangeComplete);
    };
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <LoadingProvider>
              <Toaster />
              <Sonner />
              <div className="flex flex-col min-h-screen">
                {/* Main Content */}
                <main className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-screen">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isAuthPage ? (
                    children
                  ) : (
                    <AppLayout>
                      {children}
                    </AppLayout>
                  )}
                </main>

                {/* Footer */}
                <Footer />
              </div>
            </LoadingProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
