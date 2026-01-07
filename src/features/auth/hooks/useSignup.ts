'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type SignupFormValues = {
  email: string;
  password: string;
  displayName?: string;
};

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const signup = useCallback(async ({ email, password, displayName }: SignupFormValues) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
        },
      });

      if (signUpError) throw signUpError;
      setSuccessMessage('確認メールを送信しました。メールボックスを確認してください。');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'サインアップに失敗しました。時間をおいて再度お試しください。';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { signup, loading, error, successMessage };
}

export default useSignup;
