'use client';

import { useCallback, useEffect, useState } from 'react';

type SelectionRailBounds = {
  left: string;
  width: string;
};

type UseSelectionRailPositionArgs = {
  mainRef: React.RefObject<HTMLElement | null>;
  panelVisible: boolean;
  sidebarOpen: boolean;
};

const DEFAULT_BOUNDS: SelectionRailBounds = { left: '50%', width: 'auto' };

export function useSelectionRailPosition({
  mainRef,
  panelVisible,
  sidebarOpen,
}: UseSelectionRailPositionArgs) {
  const [bounds, setBounds] = useState<SelectionRailBounds>(DEFAULT_BOUNDS);

  const updateBounds = useCallback(() => {
    const rect = mainRef.current?.getBoundingClientRect();
    if (!rect) {
      setBounds(DEFAULT_BOUNDS);
      return;
    }
    setBounds({
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
  }, [mainRef]);

  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  useEffect(() => {
    updateBounds();
  }, [panelVisible, sidebarOpen, updateBounds]);

  useEffect(() => {
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, true);
    return () => {
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds, true);
    };
  }, [updateBounds]);

  return bounds;
}

export default useSelectionRailPosition;
