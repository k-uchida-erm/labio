import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import MenuButton, {
  MenuItem,
  MenuList,
  MenuSectionLabel,
  MenuSeparator,
} from '@/components/ui/menu';
import { Gear, List, Trash } from 'phosphor-react';
import { Badge } from '@/components/ui/badge';
import { AvatarInitial } from '@/components/ui/avatar';

type ProjectHeaderProps = {
  projectKey?: string | null;
  projectTitle?: string | null;
  assignees?: Array<{ id: string; name: string | null; avatarUrl?: string | null }>;
  onOpenSettings?: () => void;
  onOpenTrash?: () => void;
};

export function ProjectHeader({
  projectKey,
  projectTitle,
  assignees = [],
  onOpenSettings,
  onOpenTrash,
}: ProjectHeaderProps) {
  const displayKey = projectKey ? projectKey.toUpperCase() : 'PROJECT';
  const displayTitle = projectTitle ?? 'Project';
  const assigneeList = useMemo(() => assignees.filter(Boolean), [assignees]);

  return (
    <header className="flex h-10 w-full flex-none items-center justify-between px-2">
      <div className="ml-2 flex min-w-0 items-center gap-3">
        <Badge tone="gray" size="xs" className="px-3">
          <span className="font-medium whitespace-nowrap">{displayKey}</span>
        </Badge>
        <MenuButton
          placement="bottom"
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="ui-text-strong h-8 w-8 p-0 hover:bg-slate-100"
              aria-label="Project menu"
            >
              <List size={18} weight="light" />
            </Button>
          }
        >
          <div className="ui-text-sm ui-text-strong w-56 py-2">
            <MenuList>
              <MenuItem
                icon={<Gear size={16} />}
                onSelect={() => {
                  onOpenSettings?.();
                }}
              >
                Settings
              </MenuItem>
              <MenuItem
                icon={<Trash size={16} />}
                onSelect={() => {
                  onOpenTrash?.();
                }}
              >
                Trash
              </MenuItem>
            </MenuList>
            <MenuSeparator />
            <MenuSectionLabel>Assignees</MenuSectionLabel>
            {assigneeList.length === 0 ? (
              <div className="ui-text-xs ui-text-muted px-3 py-1">No assignees</div>
            ) : (
              <div className="flex max-h-48 flex-col gap-1 overflow-y-auto px-1">
                {assigneeList.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="ui-text-xs ui-text-strong flex items-center gap-2 rounded-md px-2 py-1 font-normal hover:bg-slate-50"
                  >
                    <AvatarInitial
                      label={assignee.name || 'Member'}
                      avatarUrl={assignee.avatarUrl}
                      size="sm"
                      className="bg-slate-300 text-slate-800"
                    />
                    <span className="truncate">{assignee.name || 'Member'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MenuButton>
        <span className="ui-text-sm ui-text-strong min-w-0 truncate font-normal">
          {displayTitle}
        </span>
      </div>
      <div className="mr-4 h-8 w-8" />
    </header>
  );
}

export default ProjectHeader;
