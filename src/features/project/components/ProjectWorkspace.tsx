'use client';

import React, { useRef } from 'react';
import ProjectWorkspaceLayout from '@/features/project/components/layout/ProjectWorkspaceLayout';
import ProjectMainView from '@/features/project/components/layout/ProjectMainView';
import { useProjectWorkspaceController } from '@/features/project/hooks/useProjectWorkspaceController';

type ProjectWorkspaceProps = {
  labSlug: string;
  projectKey: string;
};

export function ProjectWorkspace({ labSlug, projectKey }: ProjectWorkspaceProps) {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const {
    sidebarOpen,
    openSidebar,
    closeSidebar,
    sidebarData,
    mainViewProps,
    detailPanel,
    detailPanelVisible,
    cascadeNode,
    modalNode,
    selectionRail,
  } = useProjectWorkspaceController({ labSlug, projectKey, mainContainerRef });

  return (
    <ProjectWorkspaceLayout
      sidebarOpen={sidebarOpen}
      onOpenSidebar={openSidebar}
      onCloseSidebar={closeSidebar}
      sidebarData={sidebarData}
      cascadeNode={cascadeNode}
      modalNode={modalNode}
      selectionRail={selectionRail}
      detailPanel={detailPanel}
      detailPanelVisible={detailPanelVisible}
      mainContainerRef={mainContainerRef}
    >
      <ProjectMainView {...mainViewProps} />
    </ProjectWorkspaceLayout>
  );
}

export default ProjectWorkspace;
