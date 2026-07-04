'use client';

/**
 * SearchableSelect — the one rich, searchable dropdown component for the app.
 *
 * A generic Command/Popover combobox (search box + list, badges, description,
 * meta text, an icon slot) so every "pick one of a list" control looks and
 * behaves the same way, instead of every surface growing its own bespoke
 * native <select> or one-off popover. VCSRepositorySelector is the reference
 * implementation this was extracted from (repo picker with lock/fork icons,
 * language badge, "Updated" meta) — it now composes this component rather
 * than duplicating the combobox machinery.
 */

import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@bitcode/styling';
import { Button } from '@/components/base/shadcn/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/base/shadcn/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/base/shadcn/popover';
import { Badge } from '@/components/base/shadcn/badge';

export interface SearchableSelectItem {
  /** Unique, stable identifier — this is what onSelect receives. */
  key: string;
  label: string;
  description?: string | null;
  /** Short tag rendered as a badge (e.g. a language, a "default" marker). */
  badge?: string | null;
  /** Trailing meta text (e.g. "Updated 2/29/2024"). */
  meta?: string | null;
  /** Extra text matched against the search query but not otherwise shown. */
  searchText?: string | null;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  items: SearchableSelectItem[];
  /** The selected item's key, or null/undefined for no selection. */
  value?: string | null;
  onSelect: (key: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  disabled?: boolean;
  /** Trigger button className (merged with the default full-width outline style). */
  className?: string;
  /** Popover content className override (defaults to matching the trigger's width). */
  contentClassName?: string;
  'aria-label'?: string;
  /** Observe/control the open state (e.g. to lazily fetch items on first open). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SearchableSelect({
  items,
  value,
  onSelect,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  emptyMessage = 'No results found.',
  loading = false,
  loadingMessage = 'Loading...',
  disabled = false,
  className,
  contentClassName,
  'aria-label': ariaLabel,
  open: openProp,
  onOpenChange,
}: SearchableSelectProps) {
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const [searchQuery, setSearchQuery] = useState('');

  const selected = useMemo(
    () => items.find((item) => item.key === value) || null,
    [items, value],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.label, item.description, item.searchText]
        .filter((text): text is string => Boolean(text))
        .some((text) => text.toLowerCase().includes(query)),
    );
  }, [items, searchQuery]);

  const handleSelect = (item: SearchableSelectItem) => {
    if (item.disabled) return;
    onSelect(item.key);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          disabled={disabled}
          className={cn('w-full justify-between rounded-none font-normal', className)}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              {selected.icon}
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="truncate text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn('w-[--radix-popover-trigger-width] min-w-[280px] rounded-none p-0', contentClassName)}
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">{loadingMessage}</div>
            ) : filteredItems.length === 0 ? (
              <CommandEmpty>{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={item.key}
                    disabled={item.disabled}
                    onSelect={() => handleSelect(item)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        selected?.key === item.key ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        {item.icon}
                        <span className="truncate font-medium">{item.label}</span>
                      </div>
                      {item.description ? (
                        <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                      ) : null}
                      {item.badge || item.meta ? (
                        <div className="mt-1 flex items-center gap-2">
                          {item.badge ? (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          ) : null}
                          {item.meta ? (
                            <span className="text-xs text-muted-foreground">{item.meta}</span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
