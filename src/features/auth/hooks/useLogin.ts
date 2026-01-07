'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { LoginFormValues, LoginResult } from '../types';

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (values: LoginFormValues): Promise<LoginResult> => {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      try {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (authError) {
          const isEmailNotConfirmed =
            authError.message.toLowerCase().includes('email not confirmed') ||
            authError.message.toLowerCase().includes('email_not_confirmed');

          const result: LoginResult = {
            ok: false,
            code: isEmailNotConfirmed ? 'EMAIL_NOT_CONFIRMED' : 'INVALID_CREDENTIALS',
            message: isEmailNotConfirmed
              ? 'メールアドレスの確認が完了していません。確認メールをチェックしてください。'
              : 'メールアドレスまたはパスワードが正しくありません。',
          };

          setError(result.message);
          return result;
        }

        const result: LoginResult = {
          ok: true,
          session: data.session,
        };

        // ログイン後の遷移先（クエリのredirectがあれば優先）
        const redirectTo = searchParams.get('redirect') ?? '/ai-lab-a3f2/PINN';
        router.push(redirectTo);

        return result;
      } catch {
        const result: LoginResult = {
          ok: false,
          code: 'UNKNOWN',
          message: 'ログイン中にエラーが発生しました。',
        };
        setError(result.message);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [router, searchParams]
  );

  return {
    login,
    loading,
    error,
  };
}
