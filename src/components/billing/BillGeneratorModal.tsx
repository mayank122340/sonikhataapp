import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Customer, LedgerEntry, TenantConfig } from '../../types';
import { calculateCustomerBalance, formatCurrency, formatDate, formatTime12Hr } from '../../utils/formatters';
import { triggerPrint } from '../../utils/exportUtils';
import { generateAndShareRealPdfDocument } from '../../utils/pdfGenerator';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Printer, 
  Share2, 
  Phone, 
  MapPin, 
  Sparkles, 
  Coins, 
  Award,
  ArrowLeft,
  Filter
} from '../common/Icons';

interface BillGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  merchantTenant: TenantConfig;
  entries: LedgerEntry[];
}

export const BillGeneratorModal: React.FC<BillGeneratorModalProps> = ({
  isOpen,
  onClose,
  customer,
  merchantTenant,
  entries
}) => {
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Asset Toggles set by Admin
  const isGoldEnabled = merchantTenant.enableGold !== false;
  const isSilverEnabled = merchantTenant.enableSilver !== false;

  // Filter out entries marked as Rokda (Settled) from printable bill statements
  const activeEntries = entries.filter(e => !e.isRokda);

  // Sort entries DESCENDING (Latest Date & Time First)
  const sortedEntries = [...activeEntries].sort((a, b) => {
    const getTimestamp = (item: LedgerEntry) => {
      if (item.createdAt) return new Date(item.createdAt).getTime();
      return new Date(`${item.date}T${item.time || '00:00'}`).getTime();
    };
    return getTimestamp(b) - getTimestamp(a);
  });

  const displayEntries = sortedEntries;

  // Check if historical entries have gold or silver data
  const hasHistoricalGold = sortedEntries.some(e => e.goldWeightGrams > 0);
  const hasHistoricalSilver = sortedEntries.some(e => e.silverWeightGrams > 0);

  const showGoldOnBill = isGoldEnabled || hasHistoricalGold;
  const showSilverOnBill = isSilverEnabled || hasHistoricalSilver;

  // Calculate specific totals for Udhar and Jama
  const totalMoneyUdhar = displayEntries.reduce((sum, e) => sum + (e.moneyType === 'udhar' ? e.moneyAmount : 0), 0);
  const totalMoneyJama = displayEntries.reduce((sum, e) => sum + (e.moneyType === 'jama' ? e.moneyAmount : 0), 0);

  const totalGoldUdhar = displayEntries.reduce((sum, e) => sum + (e.goldType === 'udhar' ? e.goldWeightGrams : 0), 0);
  const totalGoldJama = displayEntries.reduce((sum, e) => sum + (e.goldType === 'jama' ? e.goldWeightGrams : 0), 0);

  const totalSilverUdhar = displayEntries.reduce((sum, e) => sum + (e.silverType === 'udhar' ? e.silverWeightGrams : 0), 0);
  const totalSilverJama = displayEntries.reduce((sum, e) => sum + (e.silverType === 'jama' ? e.silverWeightGrams : 0), 0);

  const balance = calculateCustomerBalance(entries);
  const todayStr = formatDate(new Date().toISOString());
  const invoiceNo = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  const handleShareRealPdf = async () => {
    setIsGenerating(true);
    await generateAndShareRealPdfDocument('printable-bill', customer, merchantTenant, displayEntries);
    setIsGenerating(false);
  };

  return createPortal(
    /* Fullscreen Dark Overlay covering 100% viewport */
    <div className="fixed inset-0 z-[100] bg-gray-950/95 backdrop-blur-md overflow-y-auto p-2 sm:p-4 flex flex-col justify-start items-center pt-2 sm:pt-4 pb-20 animate-fade-in min-h-screen w-full print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* 1. TOP CONTROL BAR */}
      <div className="w-full max-w-3xl bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl shadow-lg print:hidden shrink-0 mb-3 space-y-2">
        
        {/* Top Control Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* 🔴 BACK BUTTON */}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>← {t('back')}</span>
          </button>

          {/* SHARE REAL PDF DOCUMENT & PRINT BUTTONS */}
          <div className="flex items-center space-x-1.5">
            
            <button
              onClick={handleShareRealPdf}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl transition-all shadow-md disabled:opacity-50"
              title="Generates real PDF document file and opens WhatsApp/Share Sheet"
            >
              {isGenerating ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('creatingPdf')}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{t('sharePdf')}</span>
                </>
              )}
            </button>

            <button
              onClick={triggerPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-md"
              title="Print Bill Statement"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t('printSave')}</span>
            </button>

          </div>

        </div>
      </div>

      {/* 2. ELEGANT LINE-BY-LINE TAX INVOICE TABLE DOCUMENT */}
      <div className="w-full max-w-3xl shrink-0 print:p-0 print:m-0 print:max-w-none mb-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gold-400 print:shadow-none print:border-none print:rounded-none" id="printable-bill">
          
          {/* Printable Invoice Document Paper */}
          <div className="p-4 sm:p-8 space-y-4 text-charcoal-900 bg-white">
            
            {/* Top Auspicious Header Line */}
            <div className="flex justify-between items-center border-b border-gold-200 pb-1.5 text-[9px] sm:text-xs font-black text-amber-800 tracking-wider">
              <span>॥ श्री गणेशाय नमः ॥</span>
              <span>॥ श्रीहरि ॥</span>
              <span>॥ श्री कष्टभंजनदेवाय नमः ॥</span>
            </div>

            {/* Shop White-Label Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b-2 border-gold-500">
              
              {/* Shop Logo & Name Details */}
              <div className="flex items-start sm:items-center space-x-3 min-w-0 flex-1">
                {merchantTenant.logoUrl ? (
                  <img
                    src={merchantTenant.logoUrl}
                    alt={merchantTenant.shopName}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-gold-400 shadow-2xs shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gold-500 text-white flex items-center justify-center font-bold text-2xl shadow-2xs shrink-0 border-2 border-gold-400">
                    卐
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    {merchantTenant.shopName}
                  </h1>
                  
                  {merchantTenant.billHeaderNotes && merchantTenant.billHeaderNotes.trim() && (
                    <p className="text-[11px] text-amber-900 font-bold leading-tight break-words mt-0.5">
                      {merchantTenant.billHeaderNotes}
                    </p>
                  )}

                  <div className="text-xs text-gray-600 flex flex-wrap items-center gap-2 font-medium mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gold-600 shrink-0" />
                      {merchantTenant.phone}
                    </span>
                    {merchantTenant.address && (
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                        {merchantTenant.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Invoice Meta Box */}
              <div className="w-full sm:w-auto bg-amber-50/80 p-2.5 rounded-xl border border-gold-300 text-left sm:text-right shrink-0">
                <span className="text-[10px] font-black text-gold-900 uppercase tracking-widest block">
                  {t('statementInvoice')}
                </span>
                <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                  {invoiceNo}
                </p>
                <p className="text-xs font-semibold text-gray-700">
                  Date: <span className="font-bold text-gray-900">{todayStr}</span>
                </p>
                {merchantTenant.gstin && (
                  <p className="text-[10px] font-mono text-purple-950 font-bold">
                    GSTIN: {merchantTenant.gstin}
                  </p>
                )}
              </div>

            </div>

            {/* Billed To Customer Details Box */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('billedTo')}</span>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">{customer.name}</h3>
                <p className="text-xs text-gray-600 font-semibold mt-0.5">Mobile: {customer.phone}</p>
              </div>

              {customer.address && (
                <div className="text-left sm:text-right">
                  <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">{t('customerAddress')}</span>
                  <p className="text-xs text-gray-600 font-medium max-w-xs mt-0.5">{customer.address}</p>
                </div>
              )}
            </div>

            {/* CLEAN LINE-BY-LINE INVOICE TABLE (NO SEPARATE CARDS, DATE ON LEFT, LINE-BY-LINE ROWS!) */}
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-900 text-white text-[11px] uppercase font-bold tracking-wider border-b-2 border-gold-500">
                    <th className="py-2.5 px-3">{t('dateTime')}</th>
                    <th className="py-2.5 px-3">{t('descHastak')}</th>
                    <th className="py-2.5 px-3 text-right">{t('moneyCol')}</th>
                    {showGoldOnBill && <th className="py-2.5 px-3 text-right">{t('goldCol')}</th>}
                    {showSilverOnBill && <th className="py-2.5 px-3 text-right">{t('silverCol')}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs">
                  {displayEntries.length === 0 ? (
                    <tr>
                      <td colSpan={3 + (showGoldOnBill ? 1 : 0) + (showSilverOnBill ? 1 : 0)} className="py-6 text-center text-gray-400 italic">
                        No transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    displayEntries.map((entry, idx) => (
                      <tr key={entry.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}>
                        
                        {/* 1. Date & Time (Left Side Every Time) */}
                        <td className="py-2.5 px-3 font-medium text-gray-700 whitespace-nowrap align-top">
                          <div className="font-bold text-gray-900 text-xs">{formatDate(entry.date)}</div>
                          {merchantTenant?.enableTime !== false && entry.time && (
                            <div className="text-[10px] text-gray-500 font-mono">{formatTime12Hr(entry.time)}</div>
                          )}
                        </td>

                        {/* 2. Description & Hastak */}
                        <td className="py-2.5 px-3 align-top">
                          <p className="font-bold text-gray-900 text-xs leading-snug">
                            {entry.description || 'Khata Transaction'}
                          </p>
                          {entry.hastak && (
                            <span className="text-[10px] text-purple-800 bg-purple-50 px-1.5 py-0.2 rounded font-semibold inline-block border border-purple-100 mt-0.5">
                              {t('hastak')}: {entry.hastak}
                            </span>
                          )}
                        </td>

                        {/* 3. Money (₹) */}
                        <td className="py-2.5 px-3 text-right font-mono font-extrabold whitespace-nowrap text-xs align-top">
                          {entry.moneyAmount > 0 ? (
                            <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                              entry.moneyType === 'udhar' ? 'text-udhar bg-red-50' : 'text-jama bg-emerald-50'
                            }`}>
                              {entry.moneyType === 'udhar' ? '+ ' : '- '}
                              {formatCurrency(entry.moneyAmount)}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* 4. Gold (g) */}
                        {showGoldOnBill && (
                          <td className="py-2.5 px-3 text-right font-mono font-extrabold whitespace-nowrap text-xs align-top">
                            {entry.goldWeightGrams > 0 ? (
                              <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                                entry.goldType === 'udhar' ? 'text-udhar bg-red-50' : 'text-jama bg-emerald-50'
                              }`}>
                                {entry.goldType === 'udhar' ? '+ ' : '- '}
                                {entry.goldWeightGrams.toFixed(2)}g
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        )}

                        {/* 5. Silver (g) */}
                        {showSilverOnBill && (
                          <td className="py-2.5 px-3 text-right font-mono font-extrabold whitespace-nowrap text-xs align-top">
                            {entry.silverWeightGrams > 0 ? (
                              <span className={`px-1.5 py-0.5 rounded text-[11px] font-black ${
                                entry.silverType === 'udhar' ? 'text-udhar bg-red-50' : 'text-jama bg-emerald-50'
                              }`}>
                                {entry.silverType === 'udhar' ? '+ ' : '- '}
                                {entry.silverWeightGrams.toFixed(1)}g
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        )}

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* NET ACCOUNT SETTLEMENT SUMMARY BOX */}
            <div className="bg-amber-50/70 border-2 border-gold-400 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] sm:text-xs font-black text-amber-900 uppercase tracking-widest border-b border-gold-300 pb-1">
                {t('netSettlementTitle')}
              </h4>

              <div className={`grid ${
                1 + (showGoldOnBill ? 1 : 0) + (showSilverOnBill ? 1 : 0) === 3 ? 'grid-cols-3' : 1 + (showGoldOnBill ? 1 : 0) + (showSilverOnBill ? 1 : 0) === 2 ? 'grid-cols-2' : 'grid-cols-1'
              } gap-2 text-center`}>
                
                 {/* Net Money */}
                <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-gold-300 shadow-2xs flex flex-col justify-between text-center">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase flex items-center justify-center gap-1">
                      <Coins className="w-3 h-3 text-emerald-600" /> {t('money')}
                    </span>
                    <p className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                      balance.netMoney > 0 ? 'text-udhar' : balance.netMoney < 0 ? 'text-jama' : 'text-gray-700'
                    }`}>
                      {balance.netMoney > 0
                        ? `₹${Math.round(balance.netMoney).toLocaleString('en-IN')}`
                        : balance.netMoney < 0
                        ? `₹${Math.round(Math.abs(balance.netMoney)).toLocaleString('en-IN')}`
                        : '₹0'}
                    </p>
                    <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded uppercase inline-block mt-0.5 ${
                      balance.netMoney > 0 ? 'bg-red-100 text-udhar' : balance.netMoney < 0 ? 'bg-emerald-100 text-jama' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {balance.netMoney > 0 ? t('netUdhar') : balance.netMoney < 0 ? t('netJama') : t('settled')}
                    </span>
                  </div>

                  {/* Specific Udhar / Jama Breakdown */}
                  <div className="mt-2 text-[10px] sm:text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1 leading-tight shrink-0">
                    <span className="text-udhar">{t('udhar')}: <span className="font-mono">₹{Math.round(totalMoneyUdhar).toLocaleString('en-IN')}</span></span>
                    <span className="text-gray-300">•</span>
                    <span className="text-jama">{t('jama')}: <span className="font-mono">₹{Math.round(totalMoneyJama).toLocaleString('en-IN')}</span></span>
                  </div>
                </div>

                {/* Net Gold */}
                {showGoldOnBill && (
                  <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-gold-300 shadow-2xs flex flex-col justify-between text-center">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-900 uppercase flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" /> {t('gold')}
                      </span>
                      <p className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                        balance.netGold > 0 ? 'text-udhar' : balance.netGold < 0 ? 'text-jama' : 'text-gray-700'
                      }`}>
                        {balance.netGold > 0
                          ? `${balance.netGold.toFixed(2)}g`
                          : balance.netGold < 0
                          ? `${Math.abs(balance.netGold).toFixed(2)}g`
                          : '0.00g'}
                      </p>
                      <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded uppercase inline-block mt-0.5 ${
                        balance.netGold > 0 ? 'bg-red-100 text-udhar' : balance.netGold < 0 ? 'bg-emerald-100 text-jama' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {balance.netGold > 0 ? t('netUdhar') : balance.netGold < 0 ? t('netJama') : t('settled')}
                      </span>
                    </div>

                    {/* Specific Udhar / Jama Breakdown */}
                    <div className="mt-2 text-[10px] sm:text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1 leading-tight shrink-0">
                      <span className="text-udhar">{t('udhar')}: <span className="font-mono">{totalGoldUdhar.toFixed(2)}g</span></span>
                      <span className="text-gray-300">•</span>
                      <span className="text-jama">{t('jama')}: <span className="font-mono">{totalGoldJama.toFixed(2)}g</span></span>
                    </div>
                  </div>
                )}

                {/* Net Silver */}
                {showSilverOnBill && (
                  <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-gold-300 shadow-2xs flex flex-col justify-between text-center">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-700 uppercase flex items-center justify-center gap-1">
                        <Award className="w-3 h-3 text-slate-600" /> {t('silver')}
                      </span>
                      <p className={`text-xs sm:text-sm font-black font-mono mt-0.5 ${
                        balance.netSilver > 0 ? 'text-udhar' : balance.netSilver < 0 ? 'text-jama' : 'text-gray-700'
                      }`}>
                        {balance.netSilver > 0
                          ? `${balance.netSilver.toFixed(1)}g`
                          : balance.netSilver < 0
                          ? `${Math.abs(balance.netSilver).toFixed(1)}g`
                          : '0.0g'}
                      </p>
                      <span className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.2 rounded uppercase inline-block mt-0.5 ${
                        balance.netSilver > 0 ? 'bg-red-100 text-udhar' : balance.netSilver < 0 ? 'bg-emerald-100 text-jama' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {balance.netSilver > 0 ? t('netUdhar') : balance.netSilver < 0 ? t('netJama') : t('settled')}
                      </span>
                    </div>

                    {/* Specific Udhar / Jama Breakdown */}
                    <div className="mt-2 text-[10px] sm:text-xs font-bold text-gray-600 flex items-center justify-center gap-1.5 border-t border-gray-100 pt-1 leading-tight shrink-0">
                      <span className="text-udhar">{t('udhar')}: <span className="font-mono">{totalSilverUdhar.toFixed(1)}g</span></span>
                      <span className="text-gray-300">•</span>
                      <span className="text-jama">{t('jama')}: <span className="font-mono">{totalSilverJama.toFixed(1)}g</span></span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-end text-xs text-gray-600">
              {merchantTenant.termsConditions && merchantTenant.termsConditions.trim() ? (
                <div>
                  <h5 className="font-bold text-gray-900 text-[10px] sm:text-xs">{t('terms')}:</h5>
                  <p className="whitespace-pre-line text-[9px] sm:text-[10px] text-gray-500 leading-relaxed mt-0.5">
                    {merchantTenant.termsConditions}
                  </p>
                </div>
              ) : (
                <div />
              )}

              <div className="text-right border-t-2 border-gray-800 pt-1.5 w-40 shrink-0">
                <p className="font-bold text-gray-900 text-xs">{t('forShop')} {merchantTenant.shopName}</p>
                <p className="text-[9px] text-gray-400">{t('authorizedSign')}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};
