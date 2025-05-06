'use client';

// src/app/layout.tsx

import './globals.css'
import { ReactNode } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from '@/components/layout/AppLayout';
import { usePathname } from 'next/navigation';
import { Footer } from '@/components/ui/footer';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              {/* Header */}
              <header className="w-full border-b bg-background">
                {/* Your header content will go here */}
              </header>

              {/* Main Content */}
              <main className="flex-grow pb-20">
                {isAuthPage ? (
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
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
