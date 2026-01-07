'use client';

import * as React from 'react';

export type CommandProps = React.HTMLAttributes<HTMLDivElement>;

export function Command({ className, ...props }: CommandProps) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white text-sm shadow-md ${className ?? ''}`}
      {...props}
    />
  );
}

type CommandInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  leading?: React.ReactNode;
};

export function CommandInput({ leading, children, className, ...inputProps }: CommandInputProps) {
  const prefix = leading ?? children;
  return (
    <div
      className={`flex h-10 items-center gap-2 border-b border-slate-100 px-3 ${className ?? ''}`}
    >
      {prefix}
      <input
        {...inputProps}
        className="ui-text-xs ui-text-strong h-full flex-1 border-none bg-transparent outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export function CommandList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`flex flex-col gap-1 py-2 ${className ?? ''}`} {...props} />;
}

export function CommandGroup({
  heading,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { heading?: React.ReactNode }) {
  return (
    <div className={`px-2 ${className ?? ''}`} {...props}>
      {heading && (
        <div className="ui-text-xs ui-text-muted flex h-8 items-center px-2 font-normal">
          {heading}
        </div>
      )}
      <div className="flex flex-col gap-1">{props.children}</div>
    </div>
  );
}

export function CommandItem(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`ui-text-xs ui-text-strong flex h-8 w-full items-center justify-between rounded-md px-2 hover:bg-slate-100 ${props.className ?? ''}`}
    />
  );
}

export function CommandSeparator({ className }: { className?: string }) {
  return <div className={`h-px bg-slate-100 ${className ?? ''}`} />;
}
