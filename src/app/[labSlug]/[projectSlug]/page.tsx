'use client';

import { use, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PageHeader } from '@/components/activity/PageHeader';
import { ViewHeader, ViewType } from '@/components/activity/ViewHeader';
import { Toolbar } from '@/components/activity/Toolbar';
import { ActivityList } from '@/components/activity/ActivityList';
import {
  Activity as ActivityUI,
  ActivityStatus as ActivityStatusUI,
} from '@/components/activity/ActivityRow';
import { useLab } from '@/features/lab/hooks/useLab';
import { useProjects } from '@/features/project/hooks/useProjects';
import { useActivities } from '@/features/activity/hooks/useActivities';
import { activityTypeToDisplay, ActivityStatus } from '@/features/activity/types';
import { format } from 'date-fns';

// DBのステータスをUI用に変換
function mapStatusToUI(status: ActivityStatus): ActivityStatusUI {
  switch (status) {
    case 'todo':
      return 'todo';
    case 'in_progress':
    case 'in_review':
      return 'in_progress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
}

// UI用のステータスをDBに変換
function mapStatusToDB(status: ActivityStatusUI): ActivityStatus {
  switch (status) {
    case 'todo':
      return 'todo';
    case 'in_progress':
      return 'in_progress';
    case 'done':
      return 'done';
    default:
      return 'todo';
  }
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ labSlug: string; projectSlug: string }>;
}) {
  const { labSlug, projectSlug } = use(params);

  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // データ取得
  const { lab, members, loading: labLoading } = useLab(labSlug);
  const { projects, loading: projectsLoading } = useProjects(lab?.id);

  // 現在のプロジェクトを取得（slugがない場合はtitleで近似マッチ）
  const currentProject =
    projects.find(
      (p) => p.title.toLowerCase().replace(/\s+/g, '-') === projectSlug.toLowerCase()
    ) || projects[0];

  const {
    activities,
    loading: activitiesLoading,
    updateActivityStatus,
  } = useActivities(currentProject?.id);

  // DBのactivityをUI用に変換
  const uiActivities: ActivityUI[] = activities.map((activity, index) => ({
    id: activity.id,
    displayId: `${currentProject?.title?.substring(0, 4).toUpperCase() || 'PROJ'}-${index + 1}`,
    type: activityTypeToDisplay[activity.type] as ActivityUI['type'],
    title: activity.title,
    status: mapStatusToUI(activity.status),
    dueDate: activity.due_date ? format(new Date(activity.due_date), 'yyyy/MM/dd') : undefined,
    hasChildren: false,
  }));

  const handleStatusChange = async (id: string, status: ActivityStatusUI) => {
    try {
      await updateActivityStatus(id, mapStatusToDB(status));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleActivityClick = (id: string) => {
    console.log('Activity clicked:', id);
    // TODO: アクティビティ詳細モーダルを開く
  };

  const handleAddActivity = () => {
    console.log('Add activity clicked');
    // TODO: 新規アクティビティ作成モーダルを開く
  };

  // ローディング中
  if (labLoading || projectsLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  // Labが見つからない場合
  if (!lab) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="text-slate-500">Lab not found</div>
      </div>
    );
  }

  // サイドバー用のデータ変換
  const myProjects = projects.map((p) => ({
    id: p.id,
    name: p.title,
    slug: p.title.toLowerCase().replace(/\s+/g, '-'),
  }));

  const memberList = members.map((m) => ({
    id: m.user_id,
    name: m.profile?.display_name || 'Unknown',
  }));

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar */}
      {sidebarOpen && (
        <Sidebar
          labName={lab.name}
          labSlug={labSlug}
          myProjects={myProjects}
          allProjects={myProjects}
          members={memberList}
          onToggle={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden p-2">
        <PageHeader
          projectCode={currentProject?.title?.substring(0, 4).toUpperCase() || 'PROJ'}
          projectName={currentProject?.title || projectSlug}
          onSettingsClick={() => console.log('Settings clicked')}
        />

        <ViewHeader currentView={currentView} onViewChange={setCurrentView} />

        <Toolbar
          onSearch={() => console.log('Search clicked')}
          onFilter={() => console.log('Filter clicked')}
          onSort={() => console.log('Sort clicked')}
          onAddActivity={handleAddActivity}
        />

        <div className="flex-1 overflow-auto px-6">
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              Loading activities...
            </div>
          ) : uiActivities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-slate-500">
              No activities yet. Click &quot;Add Activity&quot; to create one.
            </div>
          ) : (
            <ActivityList
              activities={uiActivities}
              onActivityClick={handleActivityClick}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}
