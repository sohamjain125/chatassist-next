import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {  Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StickyHeader from './StickyHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import MenuIcon from '../icons/MenuIcon';
import DashboardIcon from '../icons/DashboardIcon';
import SearchIcon from '../icons/SearchIcon';
import HistoryIcon from '../icons/HistoryIcon';
// Sidebar toggle button component
const SidebarToggle = () => {
  const { toggleSidebar, state } = useSidebar();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-2 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5 " />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {state === 'expanded' ? 'Close sidebar' : 'Open sidebar'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const pathname = usePathname();


  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: DashboardIcon
    },
    {
      name: 'Options',
      href: '#',
      icon: MenuIcon,
      subItems: [
        { name: 'Search', href: '/search', icon: SearchIcon },
        { name: 'History', href: '/history', icon: HistoryIcon }
      ]
    }
  ];

  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);

  const toggleSubItems = (itemName: string) => {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar className="fixed top-0 left-0 h-screen z-40 w-64">
          <SidebarHeader className="flex h-14  border-b px-4">
            <Link href="/dashboard" className="flex  gap-2 font-semibold">
            
              <FontAwesomeIcon
                icon={faBuilding}
                style={{ color: "#4c95bb", fontSize: "20px" }}
              />
              <span className="text-xl font-bold text-black">AddressHub</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <div className="flex flex-col gap-2 font-semibold">
                    <SidebarMenuButton
                      asChild={!item.subItems}
                      isActive={pathname === item.href}
                      tooltip={item.name}
                      onClick={item.subItems ? () => toggleSubItems(item.name) : undefined}
                    >
                      {item.subItems ? (
                        <div className="flex items-center justify-between w-full cursor-pointer">
                          <div className="flex items-center gap-3">
                            <item.icon />
                            <span className='text-lg text-black'>{item.name}</span>
                          </div>
                          <ChevronDown 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedItem === item.name ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      ) : (
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon />
                          <span className='text-lg text-black'>{item.name}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.subItems && expandedItem === item.name && (
                      <div className="ml-6 flex flex-col gap-1">
                        {item.subItems.map((subItem) => (
                          <SidebarMenuButton
                            key={subItem.name}
                            asChild
                            isActive={pathname === subItem.href}
                            tooltip={subItem.name}
                          >
                            <Link href={subItem.href} className="flex items-center gap-3">
                              <subItem.icon  />
                              <span className='text-base text-black'>{subItem.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        ))}
                      </div>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
         
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300">
          <StickyHeader>
            <SidebarToggle />
          </StickyHeader>
          <main className="flex-1 pt-14 px-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
