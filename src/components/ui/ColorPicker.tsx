import { useState, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface BrandingColors {
  primary?: string;
  accent?: string;
  background?: string;
  text?: string;
  link?: string;
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  brandingColors?: BrandingColors | null;
  className?: string;
}

export const ColorPicker = ({
  value,
  onChange,
  brandingColors,
  className,
}: ColorPickerProps) => {
  const [localValue, setLocalValue] = useState(value || "#000000");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setLocalValue(value || "#000000");
  }, [value]);

  const handleColorChange = (newColor: string) => {
    setLocalValue(newColor);
    onChange(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Add # if missing
    if (val && !val.startsWith("#")) {
      val = "#" + val;
    }
    setLocalValue(val);
    // Only call onChange if it's a valid hex
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(val)) {
      onChange(val);
    }
  };

  // Filter out empty/undefined branding colors
  const activeBrandingColors = brandingColors
    ? Object.entries(brandingColors).filter(([_, color]) => color && color.trim() !== "")
    : [];

  const colorLabels: Record<string, string> = {
    primary: "Pri",
    accent: "Acc",
    background: "Bg",
    text: "Txt",
    link: "Lnk",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-6 h-6 rounded border border-border cursor-pointer transition-all hover:scale-110 hover:shadow-sm flex-shrink-0",
            className
          )}
          style={{ backgroundColor: localValue }}
          title={localValue}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-3" align="end" sideOffset={8}>
        {/* Quick Branding Palette */}
        {activeBrandingColors.length > 0 && (
          <div className="space-y-1">
            <span className="text-[9px] uppercase text-muted-foreground font-medium">
              Branding
            </span>
            <div className="flex gap-1.5">
              {activeBrandingColors.map(([key, color]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleColorChange(color!)}
                  className={cn(
                    "w-7 h-7 rounded border-2 cursor-pointer transition-all hover:scale-110",
                    localValue.toLowerCase() === color?.toLowerCase()
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/50"
                  )}
                  style={{ backgroundColor: color }}
                  title={`${key}: ${color}`}
                >
                  <span className="sr-only">{key}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-1.5">
              {activeBrandingColors.map(([key]) => (
                <span
                  key={key}
                  className="w-7 text-center text-[7px] text-muted-foreground"
                >
                  {colorLabels[key] || key.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {activeBrandingColors.length > 0 && (
          <div className="border-t border-border" />
        )}

        {/* HEX Color Picker */}
        <div className="flex justify-center">
          <HexColorPicker
            color={localValue}
            onChange={handleColorChange}
            style={{ width: "180px", height: "140px" }}
          />
        </div>

        {/* HEX Input */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">#</span>
          <Input
            value={localValue.replace("#", "")}
            onChange={handleInputChange}
            className="h-7 text-xs font-mono uppercase"
            maxLength={6}
            placeholder="000000"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
