'use client';

import { useCallback } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { SignupForm } from '@/components/auth/SignupForm';
import { useSignup } from '@/features/auth/hooks/useSignup';

export default function SignupPage() {
  const { signup, loading, error, successMessage } = useSignup();

  const handleSubmit = useCallback(
    async (values: { email: string; password: string; displayName?: string }) => {
      await signup(values);
    },
    [signup]
  );

  return (
    <AuthLayout
      title="アカウントを作成"
      description="メールアドレスとパスワードを登録して、Labio ワークスペースを使い始めましょう。"
    >
      <SignupForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        successMessage={successMessage}
      />
    </AuthLayout>
  );
}
