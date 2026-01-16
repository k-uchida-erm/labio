'use client';

import * as React from 'react';
import { ActivityType } from '@/features/activity/types';
import TypePicker from '../TypePicker';
import ModalDueDatePicker from '@/features/project/components/ModalDueDatePicker';
import AssigneePicker from '../AssigneePicker';
import { activityTypeToDisplay } from '@/features/activity/types';

type SubActivityFormData = {
  title: string;
  type: ActivityType;
  dueDate: Date | null;
  assigneeIds: string[];
  description: string;
};

type SubActivityCreationFormProps = {
  formData: SubActivityFormData;
  onFormDataChange: React.Dispatch<React.SetStateAction<SubActivityFormData>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onCreate: () => Promise<void>;
  onCancel: () => void;
  assignees?: { id: string; name: string; avatarUrl?: string | null }[];
};

export function SubActivityCreationForm({
  formData,
  onFormDataChange,
  inputRef,
  textareaRef,
  onKeyDown,
  onCreate,
  onCancel,
  assignees,
}: SubActivityCreationFormProps) {
  return (
    <div className="mb-1 ml-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2">
        {/* Title and Description */}
        <div className="flex flex-col gap-0">
          <div className="mb-1.5 flex items-center gap-2">
            {/* Type Picker */}
            <div className="shrink-0">
              <TypePicker
                value={formData.type}
                onChange={(type) => onFormDataChange((prev) => ({ ...prev, type }))}
              />
            </div>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={formData.title}
            onChange={(e) => onFormDataChange((prev) => ({ ...prev, title: e.target.value }))}
            onKeyDown={onKeyDown}
            placeholder={`${activityTypeToDisplay[formData.type] ?? 'Activity'} title`}
            className="h-8 w-full bg-transparent px-1 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            maxLength={200}
            autoFocus
          />
          <textarea
            ref={textareaRef}
            value={formData.description}
            onChange={(e) =>
              onFormDataChange((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            onKeyDown={onKeyDown}
            placeholder="Add description..."
            className="min-h-[1.5rem] resize-none overflow-hidden bg-transparent px-1 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            rows={1}
            maxLength={10000}
          />
        </div>

        {/* Due Date, Assignee, and Actions */}
        <div className="flex items-center gap-3 [&_button]:h-7 [&_button]:px-2 [&_button]:text-[11px] [&_div[class*='avatar']]:h-4 [&_div[class*='avatar']]:w-4 [&_div[class*='avatar']]:text-[10px] [&_span]:text-[11px] [&_svg]:h-3 [&_svg]:w-3">
          <ModalDueDatePicker
            value={formData.dueDate}
            onChange={(date) => onFormDataChange((prev) => ({ ...prev, dueDate: date }))}
          />
          {assignees && (
            <AssigneePicker
              selectedIds={formData.assigneeIds}
              options={assignees}
              onChange={(ids) => onFormDataChange((prev) => ({ ...prev, assigneeIds: ids }))}
            />
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-7 rounded-md px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCreate}
              disabled={!formData.title.trim()}
              className="h-7 rounded-md bg-[#5769f6] px-2.5 text-xs font-medium text-white hover:bg-[#4558e5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
