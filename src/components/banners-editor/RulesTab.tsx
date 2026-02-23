import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { type PopupRules, type UrlPattern } from "@/hooks/usePopups";
import { useProfile } from "@/hooks/useProfile";
import { Plus, X, Monitor, Tablet, Smartphone } from "lucide-react";

// Common timezones
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern (UTC-5)" },
  { value: "America/Chicago", label: "Central (UTC-6)" },
  { value: "America/Los_Angeles", label: "Pacific (UTC-8)" },
  { value: "America/Lima", label: "Lima (UTC-5)" },
  { value: "Europe/London", label: "London (UTC+0)" },
  { value: "Europe/Madrid", label: "Madrid (UTC+1)" },
];

interface RulesTabProps {
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
  projectDomain?: string;
}

export const RulesTab = ({
  rulesConfig,
  setRulesConfig,
  projectDomain = 'example.com',
}: RulesTabProps) => {
  const { t, language } = useLanguage();
  const { data: profile } = useProfile();
  // Strip www. prefix for cleaner subdomain display
  const cleanDomain = projectDomain.replace(/^www\./i, '');
  const [newPattern, setNewPattern] = useState("");
  const [patternType, setPatternType] = useState<'exact' | 'contains' | 'startsWith'>('contains');

  const addUrlPattern = () => {
    if (!newPattern.trim()) return;
    setRulesConfig(prev => ({
      ...prev,
      urlTargeting: {
        ...prev.urlTargeting,
        patterns: [...prev.urlTargeting.patterns, { type: patternType, value: newPattern.trim() }],
      },
    }));
    setNewPattern("");
  };

  const removeUrlPattern = (index: number) => {
    setRulesConfig(prev => ({
      ...prev,
      urlTargeting: {
        ...prev.urlTargeting,
        patterns: prev.urlTargeting.patterns.filter((_, i) => i !== index),
      },
    }));
  };

  const [newSubdomain, setNewSubdomain] = useState("");

  // Validate subdomain: only lowercase letters, numbers, hyphens
  const isValidSubdomain = (s: string) => /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i.test(s);

  const addSubdomain = () => {
    const sub = newSubdomain.trim().toLowerCase();
    if (!sub || !isValidSubdomain(sub)) return;
    // Avoid duplicates
    if (rulesConfig.subdomainTargeting.list.includes(sub)) {
      setNewSubdomain("");
      return;
    }
    setRulesConfig(prev => ({
      ...prev,
      subdomainTargeting: {
        ...prev.subdomainTargeting,
        list: [...prev.subdomainTargeting.list, sub],
      },
    }));
    setNewSubdomain("");
  };

  const removeSubdomain = (index: number) => {
    setRulesConfig(prev => ({
      ...prev,
      subdomainTargeting: {
        ...prev.subdomainTargeting,
        list: prev.subdomainTargeting.list.filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="p-3 space-y-4">
      {/* URL Targeting */}
      <div>
        <span className="panel-label">Where to Show</span>
        <div className="mt-2 space-y-2">
          <Select
            value={rulesConfig.urlTargeting.mode}
            onValueChange={(value: 'all' | 'include' | 'exclude') =>
              setRulesConfig(prev => ({
                ...prev,
                urlTargeting: { ...prev.urlTargeting, mode: value }
              }))
            }
          >
            <SelectTrigger className="input-figma">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pages</SelectItem>
              <SelectItem value="include">Specific pages only</SelectItem>
              <SelectItem value="exclude">Exclude pages</SelectItem>
            </SelectContent>
          </Select>

          {rulesConfig.urlTargeting.mode !== 'all' && (
            <>
              <div className="flex gap-1">
                <Select
                  value={patternType}
                  onValueChange={(v: 'exact' | 'contains' | 'startsWith') => setPatternType(v)}
                >
                  <SelectTrigger className="input-figma w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">Exact</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="startsWith">Starts</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUrlPattern()}
                  className="input-figma flex-1"
                  placeholder={patternType === 'exact' ? "/" : "/pricing"}
                />
                <Button size="sm" onClick={addUrlPattern} className="h-8 w-8 p-0">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {rulesConfig.urlTargeting.patterns.map((p, i) => {
                  const typeLabel = p.type === 'exact'
                    ? (language === 'es' ? 'Exacto' : 'Exact')
                    : p.type === 'startsWith'
                      ? (language === 'es' ? 'Inicia' : 'Starts')
                      : (language === 'es' ? 'Contiene' : 'Contains');

                  // Clean path to avoid double slashes if user types /
                  const cleanPath = p.value.startsWith('/') ? p.value : '/' + p.value;
                  const displayValue = p.type === 'exact'
                    ? `${cleanDomain}${cleanPath}`
                    : p.type === 'startsWith'
                      ? `${cleanDomain}${cleanPath}...`
                      : `...${p.value}...`;

                  return (
                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-xs">
                      <span className="text-muted-foreground font-medium">{typeLabel}:</span>
                      {displayValue}
                      <button onClick={() => removeUrlPattern(i)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subdomain Targeting */}
      <div>
        <span className="panel-label">{language === 'es' ? 'Subdominio' : 'Subdomain'}</span>
        <div className="mt-2 space-y-2">
          <Select
            value={
              rulesConfig.subdomainTargeting.mode === 'include' &&
                rulesConfig.subdomainTargeting.list.length === 1 &&
                rulesConfig.subdomainTargeting.list[0] === 'www'
                ? 'main_only'
                : rulesConfig.subdomainTargeting.mode
            }
            onValueChange={(value: 'all' | 'main_only' | 'include' | 'exclude') => {
              if (value === 'main_only') {
                setRulesConfig(prev => ({
                  ...prev,
                  subdomainTargeting: { mode: 'include', list: ['www'] }
                }));
              } else {
                setRulesConfig(prev => ({
                  ...prev,
                  subdomainTargeting: {
                    ...prev.subdomainTargeting,
                    mode: value as 'all' | 'include' | 'exclude',
                    // Clear list if switching to all, otherwise keep (or clear if switching from main_only logic)
                    list: value === 'all' ? [] : prev.subdomainTargeting.list
                  }
                }));
              }
            }}
          >
            <SelectTrigger className="input-figma">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{language === 'es' ? 'Todos los subdominios' : 'All subdomains'}</SelectItem>
              <SelectItem value="main_only">{language === 'es' ? 'Solo dominio principal' : 'Main domain only'}</SelectItem>
              <SelectItem value="include">{language === 'es' ? 'Solo específicos' : 'Only specific'}</SelectItem>
              <SelectItem value="exclude">{language === 'es' ? 'Excluir' : 'Exclude'}</SelectItem>
            </SelectContent>
          </Select>

          {/* Show main domain when main_only is selected */}
          {rulesConfig.subdomainTargeting.mode === 'include' &&
            rulesConfig.subdomainTargeting.list.length === 1 &&
            rulesConfig.subdomainTargeting.list[0] === 'www' && (
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded">
                ✓ {cleanDomain}
              </div>
            )}

          {((rulesConfig.subdomainTargeting.mode === 'include' &&
            // Hide inputs if it's the special "main_only" state (include + www)
            !(rulesConfig.subdomainTargeting.list.length === 1 && rulesConfig.subdomainTargeting.list[0] === 'www'))
            || rulesConfig.subdomainTargeting.mode === 'exclude') && (
              <>
                <div className="flex items-center gap-1">
                  <Input
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    onKeyDown={(e) => e.key === "Enter" && addSubdomain()}
                    className="input-figma w-24"
                    placeholder="store"
                  />
                  <span className="text-xs text-muted-foreground">.{cleanDomain}</span>
                  <Button size="sm" onClick={addSubdomain} className="h-8 w-8 p-0 ml-auto">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rulesConfig.subdomainTargeting.list.map((sub, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-xs">
                      <strong>{sub}</strong>.{cleanDomain}
                      <button onClick={() => removeSubdomain(i)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Device Targeting */}
      <div>
        <span className="panel-label">Devices</span>
        <div className="mt-2 flex gap-3">
          <label className="flex items-center gap-1 text-xs">
            <Switch
              checked={rulesConfig.deviceTargeting.desktop}
              onCheckedChange={(c) => setRulesConfig(prev => ({
                ...prev,
                deviceTargeting: { ...prev.deviceTargeting, desktop: c }
              }))}
            />
            <Monitor className="w-3 h-3" />
          </label>
          <label className="flex items-center gap-1 text-xs">
            <Switch
              checked={rulesConfig.deviceTargeting.tablet}
              onCheckedChange={(c) => setRulesConfig(prev => ({
                ...prev,
                deviceTargeting: { ...prev.deviceTargeting, tablet: c }
              }))}
            />
            <Tablet className="w-3 h-3" />
          </label>
          <label className="flex items-center gap-1 text-xs">
            <Switch
              checked={rulesConfig.deviceTargeting.mobile}
              onCheckedChange={(c) => setRulesConfig(prev => ({
                ...prev,
                deviceTargeting: { ...prev.deviceTargeting, mobile: c }
              }))}
            />
            <Smartphone className="w-3 h-3" />
          </label>
        </div>
      </div>

      {/* Trigger */}
      <div>
        <span className="panel-label">When to Show</span>
        <div className="mt-2 space-y-2">
          <Select
            value={rulesConfig.trigger.type}
            onValueChange={(value: 'immediate' | 'time_delay' | 'exit_intent' | 'scroll_percent') =>
              setRulesConfig(prev => ({
                ...prev,
                trigger: { ...prev.trigger, type: value, value: value === 'immediate' ? 0 : prev.trigger.value || 5 }
              }))
            }
          >
            <SelectTrigger className="input-figma">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="time_delay">Time Delay</SelectItem>
              <SelectItem value="exit_intent">Exit Intent</SelectItem>
              <SelectItem value="scroll_percent">Scroll %</SelectItem>
            </SelectContent>
          </Select>
          {(rulesConfig.trigger.type === 'time_delay' || rulesConfig.trigger.type === 'scroll_percent') && (
            <Input
              type="number"
              value={rulesConfig.trigger.value}
              onChange={(e) => setRulesConfig(prev => ({
                ...prev,
                trigger: { ...prev.trigger, value: Number(e.target.value) }
              }))}
              className="input-figma w-20"
              min={1}
              max={rulesConfig.trigger.type === 'scroll_percent' ? 100 : undefined}
            />
          )}
        </div>
      </div>

      {/* Frequency */}
      <div>
        <span className="panel-label">How Often</span>
        <div className="mt-2">
          <Select
            value={rulesConfig.frequency.cap}
            onValueChange={(value: PopupRules['frequency']['cap']) =>
              setRulesConfig(prev => ({
                ...prev,
                frequency: { cap: value }
              }))
            }
          >
            <SelectTrigger className="input-figma">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Always (testing)</SelectItem>
              <SelectItem value="once_per_session">Once/session</SelectItem>
              <SelectItem value="once_per_day">Once/day</SelectItem>
              <SelectItem value="once_per_week">Once/week</SelectItem>
              <SelectItem value="once_ever">Once ever</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Schedule */}
      {/* Schedule */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="panel-label">Schedule</span>
          <Switch
            checked={!!rulesConfig.scheduling.startAt || !!rulesConfig.scheduling.endAt}
            onCheckedChange={(checked) => {
              if (checked) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                setRulesConfig(prev => ({
                  ...prev,
                  scheduling: {
                    ...prev.scheduling,
                    startAt: now.toISOString().slice(0, 16),
                    endAt: tomorrow.toISOString().slice(0, 16)
                  }
                }));
              } else {
                setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, startAt: null, endAt: null }
                }));
              }
            }}
          />
        </div>

        {(rulesConfig.scheduling.startAt || rulesConfig.scheduling.endAt) && (
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-label uppercase text-[10px] text-muted-foreground mb-1 block">Start</Label>
              <Input
                type="datetime-local"
                value={rulesConfig.scheduling.startAt || ""}
                onChange={(e) => setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, startAt: e.target.value || null }
                }))}
                className="input-figma"
              />
            </div>
            <div>
              <Label className="text-label uppercase text-[10px] text-muted-foreground mb-1 block">End</Label>
              <Input
                type="datetime-local"
                value={rulesConfig.scheduling.endAt || ""}
                onChange={(e) => setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, endAt: e.target.value || null }
                }))}
                className="input-figma"
              />
            </div>
            <div>
              <Label className="text-label uppercase text-[10px] text-muted-foreground mb-1 block">Timezone</Label>
              <Select
                value={rulesConfig.scheduling.timezone || profile?.timezone || "UTC"}
                onValueChange={(value) => setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, timezone: value }
                }))}
              >
                <SelectTrigger className="input-figma">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
