'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type CollapseSectionProps = {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  contentStyle?: React.CSSProperties;
  expandedMarginTop?: string | number;
  collapsedMarginTop?: string | number;
};

export function CollapseSection({
  open,
  children,
  className,
  contentClassName,
  contentStyle,
  expandedMarginTop = '0.25rem',
  collapsedMarginTop = 0,
}: CollapseSectionProps) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out',
        className
      )}
      style={{
        gridTemplateRows: open ? '1fr' : '0fr',
        opacity: open ? 1 : 0,
        marginTop: open ? expandedMarginTop : collapsedMarginTop,
      }}
      aria-hidden={!open}
    >
      <div className={cn('min-h-0 overflow-hidden', contentClassName)} style={contentStyle}>
        {children}
      </div>
    </div>
  );
}

export default CollapseSection;
