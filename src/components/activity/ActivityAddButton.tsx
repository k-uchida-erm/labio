'use client';

import { PlusCircle } from 'phosphor-react';

export type ActivityAddButtonProps = {
  onClick?: () => void;
};

// Figma: AddButton ComponentSet（plus-circle-light / plus-circle-fill 相当）
export function ActivityAddButton({ onClick }: ActivityAddButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-10 w-9 items-center justify-center"
    >
      {/* default: plus-circle-light 相当（アウトライン） */}
      <PlusCircle
        className="h-5 w-5 text-[#5769f6] opacity-100 transition-opacity group-hover:opacity-0"
        weight="regular"
      />
      {/* hover: plus-circle-fill 相当（塗りつぶし） */}
      <PlusCircle
        className="pointer-events-none absolute h-5 w-5 text-[#5769f6] opacity-0 transition-opacity group-hover:opacity-100"
        weight="fill"
      />
    </button>
  );
}
