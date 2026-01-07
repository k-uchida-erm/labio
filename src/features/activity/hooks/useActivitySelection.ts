'use client';

import { useState, useRef, useCallback, createRef } from 'react';
import { ActivityWithTags } from '../types';

type ActivitySelectionOptions = {
  filteredActivities: ActivityWithTags[];
  childrenByParent?: Map<string, ActivityWithTags[]>;
};

export function useActivitySelection({ filteredActivities }: ActivitySelectionOptions) {
  const [checkedActivityIds, setCheckedActivityIds] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);
  const checkboxRefs = useRef<Map<string, React.RefObject<HTMLButtonElement | null>>>(new Map());

  const getCheckboxRef = useCallback(
    (activityId: string): React.RefObject<HTMLButtonElement | null> => {
      if (!checkboxRefs.current.has(activityId)) {
        checkboxRefs.current.set(activityId, createRef<HTMLButtonElement>());
      }
      return checkboxRefs.current.get(activityId)!;
    },
    []
  );

  const handleToggleActivityChecked = useCallback(
    (activityId: string, event?: React.MouseEvent) => {
      const isShiftPressed = event?.shiftKey ?? false;
      const currentIndex = filteredActivities.findIndex((a) => a.id === activityId);
      const wasChecked = checkedActivityIds.includes(activityId);

      let newCheckedIds: string[];
      let newLastCheckedIndex: number | null;

      if (isShiftPressed && lastCheckedIndex !== null && !wasChecked) {
        // Shiftキーが押されていて、前回チェックしたインデックスがある場合、範囲選択
        const startIndex = Math.min(lastCheckedIndex, currentIndex);
        const endIndex = Math.max(lastCheckedIndex, currentIndex);
        const rangeIds = filteredActivities.slice(startIndex, endIndex + 1).map((a) => a.id);
        newCheckedIds = Array.from(new Set([...checkedActivityIds, ...rangeIds]));
        newLastCheckedIndex = currentIndex;
      } else {
        // 通常のトグル
        if (wasChecked) {
          newCheckedIds = checkedActivityIds.filter((id) => id !== activityId);
        } else {
          newCheckedIds = Array.from(new Set([...checkedActivityIds, activityId]));
        }
        newLastCheckedIndex = wasChecked ? lastCheckedIndex : currentIndex;
      }

      setCheckedActivityIds(newCheckedIds);
      setLastCheckedIndex(newLastCheckedIndex);

      if (newCheckedIds.length === 0) {
        setLastCheckedIndex(null);
      }
    },
    [checkedActivityIds, lastCheckedIndex, filteredActivities]
  );

  const handleCancelSelection = useCallback(() => {
    setCheckedActivityIds([]);
    setLastCheckedIndex(null);
  }, []);

  return {
    checkedActivityIds,
    getCheckboxRef,
    handleToggleActivityChecked,
    handleCancelSelection,
    hasCheckedItems: checkedActivityIds.length > 0,
  };
}
