import React from 'react';
import { Menu, Calendar, Sliders, RotateCcw } from 'lucide-react';
import { PageTab } from '../types';
import { formatTanggalIndo, getTodayString } from '../lib/utils';

interface HeaderProps {
  activeTab: PageTab;
  onOpenMobileMenu: () => void;
  onOpenThresholdModal: () => void;
  onOpenResetConfirm: () => void;
}

const PAGE_META: Record<PageTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Ringkasan & Dashboard Stok',
    subtitle: 'Pantau sisa persediaan biji kopi dan pergerakan mutasi terkini',
  },
  masuk: {
    title: 'Bahan Baku Masuk',
    subtitle: 'Pencatatan penerimaan pasokan biji kopi mentah dari supplier',
  },
  keluar: {
    title: 'Bahan Baku Keluar (Produksi)',
    subtitle: 'Pencatatan pemakaian bahan baku untuk roasting atau produksi',
  },
  retur: {
    title: 'Retur Penjualan',
    subtitle: 'Pencatatan pengembalian biji kopi dari pembeli (menambah stok fisik)',
  },
  stok: {
    title: 'Stok Tersedia',
    subtitle: 'Tracking sisa stok real-time per jenis kopi dengan filter rentang waktu',
  },
  pembukuan: {
    title: 'Buku Stok & Cetak Pembukuan',
    subtitle: 'Laporan kartu stok otomatis dengan saldo berjalan siap cetak A4 dan ekspor CSV',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenThresholdModal,
  onOpenResetConfirm,
}) => {
  const currentMeta = PAGE_META[activeTab];
  const todayFormatted = formatTanggalIndo(getTodayString());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D7B899]/50 px-4 sm:px-8 py-4 transition-all no-print">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 -ml-2 rounded-xl text-stone-600 hover:text-[#3E2723] hover:bg-[#FAF6F1] lg:hidden cursor-pointer"
            aria-label="Buka navigasi menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#3E2723]">
              {currentMeta.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              {currentMeta.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date Badge & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Tanggal badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F1] border border-[#D7B899]/50 text-xs font-semibold text-[#6F4E37]">
            <Calendar className="w-4 h-4 text-[#6F4E37]" />
            <span>{todayFormatted}</span>
          </div>

          {/* Atur Batas Minimum */}
          <button
            type="button"
            onClick={onOpenThresholdModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#3E2723] bg-white hover:bg-[#FAF6F1] border border-[#D7B899] shadow-2xs transition-colors cursor-pointer"
            title="Atur ambang batas peringatan stok menipis"
          >
            <Sliders className="w-4 h-4 text-[#6F4E37]" />
            <span className="hidden sm:inline">Batas Minimum</span>
            <span className="sm:hidden">Batas</span>
          </button>

          {/* Reset Data Contoh */}
          <button
            type="button"
            onClick={onOpenResetConfirm}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            title="Kembalikan data ke data simulasi default"
          >
            <RotateCcw className="w-4 h-4 text-stone-500" />
            <span className="hidden sm:inline">Reset Data Contoh</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
