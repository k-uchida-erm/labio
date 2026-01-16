'use client';

import { NavRailHorizontal } from './NavRailHorizontal';
import { NavRailVertical } from './NavRailVertical';

export type NavRailProps = {
  onToggleSidebar: () => void;
  orientation?: 'vertical' | 'horizontal';
  onCancel?: () => void;
  onMoveToTrash?: () => void;
  selectedCount?: number;
  horizontalOffset?: string;
};

export default function NavRail({
  onToggleSidebar,
  orientation = 'vertical',
  onCancel,
  onMoveToTrash,
  selectedCount = 0,
  horizontalOffset = '50%',
}: NavRailProps) {
  if (orientation === 'horizontal') {
    return (
      <div className="fixed top-4 z-50 -translate-x-1/2" style={{ left: horizontalOffset }}>
        <NavRailHorizontal
          onMoveToTrash={onMoveToTrash}
          onCancel={onCancel}
          selectedCount={selectedCount}
        />
      </div>
    );
  }

  return <NavRailVertical onToggleSidebar={onToggleSidebar} />;
}
