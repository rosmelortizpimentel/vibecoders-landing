import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminProfile {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface AdminLayoutProps {
  profile: AdminProfile | null;
  onSignOut: () => void;
}

export function AdminLayout({ profile, onSignOut }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <AuthenticatedHeader
        profile={profile}
        onSignOut={onSignOut}
      />
      
      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <AdminSidebar 
            isCollapsed={isCollapsed} 
            onToggle={() => setIsCollapsed(!isCollapsed)} 
          />
        )}

        {/* Mobile Header Toggle */}
        {isMobile && (
          <div className="absolute left-4 top-4 z-40">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shadow-md bg-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <AdminSidebar 
                  isCollapsed={false} 
                  onToggle={() => {}} 
                  onCloseMobile={() => setIsMobileMenuOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        )}

        <main className="flex-1 flex flex-col min-h-0 p-4 md:p-6 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
