import { useCallback, useState } from 'react';
import type { Tables } from '@/types/database.types';
import type { ActivityStatus as DbActivityStatus, ActivityType } from '@/features/activity/types';
import {
  useCreateActivityForm,
  CreateActivityFormValues,
  CreateActivityFormErrors,
} from '@/features/project/hooks/useCreateActivityForm';

type UseCreateActivityStateArgs = {
  labId?: string;
  project?: Tables<'projects'> | null;
  currentUserId?: string | null;
  assigneeDefaultId: string | null;
  createActivity: (data: {
    lab_id: string;
    project_id: string;
    title: string;
    created_by: string;
    parent_id?: string;
    type?: Tables<'activities'>['type'];
    due_date?: string;
    status?: DbActivityStatus;
    description?: string;
    assignee_id?: string | null;
  }) => Promise<unknown>;
  refetch: () => Promise<unknown>;
  onExpandParent?: (id: string) => void;
};

export type CreateActivityController = {
  open: boolean;
  formValues: CreateActivityFormValues;
  formErrors: CreateActivityFormErrors;
  createPending: boolean;
  createMore: boolean;
  openModal: (parentId: string | null) => void;
  closeModal: () => void;
  setCreateMore: (value: boolean) => void;
  handleTitleChange: (value: string) => void;
  handleDescriptionChange: (value: string) => void;
  handleTypeChange: (value: ActivityType) => void;
  handleDueDateChange: (value: Date | null) => void;
  handleAssigneeChange: (ids: string[]) => void;
  submit: () => Promise<void>;
};

export function useCreateActivityState({
  labId,
  project,
  currentUserId,
  assigneeDefaultId,
  createActivity,
  refetch,
  onExpandParent,
}: UseCreateActivityStateArgs): CreateActivityController {
  const form = useCreateActivityForm(assigneeDefaultId);
  const [open, setOpen] = useState(false);
  const [createPending, setCreatePending] = useState(false);
  const [createMore, setCreateMore] = useState(false);

  const openModal = useCallback(
    (parentId: string | null = null) => {
      form.reset({ parentId });
      setOpen(true);
      setCreateMore(false);
    },
    [form]
  );

  const closeModal = useCallback(() => {
    setOpen(false);
    form.reset();
  }, [form]);

  const handleTitleChange = useCallback((value: string) => form.setField('title', value), [form]);
  const handleDescriptionChange = useCallback(
    (value: string) => form.setField('description', value),
    [form]
  );
  const handleTypeChange = useCallback(
    (value: ActivityType) => form.setField('type', value),
    [form]
  );
  const handleDueDateChange = useCallback(
    (value: Date | null) => form.setField('dueDate', value),
    [form]
  );
  const handleAssigneeChange = useCallback(
    (ids: string[]) => form.setField('assigneeIds', ids),
    [form]
  );

  const submit = useCallback(async () => {
    if (!open || !labId || !project || !currentUserId) return;
    if (createPending) return;
    const { isValid, trimmedTitle } = form.validate();
    if (!isValid) return;

    try {
      setCreatePending(true);
      await createActivity({
        lab_id: labId,
        project_id: project.id,
        title: trimmedTitle,
        created_by: currentUserId,
        parent_id: form.values.parentId ?? undefined,
        type: form.values.type,
        due_date: form.values.dueDate ? form.values.dueDate.toISOString() : undefined,
        status: form.values.status,
        description: form.values.description || undefined,
        assignee_id: form.values.assigneeIds[0] ?? null,
      });
      await refetch();
      if (form.values.parentId && onExpandParent) onExpandParent(form.values.parentId);

      if (createMore) {
        form.reset({ parentId: form.values.parentId });
      } else {
        closeModal();
      }
    } catch (err) {
      console.error('Failed to create activity:', err);
    } finally {
      setCreatePending(false);
    }
  }, [
    closeModal,
    createActivity,
    createMore,
    createPending,
    currentUserId,
    form,
    labId,
    onExpandParent,
    project,
    refetch,
    open,
  ]);

  return {
    open,
    formValues: form.values,
    formErrors: form.errors,
    createPending,
    createMore,
    openModal,
    closeModal,
    setCreateMore,
    handleTitleChange,
    handleDescriptionChange,
    handleTypeChange,
    handleDueDateChange,
    handleAssigneeChange,
    submit,
  };
}

export default useCreateActivityState;
