import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ArrowLeft, HardDrive, Download, Package } from '../common/Icons';
import { BuildingStage } from '../common/BuildingStage';

interface MerchantSettingsProps {
  onBack: () => void;
}

const BACKUP_COUNTER_KEY = 'soni_merchant_backup_count';

export const MerchantSettings: React.FC<MerchantSettingsProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { merchants, customers, ledgerEntries } = useData();
  const { t, language } = useLanguage();
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastDownloaded, setLastDownloaded] = useState<string | null>(null);

  const merchantId = user?.merchantId;
  const currentMerchant = merchants.find(m => m.id === merchantId) || user?.merchant;

  // Get current backup index from localStorage
  const getBackupCount = (): number => {
    try {
      const stored = localStorage.getItem(`${BACKUP_COUNTER_KEY}_${merchantId}`);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  };

  const incrementBackupCount = (current: number) => {
    try {
      localStorage.setItem(`${BACKUP_COUNTER_KEY}_${merchantId}`, String(current + 1));
    } catch {}
  };

  const handleDownloadBackup = () => {
    if (!currentMerchant || !merchantId) return;
    setIsDownloading(true);

    try {
      // Gather this merchant's data
      const merchantCustomers = customers.filter(c => c.merchantId === merchantId);
      const merchantEntries = ledgerEntries.filter(e => e.merchantId === merchantId);

      const backupIndex = getBackupCount() + 1;

      const backupPayload = {
        backupVersion: '1.0',
        backupType: 'single_merchant',
        exportedAt: new Date().toISOString(),
        backupIndex,
        merchantId,
        merchant: currentMerchant,
        customers: merchantCustomers,
        ledgerEntries: merchantEntries
      };

      // Minified JSON = smallest size possible
      const jsonString = JSON.stringify(backupPayload);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `sonikhatabackup(${backupIndex}).json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      incrementBackupCount(backupIndex - 1);
      setLastDownloaded(`sonikhatabackup(${backupIndex}).json`);
    } catch (err) {
      console.error('Backup download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const [activeView, setActiveView] = useState<'menu' | 'backup' | 'stock'>('menu');
  const currentIndex = getBackupCount();

  // 1. BACK BUTTON HANDLER BASED ON CURRENT SUBVIEW
  const handleBackAction = () => {
    if (activeView === 'menu') {
      onBack();
    } else {
      setActiveView('menu');
    }
  };

  // 2. STOCK VIEW SUB-PAGE PLACEHOLDER
  const renderStockView = () => {
    return (
      <BuildingStage
        title={language === 'gu' ? 'સ્ટોક મેનેજમેન્ટ' : 'Stock Management'}
        onBack={() => setActiveView('menu')}
      />
    );
  };

  // 3. BACKUP VIEW SUB-PAGE
  const renderBackupView = () => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Card Header */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-gold-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white">{t('downloadBackup')}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Offline Data Security</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            {t('backupDesc')}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
              <p className="text-lg font-black text-gray-900">
                {customers.filter(c => c.merchantId === merchantId).length}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">{t('customers')}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2.5 text-center border border-gray-100">
              <p className="text-lg font-black text-gray-900">
                {ledgerEntries.filter(e => e.merchantId === merchantId).length}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">Entries</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2.5 text-center border border-amber-200">
              <p className="text-lg font-black text-amber-800">#{currentIndex + 1}</p>
              <p className="text-[10px] text-amber-700 font-semibold uppercase">{t('backupIndex')}</p>
            </div>
          </div>

          {/* File Name Preview */}
          <div className="bg-gray-900 rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-mono">Next file:</span>
            <span className="text-[11px] text-green-400 font-mono font-bold">
              sonikhatabackup({currentIndex + 1}).json
            </span>
          </div>

          {/* Success message */}
          {lastDownloaded && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[11px] text-green-700 font-semibold flex items-center gap-2">
              ✅ Downloaded: <span className="font-mono">{lastDownloaded}</span>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadBackup}
            disabled={isDownloading}
            className="w-full py-3 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 active:scale-95 text-white font-black text-sm shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Creating Backup...' : t('downloadBackup')}
          </button>

          <p className="text-[10px] text-gray-400 text-center">
            💡 Pehle backup lene ke baad, file Downloads folder me milegi.
          </p>
        </div>
      </div>
    );
  };

  // 4. MAIN FEATURES MENU VIEW (Portal page)
  const renderMenuView = () => {
    const showStock = currentMerchant?.tenantConfig.enableStock === true;

    return (
      <div className="space-y-4">
        {/* Menu title banner */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-2xs">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">કસ્ટમ ટુલ્સ (Custom Tools & Features)</h3>
          <p className="text-xs text-gray-500">Dukaan ke custom tools manage karne ke liye niche diye gaye option par click karein.</p>
        </div>

        {/* Features Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Feature 1: Data Backup */}
          <button
            onClick={() => setActiveView('backup')}
            className="bg-white hover:bg-purple-50/50 p-4 rounded-xl border border-gray-200 hover:border-purple-300 text-left transition-all active:scale-[0.99] flex items-start gap-3.5 group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-purple-900 transition-colors">
                ડેટા બેકઅપ (Data Backup)
              </h4>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-0.5">
                Apne customer ledger ka complete offline backup JSON format me download karein.
              </p>
            </div>
          </button>

          {/* Feature 2: Stock Management (Conditional Admin Switch) */}
          {showStock && (
            <button
              onClick={() => setActiveView('stock')}
              className="bg-white hover:bg-amber-50/50 p-4 rounded-xl border border-gray-200 hover:border-amber-300 text-left transition-all active:scale-[0.99] flex items-start gap-3.5 group shadow-2xs"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-amber-900 transition-colors">
                  સ્ટોક મેનેજમેન્ટ (Stock Management)
                </h4>
                <p className="text-[11px] text-gray-400 font-medium leading-relaxed mt-0.5">
                  Dukaan ke sone-chandi ke daagine (Ornaments) aur inventory track karein.
                </p>
              </div>
            </button>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full lg:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-4 animate-fade-in pb-20">

      {/* Dynamic Header */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs flex items-center gap-3">
        <button
          onClick={handleBackAction}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 transition-all font-bold text-xs flex items-center gap-1 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
          <span className="font-bold">
            {activeView === 'menu' ? t('backToDashboard') : (language === 'gu' ? 'પાછા જાઓ' : 'Back')}
          </span>
        </button>
        <div>
          <h2 className="text-sm font-bold text-gray-900 leading-tight">
            {activeView === 'menu' ? t('settings') : (activeView === 'backup' ? t('downloadBackup') : 'સ્ટોક મેનેજમેન્ટ (Stock)')}
          </h2>
          <p className="text-[11px] text-gray-400">{currentMerchant?.tenantConfig.shopName}</p>
        </div>
      </div>

      {/* Main viewport */}
      {activeView === 'menu' && renderMenuView()}
      {activeView === 'backup' && renderBackupView()}
      {activeView === 'stock' && renderStockView()}

    </div>
  );
};
