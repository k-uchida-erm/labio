'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { X, Cube, Flask, Question, ClipboardText, UsersThree, Note } from 'phosphor-react';
import { ActivityType } from '@/features/activity/types';

type Breadcrumb = { label: string; title?: string; sequenceNumber?: number; type?: ActivityType };

const typeIcons: Record<
  ActivityType,
  React.ComponentType<{ size?: number; weight?: string; className?: string }>
> = {
  task: Cube,
  experiment: Flask,
  question: Question,
  review: ClipboardText,
  meeting: UsersThree,
  note: Note,
};

const typeColors: Record<ActivityType, { badge: string; icon: string }> = {
  task: { badge: 'bg-indigo-100 text-indigo-700', icon: 'text-indigo-600' },
  experiment: { badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600' },
  question: { badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  review: { badge: 'bg-blue-100 text-blue-700', icon: 'text-blue-600' },
  meeting: { badge: 'bg-sky-100 text-sky-700', icon: 'text-sky-600' },
  note: { badge: 'bg-pink-100 text-pink-700', icon: 'text-pink-600' },
};

type ActivityBreadcrumbsProps = {
  breadcrumbs: Breadcrumb[];
  labSlug: string;
  projectKey: string;
  onClose?: () => void;
};

export function ActivityBreadcrumbs({
  breadcrumbs,
  labSlug,
  projectKey,
  onClose,
}: ActivityBreadcrumbsProps) {
  const router = useRouter();
  const breadcrumbRef = React.useRef<HTMLDivElement>(null);
  const [hoveredCrumb, setHoveredCrumb] = React.useState<{
    idx: number;
    x: number;
    title?: string;
  } | null>(null);

  const handleCrumbHover = React.useCallback(
    (idx: number, target: HTMLButtonElement, title?: string) => {
      if (!title) {
        setHoveredCrumb(null);
        return;
      }
      const containerRect = breadcrumbRef.current?.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const center = containerRect
        ? targetRect.left - containerRect.left + targetRect.width / 2
        : 0;
      setHoveredCrumb({ idx, x: center, title });
    },
    []
  );

  const handleCrumbClick = React.useCallback(
    (crumb: Breadcrumb) => {
      if (crumb.sequenceNumber) {
        router.push(`/${labSlug}/${projectKey}?activity=${crumb.sequenceNumber}`);
      } else {
        // Projectの場合
        router.push(`/${labSlug}/${projectKey}`);
      }
    },
    [labSlug, projectKey, router]
  );

  return (
    <div className="relative mb-1 flex flex-wrap items-center justify-between gap-2">
      <div
        ref={breadcrumbRef}
        className="relative flex min-w-0 flex-1 flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-900"
      >
        {breadcrumbs.map((crumb, idx) => {
          const isCurrent = idx === breadcrumbs.length - 1;
          const showTitle = crumb.sequenceNumber ? (crumb.title ?? crumb.label) : crumb.title;
          const badgeClasses = crumb.type
            ? typeColors[crumb.type].badge
            : isCurrent
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-slate-100 text-slate-700';
          const IconComponent = crumb.type ? typeIcons[crumb.type] : null;

          return (
            <React.Fragment key={`${crumb.label}-${idx}`}>
              <button
                type="button"
                className={`flex min-h-[1.5rem] flex-none items-center gap-1.5 rounded-full px-2.5 text-left text-[12px] font-medium hover:brightness-95 ${badgeClasses}`}
                onMouseEnter={(e) => handleCrumbHover(idx, e.currentTarget, showTitle)}
                onMouseLeave={() => setHoveredCrumb(null)}
                onClick={() => handleCrumbClick(crumb)}
                title={showTitle}
              >
                {IconComponent && crumb.type && (
                  <IconComponent
                    size={12}
                    weight="light"
                    className={`shrink-0 ${typeColors[crumb.type].icon}`}
                  />
                )}
                <span className="truncate">{crumb.label}</span>
              </button>
              {idx < breadcrumbs.length - 1 && (
                <span className="text-[12px] text-slate-400">›</span>
              )}
            </React.Fragment>
          );
        })}
        {hoveredCrumb && hoveredCrumb.title && (
          <div
            className="absolute z-10 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-3 py-2 text-[12px] font-normal whitespace-nowrap text-slate-600 shadow-md"
            style={{ left: hoveredCrumb.x, top: 'calc(100% + 6px)' }}
          >
            {hoveredCrumb.title}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close"
        >
          <X size={20} weight="light" />
        </button>
      )}
    </div>
  );
}
