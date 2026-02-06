import { useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder,
  className 
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const applyFormat = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const beforeSelection = value.substring(0, start);
    const afterSelection = value.substring(end);
    
    const newText = beforeSelection + prefix + selectedText + suffix + afterSelection;
    onChange(newText);
    
    // Restore cursor position after format
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText.length > 0 
        ? start + prefix.length + selectedText.length + suffix.length
        : start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertList = (ordered: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Check if we need a newline
    const needsNewline = beforeCursor.length > 0 && !beforeCursor.endsWith('\n');
    const prefix = needsNewline ? '\n' : '';
    const listItem = ordered ? '1. ' : '- ';
    
    const newText = beforeCursor + prefix + listItem + afterCursor;
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + listItem.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Debounce the onChange to avoid too many updates
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const timer = setTimeout(() => {
      onChange(newValue);
    }, 300);
    
    setDebounceTimer(timer);
    
    // Update immediately for responsive feel
    if (textareaRef.current) {
      textareaRef.current.value = newValue;
    }
  };

  const formatButtons = [
    { icon: Bold, action: () => applyFormat('**'), title: 'Negrita' },
    { icon: Italic, action: () => applyFormat('*'), title: 'Cursiva' },
    { icon: Underline, action: () => applyFormat('~~'), title: 'Subrayado' },
    { icon: List, action: () => insertList(false), title: 'Lista' },
    { icon: ListOrdered, action: () => insertList(true), title: 'Lista numerada' },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-muted/50 w-fit">
        {formatButtons.map((btn, idx) => (
          <Button
            key={idx}
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={btn.action}
            title={btn.title}
          >
            <btn.icon className="h-4 w-4" />
          </Button>
        ))}
      </div>
      
      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={6}
        className="min-h-[160px] resize-none"
      />
    </div>
  );
}
