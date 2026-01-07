'use client';

// Re-export commonly used icons from phosphor-react
export {
  CalendarBlank as CalendarIcon,
  Circle as StatusTodoIcon,
  CircleHalf as StatusInProgressIcon,
  CheckCircle as StatusDoneIcon,
  Square as CheckboxUncheckedIcon,
  CheckSquare as CheckboxCheckedIcon,
  CaretRight as ChevronRightIcon,
  CaretDown as ChevronDownIcon,
  Plus as PlusIcon,
  ArrowsDownUp as SortIcon,
  FunnelSimple as FilterIcon,
  MagnifyingGlass as SearchIcon,
  List as ListIcon,
  Kanban as KanbanIcon,
  ChartBar as GanttIcon,
  Cube as BoxIcon,
  Gear as SettingsIcon,
  ListNumbers as ReorderIcon,
  Tray as InboxIcon,
  SidebarSimple as SidebarIcon,
  User as ProfileIcon,
  UserCircle as UserIcon,
} from 'phosphor-react';

import type { IconProps } from 'phosphor-react';
import { Square, CheckSquare } from 'phosphor-react';

// Custom checkbox component that toggles between states
export function CheckboxIcon({
  checked = false,
  size = 16,
  ...props
}: IconProps & { checked?: boolean }) {
  const Icon = checked ? CheckSquare : Square;
  return <Icon size={size} weight="bold" {...props} />;
}
