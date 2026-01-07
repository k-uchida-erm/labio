import { Button } from '@/components/ui/button';

export type CascadeDoneDialogProps = {
  titles: string[];
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
};

export function CascadeDoneDialog({
  titles,
  pending,
  error,
  onCancel,
  onConfirm,
}: CascadeDoneDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="text-sm font-semibold text-slate-900">Mark descendants as done?</div>
          <div className="mt-1 text-xs text-slate-600">
            This will mark the following activities as done.
          </div>
        </div>

        <div className="max-h-72 overflow-auto px-4 py-3">
          <ul className="space-y-1 text-xs text-slate-800">
            {titles.map((title, idx) => (
              <li key={`${idx}-${title}`} className="rounded-md bg-slate-50 px-2 py-1">
                {title}
              </li>
            ))}
          </ul>
          {error && <div className="mt-2 text-xs text-red-500">{error}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
          <Button variant="default" onClick={onConfirm} disabled={pending}>
            Mark as done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CascadeDoneDialog;
