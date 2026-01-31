import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESET_COLORS = [
  '#3D5AFE', // Primary blue
  '#1c1c1c', // Dark
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F97316', // Orange
  '#6B7280', // Gray
];

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

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

  return (
    <div className="space-y-3">
      <Label className="text-[#1c1c1c]">{label}</Label>
      
      <div className="flex items-center gap-3">
        {/* Color Preview */}
        <div
          className="w-12 h-12 rounded-lg border border-gray-200 shadow-sm flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        
        {/* Hex Input */}
        <Input
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          placeholder="#3D5AFE"
          className="flex-1 font-mono uppercase border-gray-300 bg-white text-[#1c1c1c] focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
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
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              value.toLowerCase() === color.toLowerCase()
                ? 'border-[#1c1c1c] scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}
