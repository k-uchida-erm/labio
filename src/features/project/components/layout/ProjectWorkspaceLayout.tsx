'use client';

import React from 'react';
import NavRail from '@/components/layout/NavRail';
import ProjectSidebar from '@/components/layout/ProjectSidebar';

export type SidebarEntry = { label: string; icon: 'notebook' | 'user' };

export type ProjectWorkspaceLayoutProps = {
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onCloseSidebar: () => void;
  sidebarData: {
    labName: string;
    myProjects: SidebarEntry[];
    allProjects: SidebarEntry[];
    members: SidebarEntry[];
  };
  children: React.ReactNode;
  cascadeNode?: React.ReactNode;
  modalNode: React.ReactNode;
  selectionRail?: React.ReactNode;
};

export function ProjectWorkspaceLayout({
  sidebarOpen,
  onOpenSidebar,
  onCloseSidebar,
  sidebarData,
  children,
  cascadeNode,
  modalNode,
  selectionRail,
}: ProjectWorkspaceLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden">
        {!sidebarOpen && <NavRail onToggleSidebar={onOpenSidebar} />}

        <div
          className={`transition-all duration-200 ease-out ${
            sidebarOpen
              ? 'w-[200px] overflow-y-auto opacity-100'
              : 'pointer-events-none w-0 overflow-hidden opacity-0'
          }`}
        >
          <ProjectSidebar
            labName={sidebarData.labName}
            myProjects={sidebarData.myProjects}
            allProjects={sidebarData.allProjects}
            members={sidebarData.members}
            onToggle={onCloseSidebar}
          />
        </div>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-2 py-2 transition-all duration-200 ease-out">
          {children}
        </main>
      </div>

      {cascadeNode}
      {modalNode}
      {selectionRail}
    </div>
  );
}

export default ProjectWorkspaceLayout;
