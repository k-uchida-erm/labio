'use client';

import { useMemo, useState } from 'react';
import {
  CalendarBlank,
  CalendarCheck,
  CaretRight,
  CircleDashed,
  CircleHalf,
  Tag as TagIcon,
  MagnifyingGlass,
  X,
} from 'phosphor-react';
import { CommandItem, CommandList, CommandInput, CommandSeparator } from '@/components/ui/command';
import { Dropdown, DropdownTrigger, DropdownContent } from '@/components/ui/dropdown';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ActivityType } from '@/features/activity/types';
import { Tables } from '@/types/database.types';
import { CommandMenu, CommandMenuBadges, CommandMenuSection } from '@/components/ui/command-menu';
import { AvatarInitial } from '@/components/ui/avatar';

type DbTag = Tables<'tags'>;
type Profile = Tables<'profiles'>;

export type FilterTag = {
  id: string;
  label: string;
  type: 'assignee' | 'date' | 'status' | 'type' | 'tag' | 'due_date' | 'created_at';
  value?: string;
  dateRange?: { from?: Date; to?: Date };
};

type AssigneeOption = Pick<Profile, 'id' | 'display_name' | 'avatar_url'>;

export type FilterDropdownMenuProps = {
  className?: string;
  filters: FilterTag[];
  onRemoveFilter: (id: string) => void;
  onAddFilter: (filter: FilterTag) => void;
  assignees?: AssigneeOption[];
  tags?: DbTag[];
  currentUserId?: string;
};

export function FilterDropdownMenu({
  className,
  filters,
  onRemoveFilter,
  onAddFilter,
  assignees = [],
  tags = [],
  currentUserId,
}: FilterDropdownMenuProps) {
  const [activeSubmenu, setActiveSubmenu] = useState<
    'assignee' | 'status' | 'type' | 'tag' | 'due_date' | 'created_at' | null
  >(null);
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [dueDateRange, setDueDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [createdDateRange, setCreatedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [menuSearch, setMenuSearch] = useState('');

  const assigneeMap = useMemo(() => new Map(assignees.map((a) => [a.id, a])), [assignees]);

  const statusOptions = [
    { value: 'todo', label: 'Todo' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'done', label: 'Done' },
  ];

  const typeOptions: { value: ActivityType; label: string }[] = [
    { value: 'task', label: 'Task' },
    { value: 'experiment', label: 'Experiment' },
    { value: 'question', label: 'Question' },
    { value: 'review', label: 'Review' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'note', label: 'Note' },
  ];

  const handleSelectAssignee = (assigneeId: string, displayName: string) => {
    onAddFilter({
      id: `assignee-${assigneeId}`,
      // バッジ側ではアイコンで種別が分かるので、ラベルは名前だけにする
      label: displayName,
      type: 'assignee',
      value: assigneeId,
    });
    setActiveSubmenu(null);
  };

  const handleSelectStatus = (status: string, label: string) => {
    onAddFilter({
      id: `status-${status}`,
      // 「Status:」のプレフィックスは不要なので値だけ
      label,
      type: 'status',
      value: status,
    });
    setActiveSubmenu(null);
  };

  const handleSelectType = (type: ActivityType, label: string) => {
    onAddFilter({
      id: `type-${type}`,
      // 「Type:」のプレフィックスは不要なので値だけ
      label,
      type: 'type',
      value: type,
    });
    setActiveSubmenu(null);
  };

  const handleSelectTag = (tagId: string, tagName: string) => {
    onAddFilter({
      id: `tag-${tagId}`,
      // 「Tag:」のプレフィックスは不要なので名前だけ
      label: tagName,
      type: 'tag',
      value: tagId,
    });
    setActiveSubmenu(null);
  };

  const handleSelectDueDate = () => {
    if (dueDateRange.from) {
      const label = dueDateRange.to
        ? `${dueDateRange.from.toLocaleDateString()} - ${dueDateRange.to.toLocaleDateString()}`
        : dueDateRange.from.toLocaleDateString();
      onAddFilter({
        id: `due-date-${Date.now()}`,
        label,
        type: 'due_date',
        dateRange: dueDateRange,
      });
      setDueDateRange({});
      setActiveSubmenu(null);
    }
  };

  const handleSelectCreatedDate = () => {
    if (createdDateRange.from) {
      const label = createdDateRange.to
        ? `${createdDateRange.from.toLocaleDateString()} - ${createdDateRange.to.toLocaleDateString()}`
        : createdDateRange.from.toLocaleDateString();
      onAddFilter({
        id: `created-date-${Date.now()}`,
        label,
        type: 'created_at',
        dateRange: createdDateRange,
      });
      setCreatedDateRange({});
      setActiveSubmenu(null);
    }
  };

  const filteredAssignees = assignees.filter((a) =>
    a.display_name?.toLowerCase().includes(assigneeSearch.toLowerCase())
  );

  const filteredTags = tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()));

  const normalizedMenuSearch = menuSearch.trim().toLowerCase();
  const matchesMenuSearch = (label: string) =>
    normalizedMenuSearch.length === 0 || label.toLowerCase().includes(normalizedMenuSearch);

  const currentUserProfile = currentUserId ? assigneeMap.get(currentUserId) : undefined;

  const suggestionItems: Array<React.ReactNode> = [];
  if (currentUserId && matchesMenuSearch('assignee me')) {
    suggestionItems.push(
      <CommandItem
        key="assignee-me"
        className="ui-text-xs h-8 px-2"
        onClick={() => {
          if (currentUserProfile) {
            handleSelectAssignee(currentUserProfile.id, currentUserProfile.display_name || 'Me');
          }
        }}
      >
        <span className="flex items-center gap-2">
          <AvatarInitial
            label={currentUserProfile?.display_name || 'Me'}
            avatarUrl={currentUserProfile?.avatar_url}
            size="sm"
            className="bg-slate-300 text-slate-800"
          />
          <span>Assignee: Me</span>
        </span>
      </CommandItem>
    );
  }
  if (matchesMenuSearch('status in progress')) {
    suggestionItems.push(
      <CommandItem
        key="status-in-progress"
        className="ui-text-xs h-8 px-2"
        onClick={() => handleSelectStatus('in_progress', 'In Progress')}
      >
        <span className="flex items-center gap-2">
          <CircleHalf size={14} weight="fill" />
          <span>Status: In Progress</span>
        </span>
      </CommandItem>
    );
  }

  const showAssigneeFilter = matchesMenuSearch('assignee');
  const showStatusFilter = matchesMenuSearch('status');
  const showTypeFilter = matchesMenuSearch('activity type');
  const showTagFilter = matchesMenuSearch('tag');
  const showDueDateFilter = matchesMenuSearch('due date');
  const showCreatedDateFilter = matchesMenuSearch('creation date');
  const hasVisibleFilter =
    showAssigneeFilter ||
    showStatusFilter ||
    showTypeFilter ||
    showTagFilter ||
    showDueDateFilter ||
    showCreatedDateFilter;

  return (
    <div className="relative">
      <CommandMenu className={`w-60 ${className ?? ''}`}>
        <CommandInput
          value={menuSearch}
          onChange={(e) => setMenuSearch(e.target.value)}
          placeholder="Search filters"
          leading={<MagnifyingGlass size={14} weight="light" className="ui-icon-muted" />}
          aria-label="Search filters"
        />
        <CommandList>
          {filters.length > 0 && (
            <>
              <CommandMenuBadges label="Current Filter">
                {filters.map((filter) => {
                  const assigneeProfile =
                    filter.type === 'assignee' && filter.value
                      ? assigneeMap.get(filter.value)
                      : undefined;
                  const icon =
                    filter.type === 'assignee' ? (
                      <AvatarInitial
                        label={assigneeProfile?.display_name || filter.label}
                        avatarUrl={assigneeProfile?.avatar_url}
                        size="xs"
                        className="bg-slate-300 text-slate-800"
                      />
                    ) : filter.type === 'date' ||
                      filter.type === 'due_date' ||
                      filter.type === 'created_at' ? (
                      <CalendarCheck size={14} weight="light" />
                    ) : filter.type === 'tag' ? (
                      <TagIcon size={14} weight="light" />
                    ) : (
                      <CircleHalf size={14} weight="fill" />
                    );

                  return (
                    <Badge
                      key={filter.id}
                      tone="gray"
                      size="xs"
                      className="flex items-center gap-1"
                    >
                      {icon}
                      <span>{filter.label}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFilter(filter.id)}
                        className="ml-1 flex items-center justify-center"
                        aria-label="Remove filter"
                      >
                        <X size={10} weight="light" />
                      </button>
                    </Badge>
                  );
                })}
              </CommandMenuBadges>
              <CommandSeparator />
            </>
          )}

          {suggestionItems.length > 0 && (
            <CommandMenuSection heading="Suggestions" withSeparator={false}>
              {suggestionItems}
            </CommandMenuSection>
          )}

          {/* Filter fields */}
          <CommandMenuSection heading="Filter">
            {showAssigneeFilter && (
              <Dropdown
                open={activeSubmenu === 'assignee'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'assignee' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <AvatarInitial
                        label="Assignee"
                        size="sm"
                        className="bg-slate-300 text-slate-800"
                      />
                      <span>Assignee</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="w-60 p-0">
                  <CommandMenu className="w-60">
                    <CommandInput
                      value={assigneeSearch}
                      onChange={(e) => setAssigneeSearch(e.target.value)}
                      placeholder="Search assignee"
                      leading={
                        <MagnifyingGlass size={14} weight="light" className="ui-icon-muted" />
                      }
                      aria-label="Search assignee"
                    />
                    <CommandList className="max-h-56 overflow-y-auto">
                      {filteredAssignees.map((assignee) => (
                        <CommandItem
                          key={assignee.id}
                          className="ui-text-xs h-8 justify-start gap-2 px-2"
                          onClick={() =>
                            handleSelectAssignee(assignee.id, assignee.display_name || 'Unknown')
                          }
                        >
                          <AvatarInitial
                            label={assignee.display_name || 'Unknown'}
                            avatarUrl={assignee.avatar_url}
                            size="sm"
                            className="bg-slate-300 text-slate-800"
                          />
                          <span className="truncate">{assignee.display_name || 'Unknown'}</span>
                        </CommandItem>
                      ))}
                      {filteredAssignees.length === 0 && (
                        <div className="ui-text-xs ui-text-muted px-3 py-2">No results</div>
                      )}
                    </CommandList>
                  </CommandMenu>
                </DropdownContent>
              </Dropdown>
            )}

            {showStatusFilter && (
              <Dropdown
                open={activeSubmenu === 'status'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'status' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <CircleDashed size={14} weight="light" />
                      <span>Status</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="w-60 p-0">
                  <CommandMenu className="w-60">
                    <CommandList>
                      {statusOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          className="ui-text-xs h-8 justify-start gap-2 px-2"
                          onClick={() => handleSelectStatus(option.value, option.label)}
                        >
                          <CircleHalf size={14} weight="fill" />
                          <span>{option.label}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandMenu>
                </DropdownContent>
              </Dropdown>
            )}

            {showTypeFilter && (
              <Dropdown
                open={activeSubmenu === 'type'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'type' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <CircleDashed size={14} weight="light" />
                      <span>Activity Type</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="w-60 p-0">
                  <CommandMenu className="w-60">
                    <CommandList>
                      {typeOptions.map((option) => (
                        <CommandItem
                          key={option.value}
                          className="ui-text-xs h-8 justify-start gap-2 px-2"
                          onClick={() => handleSelectType(option.value, option.label)}
                        >
                          <CircleDashed size={14} weight="light" />
                          <span>{option.label}</span>
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandMenu>
                </DropdownContent>
              </Dropdown>
            )}

            {showTagFilter && (
              <Dropdown
                open={activeSubmenu === 'tag'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'tag' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <TagIcon size={14} weight="light" />
                      <span>Tag</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="w-60 p-0">
                  <CommandMenu className="w-60">
                    <CommandInput
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      placeholder="Search tag"
                      leading={
                        <MagnifyingGlass size={14} weight="light" className="ui-icon-muted" />
                      }
                      aria-label="Search tag"
                    />
                    <CommandList className="max-h-56 overflow-y-auto">
                      {filteredTags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          className="ui-text-xs h-8 justify-start gap-2 px-2"
                          onClick={() => handleSelectTag(tag.id, tag.name)}
                        >
                          <TagIcon size={14} weight="light" />
                          <span className="truncate">{tag.name}</span>
                        </CommandItem>
                      ))}
                      {filteredTags.length === 0 && (
                        <div className="ui-text-xs ui-text-muted px-3 py-2">No results</div>
                      )}
                    </CommandList>
                  </CommandMenu>
                </DropdownContent>
              </Dropdown>
            )}

            {showDueDateFilter && (
              <Dropdown
                open={activeSubmenu === 'due_date'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'due_date' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <CalendarCheck size={14} weight="light" />
                      <span>Due Date</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="p-0">
                  <div className="flex flex-col">
                    <Calendar
                      selected={dueDateRange}
                      onSelect={(date) => {
                        if (typeof date === 'object' && 'from' in date) {
                          setDueDateRange(date);
                        }
                      }}
                      mode="range"
                    />
                    <div className="flex justify-end gap-2 border-t border-slate-200 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDueDateRange({});
                          setActiveSubmenu(null);
                        }}
                        className="ui-text-xs ui-text-muted rounded-md px-3 py-1 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectDueDate}
                        disabled={!dueDateRange.from}
                        className="rounded-md bg-[#5769f6] px-3 py-1 text-xs text-white disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </DropdownContent>
              </Dropdown>
            )}

            {showCreatedDateFilter && (
              <Dropdown
                open={activeSubmenu === 'created_at'}
                onOpenChange={(open) => setActiveSubmenu(open ? 'created_at' : null)}
              >
                <DropdownTrigger>
                  <CommandItem className="ui-text-xs h-8 px-2">
                    <span className="flex items-center gap-2">
                      <CalendarBlank size={14} weight="light" />
                      <span>Creation Date</span>
                    </span>
                    <CaretRight size={14} weight="light" />
                  </CommandItem>
                </DropdownTrigger>
                <DropdownContent className="p-0">
                  <div className="flex flex-col">
                    <Calendar
                      selected={createdDateRange}
                      onSelect={(date) => {
                        if (typeof date === 'object' && 'from' in date) {
                          setCreatedDateRange(date);
                        }
                      }}
                      mode="range"
                    />
                    <div className="flex justify-end gap-2 border-t border-slate-200 p-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatedDateRange({});
                          setActiveSubmenu(null);
                        }}
                        className="ui-text-xs ui-text-muted rounded-md px-3 py-1 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSelectCreatedDate}
                        disabled={!createdDateRange.from}
                        className="rounded-md bg-[#5769f6] px-3 py-1 text-xs text-white disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </DropdownContent>
              </Dropdown>
            )}

            {!hasVisibleFilter && (
              <div className="ui-text-xs ui-text-muted px-3 py-2">No filters found</div>
            )}
          </CommandMenuSection>
        </CommandList>
      </CommandMenu>
    </div>
  );
}
