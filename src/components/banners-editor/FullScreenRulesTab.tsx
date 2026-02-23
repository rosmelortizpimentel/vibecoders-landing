import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { MapPin, Zap, RefreshCcw, Calendar, Globe, Monitor, Tablet, Smartphone, Plus, X } from "lucide-react";
import { type PopupRules, type UrlPattern } from "@/hooks/usePopups";
import { TimezonePicker } from "@/components/ui/TimezonePicker";

interface FullScreenRulesTabProps {
  rulesConfig: PopupRules;
  setRulesConfig: React.Dispatch<React.SetStateAction<PopupRules>>;
}

export const FullScreenRulesTab = ({
  rulesConfig,
  setRulesConfig,
}: FullScreenRulesTabProps) => {
  const [newPattern, setNewPattern] = useState("");
  const [newPatternType, setNewPatternType] = useState<UrlPattern["type"]>("contains");
  const [newSubdomain, setNewSubdomain] = useState("");

  // Add URL pattern
  const addUrlPattern = () => {
    if (!newPattern.trim()) return;
    setRulesConfig(prev => ({
      ...prev,
      urlTargeting: {
        ...prev.urlTargeting,
        patterns: [...prev.urlTargeting.patterns, { type: newPatternType, value: newPattern.trim() }],
      },
    }));
    setNewPattern("");
  };

  // Remove URL pattern
  const removeUrlPattern = (index: number) => {
    setRulesConfig(prev => ({
      ...prev,
      urlTargeting: {
        ...prev.urlTargeting,
        patterns: prev.urlTargeting.patterns.filter((_, i) => i !== index),
      },
    }));
  };

  // Add subdomain
  const addSubdomain = () => {
    if (!newSubdomain.trim()) return;
    setRulesConfig(prev => ({
      ...prev,
      subdomainTargeting: {
        ...prev.subdomainTargeting,
        list: [...prev.subdomainTargeting.list, newSubdomain.trim()],
      },
    }));
    setNewSubdomain("");
  };

  // Remove subdomain
  const removeSubdomain = (index: number) => {
    setRulesConfig(prev => ({
      ...prev,
      subdomainTargeting: {
        ...prev.subdomainTargeting,
        list: prev.subdomainTargeting.list.filter((_, i) => i !== index),
      },
    }));
  };

  // Format pattern for display
  const formatPattern = (pattern: UrlPattern) => {
    const prefix = pattern.type === "exact" ? "=" : pattern.type === "startsWith" ? "^" : pattern.type === "regex" ? "~" : "∋";
    return `${prefix} ${pattern.value}`;
  };

  // Helper to format Date to datetime-local format (local time, not UTC)
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Auto-adjust dates: if startAt > endAt, move endAt forward by 1 hour
  const handleStartAtChange = (value: string) => {
    setRulesConfig(prev => {
      const newScheduling = { ...prev.scheduling, startAt: value || null };
      
      if (value && prev.scheduling.endAt) {
        const startDate = new Date(value);
        const endDate = new Date(prev.scheduling.endAt);
        if (startDate >= endDate) {
          // Move endAt to startAt + 1 hour
          const newEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
          newScheduling.endAt = formatDateTimeLocal(newEnd);
        }
      }
      
      return { ...prev, scheduling: newScheduling };
    });
  };

  // Auto-adjust dates: if endAt < startAt, move startAt backward by 1 hour
  const handleEndAtChange = (value: string) => {
    setRulesConfig(prev => {
      const newScheduling = { ...prev.scheduling, endAt: value || null };
      
      if (value && prev.scheduling.startAt) {
        const endDate = new Date(value);
        const startDate = new Date(prev.scheduling.startAt);
        if (endDate <= startDate) {
          // Move startAt to endAt - 1 hour
          const newStart = new Date(endDate.getTime() - 60 * 60 * 1000);
          newScheduling.startAt = formatDateTimeLocal(newStart);
        }
      }
      
      return { ...prev, scheduling: newScheduling };
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* URL Targeting */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            URL Targeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Mode</Label>
            <Select
              value={rulesConfig.urlTargeting.mode}
              onValueChange={(value: 'all' | 'include' | 'exclude') =>
                setRulesConfig(prev => ({
                  ...prev,
                  urlTargeting: { ...prev.urlTargeting, mode: value }
                }))
              }
            >
              <SelectTrigger className="h-9 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Show on all pages</SelectItem>
                <SelectItem value="include">Only on specific pages</SelectItem>
                <SelectItem value="exclude">Exclude specific pages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rulesConfig.urlTargeting.mode !== 'all' && (
            <>
              <div className="flex gap-2">
                <Select
                  value={newPatternType}
                  onValueChange={(value: UrlPattern["type"]) => setNewPatternType(value)}
                >
                  <SelectTrigger className="h-9 border-border w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="exact">Exact</SelectItem>
                    <SelectItem value="contains">Contains</SelectItem>
                    <SelectItem value="startsWith">Starts with</SelectItem>
                    <SelectItem value="regex">Regex</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={newPattern}
                  onChange={(e) => setNewPattern(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addUrlPattern()}
                  className="h-9 border-border flex-1"
                  placeholder="/pricing, /blog/*"
                />
                <Button size="sm" onClick={addUrlPattern} className="h-9 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* URL Pattern chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                {rulesConfig.urlTargeting.patterns.map((pattern, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
                  >
                    <code className="text-xs">{formatPattern(pattern)}</code>
                    <button
                      onClick={() => removeUrlPattern(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {rulesConfig.urlTargeting.patterns.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No patterns added</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subdomain Targeting */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Subdomain Targeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Mode</Label>
            <Select
              value={rulesConfig.subdomainTargeting.mode}
              onValueChange={(value: 'all' | 'include' | 'exclude') =>
                setRulesConfig(prev => ({
                  ...prev,
                  subdomainTargeting: { ...prev.subdomainTargeting, mode: value }
                }))
              }
            >
              <SelectTrigger className="h-9 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All subdomains</SelectItem>
                <SelectItem value="include">Only specific subdomains</SelectItem>
                <SelectItem value="exclude">Exclude specific subdomains</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rulesConfig.subdomainTargeting.mode !== 'all' && (
            <>
              <div className="flex gap-2">
                <Input
                  value={newSubdomain}
                  onChange={(e) => setNewSubdomain(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubdomain()}
                  className="h-9 border-border flex-1"
                  placeholder="store, blog, checkout"
                />
                <Button size="sm" onClick={addSubdomain} className="h-9 px-3">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {rulesConfig.subdomainTargeting.list.map((subdomain, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-sm"
                  >
                    {subdomain}
                    <button
                      onClick={() => removeSubdomain(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {rulesConfig.subdomainTargeting.list.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">No subdomains added</span>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Device Targeting */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Device Targeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={rulesConfig.deviceTargeting.desktop}
                onCheckedChange={(checked) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, desktop: checked }
                }))}
              />
              <Label className="flex items-center gap-1.5 text-sm">
                <Monitor className="w-4 h-4" /> Desktop
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={rulesConfig.deviceTargeting.tablet}
                onCheckedChange={(checked) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, tablet: checked }
                }))}
              />
              <Label className="flex items-center gap-1.5 text-sm">
                <Tablet className="w-4 h-4" /> Tablet
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={rulesConfig.deviceTargeting.mobile}
                onCheckedChange={(checked) => setRulesConfig(prev => ({
                  ...prev,
                  deviceTargeting: { ...prev.deviceTargeting, mobile: checked }
                }))}
              />
              <Label className="flex items-center gap-1.5 text-sm">
                <Smartphone className="w-4 h-4" /> Mobile
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scheduling */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Enable</Label>
              <Switch
                checked={rulesConfig.scheduling.enabled}
                onCheckedChange={(checked) => setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, enabled: checked }
                }))}
              />
            </div>
          </div>
        </CardHeader>
        {rulesConfig.scheduling.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</Label>
                <Input
                  type="datetime-local"
                  value={rulesConfig.scheduling.startAt || ""}
                  onChange={(e) => handleStartAtChange(e.target.value)}
                  className="h-9 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">End Date</Label>
                <Input
                  type="datetime-local"
                  value={rulesConfig.scheduling.endAt || ""}
                  onChange={(e) => handleEndAtChange(e.target.value)}
                  className="h-9 border-border"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">Timezone</Label>
              <TimezonePicker
                value={rulesConfig.scheduling.timezone}
                onChange={(value) => setRulesConfig(prev => ({
                  ...prev,
                  scheduling: { ...prev.scheduling, timezone: value }
                }))}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Trigger */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Trigger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">When to show</Label>
            <Select
              value={rulesConfig.trigger.type}
              onValueChange={(value: 'immediate' | 'time_delay' | 'exit_intent' | 'scroll_percent') =>
                setRulesConfig(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger, type: value, value: value === 'immediate' ? 0 : prev.trigger.value || 5 }
                }))
              }
            >
              <SelectTrigger className="h-9 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="immediate">Immediately on page load</SelectItem>
                <SelectItem value="time_delay">After time delay</SelectItem>
                <SelectItem value="exit_intent">On exit intent</SelectItem>
                <SelectItem value="scroll_percent">After scroll percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(rulesConfig.trigger.type === 'time_delay' || rulesConfig.trigger.type === 'scroll_percent') && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase">
                {rulesConfig.trigger.type === 'time_delay' ? 'Delay (seconds)' : 'Scroll (%)'}
              </Label>
              <Input
                type="number"
                value={rulesConfig.trigger.value}
                onChange={(e) => setRulesConfig(prev => ({
                  ...prev,
                  trigger: { ...prev.trigger, value: Number(e.target.value) }
                }))}
                className="h-9 border-border w-32"
                min={1}
                max={rulesConfig.trigger.type === 'scroll_percent' ? 100 : undefined}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frequency */}
      <Card className="border border-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            Frequency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">Show popup</Label>
            <Select
              value={rulesConfig.frequency.cap}
              onValueChange={(value: PopupRules['frequency']['cap']) =>
                setRulesConfig(prev => ({
                  ...prev,
                  frequency: { cap: value }
                }))
              }
            >
              <SelectTrigger className="h-9 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="always">Every time (testing)</SelectItem>
                <SelectItem value="once_per_session">Once per session</SelectItem>
                <SelectItem value="once_per_day">Once per day</SelectItem>
                <SelectItem value="once_per_week">Once per week</SelectItem>
                <SelectItem value="once_ever">Only once (ever)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
