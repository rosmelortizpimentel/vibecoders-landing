import { useNavigate, useLocation } from 'react-router-dom';
import { User, Palette } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export function MeTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation('profile');
  
  const tabs = [
    { id: 'profile', label: t.tabs.profile, icon: User, path: '/me/profile' },
    { id: 'branding', label: t.tabs.branding, icon: Palette, path: '/me/branding' },
  ];
  
  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id || 'profile';

  return (
    <div className="flex w-full overflow-x-auto gap-1 p-1.5 bg-slate-100/80 rounded-full scrollbar-hide">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-full text-sm transition-all duration-200 flex-1 sm:flex-none whitespace-nowrap',
              isActive
                ? 'bg-white text-slate-900 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-[#3D5AFE]" : "text-slate-400"
            )} />
            <span className="hidden min-[420px]:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
