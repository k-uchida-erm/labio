'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CaretDown, Cube, Planet, SidebarSimple, Tray, UserCircle } from 'phosphor-react';

type SidebarSectionItem = {
  label: string;
  icon: 'cube' | 'tray' | 'notebook' | 'user';
};

export type ProjectSidebarProps = {
  labName: string;
  myProjects?: SidebarSectionItem[];
  allProjects?: SidebarSectionItem[];
  members?: SidebarSectionItem[];
  onToggle?: () => void;
};

export function ProjectSidebar({
  labName,
  myProjects,
  allProjects,
  members,
  onToggle,
}: ProjectSidebarProps) {
  const [myProjectsOpen, setMyProjectsOpen] = useState(true);
  const [allProjectsOpen, setAllProjectsOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);

  const renderSection = (
    title: string,
    items: SidebarSectionItem[] | undefined,
    open: boolean,
    onToggleOpen: () => void,
    highlightFirst?: boolean
  ) => {
    return (
      <div className="flex w-full flex-col gap-4">
        <div className="flex h-6 items-center justify-between px-4 text-[12px] leading-[15px] text-slate-600 opacity-80">
          <span>{title}</span>
          <button
            type="button"
            className="flex h-6 w-6 items-center justify-center rounded-md p-1 hover:bg-slate-100"
            onClick={onToggleOpen}
          >
            <CaretDown
              size={16}
              weight="light"
              className={`transition-transform duration-150 ${open ? '' : '-rotate-90'}`}
            />
          </button>
        </div>
        <div
          className={`grid transition-all duration-200 ease-out ${
            open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="flex w-full flex-col gap-4 overflow-hidden">
            {open &&
              items &&
              items.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  className={`flex h-6 w-full items-center justify-start gap-2 rounded-md px-4 py-1 text-[12px] leading-5 text-slate-900 opacity-80 transition-colors duration-150 hover:bg-slate-100 ${
                    highlightFirst && index === 0 ? 'bg-slate-100' : ''
                  }`}
                >
                  {item.icon === 'cube' && <Cube size={16} weight="light" />}
                  {item.icon === 'tray' && <Tray size={16} weight="light" />}
                  {item.icon === 'notebook' && <Cube size={16} weight="light" />}
                  {item.icon === 'user' && <UserCircle size={16} weight="fill" />}
                  <span>{item.label}</span>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="flex h-full w-[200px] flex-col rounded-[6px] border border-slate-300 bg-white">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Planet size={16} weight="thin" />
          <span className="text-sm text-slate-900">{labName}</span>
          <CaretDown size={14} weight="light" />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <SidebarSimple size={16} weight="regular" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-2 pt-2 pb-4">
        {/* Top menu */}
        <div className="flex w-full flex-col gap-4">
          <button
            type="button"
            className="flex h-6 w-full items-center justify-start gap-2 rounded-md bg-transparent px-4 py-1 text-[12px] leading-5 text-slate-900 opacity-80 hover:bg-slate-100"
          >
            <Cube size={16} weight="light" />
            <span>My Activities</span>
          </button>
          <button
            type="button"
            className="flex h-6 w-full items-center justify-start gap-2 rounded-md bg-transparent px-4 py-1 text-[12px] leading-5 text-slate-900 opacity-80 hover:bg-slate-100"
          >
            <Tray size={16} weight="light" />
            <span>Inbox</span>
          </button>
          <Link
            href="/profile"
            className="flex h-6 w-full items-center justify-start gap-2 rounded-md bg-transparent px-4 py-1 text-[12px] leading-5 text-slate-900 opacity-80 transition-colors duration-150 hover:bg-slate-100"
          >
            <UserCircle size={16} weight="light" />
            <span>Profile</span>
          </Link>
        </div>

        {renderSection(
          'My Projects',
          myProjects,
          myProjectsOpen,
          () => setMyProjectsOpen((v) => !v),
          true
        )}

        {renderSection('All Projects', allProjects, allProjectsOpen, () =>
          setAllProjectsOpen((v) => !v)
        )}

        {renderSection('Member', members, membersOpen, () => setMembersOpen((v) => !v))}
      </div>
    </aside>
  );
}

export default ProjectSidebar;
