import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { type PopupRules } from "@/hooks/usePopups";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, X, Monitor, Tablet, Smartphone, Crown, Link2, Globe, Zap, RefreshCw, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TimezonePicker } from "@/components/ui/TimezonePicker";
import { useProfile } from "@/hooks/useProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";

interface RulesTriggersAccordionProps {
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
  projectDomain?: string;
}

export const RulesTriggersAccordion = ({
  rulesConfig,
  setRulesConfig,
  projectDomain = 'example.com',
}: RulesTriggersAccordionProps) => {
  const { t, language } = useLanguage();
  const { profile } = useProfile();
  const sub = useSubscription();
  const limits = sub.limits || {
    can_device_target: true,
    can_schedule: true,
    plan_scale: false,
    plan_startup: false,
  };
  const navigate = useNavigate();
  // Strip www. prefix for cleaner subdomain display
  const cleanDomain = projectDomain.replace(/^www\./i, '');
  const [newPattern, setNewPattern] = useState("");
  const [patternType, setPatternType] = useState<'exact' | 'contains' | 'startsWith'>('contains');

  const addPattern = () => {
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

  const removePattern = (index: number) => {
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
    <>
      {/* URL Targeting */}
      <AccordionItem value="url" className="border-b border-border">
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.url_targeting')}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 space-y-1.5">
          <Select
            value={rulesConfig.urlTargeting.mode}
            onValueChange={(value: 'all' | 'include' | 'exclude') =>
              setRulesConfig(prev => ({
                ...prev,
                urlTargeting: { ...prev.urlTargeting, mode: value }
              }))
            }
          >
            <SelectTrigger className="h-[30px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('editor.rules.all_pages')}</SelectItem>
              <SelectItem value="include">{t('editor.rules.specific')}</SelectItem>
              <SelectItem value="exclude">{t('editor.rules.exclude')}</SelectItem>
            </SelectContent>
          </Select>

          {rulesConfig.urlTargeting.mode !== 'all' && (
            <>
              <div className="flex gap-0.5">
                <Select
                  value={patternType}
                  onValueChange={(v: 'exact' | 'contains' | 'startsWith') => setPatternType(v)}
                >
                  <SelectTrigger className="h-[30px] text-[10px] w-20 px-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exact">{t('editor.rules.exact')}</SelectItem>
                    <SelectItem value="contains">{t('editor.rules.contains')}</SelectItem>
                    <SelectItem value="startsWith">{t('editor.rules.starts')}</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPattern()}
                  className="h-[30px] text-[12px] flex-1"
                  placeholder={patternType === 'exact' ? "/" : "/page"}
                />
                <Button size="sm" onClick={addPattern} className="h-[30px] w-[30px] p-0">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {rulesConfig.urlTargeting.patterns.map((p, i) => {
                  const typeLabel = p.type === 'exact'
                    ? t('editor.rules.exact')
                    : p.type === 'startsWith'
                      ? t('editor.rules.starts')
                      : t('editor.rules.contains');

                  // Clean path to avoid double slashes if user types /
                  const cleanPath = p.value.startsWith('/') ? p.value : '/' + p.value;
                  const displayValue = p.type === 'exact'
                    ? `${cleanDomain}${cleanPath}`
                    : p.type === 'startsWith'
                      ? `${cleanDomain}${cleanPath}...`
                      : `...${p.value}...`;

                  return (
                    <span key={i} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted text-[9px]">
                      <span className="text-muted-foreground font-medium">{typeLabel}:</span>
                      {displayValue}
                      <button onClick={() => removePattern(i)}>
                        <X className="w-2 h-2" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>

      {/* Subdomain Targeting */}
      <AccordionItem value="subdomain" className="border-b border-border">
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.subdomain')}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 space-y-1.5">
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
            <SelectTrigger className="h-[30px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('editor.rules.all_subdomains')}</SelectItem>
              <SelectItem value="main_only">{t('editor.rules.main_only')}</SelectItem>
              <SelectItem value="include">{t('editor.rules.only_specific')}</SelectItem>
              <SelectItem value="exclude">{t('editor.rules.exclude')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Show main domain when main_only is selected (mapped to include + www) */}
          {rulesConfig.subdomainTargeting.mode === 'include' &&
            rulesConfig.subdomainTargeting.list.length === 1 &&
            rulesConfig.subdomainTargeting.list[0] === 'www' && (
              <div className="text-[9px] text-muted-foreground bg-muted px-2 py-1 rounded">
                ✓ {cleanDomain}
              </div>
            )}

          {((rulesConfig.subdomainTargeting.mode === 'include' &&
            // Hide inputs if it's the special "main_only" state (include + www)
            !(rulesConfig.subdomainTargeting.list.length === 1 && rulesConfig.subdomainTargeting.list[0] === 'www'))
            || rulesConfig.subdomainTargeting.mode === 'exclude') && (
              <>
                <div className="flex items-center gap-0.5">
                  <Input
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    onKeyDown={(e) => e.key === "Enter" && addSubdomain()}
                    className="h-[30px] text-[12px] w-24"
                    placeholder="store"
                  />
                  <span className="text-[8px] text-muted-foreground">.{cleanDomain}</span>
                  <Button size="sm" onClick={addSubdomain} className="h-[30px] w-[30px] p-0 ml-auto">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {rulesConfig.subdomainTargeting.list.map((sub, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-muted text-[9px]">
                      <strong>{sub}</strong>.{cleanDomain}
                      <button onClick={() => removeSubdomain(i)}>
                        <X className="w-2 h-2" />
                      </button>
                    </span>
                  ))}
                </div>
              </>
            )}
        </AccordionContent>
      </AccordionItem>

      {/* Device Targeting */}
      <AccordionItem value="device" className="border-b border-border">
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.devices')}
            {!limits.can_device_target && (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 relative">
          {/* Upgrade overlay for device targeting */}
          {!limits.can_device_target && (
            <div
              className="absolute inset-0 bg-background/90 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer z-10 rounded"
              onClick={() => navigate('/billing')}
            >
              <Crown className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-[10px] font-medium text-muted-foreground">{t('editor.rules.plan_scale')}</span>
              <span className="text-[8px] text-muted-foreground/70 mt-0.5">
                {t('editor.rules.click_upgrade')}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-[9px]">
              <Switch
                checked={rulesConfig.deviceTargeting.desktop}
                onCheckedChange={(c) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, desktop: c }
                }))}
                disabled={!limits.can_device_target}
              />
              <Monitor className="w-3 h-3" />
            </label>
            <label className="flex items-center gap-1 text-[9px]">
              <Switch
                checked={rulesConfig.deviceTargeting.tablet}
                onCheckedChange={(c) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, tablet: c }
                }))}
                disabled={!limits.can_device_target}
              />
              <Tablet className="w-3 h-3" />
            </label>
            <label className="flex items-center gap-1 text-[9px]">
              <Switch
                checked={rulesConfig.deviceTargeting.mobile}
                onCheckedChange={(c) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, mobile: c }
                }))}
                disabled={!limits.can_device_target}
              />
              <Smartphone className="w-3 h-3" />
            </label>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Trigger */}
      < AccordionItem value="trigger" className="border-b border-border" >
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.trigger')}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.rules.type')}</Label>
            <Select
              value={rulesConfig.trigger.type}
              onValueChange={(value: 'immediate' | 'time_delay' | 'exit_intent' | 'scroll_percent') =>
                setRulesConfig(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger, type: value, value: value === 'immediate' ? 0 : prev.trigger.value || 5 }
                }))
              }
            >
              <SelectTrigger className="h-[30px] text-[12px] w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">{t('editor.rules.immediate')}</SelectItem>
                <SelectItem value="time_delay">{t('editor.rules.delay')}</SelectItem>
                <SelectItem value="exit_intent">{t('editor.rules.exit_intent')}</SelectItem>
                <SelectItem value="scroll_percent">{t('editor.rules.scroll_percent')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(rulesConfig.trigger.type === 'time_delay' || rulesConfig.trigger.type === 'scroll_percent') && (
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-muted-foreground uppercase">
                {rulesConfig.trigger.type === 'time_delay' ? t('editor.rules.sec') : '%'}
              </Label>
              <Input
                type="number"
                value={rulesConfig.trigger.value}
                onChange={(e) => setRulesConfig(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger, value: Number(e.target.value) }
                }))}
                className="h-[30px] text-[12px] w-16"
                min={1}
                max={rulesConfig.trigger.type === 'scroll_percent' ? 100 : undefined}
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem >

      {/* Frequency */}
      < AccordionItem value="frequency" className="border-b border-border" >
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.frequency')}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2">
          <Select
            value={rulesConfig.frequency.cap}
            onValueChange={(value: PopupRules['frequency']['cap']) =>
              setRulesConfig(prev => ({
                ...prev,
                frequency: { cap: value }
              }))
            }
          >
            <SelectTrigger className="h-[30px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">{t('editor.rules.always')}</SelectItem>
              <SelectItem value="once_per_session">{t('editor.rules.once_per_session')}</SelectItem>
              <SelectItem value="once_per_day">{t('editor.rules.once_per_day')}</SelectItem>
              <SelectItem value="once_per_week">{t('editor.rules.once_per_week')}</SelectItem>
              <SelectItem value="once_ever">{t('editor.rules.once_ever')}</SelectItem>
            </SelectContent>
          </Select>
        </AccordionContent>
      </AccordionItem >

      {/* Schedule */}
      <AccordionItem value="schedule" className="border-b-0">
        <AccordionTrigger className="text-[9px] font-semibold uppercase text-muted-foreground hover:no-underline px-2 py-1.5">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {t('editor.rules.schedule')}
            {!limits.can_schedule && (
              <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />
            )}
          </span>
        </AccordionTrigger>
        <AccordionContent className="px-2 pb-2 space-y-3 relative">
          {/* Upgrade overlay for scheduling */}
          {!limits.can_schedule && (
            <div
              className="absolute inset-0 bg-background/90 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer z-10 rounded"
              onClick={() => navigate('/billing')}
            >
              <Crown className="w-5 h-5 text-amber-500 mb-1" />
              <span className="text-[10px] font-medium text-muted-foreground">{t('editor.rules.plan_startup')}</span>
              <span className="text-[8px] text-muted-foreground/70 mt-0.5">
                {t('editor.rules.click_upgrade')}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.rules.enable_schedule')}</Label>
            <Switch
              checked={rulesConfig.scheduling.enabled}
              onCheckedChange={(checked) => {
                if (!limits.can_schedule) return;
                setRulesConfig(prev => ({
                  ...prev,
                  scheduling: {
                    ...prev.scheduling,
                    enabled: checked,
                    // When enabling, set default timezone from user profile settings
                    timezone: checked && !prev.scheduling.timezone
                      ? ((profile as any)?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
                      : prev.scheduling.timezone
                  }
                }));
              }}
              disabled={!limits.can_schedule}
            />
          </div>

          {rulesConfig.scheduling.enabled && (
            <div className="space-y-2 pt-1 border-t border-border/50">
              <div className="space-y-0.5">
                <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.rules.start')}</Label>
                <Input
                  type="datetime-local"
                  value={rulesConfig.scheduling.startAt || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRulesConfig(prev => {
                      const newScheduling = { ...prev.scheduling, startAt: value || null };

                      // Auto-adjust: if startAt >= endAt, move endAt forward by 1 hour
                      if (value && prev.scheduling.endAt) {
                        const startDate = new Date(value);
                        const endDate = new Date(prev.scheduling.endAt);
                        if (startDate >= endDate) {
                          const newEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
                          const year = newEnd.getFullYear();
                          const month = String(newEnd.getMonth() + 1).padStart(2, '0');
                          const day = String(newEnd.getDate()).padStart(2, '0');
                          const hours = String(newEnd.getHours()).padStart(2, '0');
                          const minutes = String(newEnd.getMinutes()).padStart(2, '0');
                          newScheduling.endAt = `${year}-${month}-${day}T${hours}:${minutes}`;
                        }
                      }

                      return { ...prev, scheduling: newScheduling };
                    });
                  }}
                  className="h-[30px] text-[12px]"
                />
              </div>
              <div className="space-y-0.5">
                <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.rules.end')}</Label>
                <Input
                  type="datetime-local"
                  value={rulesConfig.scheduling.endAt || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setRulesConfig(prev => {
                      const newScheduling = { ...prev.scheduling, endAt: value || null };

                      // Auto-adjust: if endAt <= startAt, move startAt backward by 1 hour
                      if (value && prev.scheduling.startAt) {
                        const endDate = new Date(value);
                        const startDate = new Date(prev.scheduling.startAt);
                        if (endDate <= startDate) {
                          const newStart = new Date(endDate.getTime() - 60 * 60 * 1000);
                          const year = newStart.getFullYear();
                          const month = String(newStart.getMonth() + 1).padStart(2, '0');
                          const day = String(newStart.getDate()).padStart(2, '0');
                          const hours = String(newStart.getHours()).padStart(2, '0');
                          const minutes = String(newStart.getMinutes()).padStart(2, '0');
                          newScheduling.startAt = `${year}-${month}-${day}T${hours}:${minutes}`;
                        }
                      }

                      return { ...prev, scheduling: newScheduling };
                    });
                  }}
                  className="h-[30px] text-[12px]"
                />
              </div>

              <div className="space-y-0.5 pt-1">
                <Label className="text-[9px] text-muted-foreground uppercase">{t('editor.rules.timezone')}</Label>
                <TimezonePicker
                  value={rulesConfig.scheduling.timezone || (profile as any)?.timezone}
                  onChange={(value) => setRulesConfig(prev => ({
                    ...prev,
                    scheduling: { ...prev.scheduling, timezone: value }
                  }))}
                  className="h-[30px] text-[12px]"
                />
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem >
    </>
  );
};
