import { useCallback, useMemo, useState } from 'react';
import type { ActivityStatus as DbActivityStatus, ActivityType } from '@/features/activity/types';

export type CreateActivityFormValues = {
  parentId: string | null;
  title: string;
  dueDate: Date | null;
  type: ActivityType;
  status: DbActivityStatus;
  description: string;
  assigneeIds: string[];
};

export type CreateActivityFormErrors = Partial<{
  title: string;
  description: string;
}>;

export function useCreateActivityForm(defaultAssigneeId: string | null) {
  const initialAssignees = useMemo(
    () => (defaultAssigneeId ? [defaultAssigneeId] : []),
    [defaultAssigneeId]
  );

  const buildDefaultValues = useCallback((): CreateActivityFormValues => {
    return {
      parentId: null,
      title: '',
      dueDate: null,
      type: 'task',
      status: 'todo',
      description: '',
      assigneeIds: initialAssignees,
    };
  }, [initialAssignees]);

  const [values, setValues] = useState<CreateActivityFormValues>(buildDefaultValues);
  const [errors, setErrors] = useState<CreateActivityFormErrors>({});

  const setField = useCallback(
    <K extends keyof CreateActivityFormValues>(field: K, value: CreateActivityFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const reset = useCallback(
    (overrides?: Partial<CreateActivityFormValues>) => {
      setValues({ ...buildDefaultValues(), ...overrides });
      setErrors({});
    },
    [buildDefaultValues]
  );

  const validate = useCallback(() => {
    const nextErrors: CreateActivityFormErrors = {};
    const trimmedTitle = values.title.trim();

    if (!trimmedTitle) {
      nextErrors.title = 'タイトルは必須です（1文字以上200文字以内）。';
    } else if (trimmedTitle.length > 200) {
      nextErrors.title = 'タイトルは200文字以内で入力してください。';
    }

    if (values.description && values.description.length > 10000) {
      nextErrors.description = '説明は10000文字以内で入力してください。';
    }

    setErrors(nextErrors);
    return { isValid: Object.keys(nextErrors).length === 0, trimmedTitle };
  }, [values.description, values.title]);

  return {
    values,
    errors,
    setField,
    reset,
    validate,
  };
}
