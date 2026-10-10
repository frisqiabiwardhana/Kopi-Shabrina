import React, { useState, useMemo } from 'react';
import { BarChart3, Filter } from 'lucide-react';
import { CoffeeType, Transaction } from '../types';
import { formatKg } from '../lib/utils';

interface StockMovementChartProps {
  transactions: Transaction[];
}

export const StockMovementChart: React.FC<StockMovementChartProps> = ({ transactions }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | CoffeeType>('all');

  // Kelompokkan data transaksi berdasarkan bulan (6 bulan terakhir atau data yang tersedia)
  const monthlyData = useMemo(() => {
    const map = new Map<string, { monthKey: string; monthLabel: string; masuk: number; keluar: number; retur: number }>();

    // Urutkan transaksi berdasarkan tanggal lama ke baru
    const sorted = [...transactions]
      .filter((t) => selectedFilter === 'all' || t.coffeeType === selectedFilter)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Ambil rentang bulan
    sorted.forEach((trx) => {
      const dateParts = trx.date.split('-');
      if (dateParts.length < 2) return;
      const monthKey = `${dateParts[0]}-${dateParts[1]}`;
      
      const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, 1);
      const monthLabel = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(dateObj);

      if (!map.has(monthKey)) {
        map.set(monthKey, { monthKey, monthLabel, masuk: 0, keluar: 0, retur: 0 });
      }

      const item = map.get(monthKey)!;
      if (trx.type === 'masuk') item.masuk += trx.quantity;
      if (trx.type === 'keluar') item.keluar += trx.quantity;
      if (trx.type === 'retur') item.retur += trx.quantity;
    });

    // Ambil maksimal 6 bulan terakhir
    const arr = Array.from(map.values());
    return arr.slice(-6);
  }, [transactions, selectedFilter]);

  // Cari nilai maksimum untuk kalkulasi tinggi bar
  const maxVal = useMemo(() => {
    let max = 100;
    monthlyData.forEach((d) => {
      if (d.masuk > max) max = d.masuk;
      if (d.keluar > max) max = d.keluar;
      if (d.retur > max) max = d.retur;
    });
    return max * 1.15; // Beri ruang margin atas 15%
  }, [monthlyData]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#FAF6F1] rounded-xl text-[#6F4E37] border border-[#D7B899]/30">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#3E2723]">Pergerakan Stok (Masuk vs Keluar vs Retur)</h3>
            <p className="text-xs text-stone-500">Volume fisik pergerakan bahan baku per bulan</p>
          </div>
        </div>

        {/* Filter jenis kopi */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-stone-400" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as 'all' | CoffeeType)}
            className="text-xs font-semibold text-[#3E2723] bg-[#FAF6F1] border border-[#D7B899]/60 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#6F4E37] cursor-pointer"
          >
            <option value="all">Semua Varian Kopi</option>
            <option value="Robusta">Biji Kopi Robusta</option>
            <option value="Arabica">Biji Kopi Arabica</option>
            <option value="Excelsa">Biji Kopi Excelsa</option>
          </select>
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-xs text-stone-400">
          Belum ada data pergerakan stok untuk ditampilkan.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-end gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-600"></span>
              <span className="text-stone-700">Masuk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-700"></span>
              <span className="text-stone-700">Keluar (Produksi)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-blue-500"></span>
              <span className="text-stone-700">Retur Penjualan</span>
            </div>
          </div>

          {/* Chart area */}
          <div className="h-56 pt-4 flex items-end justify-between gap-3 sm:gap-6 border-b border-stone-200">
            {monthlyData.map((d) => {
              const masukHeight = Math.max(4, (d.masuk / maxVal) * 100);
              const keluarHeight = Math.max(4, (d.keluar / maxVal) * 100);
              const returHeight = Math.max(4, (d.retur / maxVal) * 100);

              return (
                <div key={d.monthKey} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full pb-1">
                    {/* Bar Masuk */}
                    <div className="flex-1 max-w-[24px] flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-emerald-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(d.masuk)}
                      </span>
                      <div
                        style={{ height: `${masukHeight}%` }}
                        title={`Masuk: ${formatKg(d.masuk)}`}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t-md transition-all shadow-xs"
                      />
                    </div>

                    {/* Bar Keluar */}
                    <div className="flex-1 max-w-[24px] flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-amber-800 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(d.keluar)}
                      </span>
                      <div
                        style={{ height: `${keluarHeight}%` }}
                        title={`Keluar: ${formatKg(d.keluar)}`}
                        className="w-full bg-amber-700 hover:bg-amber-800 rounded-t-md transition-all shadow-xs"
                      />
                    </div>

                    {/* Bar Retur */}
                    <div className="flex-1 max-w-[24px] flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {Math.round(d.retur)}
                      </span>
                      <div
                        style={{ height: `${returHeight}%` }}
                        title={`Retur Penjualan: ${formatKg(d.retur)}`}
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-md transition-all shadow-xs"
                      />
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-stone-600 mt-2">
                    {d.monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
