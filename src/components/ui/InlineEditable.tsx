'use client';

import * as React from 'react';

type InlineEditableProps = {
  value: string;
  onChange: (value: string) => void | Promise<void>;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
};

export function InlineEditable({
  value,
  onChange,
  placeholder = 'Type something...',
  className = '',
  multiline = false,
  onBlur,
  onFocus,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [localValue, setLocalValue] = React.useState(value);
  const inputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // valueが更新されたとき、それがlocalValueと一致する場合のみ更新
    // これにより、編集直後にlocalValueを表示し続けることができる
    if (value === localValue || !isEditing) {
      setLocalValue(value);
    }
  }, [value, localValue, isEditing]);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
      } else if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.setSelectionRange(
          inputRef.current.value.length,
          inputRef.current.value.length
        );
      }
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setLocalValue(e.target.value);
  };

  const handleBlur = async () => {
    if (localValue !== value) {
      await onChange(localValue);
    }
    setIsEditing(false);
    onBlur?.();
  };

  const handleFocus = () => {
    onFocus?.();
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      await handleBlur();
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  // 編集後、valueが更新されるまでの間はlocalValueを表示
  // valueが更新されていない場合は、最後に編集したlocalValueを表示
  const currentDisplayValue = isEditing ? localValue : value || localValue || '';
  const isEmpty = !currentDisplayValue.trim();

  // textareaの高さを自動調整
  React.useEffect(() => {
    if (multiline && inputRef.current instanceof HTMLTextAreaElement) {
      const textarea = inputRef.current;
      // 高さをリセットしてからスクロール高さを取得
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.max(scrollHeight, 24)}px`; // 最小24px
    }
  }, [currentDisplayValue, multiline]);

  // 常にinput/textareaを表示し、編集時以外はreadonlyにして見た目を統一
  if (multiline) {
    return (
      <div ref={containerRef} className="relative w-full">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={currentDisplayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onClick={!isEditing ? handleClick : undefined}
          placeholder={placeholder}
          readOnly={!isEditing}
          className={`w-full cursor-text resize-none overflow-hidden border-none bg-transparent outline-none ${
            isEmpty && !isEditing ? 'text-slate-400' : ''
          } ${className}`}
          style={{
            minHeight: '1.5rem',
            pointerEvents: isEditing ? 'auto' : 'auto',
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={currentDisplayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onClick={!isEditing ? handleClick : undefined}
        placeholder={placeholder}
        readOnly={!isEditing}
        className={`w-full cursor-text border-none bg-transparent outline-none ${
          isEmpty && !isEditing ? 'text-slate-400' : ''
        } ${className}`}
      />
    </div>
  );
}
