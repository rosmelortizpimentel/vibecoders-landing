import { useNavigate, useLocation } from 'react-router-dom';
import { User, Layers, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User, path: '/me/profile' },
  { id: 'apps', label: 'Apps', icon: Layers, path: '/me/apps' },
  { id: 'branding', label: 'Branding', icon: Palette, path: '/me/branding' },
];

export function MeTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id || 'profile';

  return (
    <div className="inline-flex gap-1 p-1.5 bg-slate-100/80 rounded-full">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm transition-all duration-200',
              isActive
                ? 'bg-white text-slate-900 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-[#3D5AFE]" : "text-slate-400"
            )} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
