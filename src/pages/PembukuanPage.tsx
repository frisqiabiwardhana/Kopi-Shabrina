import React, { useState, useMemo } from 'react';
import { 
  Printer, 
  Download, 
  Filter, 
  BookOpen, 
  Calendar, 
  XCircle,
  Coffee,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { CoffeeType, Transaction } from '../types';
import { COFFEE_INFO } from '../types';
import { 
  formatKg, 
  formatTanggalIndo, 
  formatTanggalSingkat, 
  getTodayString, 
  exportToCSV,
  getCoffeeFullName
} from '../lib/utils';

interface PembukuanPageProps {
  transactions: Transaction[];
}

interface LedgerRow {
  id: string;
  date: string;
  coffeeType: CoffeeType;
  type: 'masuk' | 'keluar' | 'retur';
  description: string;
  notes?: string;
  masuk: number;
  keluar: number;
  retur: number;
  runningBalance: number;
}

export const PembukuanPage: React.FC<PembukuanPageProps> = ({ transactions }) => {
  // Filter state
  const [selectedCoffee, setSelectedCoffee] = useState<'all' | CoffeeType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Tanggal cetak hari ini
  const printDateFormatted = useMemo(() => {
    return formatTanggalIndo(getTodayString());
  }, []);

  // Hitung buku stok / ledger
  const { initialBalance, ledgerRows, totalMasuk, totalKeluar, totalRetur, finalBalance } = useMemo(() => {
    // 1. Urutkan seluruh transaksi berdasarkan tanggal menaik (lama ke baru)
    const sorted = [...transactions]
      .filter((t) => selectedCoffee === 'all' || t.coffeeType === selectedCoffee)
      .sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      });

    // 2. Hitung saldo awal sebelum startDate
    let initBal = 0;
    const periodTransactions: Transaction[] = [];

    sorted.forEach((trx) => {
      if (startDate && trx.date < startDate) {
        if (trx.type === 'masuk') initBal += trx.quantity;
        else if (trx.type === 'keluar') initBal -= trx.quantity;
        else if (trx.type === 'retur') initBal += trx.quantity;
      } else if (!endDate || trx.date <= endDate) {
        periodTransactions.push(trx);
      }
    });

    // 3. Bangun baris ledger dengan saldo berjalan
    let currentBalance = initBal;
    let totMasuk = 0;
    let totKeluar = 0;
    let totRetur = 0;

    const rows: LedgerRow[] = periodTransactions.map((trx) => {
      let masuk = 0;
      let keluar = 0;
      let retur = 0;
      let description = '';

      if (trx.type === 'masuk') {
        masuk = trx.quantity;
        totMasuk += masuk;
        currentBalance += masuk;
        description = `Penerimaan Supplier: ${trx.supplier || '-'}`;
      } else if (trx.type === 'keluar') {
        keluar = trx.quantity;
        totKeluar += keluar;
        currentBalance -= keluar;
        description = `Pengeluaran Produksi: ${trx.purpose || '-'}`;
      } else if (trx.type === 'retur') {
        retur = trx.quantity;
        totRetur += retur;
        // Retur penjualan menambah saldo berjalan
        currentBalance += retur;
        description = `Retur Pelanggan: ${trx.customer || '-'} (${trx.returnReason || ''})`;
      }

      return {
        id: trx.id,
        date: trx.date,
        coffeeType: trx.coffeeType,
        type: trx.type,
        description,
        notes: trx.notes,
        masuk,
        keluar,
        retur,
        runningBalance: currentBalance,
      };
    });

    return {
      initialBalance: initBal,
      ledgerRows: rows,
      totalMasuk: totMasuk,
      totalKeluar: totKeluar,
      totalRetur: totRetur,
      finalBalance: currentBalance,
    };
  }, [transactions, selectedCoffee, startDate, endDate]);

  // Handle Cetak window.print()
  const handlePrint = () => {
    window.print();
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const filename = `Pembukuan_Stok_Kopi_${selectedCoffee}_${startDate || 'Awal'}_${endDate || 'Akhir'}`;
    const headers = [
      'No',
      'Tanggal',
      'Jenis Kopi',
      'Keterangan Transaksi',
      'Catatan',
      'Masuk (kg)',
      'Keluar (kg)',
      'Retur Penjualan (kg)',
      'Saldo Berjalan (kg)',
    ];

    const rows: (string | number)[][] = [];

    // Saldo Awal row if filtered
    if (startDate) {
      rows.push(['-', formatTanggalIndo(startDate), '-', 'SALDO AWAL SEBELUM PERIODE', '-', 0, 0, 0, initialBalance]);
    }

    ledgerRows.forEach((r, idx) => {
      rows.push([
        idx + 1,
        formatTanggalSingkat(r.date),
        COFFEE_INFO[r.coffeeType].name,
        r.description,
        r.notes || '-',
        r.masuk,
        r.keluar,
        r.retur,
        r.runningBalance,
      ]);
    });

    // Ringkasan
    rows.push([
      'RINGKASAN',
      '-',
      '-',
      'TOTAL MUTASI PERIODE INI',
      '-',
      totalMasuk,
      totalKeluar,
      totalRetur,
      finalBalance,
    ]);

    exportToCSV(filename, headers, rows);
  };

  const handleResetFilter = () => {
    setSelectedCoffee('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden during print) */}
      <div className="bg-white rounded-2xl p-5 border border-[#D7B899]/50 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        {/* Left: Info & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6F4E37]" />
            <span className="font-bold text-sm text-[#3E2723]">Filter Buku Stok:</span>
          </div>

          {/* Filter Varian Kopi */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F1] px-3 py-1.5 rounded-xl border border-[#D7B899]/50 text-xs font-semibold text-[#3E2723]">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedCoffee}
              onChange={(e) => setSelectedCoffee(e.target.value as 'all' | CoffeeType)}
              className="bg-transparent text-xs font-semibold text-[#3E2723] focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Varian Kopi</option>
              <option value="Robusta">Biji Kopi Robusta</option>
              <option value="Arabica">Biji Kopi Arabica</option>
              <option value="Excelsa">Biji Kopi Excelsa</option>
            </select>
          </div>

          {/* Filter Periode Tanggal */}
          <div className="flex items-center gap-1.5 bg-[#FAF6F1] px-3 py-1.5 rounded-xl border border-[#D7B899]/50 text-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-500">Periode:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3E2723] focus:outline-none"
            />
            <span className="text-stone-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#3E2723] focus:outline-none"
            />
          </div>

          {(selectedCoffee !== 'all' || startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              title="Reset Filter"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right: Print & Export Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#6F4E37] hover:bg-[#3E2723] text-white rounded-xl text-xs font-bold shadow-md shadow-[#6F4E37]/20 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen (A4)</span>
          </button>
        </div>
      </div>

      {/* Area Laporan / Kartu Stok (Siap Cetak A4) */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#D7B899]/60 shadow-md print-container">
        {/* Header Laporan Resmi */}
        <div className="border-b-2 border-[#3E2723] pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center font-bold text-xl print:border print:border-black">
                <Coffee className="w-7 h-7 text-[#D7B899] print:text-black" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#3E2723] uppercase">
                  Laporan Pembukuan Stok Bahan Baku Kopi
                </h1>
                <p className="text-xs text-stone-600 font-medium">
                  Sistem Informasi Inventori & Mutasi Biji Kopi (Robusta • Arabica • Excelsa)
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-[#3E2723]">KARTU STOK RESMI</div>
              <div className="text-stone-500 mt-0.5">Tanggal Cetak: {printDateFormatted}</div>
            </div>
          </div>

          {/* Meta Info Bar */}
          <div className="mt-5 pt-4 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-stone-500 block">Varian Komoditas:</span>
              <span className="font-bold text-[#3E2723]">
                {selectedCoffee === 'all' ? 'Semua Jenis Biji Kopi' : getCoffeeFullName(selectedCoffee)}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Periode Laporan:</span>
              <span className="font-bold text-[#3E2723]">
                {startDate ? formatTanggalIndo(startDate) : 'Awal Pembukuan'} s/d{' '}
                {endDate ? formatTanggalIndo(endDate) : 'Sekarang'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block">Metode Perhitungan:</span>
              <span className="font-bold text-[#3E2723]">Saldo Berjalan (Perpetual)</span>
            </div>
            <div>
              <span className="text-stone-500 block">Rumus Sisa Stok:</span>
              <span className="font-bold text-[#6F4E37]">Masuk − Keluar + Retur</span>
            </div>
          </div>
        </div>

        {/* Tabel Pembukuan / Kartu Stok */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF6F1] border-y-2 border-[#D7B899] text-[#3E2723] font-bold uppercase text-[11px] tracking-wide">
                <th className="py-3 px-3 w-10 text-center">No</th>
                <th className="py-3 px-3 whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-3">Jenis Kopi</th>
                <th className="py-3 px-3 min-w-[200px]">Keterangan Transaksi</th>
                <th className="py-3 px-3 text-right text-emerald-800">Masuk (kg)</th>
                <th className="py-3 px-3 text-right text-amber-900">Keluar (kg)</th>
                <th className="py-3 px-3 text-right text-blue-900">Retur (kg)</th>
                <th className="py-3 px-3 text-right text-[#3E2723] font-extrabold bg-[#FAF6F1]">
                  Saldo (kg)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {/* Baris Saldo Awal jika periode difilter */}
              {startDate && (
                <tr className="bg-stone-50/70 font-semibold italic">
                  <td className="py-2.5 px-3 text-center">-</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">{formatTanggalIndo(startDate)}</td>
                  <td className="py-2.5 px-3">{selectedCoffee === 'all' ? 'Semua' : selectedCoffee}</td>
                  <td className="py-2.5 px-3">Saldo Awal Sebelum Periode</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right">-</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#3E2723] bg-stone-100/60">
                    {formatKg(initialBalance)}
                  </td>
                </tr>
              )}

              {ledgerRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    Tidak ada transaksi dalam periode dan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                ledgerRows.map((row, index) => {
                  return (
                    <tr key={row.id} className="hover:bg-[#FAF6F1]/50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-stone-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-medium">
                        {formatTanggalIndo(row.date)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-semibold">
                        {COFFEE_INFO[row.coffeeType].name}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-stone-900">{row.description}</div>
                        {row.notes && (
                          <div className="text-[10px] text-stone-500 italic mt-0.5">
                            Catatan: {row.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                        {row.masuk > 0 ? `+${formatKg(row.masuk)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-amber-900 whitespace-nowrap">
                        {row.keluar > 0 ? `−${formatKg(row.keluar)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-blue-700 whitespace-nowrap">
                        {row.retur > 0 ? `+${formatKg(row.retur)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#3E2723] whitespace-nowrap bg-stone-50/70">
                        {formatKg(row.runningBalance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Baris Ringkasan di Akhir */}
            <tfoot>
              <tr className="bg-[#FAF6F1] border-t-2 border-[#3E2723] font-bold text-[#3E2723]">
                <td colSpan={4} className="py-3 px-3 text-right uppercase text-[11px] tracking-wide">
                  Total Mutasi Periode Ini:
                </td>
                <td className="py-3 px-3 text-right text-emerald-800 font-bold whitespace-nowrap">
                  +{formatKg(totalMasuk)}
                </td>
                <td className="py-3 px-3 text-right text-amber-950 font-bold whitespace-nowrap">
                  −{formatKg(totalKeluar)}
                </td>
                <td className="py-3 px-3 text-right text-blue-800 font-bold whitespace-nowrap">
                  +{formatKg(totalRetur)}
                </td>
                <td className="py-3 px-3 text-right font-black text-sm whitespace-nowrap bg-[#FAF6F1] text-[#6F4E37]">
                  {formatKg(finalBalance)}
                </td>
              </tr>

              {/* Baris Ringkasan Saldo Akhir */}
              <tr className="bg-white border-t border-stone-300 font-semibold text-xs text-stone-700">
                <td colSpan={8} className="py-4 px-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF6F1] p-3.5 rounded-xl border border-[#D7B899]/60">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#6F4E37]" />
                      <div>
                        <div className="font-bold text-[#3E2723] text-sm">
                          Saldo Akhir Persediaan: {formatKg(finalBalance)}
                        </div>
                        <div className="text-[11px] text-stone-600">
                          {startDate ? `Saldo Awal (${formatKg(initialBalance)}) + ` : ''}
                          Total Masuk (+{formatKg(totalMasuk)}) − Total Keluar (−{formatKg(totalKeluar)}) + Total Retur (+{formatKg(totalRetur)})
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs text-stone-500 font-mono">
                      Status: Terverifikasi Sistem
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Lembar Tanda Tangan Resmi (Tampil saat Cetak & di Layar) */}
        <div className="mt-12 pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <p className="text-stone-500 mb-16">
              Dibuat oleh,<br />
              <strong>Penanggung Jawab Gudang Bahan Baku</strong>
            </p>
            <div className="border-t border-stone-400 w-48 mx-auto pt-1 font-bold text-[#3E2723]">
              ( .................................................. )
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">Petugas Gudang Kopi</p>
          </div>

          <div>
            <p className="text-stone-500 mb-16">
              Mengetahui & Menyetujui,<br />
              <strong>Kepala Bagian Produksi / Roasting</strong>
            </p>
            <div className="border-t border-stone-400 w-48 mx-auto pt-1 font-bold text-[#3E2723]">
              ( .................................................. )
            </div>
            <p className="text-[10px] text-stone-400 mt-0.5">Manager Operasional & QC</p>
          </div>
        </div>
      </div>
    </div>
  );
};
