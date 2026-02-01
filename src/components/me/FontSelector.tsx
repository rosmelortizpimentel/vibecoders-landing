import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DEFAULT_FONT_OPTION = 'Default';

const POPULAR_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Raleway',
  'Nunito',
  'Source Sans Pro',
  'PT Sans',
  'Oswald',
  'Playfair Display',
  'Merriweather',
  'Ubuntu',
  'Work Sans',
  'DM Sans',
  'Space Grotesk',
  'Outfit',
  'Sora',
  'Plus Jakarta Sans',
];

const ALL_FONT_OPTIONS = [DEFAULT_FONT_OPTION, ...POPULAR_FONTS];

interface FontSelectorProps {
  value: string;
  onChange: (font: string) => void;
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load all fonts for the dropdown
  useEffect(() => {
    const fontsToLoad = POPULAR_FONTS.filter(f => !loadedFonts.has(f));
    if (fontsToLoad.length === 0) return;

    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f.replace(/ /g, '+')}`).join('&')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setLoadedFonts(new Set(POPULAR_FONTS));

    return () => {
      // Don't remove - fonts should persist
    };
  }, []);

  // Map value for display - empty/null means Default
  const displayValue = value || DEFAULT_FONT_OPTION;

  const handleChange = (newValue: string) => {
    // If Default is selected, pass empty string to clear the font_family
    onChange(newValue === DEFAULT_FONT_OPTION ? '' : newValue);
  };

  return (
    <div className="space-y-3">
      <Select value={displayValue} onValueChange={handleChange}>
        <SelectTrigger className="w-full border-gray-300 bg-white text-[#1c1c1c]">
          <SelectValue placeholder="Selecciona una fuente" />
        </SelectTrigger>
        <SelectContent>
          {ALL_FONT_OPTIONS.map(font => (
            <SelectItem key={font} value={font}>
              <span style={{ fontFamily: font === DEFAULT_FONT_OPTION ? 'CameraPlain, system-ui, sans-serif' : font }}>
                {font}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
