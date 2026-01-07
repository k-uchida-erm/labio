'use client';

import React, { useMemo, useRef, useState } from 'react';
import ProjectWorkspaceLayout from '@/features/project/components/layout/ProjectWorkspaceLayout';
import ProjectMainView from '@/features/project/components/layout/ProjectMainView';
import { FilterTag } from '@/components/activity/FilterDropdownMenu';
import { SortOption } from '@/components/activity/SortMenu';
import { useActivityFilters } from '@/features/activity/hooks/useActivityFilters';
import { useActivitySelection } from '@/features/activity/hooks/useActivitySelection';
import { useActivityStatusActions } from '@/features/activity/hooks/useActivityStatusActions';
import { useActivityTreeState } from '@/features/activity/hooks/useActivityTreeState';
import { useActivities } from '@/features/activity/hooks/useActivities';
import { useTags } from '@/features/activity/hooks/useTags';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useStatusHotkeys } from '@/features/activity/hooks/useStatusHotkeys';
import { useLab } from '@/features/lab/hooks/useLab';
import { useProjects, useProjectByKey } from '@/features/project/hooks/useProjects';
import { useAssignees } from '@/features/project/hooks/useAssignees';
import { useCreateActivityState } from '@/features/project/hooks/useCreateActivityState';
import CascadeDoneDialog from '@/components/activity/CascadeDoneDialog';
import NavRail from '@/components/layout/NavRail';
import CreateActivityModal from '@/features/project/components/CreateActivityModal';
import type { ActivityToolbarProps } from '@/components/activity/ActivityToolbar';
import type { ActivityListStateProps } from '@/components/activity/ActivityListState';
import type { ActivityTreeProps } from '@/components/activity/ActivityTree';
import type { ActivityStatus as DbActivityStatus } from '@/features/activity/types';

type ListStateError = NonNullable<ActivityListStateProps['labError']>;

const toListStateError = (error: unknown): ListStateError | null => {
  if (!error) return null;
  if (typeof error === 'object' && error !== null) {
    const { message, code, details, hint } = error as {
      message?: string;
      code?: string;
      details?: unknown;
      hint?: unknown;
    };
    return {
      message: message ?? 'Unknown error',
      code: typeof code === 'string' ? code : undefined,
      details: typeof details === 'string' ? details : undefined,
      hint: typeof hint === 'string' ? hint : undefined,
    };
  }
  return { message: String(error) };
};

function useSidebarData(
  projects: ReturnType<typeof useProjects>['projects'],
  members: ReturnType<typeof useLab>['members']
) {
  return useMemo(
    () => ({
      sidebarMyProjects:
        projects?.slice(0, 2).map((p) => ({ label: p.title, icon: 'notebook' as const })) ?? [],
      sidebarAllProjects:
        projects?.map((p) => ({ label: p.title, icon: 'notebook' as const })) ?? [],
      sidebarMembers:
        members?.map((m) => ({
          label: m.profile?.display_name ?? 'Member',
          icon: 'user' as const,
        })) ?? [],
    }),
    [projects, members]
  );
}

type BreadcrumbArgs = {
  displayProjectKey: string;
  projectTitle?: string | null;
  parentId: string | null;
  activityById: Map<string, ReturnType<typeof useActivities>['activities'][number]>;
  nextSequence: number;
};

function useCreateModalBreadcrumbs({
  displayProjectKey,
  projectTitle,
  parentId,
  activityById,
  nextSequence,
}: BreadcrumbArgs) {
  return useMemo(() => {
    const chain: Array<{ label: string; title?: string; color?: string }> = [
      { label: displayProjectKey, title: projectTitle ?? 'Project' },
    ];
    if (parentId) {
      const stack: Array<{ label: string; title?: string }> = [];
      let current = activityById.get(parentId);
      while (current) {
        stack.push({
          label: `${displayProjectKey}-${current.sequence_number}`,
          title: current.title,
        });
        current = current.parent_id ? activityById.get(current.parent_id) : undefined;
      }
      chain.push(...stack.reverse());
    }
    chain.push({
      label: `${displayProjectKey}-${nextSequence}`,
      title: 'New activity',
      color: 'text-indigo-600',
    });
    return chain;
  }, [activityById, parentId, displayProjectKey, nextSequence, projectTitle]);
}

type ProjectWorkspaceProps = {
  labSlug: string;
  projectKey: string;
};

export function ProjectWorkspace({ labSlug, projectKey }: ProjectWorkspaceProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);
  const { lab, members, error: labError } = useLab(labSlug);
  const { projects } = useProjects(lab?.id);
  const { project, error: projectError } = useProjectByKey(lab?.id, projectKey);
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    updateActivityStatus,
    markActivityAndDescendantsDone,
    updateActivityDueDate,
    createActivity,
    refetch: refetchActivities,
    undoLastStatusChange,
    redoLastStatusChange,
  } = useActivities(project?.id, currentUser?.id);
  const { tags } = useTags(lab?.id);
  const displayProjectKey = (project?.key ?? projectKey).toUpperCase();
  const activityById = useMemo(() => {
    const map = new Map<string, (typeof activities)[number]>();
    activities.forEach((a) => map.set(a.id, a));
    return map;
  }, [activities]);
  const nextSequence = useMemo(() => {
    const maxSeq = activities.reduce((max, a) => Math.max(max, a.sequence_number ?? 0), 0);
    return maxSeq + 1;
  }, [activities]);

  const { sidebarMyProjects, sidebarAllProjects, sidebarMembers } = useSidebarData(
    projects,
    members
  );

  const { options: assigneeOptions, getDefaultAssigneeId } = useAssignees(members, currentUser?.id);

  const handleRemoveFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAddFilter = (filter: FilterTag) => {
    setFilters((prev) => {
      const filtered = prev.filter((f) => f.type !== filter.type);
      return [...filtered, filter];
    });
  };

  const { filteredActivities } = useActivityFilters(
    activities,
    searchQuery,
    filters,
    project?.assignee_id
  );

  const {
    expandedActivityIds,
    indentEnabled,
    showKey,
    setIndentEnabled,
    setShowKey,
    toggleExpanded,
    visibleActivitiesByParent,
    activitiesByParentAll,
    parentActivities,
    expandAll,
    collapseAll,
    hasExpanded,
  } = useActivityTreeState({
    activities,
    filteredActivities,
    sortOption,
  });

  const {
    cascadeState,
    cascadePending,
    cascadeError,
    setCascadeState,
    changeStatus,
    confirmCascade,
  } = useActivityStatusActions({
    activities,
    activitiesByParentAll,
    updateActivityStatus,
    markActivityAndDescendantsDone,
  });

  const handleToggleChildren = toggleExpanded;

  const {
    checkedActivityIds,
    getCheckboxRef,
    handleToggleActivityChecked,
    handleCancelSelection,
    hasCheckedItems,
  } = useActivitySelection({ filteredActivities });

  useStatusHotkeys({
    onUndo: () => void undoLastStatusChange(),
    onRedo: () => void redoLastStatusChange(),
  });

  const {
    open: createModalOpen,
    formValues: createFormValues,
    formErrors: createFormErrors,
    createPending,
    createMore,
    setCreateMore,
    openModal: handleOpenCreateModal,
    closeModal: handleCloseCreateModal,
    handleTitleChange: handleCreateTitleChange,
    handleDescriptionChange: handleCreateDescriptionChange,
    handleTypeChange: handleCreateTypeChange,
    handleDueDateChange: handleCreateDueDateChange,
    handleAssigneeChange: handleCreateAssigneeChange,
    submit: handleSubmitCreate,
  } = useCreateActivityState({
    labId: lab?.id,
    project,
    currentUserId: currentUser?.id ?? null,
    assigneeDefaultId: getDefaultAssigneeId(),
    createActivity,
    refetch: refetchActivities,
    onExpandParent: toggleExpanded,
  });

  const breadcrumbs = useCreateModalBreadcrumbs({
    displayProjectKey,
    projectTitle: project?.title,
    parentId: createFormValues.parentId,
    activityById,
    nextSequence,
  });

  const headerProps = useMemo(
    () => ({
      projectKey: project?.key ?? projectKey,
      projectTitle: project?.title ?? 'Project',
      assignees:
        members?.map((m) => ({
          id: m.user_id,
          name: m.profile?.display_name ?? 'Member',
          avatarUrl: m.profile?.avatar_url ?? null,
        })) ?? [],
    }),
    [members, project?.key, project?.title, projectKey]
  );

  const toolbarProps: ActivityToolbarProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    filters,
    onRemoveFilter: handleRemoveFilter,
    onAddFilter: handleAddFilter,
    assignees:
      members?.map((m) => m.profile).filter((p): p is NonNullable<typeof p> => p !== null) || [],
    tags,
    currentUserId: currentUser?.id,
    filterOpen,
    setFilterOpen,
    filterMenuRef,
    sortOption,
    onSortChange: setSortOption,
    showKey,
    onToggleShowKey: setShowKey,
    indentEnabled,
    onToggleIndent: setIndentEnabled,
    onExpandAll: () => expandAll(),
    onCollapseAll: () => collapseAll(),
    hasExpanded,
    onAddActivity: () => handleOpenCreateModal(null),
  };

  const listStateProps: ActivityListStateProps = {
    labError: toListStateError(labError),
    projectError: toListStateError(projectError),
    activitiesError: toListStateError(activitiesError),
    loading: activitiesLoading,
    userLoading,
    parentCount: parentActivities.length,
    activitiesCount: activities.length,
  };

  const showTree =
    !activitiesLoading && !projectError && !activitiesError && parentActivities.length > 0;

  const treeProps: ActivityTreeProps & { showTree: boolean } = {
    showTree,
    projectKey,
    projectLabel: project?.key ?? undefined,
    parentActivities,
    visibleActivitiesByParent,
    activitiesByParentAll,
    expandedActivityIds: new Set(expandedActivityIds),
    checkedActivityIds,
    indentEnabled,
    showKey,
    onToggleChecked: handleToggleActivityChecked,
    onToggleChildren: handleToggleChildren,
    onAddSubActivity: (id) => handleOpenCreateModal(id),
    onChangeStatus: (id, next) => changeStatus(id, next as DbActivityStatus),
    onChangeDueDate: updateActivityDueDate,
    getCheckboxRef,
  };

  const cascadeNode = cascadeState && (
    <CascadeDoneDialog
      titles={cascadeState.titles}
      pending={cascadePending}
      error={cascadeError}
      onCancel={() => setCascadeState(null)}
      onConfirm={confirmCascade}
    />
  );

  const modalNode = (
    <CreateActivityModal
      open={createModalOpen}
      breadcrumbs={breadcrumbs}
      formValues={createFormValues}
      formErrors={createFormErrors}
      onClose={handleCloseCreateModal}
      onSubmit={() => void handleSubmitCreate()}
      onTitleChange={handleCreateTitleChange}
      onDescriptionChange={handleCreateDescriptionChange}
      onTypeChange={handleCreateTypeChange}
      onDueDateChange={handleCreateDueDateChange}
      onAssigneeChange={handleCreateAssigneeChange}
      createMore={createMore}
      onToggleCreateMore={setCreateMore}
      createPending={createPending}
      inputRef={createInputRef}
      assignees={assigneeOptions}
    />
  );

  const selectionRail = hasCheckedItems && (
    <NavRail
      onToggleSidebar={() => setSidebarOpen(true)}
      orientation="horizontal"
      onCancel={handleCancelSelection}
      selectedCount={checkedActivityIds.length}
    />
  );

  return (
    <ProjectWorkspaceLayout
      sidebarOpen={sidebarOpen}
      onOpenSidebar={() => setSidebarOpen(true)}
      onCloseSidebar={() => setSidebarOpen(false)}
      sidebarData={{
        labName: lab?.name ?? labSlug ?? 'Lab Name',
        myProjects: sidebarMyProjects,
        allProjects: sidebarAllProjects,
        members: sidebarMembers,
      }}
      cascadeNode={cascadeNode}
      modalNode={modalNode}
      selectionRail={selectionRail}
    >
      <ProjectMainView
        headerProps={headerProps}
        toolbarProps={toolbarProps}
        listStateProps={listStateProps}
        treeProps={treeProps}
      />
    </ProjectWorkspaceLayout>
  );
}

export default ProjectWorkspace;
