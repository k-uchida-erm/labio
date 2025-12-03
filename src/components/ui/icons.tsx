'use client';

// Re-export commonly used icons from lucide-react
export {
  Calendar as CalendarIcon,
  Circle as StatusTodoIcon,
  CircleDot as StatusInProgressIcon,
  CheckCircle2 as StatusDoneIcon,
  Square as CheckboxUncheckedIcon,
  SquareCheck as CheckboxCheckedIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown as ChevronDownIcon,
  Plus as PlusIcon,
  ArrowUpDown as SortIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  List as ListIcon,
  LayoutGrid as KanbanIcon,
  GanttChart as GanttIcon,
  Box as BoxIcon,
  Settings as SettingsIcon,
  Menu as ReorderIcon,
  Inbox as InboxIcon,
  PanelLeft as SidebarIcon,
  User as ProfileIcon,
  UserCircle as UserIcon,
} from 'lucide-react';

import { LucideProps } from 'lucide-react';
import { Square, SquareCheck } from 'lucide-react';

// Custom checkbox component that toggles between states
export function CheckboxIcon({
  checked = false,
  size = 16,
  ...props
}: LucideProps & { checked?: boolean }) {
  const Icon = checked ? SquareCheck : Square;
  return <Icon size={size} {...props} />;
}
