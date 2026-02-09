import { Copy, Lock, Globe, MoreVertical, Pencil, Trash2, MessageSquare, Settings, FileCode, Heart, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { type Prompt, INTENT_OPTIONS } from '@/hooks/usePrompts';
import { previewMarkdownText } from '@/lib/markdown';

interface PromptCardProps {
  prompt: Prompt;
  isOwner?: boolean;
  onView: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
}

export function PromptCard({ prompt, isOwner, onView, onEdit, onDelete, onToggleVisibility, onToggleLike }: PromptCardProps & { onToggleLike?: (id: string, isLiked: boolean) => void }) {
  const { t } = useTranslation('prompts');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.description || '');
    toast.success(t('detail.copySuccess'));
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike?.(prompt.id, !!prompt.is_liked);
  };

  const coverImage = prompt.prompt_files?.find(f => f.file_role === 'result_image');
  
  const intentLabel = INTENT_OPTIONS.find(i => i.value === prompt.intent_category)?.label || prompt.intent_category;

  const TypeIcon = {
    'chat_prompt': MessageSquare,
    'system_rule': Settings,
    'file_template': FileCode
  }[prompt.resource_type || 'chat_prompt'];

  return (
    <div
      onClick={() => onView(prompt)}
      className="group relative border border-border/40 rounded-xl bg-card hover:bg-accent/5 hover:border-border/80 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md"
    >
      {/* Cover Image Area */}
      <div className="aspect-video w-full overflow-hidden bg-muted/30 relative">
        {coverImage ? (
          <img 
            src={coverImage.file_url} 
            alt={prompt.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-indigo-500/10">
            <TypeIcon className="h-10 w-10 text-primary/20" />
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
           {prompt.result_url && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 font-medium backdrop-blur-md bg-white/90 hover:bg-white text-black border-none"
                onClick={(e) => { e.stopPropagation(); window.open(prompt.result_url, '_blank'); }}
              >
                 <Globe className="h-3.5 w-3.5" />
                 {t('card.viewDemo')}
              </Button>
           )}
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <Badge className="backdrop-blur-md bg-black/40 hover:bg-black/60 text-white border-white/10 shadow-sm font-normal text-[10px] px-2 h-5">
             {intentLabel}
          </Badge>
          {!prompt.is_public && (
            <Badge variant="secondary" className="backdrop-blur-md bg-black/40 text-white border-white/10 h-5 px-1.5">
               <Lock className="h-3 w-3" />
            </Badge>
          )}
        </div>

        {/* Owner Menu (Top Right) */}
        {isOwner && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
             <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white border-white/10 backdrop-blur-md">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit?.(prompt)}>
                  <Pencil className="h-4 w-4 mr-2" /> {t('card.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleVisibility?.(prompt.id, !prompt.is_public)}>
                  {prompt.is_public ? <Lock className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                  {prompt.is_public ? t('card.makePrivate') : t('card.makePublic')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(prompt.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> {t('card.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground/90 group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>
        </div>

        {/* Footer: Author & Likes */}
        <div className="flex items-center justify-between mt-auto pt-2">
           <div 
             className="flex items-center gap-2 min-w-0 cursor-pointer group/author"
             onClick={(e) => {
               e.stopPropagation();
               if (prompt.profiles?.username) {
                 window.open(`/@${prompt.profiles.username}`, '_blank');
               }
             }}
           >
             <Avatar className="h-8 w-8 border border-border shrink-0 transition-transform group-hover/author:scale-105">
               <AvatarImage src={prompt.profiles?.avatar_url || ''} />
               <AvatarFallback className="text-[10px]">{prompt.profiles?.name?.charAt(0) || '?'}</AvatarFallback>
             </Avatar>
             <div className="flex flex-col overflow-hidden">
               <span className="text-xs font-medium text-foreground/90 truncate group-hover/author:text-primary transition-colors">
                 {prompt.profiles?.name || 'Unknown'}
               </span>
               {prompt.profiles?.username && (
                 <span className="text-[10px] text-muted-foreground/70 truncate group-hover/author:text-muted-foreground transition-colors">
                   @{prompt.profiles.username}
                 </span>
               )}
             </div>
           </div>

           <Button 
             variant="ghost" 
             size="sm" 
             className="h-7 px-2 gap-1.5 hover:bg-red-500/10 hover:text-red-500 transition-colors"
             onClick={handleLike}
           >
             <Heart 
               className={cn("h-3.5 w-3.5 transition-all text-muted-foreground", {
                 "fill-red-500 text-red-500 scale-110": prompt.is_liked
               })} 
             />
             <span className="text-xs font-medium tabular-nums">{prompt.likes_count || 0}</span>
           </Button>
        </div>
      </div>
    </div>
  );
}
