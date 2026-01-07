'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type MenuButtonProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  placement?: 'left' | 'right' | 'bottom';
  className?: string;
};

/**
 * Lightweight dropdown menu built on Popover for consistent styling.
 */
export function MenuButton({
  trigger,
  children,
  placement = 'bottom',
  className,
}: MenuButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} placement={placement}>
      <PopoverTrigger className="flex items-center">{trigger}</PopoverTrigger>
      <PopoverContent
        className={`min-w-[200px] rounded-md border border-slate-200 bg-white shadow-md ${className ?? ''}`}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

type MenuListProps = {
  children: React.ReactNode;
  className?: string;
};

export function MenuList({ children, className }: MenuListProps) {
  return <div className={`flex flex-col py-1 ${className ?? ''}`}>{children}</div>;
}

type MenuItemProps = {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSelect?: () => void;
};

export function MenuItem({ icon, children, onSelect }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="ui-text-xs ui-text-strong flex h-8 w-full items-center gap-2 rounded-md px-3 text-left font-normal hover:bg-slate-100"
    >
      {icon}
      <span className="truncate">{children}</span>
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-slate-200" />;
}

type MenuPanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function MenuPanel({ children, className }: MenuPanelProps) {
  return <div className={`ui-text-sm ui-text-strong py-2 ${className ?? ''}`}>{children}</div>;
}

type MenuSectionLabelProps = {
  children: React.ReactNode;
  className?: string;
};

export function MenuSectionLabel({ children, className }: MenuSectionLabelProps) {
  return (
    <div
      className={`ui-text-xs ui-text-muted flex h-8 items-center px-3 font-normal ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export default MenuButton;
