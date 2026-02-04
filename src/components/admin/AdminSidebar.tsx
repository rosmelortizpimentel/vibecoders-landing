import { NavLink } from 'react-router-dom';
import { LayoutGrid, Layers, Settings, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    title: 'Usuarios',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4.5rem)]">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#3D5AFE] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
