import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        let bg = 'bg-emerald-50 border-emerald-300 text-emerald-900';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-rose-50 border-rose-300 text-rose-900';
          icon = <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-300 text-amber-900';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-blue-50 border-blue-300 text-blue-900';
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-slide-in ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-gray-400 hover:text-gray-700 p-0.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
