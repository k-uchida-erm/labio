'use client';

import { useCallback } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { usePasswordResetRequest } from '@/features/auth/hooks/usePasswordResetRequest';

export default function ForgotPasswordPage() {
  const { requestReset, loading, error, successMessage } = usePasswordResetRequest();

  const handleSubmit = useCallback(
    async (values: { email: string }) => {
      await requestReset(values);
    },
    [requestReset]
  );

  return (
    <AuthLayout
      title="パスワードをリセット"
      description="リセットリンクを受け取るメールアドレスを入力してください。"
    >
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        successMessage={successMessage}
      />
    </AuthLayout>
  );
}
