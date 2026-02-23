import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGoogleFonts, GoogleFont } from "@/hooks/useGoogleFonts";

interface FontPickerProps {
    value: string;
    onChange: (font: string) => void;
    brandingFont?: string;
    compact?: boolean;
    placeholder?: string;
}

// Categories for grouping
const CATEGORY_LABELS: Record<string, string> = {
    "sans-serif": "Sans Serif",
    "serif": "Serif",
    "display": "Display",
    "handwriting": "Handwriting",
    "monospace": "Monospace",
};

export const FontPicker = ({
    value,
    onChange,
    brandingFont,
    compact = false,
    placeholder = "Select font...",
}: FontPickerProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const { fonts, isLoading, searchFonts } = useGoogleFonts();
    const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

    // Filter fonts based on search
    const filteredFonts = search ? searchFonts(search) : fonts.slice(0, 50);

    // Group fonts by category
    const groupedFonts = filteredFonts.reduce((acc, font) => {
        const category = font.category || "sans-serif";
        if (!acc[category]) acc[category] = [];
        acc[category].push(font);
        return acc;
    }, {} as Record<string, GoogleFont[]>);

    // Load font preview dynamically
    const loadFontPreview = (fontFamily: string) => {
        if (loadedFonts.has(fontFamily)) return;

        const encodedFont = fontFamily.replace(/ /g, "+");
        const existingLink = document.querySelector(`link[href*="family=${encodedFont}"]`);
        if (existingLink) {
            setLoadedFonts((prev) => new Set(prev).add(fontFamily));
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodedFont}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
        setLoadedFonts((prev) => new Set(prev).add(fontFamily));
    };

    // Load current value font
    useEffect(() => {
        if (value) loadFontPreview(value);
        if (brandingFont) loadFontPreview(brandingFont);
    }, [value, brandingFont]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "justify-between font-normal",
                        compact ? "h-6 w-28 text-[10px]" : "h-8 w-full text-xs"
                    )}
                    style={{ fontFamily: value || "inherit" }}
                >
                    <span className="truncate">{value || placeholder}</span>
                    <ChevronsUpDown className={cn("shrink-0 opacity-50", compact ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4")} />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search fonts..."
                        value={search}
                        onValueChange={setSearch}
                        className="h-8 text-xs"
                    />
                    <CommandList className="max-h-[300px]">
                        {isLoading ? (
                            <div className="py-6 text-center text-xs text-muted-foreground">Loading fonts...</div>
                        ) : (
                            <>
                                <CommandEmpty>No fonts found.</CommandEmpty>

                                {/* Branding font at top */}
                                {brandingFont && (
                                    <CommandGroup heading="Brand Font">
                                        <CommandItem
                                            value={brandingFont}
                                            onSelect={() => {
                                                onChange(brandingFont);
                                                setOpen(false);
                                            }}
                                            className="text-xs"
                                            onMouseEnter={() => loadFontPreview(brandingFont)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-3 w-3",
                                                    value === brandingFont ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <span style={{ fontFamily: brandingFont }}>{brandingFont}</span>
                                        </CommandItem>
                                    </CommandGroup>
                                )}

                                {/* Grouped fonts */}
                                {Object.entries(groupedFonts).map(([category, categoryFonts]) => (
                                    <CommandGroup key={category} heading={CATEGORY_LABELS[category] || category}>
                                        {categoryFonts.slice(0, 15).map((font) => (
                                            <CommandItem
                                                key={font.family}
                                                value={font.family}
                                                onSelect={() => {
                                                    onChange(font.family);
                                                    setOpen(false);
                                                }}
                                                className="text-xs"
                                                onMouseEnter={() => loadFontPreview(font.family)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-3 w-3",
                                                        value === font.family ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span style={{ fontFamily: font.family }}>{font.family}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ))}
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default FontPicker;
