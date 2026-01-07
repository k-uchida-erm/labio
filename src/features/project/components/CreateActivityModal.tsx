import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'phosphor-react';
import { Switch } from '@/components/ui/switch';
import AssigneePicker from '@/components/activity/AssigneePicker';
import ModalDueDatePicker from '@/features/project/components/ModalDueDatePicker';
import TypePicker from '@/components/activity/TypePicker';
import { activityTypeToDisplay, type ActivityType } from '@/features/activity/types';
import type {
  CreateActivityFormValues,
  CreateActivityFormErrors,
} from '@/features/project/hooks/useCreateActivityForm';

type Breadcrumb = { label: string; title?: string };

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

type ModalHeaderProps = {
  breadcrumbs: Breadcrumb[];
  onClose: () => void;
};

const ModalHeader = React.memo(function ModalHeader({ breadcrumbs, onClose }: ModalHeaderProps) {
  const breadcrumbRef = useRef<HTMLDivElement>(null);
  const [hoveredCrumb, setHoveredCrumb] = useState<{
    idx: number;
    x: number;
    title?: string;
  } | null>(null);

  const handleCrumbHover = useCallback((idx: number, target: HTMLButtonElement, title?: string) => {
    const containerRect = breadcrumbRef.current?.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const center = containerRect ? targetRect.left - containerRect.left + targetRect.width / 2 : 0;
    setHoveredCrumb({ idx, x: center, title });
  }, []);

  return (
    <div className="relative mb-4 flex items-center justify-between">
      <div
        ref={breadcrumbRef}
        className="relative flex items-center gap-1.5 text-sm font-semibold text-slate-900"
      >
        {breadcrumbs.map((crumb, idx) => {
          const isCurrent = idx === breadcrumbs.length - 1;
          const badgeClasses = isCurrent
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-slate-100 text-slate-700';
          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              <button
                type="button"
                className={`flex h-6 items-center rounded-full px-2.5 text-[12px] font-medium hover:brightness-95 ${badgeClasses}`}
                onMouseEnter={(e) => handleCrumbHover(idx, e.currentTarget, crumb.title)}
                onMouseLeave={() => setHoveredCrumb(null)}
                title={crumb.title}
              >
                {crumb.label}
              </button>
              {idx < breadcrumbs.length - 1 && (
                <span className="text-[12px] text-slate-400">›</span>
              )}
            </React.Fragment>
          );
        })}
        {hoveredCrumb && hoveredCrumb.title && (
          <div
            className="absolute z-10 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-normal text-slate-600 shadow-md"
            style={{ left: hoveredCrumb.x, top: 'calc(100% + 6px)' }}
          >
            {hoveredCrumb.title}
          </div>
        )}
      </div>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={16} weight="light" />
      </button>
    </div>
  );
});

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
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <ModalDueDatePicker
        value={values.dueDate}
        active={dueActive}
        onChange={onDueDateChange}
        className="w-full justify-between"
      />

      <AssigneePicker
        options={assignees}
        selectedIds={values.assigneeIds ?? []}
        onChange={onAssigneeChange}
        active={assigneeActive}
        placeholder="Search assignee"
        triggerClassName="w-full justify-start"
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
}: CreateActivityModalProps) {
  const { render, visible } = useModalVisibility(open);

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

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black/30 p-4 transition-opacity duration-300 ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-300 ease-out ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
        }`}
      >
        <ModalHeader breadcrumbs={breadcrumbs} onClose={onClose} />
        <div className="mt-4 flex flex-col gap-6 md:flex-row">
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
          <div className="md:w-48 md:border-l md:border-slate-200 md:pl-6">
            <ModalPickers
              values={formValues}
              dueActive={dueActive}
              assigneeActive={assigneeActive}
              assignees={assignees}
              onDueDateChange={onDueDateChange}
              onAssigneeChange={onAssigneeChange}
              className="md:items-start"
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
}

export default CreateActivityModal;
