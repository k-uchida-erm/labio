'use client';

import { forwardRef } from 'react';
import { CheckSquare, Square } from 'phosphor-react';

export type ActivityCheckboxProps = {
  checked?: boolean;
  onToggle?: (event?: React.MouseEvent) => void;
};

// Figma: CheckBox ComponentSet（square-light / check-square-light 相当）
export const ActivityCheckbox = forwardRef<HTMLButtonElement, ActivityCheckboxProps>(
  ({ checked, onToggle }, ref) => {
    const Icon = checked ? CheckSquare : Square;

    return (
      <button
        ref={ref}
        data-state={checked ? 'checked' : 'unchecked'}
        type="button"
        onClick={(e) => onToggle?.(e)}
        className="group/checkbox flex h-10 w-6 items-center justify-center"
        aria-pressed={checked}
      >
        <Icon
          className={
            checked
              ? 'h-5 w-5 text-[var(--primary)] transition-colors'
              : 'h-5 w-5 text-slate-400 transition-colors group-hover/checkbox:text-[var(--primary)]'
          }
          weight={checked ? 'fill' : 'light'}
        />
      </button>
    );
  }
);

ActivityCheckbox.displayName = 'ActivityCheckbox';
