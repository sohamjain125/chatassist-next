'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, User, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StickyHeaderProps {
  title?: string;
  address?: string;
  suburb?: string;
  state?: string;
  postcode?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
}

const StickyHeader: React.FC<StickyHeaderProps> = ({ 
  title, 
  address, 
  suburb, 
  state, 
  postcode,
  children,
  showBackButton = false
}) => {
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const { state: sidebarState } = useSidebar();

  useEffect(() => {
    // Only access localStorage on the client side
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    localStorage.removeItem('userName');
    router.push('/login');
  };

  return (
    <header className={`fixed top-0 right-0 z-50 bg-white border-b h-14 transition-[left] duration-300 ${sidebarState === 'expanded' ? 'left-64' : 'left-0'}`}>
      <div className="flex items-center justify-between h-full px-4 w-full">
        <div className="flex items-center space-x-4 min-w-0">
          {children}
          
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="mr-2 shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          )}
          
          {address ? (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{address}</h1>
              <p className="text-sm text-gray-500 truncate">
                {suburb}{state && `, ${state}`}{postcode && ` ${postcode}`}
              </p>
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold truncate">{title || 'AddressHub'}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-sm text-gray-600 hidden md:block">Welcome, {userName}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Welcome to AddressHub
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default StickyHeader;
