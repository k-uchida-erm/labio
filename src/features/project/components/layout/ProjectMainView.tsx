'use client';

import React from 'react';
import ProjectHeader from '@/components/project/ProjectHeader';
import ActivityToolbar, { type ActivityToolbarProps } from '@/components/activity/ActivityToolbar';
import ActivityListState, {
  type ActivityListStateProps,
} from '@/components/activity/ActivityListState';
import ActivityTree, { type ActivityTreeProps } from '@/components/activity/ActivityTree';
import ActivitySectionHeader from '@/components/activity/ActivitySectionHeader';

type ProjectMainViewProps = {
  headerProps: React.ComponentProps<typeof ProjectHeader>;
  toolbarProps: ActivityToolbarProps;
  listStateProps: ActivityListStateProps;
  treeProps: ActivityTreeProps & { showTree: boolean };
};

export function ProjectMainView({
  headerProps,
  toolbarProps,
  listStateProps,
  treeProps,
}: ProjectMainViewProps) {
  return (
    <>
      <ProjectHeader {...headerProps} />
      <ActivitySectionHeader />
      <ActivityToolbar {...toolbarProps} />
      <section className="mt-2 flex flex-col gap-1 px-2">
        <ActivityListState {...listStateProps} />
        {treeProps.showTree && <ActivityTree {...treeProps} />}
      </section>
    </>
  );
}

export default ProjectMainView;
