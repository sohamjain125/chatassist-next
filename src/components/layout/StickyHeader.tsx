'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, LogOut, UserCircle, Loader2 } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserIcon from '../icons/UserIcon';
import { StickyHeaderProps } from '@/interface/header.interface';
import { useUser } from '@/hooks/useUser';

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
  const { state: sidebarState } = useSidebar();
  const { user, isLoading, error, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (isLoading) {
    return (
      <header className="fixed top-0 right-0 z-50 bg-white border-b h-14 transition-[left] duration-300">
        <div className="flex items-center justify-between h-full px-4 w-full">
          <div className="flex items-center space-x-4 min-w-0">
            {children}
            <span>Loading user...</span>
          </div>
        </div>
      </header>
    );
  }

  if (error || !user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 right-0 z-50 bg-white border-b h-14 transition-[left] duration-300 ${
        sidebarState === 'expanded' ? 'left-64' : 'left-16'
      }`}
    >
      <div className="flex items-center justify-between h-full px-4 w-full">
        <div className="flex items-center space-x-4 min-w-0">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Go back</span>
            </Button>
          )}
          {children}
          {title && (
            <div className="truncate">
              <h1 className="text-lg font-semibold">{title}</h1>
              {address && (
                <p className="text-sm text-gray-500 truncate">
                  {address}, {suburb}, {state} {postcode}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-m text-gray-600 font-semibold hidden md:block">
            {user.firstname} {user.lastname}
          </span>
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu open={isLoggingOut || isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                <DropdownMenuTrigger asChild disabled={isLoggingOut}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="inline-flex items-center justify-center h-8 w-8 rounded-full cursor-pointer hover:text-white" disabled={isLoggingOut}>
                      <UserIcon className="h-5 w-5 hover:text-white" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstname} {user.lastname}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')} disabled={isLoggingOut}>
                    <UserCircle className="mr-2 h-4 w-4 hover:text-white" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="relative"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
                        <span>Logging out...</span>
                      </>
                    ) : (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <TooltipContent>
                Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}

export default StickyHeader;
