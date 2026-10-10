import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  XCircle,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { CoffeeType, StockThresholds, Transaction } from '../types';
import { COFFEE_INFO } from '../types';
import { formatKg, formatTanggalIndo } from '../lib/utils';

interface StokTersediaPageProps {
  transactions: Transaction[];
  thresholds: StockThresholds;
  onOpenThresholdModal: () => void;
  onOpenAddModal: (type: 'masuk' | 'keluar' | 'retur') => void;
}

export const StokTersediaPage: React.FC<StokTersediaPageProps> = ({
  transactions,
  thresholds,
  onOpenThresholdModal,
  onOpenAddModal,
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Hitung per jenis kopi dengan filter rentang tanggal
  const stockCalculations = useMemo(() => {
    const types: CoffeeType[] = ['Robusta', 'Arabica', 'Excelsa'];

    return types.map((type) => {
      let masuk = 0;
      let keluar = 0;
      let retur = 0;

      transactions.forEach((trx) => {
        if (trx.coffeeType === type) {
          // Evaluasi tanggal jika filter aktif
          if (startDate && trx.date < startDate) return;
          if (endDate && trx.date > endDate) return;

          if (trx.type === 'masuk') masuk += trx.quantity;
          else if (trx.type === 'keluar') keluar += trx.quantity;
          else if (trx.type === 'retur') retur += trx.quantity;
        }
      });

      const sisaStok = masuk - keluar + retur;
      const minThreshold = thresholds[type];
      const isLowStock = sisaStok <= minThreshold;

      return {
        coffeeType: type,
        masuk,
        keluar,
        retur,
        sisaStok,
        minThreshold,
        isLowStock,
      };
    });
  }, [transactions, thresholds, startDate, endDate]);

  // Total keseluruhan
  const grandTotal = useMemo(() => {
    return stockCalculations.reduce(
      (acc, curr) => ({
        masuk: acc.masuk + curr.masuk,
        keluar: acc.keluar + curr.keluar,
        retur: acc.retur + curr.retur,
        sisaStok: acc.sisaStok + curr.sisaStok,
      }),
      { masuk: 0, keluar: 0, retur: 0, sisaStok: 0 }
    );
  }, [stockCalculations]);

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const isFilterActive = Boolean(startDate || endDate);

  return (
    <div className="space-y-6">
      {/* Filter Box & Ringkasan Rumus */}
      <div className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-[#6F4E37]" />
            <h3 className="font-bold text-base text-[#3E2723]">Tracking Sisa Stok Bahan Baku</h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Perhitungan real-time: <span className="font-semibold text-stone-800">Sisa Stok = Total Masuk − Total Keluar + Total Retur Penjualan</span>
          </p>
        </div>

        {/* Filter Tanggal */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-[#FAF6F1] px-3 py-1.5 rounded-xl border border-[#D7B899]/50 text-xs">
            <Calendar className="w-4 h-4 text-stone-500" />
            <span className="text-stone-500 font-medium">Dari:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3E2723] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF6F1] px-3 py-1.5 rounded-xl border border-[#D7B899]/50 text-xs">
            <span className="text-stone-500 font-medium">Sampai:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3E2723] focus:outline-none"
            />
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilter}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Reset Filter Tanggal"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenThresholdModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#6F4E37]" />
            Atur Batas
          </button>
        </div>
      </div>

      {isFilterActive && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span>
            Menampilkan data mutasi stok periode:{' '}
            <strong>{startDate ? formatTanggalIndo(startDate) : 'Awal transaksi'}</strong> s/d{' '}
            <strong>{endDate ? formatTanggalIndo(endDate) : 'Sekarang'}</strong>
          </span>
          <button
            onClick={handleResetFilter}
            className="text-xs font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
          >
            Tampilkan Seluruh Periode
          </button>
        </div>
      )}

      {/* Tabel Utama Stok Tersedia */}
      <div className="bg-white rounded-2xl border border-[#D7B899]/50 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#FAF6F1] border-b border-[#D7B899]/50 text-[#3E2723] font-bold">
                <th className="py-4 px-5">Jenis Bahan Baku</th>
                <th className="py-4 px-5 text-right text-emerald-800">
                  <div className="flex items-center justify-end gap-1.5">
                    <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                    <span>Total Masuk (kg)</span>
                  </div>
                </th>
                <th className="py-4 px-5 text-right text-amber-900">
                  <div className="flex items-center justify-end gap-1.5">
                    <ArrowUpFromLine className="w-4 h-4 text-amber-700" />
                    <span>Total Keluar (kg)</span>
                  </div>
                </th>
                <th className="py-4 px-5 text-right text-blue-900">
                  <div className="flex items-center justify-end gap-1.5">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>Retur Penjualan (kg)</span>
                  </div>
                </th>
                <th className="py-4 px-5 text-right font-extrabold text-[#3E2723]">
                  Sisa Stok Tersedia (kg)
                </th>
                <th className="py-4 px-5 text-center">Status Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {stockCalculations.map((row) => {
                const info = COFFEE_INFO[row.coffeeType];

                return (
                  <tr key={row.coffeeType} className="hover:bg-stone-50/80 transition-colors">
                    {/* Nama Kopi */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: info.color }}
                        />
                        <div>
                          <div className="font-bold text-[#3E2723] text-sm sm:text-base">
                            {info.name}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            Batas aman minimum: {formatKg(row.minThreshold)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Masuk */}
                    <td className="py-4 px-5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                      +{formatKg(row.masuk)}
                    </td>

                    {/* Keluar */}
                    <td className="py-4 px-5 text-right font-semibold text-amber-900 whitespace-nowrap">
                      −{formatKg(row.keluar)}
                    </td>

                    {/* Retur */}
                    <td className="py-4 px-5 text-right font-semibold text-blue-700 whitespace-nowrap">
                      +{formatKg(row.retur)}
                    </td>

                    {/* Sisa Stok */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="text-base sm:text-lg font-black text-[#3E2723]">
                        {formatKg(row.sisaStok)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      {row.isLowStock ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Stok Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Stok Aman
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Baris Total Keseluruhan */}
            <tfoot>
              <tr className="bg-[#FAF6F1] border-t-2 border-[#D7B899] font-bold text-[#3E2723]">
                <td className="py-4 px-5 text-sm sm:text-base">
                  TOTAL KESELURUHAN (SEMUA VARIAN)
                </td>
                <td className="py-4 px-5 text-right font-bold text-emerald-800 whitespace-nowrap text-sm sm:text-base">
                  +{formatKg(grandTotal.masuk)}
                </td>
                <td className="py-4 px-5 text-right font-bold text-amber-950 whitespace-nowrap text-sm sm:text-base">
                  −{formatKg(grandTotal.keluar)}
                </td>
                <td className="py-4 px-5 text-right font-bold text-blue-800 whitespace-nowrap text-sm sm:text-base">
                  +{formatKg(grandTotal.retur)}
                </td>
                <td className="py-4 px-5 text-right whitespace-nowrap text-base sm:text-xl font-black text-[#6F4E37]">
                  {formatKg(grandTotal.sisaStok)}
                </td>
                <td className="py-4 px-5 text-center text-xs text-stone-500">
                  Semua Bahan Baku
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Rincian Kartu Tiap Jenis Kopi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stockCalculations.map((item) => {
          const info = COFFEE_INFO[item.coffeeType];

          return (
            <div
              key={item.coffeeType}
              className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <h4 className="font-bold text-sm text-[#3E2723]">{info.name}</h4>
                  </div>
                  {item.isLowStock && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      Menipis
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {info.shortDesc}
                </p>

                <div className="mt-4 p-3 bg-[#FAF6F1] rounded-xl border border-[#D7B899]/40 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Total Bahan Masuk:</span>
                    <span className="font-semibold text-emerald-700">+{formatKg(item.masuk)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Total Keluar Produksi:</span>
                    <span className="font-semibold text-amber-900">−{formatKg(item.keluar)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Total Retur Pelanggan:</span>
                    <span className="font-semibold text-blue-700">+{formatKg(item.retur)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#D7B899]/30 flex justify-between font-bold text-[#3E2723]">
                    <span>Sisa Stok Fisik:</span>
                    <span className="text-sm font-extrabold text-[#6F4E37]">{formatKg(item.sisaStok)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenAddModal('masuk')}
                  className="flex-1 py-1.5 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  + Masuk
                </button>
                <button
                  onClick={() => onOpenAddModal('keluar')}
                  className="flex-1 py-1.5 text-center text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                >
                  − Keluar
                </button>
                <button
                  onClick={() => onOpenAddModal('retur')}
                  className="flex-1 py-1.5 text-center text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  + Retur
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
