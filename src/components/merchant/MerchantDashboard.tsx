import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Customer, LedgerEntry } from '../../types';
import { CustomerDetail } from './CustomerDetail';
import { CustomerModal } from './CustomerModal';
import { calculateCustomerBalance } from '../../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Search, 
  ChevronRight, 
  Phone, 
  Coins, 
  Sparkles, 
  Award
} from '../common/Icons';

export const MerchantDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { 
    merchants,
    customers, 
    ledgerEntries, 
    addCustomer, 
    updateCustomer, 
    addLedgerEntry, 
    updateLedgerEntry, 
    removeLedgerEntry 
  } = useData();

  const merchantId = user?.merchantId;

  // Always read the LIVE updated merchant object from DataContext!
  const currentMerchant = merchants.find(m => m.id === merchantId) || user?.merchant;

  const merchantTenant = currentMerchant?.tenantConfig || {
    shopName: 'Soni Jewelry Store',
    logoUrl: '',
    phone: '',
    address: '',
    termsConditions: '',
    enableGold: true,
    enableSilver: true
  };

  // Asset Toggles set by Admin (Live Real-Time Values!)
  const isGoldEnabled = merchantTenant.enableGold !== false;
  const isSilverEnabled = merchantTenant.enableSilver !== false;

  // State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filter merchant specific customers
  const merchantCustomers = customers.filter(c => c.merchantId === merchantId);

  // SORT CUSTOMERS BY MOST RECENT ACTIVITY
  const sortedMerchantCustomers = [...merchantCustomers].sort((a, b) => {
    const getCustomerLastActivity = (cust: Customer) => {
      const custEntries = ledgerEntries.filter(e => e.customerId === cust.id);
      if (custEntries.length > 0) {
        const latestEntry = custEntries.reduce((latest, current) => {
          const latestTime = latest.createdAt ? new Date(latest.createdAt).getTime() : new Date(`${latest.date}T${latest.time || '00:00'}`).getTime();
          const currentTime = current.createdAt ? new Date(current.createdAt).getTime() : new Date(`${current.date}T${current.time || '00:00'}`).getTime();
          return currentTime > latestTime ? current : latest;
        }, custEntries[0]);

        return latestEntry.createdAt ? new Date(latestEntry.createdAt).getTime() : new Date(`${latestEntry.date}T${latestEntry.time || '00:00'}`).getTime();
      }
      return cust.createdAt ? new Date(cust.createdAt).getTime() : 0;
    };

    return getCustomerLastActivity(b) - getCustomerLastActivity(a);
  });

  const filteredCustomers = sortedMerchantCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );

  // Compute Overall Shop Totals across all customers
  const shopEntries = ledgerEntries.filter(e => e.merchantId === merchantId);
  const shopBalance = calculateCustomerBalance(shopEntries);

  // Check if any customer in shop has non-zero gold or silver balance
  const shopHasGold = shopBalance.netGold !== 0 || shopEntries.some(e => e.goldWeightGrams > 0);
  const shopHasSilver = shopBalance.netSilver !== 0 || shopEntries.some(e => e.silverWeightGrams > 0);

  const showShopGoldCard = isGoldEnabled || shopHasGold;
  const showShopSilverCard = isSilverEnabled || shopHasSilver;

  const handleOpenAddCustomer = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = (customerData: { name: string; phone: string; address: string }) => {
    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...customerData
      });
      if (selectedCustomer?.id === editingCustomer.id) {
        setSelectedCustomer({ ...editingCustomer, ...customerData });
      }
    } else {
      if (merchantId) {
        const created = addCustomer({
          ...customerData,
          merchantId
        });
        setSelectedCustomer(created);
      }
    }
  };

  // If a customer is selected, render the CustomerDetail view
  if (selectedCustomer) {
    const customerEntries = ledgerEntries.filter(e => e.customerId === selectedCustomer.id);
    return (
      <CustomerDetail
        customer={selectedCustomer}
        merchantTenant={merchantTenant}
        entries={customerEntries}
        onBack={() => setSelectedCustomer(null)}
        onAddEntry={(data) => {
          if (merchantId) {
            addLedgerEntry({
              ...data,
              merchantId,
              customerId: selectedCustomer.id
            });
          }
        }}
        onUpdateEntry={(entry) => updateLedgerEntry(entry)}
        onDeleteEntry={(id) => removeLedgerEntry(id)}
        onEditCustomer={handleOpenEditCustomer}
      />
    );
  }

  // Calculate dynamic grid columns based on enabled or historically populated cards
  const enabledCount = 1 + (showShopGoldCard ? 1 : 0) + (showShopSilverCard ? 1 : 0);
  const gridClass = enabledCount === 3 ? 'grid-cols-3' : enabledCount === 2 ? 'grid-cols-2' : 'grid-cols-1';

  return (
    <div className="max-w-md sm:max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4 animate-fade-in pb-20">
      
      {/* 1. COMPACT SHOP HEADER */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          {merchantTenant.logoUrl ? (
            <img
              src={merchantTenant.logoUrl}
              alt="Shop Logo"
              className="w-10 h-10 rounded-lg object-cover border border-gold-300 shrink-0"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gold-500 text-white flex items-center justify-center font-bold text-lg shrink-0">
              卐
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900 truncate leading-tight">
              {merchantTenant.shopName}
            </h2>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium truncate">
              <Phone className="w-3 h-3 text-gold-600 shrink-0" />
              <span>{merchantTenant.phone}</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC SIDE-BY-SIDE COMPACT ASSET CARDS GRID */}
      <div className={`grid ${gridClass} gap-2`}>
        
        {/* Money Card (Always Enabled) */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-gray-200 shadow-2xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-gray-500 uppercase">
            <Coins className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>{t('money')}</span>
          </div>
          <div className="my-1">
            <p className={`text-xs sm:text-sm font-black font-mono leading-tight ${
              shopBalance.netMoney > 0 ? 'text-udhar' : shopBalance.netMoney < 0 ? 'text-jama' : 'text-gray-700'
            }`}>
              {shopBalance.netMoney > 0
                ? `₹${Math.round(shopBalance.netMoney).toLocaleString('en-IN')}`
                : shopBalance.netMoney < 0
                ? `₹${Math.round(Math.abs(shopBalance.netMoney)).toLocaleString('en-IN')}`
                : '₹0'}
            </p>
          </div>
          <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase inline-block ${
            shopBalance.netMoney > 0 ? 'bg-red-50 text-udhar' : shopBalance.netMoney < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
          }`}>
            {shopBalance.netMoney > 0 ? t('udhar') : shopBalance.netMoney < 0 ? t('jama') : t('nil')}
          </span>
        </div>

        {/* Gold Card (Shown if Admin Enabled OR if Shop has Historical Gold Data) */}
        {showShopGoldCard && (
          <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-amber-200 bg-amber-50/20 shadow-2xs text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-amber-900 uppercase">
              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
              <span>{t('gold')}</span>
            </div>
            <div className="my-1">
              <p className={`text-xs sm:text-sm font-black font-mono leading-tight ${
                shopBalance.netGold > 0 ? 'text-udhar' : shopBalance.netGold < 0 ? 'text-jama' : 'text-gray-700'
              }`}>
                {shopBalance.netGold > 0
                  ? `${shopBalance.netGold.toFixed(2)}g`
                  : shopBalance.netGold < 0
                  ? `${Math.abs(shopBalance.netGold).toFixed(2)}g`
                  : '0g'}
              </p>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase inline-block ${
              shopBalance.netGold > 0 ? 'bg-red-50 text-udhar' : shopBalance.netGold < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
            }`}>
              {shopBalance.netGold > 0 ? t('udhar') : shopBalance.netGold < 0 ? t('jama') : t('nil')}
            </span>
          </div>
        )}

        {/* Silver Card (Shown if Admin Enabled OR if Shop has Historical Silver Data) */}
        {showShopSilverCard && (
          <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200 bg-slate-50/30 shadow-2xs text-center flex flex-col justify-between">
            <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-slate-700 uppercase">
              <Award className="w-3 h-3 text-slate-600 shrink-0" />
              <span>{t('silver')}</span>
            </div>
            <div className="my-1">
              <p className={`text-xs sm:text-sm font-black font-mono leading-tight ${
                shopBalance.netSilver > 0 ? 'text-udhar' : shopBalance.netSilver < 0 ? 'text-jama' : 'text-gray-700'
              }`}>
                {shopBalance.netSilver > 0
                  ? `${shopBalance.netSilver.toFixed(1)}g`
                  : shopBalance.netSilver < 0
                  ? `${Math.abs(shopBalance.netSilver).toFixed(1)}g`
                  : '0g'}
              </p>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded uppercase inline-block ${
              shopBalance.netSilver > 0 ? 'bg-red-50 text-udhar' : shopBalance.netSilver < 0 ? 'bg-emerald-50 text-jama' : 'bg-gray-100 text-gray-500'
            }`}>
              {shopBalance.netSilver > 0 ? t('udhar') : shopBalance.netSilver < 0 ? t('jama') : t('nil')}
            </span>
          </div>
        )}

      </div>

      {/* 3. SEARCH & CUSTOMER DIRECTORY LIST */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 md:p-5 space-y-3 md:space-y-4">
        
        {/* Search Bar & Title */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs md:text-sm font-bold text-gray-800 flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-gold-500" />
            {t('customers')} ({merchantCustomers.length})
          </span>

          <div className="relative flex-1 max-w-xs md:max-w-sm">
            <Search className="w-3.5 h-3.5 md:w-4 md:h-4 absolute left-3 md:left-3.5 top-2.5 md:top-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchCustomer')}
              className="w-full pl-8 md:pl-10 pr-3 py-1.5 md:py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 text-xs md:text-sm font-medium"
            />
          </div>
        </div>

        {/* Customer Directory List */}
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-xs font-semibold">{t('noCustomers')}</p>
            <button
              onClick={handleOpenAddCustomer}
              className="mt-2 px-3 py-1.5 bg-gold-500 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-gold-600"
            >
              + {t('registerCustomerBtn')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => {
              const custEntries = ledgerEntries.filter(e => e.customerId === customer.id);
              const custBalance = calculateCustomerBalance(custEntries);

              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="py-3 px-2 md:py-4 md:px-3 hover:bg-gold-50/50 rounded-lg transition-colors cursor-pointer flex items-center justify-between gap-2 active:bg-gray-100"
                >
                  {/* Left: Customer Info */}
                  <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold-100 text-gold-700 font-black flex items-center justify-center text-sm sm:text-base md:text-lg shrink-0">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-900 text-sm sm:text-base md:text-lg truncate">
                        {customer.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500 font-semibold">
                        {customer.phone}
                      </p>
                    </div>
                  </div>

                  {/* Right: Net Balance Summary Pills (Always display Gold/Silver badges if non-zero!) */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="flex flex-col items-end text-right font-mono text-xs sm:text-sm md:text-base font-black">
                      {/* Money */}
                      <span className={custBalance.netMoney > 0 ? 'text-udhar' : custBalance.netMoney < 0 ? 'text-jama' : 'text-gray-600'}>
                        {custBalance.netMoney > 0
                          ? `₹${Math.round(custBalance.netMoney).toLocaleString('en-IN')} ${t('udhar')}`
                          : custBalance.netMoney < 0
                          ? `₹${Math.round(Math.abs(custBalance.netMoney)).toLocaleString('en-IN')} ${t('jama')}`
                          : '₹0'}
                      </span>

                      {/* Gold / Silver Weight Badges (Shown whenever balance is non-zero) */}
                      {(custBalance.netGold !== 0 || custBalance.netSilver !== 0) && (
                        <div className="flex gap-1 text-[11px] md:text-[13px] font-bold mt-0.5 md:mt-1">
                          {custBalance.netGold !== 0 && (
                            <span className={custBalance.netGold > 0 ? 'text-udhar' : 'text-jama'}>
                              G: {custBalance.netGold.toFixed(2)}g ({custBalance.netGold > 0 ? t('udhar') : t('jama')})
                            </span>
                          )}
                          {custBalance.netSilver !== 0 && (
                            <span className={custBalance.netSilver > 0 ? 'text-udhar' : 'text-jama'}>
                              S: {custBalance.netSilver.toFixed(1)}g ({custBalance.netSilver > 0 ? t('udhar') : t('jama')})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 shrink-0" />
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Floating Action Button (FAB) for registering new customer - rendered in body to bypass transform layout containers */}
      {createPortal(
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 print:hidden">
          <button
            onClick={handleOpenAddCustomer}
            className="w-16 h-16 md:w-20 md:h-20 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-2xl shadow-2xl flex items-center justify-center border-2 border-white hover:border-gold-300 hover:scale-105 transition-all select-none"
            title={t('registerCustomerBtn')}
          >
            <UserPlus className="w-9 h-9 md:w-11 md:h-11 text-white font-extrabold" />
          </button>
        </div>,
        document.body
      )}
      {/* Customer Modal */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSave={handleSaveCustomer}
        initialCustomer={editingCustomer}
      />

    </div>
  );
};
