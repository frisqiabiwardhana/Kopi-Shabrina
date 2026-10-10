import React from 'react';
import { 
  Coffee, 
  LayoutDashboard, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RotateCcw, 
  Boxes, 
  BookOpen, 
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { PageTab } from '../types';

interface SidebarProps {
  activeTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  isOpen: boolean;
  onClose: () => void;
  hasLowStockAlert: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  hasLowStockAlert,
}) => {
  const menuItems: { id: PageTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: hasLowStockAlert ? 'Perhatian' : undefined,
    },
    {
      id: 'masuk',
      label: 'Bahan Baku Masuk',
      icon: <ArrowDownToLine className="w-5 h-5" />,
    },
    {
      id: 'keluar',
      label: 'Bahan Baku Keluar',
      icon: <ArrowUpFromLine className="w-5 h-5" />,
    },
    {
      id: 'retur',
      label: 'Retur Penjualan',
      icon: <RotateCcw className="w-5 h-5" />,
    },
    {
      id: 'stok',
      label: 'Stok Tersedia',
      icon: <Boxes className="w-5 h-5" />,
    },
    {
      id: 'pembukuan',
      label: 'Cetak Pembukuan',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Backdrop overlay di mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-68 bg-[#FAF6F1] border-r border-[#D7B899]/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="p-5 flex items-center justify-between border-b border-[#D7B899]/40 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center shadow-md">
              <Coffee className="w-6 h-6 text-[#D7B899]" />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-[#3E2723]">
                KopiStok
              </h1>
              <p className="text-[11px] font-medium text-stone-500">
                Monitoring Biji Kopi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6F4E37] text-white shadow-md shadow-[#6F4E37]/20 translate-x-1'
                    : 'text-[#3E2723] hover:bg-white hover:text-[#6F4E37]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#D7B899]' : 'text-[#6F4E37]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    <ShieldAlert className="w-3 h-3" />
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Formula reminder box */}
        <div className="p-4 m-3 bg-white rounded-2xl border border-[#D7B899]/50 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#6F4E37] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6F4E37]" />
            <span>Rumus Stok Baku</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed font-mono bg-[#FAF6F1] p-2 rounded-lg border border-[#D7B899]/30">
            Sisa = Masuk − Keluar + Retur
          </p>
          <p className="text-[10px] text-stone-500 mt-1.5 italic">
            *Retur penjualan menambah kembali saldo stok fisik.
          </p>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#D7B899]/40 text-center">
          <p className="text-[11px] text-stone-500 font-medium">
            Sistem Inventori Kopi v1.0
          </p>
          <p className="text-[10px] text-stone-400">
            Robusta • Arabica • Excelsa
          </p>
        </div>
      </aside>
    </>
  );
};
