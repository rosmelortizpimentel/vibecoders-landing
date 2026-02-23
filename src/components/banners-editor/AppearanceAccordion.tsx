import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PopupConfig } from "@/hooks/usePopups";
import { type BrandingOverrides } from "@/hooks/useDomainBranding";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link, Unlink, Paintbrush } from "lucide-react";
import { FontPicker } from "@/components/ui/FontPicker";
import { useLanguage } from "@/contexts/LanguageContext";
import { ColorPicker } from "@/components/ui/ColorPicker";

interface AppearanceAccordionProps {
  designConfig: PopupConfig;
  setDesignConfig: React.Dispatch<React.SetStateAction<PopupConfig>>;
  brandingOverrides?: BrandingOverrides | null;
}



export const AppearanceAccordion = ({
  designConfig,
  setDesignConfig,
  brandingOverrides,
}: AppearanceAccordionProps) => {
  const { t } = useLanguage();
  const isBanner = designConfig.type === 'bar';
  const [radiusLinked, setRadiusLinked] = useState(true);
  const [paddingLinked, setPaddingLinked] = useState(true);

  return (
    <AccordionItem value="appearance" className="border-b border-border">
      <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline hover:bg-muted/50 px-2 py-1.5 transition-all data-[state=open]:bg-primary/5 data-[state=open]:text-primary data-[state=open]:border-l-2 data-[state=open]:border-l-primary">
        <span className="flex items-center gap-1.5">
          <Paintbrush className="w-3 h-3 flex-shrink-0" />
          {t('editor.sidebar.appearance')}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-2 pb-2 space-y-2">
        {/* Size (Modal only) */}
        {!isBanner && (
          <>
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.size')}</Label>
              <Select
                value={designConfig.size || 'medium'}
                onValueChange={(value: 'small' | 'medium' | 'large' | 'custom') => setDesignConfig(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="h-[30px] w-20 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">{t('editor.sidebar.small')}</SelectItem>
                  <SelectItem value="medium">{t('editor.sidebar.medium')}</SelectItem>
                  <SelectItem value="large">{t('editor.sidebar.large')}</SelectItem>
                  <SelectItem value="custom">{t('editor.sidebar.custom')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Width/Height - only show when size is 'custom' */}
            {designConfig.size === 'custom' && (
              <div className="flex gap-2">
                <div className="flex-1 space-y-0.5">
                  <Label className="text-[8px] text-muted-foreground uppercase">{t('editor.sidebar.width')}</Label>
                  <div className="flex items-center border rounded-md overflow-hidden h-6">
                    <Input
                      type="number"
                      value={designConfig.customWidth || 480}
                      onChange={(e) => setDesignConfig(prev => ({ ...prev, customWidth: parseInt(e.target.value) || 480 }))}
                      className="h-[30px] text-[12px] border-0 text-right pr-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={200}
                      max={1200}
                    />
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 h-full flex items-center">px</span>
                  </div>
                </div>
                <div className="flex-1 space-y-0.5">
                  <Label className="text-[8px] text-muted-foreground uppercase">{t('editor.sidebar.height')}</Label>
                  <div className="flex items-center border rounded-md overflow-hidden h-6">
                    <Input
                      type="number"
                      value={designConfig.customHeight || 0}
                      onChange={(e) => setDesignConfig(prev => ({ ...prev, customHeight: parseInt(e.target.value) || 0 }))}
                      className="h-[30px] text-[12px] border-0 text-right pr-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={0}
                      max={1200}
                      placeholder="auto"
                    />
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 h-full flex items-center">px</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Position (Banner only) */}
        {isBanner && (
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.position')}</Label>
            <Select
              value={designConfig.position || 'top'}
              onValueChange={(value: 'top' | 'bottom') => setDesignConfig(prev => ({ ...prev, position: value }))}
            >
              <SelectTrigger className="h-[30px] w-20 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">{t('editor.sidebar.top')}</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Fixed (Banner only) */}
        {isBanner && (
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.fixed')}</Label>
            <Switch
              checked={designConfig.fixed}
              onCheckedChange={(checked) => setDesignConfig(prev => ({ ...prev, fixed: checked }))}
              className="scale-75"
            />
          </div>
        )}

        {/* Background Color */}
        <div className="flex items-center justify-between">
          <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.background')}</Label>
          <div className="flex items-center gap-1">
            <ColorPicker
              value={designConfig.colors?.background || designConfig.style?.backgroundColor || '#ffffff'}
              onChange={(color) => setDesignConfig(prev => ({
                ...prev,
                colors: { ...prev.colors, background: color },
                style: { ...prev.style, backgroundColor: color },
              }))}
              brandingColors={brandingOverrides?.colors}
            />
            <Input
              value={designConfig.colors?.background || designConfig.style?.backgroundColor || '#ffffff'}
              onChange={(e) => setDesignConfig(prev => ({
                ...prev,
                colors: { ...prev.colors, background: e.target.value },
                style: { ...prev.style, backgroundColor: e.target.value },
              }))}
              className="h-[30px] w-16 font-mono text-[10px]"
            />
          </div>
        </div>

        {/* Overlay Color (Modal only) */}
        {!isBanner && (
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.overlay')}</Label>
            <div className="flex items-center gap-1">
              <ColorPicker
                value={designConfig.colors?.overlay?.replace(/rgba?\([^)]+\)/, '#000000').slice(0, 7) || '#000000'}
                onChange={(color) => setDesignConfig(prev => ({
                  ...prev,
                  colors: { ...prev.colors, overlay: color + 'CC' },
                }))}
                brandingColors={brandingOverrides?.colors}
              />
              <span className="text-[10px] text-muted-foreground">80%</span>
            </div>
          </div>
        )}

        {/* Font Family */}
        <div className="flex items-center justify-between">
          <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.font')}</Label>
          <FontPicker
            value={designConfig.style?.fontFamily || 'Inter'}
            onChange={(value) => setDesignConfig(prev => ({
              ...prev,
              style: { ...prev.style, fontFamily: value },
            }))}
            brandingFont={brandingOverrides?.typography?.fontFamily}
            compact
          />
        </div>

        {/* Load Font Option */}
        <div className="flex items-center justify-between">
          <Label className="text-[9px] text-muted-foreground">{t('editor.sidebar.download_font')}</Label>
          <Switch
            checked={designConfig.style?.loadFont || false}
            onCheckedChange={(checked) => setDesignConfig(prev => ({
              ...prev,
              style: { ...prev.style, loadFont: checked },
            }))}
          />
        </div>


        {/* Border Radius - 4-corner like Moqups */}
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.radius')}</Label>
          <div className="flex flex-col items-center gap-0.5">
            {/* Helper to parse radius */}
            {(() => {
              const parseRadius = (val?: string) => {
                const parts = (val || '12px').split(' ').map(v => parseInt(v) || 0);
                if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
                if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
                if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]]; // CSS standard
                return [parts[0], parts[1] ?? parts[0], parts[2] ?? parts[0], parts[3] ?? parts[1] ?? parts[0]];
              };
              const radius = parseRadius(designConfig.style?.borderRadius);

              const updateRadius = (index: number, val: number) => {
                const newRadius = [...radius];
                if (radiusLinked) {
                  // If linked, update all to the same value
                  newRadius.fill(val);
                } else {
                  newRadius[index] = val;
                }
                setDesignConfig(prev => ({
                  ...prev,
                  style: { ...prev.style, borderRadius: newRadius.map(v => `${v}px`).join(' ') },
                }));
              };

              const toggleLink = () => {
                if (!radiusLinked) {
                  // Enabling link: sync all to the first value (Top-Left)
                  const val = radius[0];
                  setDesignConfig(prev => ({
                    ...prev,
                    style: { ...prev.style, borderRadius: `${val}px ${val}px ${val}px ${val}px` },
                  }));
                }
                setRadiusLinked(!radiusLinked);
              };

              return (
                <>
                  <div className="flex items-center gap-4">
                    {/* Top-Left */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={radius[0]} // TL
                        onChange={(e) => updateRadius(0, parseInt(e.target.value) || 0)}
                        className="h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>
                    {/* Top-Right */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={radius[1]} // TR
                        onChange={(e) => updateRadius(1, parseInt(e.target.value) || 0)}
                        className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${radiusLinked ? 'text-muted-foreground' : ''}`}
                        disabled={radiusLinked}
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>
                  </div>

                  {/* Link toggle */}
                  <button
                    type="button"
                    onClick={toggleLink}
                    className={`w-8 h-6 flex items-center justify-center rounded border ${radiusLinked ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}
                    title={radiusLinked ? 'Unlink corners' : 'Link corners'}
                  >
                    {radiusLinked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-4">
                    {/* Bottom-Right (CSS order: TL, TR, BR, BL) - Wait, visual layout might differ. 
                        Usually layout is TL TR / BL BR. 
                        Index 0: TL, 1: TR, 2: BR, 3: BL
                        So visual Bottom-Left is index 3, Bottom-Right is index 2.
                    */}
                    {/* Bottom-Left (Index 3) */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={radius[3]} // BL
                        onChange={(e) => updateRadius(3, parseInt(e.target.value) || 0)}
                        className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${radiusLinked ? 'text-muted-foreground' : ''}`}
                        disabled={radiusLinked}
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>
                    {/* Bottom-Right (Index 2) */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={radius[2]} // BR
                        onChange={(e) => updateRadius(2, parseInt(e.target.value) || 0)}
                        className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${radiusLinked ? 'text-muted-foreground' : ''}`}
                        disabled={radiusLinked}
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Padding - 4-sided (Top, Right, Bottom, Left) */}
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.sidebar.padding')}</Label>
          <div className="flex flex-col items-center gap-0.5">
            {(() => {
              const parsePadding = (val?: string) => {
                const parts = (val || '24px').split(' ').map(v => parseInt(v) || 0);
                if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
                if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
                if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
                return [parts[0], parts[1] ?? parts[0], parts[2] ?? parts[0], parts[3] ?? parts[1] ?? parts[0]];
              };
              // padding: top right bottom left
              const padding = parsePadding(designConfig.style?.padding);

              const updatePadding = (visualIndex: 'top' | 'right' | 'bottom' | 'left', val: number) => {
                // visual mapping to CSS indices: Top=0, Right=1, Bottom=2, Left=3
                const map = { top: 0, right: 1, bottom: 2, left: 3 };
                const idx = map[visualIndex];

                const newPadding = [...padding];
                if (paddingLinked) {
                  newPadding.fill(val);
                } else {
                  newPadding[idx] = val;
                }
                setDesignConfig(prev => ({
                  ...prev,
                  style: { ...prev.style, padding: newPadding.map(v => `${v}px`).join(' ') },
                }));
              };

              const toggleLink = () => {
                if (!paddingLinked) {
                  // Sync to Top value
                  const val = padding[0];
                  setDesignConfig(prev => ({
                    ...prev,
                    style: { ...prev.style, padding: `${val}px ${val}px ${val}px ${val}px` },
                  }));
                }
                setPaddingLinked(!paddingLinked);
              };

              return (
                <>
                  {/* Top */}
                  <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                    <Input
                      type="number"
                      value={padding[0]}
                      onChange={(e) => updatePadding('top', parseInt(e.target.value) || 0)}
                      className="h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Left */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={padding[3]}
                        onChange={(e) => updatePadding('left', parseInt(e.target.value) || 0)}
                        className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${paddingLinked ? 'text-muted-foreground' : ''}`}
                        disabled={paddingLinked}
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>

                    {/* Link toggle */}
                    <button
                      type="button"
                      onClick={toggleLink}
                      className={`w-8 h-6 flex items-center justify-center rounded border ${paddingLinked ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}
                      title={paddingLinked ? 'Unlink padding' : 'Link padding'}
                    >
                      {paddingLinked ? <Link className="w-3.5 h-3.5" /> : <Unlink className="w-3.5 h-3.5" />}
                    </button>

                    {/* Right */}
                    <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                      <Input
                        type="number"
                        value={padding[1]}
                        onChange={(e) => updatePadding('right', parseInt(e.target.value) || 0)}
                        className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${paddingLinked ? 'text-muted-foreground' : ''}`}
                        disabled={paddingLinked}
                      />
                      <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                    </div>
                  </div>

                  {/* Bottom */}
                  <div className="flex items-center border rounded-md overflow-hidden h-6 w-16">
                    <Input
                      type="number"
                      value={padding[2]}
                      onChange={(e) => updatePadding('bottom', parseInt(e.target.value) || 0)}
                      className={`h-[30px] w-10 text-[12px] border-0 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${paddingLinked ? 'text-muted-foreground' : ''}`}
                      disabled={paddingLinked}
                    />
                    <span className="text-[8px] text-muted-foreground bg-muted px-1 h-full flex items-center">px</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
