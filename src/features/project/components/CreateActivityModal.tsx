import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Switch } from '@/components/ui/switch';
import AssigneePicker from '@/components/activity/AssigneePicker';
import ModalDueDatePicker from '@/features/project/components/ModalDueDatePicker';
import TypePicker from '@/components/activity/TypePicker';
import { activityTypeToDisplay, type ActivityType } from '@/features/activity/types';
import type {
  CreateActivityFormValues,
  CreateActivityFormErrors,
} from '@/features/project/hooks/useCreateActivityForm';
import { ActivityBreadcrumbs } from '@/components/activity/ActivityBreadcrumbs';
import type { Breadcrumb } from '@/components/activity/activity-detail/types';

function useModalVisibility(open: boolean) {
  const [render, setRender] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    let openFrame: number | null = null;
    let visibilityFrame: number | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;

    if (open) {
      openFrame = requestAnimationFrame(() => {
        setRender(true);
        visibilityFrame = requestAnimationFrame(() => setVisible(true));
      });
    } else {
      visibilityFrame = requestAnimationFrame(() => setVisible(false));
      hideTimer = setTimeout(() => setRender(false), 300);
    }

    return () => {
      if (openFrame !== null) cancelAnimationFrame(openFrame);
      if (visibilityFrame !== null) cancelAnimationFrame(visibilityFrame);
      if (hideTimer !== null) clearTimeout(hideTimer);
    };
  }, [open]);

  return { render, visible };
}

type ModalFieldsProps = {
  values: CreateActivityFormValues;
  errors: CreateActivityFormErrors;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  titlePlaceholder: string;
};

const ModalFields = React.memo(function ModalFields({
  values,
  errors,
  onTitleChange,
  onDescriptionChange,
  inputRef,
  titlePlaceholder,
}: ModalFieldsProps) {
  return (
    <div className="flex flex-col gap-1">
      <div>
        <input
          ref={inputRef}
          className={`h-10 w-full rounded-md bg-transparent px-1 text-lg font-semibold text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0 focus:outline-none ${
            errors.title ? 'ring-1 ring-red-400' : ''
          }`}
          placeholder={titlePlaceholder}
          value={values.title}
          onChange={(e) => onTitleChange(e.target.value)}
          maxLength={200}
        />
        {errors.title && <p className="mt-2 text-xs text-red-500">{errors.title}</p>}
      </div>
      <textarea
        className={`min-h-[72px] rounded-md bg-transparent px-1 py-1.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 focus:outline-none ${
          errors.description ? 'ring-1 ring-red-400' : ''
        }`}
        placeholder="Add description..."
        value={values.description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        maxLength={10000}
      />
      {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
    </div>
  );
});

type ModalPickersProps = {
  values: CreateActivityFormValues;
  dueActive: boolean;
  assigneeActive: boolean;
  assignees: { id: string; name: string; avatarUrl?: string | null }[];
  onDueDateChange: (value: Date | null) => void;
  onAssigneeChange: (ids: string[]) => void;
  className?: string;
};

const ModalPickers = React.memo(function ModalPickers({
  values,
  dueActive,
  assigneeActive,
  assignees,
  onDueDateChange,
  onAssigneeChange,
  className,
}: ModalPickersProps) {
  return (
    <div className={`flex flex-row gap-3 ${className ?? ''}`}>
      <ModalDueDatePicker
        value={values.dueDate}
        active={dueActive}
        onChange={onDueDateChange}
        className="shrink-0"
      />

      <AssigneePicker
        options={assignees}
        selectedIds={values.assigneeIds ?? []}
        onChange={onAssigneeChange}
        active={assigneeActive}
        placeholder="Search assignee"
        triggerClassName="shrink-0"
      />
    </div>
  );
});

type ModalActionsProps = {
  createMore: boolean;
  onToggleCreateMore: (value: boolean) => void;
  createPending: boolean;
  onSubmit: () => void;
};

const ModalActions = React.memo(function ModalActions({
  createMore,
  onToggleCreateMore,
  createPending,
  onSubmit,
}: ModalActionsProps) {
  return (
    <div className="flex items-center justify-end gap-4 pt-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Switch checked={createMore} onCheckedChange={onToggleCreateMore} />
        <span>Keep open</span>
      </div>
      <button
        type="button"
        className="h-9 rounded-md bg-[var(--primary)] px-5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        onClick={onSubmit}
        disabled={createPending}
      >
        {createPending ? 'Saving...' : 'Create'}
      </button>
    </div>
  );
});

type CreateActivityModalProps = {
  open: boolean;
  breadcrumbs: Breadcrumb[];
  formValues: CreateActivityFormValues;
  formErrors: CreateActivityFormErrors;
  onClose: () => void;
  onSubmit: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTypeChange: (value: ActivityType) => void;
  onDueDateChange: (value: Date | null) => void;
  onAssigneeChange: (ids: string[]) => void;
  createMore: boolean;
  onToggleCreateMore: (val: boolean) => void;
  createPending: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  assignees?: { id: string; name: string; avatarUrl?: string | null }[];
  labSlug: string;
  projectKey: string;
  container?: HTMLElement | null;
};

export function CreateActivityModal({
  open,
  breadcrumbs,
  formValues,
  formErrors,
  onClose,
  onSubmit,
  onTitleChange,
  onDescriptionChange,
  onTypeChange,
  onDueDateChange,
  onAssigneeChange,
  createMore,
  onToggleCreateMore,
  createPending,
  inputRef,
  assignees = [],
  labSlug,
  projectKey,
  container,
}: CreateActivityModalProps) {
  const { render, visible } = useModalVisibility(open);
  const [mounted] = useState(() => typeof window !== 'undefined');

  const dueActive = !!formValues.dueDate;
  const assigneeActive = (formValues.assigneeIds ?? []).length > 0;
  const typeLabel = activityTypeToDisplay[formValues.type] ?? 'Activity';
  const titlePlaceholder = `${typeLabel} title`;

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open, inputRef]);

  if (!render) return null;

  const overlayClass = container
    ? 'absolute inset-0 z-60 flex items-center justify-center p-4'
    : 'fixed inset-0 z-60 flex items-center justify-center p-4';

  const panel = (
    <div className={overlayClass}>
      <div
        className={`w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
        }`}
      >
        <ActivityBreadcrumbs
          breadcrumbs={breadcrumbs}
          labSlug={labSlug}
          projectKey={projectKey}
          onClose={onClose}
        />
        <div className="mt-4 flex flex-col gap-6">
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              <TypePicker value={formValues.type} onChange={onTypeChange} />
              <ModalFields
                values={formValues}
                errors={formErrors}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                inputRef={inputRef}
                titlePlaceholder={titlePlaceholder}
              />
            </div>
          </div>
          <div>
            <ModalPickers
              values={formValues}
              dueActive={dueActive}
              assigneeActive={assigneeActive}
              assignees={assignees}
              onDueDateChange={onDueDateChange}
              onAssigneeChange={onAssigneeChange}
            />
          </div>
        </div>

        <ModalActions
          createMore={createMore}
          onToggleCreateMore={onToggleCreateMore}
          createPending={createPending}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );

  const overlayTarget = mounted ? document.body : null;
  const overlayNode =
    overlayTarget && render
      ? createPortal(
          <div
            className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ease-out ${
              visible ? 'opacity-100' : 'opacity-0'
            }`}
          />,
          overlayTarget
        )
      : null;

  if (container) {
    return (
      <>
        {overlayNode}
        {createPortal(panel, container)}
      </>
    );
  }

  return (
    <>
      {overlayNode}
      {panel}
    </>
  );
}

export default CreateActivityModal;
