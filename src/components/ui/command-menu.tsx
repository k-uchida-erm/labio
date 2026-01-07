'use client';

import React from 'react';
import {
  Command,
  CommandGroup,
  CommandSeparator,
  type CommandProps,
} from '@/components/ui/command';

type CommandMenuProps = CommandProps;

export function CommandMenu({ className, ...props }: CommandMenuProps) {
  return <Command className={`w-64 ${className ?? ''}`} {...props} />;
}

type CommandMenuHeaderProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
};

export function CommandMenuHeader({ icon, title, description }: CommandMenuHeaderProps) {
  return (
    <div className="flex h-10 items-center gap-2 border-b border-slate-100 px-3">
      {icon}
      <div className="flex flex-col">
        <span className="ui-text-xs ui-text-strong font-medium">{title}</span>
        {description && <span className="ui-text-xxs ui-text-muted">{description}</span>}
      </div>
    </div>
  );
}

type CommandMenuBadgesProps = {
  label?: string;
  children: React.ReactNode;
};

export function CommandMenuBadges({ label, children }: CommandMenuBadgesProps) {
  return (
    <div className="px-3 py-2">
      {label && <div className="ui-text-xs ui-text-muted mb-1 font-normal">{label}</div>}
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

type CommandMenuSectionProps = {
  heading?: string;
  children: React.ReactNode;
  withSeparator?: boolean;
  className?: string;
};

export function CommandMenuSection({
  heading,
  children,
  withSeparator = true,
  className,
}: CommandMenuSectionProps) {
  return (
    <>
      {withSeparator && <CommandSeparator />}
      <CommandGroup heading={heading} className={className}>
        {children}
      </CommandGroup>
    </>
  );
}

export default CommandMenu;
