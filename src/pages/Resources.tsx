import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { parseMarkdown } from '@/lib/markdown';
import { 
  Calendar,
  User,
  Loader2,
  Trash2,
  Image as ImageIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Upload,
  X,
  Link as LinkIcon,
  FileText,
  Heart,
  MessageCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Paperclip,
  Edit2
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { NaturalEditor } from '@/components/resources/NaturalEditor';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DownloadUrl {
  label: string;
  url: string;
}

interface Resource {
  id: string;
  content: string;
  media_urls: string[];
  download_urls: { label: string; url: string }[];
  author_id: string;
  created_at: string;
  updated_at?: string;
  author_name?: string;
  author_avatar?: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  comments_list: Comment[];
}

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

const isValidUrl = (url: string) => {
  if (!url) return false;
  try {
    // Add protocol if missing for validation purposes
    const urlToTest = url.match(/^[a-zA-Z]+:\/\//) ? url : `https://${url}`;
    const parsed = new URL(urlToTest);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
};

const ensureExternalUrl = (url: string) => {
  if (!url) return url;
  const trimmedUrl = url.trim();
  if (trimmedUrl.match(/^[a-zA-Z]+:\/\//)) return trimmedUrl;
  return `https://${trimmedUrl}`;
};

interface ResourceRow {
  id: string;
  content: string;
  media_urls: string[];
  download_urls: { label: string; url: string }[];
  author_id: string;
  created_at: string;
  updated_at?: string;
  status: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  resource_likes: { user_id: string }[];
  resource_comments: { 
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    profiles: {
      name: string | null;
      avatar_url: string | null;
    } | null;
  }[];
}


export default function Resources() {
  const { t } = useTranslation('common');
  
  // Helper to parse text and wrap links
  const LinkifiedText = ({ text }: { text: string }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
      <>
        {parts.map((part, i) => 
          urlRegex.test(part) ? (
            <a 
              key={i} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#3D5AFE] hover:underline break-all"
            >
              {part}
            </a>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const PostContent = ({ content, expanded, onToggle }: { content: string, expanded: boolean, onToggle: () => void }) => {
    const isLong = content.length > 280;
    
    if (!isLong) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-[#1c1c1c] leading-relaxed whitespace-pre-wrap">
          <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
        </div>
      );
    }

    return (
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-[#1c1c1c] leading-relaxed whitespace-pre-wrap">
        {expanded ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
            <button 
              onClick={onToggle}
              className="text-gray-400 hover:text-primary font-medium block mt-2"
            >
              {t('resources.showingLess')}
            </button>
          </>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: parseMarkdown(content.slice(0, 280) + '...') }} />
            <button 
              onClick={onToggle}
              className="text-gray-400 hover:text-primary font-medium mt-1"
            >
              {t('resources.showingMore')}
            </button>
          </>
        )}
      </div>
    );
  };
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // Post Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Resource | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorMedia, setEditorMedia] = useState<string[]>([]);
  const [editorDownloads, setEditorDownloads] = useState<DownloadUrl[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const { user } = useAuth();
  const { setHeaderContent } = usePageHeader();

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="font-semibold">{t('navigation.resources')}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent, t]);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      // Fetch resources and join with profiles, likes and comments
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          profiles:author_id (
            name,
            avatar_url
          ),
          resource_likes (user_id),
          resource_comments (
            id,
            user_id,
            content,
            created_at,
            profiles:user_id (
              name,
              avatar_url
            )
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rows = data as unknown as ResourceRow[];

      const formattedData = (rows || []).map((r) => ({
        id: r.id,
        content: r.content,
        media_urls: r.media_urls,
        download_urls: r.download_urls,
        author_id: r.author_id,
        created_at: r.created_at,
        updated_at: r.updated_at,
        author_name: r.profiles?.name || 'Vibecoder',
        author_avatar: r.profiles?.avatar_url || undefined,
        likes_count: r.resource_likes?.length || 0,
        comments_count: r.resource_comments?.length || 0,
        is_liked: r.resource_likes?.some(like => like.user_id === currentUser?.id),
        comments_list: (r.resource_comments || []).sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      })) as Resource[];

      setResources(formattedData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error al cargar el feed');
    } finally {
      setLoading(false);
    }
  }, []); // Remove user dependency to stabilize identity

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const toggleLike = async (resourceId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reaccionar');
      return;
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    const isLiking = !resource.is_liked;

    // Optimistic UI
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, is_liked: isLiking, likes_count: r.likes_count + (isLiking ? 1 : -1) }
        : r
    ));

    try {
      if (isLiking) {
        await supabase.from('resource_likes').insert({ resource_id: resourceId, user_id: user.id });
      } else {
        await supabase.from('resource_likes').delete().eq('resource_id', resourceId).eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Rollback
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, is_liked: !isLiking, likes_count: r.likes_count + (isLiking ? -1 : 1) }
          : r
      ));
    }
  };

  const handleCommentSubmit = async (resourceId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para comentar');
      return;
    }

    const content = newComment[resourceId]?.trim();
    if (!content) return;

    if (content.length > 250) {
      toast.error('El comentario no puede exceder los 250 caracteres');
      return;
    }

    setIsSubmittingComment(prev => ({ ...prev, [resourceId]: true }));

    try {
      const { data, error } = await supabase
        .from('resource_comments')
        .insert({
          resource_id: resourceId,
          user_id: user.id,
          content
        })
        .select(`
          id,
          user_id,
          content,
          created_at,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              comments_count: r.comments_count + 1,
              comments_list: [...r.comments_list, data as Comment]
            }
          : r
      ));
      setNewComment(prev => ({ ...prev, [resourceId]: '' }));
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Error al publicar comentario');
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [resourceId]: false }));
    }
  };

  const handleDeleteComment = async (resourceId: string, commentId: string) => {
    try {
      const { error } = await supabase
        .from('resource_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { 
              ...r, 
              comments_count: r.comments_count - 1,
              comments_list: r.comments_list.filter(c => c.id !== commentId)
            }
          : r
      ));
      toast.success('Comentario eliminado');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error al eliminar el comentario');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const newMediaUrls = [...editorMedia];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `resource_${timestamp}_${i}.${ext}`;
      
      const { error } = await supabase.storage
        .from('resources')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error('Upload error:', error);
        toast.error(`Error al subir imagen: ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      newMediaUrls.push(urlData.publicUrl);
    }

    setEditorMedia(newMediaUrls);
    setUploadingMedia(false);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const handleResourceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingResource(true);
    const newDownloads = [...editorDownloads];

    for (let i = 0; i < files.length; i++) {
       const file = files[i];
       
       // Size check: 25MB
       if (file.size > 25 * 1024 * 1024) {
         toast.error(`${t('resources.fileTooLarge')}: ${file.name}`);
         continue;
       }

       // Dangerous file check
       const dangerousExtensions = ['exe', 'msi', 'bat', 'sh', 'com', 'cmd', 'vbs', 'js', 'jar'];
       const ext = file.name.split('.').pop()?.toLowerCase();
       if (ext && dangerousExtensions.includes(ext)) {
         toast.error(`${t('resources.invalidFileType')}: ${file.name}`);
         continue;
       }

       const timestamp = Date.now();
       const fileName = `resource_file_${timestamp}_${i}.${ext}`;
       
       const { error } = await supabase.storage
         .from('resources')
         .upload(fileName, file, { upsert: true });

       if (error) {
         console.error('Upload error:', error);
         toast.error(`Error al subir archivo: ${file.name}`);
         continue;
       }

       const { data: urlData } = supabase.storage
         .from('resources')
         .getPublicUrl(fileName);

       newDownloads.push({
         label: file.name,
         url: urlData.publicUrl
       });
    }

    setEditorDownloads(newDownloads);
    setUploadingResource(false);
    if (resourceInputRef.current) resourceInputRef.current.value = '';
  };

  const handleSavePost = async () => {
    if (!user) return;
    if (!editorContent.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }

    // Validation and cleanup for downloads
    const dirtyDownloads = [...editorDownloads];
    const cleanedDownloads = dirtyDownloads.map(d => ({
      ...d,
      url: ensureExternalUrl(d.url)
    }));

    const hasInvalidDownload = cleanedDownloads.some(d => !d.url || !isValidUrl(d.url));
    if (hasInvalidDownload) {
      toast.error('Todos los recursos deben tener una URL válida (ej: google.com)');
      return;
    }

    setIsProcessing(true);
    try {
      if (editingPost) {
        const { error } = await supabase
          .from('resources')
          .update({
            content: editorContent,
            media_urls: editorMedia,
            download_urls: cleanedDownloads,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Publicación actualizada');
      } else {
        const { error } = await supabase
          .from('resources')
          .insert({
            content: editorContent,
            media_urls: editorMedia,
            download_urls: cleanedDownloads,
            author_id: user.id,
            status: 'published'
          });

        if (error) throw error;
        toast.success('Publicación creada');
      }
      setIsEditorOpen(false);
      resetEditor();
      fetchResources();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Error al guardar la publicación');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    const postId = postToDelete;

    try {
      // Manual cascade just in case DB doesn't have it
      await supabase.from('resource_likes').delete().eq('resource_id', postId);
      await supabase.from('resource_comments').delete().eq('resource_id', postId);
      
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      
      setResources(prev => prev.filter(r => r.id !== postId));
      toast.success('Publicación eliminada');
      setPostToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Error al eliminar la publicación');
    }
  };

  const openEdit = (post: Resource) => {
    setEditingPost(post);
    setEditorContent(post.content);
    setEditorMedia(post.media_urls || []);
    setEditorDownloads(post.download_urls || []);
    setIsEditorOpen(true);
  };

  const resetEditor = () => {
    setEditingPost(null);
    setEditorContent('');
    setEditorMedia([]);
    setEditorDownloads([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Create Post Bar */}
      {user && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 shrink-0 border border-gray-100 shadow-sm">
              <AvatarImage src={user.user_metadata?.avatar_url || user.user_metadata?.picture} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => { resetEditor(); setIsEditorOpen(true); }}
              className="flex-1 bg-gray-50 hover:bg-gray-100 text-left px-4 rounded-full text-sm text-gray-500 transition-colors"
            >
              {t('resources.placeholder')}
            </button>
            <Button
              onClick={() => { resetEditor(); setIsEditorOpen(true); }}
              variant="ghost"
              size="icon"
              className="text-[#3D5AFE] hover:bg-[#3D5AFE]/5"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      {resources.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hay publicaciones todavía.</p>
        </div>
      ) : (
        resources.map((resource) => (
          <article key={resource.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Post Header */}
            <div className="p-4 flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage src={resource.author_avatar} alt={resource.author_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {resource.author_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col flex-1">
                <span className="font-semibold text-sm text-[#1c1c1c]">{resource.author_name}</span>
                <div className="flex items-center text-[10px] text-gray-500 gap-1 whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(resource.created_at), 'dd MMM, yyyy HH:mm', { locale: es })}
                  {resource.updated_at && (new Date(resource.updated_at).getTime() - new Date(resource.created_at).getTime() > 60000) && (
                    <span className="text-gray-400 italic">{t('resources.edited')}</span>
                  )}
                </div>
              </div>

              {user?.id === resource.author_id && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-auto">
                    <DropdownMenuItem onClick={() => openEdit(resource)} className="gap-2 cursor-pointer whitespace-nowrap">
                      <Pencil className="h-4 w-4" /> {t('resources.editPost')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setPostToDelete(resource.id)} 
                      className="gap-2 text-red-600 focus:text-red-700 cursor-pointer whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4" /> {t('resources.deletePost')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            <div className="px-4 py-2">
              <PostContent 
                content={resource.content} 
                expanded={expandedPosts[resource.id]} 
                onToggle={() => toggleExpand(resource.id)} 
              />
            </div>

            {/* Media Gallery */}
            {resource.media_urls && resource.media_urls.length > 0 && (
              <div className={cn(
                "mt-3 grid gap-0.5 border-y border-gray-100 bg-gray-50/50",
                resource.media_urls.length === 1 ? "grid-cols-1" : 
                resource.media_urls.length === 2 ? "grid-cols-2" : "grid-cols-2"
              )}>
                {resource.media_urls.map((url, i) => (
                  <div key={i} 
                    className={cn(
                      "relative group cursor-pointer overflow-hidden flex items-center justify-center mx-auto",
                      resource.media_urls.length === 1 
                        ? "w-[75%] min-h-[200px] max-h-[700px] rounded-2xl" 
                        : "aspect-square",
                      resource.media_urls.length === 3 && i === 0 ? "row-span-2" : ""
                    )}
                    onClick={() => {
                      setLightboxImages(resource.media_urls);
                      setCurrentLightboxIndex(i);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={url} 
                      alt={`Post media ${i}`} 
                      className={cn(
                        "transition-transform duration-500 group-hover:scale-[1.02]",
                        resource.media_urls.length === 1 
                          ? "w-full h-auto object-contain max-h-[700px]" 
                          : "w-full h-full object-cover"
                      )}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Download Links */}
            {resource.download_urls && resource.download_urls.length > 0 && (
              <div className="p-4 pt-4 border-t border-gray-50 space-y-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Recursos</h4>
                <div className="flex flex-wrap gap-2">
                  {resource.download_urls.map((download, i) => (
                    <a 
                      key={i}
                      href={download.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-[#3D5AFE]/5 text-[#3D5AFE] px-3 py-1.5 rounded-full text-xs font-medium border border-[#3D5AFE]/10 hover:bg-[#3D5AFE]/10 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      {download.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Footer */}
            <div className="p-2 border-t border-gray-50 flex items-center justify-around">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleLike(resource.id)}
                className={cn(
                  "flex-1 h-9 gap-2 transition-all duration-200",
                  resource.is_liked 
                    ? "text-[#3D5AFE] hover:bg-[#3D5AFE]/5" 
                    : "text-gray-500 hover:text-[#3D5AFE] hover:bg-gray-100"
                )}
              >
                <Heart className={cn("h-4 w-4 transition-transform active:scale-125", resource.is_liked && "fill-current")} />
                <span className="text-xs font-medium">{resource.likes_count > 0 ? resource.likes_count : ''} Me gusta</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowComments(prev => ({ ...prev, [resource.id]: !prev[resource.id] }))}
                className="text-gray-500 hover:text-[#3D5AFE] hover:bg-gray-100 gap-2 flex-1 h-9 transition-all duration-200"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{resource.comments_count > 0 ? resource.comments_count : ''} Comentar</span>
              </Button>
            </div>

            {/* Comments Section */}
            {showComments[resource.id] && (
              <div className="p-4 bg-gray-50/50 border-t border-gray-50 space-y-4">
                {/* Comment List */}
                <div className="space-y-4">
                  {resource.comments_list.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                          {comment.profiles?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm relative group">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <span className="font-semibold text-xs text-[#1c1c1c] whitespace-nowrap">{comment.profiles?.name || 'Vibecoder'}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-gray-400 whitespace-nowrap">
                              {format(new Date(comment.created_at), 'dd MMM, HH:mm', { locale: es })}
                            </span>
                            {user?.id === comment.user_id && (
                              <button
                                onClick={() => handleDeleteComment(resource.id, comment.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 shrink-0"
                                title="Eliminar comentario"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-3 pt-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="relative">
                      <Textarea
                        placeholder="Escribe un comentario..."
                        className="min-h-[60px] text-xs resize-none bg-white border-gray-200 focus:border-primary/50 focus:ring-primary/10 rounded-xl"
                        value={newComment[resource.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [resource.id]: e.target.value }))}
                        maxLength={250}
                      />
                      <span className={cn(
                        "absolute bottom-2 right-2 text-[9px]",
                        (newComment[resource.id]?.length || 0) > 240 ? "text-red-500 font-bold" : "text-gray-400"
                      )}>
                        {newComment[resource.id]?.length || 0}/250
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        className="h-7 text-[10px] bg-[#3D5AFE] hover:bg-[#3D5AFE]/90"
                        disabled={!newComment[resource.id]?.trim() || isSubmittingComment[resource.id]}
                        onClick={() => handleCommentSubmit(resource.id)}
                      >
                        {isSubmittingComment[resource.id] ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                        Comentar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))
      )}

      {/* Post Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{editingPost ? t('resources.editPost') : t('resources.createPost')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-0 flex flex-col">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <Label>{t('resources.content')}</Label>
                <div className="border rounded-lg overflow-hidden min-h-[300px] flex flex-col focus-within:ring-2 focus-within:ring-[#3D5AFE]/20 transition-all">
                  <NaturalEditor 
                    value={editorContent} 
                    onChange={setEditorContent} 
                    placeholder={t('resources.placeholder')}
                    className="flex-1 border-none rounded-none"
                    minHeight="min-h-[300px]"
                  />
                </div>
              </div>

              {/* Media Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('resources.media')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => mediaInputRef.current?.click()}
                    disabled={uploadingMedia}
                    className="h-8 text-xs"
                  >
                    {uploadingMedia ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    {t('resources.addMedia')}
                  </Button>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {editorMedia.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {editorMedia.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border shadow-sm bg-gray-50 flex items-center justify-center">
                        <img 
                          src={url} 
                          alt={`Media ${index}`} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setEditorMedia(prev => prev.filter((_, i) => i !== index))}
                            className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md transition-all transform hover:scale-110"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {editorMedia.length === 0 && !uploadingMedia && (
                      <div className="text-center py-6 border-2 border-dashed rounded-lg text-muted-foreground text-xs bg-muted/20">
                        {t('resources.noMedia')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground text-xs bg-muted/20">
                    {t('resources.noMedia')}
                  </div>
                )}
              </div>

              {/* Downloads Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>{t('resources.downloadsTitle') || t('resources.downloads')}</Label>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase">{t('resources.maxSize')} 25MB</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => resourceInputRef.current?.click()}
                      disabled={uploadingResource}
                      className="h-8 text-xs bg-[#3D5AFE]/5 text-[#3D5AFE] border-[#3D5AFE]/20 hover:bg-[#3D5AFE]/10"
                    >
                      {uploadingResource ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Paperclip className="h-3 w-3 mr-1" />}
                      {t('resources.addFile')}
                    </Button>
                    <input
                      ref={resourceInputRef}
                      type="file"
                      multiple
                      onChange={handleResourceUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditorDownloads(prev => [...prev, { label: '', url: '' }])}
                      className="h-8 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t('resources.addLink')}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {editorDownloads.map((link, index) => (
                    <div key={index} className="flex gap-2 items-start bg-muted/20 p-3 rounded-lg border">
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <input
                            placeholder="Nombre del archivo"
                            className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm"
                            value={link.label}
                            onChange={(e) => {
                              const newLinks = [...editorDownloads];
                              newLinks[index].label = e.target.value;
                              setEditorDownloads(newLinks);
                            }}
                          />
                        </div>
                        <div className="space-y-1 relative">
                          <LinkIcon className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            placeholder="https://..."
                            className="flex h-8 w-full rounded-md border border-input bg-background pl-7 pr-3 py-1 text-xs shadow-sm"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...editorDownloads];
                              newLinks[index].url = e.target.value;
                              setEditorDownloads(newLinks);
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditorDownloads(prev => prev.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsEditorOpen(false)} disabled={isProcessing}>
              {t('resources.cancel')}
            </Button>
            <Button 
              onClick={handleSavePost} 
              disabled={isProcessing || uploadingMedia}
              className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingPost ? t('resources.saveChanges') : t('resources.publish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox Dialog */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 bg-black/95 border-none flex flex-col items-center justify-center gap-0">
          <div className="absolute top-4 right-4 z-50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLightboxOpen(false)}
              className="text-white hover:bg-white/10 rounded-full h-10 w-10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="relative w-full h-full flex items-center justify-center group/lightbox">
            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentLightboxIndex(prev => (prev - 1 + lightboxImages.length) % lightboxImages.length);
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-0 group-hover/lightbox:opacity-100"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentLightboxIndex(prev => (prev + 1) % lightboxImages.length);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 text-white/50 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all opacity-0 group-hover/lightbox:opacity-100"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={lightboxImages[currentLightboxIndex]}
                alt={`Image ${currentLightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain pointer-events-none select-none animate-in fade-in zoom-in duration-300"
              />
            </div>

            {lightboxImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
                {lightboxImages.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      i === currentLightboxIndex ? "bg-white scale-125" : "bg-white/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Deletion Confirm Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resources.deletePostTitle', 'Eliminar publicación')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('resources.deletePostDescription', '¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('resources.cancel', 'Cancelar')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('resources.deletePost', 'Eliminar publicación')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
