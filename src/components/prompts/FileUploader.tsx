import { useRef, useState, useCallback } from 'react';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PendingFile {
  file: File;
  id: string;
}

interface UploadedFile {
  id: string;
  file_name: string;
  file_size: number;
  file_url: string;
}

interface FileUploaderProps {
  pendingFiles: PendingFile[];
  onAddFiles: (files: File[]) => void;
  onRemovePending: (id: string) => void;
  uploadedFiles?: UploadedFile[];
  onRemoveUploaded?: (id: string, url: string) => void;
  uploading?: boolean;
}

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploader({
  pendingFiles,
  onAddFiles,
  onRemovePending,
  uploadedFiles = [],
  onRemoveUploaded,
  uploading,
}: FileUploaderProps) {
  const { t } = useTranslation('prompts');
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const validateAndAdd = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const valid: File[] = [];
    files.forEach(f => {
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name}: ${t('upload.maxSize')}`);
      } else {
        valid.push(f);
      }
    });
    if (valid.length) onAddFiles(valid);
  }, [onAddFiles, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files);
  }, [validateAndAdd]);

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{t('upload.dragDrop')}</p>
        <p className="text-xs text-muted-foreground/60 mt-1">{t('upload.maxSize')}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={e => { if (e.target.files?.length) { validateAndAdd(e.target.files); e.target.value = ''; } }}
      />

      {/* File list */}
      {(pendingFiles.length > 0 || uploadedFiles.length > 0) && (
        <div className="space-y-1.5">
          {uploadedFiles.map(f => (
            <div key={f.id} className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2">
              <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="truncate flex-1">{f.file_name}</span>
              <span className="text-xs text-muted-foreground">{formatSize(f.file_size)}</span>
              {onRemoveUploaded && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveUploaded(f.id, f.file_url)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          {pendingFiles.map(pf => (
            <div key={pf.id} className="flex items-center gap-2 text-sm bg-muted/50 rounded-md px-3 py-2">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
              <span className="truncate flex-1">{pf.file.name}</span>
              <span className="text-xs text-muted-foreground">{formatSize(pf.file.size)}</span>
              {!uploading && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemovePending(pf.id)}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
