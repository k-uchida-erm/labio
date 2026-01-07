'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProjectWithAssignee } from '../types';

export function useProjects(labId: string | undefined) {
  const [projects, setProjects] = useState<ProjectWithAssignee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!labId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('lab_id', labId)
          .is('deleted_at', null)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        // assignee情報を別クエリで取得
        if (data && data.length > 0) {
          const assigneeIds = data
            .map((p) => p.assignee_id)
            .filter((id): id is string => id !== null);

          let assigneeMap = new Map<
            string,
            { id: string; display_name: string | null; avatar_url: string | null }
          >();

          if (assigneeIds.length > 0) {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .in('id', assigneeIds);

            assigneeMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
          }

          const projectsWithAssignee: ProjectWithAssignee[] = data.map((p) => ({
            ...p,
            assignee: p.assignee_id ? assigneeMap.get(p.assignee_id) || null : null,
          }));

          setProjects(projectsWithAssignee);
        } else {
          setProjects([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [labId]);

  return { projects, loading, error };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<ProjectWithAssignee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .is('deleted_at', null)
          .single();

        if (fetchError) throw fetchError;

        let assignee = null;
        if (data.assignee_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', data.assignee_id)
            .single();
          assignee = profileData;
        }

        setProject({ ...data, assignee });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
}

export function useProjectByKey(labId: string | undefined, projectKey: string | undefined) {
  const [project, setProject] = useState<ProjectWithAssignee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!labId || !projectKey) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        // Projectをkeyで取得（仕様書に従い、lab_idとkeyで検索）
        const { data: projectData, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('lab_id', labId)
          .eq('key', projectKey)
          .is('deleted_at', null)
          .single();

        if (fetchError) throw fetchError;

        let assignee = null;
        if (projectData?.assignee_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .eq('id', projectData.assignee_id)
            .single();
          assignee = profileData;
        }

        setProject(projectData ? { ...projectData, assignee } : null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch project'));
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [labId, projectKey]);

  return { project, loading, error };
}
