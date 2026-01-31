import { User, Layers, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'apps', label: 'Apps', icon: Layers },
  { id: 'branding', label: 'Branding', icon: Palette },
];

export function MeTabs({ activeTab, onTabChange }: MeTabsProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all',
              isActive
                ? 'bg-[#3D5AFE] text-white shadow-sm font-semibold'
                : 'text-gray-600 hover:text-[#1c1c1c] hover:bg-white'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
