'use client';

import React, { useMemo, useState } from 'react';
import { MagnifyingGlass, X } from 'phosphor-react';
import { CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { CommandMenu, CommandMenuBadges } from '@/components/ui/command-menu';
import { Badge } from '@/components/ui/badge';
import { AvatarInitial } from '@/components/ui/avatar';

export type AssigneeOption = { id: string; name: string; avatarUrl?: string | null };

type AssigneeListProps = {
  options: AssigneeOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
};

export function AssigneeList({
  options,
  selectedIds,
  onChange,
  placeholder = 'Search assignee',
}: AssigneeListProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return options;
    return options.filter((o) => o.name.toLowerCase().includes(term));
  }, [options, search]);

  const selectedBadges = options.filter((o) => selectedIds.includes(o.id));

  const handleToggle = (id: string) => {
    const exists = selectedIds.includes(id);
    onChange(exists ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  return (
    <CommandMenu className="w-60">
      <CommandInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        leading={<MagnifyingGlass size={14} weight="light" className="ui-icon-muted" />}
        aria-label={placeholder}
      />
      {selectedBadges.length > 0 && (
        <>
          <CommandMenuBadges label="Selected">
            {selectedBadges.map((o) => (
              <Badge key={o.id} tone="gray" size="xs" className="flex items-center gap-1">
                <AvatarInitial
                  label={o.name}
                  avatarUrl={o.avatarUrl}
                  size="xs"
                  className="bg-slate-300 text-slate-800"
                />
                <span className="ui-text-xxs ui-text-strong truncate">{o.name}</span>
                <button
                  type="button"
                  className="ml-1 text-[var(--text-color-muted)] hover:text-[var(--text-color-strong)]"
                  onClick={() => handleToggle(o.id)}
                  aria-label="Remove assignee"
                >
                  <X size={10} weight="light" />
                </button>
              </Badge>
            ))}
          </CommandMenuBadges>
          <CommandSeparator />
        </>
      )}
      <CommandList className="max-h-56 overflow-y-auto">
        {filtered.map((o) => {
          const active = selectedIds.includes(o.id);
          return (
            <CommandItem
              key={o.id}
              className={`ui-text-xs h-8 justify-start gap-2 px-2 ${active ? 'bg-slate-100' : ''}`}
              onClick={() => handleToggle(o.id)}
            >
              <AvatarInitial
                label={o.name}
                avatarUrl={o.avatarUrl}
                size="sm"
                className="bg-slate-300 text-slate-800"
              />
              <span className="ui-text-strong truncate">{o.name}</span>
            </CommandItem>
          );
        })}
        {filtered.length === 0 && (
          <div className="ui-text-xs ui-text-muted px-3 py-2">No results</div>
        )}
      </CommandList>
    </CommandMenu>
  );
}

export default AssigneeList;
