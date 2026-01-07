'use client';

import * as React from 'react';

export type SwitchProps = {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
};

export function Switch({ checked = false, disabled, onCheckedChange, className }: SwitchProps) {
  const handleClick = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  const base =
    'relative inline-flex h-4 w-7 items-center rounded-full border transition-colors duration-150';
  const stateClass = checked
    ? 'bg-[var(--primary)] border-[var(--primary)]'
    : 'bg-slate-200 border-slate-300';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  const thumbBase =
    'inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform duration-150';
  const thumbState = checked ? 'translate-x-3' : 'translate-x-0';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={handleClick}
      className={[base, stateClass, disabledClass, className ?? ''].join(' ')}
    >
      <span className={[thumbBase, thumbState].join(' ')} />
    </button>
  );
}

export default Switch;
