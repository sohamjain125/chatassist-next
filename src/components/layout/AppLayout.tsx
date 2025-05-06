import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Map, MessageSquare, Menu, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
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
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
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
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Map },
  ];

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  // Get current page properties for header
  const getHeaderProps = () => {
    // Don't add property data in AppLayout for property page
    // The Property component will handle its own header
    if (pathname === '/property') {
      return { title: 'Property Details' };
    }
    
    // For other pages, customize the title based on the path
    const titles: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/search': 'Search Properties',
      '/chatbot': 'AI Assistant',
      '/history': 'Property History',
      '/property': 'Property Details'
    };
    
    return { title: titles[pathname ?? ''] || 'AddressHub' };
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar className="fixed top-0 left-0 h-screen z-40 w-64">
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              {/* <Building2 className="h-6 w-6" /> */}
              <FontAwesomeIcon
                icon={faBuilding}
                style={{ color: "#4c95bb", fontSize: "24px" }}
              />
              <span className="text-xl font-bold">AddressHub</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <div className="flex items-center gap-2 font-semibold">
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className='text-lg'>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  </div>
                  
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
         
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300">
          <StickyHeader {...getHeaderProps()}>
            <SidebarToggle />
          </StickyHeader>
          <main className="flex-1 pt-14 px-6 pb-24">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
