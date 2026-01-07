'use client';

import React from 'react';
import { MagnifyingGlass } from 'phosphor-react';

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  iconSize?: number;
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className,
  iconSize = 16,
}: SearchInputProps) {
  return (
    <div
      className={`flex h-10 items-center gap-2 border-b border-slate-100 px-3 ${className ?? ''}`}
    >
      <MagnifyingGlass size={iconSize} weight="light" className="text-slate-800" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 border-none bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export default SearchInput;
