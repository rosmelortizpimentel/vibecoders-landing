import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Link } from 'react-router-dom';
import { MapPin, Linkedin, Github, Twitter } from 'lucide-react';

interface Founder {
  display_name: string;
  username: string;
  avatar_url: string;
  tagline: string;
  city: string | null;
  apps_count: number;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

const FoundersMarquee = () => {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFounders = async () => {
      try {
        const { data, error } = await supabase.rpc('get_verified_founders');
        if (error) throw error;
        if (data) setFounders(data as unknown as Founder[]);
      } catch (err) {
        console.error('Error fetching founders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFounders();
  }, []);

  if (loading || founders.length === 0) return null;

  // Double the list for seamless infinite loop
  const duplicatedFounders = [...founders, ...founders, ...founders];

  return (
    <section className="relative w-full bg-[#f8f9fa] py-12 overflow-hidden">
      <div className="container mx-auto px-4 mb-8 text-center">
         <h3 className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-2">Comunidad Activa</h3>
         <p className="text-xl font-bold text-stone-900">Builders lanzando apps reales</p>
      </div>

      <div className="relative flex w-full overflow-hidden group">
        <div className="flex w-fit animate-infinite-marquee whitespace-nowrap py-4 pause-on-hover">
          {duplicatedFounders.map((founder, idx) => (
            <div 
              key={`${founder.username}-${idx}`}
              className="inline-block mx-4 w-80"
            >
              <Link 
                to={`/@${founder.username}`}
                target="_blank"
                className="block w-full rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                    <img 
                      src={founder.avatar_url || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'} 
                      alt={founder.display_name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate">{founder.display_name || founder.username}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 italic mb-2 leading-relaxed h-10 whitespace-normal">
                       {founder.tagline || ""}
                    </p>
                    
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>{founder.city || 'Digital Nomad'}</span>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        {founder.social_links.linkedin && (
                          <Linkedin className="h-3.5 w-3.5 text-gray-400 hover:text-[#0077b5] transition-colors" />
                        )}
                        {founder.social_links.twitter && (
                          <Twitter className="h-3.5 w-3.5 text-gray-400 hover:text-[#1da1f2] transition-colors" />
                        )}
                        {founder.social_links.github && (
                          <Github className="h-3.5 w-3.5 text-gray-400 hover:text-[#333] transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes infinite-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-infinite-marquee {
          animation: infinite-marquee 50s linear infinite;
        }
        .pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default FoundersMarquee;
