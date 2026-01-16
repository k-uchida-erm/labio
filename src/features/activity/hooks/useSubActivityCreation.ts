'use client';

import * as React from 'react';
import { ActivityType } from '../types';

type SubActivityFormData = {
  title: string;
  type: ActivityType;
  dueDate: Date | null;
  assigneeIds: string[];
  description: string;
};

type UseSubActivityCreationProps = {
  activityId: string;
  onCreateSubActivity?: (data: {
    parentId: string;
    title: string;
    type?: ActivityType;
    dueDate?: Date | null;
    assigneeId?: string | null;
    description?: string;
  }) => Promise<void>;
};

export function useSubActivityCreation({
  activityId,
  onCreateSubActivity,
}: UseSubActivityCreationProps) {
  const [isCreatingSubActivity, setIsCreatingSubActivity] = React.useState(false);
  const [creatingParentId, setCreatingParentId] = React.useState<string | null>(null);
  const [newSubActivityForm, setNewSubActivityForm] = React.useState<SubActivityFormData>({
    title: '',
    type: 'task',
    dueDate: null,
    assigneeIds: [],
    description: '',
  });
  const newSubActivityInputRef = React.useRef<HTMLInputElement>(null);
  const newSubActivityTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // textareaの高さを自動調整
  React.useEffect(() => {
    const textarea = newSubActivityTextareaRef.current;
    if (!textarea) return;

    // 高さをリセットしてからスクロール高さを取得
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`;
  }, [newSubActivityForm.description]);

  const handleAddSubActivity = React.useCallback(
    (parentId?: string) => {
      if (!onCreateSubActivity) {
        return;
      }
      const targetParentId = parentId ?? activityId;
      setCreatingParentId(targetParentId);
      setIsCreatingSubActivity(true);
      setNewSubActivityForm({
        title: '',
        type: 'task',
        dueDate: null,
        assigneeIds: [],
        description: '',
      });
      // 次のフレームでフォーカスとtextareaの高さリセット
      requestAnimationFrame(() => {
        newSubActivityInputRef.current?.focus();
        if (newSubActivityTextareaRef.current) {
          newSubActivityTextareaRef.current.style.height = 'auto';
        }
      });
    },
    [activityId, onCreateSubActivity]
  );

  const handleCreateSubActivity = React.useCallback(async () => {
    if (!newSubActivityForm.title.trim() || !onCreateSubActivity) {
      setIsCreatingSubActivity(false);
      setNewSubActivityForm({
        title: '',
        type: 'task',
        dueDate: null,
        assigneeIds: [],
        description: '',
      });
      return;
    }

    try {
      const targetParentId = creatingParentId ?? activityId;
      await onCreateSubActivity({
        parentId: targetParentId,
        title: newSubActivityForm.title.trim(),
        type: newSubActivityForm.type,
        dueDate: newSubActivityForm.dueDate,
        assigneeId: newSubActivityForm.assigneeIds[0] || null,
        description: newSubActivityForm.description || undefined,
      });
      setIsCreatingSubActivity(false);
      setCreatingParentId(null);
      setNewSubActivityForm({
        title: '',
        type: 'task',
        dueDate: null,
        assigneeIds: [],
        description: '',
      });
    } catch (err) {
      // エラーが発生した場合は入力状態を維持
      console.error('Failed to create sub activity:', err);
    }
  }, [activityId, creatingParentId, newSubActivityForm, onCreateSubActivity]);

  const handleCancelCreateSubActivity = React.useCallback(() => {
    setIsCreatingSubActivity(false);
    setCreatingParentId(null);
    setNewSubActivityForm({
      title: '',
      type: 'task',
      dueDate: null,
      assigneeIds: [],
      description: '',
    });
  }, []);

  const handleNewSubActivityKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleCreateSubActivity();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelCreateSubActivity();
      }
    },
    [handleCreateSubActivity, handleCancelCreateSubActivity]
  );

  return {
    isCreatingSubActivity,
    creatingParentId,
    newSubActivityForm,
    setNewSubActivityForm,
    newSubActivityInputRef,
    newSubActivityTextareaRef,
    handleAddSubActivity,
    handleCreateSubActivity,
    handleCancelCreateSubActivity,
    handleNewSubActivityKeyDown,
  };
}
