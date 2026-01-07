'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export type LoginFormProps = {
  onSubmit: (values: { email: string; password: string }) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
};

export function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={emailId} className="text-xs font-medium text-slate-600">
          メールアドレス
        </label>
        <input
          id={emailId}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-inner ring-0 shadow-slate-100 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={passwordId} className="text-xs font-medium text-slate-600">
          パスワード
        </label>
        <input
          id={passwordId}
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-inner ring-0 shadow-slate-100 transition outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="h-10 w-full rounded-lg font-medium">
        {loading ? 'ログイン中...' : 'ログイン'}
      </Button>

      <p className="text-[11px] leading-relaxed text-slate-500">
        開発環境用のログインです。Supabase
        のユーザー管理画面で発行したアカウント情報を入力して実際の プロジェクト画面に遷移できます。
      </p>
    </form>
  );
}
