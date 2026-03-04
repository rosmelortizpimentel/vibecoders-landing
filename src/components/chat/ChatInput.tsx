import {
  useState, useRef, ChangeEvent, KeyboardEvent,
  useCallback, DragEvent, ClipboardEvent, useEffect
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Image, X, Send, Loader2, Mic, MicOff, Square } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MAX_IMAGES = 5;
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const MAX_CHARS = 500;

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

interface ChatInputProps {
  conversationId: string;
  onMessageSent: () => void;
}

export function ChatInput({ conversationId, onMessageSent }: ChatInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  /** Core function — validates and appends image files */
  const addFiles = useCallback((incoming: File[]) => {
    const result: File[] = [];

    for (const f of incoming) {
      if (!f.type.startsWith('image/')) continue; // skip non-images silently

      if (!SUPPORTED_IMAGE_TYPES.has(f.type)) {
        const ext = f.name.split('.').pop()?.toUpperCase() || f.type;
        toast.error(`Formato no soportado: .${ext?.toLowerCase()}`, {
          description: 'Solo se admiten: JPEG, PNG, GIF, WebP y SVG.',
        });
        continue;
      }

      if (f.size > MAX_SIZE_BYTES) {
        toast.warning(`"${f.name}" supera los ${MAX_SIZE_MB}MB y no se puede adjuntar`);
        continue;
      }

      result.push(f);
    }

    setImages(prev => {
      const remaining = MAX_IMAGES - prev.length;
      if (remaining <= 0) {
        toast.warning(`Ya tienes el maximo de ${MAX_IMAGES} imagenes`);
        return prev;
      }
      const toAdd = result.slice(0, remaining);
      if (result.length > remaining) {
        toast.warning(`Solo puedes agregar ${MAX_IMAGES} imagenes por mensaje`);
      }
      const previews = toAdd.map(f => URL.createObjectURL(f));
      setImagePreviews(p => [...p, ...previews]);
      return [...prev, ...toAdd];
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  function handleImageSelect(e: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files || []));
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(imagePreviews[idx]);
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  }

  /** Paste — captures images from clipboard */
  function handlePaste(e: ClipboardEvent<HTMLTextAreaElement>) {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter(it => it.kind === 'file' && it.type.startsWith('image/'));
    if (imageItems.length === 0) return;
    e.preventDefault();
    const files = imageItems.map(it => it.getAsFile()).filter(Boolean) as File[];
    addFiles(files);
  }

  /** Drag-and-drop */
  function handleDragOver(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false);
  }
  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') return; // allow newline
  }

  /** Audio recording */
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioPreviewUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch {
      toast.error('No se puede acceder al microfono. Verifica los permisos del navegador.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  }

  function cancelAudio() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setRecordingSeconds(0);
  }

  function formatSeconds(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  async function uploadImage(file: File): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${conversationId}/${user!.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('chat-images').upload(path, file, { contentType: file.type });
    if (error) { toast.error(`Error al subir imagen: ${file.name}`); return null; }
    return path;
  }

  async function uploadAudio(blob: Blob): Promise<string | null> {
    const ext = blob.type.includes('webm') ? 'webm' : 'ogg';
    const path = `${conversationId}/${user!.id}/audio_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('chat-audio').upload(path, blob, { contentType: blob.type });
    if (error) { toast.error('Error al subir el audio'); return null; }
    return path;
  }

  async function sendMessage() {
    if (!user) return;
    const trimmed = content.trim();
    if (!trimmed && images.length === 0 && !audioBlob) return;
    if (sending) return;

    setSending(true);
    try {
      const imageUrls = (await Promise.all(images.map(uploadImage))).filter(Boolean) as string[];
      let audioPath: string | null = null;
      if (audioBlob) audioPath = await uploadAudio(audioBlob);

      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: trimmed || ' ',
        image_urls: imageUrls,
        audio_url: audioPath,
      });

      if (error) { toast.error('Error al enviar el mensaje'); return; }

      const preview = audioPath
        ? '🎤 Mensaje de voz'
        : trimmed
          ? trimmed.slice(0, 80)
          : `📷 ${imageUrls.length} imagen${imageUrls.length > 1 ? 'es' : ''}`;

      await supabase.from('chat_conversations')
        .update({ last_message_at: new Date().toISOString(), last_message_preview: preview })
        .eq('id', conversationId);

      setContent('');
      imagePreviews.forEach(u => URL.revokeObjectURL(u));
      setImages([]); setImagePreviews([]);
      cancelAudio();
      onMessageSent();
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  const canSend = (content.trim().length > 0 || images.length > 0 || !!audioBlob) && !sending;

  return (
    <div
      className={cn(
        'border-t border-border/80 px-4 py-2 bg-white transition-colors duration-150 shadow-[0_-1px_3px_rgba(0,0,0,0.04)]',
        isDragging && 'bg-primary/5'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag hint */}
      {isDragging && (
        <div className="flex items-center justify-center gap-2 py-2 mb-2 rounded-xl border-2 border-dashed border-primary/40 text-primary text-sm font-medium">
          <Image className="w-4 h-4" />
          Suelta para anadir imagenes
        </div>
      )}

      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-none">
          {imagePreviews.map((src, idx) => (
            <div key={idx} className="relative group shrink-0">
              <img src={src} alt={`preview-${idx}`}
                className="w-20 h-20 object-cover rounded-xl border border-border/60 shadow-sm" />
              <button onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground/80 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <button onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-20 h-20 rounded-xl border border-dashed border-border/60 hover:border-primary/50 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors">
              <Image className="w-4 h-4" />
              <span className="text-[10px]">{images.length}/{MAX_IMAGES}</span>
            </button>
          )}
        </div>
      )}

      {/* Audio preview (after recording) */}
      {audioPreviewUrl && !isRecording && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
          <Mic className="w-4 h-4 text-primary shrink-0" />
          <audio src={audioPreviewUrl} controls className="flex-1 h-8" />
          <button onClick={cancelAudio} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-destructive/5 border border-destructive/20">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
          <span className="text-sm text-destructive font-medium">Grabando {formatSeconds(recordingSeconds)}</span>
          <button onClick={stopRecording}
            className="ml-auto shrink-0 p-1 rounded-full bg-destructive text-white hover:bg-destructive/80 transition-colors">
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        {/* Attach image button — only when no previews and not recording */}
        {images.length < MAX_IMAGES && imagePreviews.length === 0 && !isRecording && !audioPreviewUrl && (
          <button onClick={() => fileInputRef.current?.click()}
            className="shrink-0 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors mb-0.5"
            title="Adjuntar imagen">
            <Image style={{ width: 18, height: 18 }} />
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />

        {/* Textarea */}
        {!isRecording && !audioPreviewUrl && (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Escribe un mensaje..."
            rows={1}
            className={cn(
              'flex-1 resize-none rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-background',
              'min-h-[42px] max-h-[160px] leading-5 transition-all placeholder:text-muted-foreground/50',
              'shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]'
            )}
            style={{ height: 'auto' }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = Math.min(el.scrollHeight, 160) + 'px';
            }}
          />
        )}

        {/* Mic button — shown when no text, images, or audio queued */}
        {!isRecording && !audioPreviewUrl && content.trim().length === 0 && images.length === 0 && (
          <button
            onClick={startRecording}
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all mb-0.5 bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
            title="Grabar audio"
          >
            <Mic className="w-4 h-4" />
          </button>
        )}

        {/* Cancel recording */}
        {isRecording && (
          <button onClick={cancelAudio}
            className="shrink-0 p-2 rounded-full hover:bg-muted text-muted-foreground mb-0.5"
            title="Cancelar">
            <MicOff className="w-4 h-4" />
          </button>
        )}

        {/* Send button */}
        <button
          onClick={isRecording ? stopRecording : sendMessage}
          disabled={!canSend && !isRecording}
          className={cn(
            'shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all mb-0.5',
            canSend || isRecording
              ? 'bg-primary text-white hover:bg-primary/85 shadow-md hover:scale-105 active:scale-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          )}
          title={isRecording ? 'Detener y enviar' : 'Enviar'}
        >
          {sending
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : isRecording
              ? <Send className="w-4 h-4" />
              : <Send className="w-4 h-4" />
          }
        </button>
      </div>

      {/* Character counter */}
      {content.length > 400 && (
        <div className={cn(
          'text-right text-[10px] mt-1 transition-colors',
          content.length >= MAX_CHARS ? 'text-destructive font-medium' :
          content.length >= 470 ? 'text-orange-400' : 'text-muted-foreground/60'
        )}>
          {content.length}/{MAX_CHARS}
        </div>
      )}
    </div>
  );
}
