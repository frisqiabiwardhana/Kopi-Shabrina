import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  RotateCcw, 
  AlertCircle, 
  Check, 
  Info,
  Package
} from 'lucide-react';
import { CoffeeType, Transaction, TransactionType } from '../types';
import { calculateStockForCoffeeType } from '../lib/storage';
import { formatKg, getTodayString } from '../lib/utils';

interface TransactionModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  type: TransactionType;
  initialData?: Transaction | null;
  allTransactions: Transaction[];
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  mode,
  type,
  initialData,
  allTransactions,
  onSave,
  onClose,
}) => {
  const [date, setDate] = useState<string>(getTodayString());
  const [coffeeType, setCoffeeType] = useState<CoffeeType>('Robusta');
  const [quantity, setQuantity] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [customer, setCustomer] = useState<string>('');
  const [returnReason, setReturnReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setDate(initialData.date);
      setCoffeeType(initialData.coffeeType);
      setQuantity(initialData.quantity.toString());
      setSupplier(initialData.supplier || '');
      setPurpose(initialData.purpose || '');
      setCustomer(initialData.customer || '');
      setReturnReason(initialData.returnReason || '');
      setNotes(initialData.notes || '');
    } else {
      setDate(getTodayString());
      setCoffeeType('Robusta');
      setQuantity('');
      setSupplier('');
      setPurpose('');
      setCustomer('');
      setReturnReason('');
      setNotes('');
    }
    setErrorMsg('');
  }, [initialData, mode, type, isOpen]);

  // Hitung sisa stok tersedia untuk jenis kopi yang dipilih
  const currentAvailableStock = useMemo(() => {
    const calc = calculateStockForCoffeeType(
      coffeeType, 
      allTransactions, 
      mode === 'edit' && initialData ? initialData.id : undefined
    );
    return calc.sisa;
  }, [coffeeType, allTransactions, mode, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      setErrorMsg('Jumlah bahan baku harus lebih besar dari 0 kg.');
      return;
    }

    // Validasi Bahan Baku Keluar: tidak boleh melebihi sisa stok yang tersedia
    if (type === 'keluar') {
      if (parsedQty > currentAvailableStock) {
        setErrorMsg(
          `Jumlah keluar (${formatKg(parsedQty)}) melebihi sisa stok ${coffeeType} yang tersedia (${formatKg(currentAvailableStock)}). Harap sesuaikan jumlah atau catat bahan baku masuk terlebih dahulu.`
        );
        return;
      }
    }

    if (type === 'masuk' && !supplier.trim()) {
      setErrorMsg('Nama supplier wajib diisi.');
      return;
    }

    if (type === 'keluar' && !purpose.trim()) {
      setErrorMsg('Keperluan / Batch produksi wajib diisi.');
      return;
    }

    if (type === 'retur') {
      if (!customer.trim()) {
        setErrorMsg('Nama pembeli/pelanggan wajib diisi.');
        return;
      }
      if (!returnReason.trim()) {
        setErrorMsg('Alasan retur wajib diisi.');
        return;
      }
    }

    onSave({
      type,
      date,
      coffeeType,
      quantity: parsedQty,
      supplier: type === 'masuk' ? supplier.trim() : undefined,
      purpose: type === 'keluar' ? purpose.trim() : undefined,
      customer: type === 'retur' ? customer.trim() : undefined,
      returnReason: type === 'retur' ? returnReason.trim() : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const titles = {
    masuk: mode === 'edit' ? 'Edit Bahan Baku Masuk' : 'Tambah Bahan Baku Masuk',
    keluar: mode === 'edit' ? 'Edit Bahan Baku Keluar (Produksi)' : 'Tambah Bahan Baku Keluar (Produksi)',
    retur: mode === 'edit' ? 'Edit Retur Penjualan' : 'Tambah Retur Penjualan',
  };

  const icons = {
    masuk: <ArrowDownToLine className="w-5 h-5 text-emerald-600" />,
    keluar: <ArrowUpFromLine className="w-5 h-5 text-amber-700" />,
    retur: <RotateCcw className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#D7B899]/50 transition-all animate-in fade-in zoom-in-95 duration-200 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6F1] rounded-xl border border-[#D7B899]/40">
              {icons[type]}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#3E2723]">{titles[type]}</h3>
              <p className="text-xs text-stone-500">
                {type === 'masuk' && 'Pencatatan penerimaan biji kopi mentah dari pemasok'}
                {type === 'keluar' && 'Pengurangan stok untuk roasting atau proses produksi kopi'}
                {type === 'retur' && 'Penerimaan pengembalian barang dari pembeli (menambah stok)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner untuk Retur & Keluar */}
        {type === 'retur' && (
          <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Informasi Stok:</strong> Retur penjualan adalah barang yang dikembalikan pelanggan. Sisa stok fisik akan <strong>bertambah</strong> otomatis sesuai rumus pembukuan.
            </div>
          </div>
        )}

        {type === 'keluar' && (
          <div className={`mt-4 p-3.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            currentAvailableStock <= 0 
              ? 'bg-rose-50 border-rose-300 text-rose-900' 
              : 'bg-[#FAF6F1] border-[#D7B899] text-[#3E2723]'
          }`}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#6F4E37] shrink-0" />
              <span>Sisa Stok Tersedia ({coffeeType}):</span>
            </div>
            <span className="font-bold text-sm text-[#6F4E37]">
              {formatKg(currentAvailableStock)}
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
              />
            </div>

            {/* Jenis Kopi */}
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Jenis Biji Kopi <span className="text-rose-500">*</span>
              </label>
              <select
                value={coffeeType}
                onChange={(e) => setCoffeeType(e.target.value as CoffeeType)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
              >
                <option value="Robusta">Biji Kopi Robusta</option>
                <option value="Arabica">Biji Kopi Arabica</option>
                <option value="Excelsa">Biji Kopi Excelsa</option>
              </select>
            </div>
          </div>

          {/* Jumlah (kg) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#3E2723]">
                Jumlah Bahan Baku (kg) <span className="text-rose-500">*</span>
              </label>
              {type === 'keluar' && (
                <span className="text-[11px] text-stone-500">
                  Maksimal: {formatKg(currentAvailableStock)}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                placeholder="Contoh: 50 atau 125.5"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrorMsg('');
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 bg-stone-50/50 ${
                  type === 'keluar' && parseFloat(quantity) > currentAvailableStock
                    ? 'border-rose-400 focus:ring-rose-500 text-rose-900'
                    : 'border-stone-300 focus:ring-[#6F4E37]'
                }`}
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-stone-500">kg</span>
            </div>
          </div>

          {/* Kolom Khusus per Tipe */}
          {type === 'masuk' && (
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Nama Supplier / Petani <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Koperasi Tani Sindoro Temanggung"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
              />
            </div>
          )}

          {type === 'keluar' && (
            <div>
              <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                Keperluan / Batch Produksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Batch Roasting #RB-103 Espresso Blend"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
              />
            </div>
          )}

          {type === 'retur' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Nama Pembeli / Pelanggan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cafe Sudut Temu / Roastery Mandiri"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
                  Alasan Retur <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Salah kirim varian / Kelebihan kuota pesanan"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
                />
              </div>
            </>
          )}

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-[#3E2723] mb-1.5">
              Catatan Tambahan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Catatan kondisi kadar air, nomor karung, atau spesifikasi lain..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#6F4E37] text-sm bg-stone-50/50"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#6F4E37] hover:bg-[#3E2723] shadow-md transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {mode === 'edit' ? 'Simpan Perubahan' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
