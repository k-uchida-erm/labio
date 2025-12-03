'use client';

import { Box, User, Settings } from 'lucide-react';

export type PageHeaderProps = {
  projectCode: string;
  projectName: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  onSettingsClick?: () => void;
};

export function PageHeader({
  projectCode,
  projectName,
  onSettingsClick,
}: PageHeaderProps) {
  return (
    <>
      {/* Top Header */}
      <div className="flex h-10 w-full items-center justify-between py-0 pl-2 pr-4">
        <div className="flex items-center gap-2">
          <span className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-800">
            {projectCode}
          </span>
          <span className="text-sm text-slate-700">{projectName}</span>
          <User size={20} className="text-slate-600" />
        </div>
        <button
          onClick={onSettingsClick}
          className="flex items-center justify-center rounded-md p-2 hover:bg-slate-100"
        >
          <Settings size={20} className="text-slate-700" />
        </button>
      </div>

      {/* Page Title */}
      <div className="flex h-12 w-full items-end gap-2 overflow-hidden px-4 py-3">
        <Box size={16} className="text-slate-800" />
        <span className="text-sm text-slate-800">Activities</span>
      </div>
    </>
  );
}
