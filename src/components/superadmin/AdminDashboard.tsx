import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Merchant } from '../../types';
import { MerchantFormModal } from './MerchantFormModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Building2, 
  UserCheck, 
  UserX, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Phone, 
  MapPin, 
  Users,
  Download
} from '../common/Icons';

const ADMIN_BACKUP_KEY = 'soni_admin_backup_count';

export const AdminDashboard: React.FC = () => {
  const { 
    merchants, 
    customers,
    ledgerEntries,
    analytics, 
    addMerchant, 
    updateMerchant, 
    removeMerchant, 
    toggleSubscription 
  } = useData();

  const getShopBackupCount = (merchantId: string): number => {
    try {
      const stored = localStorage.getItem(`${ADMIN_BACKUP_KEY}_${merchantId}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch { return 0; }
  };

  const incrementShopBackupCount = (merchantId: string, current: number) => {
    try {
      localStorage.setItem(`${ADMIN_BACKUP_KEY}_${merchantId}`, String(current + 1));
    } catch {}
  };

  const handleAdminDownloadBackup = (merchant: Merchant) => {
    try {
      const merchantCustomers = customers.filter(c => c.merchantId === merchant.id);
      const merchantEntries = ledgerEntries.filter(e => e.merchantId === merchant.id);
      const backupIndex = getShopBackupCount(merchant.id) + 1;

      const backupPayload = {
        backupVersion: '1.0',
        backupType: 'admin_export',
        exportedAt: new Date().toISOString(),
        backupIndex,
        merchantId: merchant.id,
        merchant,
        customers: merchantCustomers,
        ledgerEntries: merchantEntries
      };

      const jsonString = JSON.stringify(backupPayload);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      // Sanitize shop name for filename
      const safeName = merchant.tenantConfig.shopName.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_').slice(0, 40);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}(${backupIndex}).json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      incrementShopBackupCount(merchant.id, backupIndex - 1);
    } catch (err) {
      console.error('Admin backup download failed:', err);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [deletingMerchantId, setDeletingMerchantId] = useState<string | null>(null);

  const filteredMerchants = merchants.filter(m => 
    m.tenantConfig.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tenantConfig.phone.includes(searchQuery)
  );

  const handleOpenAddModal = () => {
    setEditingMerchant(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setIsModalOpen(true);
  };

  const handleSaveMerchant = (merchantData: Omit<Merchant, 'id' | 'createdAt'>) => {
    if (editingMerchant) {
      updateMerchant({
        ...editingMerchant,
        ...merchantData
      });
    } else {
      addMerchant(merchantData);
    }
  };

  const handleConfirmDeleteMerchant = () => {
    if (deletingMerchantId) {
      removeMerchant(deletingMerchantId);
      setDeletingMerchantId(null);
    }
  };

  return (
    <div className="w-full max-w-full lg:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 animate-fade-in pb-20">
      
      {/* 1. COMPACT 4-CARD ANALYTICS GRID (2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        
        {/* Total Merchants */}
        <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Merchants</span>
          <div className="flex items-center justify-between my-1">
            <h3 className="text-lg sm:text-2xl font-black text-purple-950">{analytics.totalMerchants}</h3>
            <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
          </div>
          <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded w-max">Registered</span>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Active SaaS</span>
          <div className="flex items-center justify-between my-1">
            <h3 className="text-lg sm:text-2xl font-black text-emerald-600">{analytics.activeSubscriptions}</h3>
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-max">Live Active</span>
        </div>

        {/* Locked Subscriptions */}
        <div className="bg-white p-3 rounded-xl border border-red-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Locked SaaS</span>
          <div className="flex items-center justify-between my-1">
            <h3 className="text-lg sm:text-2xl font-black text-red-600">{analytics.inactiveSubscriptions}</h3>
            <UserX className="w-4 h-4 text-red-600 shrink-0" />
          </div>
          <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded w-max">Disabled</span>
        </div>

        {/* SaaS Customers */}
        <div className="bg-white p-3 rounded-xl border border-indigo-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">SaaS Customers</span>
          <div className="flex items-center justify-between my-1">
            <h3 className="text-lg sm:text-2xl font-black text-indigo-900">{analytics.totalCustomers}</h3>
            <Users className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-max">Total Users</span>
        </div>

      </div>

      {/* 2. SEARCH & ADD MERCHANT CONTROLS */}
      <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs flex items-center justify-between gap-2">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shop, username, or phone..."
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm font-semibold text-gray-800"
          />
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-3 py-2 bg-purple-950 hover:bg-purple-900 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>+ Merchant</span>
        </button>

      </div>

      {/* 3. MOBILE-RESPONSIVE MERCHANT DIRECTORY CARDS */}
      <div className="bg-white rounded-xl border border-purple-200 shadow-2xs p-3.5 space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
            SaaS Merchants ({filteredMerchants.length})
          </h3>
        </div>

        {filteredMerchants.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-xs font-semibold">No merchant accounts registered</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-2 px-3 py-1.5 bg-purple-950 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              + Create Merchant Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.id}
                className="bg-gray-50/70 p-3 rounded-xl border border-gray-200 space-y-2 hover:border-purple-300 transition-colors"
              >
                {/* Top Row: Shop Logo, Name, Username, Lock Status */}
                <div className="flex items-start justify-between gap-2">
                  
                  <div className="flex items-center space-x-2.5 min-w-0">
                    {merchant.tenantConfig.logoUrl ? (
                      <img
                        src={merchant.tenantConfig.logoUrl}
                        alt={merchant.tenantConfig.shopName}
                        className="w-10 h-10 rounded-lg object-cover border border-purple-300 shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-purple-950 text-purple-200 flex items-center justify-center font-bold text-base shrink-0">
                        卐
                      </div>
                    )}
                    
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                        {merchant.tenantConfig.shopName}
                      </h4>
                      <p className="text-[11px] text-purple-900 font-mono font-bold flex items-center gap-1">
                        <span>User:</span>
                        <code className="bg-purple-100 px-1 py-0.2 rounded text-purple-900">
                          {merchant.username}
                        </code>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {merchant.subscriptionActive ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-extrabold border border-red-200 shrink-0">
                      <XCircle className="w-3 h-3 text-red-600" /> Locked
                    </span>
                  )}

                </div>

                {/* Bottom Row: Phone & 1-Tap Control Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/80 text-xs">
                  <p className="text-[11px] text-gray-600 font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{merchant.tenantConfig.phone}</span>
                  </p>

                  <div className="flex items-center space-x-1.5">
                    {/* Toggle SaaS Lock */}
                    <button
                      onClick={() => toggleSubscription(merchant.id, !merchant.subscriptionActive)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all shadow-2xs ${
                        merchant.subscriptionActive
                          ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-200'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {merchant.subscriptionActive ? 'Lock' : 'Unlock'}
                    </button>

                    {/* Download Backup */}
                    <button
                      onClick={() => handleAdminDownloadBackup(merchant)}
                      className="p-1.5 bg-white border border-gray-300 text-gray-700 hover:text-green-700 hover:border-green-400 rounded-lg shadow-2xs transition-colors"
                      title={`Download Backup for ${merchant.tenantConfig.shopName}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit Merchant */}
                    <button
                      onClick={() => handleOpenEditModal(merchant)}
                      className="p-1.5 bg-white border border-gray-300 text-gray-700 hover:text-purple-900 rounded-lg shadow-2xs"
                      title="Edit Merchant"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Merchant */}
                    <button
                      onClick={() => setDeletingMerchantId(merchant.id)}
                      className="p-1.5 bg-white border border-gray-300 text-gray-700 hover:text-red-600 rounded-lg shadow-2xs"
                      title="Delete Merchant Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merchant Form Modal */}
      <MerchantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMerchant}
        initialMerchant={editingMerchant}
      />

      {/* CONFIRM DELETE MERCHANT MODAL */}
      <ConfirmModal
        isOpen={!!deletingMerchantId}
        onClose={() => setDeletingMerchantId(null)}
        onConfirm={handleConfirmDeleteMerchant}
        title="Confirm Delete Merchant Account"
        message="Are you sure you want to permanently delete this merchant account and all their customer ledgers? This action cannot be undone."
        confirmText="Permanently Delete Merchant"
        type="delete"
      />

    </div>
  );
};
