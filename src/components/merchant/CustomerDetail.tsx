import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Customer, LedgerEntry, TenantConfig } from '../../types';
import { calculateCustomerBalance, formatCurrency, formatDate, formatTime12Hr } from '../../utils/formatters';
import { LedgerEntryModal } from './LedgerEntryModal';
import { CustomerModal } from './CustomerModal';
import { BillGeneratorModal } from '../billing/BillGeneratorModal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Trash2, 
  Edit3, 
  Share2,
  Search,
  ChevronDown,
  CheckCircle2,
  X
} from '../common/Icons';
import { generateWhatsAppShareUrl } from '../../utils/exportUtils';

interface CustomerDetailProps {
  customer: Customer;
  merchantTenant: TenantConfig;
  entries: LedgerEntry[];
  onBack: () => void;
  onAddEntry: (data: Omit<LedgerEntry, 'id' | 'createdAt' | 'merchantId' | 'customerId'>) => void;
  onUpdateEntry: (entry: LedgerEntry) => void;
  onDeleteEntry: (id: string) => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  merchantTenant,
  entries,
  onBack,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onEditCustomer
}) => {
  const { toggleRokda, removeAllLedgerEntriesForCustomer } = useData();
  const { t, language } = useLanguage();

  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [showDeleteAllValidationError, setShowDeleteAllValidationError] = useState(false);
  const [showDeleteAllSuccess, setShowDeleteAllSuccess] = useState(false);

  const handleConfirmDeleteAll = async () => {
    // 1. Validate that total balance is exactly 0
    const isBalanceZero = balance.netMoney === 0 && balance.netGold === 0 && balance.netSilver === 0;
    if (!isBalanceZero) {
      setShowDeleteAllValidationError(true);
      return;
    }

    // 2. Delete all entries
    try {
      await removeAllLedgerEntriesForCustomer(customer.id, entries);
      setShowDeleteAllSuccess(true);
    } catch (e) {
      console.error('Error deleting entries:', e);
    }
  };

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LedgerEntry | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  // Search & Pagination States for Bulk Entry Management
  const [entrySearchQuery, setEntrySearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(15);

  // Asset Toggles set by Admin
  const isGoldEnabledByAdmin = merchantTenant.enableGold !== false;
  const isSilverEnabledByAdmin = merchantTenant.enableSilver !== false;

  // Confirm Modal States
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [pendingEntrySave, setPendingEntrySave] = useState<Omit<LedgerEntry, 'id' | 'createdAt' | 'merchantId' | 'customerId'> | null>(null);
  const [rokdaConfirmEntry, setRokdaConfirmEntry] = useState<LedgerEntry | null>(null);

  // Sort entries DESCENDING (Latest Date & Time First)
  const sortedEntries = [...entries].sort((a, b) => {
    const getTimestamp = (item: LedgerEntry) => {
      if (item.createdAt) return new Date(item.createdAt).getTime();
      return new Date(`${item.date}T${item.time || '00:00'}`).getTime();
    };
    return getTimestamp(b) - getTimestamp(a);
  });

  // Filter entries based on search query
  const filteredEntries = sortedEntries.filter(entry => 
    entry.description.toLowerCase().includes(entrySearchQuery.toLowerCase()) ||
    (entry.hastak && entry.hastak.toLowerCase().includes(entrySearchQuery.toLowerCase())) ||
    entry.date.includes(entrySearchQuery)
  );

  // Paginated list for smooth fast mobile rendering
  const paginatedEntries = filteredEntries.slice(0, visibleCount);

  // Balance excludes Rokda entries automatically (handled in calculateCustomerBalance)
  const balance = calculateCustomerBalance(entries);
  
  // Calculate specific totals for Udhar and Jama (excludes Rokda entries!)
  const activeEntriesForTotals = entries.filter(e => !e.isRokda);
  const totalMoneyUdhar = activeEntriesForTotals.reduce((sum, e) => sum + (e.moneyType === 'udhar' ? e.moneyAmount : 0), 0);
  const totalMoneyJama = activeEntriesForTotals.reduce((sum, e) => sum + (e.moneyType === 'jama' ? e.moneyAmount : 0), 0);

  const totalGoldUdhar = activeEntriesForTotals.reduce((sum, e) => sum + (e.goldType === 'udhar' ? e.goldWeightGrams : 0), 0);
  const totalGoldJama = activeEntriesForTotals.reduce((sum, e) => sum + (e.goldType === 'jama' ? e.goldWeightGrams : 0), 0);

  const totalSilverUdhar = activeEntriesForTotals.reduce((sum, e) => sum + (e.silverType === 'udhar' ? e.silverWeightGrams : 0), 0);
  const totalSilverJama = activeEntriesForTotals.reduce((sum, e) => sum + (e.silverType === 'jama' ? e.silverWeightGrams : 0), 0);

  const whatsappUrl = generateWhatsAppShareUrl(customer, merchantTenant, entries);

  // Check if historical entries exist for Gold or Silver
  const hasHistoricalGold = sortedEntries.some(e => e.goldWeightGrams > 0);
  const hasHistoricalSilver = sortedEntries.some(e => e.silverWeightGrams > 0);

  const showGoldCard = isGoldEnabledByAdmin || balance.netGold !== 0 || hasHistoricalGold;
  const showSilverCard = isSilverEnabledByAdmin || balance.netSilver !== 0 || hasHistoricalSilver;

  const handleOpenAddEntry = () => {
    setEditingEntry(null);
    setIsEntryModalOpen(true);
  };

  const handleOpenEditEntry = (entry: LedgerEntry) => {
    setEditingEntry(entry);
    setIsEntryModalOpen(true);
  };

  const handleSaveEntryAttempt = (data: Omit<LedgerEntry, 'id' | 'createdAt' | 'merchantId' | 'customerId'>) => {
    if (editingEntry) {
      setPendingEntrySave(data);
    } else {
      onAddEntry(data);
    }
  };

  const handleConfirmUpdateEntry = () => {
    if (editingEntry && pendingEntrySave) {
      onUpdateEntry({ ...editingEntry, ...pendingEntrySave });
      setPendingEntrySave(null);
      setEditingEntry(null);
    }
  };

  const handleConfirmDeleteEntry = () => {
    if (deletingEntryId) {
      onDeleteEntry(deletingEntryId);
      setDeletingEntryId(null);
    }
  };

  const handleConfirmRokda = () => {
    if (rokdaConfirmEntry) {
      toggleRokda(rokdaConfirmEntry.id);
      setRokdaConfirmEntry(null);
    }
  };

  const handleSaveCustomerLocal = (data: { name: string; phone: string; address: string }) => {
    onEditCustomer({ ...customer, ...data });
    setIsEditCustomerModalOpen(false);
  };

  const cardCount = 1 + (showGoldCard ? 1 : 0) + (showSilverCard ? 1 : 0);
  const gridClass = cardCount === 3 ? 'grid-cols-3' : cardCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="w-full max-w-full lg:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-4 animate-fade-in pb-20">
      
      {/* 1. STICKY TOP BACK NAVIGATION & CUSTOMER HEADER */}
      <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-2xs sticky top-16 z-20 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 md:p-3 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 transition-all font-bold text-xs md:text-sm flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            <span className="font-bold">{t('back')}</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2">
              <h2 className="text-sm md:text-lg font-bold text-gray-900 truncate">{customer.name}</h2>
              <button
                type="button"
                onClick={() => setIsEditCustomerModalOpen(true)}
                className="px-2 py-0.5 md:px-3 md:py-1 bg-amber-100 hover:bg-amber-200 active:scale-90 text-amber-900 text-[10px] md:text-xs font-extrabold rounded-md border border-amber-300 flex items-center gap-0.5 shrink-0 transition-transform"
              >
                <Edit3 className="w-3 h-3 md:w-4 md:h-4 text-amber-800" />
                <span>{t('edit')}</span>
              </button>
            </div>
            <p className="text-[11px] md:text-xs text-gray-500 font-medium truncate">{customer.phone}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1.5 md:space-x-2 shrink-0">
          {entries.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              className="p-2 md:p-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-lg text-xs md:text-sm font-bold shadow-2xs flex items-center gap-1 transition-all"
              title={t('deleteAllEntries')}
            >
              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              <span className="hidden sm:inline">{t('deleteAllEntries')}</span>
            </button>
          )}
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="p-2 md:p-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs md:text-sm font-bold shadow-2xs flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-gold-400" />
            <span className="hidden sm:inline">{t('bill')}</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC ASSET SUMMARY CARDS (Balance excludes Rokda entries!) */}
      <div className={`grid ${gridClass} gap-2`}>
        
        {/* Money */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-2xs text-center flex flex-col justify-between">
          <div>
            <span className="text-xs sm:text-sm font-bold text-gray-500 uppercase">{t('money')}</span>
            <p className={`text-lg sm:text-xl md:text-2xl font-black font-mono my-1 leading-tight ${
              balance.netMoney > 0 ? 'text-udhar' : balance.netMoney < 0 ? 'text-jama' : 'text-gray-700'
            }`}>
              {balance.netMoney > 0
                ? `₹${Math.round(balance.netMoney).toLocaleString('en-IN')}`
                : balance.netMoney < 0
                ? `₹${Math.round(Math.abs(balance.netMoney)).toLocaleString('en-IN')}`
                : '₹0'}
            </p>
            <span className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded uppercase inline-block ${
              balance.netMoney > 0 ? 'bg-red-50 text-udhar' : balance.netMoney < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
            }`}>
              {balance.netMoney > 0 ? t('udhar') : balance.netMoney < 0 ? t('jama') : t('nil')}
            </span>
          </div>

          {/* Specific Udhar / Jama Breakdown */}
          <div className="mt-3 text-xs sm:text-sm md:text-base font-extrabold text-gray-700 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1.5 leading-tight shrink-0">
            <span className="text-udhar">{t('udhar')}: <span className="font-mono">₹{Math.round(totalMoneyUdhar).toLocaleString('en-IN')}</span></span>
            <span className="text-gray-300">•</span>
            <span className="text-jama">{t('jama')}: <span className="font-mono">₹{Math.round(totalMoneyJama).toLocaleString('en-IN')}</span></span>
          </div>
        </div>

        {/* Gold */}
        {showGoldCard && (
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-amber-200 bg-amber-50/20 shadow-2xs text-center flex flex-col justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold text-amber-900 uppercase">{t('gold')}</span>
              <p className={`text-lg sm:text-xl md:text-2xl font-black font-mono my-1 leading-tight ${
                balance.netGold > 0 ? 'text-udhar' : balance.netGold < 0 ? 'text-jama' : 'text-gray-700'
              }`}>
                {balance.netGold > 0 ? `${balance.netGold.toFixed(2)}g` : balance.netGold < 0 ? `${Math.abs(balance.netGold).toFixed(2)}g` : '0g'}
              </p>
              <span className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded uppercase inline-block ${
                balance.netGold > 0 ? 'bg-red-50 text-udhar' : balance.netGold < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
              }`}>
                {balance.netGold > 0 ? t('udhar') : balance.netGold < 0 ? t('jama') : t('nil')}
              </span>
            </div>

            {/* Specific Udhar / Jama Breakdown */}
            <div className="mt-3 text-xs sm:text-sm md:text-base font-extrabold text-gray-700 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1.5 leading-tight shrink-0">
              <span className="text-udhar">{t('udhar')}: <span className="font-mono">{totalGoldUdhar.toFixed(2)}g</span></span>
              <span className="text-gray-300">•</span>
              <span className="text-jama">{t('jama')}: <span className="font-mono">{totalGoldJama.toFixed(2)}g</span></span>
            </div>
          </div>
        )}

        {/* Silver */}
        {showSilverCard && (
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-slate-200 bg-slate-50/30 shadow-2xs text-center flex flex-col justify-between">
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase">{t('silver')}</span>
              <p className={`text-lg sm:text-xl md:text-2xl font-black font-mono my-1 leading-tight ${
                balance.netSilver > 0 ? 'text-udhar' : balance.netSilver < 0 ? 'text-gray-700' : 'text-gray-700'
              }`}>
                {balance.netSilver > 0 ? `${balance.netSilver.toFixed(1)}g` : balance.netSilver < 0 ? `${Math.abs(balance.netSilver).toFixed(1)}g` : '0g'}
              </p>
              <span className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded uppercase inline-block ${
                balance.netSilver > 0 ? 'bg-red-50 text-udhar' : balance.netSilver < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
              }`}>
                {balance.netSilver > 0 ? t('udhar') : balance.netSilver < 0 ? t('jama') : t('nil')}
              </span>
            </div>

            {/* Specific Udhar / Jama Breakdown */}
            <div className="mt-3 text-xs sm:text-sm md:text-base font-extrabold text-gray-700 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1.5 leading-tight shrink-0">
              <span className="text-udhar">{t('udhar')}: <span className="font-mono">{totalSilverUdhar.toFixed(1)}g</span></span>
              <span className="text-gray-300">•</span>
              <span className="text-jama">{t('jama')}: <span className="font-mono">{totalSilverJama.toFixed(1)}g</span></span>
            </div>
          </div>
        )}
      </div>

      {/* 3. CHRONOLOGICAL TRANSACTIONS HISTORY WITH SEARCH & ROKDA BUTTON */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 space-y-3">
        
        {/* Header with Search & Count */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
          <div className="flex items-center space-x-2 shrink-0">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              {t('ledgerHistory')} ({entries.length})
            </h3>
            {filteredEntries.length > visibleCount && (
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                Showing {visibleCount} of {filteredEntries.length}
              </span>
            )}
          </div>

          {/* ALWAYS VISIBLE SEARCH BAR */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={entrySearchQuery}
              onChange={(e) => setEntrySearchQuery(e.target.value)}
              placeholder={t('searchEntries')}
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm font-semibold text-gray-800"
            />
          </div>
        </div>

        {paginatedEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-xs font-semibold">
              {entrySearchQuery ? 'No matching entries found' : 'No entries recorded yet'}
            </p>
            {!entrySearchQuery && (
              <button onClick={handleOpenAddEntry} className="mt-2 px-3 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-bold shadow-xs">
                + Record {t('entry')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {paginatedEntries.map((entry) => (
              <div
                key={entry.id}
                className={`p-3 md:p-4 rounded-xl border flex flex-col space-y-1.5 md:space-y-2 transition-all ${
                  entry.isRokda
                    ? 'bg-gray-100/80 border-gray-300 opacity-60'
                    : 'bg-gray-50/70 border-gray-200'
                }`}
              >
                {/* Row 1: Date, Time, Hastak */}
                <div className="flex items-center justify-between text-[11px] md:text-xs">
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <span className={`font-bold text-xs md:text-sm ${entry.isRokda ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {formatDate(entry.date)}
                    </span>
                    {merchantTenant?.enableTime !== false && entry.time && (
                      <span className="text-gray-400 font-mono text-[10px] md:text-xs">{formatTime12Hr(entry.time)}</span>
                    )}
                    {/* ROKDA BADGE */}
                    {entry.isRokda && (
                      <span className="text-[9px] md:text-[10px] font-black bg-green-100 text-green-800 border border-green-300 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                        {t('rokda')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 md:space-x-2 shrink-0">
                    {entry.billImageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPreviewImage(entry.billImageUrl!);
                        }}
                        className="w-6 h-6 md:w-8 md:h-8 rounded border border-purple-200 overflow-hidden cursor-pointer active:scale-90 transition-transform shrink-0"
                        title="View Attached Bill"
                      >
                        <img src={entry.billImageUrl} alt="Bill Preview" className="w-full h-full object-cover" />
                      </button>
                    )}
                    {entry.hastak && (
                      <span className="text-[10px] md:text-xs text-purple-700 bg-purple-50 px-1.5 py-0.2 md:py-0.5 rounded font-semibold border border-purple-100">
                        {t('hastak')}: {entry.hastak}
                      </span>
                    )}
                  </div>
                </div>

                {/* Row 2: Description */}
                <p className={`text-xs md:text-sm font-medium md:font-semibold ${entry.isRokda ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {entry.description || 'Khata Transaction'}
                </p>

                {/* Row 3: Assets + Action Buttons */}
                <div className="flex items-center justify-between pt-1 md:pt-2 border-t border-gray-200/80">
                  {/* Asset Values */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs md:text-sm font-black">
                    {entry.moneyAmount > 0 && (
                      <span className={entry.moneyType === 'udhar' ? 'text-udhar' : 'text-jama'}>
                        {entry.moneyType === 'udhar' ? '+ ' : '- '}{formatCurrency(entry.moneyAmount)}
                      </span>
                    )}
                    {entry.goldWeightGrams > 0 && (
                      <span className={entry.goldType === 'udhar' ? 'text-udhar' : 'text-jama'}>
                        {entry.goldType === 'udhar' ? '+ ' : '- '}{entry.goldWeightGrams.toFixed(2)}g {t('gold').charAt(0)}
                      </span>
                    )}
                    {entry.silverWeightGrams > 0 && (
                      <span className={entry.silverType === 'udhar' ? 'text-udhar' : 'text-jama'}>
                        {entry.silverType === 'udhar' ? '+ ' : '- '}{entry.silverWeightGrams.toFixed(1)}g {t('silver').charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 md:space-x-1.5 shrink-0">

                    {/* ROKDA BUTTON (Toggle Settled Status) */}
                    <button
                      onClick={() => setRokdaConfirmEntry(entry)}
                      className={`px-2 py-1 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-black flex items-center gap-0.5 border transition-all active:scale-90 ${
                        entry.isRokda
                          ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                      }`}
                      title={entry.isRokda ? 'Undo Rokda' : 'Mark as Rokda (Settled)'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span>{entry.isRokda ? `${t('rokda')} ✓` : t('rokda')}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditEntry(entry)}
                      className="p-1.5 md:p-2 text-gray-500 hover:text-gold-600 rounded bg-white border border-gray-200 shadow-2xs active:scale-90"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingEntryId(entry.id)}
                      className="p-1.5 md:p-2 text-gray-500 hover:text-red-600 rounded bg-white border border-gray-200 shadow-2xs active:scale-90"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {/* LOAD MORE ENTRIES BUTTON */}
            {filteredEntries.length > visibleCount && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-4 py-2 md:px-6 md:py-3 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 rounded-xl text-xs md:text-sm font-extrabold shadow-2xs inline-flex items-center gap-1.5 transition-all"
                >
                  <ChevronDown className="w-4 h-4 text-gold-600" />
                  <span>{t('showMore')} ({filteredEntries.length - visibleCount} {t('remaining')})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <CustomerModal
        isOpen={isEditCustomerModalOpen}
        onClose={() => setIsEditCustomerModalOpen(false)}
        onSave={handleSaveCustomerLocal}
        initialCustomer={customer}
      />

      <LedgerEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveEntryAttempt}
        initialEntry={editingEntry}
        customerName={customer.name}
        merchantTenant={merchantTenant}
      />

      <BillGeneratorModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        customer={customer}
        merchantTenant={merchantTenant}
        entries={entries}
      />

      {/* CONFIRM ROKDA MODAL */}
      <ConfirmModal
        isOpen={!!rokdaConfirmEntry}
        onClose={() => setRokdaConfirmEntry(null)}
        onConfirm={handleConfirmRokda}
        title={rokdaConfirmEntry?.isRokda ? t('confirmUnrokdaTitle') : t('confirmRokdaTitle')}
        message={rokdaConfirmEntry?.isRokda ? t('confirmUnrokdaMsg') : t('confirmRokdaMsg')}
        confirmText={rokdaConfirmEntry?.isRokda ? t('confirmUnrokdaBtn') : t('confirmRokdaBtn')}
        type="edit"
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal
        isOpen={!!deletingEntryId}
        onClose={() => setDeletingEntryId(null)}
        onConfirm={handleConfirmDeleteEntry}
        title={t('confirmDeleteTitle')}
        message={t('confirmDeleteMsg')}
        confirmText={t('deleteBtn')}
        type="delete"
      />

      {/* CONFIRM EDIT MODAL */}
      <ConfirmModal
        isOpen={!!pendingEntrySave}
        onClose={() => setPendingEntrySave(null)}
        onConfirm={handleConfirmUpdateEntry}
        title={t('confirmEditTitle')}
        message={t('confirmEditMsg')}
        confirmText={t('saveBtn')}
        type="edit"
      />

      {/* DELETE ALL ENTRIES CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        onClose={() => setShowDeleteAllConfirm(false)}
        onConfirm={handleConfirmDeleteAll}
        title={t('confirmDeleteAllTitle')}
        message={t('confirmDeleteAllMsg')}
        confirmText={language === 'gu' ? 'બધું કાઢી નાખો' : 'Delete All'}
        type="delete"
      />

      {/* DELETE ALL BALANCES NOT ZERO WARNING MODAL */}
      <ConfirmModal
        isOpen={showDeleteAllValidationError}
        onClose={() => setShowDeleteAllValidationError(false)}
        onConfirm={() => setShowDeleteAllValidationError(false)}
        title={language === 'gu' ? 'ચેતવણી (Warning)' : 'Validation Warning'}
        message={t('cannotDeleteBalanceNotZero')}
        confirmText="OK"
        type="alert"
      />

      {/* DELETE ALL SUCCESS DIALOG MODAL */}
      <ConfirmModal
        isOpen={showDeleteAllSuccess}
        onClose={() => setShowDeleteAllSuccess(false)}
        onConfirm={() => setShowDeleteAllSuccess(false)}
        title={language === 'gu' ? 'સફળતા (Success)' : 'Success'}
        message={language === 'gu' ? 'તમામ વ્યવહાર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા છે!' : 'All entries deleted successfully!'}
        confirmText="OK"
        type="edit"
      />

      {/* Fullscreen Image Preview Portal Overlay */}
      {selectedPreviewImage && createPortal(
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in"
          onClick={() => setSelectedPreviewImage(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedPreviewImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <img
            src={selectedPreviewImage}
            alt="Fullscreen Bill"
            className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent close on clicking image
          />
          
          <span className="text-white text-xs mt-4 font-bold bg-white/10 px-3 py-1.5 rounded-full select-none">
            {language === 'en' ? 'Click outside to close' : 'બંધ કરવા માટે બહાર ક્લિક કરો'}
          </span>
        </div>,
        document.body
      )}

      {/* Floating Action Button (FAB) for adding new entry - rendered in body to bypass transform layout containers */}
      {createPortal(
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 print:hidden">
          <button
            onClick={handleOpenAddEntry}
            className="w-16 h-16 md:w-20 md:h-20 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white hover:border-gold-300 hover:scale-105 transition-all select-none"
            title={t('newTransaction')}
          >
            <Plus className="w-9 h-9 md:w-11 md:h-11 text-white font-extrabold" />
          </button>
        </div>,
        document.body
      )}

    </div>
  );
};
