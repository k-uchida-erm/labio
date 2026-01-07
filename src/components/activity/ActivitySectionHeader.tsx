import { Cube } from 'phosphor-react';

type ActivitySectionHeaderProps = {
  title?: string;
};

export function ActivitySectionHeader({ title = 'Activities' }: ActivitySectionHeaderProps) {
  return (
    <div className="mt-1 flex h-10 w-full flex-none items-center px-5">
      <div className="flex items-center gap-2 text-[14px] text-slate-800">
        <Cube size={16} />
        <span className="whitespace-nowrap">{title}</span>
      </div>
    </div>
  );
}

export default ActivitySectionHeader;
