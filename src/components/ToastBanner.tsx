import { X } from 'lucide-react';
import { useTasks } from '../store/TaskContext';

export function ToastBanner() {
  const { toast, dismissToast } = useTasks();

  if (!toast) return null;

  const accentBorder =
    toast.tone === 'error'
      ? 'border-red-500/40'
      : toast.tone === 'success'
      ? 'border-emerald-500/40'
      : 'border-white/[0.12]';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-[#181D2A] border ${accentBorder} rounded-md shadow-xl text-sm text-slate-100 max-w-sm`}
    >
      <span className="truncate">{toast.message}</span>

      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.();
            dismissToast();
          }}
          className="text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
        >
          {toast.undoLabel || 'Hoàn tác'}
        </button>
      )}

      <button
        type="button"
        onClick={dismissToast}
        aria-label="Đóng thông báo"
        className="p-1 -mr-1 text-slate-400 hover:text-slate-100 rounded shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
