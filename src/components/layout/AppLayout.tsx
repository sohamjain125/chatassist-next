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
import StickyHeader from './StickyHeader';

// Sidebar toggle button component
const SidebarToggle = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleSidebar}
      className="mr-2"
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
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
    // { name: 'Search', href: '/search', icon: Building2 },
    // { name: 'History', href: '/history', icon: History },
    // { name: 'Chatbot', href: '/chatbot', icon: MessageSquare },
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
    
    return { title: titles[pathname] || 'AddressHub' };
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar className="fixed top-0 left-0 h-screen z-40 w-64">
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-6 w-6" />
              <span className="text-xl font-bold">AddressHub</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.name}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <Menu className="h-5 w-5" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0 transition-[padding-left] duration-300">
          <StickyHeader {...getHeaderProps()}>
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
