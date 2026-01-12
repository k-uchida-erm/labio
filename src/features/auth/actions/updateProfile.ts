'use server';

import { createClient } from '@/lib/supabase/server';
import type { TablesUpdate } from '@/types/database.types';

export type UpdateProfilePayload = {
  email?: string;
  display_name?: string | null;
  avatar_url?: string | null;
};

export type UpdateProfileResult = {
  success: boolean;
  error?: string;
};

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<UpdateProfileResult> {
  try {
    // 環境変数のチェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return {
        success: false,
        error: 'Server configuration error: Missing Supabase credentials',
      };
    }

    const supabase = await createClient();

    // 認証チェック（getSessionを使用）
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error in updateProfile:', sessionError);
      return { success: false, error: `Authentication error: ${sessionError.message}` };
    }

    if (!session?.user) {
      console.error('No session found in updateProfile');
      return { success: false, error: 'Not authenticated' };
    }

    const user = session.user;

  // バリデーション
  if (payload.display_name !== undefined) {
    if (payload.display_name && payload.display_name.length > 50) {
      return { success: false, error: 'Full name must be 50 characters or less' };
    }
  }

  if (payload.email !== undefined) {
    // Email形式のバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Supabase Authのemailを更新
    const { error: emailUpdateError } = await supabase.auth.updateUser({
      email: payload.email,
    });

    if (emailUpdateError) {
      return { success: false, error: emailUpdateError.message };
    }
  }

  // プロフィール更新
  const updateData: TablesUpdate<'profiles'> = {};
  if (payload.email !== undefined) {
    updateData.email = payload.email;
  }
  if (payload.display_name !== undefined) {
    updateData.display_name = payload.display_name || null;
  }
  if (payload.avatar_url !== undefined) {
    updateData.avatar_url = payload.avatar_url || null;
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

    if (updateError) {
      console.error('Update error in updateProfile:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in updateProfile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return {
      success: false,
      error: `Failed to update profile: ${errorMessage}`,
    };
  }
}
