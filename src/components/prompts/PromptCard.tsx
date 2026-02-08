import { Copy, Lock, Globe, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
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
import type { Prompt } from '@/hooks/usePrompts';
import { previewMarkdownText } from '@/lib/markdown';

interface PromptCardProps {
  prompt: Prompt;
  isOwner?: boolean;
  onView: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string, isPublic: boolean) => void;
}

export function PromptCard({ prompt, isOwner, onView, onEdit, onDelete, onToggleVisibility }: PromptCardProps) {
  const { t } = useTranslation('prompts');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.description || '');
    toast.success(t('detail.copySuccess'));
  };

  return (
    <div
      onClick={() => onView(prompt)}
      className="group relative border border-border rounded-xl p-4 bg-card hover:bg-accent/5 transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm line-clamp-2 flex-1">{prompt.title}</h3>
        {isOwner ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit?.(prompt)}>
                <Pencil className="h-4 w-4 mr-2" /> {t('card.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleVisibility?.(prompt.id, !prompt.is_public)}>
                {prompt.is_public ? <Lock className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                {t('card.toggleVisibility')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(prompt.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> {t('card.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy} title={t('card.copy')}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Preview */}
      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
        {previewMarkdownText(prompt.description || '', 150)}
      </p>

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {prompt.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
              {tag}
            </Badge>
          ))}
          {prompt.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">+{prompt.tags.length - 3}</Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {prompt.tool_used && (
            <Badge variant="secondary" className="text-[10px]">{prompt.tool_used}</Badge>
          )}
          {isOwner && (
            <Badge variant={prompt.is_public ? 'default' : 'outline'} className="text-[10px]">
              {prompt.is_public ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
              {prompt.is_public ? t('card.public') : t('card.private')}
            </Badge>
          )}
        </div>
        {prompt.profiles && (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-5 w-5">
              <AvatarImage src={prompt.profiles.avatar_url || ''} />
              <AvatarFallback className="text-[8px]">{prompt.profiles.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
              {prompt.profiles.username || prompt.profiles.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
