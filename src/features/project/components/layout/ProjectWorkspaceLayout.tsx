'use client';

import React from 'react';
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
  detailPanel?: React.ReactNode;
  detailPanelVisible?: boolean;
  mainContainerRef?: React.RefObject<HTMLDivElement | null>;
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
  detailPanel,
  detailPanelVisible = false,
  mainContainerRef,
}: ProjectWorkspaceLayoutProps) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`transition-all duration-200 ease-out ${
            sidebarOpen ? 'w-[200px] min-w-[200px]' : 'w-12 min-w-[48px]'
          } ${sidebarOpen ? 'overflow-y-auto opacity-100' : 'opacity-100'}`}
        >
          <ProjectSidebar
            labName={sidebarData.labName}
            myProjects={sidebarData.myProjects}
            allProjects={sidebarData.allProjects}
            members={sidebarData.members}
            onToggle={sidebarOpen ? onCloseSidebar : onOpenSidebar}
            collapsed={!sidebarOpen}
          />
        </div>

        <div className="flex min-w-0 flex-1 overflow-hidden">
          <main
            ref={mainContainerRef}
            className={`relative flex h-full min-w-0 flex-none flex-col overflow-y-auto px-2 py-2 transition-[width,padding-right] duration-300 ease-in-out ${
              detailPanelVisible ? 'pr-4' : ''
            }`}
            style={{
              width: detailPanelVisible ? 'calc(100% - min(640px, 50vw))' : '100%',
            }}
          >
            {children}
          </main>
          {detailPanel}
        </div>
      </div>

      {cascadeNode}
      {modalNode}
      {selectionRail}
    </div>
  );
}

export default ProjectWorkspaceLayout;
