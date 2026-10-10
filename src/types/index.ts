export type CoffeeType = 'Robusta' | 'Arabica' | 'Excelsa';

export type TransactionType = 'masuk' | 'keluar' | 'retur';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  coffeeType: CoffeeType;
  quantity: number; // in kg
  supplier?: string; // Untuk barang masuk
  purpose?: string; // Keperluan / batch produksi untuk barang keluar
  customer?: string; // Nama pembeli/pelanggan untuk retur penjualan
  returnReason?: string; // Alasan retur
  notes?: string; // Catatan tambahan
  createdAt: string; // ISO string
}

export interface StockThresholds {
  Robusta: number;
  Arabica: number;
  Excelsa: number;
}

export interface StockSummary {
  coffeeType: CoffeeType;
  totalMasuk: number;
  totalKeluar: number;
  totalRetur: number;
  sisaStok: number; // Masuk - Keluar + Retur
  minThreshold: number;
  isLowStock: boolean;
}

export type PageTab = 
  | 'dashboard' 
  | 'masuk' 
  | 'keluar' 
  | 'retur' 
  | 'stok' 
  | 'pembukuan';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export const COFFEE_INFO: Record<CoffeeType, { name: string; shortDesc: string; color: string; badgeBg: string; badgeText: string }> = {
  Robusta: {
    name: 'Biji Kopi Robusta',
    shortDesc: 'Karakter rasa pekat, kafein tinggi, aroma earthy & cokelat pahit.',
    color: '#8D5B4C',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900 border-amber-300',
  },
  Arabica: {
    name: 'Biji Kopi Arabica',
    shortDesc: 'Karakter rasa kompleks, keasaman segar, aroma bunga & buah.',
    color: '#5C3D2E',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900 border-emerald-300',
  },
  Excelsa: {
    name: 'Biji Kopi Excelsa',
    shortDesc: 'Karakter unik tart, fruity, smoky, aroma eksotis memikat.',
    color: '#A97155',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900 border-purple-300',
  },
};
