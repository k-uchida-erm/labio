'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/types/database.types';

type Tag = Tables<'tags'>;

export function useTags(labId: string | undefined) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      if (!labId) {
        setLoading(false);
        return;
      }

      const supabase = createClient();

      try {
        const { data, error: fetchError } = await supabase
          .from('tags')
          .select('*')
          .eq('lab_id', labId)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;
        setTags(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch tags'));
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [labId]);

  return { tags, loading, error };
}
