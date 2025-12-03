'use client';

import { useState } from 'react';
import { ActivityRow, Activity, ActivityStatus } from './ActivityRow';

export type ActivityListProps = {
  activities: Activity[];
  onActivityClick?: (id: string) => void;
  onStatusChange?: (id: string, status: ActivityStatus) => void;
};

export function ActivityList({
  activities,
  onActivityClick,
  onStatusChange,
}: ActivityListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex w-full flex-col">
      {activities.map((activity) => (
        <div
          key={activity.id}
          onMouseEnter={() => setHoveredId(activity.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <ActivityRow
            activity={activity}
            isSelected={selectedIds.has(activity.id)}
            isHovered={hoveredId === activity.id}
            onSelect={handleSelect}
            onClick={onActivityClick}
            onStatusChange={onStatusChange}
          />
        </div>
      ))}
    </div>
  );
}

