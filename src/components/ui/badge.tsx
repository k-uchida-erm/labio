'use client';

import React from 'react';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: 'gray' | 'indigo' | 'custom';
  active?: boolean;
  pill?: boolean;
  size?: 'xs' | 'sm';
};

const toneClasses: Record<
  Exclude<BadgeProps['tone'], undefined>,
  { base: string; active: string }
> = {
  gray: {
    base: 'bg-slate-100 text-slate-700',
    active: 'bg-slate-100 text-slate-700',
  },
  indigo: {
    base: 'bg-indigo-100 text-indigo-700',
    active: 'bg-indigo-100 text-indigo-700',
  },
  custom: {
    base: '',
    active: '',
  },
};

const sizeClasses: Record<NonNullable<BadgeProps['size']>, string> = {
  xs: 'h-6 text-[12px] px-2',
  sm: 'h-7 text-[13px] px-2.5',
};

export function Badge({
  tone = 'gray',
  active,
  pill = true,
  size = 'xs',
  className,
  children,
  ...rest
}: BadgeProps) {
  const toneSet = toneClasses[tone ?? 'gray'];
  return (
    <span
      className={`inline-flex items-center justify-center ${sizeClasses[size]} ${
        pill ? 'rounded-full' : 'rounded-md'
      } ${active ? toneSet.active : toneSet.base} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Badge;
