import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  return (
    <div className="space-y-3">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full border-gray-300 bg-white text-[#1c1c1c]">
          <SelectValue placeholder="Selecciona una fuente" />
        </SelectTrigger>
        <SelectContent>
          {POPULAR_FONTS.map(font => (
            <SelectItem key={font} value={font}>
              <span style={{ fontFamily: font }}>{font}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Preview */}
      <div 
        className="p-4 rounded-lg border border-gray-200 bg-gray-50"
        style={{ fontFamily: value }}
      >
        <p className="text-lg font-semibold text-[#1c1c1c]">The quick brown fox jumps over the lazy dog</p>
        <p className="text-sm text-gray-500 mt-1">
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </p>
      </div>
    </div>
  );
}
