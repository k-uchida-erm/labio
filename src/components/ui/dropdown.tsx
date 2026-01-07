'use client';

import * as React from 'react';
import {
  Popover,
  PopoverContent as BaseContent,
  PopoverTrigger as BaseTrigger,
} from '@/components/ui/popover';

export type DropdownProps = React.ComponentProps<typeof Popover>;

export function Dropdown(props: DropdownProps) {
  return <Popover {...props} />;
}

export function DropdownTrigger(props: React.ComponentProps<typeof BaseTrigger>) {
  return <BaseTrigger {...props} />;
}

export function DropdownContent(props: React.ComponentProps<typeof BaseContent>) {
  return <BaseContent {...props} />;
}

export default Dropdown;
