import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';
import { Button } from '@/components/ui/button';
import { Globe, LogIn } from 'lucide-react';

interface AppDetailHeaderProps {
  appName: string | null;
  appTagline: string | null;
  logoUrl: string | null;
}

export function AppDetailHeader({ appName, appTagline, logoUrl }: AppDetailHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 md:h-16 items-center justify-between gap-4">
          {/* Left side - App branding */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* App Logo */}
            <div className="flex-shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={appName || 'App'}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Globe className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* App Name & Tagline */}
            <div className="min-w-0 flex-1">
              <h1 className="font-semibold text-sm md:text-base truncate">
                {appName || 'Untitled App'}
              </h1>
              {appTagline && (
                <p className="text-xs text-muted-foreground truncate max-w-[180px] md:max-w-[300px] lg:max-w-none">
                  {appTagline}
                </p>
              )}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex-shrink-0">
            {user ? (
              <UserMenu />
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/">
                  <LogIn className="w-4 h-4 mr-2 hidden sm:block" />
                  <span className="hidden sm:inline">Entrar</span>
                  <LogIn className="w-4 h-4 sm:hidden" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
