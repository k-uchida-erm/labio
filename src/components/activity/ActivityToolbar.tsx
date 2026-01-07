'use client';

import { RefObject, useMemo, useRef, useState } from 'react';
import {
  CalendarCheck,
  CircleHalf,
  DotsThree,
  FunnelSimple,
  MagnifyingGlass,
  X,
  Plus,
  CaretUp,
  CaretDown,
  Wrench,
} from 'phosphor-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { FilterDropdownMenu, FilterTag } from './FilterDropdownMenu';
import { SortMenu, SortOption } from './SortMenu';
import { Tables } from '@/types/database.types';
import { Dropdown, DropdownContent, DropdownTrigger } from '@/components/ui/dropdown';
import { AvatarInitial } from '@/components/ui/avatar';

type ProfilePreview = Pick<Tables<'profiles'>, 'id' | 'display_name' | 'avatar_url'>;
type DbTag = Tables<'tags'>;

export type ActivityToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: FilterTag[];
  onRemoveFilter: (id: string) => void;
  onAddFilter: (filter: FilterTag) => void;
  assignees: ProfilePreview[];
  tags: DbTag[];
  currentUserId?: string;
  filterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
  filterMenuRef: RefObject<HTMLDivElement | null>;
  onAddActivity?: (type: 'task') => void;
  sortOption: SortOption | null;
  onSortChange: (option: SortOption | null) => void;
  showKey: boolean;
  onToggleShowKey: (checked: boolean) => void;
  indentEnabled: boolean;
  onToggleIndent: (checked: boolean) => void;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
  hasExpanded?: boolean;
};

const MAX_VISIBLE_TAGS = 3;

export function ActivityToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onRemoveFilter,
  onAddFilter,
  assignees,
  tags,
  currentUserId,
  filterOpen,
  setFilterOpen,
  filterMenuRef,
  onAddActivity,
  sortOption,
  onSortChange,
  showKey,
  onToggleShowKey,
  indentEnabled,
  onToggleIndent,
  onExpandAll,
  onCollapseAll,
  hasExpanded = false,
}: ActivityToolbarProps) {
  const visibleTags = filters.slice(0, MAX_VISIBLE_TAGS);
  const hasOverflow = filters.length > MAX_VISIBLE_TAGS;
  const [customOpen, setCustomOpen] = useState(false);
  const customMenuRef = useRef<HTMLDivElement | null>(null);
  const assigneeMap = useMemo(() => new Map(assignees.map((a) => [a.id, a])), [assignees]);

  return (
    <div className="flex h-12 min-h-[48px] w-full flex-none items-center justify-between gap-2 overflow-visible border-y border-slate-200 px-4">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
        {/* Search input */}
        <div className="flex h-7 w-60 items-center gap-2 rounded-xl border border-slate-300 bg-white px-2">
          <MagnifyingGlass size={16} weight="light" className="ui-icon-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="ui-text-xs ui-text-strong placeholder:ui-text-muted h-full flex-1 border-none bg-transparent outline-none"
          />
        </div>

        {/* Filter button + dropdown */}
        <Dropdown
          open={filterOpen}
          onOpenChange={setFilterOpen}
          placement="bottom"
          strategy="fixed"
        >
          <div ref={filterMenuRef}>
            <DropdownTrigger>
              <button
                type="button"
                className="flex h-6 items-center gap-1 rounded-md px-2 hover:bg-slate-100"
                aria-label="Open filter menu"
              >
                <FunnelSimple size={16} weight="light" className="ui-text-strong" />
                <span className="ui-text-xxs ui-text-muted">Filter</span>
              </button>
            </DropdownTrigger>
          </div>
          <DropdownContent className="z-50 p-0">
            <FilterDropdownMenu
              filters={filters}
              onRemoveFilter={onRemoveFilter}
              onAddFilter={onAddFilter}
              assignees={assignees}
              tags={tags}
              currentUserId={currentUserId}
            />
          </DropdownContent>
        </Dropdown>

        {/* Current filter tags */}
        {visibleTags.map((tag) => {
          const assigneeProfile =
            tag.type === 'assignee' && tag.value ? assigneeMap.get(tag.value) : undefined;
          const icon =
            tag.type === 'assignee' ? (
              <AvatarInitial
                label={assigneeProfile?.display_name || tag.label}
                avatarUrl={assigneeProfile?.avatar_url}
                size="xs"
                className="bg-slate-300 text-slate-800"
              />
            ) : tag.type === 'date' ? (
              <CalendarCheck size={14} weight="light" />
            ) : (
              <CircleHalf size={14} weight="fill" />
            );

          return (
            <Badge key={tag.id} tone="gray" size="xs" className="flex items-center gap-1">
              {icon}
              <span>{tag.label}</span>
              <button
                type="button"
                className="flex items-center justify-center"
                onClick={() => onRemoveFilter(tag.id)}
                aria-label="Remove filter"
              >
                <X size={10} weight="light" />
              </button>
            </Badge>
          );
        })}

        {/* Overflow indicator */}
        {hasOverflow && (
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
            <DotsThree size={14} weight="bold" />
          </Button>
        )}

        {/* Sort button */}
        <SortMenu sortOption={sortOption} onSortChange={onSortChange} />

        {/* Expand / Collapse all */}
        <button
          type="button"
          className="flex h-6 items-center gap-1 rounded-md px-2 hover:bg-slate-100"
          onClick={hasExpanded ? onCollapseAll : onExpandAll}
          aria-label={hasExpanded ? 'Collapse all' : 'Expand all'}
        >
          <div className="flex flex-col items-center leading-none">
            <CaretUp
              size={12}
              weight="light"
              className={`ui-text-strong transition-transform duration-200 ${
                hasExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            />
            <CaretDown
              size={12}
              weight="light"
              className={`ui-text-strong -mt-1 transition-transform duration-200 ${
                hasExpanded ? '-rotate-180' : 'rotate-0'
              }`}
            />
          </div>
          <span className="ui-text-xxs ui-text-muted">{hasExpanded ? 'Collapse' : 'Expand'}</span>
        </button>

        {/* Custom menu */}
        <Dropdown
          open={customOpen}
          onOpenChange={setCustomOpen}
          placement="bottom"
          strategy="fixed"
        >
          <DropdownTrigger>
            <button
              type="button"
              className="flex h-6 items-center gap-1 rounded-md px-2 hover:bg-slate-100"
              aria-label="Open customization menu"
            >
              <Wrench size={16} weight="light" className="ui-text-strong" />
              <span className="ui-text-xxs ui-text-muted">Custom</span>
            </button>
          </DropdownTrigger>
          <DropdownContent className="z-50 w-48 p-0">
            <div
              ref={customMenuRef}
              className="ui-text-xs ui-text-strong flex flex-col gap-3 px-3 py-2"
            >
              <div className="flex flex-col gap-1">
                <div className="ui-text-xxs ui-text-muted">Key display</div>
                <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50">
                  <span>Show key</span>
                  <Switch checked={showKey} onCheckedChange={onToggleShowKey} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="ui-text-xxs ui-text-muted">Indent style</div>
                <div className="flex items-center justify-between rounded-md px-2 py-1 hover:bg-slate-50">
                  <span>Indented</span>
                  <Switch checked={indentEnabled} onCheckedChange={onToggleIndent} />
                </div>
              </div>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>

      <button
        type="button"
        className="flex h-8 items-center gap-2 rounded-lg bg-[#5769f6] px-4 text-[14px] font-medium text-white hover:bg-[#4558e5]"
        onClick={() => onAddActivity?.('task')}
      >
        <Plus size={16} weight="bold" />
        <span>Add Activity</span>
      </button>
    </div>
  );
}

export default ActivityToolbar;
