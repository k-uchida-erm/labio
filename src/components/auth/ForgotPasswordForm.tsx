'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';

export type ForgotPasswordFormProps = {
  onSubmit: (values: { email: string }) => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
  successMessage?: string | null;
};

export function ForgotPasswordForm({
  onSubmit,
  loading,
  error,
  successMessage,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const emailId = useId();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({ email });
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {successMessage}
        </div>
      )}

      <Button type="submit" disabled={loading} className="h-10 w-full rounded-lg font-medium">
        {loading ? '送信中...' : 'リセットメールを送信'}
      </Button>

      <p className="text-[11px] leading-relaxed text-slate-500">
        パスワードリセットリンクをメールでお送りします。受信トレイや迷惑メールフォルダをご確認ください。
      </p>
    </form>
  );
}
