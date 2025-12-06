'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ChevronDown, PanelLeft, Box, Inbox, Menu, UserCircle } from 'lucide-react';

export type Project = {
  id: string;
  name: string;
  slug: string;
};

export type Member = {
  id: string;
  name: string;
};

export type SidebarProps = {
  labName: string;
  labSlug: string;
  myProjects: Project[];
  allProjects: Project[];
  members: Member[];
  onToggle?: () => void;
};

export function Sidebar({
  labName,
  labSlug,
  myProjects,
  allProjects,
  members,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col gap-1 overflow-hidden border-r border-slate-200 bg-slate-50 px-3 py-2">
      {/* Header */}
      <div className="flex h-10 items-center justify-between overflow-hidden py-2 pr-4 pl-2">
        <div className="flex items-center gap-2">
          <User size={20} className="text-slate-700" />
          <span className="text-sm font-normal text-black">{labName}</span>
          <ChevronDown size={16} className="text-slate-700" />
        </div>
        <button
          onClick={onToggle}
          className="flex size-5 items-center justify-center hover:opacity-70"
        >
          <PanelLeft size={15} className="text-slate-700" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 py-6">
        <Link
          href={'/' + labSlug + '/activities'}
          className={
            'flex h-6 items-center gap-2 rounded px-4 py-1 text-xs opacity-80 hover:bg-slate-100 ' +
            (isActive('/' + labSlug + '/activities') ? 'bg-slate-100' : '')
          }
        >
          <Box size={16} className="text-slate-700" />
          <span>My Activities</span>
        </Link>
        <Link
          href={'/' + labSlug + '/inbox'}
          className={
            'flex h-6 items-center gap-2 rounded px-4 py-1 text-xs opacity-80 hover:bg-slate-100 ' +
            (isActive('/' + labSlug + '/inbox') ? 'bg-slate-100' : '')
          }
        >
          <Inbox size={16} className="text-slate-700" />
          <span>Inbox</span>
        </Link>
      </nav>

      {/* My Projects */}
      <div className="flex flex-col gap-1 py-2">
        <div className="flex h-6 items-center gap-2 px-4 py-1 opacity-80">
          <span className="text-xs text-slate-600">My Projects</span>
          <ChevronDown size={16} className="text-slate-600" />
        </div>
        {myProjects.map((project) => (
          <Link
            key={project.id}
            href={'/' + labSlug + '/' + project.slug}
            className={
              'flex h-6 items-center gap-2 rounded px-4 py-1 text-xs opacity-80 hover:bg-slate-100 ' +
              (isActive('/' + labSlug + '/' + project.slug) ? 'bg-slate-100' : '')
            }
          >
            <Menu size={16} className="text-slate-700" />
            <span>{project.name}</span>
          </Link>
        ))}
      </div>

      {/* All Projects */}
      <div className="flex flex-col gap-1 py-2">
        <div className="flex h-6 items-center gap-2 px-4 py-1 opacity-80">
          <span className="text-xs text-slate-600">All Projects</span>
          <ChevronDown size={16} className="text-slate-600" />
        </div>
        {allProjects.map((project) => (
          <Link
            key={project.id}
            href={'/' + labSlug + '/' + project.slug}
            className={
              'flex h-6 items-center gap-2 rounded px-4 py-1 text-xs opacity-80 hover:bg-slate-100 ' +
              (isActive('/' + labSlug + '/' + project.slug) ? 'bg-slate-100' : '')
            }
          >
            <Menu size={16} className="text-slate-700" />
            <span>{project.name}</span>
          </Link>
        ))}
      </div>

      {/* Members */}
      <div className="flex flex-col gap-1 py-2">
        <div className="flex h-6 items-center gap-2 px-4 py-1 opacity-80">
          <span className="text-xs text-slate-600">Member</span>
          <ChevronDown size={16} className="text-slate-600" />
        </div>
        {members.map((member) => (
          <Link
            key={member.id}
            href={'/' + labSlug + '/members/' + member.id}
            className="flex h-6 items-center gap-2 rounded px-4 py-1 text-xs opacity-80 hover:bg-slate-100"
          >
            <UserCircle size={16} className="text-slate-700" />
            <span>{member.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
