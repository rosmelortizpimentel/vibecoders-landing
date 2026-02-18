import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useRoadmapFeedback, RoadmapLane, RoadmapCard, RoadmapSettings, RoadmapFeedback } from '@/hooks/useRoadmap';
import { useFavicon } from '@/hooks/useFavicon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, ThumbsUp, MessageSquare, Paperclip, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    feedback: 'Feedback & Suggestions', submit: 'Submit Suggestion', title: 'Title', titlePh: 'Brief summary of your idea',
    desc: 'Description', descPh: 'Describe your suggestion in detail...', name: 'Your Name', namePh: 'Optional',
    email: 'Your Email', emailPh: 'Optional', attachments: 'Attachments', attachHint: 'Max 5 files, 5MB each (images or PDFs)',
    send: 'Submit', success: 'Thank you for your feedback!', error: 'Error submitting feedback',
    noFeedback: 'No suggestions yet. Be the first!', likes: 'likes', reply: 'Developer Response',
    empty: 'This roadmap is empty for now', notFound: 'Roadmap not found', poweredBy: 'Powered by',
    addFile: 'Add file', cancel: 'Cancel',
  },
  es: {
    feedback: 'Feedback y Sugerencias', submit: 'Enviar Sugerencia', title: 'Título', titlePh: 'Resumen breve de tu idea',
    desc: 'Descripción', descPh: 'Describe tu sugerencia en detalle...', name: 'Tu Nombre', namePh: 'Opcional',
    email: 'Tu Email', emailPh: 'Opcional', attachments: 'Adjuntos', attachHint: 'Máximo 5 archivos, 5MB cada uno',
    send: 'Enviar', success: '¡Gracias por tu feedback!', error: 'Error al enviar el feedback',
    noFeedback: 'No hay sugerencias aún. ¡Sé el primero!', likes: 'me gusta', reply: 'Respuesta del Desarrollador',
    empty: 'Este roadmap está vacío por ahora', notFound: 'Roadmap no encontrado', poweredBy: 'Potenciado por',
    addFile: 'Agregar archivo', cancel: 'Cancelar',
  },
  fr: {
    feedback: 'Commentaires et Suggestions', submit: 'Soumettre une Suggestion', title: 'Titre', titlePh: 'Résumé bref',
    desc: 'Description', descPh: 'Décrivez votre suggestion...', name: 'Votre Nom', namePh: 'Optionnel',
    email: 'Votre Email', emailPh: 'Optionnel', attachments: 'Pièces Jointes', attachHint: 'Max 5 fichiers, 5 Mo chacun',
    send: 'Envoyer', success: 'Merci pour votre retour !', error: "Erreur lors de l'envoi",
    noFeedback: 'Pas encore de suggestions.', likes: "j'aime", reply: 'Réponse du Développeur',
    empty: 'Ce roadmap est vide', notFound: 'Roadmap non trouvé', poweredBy: 'Propulsé par',
    addFile: 'Ajouter un fichier', cancel: 'Annuler',
  },
  pt: {
    feedback: 'Feedback e Sugestões', submit: 'Enviar Sugestão', title: 'Título', titlePh: 'Resumo breve',
    desc: 'Descrição', descPh: 'Descreva sua sugestão...', name: 'Seu Nome', namePh: 'Opcional',
    email: 'Seu Email', emailPh: 'Opcional', attachments: 'Anexos', attachHint: 'Máximo 5 arquivos, 5MB cada',
    send: 'Enviar', success: 'Obrigado pelo seu feedback!', error: 'Erro ao enviar feedback',
    noFeedback: 'Nenhuma sugestão ainda.', likes: 'curtidas', reply: 'Resposta do Desenvolvedor',
    empty: 'Este roadmap está vazio', notFound: 'Roadmap não encontrado', poweredBy: 'Desenvolvido com',
    addFile: 'Adicionar arquivo', cancel: 'Cancelar',
  },
};

export default function PublicRoadmap() {
  const { appName } = useParams<{ appName: string }>();
  const [loading, setLoading] = useState(true);
  const [app, setApp] = useState<AppInfo | null>(null);
  const [settings, setSettings] = useState<RoadmapSettings | null>(null);
  const [lanes, setLanes] = useState<RoadmapLane[]>([]);
  const [cards, setCards] = useState<RoadmapCard[]>([]);
  const [feedback, setFeedback] = useState<RoadmapFeedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [fingerprint, setFingerprint] = useState('');
  const [lang, setLang] = useState<string>('en');
  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedback'>('roadmap');

  // Feedback form
  const [fbTitle, setFbTitle] = useState('');
  const [fbDesc, setFbDesc] = useState('');
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbFiles, setFbFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect language
  useEffect(() => {
    const browserLang = navigator.language?.substring(0, 2);
    if (['es', 'en', 'fr', 'pt'].includes(browserLang)) setLang(browserLang);
  }, []);

  const l = UI_LABELS[lang] || UI_LABELS.en;
  const sl = STATUS_LABELS[lang] || STATUS_LABELS.en;

  // Fetch data
  useEffect(() => {
    if (!appName) return;
    (async () => {
      try {
        // Find app by slug (name lowercased and slugified)
        const { data: apps } = await supabase.from('apps').select('id, name, tagline, logo_url').eq('is_visible', true);
        const found = apps?.find(a => {
          const slug = (a.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          return slug === appName;
        });
        if (!found) { setLoading(false); return; }
        setApp(found as AppInfo);

        const [settingsRes, lanesRes, cardsRes, feedbackRes] = await Promise.all([
          supabase.from('roadmap_settings').select('*').eq('app_id', found.id).eq('is_public', true).maybeSingle(),
          supabase.from('roadmap_lanes').select('*').eq('app_id', found.id).order('display_order'),
          supabase.from('roadmap_cards').select('*').eq('app_id', found.id).order('display_order'),
          supabase.from('roadmap_feedback').select('*, roadmap_feedback_attachments(*)').eq('app_id', found.id).order('likes_count', { ascending: false }),
        ]);

        if (settingsRes.data) setSettings(settingsRes.data as RoadmapSettings);
        setLanes((lanesRes.data || []) as RoadmapLane[]);
        setCards((cardsRes.data || []) as RoadmapCard[]);
        setFeedback((feedbackRes.data || []).map((f: any) => ({
          ...f, attachments: f.roadmap_feedback_attachments || [],
        })) as RoadmapFeedback[]);
      } catch (err) {
        console.error('Error loading roadmap:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [appName]);

  // Fingerprint & liked state
  useEffect(() => {
    (async () => {
      const fp = await generateDeviceFingerprint();
      setFingerprint(fp);
      // Check which feedback items are liked by this fingerprint
      if (feedback.length > 0) {
        const { data } = await supabase
          .from('roadmap_feedback_likes')
          .select('feedback_id')
          .eq('device_fingerprint', fp)
          .in('feedback_id', feedback.map(f => f.id));
        if (data) setLikedIds(new Set(data.map(d => d.feedback_id)));
      }
    })();
  }, [feedback.length]);

  // Apply favicon
  useFavicon(settings?.favicon_url ?? undefined);

  // Set page title
  useEffect(() => {
    if (app) {
      document.title = settings?.custom_title || app.name || 'Roadmap';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', app.tagline || '');
    }
    return () => { document.title = 'Vibecoders.la'; };
  }, [app, settings]);

  // Load custom fonts (global + lane-specific)
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

  const handleToggleLike = async (feedbackId: string) => {
    if (!fingerprint) return;
    const isLiked = likedIds.has(feedbackId);

    // Optimistic update
    setLikedIds(prev => {
      const next = new Set(prev);
      if (isLiked) next.delete(feedbackId); else next.add(feedbackId);
      return next;
    });
    setFeedback(prev => prev.map(f =>
      f.id === feedbackId ? { ...f, likes_count: f.likes_count + (isLiked ? -1 : 1) } : f
    ));

    if (isLiked) {
      await supabase.from('roadmap_feedback_likes').delete().eq('feedback_id', feedbackId).eq('device_fingerprint', fingerprint);
    } else {
      await supabase.from('roadmap_feedback_likes').insert({ feedback_id: feedbackId, device_fingerprint: fingerprint });
    }
  };

  const handleSubmitFeedback = async () => {
    if (!fbTitle.trim() || !fbDesc.trim() || !app) return;
    setSubmitting(true);
    try {
      // Upload attachments first
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
      setFbTitle(''); setFbDesc(''); setFbName(''); setFbEmail(''); setFbFiles([]);
      setShowFeedbackForm(false);

      // Refresh feedback
      const { data: refreshed } = await supabase.from('roadmap_feedback')
        .select('*, roadmap_feedback_attachments(*)').eq('app_id', app.id).order('likes_count', { ascending: false });
      if (refreshed) setFeedback(refreshed.map((f: any) => ({ ...f, attachments: f.roadmap_feedback_attachments || [] })) as RoadmapFeedback[]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!app || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">{l.notFound}</p>
      </div>
    );
  }

  const fontFamily = settings.font_family || 'Inter';
  const title = settings.custom_title || app.name || 'Roadmap';

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {app.logo_url && <img src={app.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />}
            <div>
              <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              {app.tagline && <p className="text-xs text-gray-500">{app.tagline}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Tab switcher */}
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setActiveTab('roadmap')}
                className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all', activeTab === 'roadmap' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
              >
                Roadmap
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={cn('px-3 py-1.5 text-sm font-medium rounded-md transition-all', activeTab === 'feedback' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700')}
              >
                {l.feedback} ({feedback.length})
              </button>
            </div>
            {activeTab === 'feedback' && (
              <Button size="sm" onClick={() => setShowFeedbackForm(true)}>
                <Send className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{l.submit}</span>
              </Button>
            )}
          </div>
        </div>
        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t">
          <button onClick={() => setActiveTab('roadmap')} className={cn('flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-all', activeTab === 'roadmap' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500')}>
            Roadmap
          </button>
          <button onClick={() => setActiveTab('feedback')} className={cn('flex-1 py-2.5 text-sm font-medium text-center border-b-2 transition-all', activeTab === 'feedback' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500')}>
            {l.feedback} ({feedback.length})
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Roadmap View */}
        {activeTab === 'roadmap' && (
          <>
            {lanes.length === 0 ? (
              <p className="text-center text-gray-400 py-20">{l.empty}</p>
            ) : (
              <>
                {/* Desktop: horizontal scroll */}
                <div className="hidden md:flex gap-4 overflow-x-auto pb-4">
                  {lanes.map(lane => {
                    const laneCards = cards.filter(c => c.lane_id === lane.id).sort((a, b) => a.display_order - b.display_order);
                    return (
                      <div key={lane.id} className="flex-shrink-0 w-72">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                          <h3 className="font-semibold text-sm text-gray-700">{lane.name}</h3>
                          <span className="text-xs text-gray-400">({laneCards.length})</span>
                        </div>
                        <div className="space-y-2 bg-gray-100/60 rounded-lg p-2 min-h-[200px]">
                          {laneCards.map(card => (
                            <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm border-l-[3px]" style={{ borderLeftColor: lane.color }}>
                              <p className="font-medium text-sm text-gray-800" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>{card.title}</p>
                              {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
                            </div>
                          ))}
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
                      <div key={lane.id}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lane.color }} />
                          <h3 className="font-semibold text-sm text-gray-700">{lane.name}</h3>
                          <span className="text-xs text-gray-400">({laneCards.length})</span>
                        </div>
                        <div className="space-y-2">
                          {laneCards.map(card => (
                            <div key={card.id} className="bg-white rounded-lg p-3 shadow-sm border-l-[3px]" style={{ borderLeftColor: lane.color }}>
                              <p className="font-medium text-sm text-gray-800" style={{ fontFamily: lane.font !== 'Inter' ? lane.font : undefined }}>{card.title}</p>
                              {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
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
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="sm:hidden mb-4">
              <Button className="w-full" onClick={() => setShowFeedbackForm(true)}>
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
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{fb.description}</p>
                        {fb.author_name && <p className="text-xs text-gray-400 mt-1">— {fb.author_name}</p>}
                      </div>
                      <button
                        onClick={() => handleToggleLike(fb.id)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0',
                          likedIds.has(fb.id) ? 'bg-rose-50 text-rose-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        )}
                      >
                        <ThumbsUp className={cn('w-3.5 h-3.5', likedIds.has(fb.id) && 'fill-current')} />
                        {fb.likes_count}
                      </button>
                    </div>

                    {/* Attachments */}
                    {fb.attachments && fb.attachments.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {fb.attachments.map(att => (
                          <a key={att.id} href={att.file_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors">
                            <Paperclip className="w-3 h-3" />
                            {att.file_name}
                          </a>
                        ))}
                      </div>
                    )}

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
      <footer className="border-t bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            {l.poweredBy} <a href="https://vibecoders.la" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700 font-medium">vibecoders.la</a>
          </p>
        </div>
      </footer>

      {/* Feedback Form Dialog */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="sm:max-w-lg">
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{l.name}</Label>
                <Input value={fbName} onChange={e => setFbName(e.target.value)} placeholder={l.namePh} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>{l.email}</Label>
                <Input value={fbEmail} onChange={e => setFbEmail(e.target.value)} placeholder={l.emailPh} type="email" maxLength={255} />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackForm(false)}>{l.cancel}</Button>
            <Button onClick={handleSubmitFeedback} disabled={submitting || !fbTitle.trim() || !fbDesc.trim()}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
              {l.send}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
