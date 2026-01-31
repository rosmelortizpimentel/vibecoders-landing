import { ProfileData } from '@/hooks/useProfileEditor';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Loader2, Check, AlertCircle, ExternalLink, LogOut, ChevronDown } from 'lucide-react';

interface MeHeaderProps {
  profile: ProfileData | null;
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  onSignOut: () => void;
}

// Format name as "FirstName L." where L is the initial of the last name/word
function formatDisplayName(name: string | null | undefined): string {
  if (!name) return 'Usuario';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}

export function MeHeader({ profile, isSaving, lastSaved, error, onSignOut }: MeHeaderProps) {
  const displayName = formatDisplayName(profile?.name);
  const publicProfileUrl = profile?.username ? `/@${profile.username}` : null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <a href="/" className="text-lg font-semibold text-[#1c1c1c] hover:text-[#3D5AFE] transition-colors">
          vibecoders
        </a>
        
        <div className="flex items-center gap-4">
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                <span className="text-gray-500 hidden sm:inline">Guardando...</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500 hidden sm:inline">Error</span>
              </>
            ) : lastSaved ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-gray-500 hidden sm:inline">Guardado</span>
              </>
            ) : null}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20">
                <Avatar className="h-8 w-8 border border-gray-200">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                  <AvatarFallback className="text-xs bg-[#3D5AFE]/10 text-[#3D5AFE] font-medium">
                    {profile?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#1c1c1c] hidden sm:inline">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1c1c1c] border-[#1c1c1c] p-1">
              {publicProfileUrl && (
                <DropdownMenuItem asChild className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                  <a 
                    href={publicProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Ver Perfil Público</span>
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={onSignOut}
                className="flex items-center gap-2 text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
