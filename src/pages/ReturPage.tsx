import React, { useState, useMemo } from 'react';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Info,
  XCircle,
  PackageOpen
} from 'lucide-react';
import { CoffeeType, Transaction } from '../types';
import { COFFEE_INFO } from '../types';
import { formatKg, formatTanggalIndo, getTodayString } from '../lib/utils';

interface ReturPageProps {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (trx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onQuickAdd: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const ReturPage: React.FC<ReturPageProps> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  onQuickAdd,
}) => {
  // Inline quick-add form state
  const [inlineDate, setInlineDate] = useState<string>(getTodayString());
  const [inlineCoffee, setInlineCoffee] = useState<CoffeeType>('Robusta');
  const [inlineQty, setInlineQty] = useState<string>('');
  const [inlineCustomer, setInlineCustomer] = useState<string>('');
  const [inlineReason, setInlineReason] = useState<string>('');
  const [inlineNotes, setInlineNotes] = useState<string>('');
  const [inlineError, setInlineError] = useState<string>('');

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCoffee, setFilterCoffee] = useState<'all' | CoffeeType>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Ambil hanya transaksi bertipe 'retur'
  const returList = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'retur')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions]);

  // Filtered list
  const filteredList = useMemo(() => {
    return returList.filter((item) => {
      if (filterCoffee !== 'all' && item.coffeeType !== filterCoffee) return false;
      if (startDate && item.date < startDate) return false;
      if (endDate && item.date > endDate) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCustomer = item.customer?.toLowerCase().includes(q);
        const matchesReason = item.returnReason?.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesCoffee = item.coffeeType.toLowerCase().includes(q);
        if (!matchesCustomer && !matchesReason && !matchesNotes && !matchesCoffee) return false;
      }

      return true;
    });
  }, [returList, filterCoffee, startDate, endDate, searchQuery]);

  // Total kg barang retur dalam filter
  const totalKgFiltered = useMemo(() => {
    return filteredList.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [filteredList]);

  // Handle submit form inline
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError('');

    const qty = parseFloat(inlineQty);
    if (isNaN(qty) || qty <= 0) {
      setInlineError('Jumlah retur harus lebih besar dari 0 kg');
      return;
    }
    if (!inlineCustomer.trim()) {
      setInlineError('Nama pembeli/pelanggan wajib diisi');
      return;
    }
    if (!inlineReason.trim()) {
      setInlineError('Alasan retur wajib diisi');
      return;
    }

    onQuickAdd({
      type: 'retur',
      date: inlineDate,
      coffeeType: inlineCoffee,
      quantity: qty,
      customer: inlineCustomer.trim(),
      returnReason: inlineReason.trim(),
      notes: inlineNotes.trim() || undefined,
    });

    // Reset inline input
    setInlineQty('');
    setInlineCustomer('');
    setInlineReason('');
    setInlineNotes('');
  };

  const handleResetFilter = () => {
    setSearchQuery('');
    setFilterCoffee('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Banner / Form Tambah Cepat Retur Penjualan */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#D7B899]/50 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#3E2723]">
                Pencatatan Retur Penjualan
              </h3>
              <p className="text-xs text-stone-500">
                Penerimaan pengembalian biji kopi dari pembeli / cafe mitra ke gudang (menambah sisa stok)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#6F4E37] hover:bg-[#3E2723] transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Buka Form Lengkap
          </button>
        </div>

        {/* Info Banner: Retur Menambah Stok */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/90 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Perhatian:</strong> Sesuai rumus pembukuan persediaan, retur penjualan diakui sebagai penambah saldo stok fisik (<strong>Sisa Stok = Masuk − Keluar + Retur Penjualan</strong>).
          </div>
        </div>

        {inlineError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-medium">
            {inlineError}
          </div>
        )}

        <form onSubmit={handleInlineSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Tanggal Retur <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={inlineDate}
                onChange={(e) => setInlineDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            {/* Jenis Kopi */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Jenis Biji Kopi <span className="text-rose-500">*</span>
              </label>
              <select
                value={inlineCoffee}
                onChange={(e) => setInlineCoffee(e.target.value as CoffeeType)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              >
                <option value="Robusta">Biji Kopi Robusta</option>
                <option value="Arabica">Biji Kopi Arabica</option>
                <option value="Excelsa">Biji Kopi Excelsa</option>
              </select>
            </div>

            {/* Jumlah kg */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Jumlah Retur (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  placeholder="Contoh: 15"
                  value={inlineQty}
                  onChange={(e) => {
                    setInlineQty(e.target.value);
                    setInlineError('');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
                />
                <span className="absolute right-3 top-2 text-xs font-bold text-stone-400">kg</span>
              </div>
            </div>

            {/* Pembeli / Pelanggan */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Nama Pembeli <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Cafe Sudut Temu"
                value={inlineCustomer}
                onChange={(e) => setInlineCustomer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            {/* Alasan Retur */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Alasan Retur <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Salah pesan varian"
                value={inlineReason}
                onChange={(e) => setInlineReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder="Kondisi segel..."
                value={inlineNotes}
                onChange={(e) => setInlineNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Simpan Retur Penjualan (+Stok)
            </button>
          </div>
        </form>
      </div>

      {/* Riwayat Tabel & Filter */}
      <div className="bg-white rounded-2xl border border-[#D7B899]/50 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-stone-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#3E2723]">Riwayat Retur Penjualan</h3>
              <p className="text-xs text-stone-500">
                Total tersaring: <strong className="text-blue-700">+{formatKg(totalKgFiltered)}</strong> ({filteredList.length} transaksi)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari pelanggan, alasan atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            {/* Filter Varian Kopi */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={filterCoffee}
                onChange={(e) => setFilterCoffee(e.target.value as 'all' | CoffeeType)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              >
                <option value="all">Semua Varian Kopi</option>
                <option value="Robusta">Biji Kopi Robusta</option>
                <option value="Arabica">Biji Kopi Arabica</option>
                <option value="Excelsa">Biji Kopi Excelsa</option>
              </select>
            </div>

            {/* Dari Tanggal */}
            <div>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                title="Filter dari tanggal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
            </div>

            {/* Sampai Tanggal & Reset */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                title="Filter sampai tanggal"
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-[#6F4E37]"
              />
              {(searchQuery || filterCoffee !== 'all' || startDate || endDate) && (
                <button
                  type="button"
                  onClick={handleResetFilter}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  title="Reset Filter"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabel */}
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
            <PackageOpen className="w-8 h-8 text-stone-300" />
            <span>Tidak ditemukan transaksi retur penjualan yang sesuai filter.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF6F1] border-b border-[#D7B899]/40 text-[#3E2723] font-bold">
                  <th className="py-3 px-4">Tanggal Retur</th>
                  <th className="py-3 px-4">Jenis Kopi</th>
                  <th className="py-3 px-4">Jumlah Retur (kg)</th>
                  <th className="py-3 px-4">Pembeli / Pelanggan</th>
                  <th className="py-3 px-4">Alasan Retur</th>
                  <th className="py-3 px-4">Catatan</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#3E2723] whitespace-nowrap">
                      {formatTanggalIndo(item.date)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-stone-900">
                        {COFFEE_INFO[item.coffeeType].name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-blue-700">
                      +{formatKg(item.quantity)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-800">
                      {item.customer || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">
                      {item.returnReason || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 max-w-xs truncate">
                      {item.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEditTransaction(item)}
                          className="p-1.5 text-stone-500 hover:text-[#6F4E37] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(item.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
