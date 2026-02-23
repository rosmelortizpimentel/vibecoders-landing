import * as React from "react";
import { Check, ChevronsUpDown, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TimezonePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Get all IANA timezones
function getAllTimezones(): string[] {
  try {
    // Use type assertion for newer Intl API
    const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
    if (intl.supportedValuesOf) {
      return intl.supportedValuesOf("timeZone");
    }
    throw new Error("Not supported");
  } catch {
    // Fallback for older browsers
    return [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "America/Lima",
      "America/Bogota",
      "America/Mexico_City",
      "America/Sao_Paulo",
      "America/Buenos_Aires",
      "America/Santiago",
      "America/Caracas",
      "America/Toronto",
      "America/Vancouver",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Europe/Madrid",
      "Europe/Rome",
      "Europe/Amsterdam",
      "Europe/Moscow",
      "Europe/Istanbul",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Hong_Kong",
      "Asia/Singapore",
      "Asia/Seoul",
      "Asia/Dubai",
      "Asia/Kolkata",
      "Asia/Bangkok",
      "Asia/Jakarta",
      "Australia/Sydney",
      "Australia/Melbourne",
      "Australia/Perth",
      "Pacific/Auckland",
      "Pacific/Honolulu",
      "Africa/Cairo",
      "Africa/Lagos",
      "Africa/Johannesburg",
    ];
  }
}

// Get GMT offset for a timezone
function getTimezoneOffset(tz: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find((p) => p.type === "timeZoneName");
    return offsetPart?.value || "GMT";
  } catch {
    return "GMT";
  }
}

// Format timezone for display
function formatTimezoneLabel(tz: string): string {
  const city = tz.split("/").pop()?.replace(/_/g, " ") || tz;
  const offset = getTimezoneOffset(tz);
  return `${city} (${offset})`;
}

// Get region from timezone
function getRegion(tz: string): string {
  const region = tz.split("/")[0];
  return region || "Other";
}

// Group timezones by region
function groupTimezones(timezones: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  
  timezones.forEach((tz) => {
    const region = getRegion(tz);
    if (!groups[region]) {
      groups[region] = [];
    }
    groups[region].push(tz);
  });

  // Sort regions
  const sortedGroups: Record<string, string[]> = {};
  const regionOrder = ["America", "Europe", "Asia", "Africa", "Australia", "Pacific", "Atlantic", "Indian", "Antarctica", "Arctic", "Etc"];
  
  regionOrder.forEach((region) => {
    if (groups[region]) {
      sortedGroups[region] = groups[region].sort((a, b) => {
        const labelA = formatTimezoneLabel(a);
        const labelB = formatTimezoneLabel(b);
        return labelA.localeCompare(labelB);
      });
    }
  });

  // Add any remaining regions
  Object.keys(groups).forEach((region) => {
    if (!sortedGroups[region]) {
      sortedGroups[region] = groups[region].sort((a, b) => {
        const labelA = formatTimezoneLabel(a);
        const labelB = formatTimezoneLabel(b);
        return labelA.localeCompare(labelB);
      });
    }
  });

  return sortedGroups;
}

const allTimezones = getAllTimezones();
const groupedTimezones = groupTimezones(allTimezones);

export function TimezonePicker({ value, onChange, className }: TimezonePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = value ? formatTimezoneLabel(value) : "Select timezone...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-9 border-border font-normal", className)}
        >
          <span className="flex items-center gap-2 truncate">
            <Globe className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{selectedLabel}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-card border-border" align="start">
        <Command>
          <CommandInput placeholder="Search timezone..." className="h-9" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No timezone found.</CommandEmpty>
            {Object.entries(groupedTimezones).map(([region, tzList]) => (
              <CommandGroup key={region} heading={region}>
                {tzList.map((tz) => (
                  <CommandItem
                    key={tz}
                    value={`${tz} ${formatTimezoneLabel(tz)}`}
                    onSelect={() => {
                      onChange(tz);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tz ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="truncate">{formatTimezoneLabel(tz)}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
