import { Copy, Download, FileIcon, Globe, ExternalLink, ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/hooks/useTranslation';
import { parseMarkdown } from '@/lib/markdown';
import { toast } from 'sonner';
import type { Prompt } from '@/hooks/usePrompts';
import { Link } from 'react-router-dom';
import { extractPromptVariables } from '@/utils/promptUtils';

interface PromptDetailModalProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PromptDetailModal({ prompt, open, onOpenChange }: PromptDetailModalProps) {
  const { t } = useTranslation('prompts');

  if (!prompt) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.description || '');
    toast.success(t('detail.copySuccess'));
  };

  const files = prompt.prompt_files || [];
  const attachments = files.filter(f => !f.file_role || f.file_role === 'attachment');
  const resultImages = files.filter(f => f.file_role === 'result_image');
  
  const variables = extractPromptVariables(prompt.description || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl">{prompt.title}</DialogTitle>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            {prompt.tool_used && <Badge variant="secondary">{prompt.tool_used}</Badge>}
            {prompt.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          {/* Result Gallery */}
          {resultImages.length > 0 && (
            <div className="mb-6 space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-primary">
                <ImageIcon className="h-4 w-4" />
                {t('detail.results') || 'Results Preview'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {resultImages.map(img => (
                  <div key={img.id} className="rounded-lg overflow-hidden border border-border bg-muted/50">
                    <img 
                      src={img.file_url} 
                      alt="Result preview" 
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          {prompt.profiles && (
            <div className="flex items-center gap-2 mb-4">
              <Avatar className="h-6 w-6">
                <AvatarImage src={prompt.profiles.avatar_url || ''} />
                <AvatarFallback className="text-xs">{prompt.profiles.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {t('detail.by')}{' '}
                <Link
                  to={prompt.profiles.username ? `/@${prompt.profiles.username}` : '#'}
                  className="font-medium text-foreground hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  {prompt.profiles.name || prompt.profiles.username}
                </Link>
              </span>
            </div>
          )}

          {/* Variables Section */}
          {variables.length > 0 && (
            <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <span className="text-xs font-medium text-primary uppercase tracking-wider mb-2 block">
                {t('detail.variables') || 'Required Variables'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {variables.map(variable => (
                  <Badge key={variable} variant="secondary" className="font-mono text-xs border-primary/20 text-primary">
                    [{variable}]
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-sm dark:prose-invert max-w-none mb-4 bg-muted/30 p-4 rounded-lg border border-border"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(prompt.description || '') }}
          />

          {/* Live Result Button */}
          {prompt.result_url && (
            <div className="mb-6">
               <a 
                 href={prompt.result_url} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block"
               >
                 <Button variant="outline" className="w-full gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary">
                   <Globe className="h-4 w-4" />
                   {t('detail.viewLive') || 'View Live Result'}
                   <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                 </Button>
               </a>
            </div>
          )}

          {/* Attachments */}
          {attachments.length > 0 && (
            <>
              <Separator className="my-4" />
              <h4 className="text-sm font-medium mb-2">{t('detail.attachments')}</h4>
              <div className="space-y-1.5">
                {attachments.map(f => (
                  <a
                    key={f.id}
                    href={f.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2 hover:bg-muted transition-colors"
                  >
                    <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate flex-1">{f.file_name}</span>
                    <span className="text-xs text-muted-foreground">{formatSize(f.file_size)}</span>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <Button onClick={handleCopy} className="w-full gap-2">
            <Copy className="h-4 w-4" />
            {t('detail.copyButton')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
