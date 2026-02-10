import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BadgeCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getStatusColors } from '@/lib/appStatusColors';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useFavicon } from '@/hooks/useFavicon';

interface ShowcaseApp {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  url: string;
  is_verified: boolean;
  founder_username: string;
  founder_avatar_url: string;
  status: {
    name: string;
    slug: string;
  } | null;
  stacks: {
    id: string;
    name: string;
    logo_url: string;
  }[] | null;
}

const AppsShowcase = () => {
  const { data: apps, isLoading } = useQuery({
    queryKey: ['showcase-apps'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_showcase_apps');
      if (error) throw error;
      
      // Map keys if the user is using an older version of the SQL function
      const mappedData = (data as any[]).map(item => ({
        ...item,
        name: item.app_name || item.name || 'Sin nombre',
        tagline: item.app_tagline || item.tagline || '', 
        logo_url: item.app_logo_url || item.logo_url,
        founder_username: item.founder_handle || item.founder_username || item.founder_handle, // Normalizar username
      }));
      
      return mappedData as ShowcaseApp[];
    },
  });

  if (isLoading) return null;
  if (!apps || apps.length === 0) return null;

  // Triple the list for seamless infinite loop
  const duplicatedApps = [...apps, ...apps, ...apps];

  return (
    <section className="py-24 px-4 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-2 tracking-tight uppercase">
            Construido con VibeCoders
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto text-sm md:text-base font-medium">
            Software real lanzado por la comunidad
          </p>
        </div>

        <div className="relative flex w-full overflow-hidden group">
          <div className="flex w-fit animate-apps-marquee whitespace-nowrap py-4 pause-on-hover px-4">
            {duplicatedApps.map((app, idx) => (
              <div 
                key={`${app.id}-${idx}`}
                className="inline-block mx-4 w-80"
              >
                <Link 
                  to={`/@${app.founder_handle || app.founder_username}`}
                  target="_blank"
                  className="block w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full min-h-[160px]"
                >
                  <div className="flex items-start gap-4">
                    {/* App Logo */}
                    <div className="h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm bg-stone-50">
                      {app.logo_url ? (
                        <img 
                          src={app.logo_url} 
                          alt={app.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-bold text-xl uppercase">
                          {app.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="font-bold text-gray-900 truncate tracking-tight">{app.name}</h4>
                        {app.is_verified && (
                          <BadgeCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </div>

                      {/* Tagline */}
                      <p className="text-xs text-gray-500 line-clamp-2 italic mb-2 leading-relaxed h-10 whitespace-normal">
                         {app.tagline || ""}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        {/* Stacks */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {app.stacks?.slice(0, 3).map(stack => (
                            <div key={stack.id} className="w-5 h-5 flex items-center justify-center grayscale opacity-60 hover:opacity-100 transition-opacity">
                              <img src={stack.logo_url} alt={stack.name} className="w-full h-full object-contain" title={stack.name} />
                            </div>
                          ))}
                        </div>

                        {/* Founder Avatar */}
                        <div className="h-6 w-6 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                          <img 
                            src={app.founder_avatar_url || '/placeholder-avatar.png'} 
                            alt={app.founder_username || app.founder_handle} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes apps-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-apps-marquee {
          animation: apps-marquee 50s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default AppsShowcase;
