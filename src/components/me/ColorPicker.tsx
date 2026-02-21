import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  compact?: boolean;
}

// Professional matte colors - not too bright/neon
const PRESET_COLORS = [
  '#3D5AFE', // Brand blue
  '#1c1c1c', // Dark charcoal
  '#2D3748', // Slate gray
  '#4A5568', // Cool gray
  '#718096', // Medium gray
  '#1E3A5F', // Navy blue
  '#2E4057', // Steel blue
  '#14532D', // Forest green
  '#166534', // Emerald matte
  '#7C2D12', // Terracotta
  '#92400E', // Burnt orange
  '#78350F', // Brown
  '#4C1D95', // Deep purple
  '#5B21B6', // Violet matte
  '#831843', // Burgundy
  '#9D174D', // Dark pink
];

export function ColorPicker({ label, value, onChange, compact = false }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  // Sync input when value changes externally
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    // Only update if it's a valid hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  const handlePickerChange = (color: string) => {
    setInputValue(color);
    onChange(color);
  };

  if (compact) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-7 h-7 rounded-full border-2 border-border shadow-sm flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all"
            style={{ backgroundColor: value }}
            aria-label="Abrir selector de color"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end">
      <HexColorPicker color={value} onChange={handlePickerChange} />
      <div className="mt-4 flex items-center gap-2 px-1">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">#</span>
          <Input
            value={inputValue.replace('#', '').toUpperCase()}
            onChange={e => handleInputChange('#' + e.target.value)}
            placeholder="000000"
            className="pl-7 pr-3 py-1 h-9 rounded-full bg-muted/30 border-none font-mono text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
            maxLength={6}
          />
        </div>
      </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-4">
      {label && <Label className="text-sm font-medium text-foreground/80">{label}</Label>}
      
      <div className="flex items-center gap-3">
        {/* Color Preview - clickable to open picker */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-border shadow-sm flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              style={{ backgroundColor: value }}
              aria-label="Abrir selector de color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-3 rounded-2xl shadow-xl border-none" align="start" sideOffset={8}>
            <div className="space-y-4">
              <HexColorPicker color={value} onChange={handlePickerChange} className="!w-full !h-40" />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">#</span>
                <Input
                  value={inputValue.replace('#', '').toUpperCase()}
                  onChange={e => handleInputChange('#' + e.target.value)}
                  placeholder="000000"
                  className="pl-7 pr-3 py-1 h-9 rounded-full bg-muted/50 border-none font-mono text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                  maxLength={6}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Minimalist Hex Display */}
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-mono">#</span>
          <Input
            value={inputValue.replace('#', '').toUpperCase()}
            onChange={e => handleInputChange('#' + e.target.value)}
            placeholder="000000"
            className="pl-7 pr-3 h-10 rounded-full bg-muted/20 border-border/50 font-mono text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
            maxLength={6}
          />
        </div>
      </div>

      {/* Preset Colors - Clean small dots */}
      <div className="flex flex-wrap gap-2.5 px-0.5">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={cn(
              "w-5 h-5 rounded-full border border-white shadow-sm transition-all hover:scale-125",
              value.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary ring-offset-2 scale-110"
            )}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
