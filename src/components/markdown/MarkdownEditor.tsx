import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { Eye, PenLine } from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  minHeight = "min-h-[400px]"
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('write')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              mode === 'write' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <PenLine className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            onClick={() => setMode('preview')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              mode === 'preview' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {mode === 'write' ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full min-h-[400px] resize-none border-0 focus-visible:ring-0 p-4 font-mono text-sm leading-relaxed"
          />
        ) : (
          <div className="h-full w-full overflow-auto p-6 bg-card">
             {value ? (
               <div 
                 className="prose prose-sm dark:prose-invert max-w-none"
                 dangerouslySetInnerHTML={{ __html: parseMarkdown(value) }} 
               />
             ) : (
               <div className="text-muted-foreground text-sm italic">Nothing to preview</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
