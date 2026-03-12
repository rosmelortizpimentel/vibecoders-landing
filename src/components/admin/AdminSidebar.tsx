import { NavLink } from 'react-router-dom';
import { LayoutGrid, Layers, Settings, Users, Mail, Cpu, MessageCircle, ChevronLeft, ChevronRight, Menu, Bell, ClipboardList, AppWindow, PanelLeft, Key, Mic, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const menuItems = [
  {
    title: 'Showcases',
    href: '/admin/showcase',
    icon: LayoutGrid,
  },
  {
    title: 'Stack',
    href: '/admin/stack',
    icon: Layers,
  },
  {
    title: 'Tech Stacks',
    href: '/admin/tech-stacks',
    icon: Cpu,
  },
  {
    title: 'Feedback',
    href: '/admin/feedback',
    icon: MessageCircle,
  },
  {
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Waitlist',
    href: '/admin/waitlist',
    icon: Mail,
  },
  {
    title: 'Notificaciones',
    href: '/admin/notifications',
    icon: Bell,
  },
  {
    title: 'Apps',
    href: '/admin/apps',
    icon: AppWindow,
  },
  {
    title: 'Surveys',
    href: '/admin/surveys',
    icon: ClipboardList,
  },
  {
    title: 'Menú',
    href: '/admin/menu',
    icon: PanelLeft,
  },
  {
    title: 'Planes y Features',
    href: '/admin/plans-features',
    icon: Key,
  },
  {
    title: 'Ponentes',
    href: '/admin/speakers',
    icon: Mic,
  },
  {
    title: 'Talleres',
    href: '/admin/workshops',
    icon: Calendar,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCloseMobile?: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle, onCloseMobile }: AdminSidebarProps) {
  const isMobile = useIsMobile();

  return (
    <aside 
      className={cn(
        "border-r border-gray-200 bg-gray-50 h-full transition-all duration-300 relative flex flex-col",
        isMobile ? "w-64" : isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Desktop Toggle Button */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-6 bg-white border border-border rounded-full p-1.5 shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}

      <nav className={cn("flex-1 p-4 space-y-1", isCollapsed && !isMobile && "px-3")}>
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={() => isMobile && onCloseMobile?.()}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isCollapsed && !isMobile ? "justify-center" : "",
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isCollapsed && !isMobile ? "" : "mr-1")} />
            {(!isCollapsed || isMobile) && (
              <span className="truncate">{item.title}</span>
            )}
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && !isMobile && (
              <div className="absolute left-16 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                {item.title}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
