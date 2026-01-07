'use client';

import { useCallback } from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { useLogin } from '@/features/auth/hooks/useLogin';

export default function LoginPage() {
  const { login, loading, error } = useLogin();

  const handleSubmit = useCallback(
    async (values: { email: string; password: string }) => {
      await login(values);
    },
    [login]
  );

  return (
    <AuthLayout
      title="Labio にサインイン"
      description="ラボ横断のアクティビティ管理へアクセスするには、登録済みのメールアドレスとパスワードでログインしてください。"
    >
      <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
    </AuthLayout>
  );
}
