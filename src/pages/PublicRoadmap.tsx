import { useState, useEffect, useRef, useCallback } from 'react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { detectedSubdomain, isCustomDomain } from '@/utils/domain';
import { useRoadmapFeedback, RoadmapLane, RoadmapCard, RoadmapSettings, RoadmapFeedback, RoadmapFeedbackAttachment } from '@/hooks/useRoadmap';
import { useFavicon } from '@/hooks/useFavicon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, ThumbsUp, MessageSquare, Paperclip, X, Send, Calendar, Heart, Link2, LogIn, ChevronLeft, ChevronRight, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { generateDeviceFingerprint } from '@/lib/deviceFingerprint';

interface AppInfo {
  id: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  reviewed: 'bg-purple-100 text-purple-700',
  planned: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  en: { new: 'New', reviewed: 'Reviewed', planned: 'Planned', in_progress: 'In Progress', done: 'Done', declined: 'Declined' },
  es: { new: 'Nuevo', reviewed: 'Revisado', planned: 'Planeado', in_progress: 'En Progreso', done: 'Hecho', declined: 'Rechazado' },
  fr: { new: 'Nouveau', reviewed: 'Examiné', planned: 'Planifié', in_progress: 'En Cours', done: 'Terminé', declined: 'Refusé' },
  pt: { new: 'Novo', reviewed: 'Revisado', planned: 'Planejado', in_progress: 'Em Progresso', done: 'Feito', declined: 'Recusado' },
};

const UI_LABELS: Record<string, Record<string, string>> = {
  en: {
    feedback: 'Feedback', submit: 'Submit Suggestion', title: 'Title', titlePh: 'Brief summary of your idea',
    desc: 'Description', descPh: 'Describe your suggestion in detail...', name: 'Your Name', namePh: 'Optional',
    email: 'Your Email', emailPh: 'Optional', attachments: 'Attachments', attachHint: 'Max 5 files, 5MB each (images or PDFs)',
    send: 'Submit', success: 'Thank you for your feedback!', error: 'Error submitting feedback',
    noFeedback: 'No suggestions yet. Be the first!', likes: 'likes', reply: 'Developer Response',
    empty: 'This roadmap is empty for now', notFound: 'Roadmap not found', poweredBy: 'Powered by',
    addFile: 'Add file', cancel: 'Cancel',
    loginRequired: 'Login Required', loginDesc: 'Sign in to submit feedback or vote',
    continueGoogle: 'Continue with Google', continueLinkedin: 'Continue with LinkedIn',
  },
  es: {
    feedback: 'Feedback', submit: 'Enviar Sugerencia', title: 'Título', titlePh: 'Resumen breve de tu idea',
    desc: 'Descripción', descPh: 'Describe tu sugerencia en detalle...', name: 'Tu Nombre', namePh: 'Opcional',
    email: 'Tu Email', emailPh: 'Opcional', attachments: 'Adjuntos', attachHint: 'Máximo 5 archivos, 5MB cada uno',
    send: 'Enviar', success: '¡Gracias por tu feedback!', error: 'Error al enviar el feedback',
    noFeedback: 'No hay sugerencias aún. ¡Sé el primero!', likes: 'me gusta', reply: 'Respuesta del Desarrollador',
    empty: 'Este roadmap está vacío por ahora', notFound: 'Roadmap no encontrado', poweredBy: 'Potenciado por',
    addFile: 'Agregar archivo', cancel: 'Cancelar',
    loginRequired: 'Inicio de Sesión Requerido', loginDesc: 'Inicia sesión para enviar feedback o votar',
    continueGoogle: 'Continuar con Google', continueLinkedin: 'Continuar con LinkedIn',
  },
  fr: {
    feedback: 'Feedback', submit: 'Soumettre une Suggestion', title: 'Titre', titlePh: 'Résumé bref',
    desc: 'Description', descPh: 'Décrivez votre suggestion...', name: 'Votre Nom', namePh: 'Optionnel',
    email: 'Votre Email', emailPh: 'Optionnel', attachments: 'Pièces Jointes', attachHint: 'Max 5 fichiers, 5 Mo chacun',
    send: 'Envoyer', success: 'Merci pour votre retour !', error: "Erreur lors de l'envoi",
    noFeedback: 'Pas encore de suggestions.', likes: "j'aime", reply: 'Réponse du Développeur',
    empty: 'Ce roadmap est vide', notFound: 'Roadmap non trouvé', poweredBy: 'Propulsé par',
    addFile: 'Ajouter un fichier', cancel: 'Annuler',
    loginRequired: 'Connexion Requise', loginDesc: 'Connectez-vous pour envoyer des commentaires ou voter',
    continueGoogle: 'Continuer avec Google', continueLinkedin: 'Continuer avec LinkedIn',
  },
  pt: {
    feedback: 'Feedback', submit: 'Enviar Sugestão', title: 'Título', titlePh: 'Resumo breve',
    desc: 'Descrição', descPh: 'Descreva sua sugestão...', name: 'Seu Nome', namePh: 'Opcional',
    email: 'Seu Email', emailPh: 'Opcional', attachments: 'Anexos', attachHint: 'Máximo 5 arquivos, 5MB cada',
    send: 'Enviar', success: 'Obrigado pelo seu feedback!', error: 'Erro ao enviar feedback',
    noFeedback: 'Nenhuma sugestão ainda.', likes: 'curtidas', reply: 'Resposta do Desenvolvedor',
    empty: 'Este roadmap está vazio', notFound: 'Roadmap não encontrado', poweredBy: 'Desenvolvido com',
    addFile: 'Adicionar arquivo', cancel: 'Cancelar',
    loginRequired: 'Login Necessário', loginDesc: 'Faça login para enviar feedback ou votar',
    continueGoogle: 'Continuar com Google', continueLinkedin: 'Continuar com LinkedIn',
  },
};

// Image Gallery Dialog component
function ImageGalleryDialog({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: {
  images: { file_url: string; file_name: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const touchStart = useRef<number | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
    if (e.key === 'ArrowRight' && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
    if (e.key === 'Escape') onClose();
  }, [currentIndex, images.length, onNavigate, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < images.length - 1) onNavigate(currentIndex + 1);
      if (diff < 0 && currentIndex > 0) onNavigate(currentIndex - 1);
    }
    touchStart.current = null;
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] p-0 gap-0 border-0 sm:border bg-black/95 sm:bg-white sm:rounded-xl overflow-hidden">
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>
        <div
          className="relative flex items-center justify-center w-full h-full sm:min-h-[400px] sm:max-h-[80vh]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Navigation */}
          {currentIndex > 0 && (
            <button onClick={() => onNavigate(currentIndex - 1)} className="absolute left-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button onClick={() => onNavigate(currentIndex + 1)} className="absolute right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Image */}
          <img
            src={images[currentIndex].file_url}
            alt={images[currentIndex].file_name}
            className="max-w-full max-h-full object-contain p-2 sm:p-4"
          />

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function PublicRoadmap() {
  const { appName, handle, appSlug: appSlugParam } = useParams<{ appName?: string; handle?: string; appSlug?: string }>();
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<AppInfo | null>(null);
  const [settings, setSettings] = useState<RoadmapSettings | null>(null);
  const [lanes, setLanes] = useState<RoadmapLane[]>([]);
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [feedback, setFeedback] = useState<RoadmapFeedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [likedFeedbackIds, setLikedFeedbackIds] = useState<Set<string>>(new Set());
  const [likedCardIds, setLikedCardIds] = useState<Set<string>>(new Set());
  const [fingerprint, setFingerprint] = useState('');
  const [lang, setLang] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedback'>(() => {
    if (window.location.pathname.endsWith('/feedback')) return 'feedback';
    return 'roadmap';
  });

  // Image gallery state
  const [galleryImages, setGalleryImages] = useState<{ file_url: string; file_name: string }[] | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Navigate to correct URL when switching tabs
  const switchTab = (tab: 'roadmap' | 'feedback') => {
    setActiveTab(tab);
    if (detectedSubdomain) {
      // Clean subdomain URLs: /roadmap or /feedback
      window.history.replaceState(null, '', `/${tab}`);
    } else {
      const currentPath = window.location.pathname;
      const basePath = currentPath.replace(/\/(roadmap|feedback)$/, '');
      const newPath = `${basePath}/${tab}`;
      window.history.replaceState(null, '', newPath);
    }
  };
  const [isFeedbackPublic, setIsFeedbackPublic] = useState(false);
  const [authMode, setAuthMode] = useState<'anonymous' | 'authenticated'>('anonymous');
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  // Feedback form
  const [fbTitle, setFbTitle] = useState('');
  const [fbDesc, setFbDesc] = useState('');
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbFiles, setFbFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen to auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        setFbName(session.user.user_metadata?.full_name || '');
        setFbEmail(session.user.email || '');
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null);
      if (session?.user) {
        setFbName(session.user.user_metadata?.full_name || '');
        setFbEmail(session.user.email || '');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const l = UI_LABELS[lang] || UI_LABELS.en;
  const sl = STATUS_LABELS[lang] || STATUS_LABELS.en;

  // Fetch data
  useEffect(() => {
    const slugToSearch = appSlugParam || appName || detectedSubdomain;
    if (!slugToSearch && !isCustomDomain(window.location.hostname)) return;
    const username = handle?.startsWith('@') ? handle.slice(1) : handle;

    (async () => {
      try {
        const fp = await generateDeviceFingerprint();
        setFingerprint(fp);
        
        const hostname = window.location.hostname;
        const username = handle?.startsWith('@') ? handle.slice(1) : handle;
        const { data, error: funcError } = await supabase.functions.invoke('get-public-roadmap', {
          body: { hostname, slugToSearch, username, fingerprint: fp }
        });

        if (funcError) throw funcError;

        if (data) {
          const { app: a, settings: s, lanes: l, cards: c, feedback: f, userLikes } = data;
          
          setApp(a);
          setSettings(s);
          setLanes(l);
          setCards(c);
          setFeedback(f);
          
          if (userLikes) {
            if (userLikes.cards) setLikedCardIds(new Set(userLikes.cards));
            if (userLikes.feedback) setLikedFeedbackIds(new Set(userLikes.feedback));
          }
          
          setIsFeedbackPublic(s?.is_feedback_public ?? false);
          setAuthMode(s?.feedback_auth_mode || 'anonymous');
          
          // Apply language
          if (s?.default_language && ['es', 'en', 'fr', 'pt'].includes(s.default_language)) {
            setLang(s.default_language);
          } else {
            const browserLang = navigator.language?.substring(0, 2);
            if (['es', 'en', 'fr', 'pt'].includes(browserLang)) setLang(browserLang);
          }
        }
      } catch (err) {
        console.error('Error loading roadmap via Edge Function:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [appName, handle, appSlugParam]);


  useFavicon(settings?.favicon_url ?? undefined);

  useEffect(() => {
    if (app) {
      document.title = settings?.custom_title || app.name || 'Roadmap';
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.setAttribute('name', 'description'); document.head.appendChild(metaDesc); }
      metaDesc.setAttribute('content', app.tagline || '');
      const setOg = (prop: string, content: string) => {
        let el = document.querySelector(`meta[property="${prop}"]`);
        if (!el) { el = document.createElement('meta'); el.setAttribute('property', prop); document.head.appendChild(el); }
        el.setAttribute('content', content);
      };
      setOg('og:title', settings?.custom_title || app.name || 'Roadmap');
      setOg('og:description', app.tagline || '');
      if (app.logo_url) setOg('og:image', app.logo_url);
      setOg('og:type', 'website');
    }
    return () => { document.title = 'Vibecoders.la'; };
  }, [app, settings]);

  useEffect(() => {
    const fonts = new Set<string>();
    if (settings?.font_family && settings.font_family !== 'Inter') fonts.add(settings.font_family);
    lanes.forEach(lane => { if (lane.font && lane.font !== 'Inter') fonts.add(lane.font); });
    if (fonts.size === 0) return;
    const families = Array.from(fonts).map(f => f.replace(/ /g, '+')).join('&family=');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [settings?.font_family, lanes]);

  const requiresLogin = authMode === 'authenticated' && !currentUser;

  const handleActionWithAuth = (action: () => void) => {
    if (requiresLogin) { setShowLoginDialog(true); return; }
    action();
  };

  const handleOAuthLogin = async (provider: 'google' | 'linkedin_oidc') => {
    await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href } });
  };

  const handleToggleFeedbackLike = async (feedbackId: string) => {
    if (requiresLogin) { setShowLoginDialog(true); return; }
    if (!fingerprint) return;
    const isLiked = likedFeedbackIds.has(feedbackId);
    setLikedFeedbackIds(prev => { const next = new Set(prev); if (isLiked) next.delete(feedbackId); else next.add(feedbackId); return next; });
    setFeedback(prev => prev.map(f => f.id === feedbackId ? { ...f, likes_count: f.likes_count + (isLiked ? -1 : 1) } : f).sort((a, b) => b.likes_count - a.likes_count));
    if (isLiked) { await supabase.from('roadmap_feedback_likes').delete().eq('feedback_id', feedbackId).eq('device_fingerprint', fingerprint); }
    else { await supabase.from('roadmap_feedback_likes').insert({ feedback_id: feedbackId, device_fingerprint: fingerprint }); }
  };

  const handleToggleCardLike = async (cardId: string) => {
    if (!fingerprint) return;
    const isLiked = likedCardIds.has(cardId);
    setLikedCardIds(prev => { const next = new Set(prev); if (isLiked) next.delete(cardId); else next.add(cardId); return next; });
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, likes_count: (c.likes_count || 0) + (isLiked ? -1 : 1) } : c));
    if (isLiked) { await supabase.from('roadmap_card_likes').delete().eq('card_id', cardId).eq('device_fingerprint', fingerprint); }
    else { await supabase.from('roadmap_card_likes').insert({ card_id: cardId, device_fingerprint: fingerprint }); }
  };

  const handleSubmitFeedback = async () => {
    if (!fbTitle.trim() || !fbDesc.trim() || !app) return;
    setSubmitting(true);
    try {
      const attachments: { file_url: string; file_name: string; file_type: string; file_size: number; file_path: string }[] = [];
      for (const file of fbFiles) {
        if (file.size > 5 * 1024 * 1024) continue;
        const path = `${app.id}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from('roadmap-attachments').upload(path, file, { upsert: true });
        if (upErr) continue;
        const { data: urlData } = supabase.storage.from('roadmap-attachments').getPublicUrl(path);
        attachments.push({ file_url: urlData.publicUrl, file_name: file.name, file_type: file.type, file_size: file.size, file_path: path });
      }

      const { data: newFb, error } = await supabase.from('roadmap_feedback')
        .insert({ app_id: app.id, title: fbTitle.trim(), description: fbDesc.trim(), author_name: fbName.trim() || null, author_email: fbEmail.trim() || null })
        .select().single();
      if (error) throw error;

      if (attachments.length > 0) {
        await supabase.from('roadmap_feedback_attachments').insert(attachments.map(a => ({ feedback_id: newFb.id, ...a })));
      }

      toast.success(l.success);
      setFbTitle(''); setFbDesc(''); setFbFiles([]);
      if (!currentUser) { setFbName(''); setFbEmail(''); }
      setShowFeedbackForm(false);

      const { data: refreshed } = await supabase.from('roadmap_feedback')
        .select('*, roadmap_feedback_attachments(*)').eq('app_id', app.id).eq('is_hidden', false).order('likes_count', { ascending: false });
      if (refreshed) setFeedback(refreshed.map(f => ({ ...f, attachments: f.roadmap_feedback_attachments || [] })) as RoadmapFeedback[]);
    } catch {
      toast.error(l.error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.size <= 5 * 1024 * 1024 && (f.type.startsWith('image/') || f.type === 'application/pdf'));
    setFbFiles(prev => [...prev, ...valid].slice(0, 5));
  };

  // Helper to render attachments as thumbnails/PDF icons
  const renderAttachments = (attachments: RoadmapFeedbackAttachment[]) => {
    if (!attachments || attachments.length === 0) return null;
    const images = attachments.filter(a => a.file_type?.startsWith('image/'));
    const pdfs = attachments.filter(a => a.file_type === 'application/pdf');
    const others = attachments.filter(a => !a.file_type?.startsWith('image/') && a.file_type !== 'application/pdf');

    return (
      <div className="flex gap-2 mt-3 flex-wrap items-end">
        {images.map((img, idx) => (
          <button
            key={img.id}
            onClick={() => { setGalleryImages(images); setGalleryIndex(idx); }}
            className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-gray-400 transition-colors cursor-pointer flex-shrink-0"
          >
            <img src={img.file_url} alt={img.file_name} className="w-full h-full object-cover" />
          </button>
        ))}
        {pdfs.map(pdf => (
          <a
            key={pdf.id}
            href={pdf.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors bg-gray-50"
          >
            <FileText className="w-6 h-6 text-red-500 mb-1" />
            <Download className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] text-gray-500 mt-0.5 truncate max-w-[72px] px-1">{pdf.file_name}</span>
          </a>
        ))}
        {others.map(att => (
          <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors">
            <Paperclip className="w-3 h-3" />
            {att.file_name}
          </a>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!app || !settings) {
    // If accessed via subdomain and app doesn't exist, redirect to main domain
    const hostname = window.location.hostname;
    const isSubdomain = hostname.endsWith('vibecoders.la') && hostname !== 'vibecoders.la' && hostname !== 'www.vibecoders.la';
    if (isSubdomain) {
      window.location.href = 'https://vibecoders.la';
      return null;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">{l.notFound}</p>
      </div>
    );
  }

  const fontFamily = settings.font_family || 'Inter';
  const title = settings.custom_title || app.name || 'Roadmap';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" style={{ fontFamily }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {app.logo_url && <img src={app.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">{title}</h1>
              {app.tagline && <p className="text-xs text-gray-500 truncate hidden sm:block">{app.tagline}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => switchTab('roadmap')} className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all', activeTab === 'roadmap' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                Roadmap
              </button>
              {isFeedbackPublic && (
                <button onClick={() => switchTab('feedback')} className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all', activeTab === 'feedback' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}>
                  {l.feedback} ({feedback.length})
                </button>
              )}
            </div>
            {activeTab === 'feedback' && isFeedbackPublic && (
              <Button size="sm" onClick={() => handleActionWithAuth(() => setShowFeedbackForm(true))}>
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{l.submit}</span>
              </Button>
            )}
          </div>
        </div>
        <div className="sm:hidden flex border-t">
          <button onClick={() => switchTab('roadmap')} className={cn('flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-all', activeTab === 'roadmap' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500')}>
            Roadmap
          </button>
          {isFeedbackPublic && (
            <button onClick={() => switchTab('feedback')} className={cn('flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-all', activeTab === 'feedback' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500')}>
              {l.feedback} ({feedback.length})
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex-1 w-full">
        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <>
            {lanes.length === 0 ? (
              <p className="text-center text-gray-400 py-20">{l.empty}</p>
            ) : (
              <>
                {/* Desktop: horizontal scroll */}
                <div className="hidden md:flex gap-5 overflow-x-auto pb-4">
                  {lanes.map(lane => {
                    const laneCards = cards.filter(c => c.lane_id === lane.id).sort((a, b) => a.display_order - b.display_order);
                    return (
                      <div key={lane.id} className="flex-shrink-0 w-72">
                        <div className="bg-gray-100 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                            <h3 className="font-semibold text-sm text-gray-700">{lane.name}</h3>
                            <span className="text-xs text-gray-400">({laneCards.length})</span>
                          </div>
                          <div className="space-y-3 min-h-[200px]">
                            {laneCards.map(card => (
                              <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border-l-[3px]" style={{ borderLeftColor: lane.color }}>
                                <p className="font-medium text-sm text-gray-800" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>{card.title}</p>
                                {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-1.5">
                                    {card.completed_at && (
                                      <Badge variant="secondary" className="text-[10px] h-5 bg-gray-100 text-gray-600">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {format(new Date(card.completed_at), 'MMM d, yyyy')}
                                      </Badge>
                                    )}
                                  </div>
                                  <button onClick={() => handleToggleCardLike(card.id)} className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all', likedCardIds.has(card.id) ? 'bg-rose-50 text-rose-600' : 'text-gray-400 hover:text-rose-500')}>
                                    <Heart className={cn('w-3.5 h-3.5', likedCardIds.has(card.id) && 'fill-current')} />
                                    {(card.likes_count || 0) > 0 && card.likes_count}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: stacked */}
                <div className="md:hidden space-y-6">
                  {lanes.map(lane => {
                    const laneCards = cards.filter(c => c.lane_id === lane.id).sort((a, b) => a.display_order - b.display_order);
                    return (
                      <div key={lane.id} className="bg-gray-100 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                          <h3 className="font-semibold text-sm text-gray-700">{lane.name}</h3>
                          <span className="text-xs text-gray-400">({laneCards.length})</span>
                        </div>
                        <div className="space-y-3">
                          {laneCards.map(card => (
                            <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow border-l-[3px]" style={{ borderLeftColor: lane.color }}>
                              <p className="font-medium text-sm text-gray-800" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>{card.title}</p>
                              {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5">
                                  {card.completed_at && (
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-gray-100 text-gray-600">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {format(new Date(card.completed_at), 'MMM d, yyyy')}
                                    </Badge>
                                  )}
                                </div>
                                <button onClick={() => handleToggleCardLike(card.id)} className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all', likedCardIds.has(card.id) ? 'bg-rose-50 text-rose-600' : 'text-gray-400 hover:text-rose-500')}>
                                  <Heart className={cn('w-3.5 h-3.5', likedCardIds.has(card.id) && 'fill-current')} />
                                  {(card.likes_count || 0) > 0 && card.likes_count}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Feedback View */}
        {activeTab === 'feedback' && isFeedbackPublic && (
          <div className="space-y-4">
            <div className="sm:hidden mb-4">
              <Button className="w-full" onClick={() => handleActionWithAuth(() => setShowFeedbackForm(true))}>
                <Send className="w-4 h-4 mr-2" /> {l.submit}
              </Button>
            </div>

            {feedback.length === 0 ? (
              <p className="text-center text-gray-400 py-20">{l.noFeedback}</p>
            ) : (
              <div className="space-y-3 max-w-2xl mx-auto">
                {feedback.map(fb => (
                  <div key={fb.id} className="bg-white rounded-xl p-4 shadow-sm border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm text-gray-900">{fb.title}</h3>
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', STATUS_COLORS[fb.status] || 'bg-gray-100 text-gray-600')}>
                            {sl[fb.status] || fb.status}
                          </span>
                          {fb.linked_card_id && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              Included in feature
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{fb.description}</p>
                        {fb.author_name && <p className="text-xs text-gray-400 mt-1">— {fb.author_name}</p>}
                      </div>
                      <button
                        onClick={() => handleToggleFeedbackLike(fb.id)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0',
                          likedFeedbackIds.has(fb.id) ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        <Heart className={cn('w-3.5 h-3.5', likedFeedbackIds.has(fb.id) && 'fill-current')} />
                        {fb.likes_count}
                      </button>
                    </div>

                    {/* Attachments as thumbnails / PDF icons */}
                    {renderAttachments(fb.attachments)}

                    {/* Owner response */}
                    {fb.owner_response && (
                      <div className="mt-3 bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-1">{l.reply}</p>
                        <p className="text-sm text-blue-900">{fb.owner_response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5">
          <p className="text-xs text-gray-400">{l.poweredBy}</p>
          <a href="https://vibecoders.la" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors">
            <img src={vibecodersLogo} alt="Vibecoders" className="w-4 h-4" />
            <span className="text-xs font-medium">vibecoders.la</span>
          </a>
        </div>
      </footer>

      {/* Feedback Form Dialog */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{l.submit}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{l.title} *</Label>
              <Input value={fbTitle} onChange={e => setFbTitle(e.target.value)} placeholder={l.titlePh} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>{l.desc} *</Label>
              <Textarea value={fbDesc} onChange={e => setFbDesc(e.target.value)} placeholder={l.descPh} rows={4} className="resize-none" maxLength={2000} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{l.name}</Label>
                <Input value={fbName} onChange={e => setFbName(e.target.value)} placeholder={l.namePh} maxLength={100} disabled={!!currentUser} />
              </div>
              <div className="space-y-2">
                <Label>{l.email}</Label>
                <Input value={fbEmail} onChange={e => setFbEmail(e.target.value)} placeholder={l.emailPh} type="email" maxLength={255} disabled={!!currentUser} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{l.attachments}</Label>
              <p className="text-xs text-gray-500">{l.attachHint}</p>
              <div className="flex flex-wrap gap-2">
                {fbFiles.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                    {f.name}
                    <button onClick={() => setFbFiles(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {fbFiles.length < 5 && (
                  <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 border border-dashed rounded text-xs text-gray-500 hover:text-gray-700 hover:border-gray-400">
                    <Paperclip className="w-3 h-3 inline mr-1" /> {l.addFile}
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileSelect} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowFeedbackForm(false)} className="w-full sm:w-auto">{l.cancel}</Button>
            <Button onClick={handleSubmitFeedback} disabled={submitting || !fbTitle.trim() || !fbDesc.trim()} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              {l.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login Required Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              {l.loginRequired}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">{l.loginDesc}</p>
          <div className="space-y-3 pt-2">
            <Button variant="outline" className="w-full gap-2 h-11" onClick={() => handleOAuthLogin('google')}>
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {l.continueGoogle}
            </Button>
            <Button variant="outline" className="w-full gap-2 h-11" onClick={() => handleOAuthLogin('linkedin_oidc')}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              {l.continueLinkedin}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery */}
      {galleryImages && (
        <ImageGalleryDialog
          images={galleryImages}
          currentIndex={galleryIndex}
          onClose={() => setGalleryImages(null)}
          onNavigate={setGalleryIndex}
        />
      )}
    </div>
  );
}
