import { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NaturalEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function NaturalEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  minHeight = "min-h-[300px]" // Reduced by ~25% from 400px
}: NaturalEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value to editor content if it changes externally (and not from our own typing)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      // Handle empty placeholder state
      if (content === '<br>' || content === '') {
        onChange('');
      } else {
        onChange(content);
      }
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col border rounded-md overflow-hidden bg-background", className)}>
      <div className="flex items-center gap-1 border-b border-border bg-muted/20 px-4 py-2">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('bold'); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-[#3D5AFE] transition-colors"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('italic'); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-[#3D5AFE] transition-colors"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('underline'); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-[#3D5AFE] transition-colors"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCommand('insertUnorderedList'); }}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-[#3D5AFE] transition-colors"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 relative">
        <div 
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full p-4 text-sm leading-relaxed outline-none overflow-y-auto prose prose-sm dark:prose-invert max-w-none",
            minHeight
          )}
          style={{ whiteSpace: 'pre-wrap' }}
        />
        {!value && !isFocused && (
          <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none text-sm italic">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}
