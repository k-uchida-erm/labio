'use client';

import React from 'react';

type AuthLayoutProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-b from-slate-200 via-white to-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-semibold text-white">
            L
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
        </div>
        {children}
        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Labio
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
