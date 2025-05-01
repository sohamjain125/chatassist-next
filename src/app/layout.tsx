'use client';

// src/app/layout.tsx

import './globals.css'
import { ReactNode } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from '@/components/layout/AppLayout';

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppLayout>
              {children}
            </AppLayout>
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
