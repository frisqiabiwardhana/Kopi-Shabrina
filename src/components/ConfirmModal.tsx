import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D7B899]/50 transition-all transform animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-700'}`}>
            {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-[#3E2723]">{title}</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-[#6F4E37] hover:bg-[#3E2723]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
