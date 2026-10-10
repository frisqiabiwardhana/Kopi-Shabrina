import React, { useState, useEffect } from 'react';
import { Sliders, X, Check, RotateCcw } from 'lucide-react';
import { StockThresholds } from '../types';
import { DEFAULT_THRESHOLDS } from '../lib/storage';

interface ThresholdModalProps {
  isOpen: boolean;
  thresholds: StockThresholds;
  onSave: (thresholds: StockThresholds) => void;
  onClose: () => void;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  isOpen,
  thresholds,
  onSave,
  onClose,
}) => {
  const [values, setValues] = useState<StockThresholds>(thresholds);

  useEffect(() => {
    setValues(thresholds);
  }, [thresholds, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(values);
  };

  const handleReset = () => {
    setValues({ ...DEFAULT_THRESHOLDS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#D7B899]/50 transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6F1] text-[#6F4E37] rounded-xl border border-[#D7B899]/40">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3E2723]">Batas Minimum Stok</h3>
              <p className="text-xs text-stone-500">Peringatan "Stok Menipis" muncul jika sisa stok di bawah nilai ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Robusta */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1.5">
              Batas Minimum Biji Kopi Robusta (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={values.Robusta}
                onChange={(e) => setValues({ ...values, Robusta: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] focus:border-transparent text-sm font-medium bg-stone-50/50"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-400">kg</span>
            </div>
          </div>

          {/* Arabica */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1.5">
              Batas Minimum Biji Kopi Arabica (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={values.Arabica}
                onChange={(e) => setValues({ ...values, Arabica: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] focus:border-transparent text-sm font-medium bg-stone-50/50"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-400">kg</span>
            </div>
          </div>

          {/* Excelsa */}
          <div>
            <label className="block text-sm font-semibold text-[#3E2723] mb-1.5">
              Batas Minimum Biji Kopi Excelsa (kg)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={values.Excelsa}
                onChange={(e) => setValues({ ...values, Excelsa: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] focus:border-transparent text-sm font-medium bg-stone-50/50"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-stone-400">kg</span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Standar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#6F4E37] hover:bg-[#3E2723] shadow-md transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
