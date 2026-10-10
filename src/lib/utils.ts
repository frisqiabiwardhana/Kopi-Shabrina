import { CoffeeType, Transaction } from '../types';

/**
 * Format angka dalam standar desimal dan ribuan Indonesia (contoh: 1.250,5 kg)
 */
export function formatKg(num: number, withUnit = true): string {
  if (isNaN(num) || num === null || num === undefined) {
    return withUnit ? '0 kg' : '0';
  }

  // Format ke ribuan titik dan desimal koma (maks 2 digit desimal)
  const isInteger = Math.round(num * 100) % 100 === 0;
  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: isInteger ? 0 : 1,
    maximumFractionDigits: 2,
  }).format(num);

  return withUnit ? `${formatted} kg` : formatted;
}

/**
 * Format tanggal standar Indonesia (contoh: 11 Oktober 2026)
 */
export function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    // Tangani format YYYY-MM-DD agar tidak terkena offset timezone UTC
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, monthIndex, day);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Format tanggal ringkas (contoh: 11/10/2026)
 */
export function formatTanggalSingkat(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Dapatkan tanggal hari ini dalam format YYYY-MM-DD (lokal)
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate unique ID acak
 */
export function generateId(prefix = 'trx'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Ekspor data ke CSV dengan encoding UTF-8 BOM agar rapi di Microsoft Excel & Google Sheets
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const processCell = (cell: string | number): string => {
    const str = cell === null || cell === undefined ? '' : String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent = [
    headers.map(processCell).join(';'),
    ...rows.map(row => row.map(processCell).join(';'))
  ].join('\r\n');

  // Tambahkan UTF-8 BOM (\uFEFF)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Dapatkan nama lengkap jenis kopi
 */
export function getCoffeeFullName(type: CoffeeType): string {
  switch (type) {
    case 'Robusta':
      return 'Biji Kopi Robusta';
    case 'Arabica':
      return 'Biji Kopi Arabica';
    case 'Excelsa':
      return 'Biji Kopi Excelsa';
    default:
      return type;
  }
}
