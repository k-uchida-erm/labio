'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type PasswordResetRequestValues = {
  email: string;
};

export function usePasswordResetRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requestReset = useCallback(async ({ email }: PasswordResetRequestValues) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) throw resetError;
      setSuccessMessage(
        'パスワードリセット用のメールを送信しました。メールボックスをご確認ください。'
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'メール送信に失敗しました。時間をおいて再度お試しください。';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { requestReset, loading, error, successMessage };
}

export default usePasswordResetRequest;
