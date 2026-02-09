import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrompts, type Prompt, INTENT_OPTIONS } from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ChevronLeft, Copy, Download, Edit, Globe, 
  ExternalLink, Calendar, User, ImageIcon, FileText,
  MessageSquare, Settings, FileCode, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { parseMarkdown } from '@/lib/markdown';
import { extractPromptVariables } from '@/utils/promptUtils';
import { useAuth } from '@/hooks/useAuth';

export default function PromptViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('prompts');
  const { user } = useAuth();
  
  // We need to fetch a specific prompt. 
  // Currently usePrompts fetches lists. For now we can filter from lists, 
  // but ideally we'd have a usePrompt(id) hook.
  // We'll use the lists for now as they are likely cached.
  const { publicPrompts, myPrompts, isLoadingPublic, isLoadingMine } = usePrompts();
  
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to find in cached lists
    const found = [...myPrompts, ...publicPrompts].find(p => p.id === id);
    if (found) {
      setPrompt(found);
      setLoading(false);
    } else {
      // If not found in lists (e.g. direct link and not fully loaded), 
      // wait until loading finishes to decide it's 404
      if (!isLoadingPublic && !isLoadingMine) {
        setLoading(false);
      }
    }
  }, [id, myPrompts, publicPrompts, isLoadingPublic, isLoadingMine]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background container max-w-screen-2xl mx-auto p-8 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-lg">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Prompt Not Found</h1>
        <Button onClick={() => navigate('/prompts')}>Return to Vault</Button>
      </div>
    );
  }

  const isOwner = user?.id === prompt.user_id;
  const variables = extractPromptVariables(prompt.description || '');
  const resultImages = (prompt.prompt_files || []).filter(f => f.file_role === 'result_image');
  const attachments = (prompt.prompt_files || []).filter(f => !f.file_role || f.file_role === 'attachment');

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.description || '');
    toast.success(t('detail.copySuccess'));
  };

  const formattedDate = new Date(prompt.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const intentLabel = INTENT_OPTIONS.find(i => i.value === prompt.intent_category)?.label || prompt.intent_category;

  const TypeIcon = {
    'chat_prompt': MessageSquare,
    'system_rule': Settings,
    'file_template': FileCode
  }[prompt.resource_type || 'chat_prompt'];

  return (
    <div className="min-h-screen bg-background flex flex-col">
       {/* Top Navigation */}
       <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-screen-2xl mx-auto h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/prompts')} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t('title') || 'Vault'}
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1.5 px-2">
                 <TypeIcon className="h-3 w-3" />
                 <span className="capitalize">{prompt.resource_type?.replace('_', ' ') || 'Prompt'}</span>
              </Badge>
              <h1 className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
                {prompt.title}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" onClick={handleCopy} className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
              <Copy className="h-3.5 w-3.5" />
              {prompt.resource_type === 'system_rule' ? 'Copy Rule' : 'Copy Prompt'}
            </Button>
            {isOwner && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/prompts/${prompt.id}/edit`)}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                {t('card.edit')}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
           
           {/* Left Panel: Metadata - 30% */}
           <div className="lg:col-span-4 xl:col-span-3 space-y-6">
             <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-6 sticky top-20">
                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={prompt.profiles?.avatar_url || ''} />
                    <AvatarFallback>{prompt.profiles?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{prompt.profiles?.name || prompt.profiles?.username}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {formattedDate}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Intent & Compatibility */}
                <div className="space-y-4">
                   <div className="space-y-1.5">
                      <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Intent</h4>
                      <Badge className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                         {intentLabel}
                      </Badge>
                   </div>
                   
                   {prompt.tool_compatibility && prompt.tool_compatibility.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Works With</h4>
                        <div className="flex flex-wrap gap-1.5">
                           {prompt.tool_compatibility.map(tool => (
                             <Badge key={tool} variant="secondary" className="font-normal text-xs">
                               {tool}
                             </Badge>
                           ))}
                        </div>
                      </div>
                   )}
                </div>

                {/* Tags */}
                {prompt.tags && prompt.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {prompt.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="font-normal text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filename for Rules */}
                {prompt.resource_type === 'system_rule' && prompt.filename && (
                   <div className="bg-muted/50 rounded-lg p-3 border border-border/50 space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target File</p>
                      <code className="text-sm font-mono block text-foreground">{prompt.filename}</code>
                   </div>
                )}

                {/* Variables List */}
                {variables.length > 0 && (
                   <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 space-y-3">
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {t('detail.variables') || 'Variables'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {variables.map(v => (
                          <code key={v} className="bg-background border border-border px-2 py-1 rounded text-xs font-mono text-primary">
                            {v}
                          </code>
                        ))}
                      </div>
                   </div>
                )}
             </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                   <h3 className="font-medium mb-3 flex items-center gap-2">
                     <FileText className="h-4 w-4" />
                     {t('detail.attachments')}
                   </h3>
                   <div className="space-y-2">
                      {attachments.map(f => (
                        <a
                          key={f.id}
                          href={f.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2 hover:bg-muted transition-colors border border-transparent hover:border-border"
                        >
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate flex-1">{f.file_name}</span>
                          <Download className="h-3 w-3 text-muted-foreground" />
                        </a>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* Right Panel: Content - 70% */}
           <div className="lg:col-span-8 xl:col-span-9 space-y-8">
              
              {/* Main Content Card */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="border-b border-border bg-muted/30 px-6 py-3 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {prompt.resource_type === 'system_rule' ? 'Configuration Rule' : 'Resource Content'}
                      </span>
                      {prompt.filename && (
                        <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">{prompt.filename}</code>
                      )}
                   </div>
                   <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 hover:bg-primary/10 hover:text-primary">
                      <Copy className="h-3 w-3 mr-1.5" />
                      Copy Content
                   </Button>
                </div>
                <div className="p-6 md:p-8"> 
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none font-mono text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(prompt.description || '') }}
                    />
                </div>
              </div>

              {/* Results Section */}
              {(prompt.result_url || resultImages.length > 0) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    {t('detail.results') || 'Results & Evidence'}
                  </h3>
                  
                  {/* Live Link */}
                  {prompt.result_url && (
                    <a 
                      href={prompt.result_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors shadow-sm">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                               <Globe className="h-5 w-5" />
                            </div>
                            <div>
                               <h4 className="font-medium flex items-center gap-2">
                                 Live Demo 
                                 <Badge variant="secondary" className="text-[10px] h-5">Verificable</Badge>
                               </h4>
                               <p className="text-xs text-muted-foreground truncate max-w-[300px] sm:max-w-md">
                                 {prompt.result_url}
                               </p>
                            </div>
                         </div>
                         <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </a>
                  )}

                  {/* Image Grid */}
                  {resultImages.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {resultImages.map(img => (
                        <div key={img.id} className="group relative aspect-video rounded-xl border border-border bg-muted overflow-hidden shadow-sm">
                           <img 
                             src={img.file_url} 
                             alt="Result" 
                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                           />
                           <a 
                             href={img.file_url} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                           >
                              <Button variant="secondary" size="sm" className="backdrop-blur-md">
                                 View Fullscreen
                              </Button>
                           </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
