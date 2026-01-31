import { useState, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { TechStack } from '@/hooks/useTechStacks';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TechStackSelectorProps {
  stacks: TechStack[];
  groupedStacks: Record<string, TechStack[]>;
  selectedIds: string[];
  onToggle: (stackId: string) => void;
}

export function TechStackSelector({ 
  stacks, 
  groupedStacks, 
  selectedIds, 
  onToggle 
}: TechStackSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stacks based on search query
  const filteredGroupedStacks = useMemo(() => {
    if (!searchQuery.trim()) return groupedStacks;

    const query = searchQuery.toLowerCase();
    const filtered: Record<string, TechStack[]> = {};

    Object.entries(groupedStacks).forEach(([group, items]) => {
      const matchingItems = items.filter(
        stack => stack.name.toLowerCase().includes(query) ||
                 stack.tags.some(tag => tag.toLowerCase().includes(query))
      );
      if (matchingItems.length > 0) {
        filtered[group] = matchingItems;
      }
    });

    return filtered;
  }, [groupedStacks, searchQuery]);

  // Get selected stacks for display
  const selectedStacks = useMemo(() => {
    return selectedIds
      .map(id => stacks.find(s => s.id === id))
      .filter((s): s is TechStack => s !== undefined);
  }, [selectedIds, stacks]);

  const hasResults = Object.values(filteredGroupedStacks).some(items => items.length > 0);

  return (
    <div className="space-y-3">
      <Label className="text-[#1c1c1c]">Tech Stack</Label>
      
      {/* Selected stacks display */}
      {selectedStacks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStacks.map(stack => (
            <button
              key={stack.id}
              type="button"
              onClick={() => onToggle(stack.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#3D5AFE] bg-[#3D5AFE]/10 text-[#3D5AFE] text-sm transition-colors hover:bg-[#3D5AFE]/20"
            >
              <img 
                src={stack.logo_url} 
                alt={stack.name} 
                className="w-4 h-4 object-contain"
              />
              {stack.name}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Search input with popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tecnologías..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              className="pl-10 border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-lg z-50" 
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[300px] overflow-y-auto">
              {!hasResults ? (
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  No se encontraron tecnologías.
                </CommandEmpty>
              ) : (
                Object.entries(filteredGroupedStacks).map(([group, items]) => {
                  if (items.length === 0) return null;
                  return (
                    <CommandGroup 
                      key={group} 
                      heading={group}
                      className="[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2"
                    >
                      {items.map(stack => {
                        const isSelected = selectedIds.includes(stack.id);
                        return (
                          <CommandItem
                            key={stack.id}
                            value={stack.id}
                            onSelect={() => {
                              onToggle(stack.id);
                              setSearchQuery('');
                            }}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 cursor-pointer",
                              isSelected && "bg-[#3D5AFE]/5"
                            )}
                          >
                            <img 
                              src={stack.logo_url} 
                              alt={stack.name} 
                              className="w-5 h-5 object-contain flex-shrink-0"
                            />
                            <span className="flex-1 text-sm text-[#1c1c1c]">
                              {stack.name}
                            </span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-[#3D5AFE] flex-shrink-0" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  );
                })
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <p className="text-xs text-gray-500">
        {selectedIds.length} tecnología{selectedIds.length !== 1 ? 's' : ''} seleccionada{selectedIds.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
