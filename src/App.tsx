import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CoffeeType, 
  PageTab, 
  StockThresholds, 
  ToastMessage, 
  Transaction, 
  TransactionType 
} from './types';
import { 
  getTransactions, 
  getThresholds, 
  saveThresholds, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  resetToSeedData, 
  calculateStockSummaries 
} from './lib/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ThresholdModal } from './components/ThresholdModal';
import { TransactionModal } from './components/TransactionModal';
import { DashboardPage } from './pages/DashboardPage';
import { MasukPage } from './pages/MasukPage';
import { KeluarPage } from './pages/KeluarPage';
import { ReturPage } from './pages/ReturPage';
import { StokTersediaPage } from './pages/StokTersediaPage';
import { PembukuanPage } from './pages/PembukuanPage';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<PageTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // App Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [thresholds, setThresholds] = useState<StockThresholds>(getThresholds());

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add/Edit Transaction Modal State
  const [trxModalOpen, setTrxModalOpen] = useState<boolean>(false);
  const [trxModalMode, setTrxModalMode] = useState<'add' | 'edit'>('add');
  const [trxModalType, setTrxModalType] = useState<TransactionType>('masuk');
  const [selectedTrxForEdit, setSelectedTrxForEdit] = useState<Transaction | null>(null);

  // Threshold Modal State
  const [thresholdModalOpen, setThresholdModalOpen] = useState<boolean>(false);

  // Delete & Reset Confirm Modals
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);

  // Load Initial Data
  useEffect(() => {
    const loadedTrx = getTransactions();
    const loadedThresholds = getThresholds();
    setTransactions(loadedTrx);
    setThresholds(loadedThresholds);
  }, []);

  // Helper Toast Notification
  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Calculate stock summaries (sisa stok, low stock alert)
  const summaries = useMemo(() => {
    return calculateStockSummaries(transactions, thresholds);
  }, [transactions, thresholds]);

  const hasLowStockAlert = useMemo(() => {
    return Object.values(summaries).some((s) => s.isLowStock);
  }, [summaries]);

  // Open Modal for Add
  const handleOpenAddModal = (type: TransactionType) => {
    setTrxModalMode('add');
    setTrxModalType(type);
    setSelectedTrxForEdit(null);
    setTrxModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (trx: Transaction) => {
    setTrxModalMode('edit');
    setTrxModalType(trx.type);
    setSelectedTrxForEdit(trx);
    setTrxModalOpen(true);
  };

  // Save Transaction (Add or Edit)
  const handleSaveTransaction = (formData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (trxModalMode === 'edit' && selectedTrxForEdit) {
      updateTransaction(selectedTrxForEdit.id, formData);
      setTransactions(getTransactions());
      showToast('success', 'Transaksi berhasil diperbarui.');
    } else {
      addTransaction(formData);
      setTransactions(getTransactions());
      const label = formData.type === 'masuk' ? 'Bahan baku masuk' : formData.type === 'keluar' ? 'Bahan baku keluar' : 'Retur penjualan';
      showToast('success', `${label} berhasil dicatat.`);
    }
    setTrxModalOpen(false);
  };

  // Quick Add handler from inline forms
  const handleQuickAdd = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(data);
    setTransactions(getTransactions());
    const label = data.type === 'masuk' ? 'Bahan baku masuk' : data.type === 'keluar' ? 'Bahan baku keluar' : 'Retur penjualan';
    showToast('success', `${label} berhasil ditambahkan ke stok.`);
  };

  // Confirm and Execute Delete
  const handlePromptDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteTransaction(deleteConfirmId);
    setTransactions(getTransactions());
    setDeleteConfirmId(null);
    showToast('success', 'Transaksi berhasil dihapus dari sistem.');
  };

  // Save Threshold Settings
  const handleSaveThresholds = (newThresholds: StockThresholds) => {
    saveThresholds(newThresholds);
    setThresholds(newThresholds);
    setThresholdModalOpen(false);
    showToast('success', 'Batas minimum stok berhasil diperbarui.');
  };

  // Reset to Seed Data
  const handleConfirmResetData = () => {
    resetToSeedData();
    setTransactions(getTransactions());
    setThresholds(getThresholds());
    setResetConfirmOpen(false);
    showToast('info', 'Data berhasil dikembalikan ke data simulasi default.');
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] flex flex-col antialiased selection:bg-[#D7B899] selection:text-[#3E2723]">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        hasLowStockAlert={hasLowStockAlert}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-68 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenThresholdModal={() => setThresholdModalOpen(true)}
          onOpenResetConfirm={() => setResetConfirmOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              transactions={transactions}
              summaries={summaries}
              thresholds={thresholds}
              onNavigate={setActiveTab}
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleOpenEditModal}
              onDeleteTransaction={handlePromptDelete}
              onOpenThresholdModal={() => setThresholdModalOpen(true)}
            />
          )}

          {activeTab === 'masuk' && (
            <MasukPage
              transactions={transactions}
              onOpenAddModal={() => handleOpenAddModal('masuk')}
              onEditTransaction={handleOpenEditModal}
              onDeleteTransaction={handlePromptDelete}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {activeTab === 'keluar' && (
            <KeluarPage
              transactions={transactions}
              onOpenAddModal={() => handleOpenAddModal('keluar')}
              onEditTransaction={handleOpenEditModal}
              onDeleteTransaction={handlePromptDelete}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {activeTab === 'retur' && (
            <ReturPage
              transactions={transactions}
              onOpenAddModal={() => handleOpenAddModal('retur')}
              onEditTransaction={handleOpenEditModal}
              onDeleteTransaction={handlePromptDelete}
              onQuickAdd={handleQuickAdd}
            />
          )}

          {activeTab === 'stok' && (
            <StokTersediaPage
              transactions={transactions}
              thresholds={thresholds}
              onOpenThresholdModal={() => setThresholdModalOpen(true)}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {activeTab === 'pembukuan' && (
            <PembukuanPage transactions={transactions} />
          )}
        </main>
      </div>

      {/* Modal: Input / Edit Mutasi */}
      <TransactionModal
        isOpen={trxModalOpen}
        mode={trxModalMode}
        type={trxModalType}
        initialData={selectedTrxForEdit}
        allTransactions={transactions}
        onSave={handleSaveTransaction}
        onClose={() => setTrxModalOpen(false)}
      />

      {/* Modal: Batas Minimum Stok */}
      <ThresholdModal
        isOpen={thresholdModalOpen}
        thresholds={thresholds}
        onSave={handleSaveThresholds}
        onClose={() => setThresholdModalOpen(false)}
      />

      {/* Modal: Konfirmasi Hapus Transaksi */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        title="Hapus Transaksi Stok?"
        message="Data transaksi ini akan dihapus secara permanen dari mutasi persediaan. Saldo sisa stok akan dihitung ulang secara otomatis."
        confirmLabel="Ya, Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />

      {/* Modal: Konfirmasi Reset Data Contoh */}
      <ConfirmModal
        isOpen={resetConfirmOpen}
        title="Kembalikan ke Data Contoh?"
        message="Seluruh data transaksi dan pengaturan batas stok saat ini akan ditimpa dengan data simulasi awal (seed). Anda yakin ingin melanjutkan?"
        confirmLabel="Ya, Reset Data"
        cancelLabel="Batal"
        isDestructive={false}
        onConfirm={handleConfirmResetData}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
