'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FilterTag } from '@/components/activity/FilterDropdownMenu';
import { SortOption } from '@/components/activity/SortMenu';
import { useActivityFilters } from '@/features/activity/hooks/useActivityFilters';
import { useActivitySelection } from '@/features/activity/hooks/useActivitySelection';
import { useActivityStatusActions } from '@/features/activity/hooks/useActivityStatusActions';
import { useActivityTreeState } from '@/features/activity/hooks/useActivityTreeState';
import { useActivities } from '@/features/activity/hooks/useActivities';
import {
  buildActivityDepthMap,
  canCreateChildAtDepth,
  collectMaxDepthReachedIds,
} from '@/features/activity/utils/depth';
import {
  calculateAggregatedStatus,
  normalizeActivityStatus,
} from '@/features/activity/utils/status';
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
import { ActivityDetailSidePanel } from '@/components/activity/ActivityDetailSidePanel';
import type { ActivityToolbarProps } from '@/components/activity/ActivityToolbar';
import type { ActivityListStateProps } from '@/components/activity/ActivityListState';
import type { ActivityTreeProps } from '@/components/activity/ActivityTree';
import type { ActivityStatus as DbActivityStatus } from '@/features/activity/types';
import type { ProjectMainViewProps } from '@/features/project/components/layout/ProjectMainView';
import type { SidebarEntry } from '@/features/project/components/layout/ProjectWorkspaceLayout';
import { useSelectionRailPosition } from '@/features/project/hooks/useSelectionRailPosition';

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

type BreadcrumbArgs = {
  displayProjectKey: string;
  projectTitle?: string | null;
  parentId: string | null;
  activityById: Map<string, ReturnType<typeof useActivities>['activities'][number]>;
  nextSequence: number;
  currentType?: import('@/features/activity/types').ActivityType;
};

function useCreateModalBreadcrumbs({
  displayProjectKey,
  projectTitle,
  parentId,
  activityById,
  nextSequence,
  currentType,
}: BreadcrumbArgs) {
  return useMemo(() => {
    type Breadcrumb = import('@/components/activity/activity-detail/types').Breadcrumb;
    const chain: Breadcrumb[] = [
      { label: displayProjectKey.toUpperCase(), title: projectTitle ?? 'Project' },
    ];
    if (parentId) {
      const stack: Breadcrumb[] = [];
      let current = activityById.get(parentId);
      while (current) {
        stack.push({
          label: `${displayProjectKey.toUpperCase()}-${current.sequence_number}`,
          title: current.title,
          sequenceNumber: current.sequence_number ?? undefined,
          type: current.type ?? undefined,
        });
        current = current.parent_id ? activityById.get(current.parent_id) : undefined;
      }
      chain.push(...stack.reverse());
    }
    chain.push({
      label: `${displayProjectKey.toUpperCase()}-${nextSequence}`,
      title: 'New activity',
      type: currentType,
    });
    return chain;
  }, [activityById, parentId, displayProjectKey, nextSequence, projectTitle, currentType]);
}

function useSidebarData(
  projects: ReturnType<typeof useProjects>['projects'],
  members: ReturnType<typeof useLab>['members']
): {
  sidebarMyProjects: SidebarEntry[];
  sidebarAllProjects: SidebarEntry[];
  sidebarMembers: SidebarEntry[];
} {
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

type UseProjectWorkspaceControllerArgs = {
  labSlug: string;
  projectKey: string;
  mainContainerRef: React.RefObject<HTMLDivElement | null>;
};

type UseProjectWorkspaceControllerResult = {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  sidebarData: {
    labName: string;
    myProjects: SidebarEntry[];
    allProjects: SidebarEntry[];
    members: SidebarEntry[];
  };
  mainViewProps: ProjectMainViewProps;
  detailPanel: React.ReactNode;
  detailPanelVisible: boolean;
  cascadeNode: React.ReactNode;
  modalNode: React.ReactNode;
  selectionRail: React.ReactNode;
};

export function useProjectWorkspaceController({
  labSlug,
  projectKey,
  mainContainerRef,
}: UseProjectWorkspaceControllerArgs): UseProjectWorkspaceControllerResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterTag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption | null>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const createInputRef = useRef<HTMLInputElement | null>(null);
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalContainer(mainContainerRef.current);
  }, [mainContainerRef]);

  const { lab, members, error: labError } = useLab(labSlug);
  const { projects } = useProjects(lab?.id);
  const { project, error: projectError } = useProjectByKey(lab?.id, projectKey);
  const searchParamSequence = searchParams?.get('activity');
  const sequenceNumber = searchParamSequence ? parseInt(searchParamSequence, 10) : undefined;
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const {
    activities,
    loading: activitiesLoading,
    error: activitiesError,
    updateActivityStatus,
    markActivityAndDescendantsDone,
    updateActivityDueDate,
    updateActivityTitle,
    updateActivityDescription,
    createActivity,
    deleteActivities,
    refetch: refetchActivities,
    undoLastStatusChange,
    redoLastStatusChange,
  } = useActivities(project?.id, currentUser?.id);
  const [closingSequenceNumber, setClosingSequenceNumber] = useState<number | null>(null);

  const detailActivity = useMemo(() => {
    if (!sequenceNumber || !project || !lab) return null;
    return (
      activities.find(
        (a) =>
          a.sequence_number === sequenceNumber &&
          a.project_id === project.id &&
          a.lab_id === lab.id &&
          !a.deleted_at
      ) || null
    );
  }, [activities, sequenceNumber, project, lab]);

  const closingDetailActivity = useMemo(() => {
    if (closingSequenceNumber === null || !project || !lab) return null;
    return (
      activities.find(
        (a) =>
          a.sequence_number === closingSequenceNumber &&
          a.project_id === project.id &&
          a.lab_id === lab.id &&
          !a.deleted_at
      ) || null
    );
  }, [activities, closingSequenceNumber, project, lab]);

  const panelActivity = detailActivity ?? closingDetailActivity;
  const panelOpen = sequenceNumber !== undefined && !!detailActivity;
  const [detailPanelVisible, setDetailPanelVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDetailPanelVisible(panelOpen));
    return () => cancelAnimationFrame(id);
  }, [panelOpen]);

  const selectionRailBounds = useSelectionRailPosition({
    mainRef: mainContainerRef,
    panelVisible: detailPanelVisible,
    sidebarOpen,
  });

  const shouldRenderPanel = panelOpen || !!closingDetailActivity;

  const handleCloseDetail = () => {
    if (sequenceNumber !== undefined) {
      setClosingSequenceNumber(sequenceNumber);
    }
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('activity');
    const newSearch = params.toString();
    router.replace(`/${labSlug}/${projectKey}${newSearch ? `?${newSearch}` : ''}`);
    setTimeout(() => {
      setClosingSequenceNumber(null);
    }, 500);
  };

  const { tags } = useTags(lab?.id);
  const displayProjectKey = (project?.key ?? projectKey).toUpperCase();
  const activityById = useMemo(() => {
    const map = new Map<string, (typeof activities)[number]>();
    activities.forEach((a) => map.set(a.id, a));
    return map;
  }, [activities]);
  const activityDepthMap = useMemo(() => buildActivityDepthMap(activities), [activities]);
  const maxDepthReachedIds = useMemo(
    () => collectMaxDepthReachedIds(activityDepthMap),
    [activityDepthMap]
  );
  const canCreateSubActivity = useCallback(
    (parentId: string | null) => canCreateChildAtDepth(activityDepthMap, parentId),
    [activityDepthMap]
  );
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

  const {
    checkedActivityIds,
    getCheckboxRef,
    handleToggleActivityChecked,
    handleCancelSelection,
    hasCheckedItems,
  } = useActivitySelection({ filteredActivities });

  const handleMoveSelectedToTrash = useCallback(async () => {
    if (checkedActivityIds.length === 0) return;
    try {
      await deleteActivities(checkedActivityIds);
      handleCancelSelection();
    } catch (err) {
      console.error('Failed to delete activities:', err);
    }
  }, [checkedActivityIds, deleteActivities, handleCancelSelection]);

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

  const detailActivityStatusInfo = useMemo(() => {
    if (!panelActivity) return null;

    const allChildren = activitiesByParentAll.get(panelActivity.id) || [];
    const totalSubtasks = allChildren.length;
    const completedSubtasks = allChildren.filter(
      (a) => normalizeActivityStatus(a.status) === 'done'
    ).length;
    const hasInProgressChild = allChildren.some(
      (a) => normalizeActivityStatus(a.status) === 'in_progress'
    );

    const calculatedStatus = calculateAggregatedStatus(
      panelActivity.status,
      allChildren.map((child) => child.status)
    ) as DbActivityStatus;

    return {
      status: calculatedStatus,
      totalSubtasks,
      completedSubtasks,
      hasChildren: totalSubtasks > 0,
    };
  }, [panelActivity, activitiesByParentAll]);

  const breadcrumbs = useCreateModalBreadcrumbs({
    displayProjectKey,
    projectTitle: project?.title,
    parentId: createFormValues.parentId,
    activityById,
    nextSequence,
    currentType: createFormValues.type,
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
    compactControls: detailPanelVisible,
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

  const handleRequestAddSubActivity = useCallback(
    (parentId: string) => {
      if (!canCreateSubActivity(parentId)) {
        return;
      }
      handleOpenCreateModal(parentId);
    },
    [canCreateSubActivity, handleOpenCreateModal]
  );

  const treeProps: ActivityTreeProps & { showTree: boolean } = {
    showTree,
    projectKey,
    projectLabel: project?.key ?? undefined,
    labSlug,
    parentActivities,
    visibleActivitiesByParent,
    activitiesByParentAll,
    expandedActivityIds: new Set(expandedActivityIds),
    checkedActivityIds,
    indentEnabled,
    showKey,
    onToggleChecked: handleToggleActivityChecked,
    onToggleChildren: toggleExpanded,
    onAddSubActivity: (id) => handleRequestAddSubActivity(id),
    onChangeStatus: (id, next) => changeStatus(id, next as DbActivityStatus),
    onChangeDueDate: updateActivityDueDate,
    getCheckboxRef,
    maxDepthReachedIds,
    compactMeta: detailPanelVisible,
    activeActivityId: panelActivity?.id ?? null,
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
      labSlug={labSlug}
      projectKey={projectKey}
      container={modalContainer ?? undefined}
    />
  );

  const selectionRail = hasCheckedItems ? (
    <NavRail
      onToggleSidebar={() => setSidebarOpen(true)}
      orientation="horizontal"
      onCancel={handleCancelSelection}
      onMoveToTrash={() => void handleMoveSelectedToTrash()}
      selectedCount={checkedActivityIds.length}
      horizontalLeft={selectionRailBounds.left}
      horizontalWidth={selectionRailBounds.width}
    />
  ) : null;

  const subActivities = useMemo(() => {
    if (!panelActivity) return [];
    const children = activitiesByParentAll.get(panelActivity.id) || [];
    return [...children].sort((a, b) => {
      const seqA = a.sequence_number ?? 0;
      const seqB = b.sequence_number ?? 0;
      return seqB - seqA;
    });
  }, [panelActivity, activitiesByParentAll]);

  const detailPanel =
    shouldRenderPanel && detailActivityStatusInfo && panelActivity ? (
      <ActivityDetailSidePanel
        activity={panelActivity}
        onClose={handleCloseDetail}
        labSlug={labSlug}
        projectKey={projectKey}
        projectTitle={project?.title}
        labId={lab?.id}
        projectId={project?.id}
        onUpdateTitle={updateActivityTitle}
        onUpdateDescription={updateActivityDescription}
        status={detailActivityStatusInfo.status}
        totalSubtasks={detailActivityStatusInfo.totalSubtasks}
        completedSubtasks={detailActivityStatusInfo.completedSubtasks}
        hasChildren={detailActivityStatusInfo.hasChildren}
        subActivities={subActivities}
        onAddSubActivity={handleRequestAddSubActivity}
        onCreateSubActivity={async (data) => {
          if (!lab?.id || !project?.id) return;
          await createActivity({
            lab_id: lab.id,
            project_id: project.id,
            title: data.title,
            type: data.type ?? 'task',
            parent_id: data.parentId,
            due_date: data.dueDate ? data.dueDate.toISOString() : undefined,
            assignee_id: data.assigneeId ?? null,
            description: data.description,
          });
        }}
        assignees={assigneeOptions}
        onChangeSubActivityStatus={(id, next) => changeStatus(id, next as DbActivityStatus)}
        onChangeSubActivityDueDate={updateActivityDueDate}
        onClickSubActivity={(clickedLabSlug, clickedProjectKey, clickedSequenceNumber) => {
          const params = new URLSearchParams(searchParams?.toString() || '');
          params.set('activity', clickedSequenceNumber.toString());
          const newSearch = params.toString();
          router.replace(`/${clickedLabSlug}/${clickedProjectKey}?${newSearch}`);
        }}
        checkedActivityIds={checkedActivityIds}
        getCheckboxRef={getCheckboxRef}
        onToggleSubActivityChecked={handleToggleActivityChecked}
        activitiesByParentAll={activitiesByParentAll}
        visibleActivitiesByParent={visibleActivitiesByParent}
        expandedActivityIds={new Set(expandedActivityIds)}
        onToggleChildren={toggleExpanded}
        indentEnabled={indentEnabled}
        projectLabel={project?.key ?? undefined}
        maxDepthReachedIds={maxDepthReachedIds}
        displayMode="push"
        open={panelOpen}
      />
    ) : null;

  const mainViewProps: ProjectMainViewProps = {
    headerProps,
    toolbarProps,
    listStateProps,
    treeProps,
  };

  return {
    sidebarOpen,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    sidebarData: {
      labName: lab?.name ?? labSlug ?? 'Lab Name',
      myProjects: sidebarMyProjects,
      allProjects: sidebarAllProjects,
      members: sidebarMembers,
    },
    mainViewProps,
    detailPanel,
    detailPanelVisible,
    cascadeNode,
    modalNode,
    selectionRail,
  };
}

export default useProjectWorkspaceController;
