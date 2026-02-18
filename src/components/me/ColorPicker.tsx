import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
          <div className="mt-3 flex items-center gap-2">
            <span className="text-muted-foreground text-sm">#</span>
            <Input
              value={inputValue.replace('#', '')}
              onChange={e => handleInputChange('#' + e.target.value)}
              placeholder="3D5AFE"
              className="font-mono uppercase text-sm h-8"
              maxLength={6}
            />
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-3">
      {label && <Label className="text-[#1c1c1c]">{label}</Label>}
      
      <div className="flex items-center gap-3">
        {/* Color Preview - clickable to open picker */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#3D5AFE] hover:ring-offset-2 transition-all"
              style={{ backgroundColor: value }}
              aria-label="Abrir selector de color"
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <HexColorPicker color={value} onChange={handlePickerChange} />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-gray-500 text-sm">#</span>
              <Input
                value={inputValue.replace('#', '')}
                onChange={e => handleInputChange('#' + e.target.value)}
                placeholder="3D5AFE"
                className="font-mono uppercase text-sm h-8"
                maxLength={6}
              />
            </div>
          </PopoverContent>
        </Popover>
        
        {/* Hex Input */}
        <Input
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="#3D5AFE"
          className="flex-1 font-mono uppercase border-gray-300 bg-white text-[#1c1c1c] focus:border-[#3D5AFE] focus:ring-0"
          maxLength={7}
        />
      </div>

      {/* Preset Colors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => handlePresetClick(color)}
            className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-[#1c1c1c] scale-110 ring-2 ring-offset-1 ring-gray-300'
                : 'border-white shadow-sm'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
