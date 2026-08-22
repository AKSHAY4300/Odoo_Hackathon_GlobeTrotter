import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const ICONS = {
    success: <CheckCircle2 className="w-5 h-5 text-signal-teal shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-boarding-amber shrink-0" />,
    error: <XCircle className="w-5 h-5 text-stamp-red shrink-0" />,
    info: <Info className="w-5 h-5 text-boarding-amber shrink-0" />,
  };

  const BG_COLORS = {
    success: 'border-signal-teal/40 bg-white',
    warning: 'border-boarding-amber/40 bg-white',
    error: 'border-stamp-red/40 bg-white',
    info: 'border-tarmac-grey/30 bg-white',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            BG_COLORS[toast.type]
          }`}
        >
          {ICONS[toast.type]}
          <div className="flex-1 min-w-0">
            <h5 className="font-display font-bold text-xs md:text-sm text-ink-navy">
              {toast.title}
            </h5>
            {toast.description && (
              <p className="text-[11px] text-tarmac-grey mt-0.5 font-sans">
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-tarmac-grey hover:text-ink-navy p-0.5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
