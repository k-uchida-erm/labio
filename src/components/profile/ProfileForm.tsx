'use client';

import { useState, useCallback } from 'react';
import { PencilSimple } from 'phosphor-react';
import { Button } from '@/components/ui/button';
import { AvatarInitial } from '@/components/ui/avatar';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database.types';

type Profile = Tables<'profiles'>;

type ProfileFormProps = {
  profile: Profile;
  onUpdate?: () => void;
};

type FieldState = {
  value: string;
  isEditing: boolean;
};

export function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const [email, setEmail] = useState<FieldState>({
    value: profile.email || '',
    isEditing: false,
  });
  const [username, setUsername] = useState<FieldState>({
    value: profile.display_name || profile.email?.split('@')[0] || '',
    isEditing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = useCallback(
    async (field: 'email' | 'username') => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const supabase = createClient();

        // 認証チェック
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          setError('Not authenticated. Please log in again.');
          return;
        }

        if (field === 'email') {
          // Email形式のバリデーション
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email.value)) {
            setError('Invalid email format');
            return;
          }

          // Supabase Authのemailを更新
          const { error: emailUpdateError } = await supabase.auth.updateUser({
            email: email.value,
          });

          if (emailUpdateError) {
            setError(emailUpdateError.message);
            return;
          }

          // profilesテーブルのemailも更新
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ email: email.value })
            .eq('id', authUser.id);

          if (profileError) {
            setError(profileError.message);
            return;
          }
        } else if (field === 'username') {
          // Usernameのバリデーション
          if (username.value && username.value.length > 50) {
            setError('Username must be 50 characters or less');
            return;
          }

          // Usernameはdisplay_nameとして保存
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ display_name: username.value || null })
            .eq('id', authUser.id);

          if (profileError) {
            setError(profileError.message);
            return;
          }
        }

        setSuccess(true);
        onUpdate?.();

        // 編集モードを終了
        if (field === 'email') {
          setEmail((prev) => ({ ...prev, isEditing: false }));
        } else if (field === 'username') {
          setUsername((prev) => ({ ...prev, isEditing: false }));
        }

        // 成功メッセージを3秒後に消す
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error('Error updating profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to update profile');
      } finally {
        setLoading(false);
      }
    },
    [email.value, username.value, onUpdate]
  );

  const handleCancel = useCallback((field: 'email' | 'username') => {
    if (field === 'email') {
      setEmail({ value: profile.email || '', isEditing: false });
    } else if (field === 'username') {
      setUsername({
        value: profile.display_name || profile.email?.split('@')[0] || '',
        isEditing: false,
      });
    }
  }, [profile]);

  const renderField = (
    label: string,
    field: FieldState,
    setField: React.Dispatch<React.SetStateAction<FieldState>>,
    fieldKey: 'email' | 'username',
    placeholder?: string,
    description?: string
  ) => {
    return (
      <div className="flex items-center justify-between border-b border-slate-200 py-4 first:pt-0 last:border-b-0 last:pb-0">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-900">{label}</label>
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-3">
          {field.isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type={fieldKey === 'email' ? 'email' : 'text'}
                value={field.value}
                onChange={(e) => setField({ ...field, value: e.target.value })}
                maxLength={fieldKey === 'username' ? 50 : undefined}
                placeholder={placeholder}
                className="h-9 min-w-[200px] rounded-md border border-slate-300 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                autoFocus
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleSave(fieldKey)}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCancel(fieldKey)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-900">{field.value || '—'}</span>
              <button
                type="button"
                onClick={() => setField({ ...field, isEditing: true })}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label={`Edit ${label}`}
              >
                <PencilSimple size={14} weight="regular" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Profile picture */}
      <div className="flex items-center justify-between border-b border-slate-200 py-4 first:pt-0">
        <label className="text-sm font-medium text-slate-900">Profile picture</label>
        <div className="flex items-center gap-3">
          <AvatarInitial
            label={profile.display_name || profile.email}
            avatarUrl={profile.avatar_url}
            size="md"
            className="h-12 w-12"
          />
        </div>
      </div>

      {/* Email */}
      {renderField('Email', email, setEmail, 'email', 'Enter email address')}

      {/* Username */}
      {renderField(
        'Username',
        username,
        setUsername,
        'username',
        'Enter username',
        'Nickname or first name, however you want to be called in Labio'
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Success message */}
      {success && (
        <div className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
          Profile updated successfully
        </div>
      )}
    </div>
  );
}
