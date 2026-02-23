import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Loader2, Image as ImageIcon } from "lucide-react";
import { DomainScrape, BrandingOverrides, getProjectLogoUrl } from "@/hooks/useDomainBranding";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface BrandingCardProps {
  projectId: string;
  domain: string;
  domainScrape: DomainScrape | null | undefined;
  currentOverrides: BrandingOverrides | null;
  onSave: (overrides: BrandingOverrides) => void;
  isSaving: boolean;
}

const FONT_OPTIONS = [
  'Inter',
  'Lato',
  'Roboto',
  'Open Sans',
  'Poppins',
  'Montserrat',
  'Arial',
  'Helvetica',
];

export const BrandingCard = ({
  projectId,
  domain,
  domainScrape,
  currentOverrides,
  onSave,
  isSaving,
}: BrandingCardProps) => {
  const isLoading = domainScrape?.status === 'processing' || domainScrape?.status === 'pending';
  const hasFailed = domainScrape?.status === 'failed';

  // Get logo URL
  const logoUrl = getProjectLogoUrl(domainScrape?.stored_images, domainScrape?.branding);

  // Local state for editable fields
  const [localOverrides, setLocalOverrides] = useState<BrandingOverrides>({
    colors: {
      primary: currentOverrides?.colors?.primary || domainScrape?.branding?.colors?.primary || '#3b82f6',
      background: currentOverrides?.colors?.background || domainScrape?.branding?.colors?.background || '#ffffff',
      text: currentOverrides?.colors?.text || domainScrape?.branding?.colors?.textPrimary || '#1a1a1a',
    },
    typography: {
      fontFamily: currentOverrides?.typography?.fontFamily || domainScrape?.branding?.typography?.fontFamilies?.primary || 'Inter',
      borderRadius: currentOverrides?.typography?.borderRadius || domainScrape?.branding?.spacing?.borderRadius || '8px',
    },
    components: {
      buttonPrimaryBg: currentOverrides?.components?.buttonPrimaryBg || domainScrape?.branding?.components?.buttonPrimary?.background || '#3b82f6',
      buttonPrimaryText: currentOverrides?.components?.buttonPrimaryText || domainScrape?.branding?.components?.buttonPrimary?.textColor || '#ffffff',
      buttonSecondaryBg: currentOverrides?.components?.buttonSecondaryBg || domainScrape?.branding?.components?.buttonSecondary?.background || '#e5e7eb',
      buttonSecondaryText: currentOverrides?.components?.buttonSecondaryText || domainScrape?.branding?.components?.buttonSecondary?.textColor || '#374151',
    },
  });

  const [customLogoUrl, setCustomLogoUrl] = useState<string>(logoUrl || '');

  // Update local state when external data changes
  useEffect(() => {
    if (domainScrape?.branding || currentOverrides) {
      setLocalOverrides({
        colors: {
          primary: currentOverrides?.colors?.primary || domainScrape?.branding?.colors?.primary || '#3b82f6',
          background: currentOverrides?.colors?.background || domainScrape?.branding?.colors?.background || '#ffffff',
          text: currentOverrides?.colors?.text || domainScrape?.branding?.colors?.textPrimary || '#1a1a1a',
        },
        typography: {
          fontFamily: currentOverrides?.typography?.fontFamily || domainScrape?.branding?.typography?.fontFamilies?.primary || 'Inter',
          borderRadius: currentOverrides?.typography?.borderRadius || domainScrape?.branding?.spacing?.borderRadius || '8px',
        },
        components: {
          buttonPrimaryBg: currentOverrides?.components?.buttonPrimaryBg || domainScrape?.branding?.components?.buttonPrimary?.background || '#3b82f6',
          buttonPrimaryText: currentOverrides?.components?.buttonPrimaryText || domainScrape?.branding?.components?.buttonPrimary?.textColor || '#ffffff',
          buttonSecondaryBg: currentOverrides?.components?.buttonSecondaryBg || domainScrape?.branding?.components?.buttonSecondary?.background || '#e5e7eb',
          buttonSecondaryText: currentOverrides?.components?.buttonSecondaryText || domainScrape?.branding?.components?.buttonSecondary?.textColor || '#374151',
        },
      });
      setCustomLogoUrl(getProjectLogoUrl(domainScrape?.stored_images, domainScrape?.branding) || '');
    }
  }, [domainScrape, currentOverrides]);

  const handleSave = () => {
    onSave(localOverrides);
  };

  const updateColor = (path: 'primary' | 'background' | 'text', value: string) => {
    setLocalOverrides(prev => ({
      ...prev,
      colors: { ...prev.colors, [path]: value },
    }));
  };

  const updateButtonStyle = (button: 'buttonPrimaryBg' | 'buttonPrimaryText' | 'buttonSecondaryBg' | 'buttonSecondaryText', value: string) => {
    setLocalOverrides(prev => ({
      ...prev,
      components: { ...prev.components, [button]: value },
    }));
  };

  if (isLoading) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analizando el sitio web...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Branding
          </CardTitle>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
            Guardar Branding
          </Button>
        </div>
        {hasFailed && (
          <p className="text-sm text-muted-foreground mt-1">
            No se pudo analizar el sitio automáticamente. Configura los colores manualmente.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo Section */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
              {customLogoUrl ? (
                <img src={customLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input
                value={customLogoUrl}
                onChange={(e) => setCustomLogoUrl(e.target.value)}
                placeholder="URL del logo"
                className="h-9"
              />
            </div>
          </div>
        </div>

        {/* Colors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Color Primario</Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={localOverrides.colors?.primary || '#3b82f6'}
                onChange={(color) => updateColor('primary', color)}
              />
              <Input
                value={localOverrides.colors?.primary || '#3b82f6'}
                onChange={(e) => updateColor('primary', e.target.value)}
                className="h-9 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Color de Fondo</Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={localOverrides.colors?.background || '#ffffff'}
                onChange={(color) => updateColor('background', color)}
              />
              <Input
                value={localOverrides.colors?.background || '#ffffff'}
                onChange={(e) => updateColor('background', e.target.value)}
                className="h-9 font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Color de Texto</Label>
            <div className="flex items-center gap-2">
              <ColorPicker
                value={localOverrides.colors?.text || '#1a1a1a'}
                onChange={(color) => updateColor('text', color)}
              />
              <Input
                value={localOverrides.colors?.text || '#1a1a1a'}
                onChange={(e) => updateColor('text', e.target.value)}
                className="h-9 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Tipografía</Label>
            <Select
              value={localOverrides.typography?.fontFamily || 'Inter'}
              onValueChange={(value) => setLocalOverrides(prev => ({
                ...prev,
                typography: { ...prev.typography, fontFamily: value },
              }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_OPTIONS.map((font) => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Border Radius</Label>
            <Select
              value={localOverrides.typography?.borderRadius || '8px'}
              onValueChange={(value) => setLocalOverrides(prev => ({
                ...prev,
                typography: { ...prev.typography, borderRadius: value },
              }))}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0px">0px (Cuadrado)</SelectItem>
                <SelectItem value="4px">4px</SelectItem>
                <SelectItem value="8px">8px</SelectItem>
                <SelectItem value="12px">12px</SelectItem>
                <SelectItem value="16px">16px (Redondeado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Button Styles */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">Button Styles</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Button */}
            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Botón Primario</span>
                <div
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: localOverrides.components?.buttonPrimaryBg,
                    color: localOverrides.components?.buttonPrimaryText,
                  }}
                >
                  Preview
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Fondo</Label>
                  <div className="flex items-center gap-1">
                    <ColorPicker
                      value={localOverrides.components?.buttonPrimaryBg || '#3b82f6'}
                      onChange={(color) => updateButtonStyle('buttonPrimaryBg', color)}
                      brandingColors={localOverrides.colors}
                    />
                    <Input
                      value={localOverrides.components?.buttonPrimaryBg || '#3b82f6'}
                      onChange={(e) => updateButtonStyle('buttonPrimaryBg', e.target.value)}
                      className="h-7 font-mono text-[10px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Texto</Label>
                  <div className="flex items-center gap-1">
                    <ColorPicker
                      value={localOverrides.components?.buttonPrimaryText || '#ffffff'}
                      onChange={(color) => updateButtonStyle('buttonPrimaryText', color)}
                      brandingColors={localOverrides.colors}
                    />
                    <Input
                      value={localOverrides.components?.buttonPrimaryText || '#ffffff'}
                      onChange={(e) => updateButtonStyle('buttonPrimaryText', e.target.value)}
                      className="h-7 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Button */}
            <div className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Botón Secundario</span>
                <div
                  className="px-3 py-1.5 rounded text-xs font-medium border"
                  style={{
                    backgroundColor: localOverrides.components?.buttonSecondaryBg,
                    color: localOverrides.components?.buttonSecondaryText,
                  }}
                >
                  Preview
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Fondo</Label>
                  <div className="flex items-center gap-1">
                    <ColorPicker
                      value={localOverrides.components?.buttonSecondaryBg || '#e5e7eb'}
                      onChange={(color) => updateButtonStyle('buttonSecondaryBg', color)}
                      brandingColors={localOverrides.colors}
                    />
                    <Input
                      value={localOverrides.components?.buttonSecondaryBg || '#e5e7eb'}
                      onChange={(e) => updateButtonStyle('buttonSecondaryBg', e.target.value)}
                      className="h-7 font-mono text-[10px]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Texto</Label>
                  <div className="flex items-center gap-1">
                    <ColorPicker
                      value={localOverrides.components?.buttonSecondaryText || '#374151'}
                      onChange={(color) => updateButtonStyle('buttonSecondaryText', color)}
                      brandingColors={localOverrides.colors}
                    />
                    <Input
                      value={localOverrides.components?.buttonSecondaryText || '#374151'}
                      onChange={(e) => updateButtonStyle('buttonSecondaryText', e.target.value)}
                      className="h-7 font-mono text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
