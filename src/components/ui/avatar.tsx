'use client';

import { UserCircle } from 'phosphor-react';

type AvatarInitialProps = {
  label?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
};

const sizeClasses: Record<
  NonNullable<AvatarInitialProps['size']>,
  { wrapper: string; icon: number }
> = {
  xs: { wrapper: 'h-5 w-5 text-[11px]', icon: 10 },
  sm: { wrapper: 'h-6 w-6 text-xs', icon: 12 },
  md: { wrapper: 'h-8 w-8 text-sm', icon: 16 },
};

function getInitial(label?: string | null) {
  if (!label) return null;
  const trimmed = label.trim();
  if (!trimmed) return null;
  const firstCodePoint = trimmed.codePointAt(0);
  if (!firstCodePoint) return null;
  const firstChar = String.fromCodePoint(firstCodePoint);
  return firstChar.toLocaleUpperCase();
}

export function AvatarInitial({ label, avatarUrl, size = 'sm', className }: AvatarInitialProps) {
  const sizeSet = sizeClasses[size];
  const initial = getInitial(label);

  if (avatarUrl) {
    return (
      <span
        className={`inline-flex overflow-hidden rounded-full ${sizeSet.wrapper} ${className ?? ''}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatarUrl} alt={label ?? 'User avatar'} className="h-full w-full object-cover" />
      </span>
    );
  }

  if (initial) {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-slate-200 font-medium text-slate-700 ${sizeSet.wrapper} ${className ?? ''}`}
      >
        {initial}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-500 ${sizeSet.wrapper} ${className ?? ''}`}
    >
      <UserCircle size={sizeSet.icon} weight="duotone" />
    </span>
  );
}

export default AvatarInitial;
