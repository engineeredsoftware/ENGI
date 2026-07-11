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
import { Check, ChevronsUpDown, Trash2 } from 'lucide-react';
import { cn } from '@bitcode/styling';
import { Button } from '@/components/shadcn/Button/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/shadcn/Command/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/Popover/Popover';
import { Badge } from '@/components/shadcn/Badge/Badge';

export interface SearchableSelectItem {
  /** Unique, stable identifier — this is what onSelect receives. */
  key: string;
  label: string;
  /** Secondary line under the label — string or rich node (e.g. icon counts). */
  description?: React.ReactNode;
  /** Short tag rendered as a badge (e.g. a language, a "default" marker). */
  badge?: string | null;
  /** Trailing meta text (e.g. "Updated 2/29/2024"). */
  meta?: string | null;
  /** Extra text matched against the search query but not otherwise shown. */
  searchText?: string | null;
  icon?: React.ReactNode;
  disabled?: boolean;
  /**
   * When true and `onDeleteItem` is provided, a trash control appears on row
   * hover (red on its own hover) and calls `onDeleteItem` without selecting.
   */
  deletable?: boolean;
}

export interface SearchableSelectProps {
  items: SearchableSelectItem[];
  /** The selected item's key, or null/undefined for no selection. */
  value?: string | null;
  onSelect: (key: string | null) => void;
  /**
   * Optional per-row delete. Fired for items with `deletable: true` when the
   * trash control is clicked; does not close the popover or select the row.
   */
  onDeleteItem?: (key: string) => void;
  /**
   * When false, hide the left-side check indicator. Use for one-shot "load in"
   * pickers that always show a placeholder (value stays null) rather than a
   * persistent selection. Default true.
   */
  showSelectionIndicator?: boolean;
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
  onDeleteItem,
  showSelectionIndicator = true,
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
      [
        item.label,
        typeof item.description === 'string' ? item.description : null,
        item.searchText,
      ]
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
                {filteredItems.map((item) => {
                  const showDelete = Boolean(item.deletable && onDeleteItem);
                  return (
                    <CommandItem
                      key={item.key}
                      value={item.key}
                      disabled={item.disabled}
                      onSelect={() => handleSelect(item)}
                      className="group/item"
                    >
                      {/* Left gutter: hover-trash when deletable; optional check
                          only for true persistent selection pickers. */}
                      {showDelete ? (
                        <button
                          type="button"
                          aria-label={`Delete ${item.label}`}
                          title={`Delete ${item.label}`}
                          // Keep the row from selecting / the command from
                          // swallowing the click when the trash is used.
                          onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                          }}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onDeleteItem?.(item.key);
                          }}
                          className={cn(
                            'mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-transparent text-neutral-400 transition',
                            'opacity-0 group-hover/item:opacity-100 group-focus-within/item:opacity-100',
                            'hover:border-rose-300/40 hover:bg-rose-400/10 hover:text-rose-300',
                            'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-300/50',
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      ) : showSelectionIndicator ? (
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            selected?.key === item.key
                              ? 'opacity-100'
                              : 'opacity-0',
                          )}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="truncate font-medium">
                            {item.label}
                          </span>
                        </div>
                        {item.description ? (
                          // Single line: overflow clips; rich descriptions (e.g.
                          // obfuscation-anchor icon counts) keep their own nowrap layout.
                          <div className="min-w-0 overflow-hidden text-xs text-muted-foreground">
                            {item.description}
                          </div>
                        ) : null}
                        {item.badge || item.meta ? (
                          <div className="mt-1 flex items-center gap-2">
                            {item.badge ? (
                              <Badge variant="secondary" className="text-xs">
                                {item.badge}
                              </Badge>
                            ) : null}
                            {item.meta ? (
                              <span className="text-xs text-muted-foreground">
                                {item.meta}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
