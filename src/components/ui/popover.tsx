'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';

type PopoverProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  placement?: 'left' | 'right' | 'bottom';
  strategy?: 'fixed' | 'absolute';
};

export function Popover({
  open,
  onOpenChange,
  children,
  placement = 'right',
  strategy = 'fixed',
}: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      setIsOpen(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  // 位置計算（固定配置）
  React.useEffect(() => {
    if (!isOpen || strategy !== 'fixed') {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let left = triggerRect.right + 8;
      let top = triggerRect.top;

      if (placement === 'left') {
        left = triggerRect.left - contentRect.width - 8;
        if (left < 8) left = triggerRect.right + 8;
      } else if (placement === 'bottom') {
        top = triggerRect.bottom + 8;
        left = triggerRect.left;
        if (left + contentRect.width > viewportWidth - 8) {
          left = Math.max(8, viewportWidth - contentRect.width - 8);
        }
      } else if (placement === 'right') {
        // stay to the right; clamp only if overflowing viewport
        if (left + contentRect.width > viewportWidth - 8) {
          left = Math.max(8, viewportWidth - contentRect.width - 8);
        }
        // align to trigger top; clamp after
        top = triggerRect.top;
      }

      // clamp vertically so bottom stays within viewport with small margin
      const maxTop = viewportHeight - contentRect.height - 8;
      if (top > maxTop) top = Math.max(8, maxTop);
      if (top < 8) top = 8;

      setPosition({ top, left });
    };

    const timeoutId = setTimeout(updatePosition, 0);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, placement, strategy]);

  // 外部クリックで閉じる
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideContainer = containerRef.current?.contains(target);
      const insideContent = contentRef.current?.contains(target);
      if (!insideContainer && !insideContent) {
        handleOpenChange(false);
      }
    };

    // 少し遅延させて、現在のクリックイベントが処理されるのを待つ
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleOpenChange]);

  const contentStyle: React.CSSProperties =
    strategy === 'absolute'
      ? placement === 'bottom'
        ? { top: 'calc(100% + 8px)', left: 0 }
        : placement === 'left'
          ? { right: 'calc(100% + 8px)', top: 0 }
          : { left: 'calc(100% + 8px)', top: 0 }
      : { top: `${position?.top ?? 0}px`, left: `${position?.left ?? 0}px` };

  return (
    <div ref={containerRef} className="relative inline-block">
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          // Trigger
          return (
            <div ref={triggerRef} onClick={() => handleOpenChange(!isOpen)}>
              {child}
            </div>
          );
        }
        return null;
      })}
      {isOpen &&
        (strategy === 'fixed' ? (
          createPortal(
            <div
              ref={contentRef}
              className="fixed z-[70]"
              style={{
                ...contentStyle,
                visibility: position ? 'visible' : 'hidden',
              }}
            >
              {React.Children.toArray(children)[1]}
            </div>,
            document.body
          )
        ) : (
          <div ref={contentRef} className="absolute z-[70]" style={contentStyle}>
            {React.Children.toArray(children)[1]}
          </div>
        ))}
    </div>
  );
}

export function PopoverTrigger({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>;
}

export function PopoverContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-md border border-slate-200 bg-white shadow-md ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
