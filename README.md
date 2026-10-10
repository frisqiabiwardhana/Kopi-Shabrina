# Monitoring Stok Produksi Kopi

Aplikasi web modern untuk pencatatan dan monitoring stok bahan baku biji kopi (Robusta, Arabica, Excelsa). Dilengkapi mutasi stok masuk, keluar produksi, retur penjualan, dashboard analitik, dan cetak pembukuan otomatis (kartu stok) standar A4.

## 🌿 Jenis Bahan Baku Kopi
1. **Biji Kopi Robusta** (kg)
2. **Biji Kopi Arabica** (kg)
3. **Biji Kopi Excelsa** (kg)

## 📐 Rumus Stok
$$\text{Sisa Stok} = \text{Total Masuk} - \text{Total Keluar} + \text{Total Retur Penjualan}$$
*Catatan:* **Retur penjualan** adalah barang yang dikembalikan oleh pelanggan/pembeli, sehingga menambah kembali stok fisik yang tersedia.

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Pastikan Node.js terinstal** (v18+ direkomendasikan).
2. **Install dependensi:**
   ```bash
   npm install
   ```
3. **Jalankan dev server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

4. **Build untuk produksi:**
   ```bash
   npm run build
   ```
   Output file statis akan berada di folder `dist/`.

---

## ☁️ Cara Deploy ke Vercel

Aplikasi ini murni frontend statis (SPA React + Vite) tanpa backend atau API key, sehingga sangat cepat dan mudah di-deploy ke Vercel:

1. **Push repository ke GitHub / GitLab / Bitbucket.**
2. Buka dashboard [Vercel](https://vercel.com/) dan klik **"Add New Project"** -> **"Import"**.
3. Vercel akan otomatis mendeteksi framework:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. File `vercel.json` sudah disediakan di root direktori untuk menangani routing SPA (single-page application).
5. Klik **Deploy**. Selesai!

---

## 🛠️ Fitur Utama
- **Dashboard Ringkasan:** Kartu sisa stok per jenis kopi, total keseluruhan, mutasi bulan ini, grafik pergerakan stok, dan peringatan stok menipis (ambang batas dapat dikonfigurasi).
- **Bahan Baku Masuk:** Catat penerimaan biji kopi dari supplier lengkap dengan tanggal, jumlah kg, supplier, dan catatan.
- **Bahan Baku Keluar:** Catat pemakaian untuk batch roasting / produksi dengan validasi ketat (tidak bisa melebihi sisa stok).
- **Retur Penjualan:** Catat retur dari pelanggan beserta alasan pengembalian (menambah sisa stok secara otomatis).
- **Stok Tersedia:** Pemantauan real-time sisa stok per varian dengan filter rentang tanggal.
- **Cetak Pembukuan (Buku Stok / Kartu Stok):** Format laporan akuntansi bersih siap cetak A4 (`window.print()`), filter tanggal & varian kopi, saldo berjalan, ringkasan saldo awal/akhir, dan tombol Export CSV.
- **Data Persistence:** Disimpan di `localStorage` melalui modul terisolasi `src/lib/storage.ts` lengkap dengan data simulasi awal (seed) dan tombol Reset Data.
