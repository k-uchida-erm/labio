'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'phosphor-react';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, loading, error } = useCurrentUser();
  const router = useRouter();
  const [backUrl, setBackUrl] = useState<string>('/');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // 最後にアクセスしたProjectページのURLを取得
    if (typeof window !== 'undefined') {
      const lastProjectUrl = localStorage.getItem('lastProjectUrl');
      if (lastProjectUrl) {
        setBackUrl(lastProjectUrl);
      }
    }
  }, [user, loading, router]);

  const handleBack = () => {
    router.push(backUrl);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-slate-600">読み込み中...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-red-600">
          {error?.message || 'プロフィールの読み込みに失敗しました'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex flex-1 overflow-y-auto">
        <main className="flex w-full flex-col items-center px-4 py-8">
          <div className="w-full max-w-2xl">
            {/* Back button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-slate-600 hover:text-slate-900"
                onClick={handleBack}
              >
                <ArrowLeft size={16} weight="regular" />
                <span>Back to app</span>
              </Button>
            </div>
            <h1 className="mb-8 text-2xl font-semibold text-slate-900">Profile</h1>
            <div className="rounded-lg border border-slate-300 bg-white p-6">
              <ProfileForm profile={user} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
