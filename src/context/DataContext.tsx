import React, { createContext, useContext, useState, useEffect } from 'react';
import { Merchant, Customer, LedgerEntry } from '../types';
import * as storageService from '../services/storageService';
import { 
  isFirebaseEnabled, 
  subscribeToMerchants, 
  subscribeToCustomers, 
  subscribeToLedgerEntries 
} from '../services/firebaseService';

interface AnalyticsData {
  totalMerchants: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  totalCustomers: number;
  totalEntries: number;
}

interface DataContextType {
  merchants: Merchant[];
  customers: Customer[];
  ledgerEntries: LedgerEntry[];
  analytics: AnalyticsData;
  isSynced: boolean; // true = live Firestore, false = loading/cache
  addMerchant: (merchantData: Omit<Merchant, 'id' | 'createdAt'>) => Merchant;
  updateMerchant: (merchant: Merchant) => void;
  removeMerchant: (merchantId: string) => void;
  toggleSubscription: (merchantId: string, active: boolean) => void;
  addCustomer: (customerData: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  removeCustomer: (customerId: string) => void;
  addLedgerEntry: (entryData: Omit<LedgerEntry, 'id' | 'createdAt'>) => LedgerEntry;
  updateLedgerEntry: (entry: LedgerEntry) => void;
  removeLedgerEntry: (entryId: string) => void;
  removeAllLedgerEntriesForCustomer: (customerId: string, entries: LedgerEntry[]) => void;
  toggleRokda: (entryId: string) => void;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchants, setMerchants] = useState<Merchant[]>(() => storageService.getMerchants());
  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => storageService.getEntries());
  const [isSynced, setIsSynced] = useState(false);

  // REAL-TIME FIRESTORE ON_SNAPSHOT LISTENERS (EXACT PARITY SYNC FOR ADD & DELETE)
  useEffect(() => {
    if (!isFirebaseEnabled) {
      setIsSynced(true); // No Firebase - treat localStorage as source of truth
      return;
    }

    // 1. Merchants Real-time Listener (Always sync exact Firestore state)
    const unsubMerchants = subscribeToMerchants((firestoreMerchants, fromCache) => {
      setMerchants(firestoreMerchants);
      storageService.saveMerchants(firestoreMerchants);
      if (!fromCache) setIsSynced(true);
    });

    // 2. Customers Real-time Listener (Always sync exact Firestore state)
    const unsubCustomers = subscribeToCustomers((firestoreCustomers, fromCache) => {
      setCustomers(firestoreCustomers);
      storageService.saveCustomers(firestoreCustomers);
      if (!fromCache) setIsSynced(true);
    });

    // 3. Ledger Entries Real-time Listener (Always sync exact Firestore state, including DELETIONS)
    const unsubEntries = subscribeToLedgerEntries((firestoreEntries, fromCache) => {
      setLedgerEntries(firestoreEntries);
      storageService.saveEntries(firestoreEntries);
      if (!fromCache) setIsSynced(true);
    });

    return () => {
      unsubMerchants();
      unsubCustomers();
      unsubEntries();
      setIsSynced(false);
    };
  }, []);

  const refreshData = () => {
    setMerchants(storageService.getMerchants());
    setCustomers(storageService.getCustomers());
    setLedgerEntries(storageService.getEntries());
  };

  // --- MERCHANT OPERATIONS ---
  const addMerchant = (merchantData: Omit<Merchant, 'id' | 'createdAt'>): Merchant => {
    const newMerchant: Merchant = {
      ...merchantData,
      id: `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    storageService.saveMerchant(newMerchant);
    return newMerchant;
  };

  const updateMerchant = (merchant: Merchant) => {
    storageService.saveMerchant(merchant);
  };

  const removeMerchant = (merchantId: string) => {
    storageService.deleteMerchant(merchantId);
  };

  const toggleSubscription = (merchantId: string, active: boolean) => {
    storageService.toggleMerchantSubscription(merchantId, active);
  };

  // --- CUSTOMER OPERATIONS ---
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    storageService.saveCustomer(newCustomer);
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (customer: Customer) => {
    storageService.saveCustomer(customer);
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
  };

  const removeCustomer = (customerId: string) => {
    storageService.deleteCustomer(customerId);
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  // --- LEDGER ENTRY OPERATIONS ---
  const addLedgerEntry = (entryData: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry => {
    const newEntry: LedgerEntry = {
      ...entryData,
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    storageService.saveEntry(newEntry);
    setLedgerEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateLedgerEntry = (entry: LedgerEntry) => {
    storageService.saveEntry(entry);
    setLedgerEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
  };

  const removeLedgerEntry = (entryId: string) => {
    storageService.deleteEntry(entryId);
    setLedgerEntries(prev => prev.filter(e => e.id !== entryId));
  };

  const removeAllLedgerEntriesForCustomer = (customerId: string, entries: LedgerEntry[]) => {
    storageService.deleteAllEntriesForCustomer(customerId, entries);
    setLedgerEntries(prev => prev.filter(e => e.customerId !== customerId));
  };

  // Toggle Rokda (Settled) status on an entry
  const toggleRokda = (entryId: string) => {
    const entry = ledgerEntries.find(e => e.id === entryId);
    if (!entry) return;
    const updated: LedgerEntry = {
      ...entry,
      isRokda: !entry.isRokda,
      rokdaAt: !entry.isRokda ? new Date().toISOString() : null
    };
    storageService.saveEntry(updated);
    setLedgerEntries(prev => prev.map(e => e.id === entryId ? updated : e));
  };

  // Analytics Calculation
  const analytics: AnalyticsData = {
    totalMerchants: merchants.length,
    activeSubscriptions: merchants.filter(m => m.subscriptionActive).length,
    inactiveSubscriptions: merchants.filter(m => !m.subscriptionActive).length,
    totalCustomers: customers.length,
    totalEntries: ledgerEntries.length
  };

  return (
    <DataContext.Provider value={{
      merchants,
      customers,
      ledgerEntries,
      analytics,
      isSynced,
      addMerchant,
      updateMerchant,
      removeMerchant,
      toggleSubscription,
      addCustomer,
      updateCustomer,
      removeCustomer,
      addLedgerEntry,
      updateLedgerEntry,
      removeLedgerEntry,
      removeAllLedgerEntriesForCustomer,
      toggleRokda,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
