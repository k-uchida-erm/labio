import { useEffect } from 'react';

type HotkeyOptions = {
  onUndo?: () => void;
  onRedo?: () => void;
};

export function useStatusHotkeys({ onUndo, onRedo }: HotkeyOptions) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isUndo =
        (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z';
      const isRedoByShift =
        (event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'z';
      const isRedoByY =
        (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'y';
      const isRedo = isRedoByShift || isRedoByY;

      if (!isUndo && !isRedo) return;

      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const isEditable =
          target.isContentEditable ||
          tagName === 'INPUT' ||
          tagName === 'TEXTAREA' ||
          tagName === 'SELECT';
        if (isEditable) return; // 入力中はブラウザのUndo/Redoに任せる
      }

      event.preventDefault();
      if (isUndo) {
        onUndo?.();
      } else if (isRedo) {
        onRedo?.();
      }
    };

    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, [onUndo, onRedo]);
}

export default useStatusHotkeys;
