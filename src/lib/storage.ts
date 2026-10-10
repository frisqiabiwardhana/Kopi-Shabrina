import { CoffeeType, StockSummary, StockThresholds, Transaction } from '../types';

const STORAGE_KEY_TRANSACTIONS = 'kopi_monitoring_transaksi_v1';
const STORAGE_KEY_THRESHOLDS = 'kopi_monitoring_thresholds_v1';

export const DEFAULT_THRESHOLDS: StockThresholds = {
  Robusta: 150, // Batas minimum Robusta (kg)
  Arabica: 100, // Batas minimum Arabica (kg)
  Excelsa: 50,  // Batas minimum Excelsa (kg)
};

/**
 * Data awal simulasi (seed) transaksi biji kopi
 * Termasuk mutasi masuk dari supplier, keluar untuk roasting/produksi, dan retur penjualan.
 */
export const SEED_TRANSACTIONS: Transaction[] = [
  // Robusta
  {
    id: 'seed-01',
    type: 'masuk',
    date: '2026-09-28',
    coffeeType: 'Robusta',
    quantity: 500,
    supplier: 'Koperasi Tani Sindoro Temanggung',
    notes: 'Kadar air 12%, grade A, kemasan karung goni 50kg',
    createdAt: '2026-09-28T08:30:00.000Z',
  },
  {
    id: 'seed-02',
    type: 'masuk',
    date: '2026-10-02',
    coffeeType: 'Robusta',
    quantity: 350,
    supplier: 'CV Kopi Nusantara Mandiri',
    notes: 'Pengiriman batch awal bulan Oktober',
    createdAt: '2026-10-02T09:15:00.000Z',
  },
  {
    id: 'seed-03',
    type: 'keluar',
    date: '2026-10-04',
    coffeeType: 'Robusta',
    quantity: 200,
    purpose: 'Batch Roasting #RB-101 Espresso Blend',
    notes: 'Profil sangrai Dark Roast untuk resto & warung mitra',
    createdAt: '2026-10-04T13:45:00.000Z',
  },
  {
    id: 'seed-04',
    type: 'keluar',
    date: '2026-10-06',
    coffeeType: 'Robusta',
    quantity: 150,
    purpose: 'Batch Roasting #RB-102 Cold Brew Blend',
    notes: 'Profil Medium-Dark untuk cold brew kemasan botol',
    createdAt: '2026-10-06T10:00:00.000Z',
  },
  {
    id: 'seed-05',
    type: 'retur',
    date: '2026-10-07',
    coffeeType: 'Robusta',
    quantity: 25,
    customer: 'Cafe Sudut Temu',
    returnReason: 'Kelebihan order konsinyasi mingguan',
    notes: 'Segel karung masih utuh dan lolos QC pengecekan ulang',
    createdAt: '2026-10-07T15:20:00.000Z',
  },

  // Arabica
  {
    id: 'seed-06',
    type: 'masuk',
    date: '2026-09-25',
    coffeeType: 'Arabica',
    quantity: 400,
    supplier: 'Kelompok Tani Dataran Gayo',
    notes: 'Arabica Gayo Wet Hulled, proses semi-washed, moisture 11.5%',
    createdAt: '2026-09-25T07:45:00.000Z',
  },
  {
    id: 'seed-07',
    type: 'masuk',
    date: '2026-10-03',
    coffeeType: 'Arabica',
    quantity: 300,
    supplier: 'Petani Lereng Gunung Ijen',
    notes: 'Arabica Ijen Natural Process, aroma buah manis',
    createdAt: '2026-10-03T11:30:00.000Z',
  },
  {
    id: 'seed-08',
    type: 'keluar',
    date: '2026-10-05',
    coffeeType: 'Arabica',
    quantity: 180,
    purpose: 'Produksi Single Origin Filter Drip #AR-201',
    notes: 'Roast level Light-to-Medium untuk filter coffee',
    createdAt: '2026-10-05T14:10:00.000Z',
  },
  {
    id: 'seed-09',
    type: 'keluar',
    date: '2026-10-08',
    coffeeType: 'Arabica',
    quantity: 120,
    purpose: 'House Blend Signature Roastery #HB-05',
    notes: 'Campuran 60% Arabica Gayo + 40% Ijen',
    createdAt: '2026-10-08T09:00:00.000Z',
  },
  {
    id: 'seed-10',
    type: 'retur',
    date: '2026-10-08',
    coffeeType: 'Arabica',
    quantity: 15,
    customer: 'Roastery Kopi Senja',
    returnReason: 'Salah pesan varian (pelanggan memesan natural, terkirim wash)',
    notes: 'Kondisi biji kopi masih segar dan disimpan kembali ke gudang bahan baku',
    createdAt: '2026-10-08T16:00:00.000Z',
  },

  // Excelsa
  {
    id: 'seed-11',
    type: 'masuk',
    date: '2026-09-20',
    coffeeType: 'Excelsa',
    quantity: 180,
    supplier: 'Perkebunan Kopi Wonosalam Jombang',
    notes: 'Excelsa Honey Process, biji berukuran besar, aroma fruity tart',
    createdAt: '2026-09-20T10:00:00.000Z',
  },
  {
    id: 'seed-12',
    type: 'keluar',
    date: '2026-10-04',
    coffeeType: 'Excelsa',
    quantity: 90,
    purpose: 'Eksperimen Produksi Blend Unik #EX-01',
    notes: 'Penambahan notes nangka dan tart fruity ke blend',
    createdAt: '2026-10-04T16:30:00.000Z',
  },
  {
    id: 'seed-13',
    type: 'masuk',
    date: '2026-10-07',
    coffeeType: 'Excelsa',
    quantity: 80,
    supplier: 'Perkebunan Kopi Wonosalam Jombang',
    notes: 'Restock batch kedua panen akhir musim',
    createdAt: '2026-10-07T11:15:00.000Z',
  },
  {
    id: 'seed-14',
    type: 'keluar',
    date: '2026-10-09',
    coffeeType: 'Excelsa',
    quantity: 50,
    purpose: 'Kemasan Khusus Single Origin Excelsa 250g',
    notes: 'Produksi batch terbatas 200 pouch',
    createdAt: '2026-10-09T08:30:00.000Z',
  },
  {
    id: 'seed-15',
    type: 'retur',
    date: '2026-10-09',
    coffeeType: 'Excelsa',
    quantity: 10,
    customer: 'Kedai Seduh Manual Bar',
    returnReason: 'Penundaan acara festival kopi',
    notes: 'Bahan baku belum diproses, kemasan tersegel',
    createdAt: '2026-10-09T14:40:00.000Z',
  },
];

/**
 * Membaca semua transaksi dari localStorage.
 * Mengembalikan seed data jika belum pernah ada data tersimpan.
 */
export function getTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      // Inisialisasi seed data
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
      return [...SEED_TRANSACTIONS];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...SEED_TRANSACTIONS];
    }
    return parsed;
  } catch (error) {
    console.error('Gagal membaca data transaksi dari localStorage:', error);
    return [...SEED_TRANSACTIONS];
  }
}

/**
 * Menyimpan seluruh array transaksi ke localStorage
 */
export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Gagal menyimpan data transaksi ke localStorage:', error);
  }
}

/**
 * Menambahkan transaksi baru
 */
export function addTransaction(
  trx: Omit<Transaction, 'id' | 'createdAt'>
): Transaction {
  const current = getTransactions();
  const newTransaction: Transaction = {
    ...trx,
    id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newTransaction, ...current];
  saveTransactions(updated);
  return newTransaction;
}

/**
 * Mengubah transaksi yang sudah ada
 */
export function updateTransaction(
  id: string,
  updatedData: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): boolean {
  const current = getTransactions();
  const index = current.findIndex(t => t.id === id);
  if (index === -1) return false;

  current[index] = {
    ...current[index],
    ...updatedData,
  };

  saveTransactions(current);
  return true;
}

/**
 * Menghapus transaksi berdasarkan ID
 */
export function deleteTransaction(id: string): boolean {
  const current = getTransactions();
  const filtered = current.filter(t => t.id !== id);
  if (filtered.length === current.length) return false;

  saveTransactions(filtered);
  return true;
}

/**
 * Mengambil konfigurasi batas minimum stok
 */
export function getThresholds(): StockThresholds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THRESHOLDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(DEFAULT_THRESHOLDS));
      return { ...DEFAULT_THRESHOLDS };
    }
    return { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) };
  } catch (error) {
    console.error('Gagal membaca thresholds dari localStorage:', error);
    return { ...DEFAULT_THRESHOLDS };
  }
}

/**
 * Menyimpan konfigurasi batas minimum stok
 */
export function saveThresholds(thresholds: StockThresholds): void {
  try {
    localStorage.setItem(STORAGE_KEY_THRESHOLDS, JSON.stringify(thresholds));
  } catch (error) {
    console.error('Gagal menyimpan thresholds:', error);
  }
}

/**
 * Mengembalikan data ke data contoh (Seed)
 */
export function resetToSeedData(): void {
  saveTransactions([...SEED_TRANSACTIONS]);
  saveThresholds({ ...DEFAULT_THRESHOLDS });
}

/**
 * Menghapus seluruh data (kosongkan)
 */
export function clearAllData(): void {
  saveTransactions([]);
}

/**
 * RUMUS STOK UTAMA:
 * Sisa stok = total bahan baku masuk - total bahan baku keluar + total retur penjualan.
 *
 * Menghitung stok saat ini untuk 1 jenis kopi tertentu.
 * Jika excludeTransactionId disertakan (misal saat edit transaksi keluar),
 * transaksi tersebut tidak dihitung dalam sisa stok dasar.
 */
export function calculateStockForCoffeeType(
  coffeeType: CoffeeType,
  transactions: Transaction[],
  excludeTransactionId?: string
): { masuk: number; keluar: number; retur: number; sisa: number } {
  let masuk = 0;
  let keluar = 0;
  let retur = 0;

  for (const trx of transactions) {
    if (excludeTransactionId && trx.id === excludeTransactionId) {
      continue;
    }
    if (trx.coffeeType === coffeeType) {
      if (trx.type === 'masuk') {
        masuk += trx.quantity;
      } else if (trx.type === 'keluar') {
        keluar += trx.quantity;
      } else if (trx.type === 'retur') {
        retur += trx.quantity;
      }
    }
  }

  const sisa = masuk - keluar + retur;
  return { masuk, keluar, retur, sisa };
}

/**
 * Menghitung ringkasan stok untuk semua jenis kopi
 */
export function calculateStockSummaries(
  transactions: Transaction[],
  thresholds: StockThresholds
): Record<CoffeeType, StockSummary> {
  const types: CoffeeType[] = ['Robusta', 'Arabica', 'Excelsa'];
  const result = {} as Record<CoffeeType, StockSummary>;

  for (const type of types) {
    const calc = calculateStockForCoffeeType(type, transactions);
    const minThreshold = thresholds[type] ?? DEFAULT_THRESHOLDS[type];
    result[type] = {
      coffeeType: type,
      totalMasuk: calc.masuk,
      totalKeluar: calc.keluar,
      totalRetur: calc.retur,
      sisaStok: calc.sisa,
      minThreshold,
      isLowStock: calc.sisa <= minThreshold,
    };
  }

  return result;
}
