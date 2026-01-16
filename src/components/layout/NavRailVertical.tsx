'use client';

import { SidebarSimple } from 'phosphor-react';
import { Button } from '@/components/ui/button';

export type NavRailVerticalProps = {
  onToggleSidebar: () => void;
};

export function NavRailVertical({ onToggleSidebar }: NavRailVerticalProps) {
  return (
    <nav className="flex h-auto w-12 shrink-0 flex-col items-start bg-slate-50 pt-2 pl-2">
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-[6px] border border-slate-200 bg-slate-50 p-1 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md p-0"
          onClick={onToggleSidebar}
          aria-label="Open sidebar"
        >
          <SidebarSimple size={16} weight="regular" />
        </Button>
      </div>
    </nav>
  );
}

export default NavRailVertical;
