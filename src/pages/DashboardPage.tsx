import React, { useMemo } from 'react';
import { 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RotateCcw, 
  AlertTriangle, 
  Plus, 
  ArrowRight, 
  Calendar, 
  TrendingUp,
  PackageCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CoffeeType, PageTab, StockSummary, StockThresholds, Transaction } from '../types';
import { COFFEE_INFO } from '../types';
import { formatKg, formatTanggalIndo } from '../lib/utils';
import { StockMovementChart } from '../components/StockMovementChart';

interface DashboardPageProps {
  transactions: Transaction[];
  summaries: Record<CoffeeType, StockSummary>;
  thresholds: StockThresholds;
  onNavigate: (tab: PageTab) => void;
  onOpenAddModal: (type: 'masuk' | 'keluar' | 'retur') => void;
  onEditTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenThresholdModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  transactions,
  summaries,
  onNavigate,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onOpenThresholdModal,
}) => {
  // Hitung total keseluruhan stok saat ini
  const totalSisaStok = useMemo(() => {
    return Object.values(summaries).reduce((acc, curr) => acc + curr.sisaStok, 0);
  }, [summaries]);

  // Hitung mutasi bulan berjalan (bulan saat ini)
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${currentYear}-${currentMonth}`;

    let masuk = 0;
    let keluar = 0;
    let retur = 0;

    transactions.forEach((t) => {
      if (t.date.startsWith(prefix)) {
        if (t.type === 'masuk') masuk += t.quantity;
        else if (t.type === 'keluar') keluar += t.quantity;
        else if (t.type === 'retur') retur += t.quantity;
      }
    });

    const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now);

    return { masuk, keluar, retur, monthLabel };
  }, [transactions]);

  // Ambil 10 transaksi terbaru berdasarkan tanggal & createdAt
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateDiff = b.date.localeCompare(a.date);
        if (dateDiff !== 0) return dateDiff;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      })
      .slice(0, 10);
  }, [transactions]);

  // Cek kopi yang sedang menipis
  const lowStockCoffees = useMemo(() => {
    return (['Robusta', 'Arabica', 'Excelsa'] as CoffeeType[]).filter(
      (type) => summaries[type]?.isLowStock
    );
  }, [summaries]);

  return (
    <div className="space-y-6">
      {/* Peringatan Stok Menipis Banner jika ada */}
      {lowStockCoffees.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-700 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Peringatan: Stok Bahan Baku Menipis!
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Varian berikut berada di bawah batas aman:{' '}
                  <strong>
                    {lowStockCoffees.map((type) => `${COFFEE_INFO[type].name} (${formatKg(summaries[type].sisaStok)} / min ${formatKg(summaries[type].minThreshold)})`).join(', ')}
                  </strong>
                  . Segera buat pesanan bahan baku masuk ke pemasok.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => onOpenAddModal('masuk')}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                + Masuk Stok
              </button>
              <button
                onClick={onOpenThresholdModal}
                className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Atur Batas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Kartu Ringkasan Sisa Stok Tiap Jenis Kopi + Total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Keseluruhan */}
        <div className="bg-[#6F4E37] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D7B899]">
                Total Stok Fisik
              </span>
              <div className="p-2 bg-white/10 rounded-xl">
                <Boxes className="w-5 h-5 text-[#D7B899]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-extrabold tracking-tight">
                {formatKg(totalSisaStok)}
              </div>
              <p className="text-xs text-stone-200 mt-1">
                Gabungan Robusta, Arabica & Excelsa
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-stone-300">Rumus: Masuk − Keluar + Retur</span>
            <button
              onClick={() => onNavigate('stok')}
              className="text-[#D7B899] hover:text-white font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              Rincian <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Jenis Kopi: Robusta, Arabica, Excelsa */}
        {(['Robusta', 'Arabica', 'Excelsa'] as CoffeeType[]).map((type) => {
          const item = summaries[type];
          const info = COFFEE_INFO[type];
          const isLow = item.isLowStock;

          return (
            <div
              key={type}
              className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                isLow ? 'border-amber-300 ring-2 ring-amber-100' : 'border-[#D7B899]/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <h3 className="font-bold text-sm text-[#3E2723]">{info.name}</h3>
                  </div>

                  {isLow ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Menipis
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Aman
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#3E2723]">
                    {formatKg(item.sisaStok)}
                  </div>
                  <div className="text-xs text-stone-500 mt-1 flex items-center justify-between">
                    <span>Batas Min: {formatKg(item.minThreshold)}</span>
                    <span className="text-[11px] text-stone-400">
                      Retur: +{formatKg(item.totalRetur)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mutasi singkat */}
              <div className="mt-5 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#FAF6F1] p-2 rounded-lg">
                  <span className="text-stone-500 block">Total Masuk</span>
                  <span className="font-bold text-emerald-700">+{formatKg(item.totalMasuk)}</span>
                </div>
                <div className="bg-[#FAF6F1] p-2 rounded-lg">
                  <span className="text-stone-500 block">Total Keluar</span>
                  <span className="font-bold text-amber-900">−{formatKg(item.totalKeluar)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ringkasan Mutasi Bulan Ini & Tombol Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kartu Mutasi Bulan Berjalan */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#FAF6F1] rounded-xl text-[#6F4E37] border border-[#D7B899]/40">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#3E2723]">Mutasi Bulan Ini</h3>
                  <p className="text-[11px] text-stone-500">{currentMonthStats.monthLabel}</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                Periode Aktif
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {/* Masuk */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-900">Total Masuk</span>
                </div>
                <span className="text-sm font-bold text-emerald-700">
                  +{formatKg(currentMonthStats.masuk)}
                </span>
              </div>

              {/* Keluar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <ArrowUpFromLine className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-semibold text-amber-900">Total Keluar Produksi</span>
                </div>
                <span className="text-sm font-bold text-amber-800">
                  −{formatKg(currentMonthStats.keluar)}
                </span>
              </div>

              {/* Retur */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-semibold text-blue-900 block">Retur Penjualan</span>
                    <span className="text-[10px] text-blue-700">(Menambah Stok)</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-700">
                  +{formatKg(currentMonthStats.retur)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-500">Mutasi Bersih Bulan Ini:</span>
            <span className="font-bold text-[#3E2723]">
              {formatKg(currentMonthStats.masuk - currentMonthStats.keluar + currentMonthStats.retur)}
            </span>
          </div>
        </div>

        {/* Aksi Cepat Input Transaksi */}
        <div className="bg-gradient-to-br from-[#FAF6F1] to-white rounded-2xl p-5 border border-[#D7B899]/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#6F4E37]" />
              <h3 className="font-bold text-sm text-[#3E2723]">Aksi Cepat Input Mutasi</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Catat pergerakan fisik bahan baku biji kopi dengan cepat dan mudah ke sistem.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => onOpenAddModal('masuk')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 shadow-2xs transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition-transform">
                    <ArrowDownToLine className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-900">Bahan Baku Masuk</div>
                    <div className="text-[10px] text-stone-500">Penerimaan dari supplier</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-stone-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onOpenAddModal('keluar')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-amber-50 border border-stone-200 hover:border-amber-300 shadow-2xs transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg group-hover:scale-105 transition-transform">
                    <ArrowUpFromLine className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-900">Bahan Baku Keluar</div>
                    <div className="text-[10px] text-stone-500">Untuk batch roasting/produksi</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-stone-400 group-hover:text-amber-800" />
              </button>

              <button
                onClick={() => onOpenAddModal('retur')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-blue-50 border border-stone-200 hover:border-blue-300 shadow-2xs transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-stone-900">Retur Penjualan</div>
                    <div className="text-[10px] text-stone-500">Pengembalian dari pelanggan (+ stok)</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-stone-400 group-hover:text-blue-700" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">Cetak kartu stok resmi:</span>
            <button
              onClick={() => onNavigate('pembukuan')}
              className="text-xs font-bold text-[#6F4E37] hover:text-[#3E2723] flex items-center gap-1 cursor-pointer"
            >
              Buka Pembukuan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Informasi Panduan Mutasi */}
        <div className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PackageCheck className="w-4 h-4 text-[#6F4E37]" />
              <h3 className="font-bold text-sm text-[#3E2723]">Alur Operasional Bahan Baku</h3>
            </div>
            
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F1] text-[#6F4E37] font-bold flex items-center justify-center shrink-0 border border-[#D7B899]/40 text-[11px]">
                  1
                </span>
                <p>
                  <strong className="text-stone-800">Penerimaan:</strong> Timbang biji kopi mentah (green bean), cek kadar air, dan catat nama pemasok di menu <em>Bahan Baku Masuk</em>.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F1] text-[#6F4E37] font-bold flex items-center justify-center shrink-0 border border-[#D7B899]/40 text-[11px]">
                  2
                </span>
                <p>
                  <strong className="text-stone-800">Produksi Roasting:</strong> Sebelum disangrai, input jumlah keluar dengan nomor batch di menu <em>Bahan Baku Keluar</em>. Sistem memvalidasi agar tidak minus.
                </p>
              </div>

              <div className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FAF6F1] text-[#6F4E37] font-bold flex items-center justify-center shrink-0 border border-[#D7B899]/40 text-[11px]">
                  3
                </span>
                <p>
                  <strong className="text-stone-800">Retur Pelanggan:</strong> Bila ada komoditas belum diolah yang dikembalikan, catat di <em>Retur Penjualan</em> agar saldo kembali bertambah.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#D7B899]/40 text-[11px] text-stone-600 flex items-center justify-between">
            <span>Sisa stok selalu terhitung otomatis.</span>
            <button
              onClick={() => onNavigate('pembukuan')}
              className="text-[#6F4E37] font-bold hover:underline cursor-pointer"
            >
              Cetak A4
            </button>
          </div>
        </div>
      </div>

      {/* Grafik Pergerakan Stok */}
      <StockMovementChart transactions={transactions} />

      {/* Tabel 10 Transaksi Terbaru */}
      <div className="bg-white rounded-2xl border border-[#D7B899]/50 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FAF6F1] text-[#6F4E37] rounded-xl border border-[#D7B899]/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#3E2723]">10 Transaksi Terbaru</h3>
              <p className="text-xs text-stone-500">Mutasi barang masuk, keluar produksi, dan retur terkini</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('pembukuan')}
              className="text-xs font-semibold text-[#6F4E37] hover:text-[#3E2723] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Seluruh Mutasi di Pembukuan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            Belum ada transaksi yang tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF6F1] border-b border-[#D7B899]/40 text-[#3E2723] font-bold">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tipe Mutasi</th>
                  <th className="py-3 px-4">Jenis Kopi</th>
                  <th className="py-3 px-4">Jumlah (kg)</th>
                  <th className="py-3 px-4">Pihak / Keperluan</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentTransactions.map((trx) => {
                  let badge = (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Masuk
                    </span>
                  );
                  let qtyColor = 'text-emerald-700 font-bold';
                  let qtySign = '+';
                  let pihak = trx.supplier ? `Supplier: ${trx.supplier}` : '-';

                  if (trx.type === 'keluar') {
                    badge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Keluar
                      </span>
                    );
                    qtyColor = 'text-amber-800 font-bold';
                    qtySign = '−';
                    pihak = trx.purpose ? `Produksi: ${trx.purpose}` : '-';
                  } else if (trx.type === 'retur') {
                    badge = (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300">
                        Retur (+Stok)
                      </span>
                    );
                    qtyColor = 'text-blue-700 font-bold';
                    qtySign = '+';
                    pihak = trx.customer ? `Pelanggan: ${trx.customer} (${trx.returnReason || ''})` : '-';
                  }

                  return (
                    <tr key={trx.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-[#3E2723]">
                        {formatTanggalIndo(trx.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{badge}</td>
                      <td className="py-3 px-4 whitespace-nowrap font-semibold">
                        {COFFEE_INFO[trx.coffeeType].name}
                      </td>
                      <td className={`py-3 px-4 whitespace-nowrap ${qtyColor}`}>
                        {qtySign} {formatKg(trx.quantity)}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{pihak}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-stone-500">
                        {trx.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditTransaction(trx)}
                            className="text-[#6F4E37] hover:text-[#3E2723] hover:underline font-semibold cursor-pointer"
                          >
                            Edit
                          </button>
                          <span className="text-stone-300">•</span>
                          <button
                            onClick={() => onDeleteTransaction(trx.id)}
                            className="text-rose-600 hover:text-rose-800 hover:underline font-semibold cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
