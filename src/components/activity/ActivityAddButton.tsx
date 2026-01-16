'use client';

import { Plus } from 'phosphor-react';

export type ActivityAddButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
};

export function ActivityAddButton({ onClick, disabled, title }: ActivityAddButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
      disabled={disabled}
      title={title}
    >
      <Plus size={14} weight="light" />
    </button>
  );
}
