import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAllMenuItems } from '@/hooks/useSidebarMenu';
import { Loader2 } from 'lucide-react';

/**
 * Wraps dashboard routes and blocks access to paths
 * that are disabled in sidebar_menu_items.
 */
export function MenuRouteGuard() {
  const location = useLocation();
  const { items, isLoading } = useAllMenuItems();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Find if the current path matches any menu item
  const currentPath = location.pathname;
  const menuItem = items.find((item) => {
    if (item.path === '/me') {
      return currentPath === '/me' || currentPath.startsWith('/me/');
    }
    if (item.path === '/apps') {
      return currentPath === '/apps' || currentPath.startsWith('/apps/');
    }
    return currentPath === item.path || currentPath.startsWith(item.path + '/');
  });

  // If we found a matching menu item and it's inactive, redirect to home
  if (menuItem && !menuItem.isActive) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
