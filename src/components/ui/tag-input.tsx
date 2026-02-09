import React, { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({ 
  tags, 
  onAddTag, 
  onRemoveTag, 
  placeholder = "Escribe y presiona Enter",
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    }
  };

  const addTag = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !tags.includes(trimmedInput) && tags.length < maxTags) {
      onAddTag(trimmedInput);
      setInputValue('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Tags List - displayed above input as per design */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary"
              className="bg-yellow-400 hover:bg-yellow-500 text-black border-none rounded-full px-3 py-1 text-sm font-medium flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length >= maxTags ? `Máximo ${maxTags} tags` : placeholder}
        disabled={tags.length >= maxTags}
        className="bg-white border-gray-200 focus:border-yellow-400 focus:ring-yellow-400"
      />
    </div>
  );
}
