'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, LogOut, UserCircle } from 'lucide-react';
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
import { UserInfo } from '@/interface/user.interface';


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
  const [userInfo, setUserInfo] = useState<UserInfo>({ firstname: '', lastname: '', email: '' });
  const { state: sidebarState } = useSidebar();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
      if (token) {
        try {
          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (data.success) {
            setUserInfo(data.user);
          }
        } catch (error) {
          console.error('Error fetching user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

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
              <h1 className="text-xl font-semibold truncate">{title || 'Demo City Council'}</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-4">
          <span className="text-m text-gray-600 font-semibold hidden md:block">
            {userInfo.firstname} {userInfo.lastname}
          </span>
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="inline-flex items-center justify-center h-8 w-8 rounded-full  cursor-pointer hover:text-white">
                      <UserIcon className="h-5 w-5 hover:text-white" />
                      <span className="sr-only">User menu</span>
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userInfo.firstname} {userInfo.lastname}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userInfo.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <UserCircle className="mr-2 h-4 w-4 hover:text-white" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
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
};

export default StickyHeader;
