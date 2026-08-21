import { Merchant, Customer, LedgerEntry } from '../types';
import { INITIAL_MERCHANTS, INITIAL_CUSTOMERS, INITIAL_ENTRIES } from '../mock/dummyData';
import { 
  isFirebaseEnabled, 
  saveMerchantToFirestore, 
  deleteMerchantFromFirestore,
  saveCustomerToFirestore,
  deleteCustomerFromFirestore,
  saveLedgerEntryToFirestore,
  deleteLedgerEntryFromFirestore,
  deleteAllLedgerEntriesForCustomer
} from './firebaseService';

const KEYS = {
  MERCHANTS: 'soni_khata_merchants_v1',
  CUSTOMERS: 'soni_khata_customers_v1',
  ENTRIES: 'soni_khata_entries_v1',
  AUTH_USER: 'soni_khata_current_user_v1'
};

// Initialize Storage with Dummy Data if Empty
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.MERCHANTS)) {
    localStorage.setItem(KEYS.MERCHANTS, JSON.stringify(INITIAL_MERCHANTS));
  }
  if (!localStorage.getItem(KEYS.CUSTOMERS)) {
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
  }
  if (!localStorage.getItem(KEYS.ENTRIES)) {
    localStorage.setItem(KEYS.ENTRIES, JSON.stringify(INITIAL_ENTRIES));
  }
};

// --- MERCHANTS ---
export const getMerchants = (): Merchant[] => {
  initStorage();
  try {
    const data = localStorage.getItem(KEYS.MERCHANTS);
    return data ? JSON.parse(data) : INITIAL_MERCHANTS;
  } catch (e) {
    return INITIAL_MERCHANTS;
  }
};

export const saveMerchants = (merchants: Merchant[]): void => {
  localStorage.setItem(KEYS.MERCHANTS, JSON.stringify(merchants));
};

export const saveMerchant = (merchant: Merchant): void => {
  const list = getMerchants();
  const index = list.findIndex(m => m.id === merchant.id);
  if (index >= 0) {
    list[index] = merchant;
  } else {
    list.unshift(merchant);
  }
  saveMerchants(list);

  if (isFirebaseEnabled) {
    saveMerchantToFirestore(merchant);
  }
};

export const deleteMerchant = (merchantId: string): void => {
  const merchants = getMerchants().filter(m => m.id !== merchantId);
  saveMerchants(merchants);
  
  const customers = getCustomers().filter(c => c.merchantId !== merchantId);
  saveCustomers(customers);
  
  const entries = getEntries().filter(e => e.merchantId !== merchantId);
  saveEntries(entries);

  if (isFirebaseEnabled) {
    deleteMerchantFromFirestore(merchantId);
  }
};

export const toggleMerchantSubscription = (merchantId: string, active: boolean): Merchant | null => {
  const list = getMerchants();
  const index = list.findIndex(m => m.id === merchantId);
  if (index >= 0) {
    list[index].subscriptionActive = active;
    saveMerchants(list);
    if (isFirebaseEnabled) {
      saveMerchantToFirestore(list[index]);
    }
    return list[index];
  }
  return null;
};

// --- CUSTOMERS ---
export const getCustomers = (merchantId?: string): Customer[] => {
  initStorage();
  try {
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    const customers: Customer[] = data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    if (merchantId) {
      return customers.filter(c => c.merchantId === merchantId);
    }
    return customers;
  } catch (e) {
    return INITIAL_CUSTOMERS;
  }
};

export const saveCustomers = (customers: Customer[]): void => {
  localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
};

export const saveCustomer = (customer: Customer): Customer => {
  const list = getCustomers();
  const index = list.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    list[index] = customer;
  } else {
    list.unshift(customer);
  }
  saveCustomers(list);

  if (isFirebaseEnabled) {
    saveCustomerToFirestore(customer);
  }

  return customer;
};

export const deleteCustomer = (customerId: string): void => {
  const customers = getCustomers().filter(c => c.id !== customerId);
  saveCustomers(customers);
  
  const entries = getEntries().filter(e => e.customerId !== customerId);
  saveEntries(entries);

  if (isFirebaseEnabled) {
    deleteCustomerFromFirestore(customerId);
  }
};

// --- LEDGER ENTRIES (ALWAYS SORTED MOST RECENT CREATED AT THE VERY TOP) ---
export const getEntries = (customerId?: string, merchantId?: string): LedgerEntry[] => {
  initStorage();
  try {
    const data = localStorage.getItem(KEYS.ENTRIES);
    let entries: LedgerEntry[] = data ? JSON.parse(data) : INITIAL_ENTRIES;
    
    if (customerId) {
      entries = entries.filter(e => e.customerId === customerId);
    }
    if (merchantId) {
      entries = entries.filter(e => e.merchantId === merchantId);
    }
    
    // Sort MOST RECENT CREATED FIRST at position #1 (Top of list)
    return entries.sort((a, b) => {
      const getTimestamp = (item: LedgerEntry) => {
        if (item.createdAt) return new Date(item.createdAt).getTime();
        return new Date(`${item.date}T${item.time || '00:00'}`).getTime();
      };
      return getTimestamp(b) - getTimestamp(a);
    });
  } catch (e) {
    return INITIAL_ENTRIES;
  }
};

export const saveEntries = (entries: LedgerEntry[]): void => {
  localStorage.setItem(KEYS.ENTRIES, JSON.stringify(entries));
};

export const saveEntry = (entry: LedgerEntry): LedgerEntry => {
  const list = getEntries();
  const index = list.findIndex(e => e.id === entry.id);
  if (index >= 0) {
    list[index] = entry;
  } else {
    list.unshift(entry); // Place new entry at top
  }
  saveEntries(list);

  if (isFirebaseEnabled) {
    saveLedgerEntryToFirestore(entry);
  }

  return entry;
};

export const deleteEntry = (entryId: string): void => {
  const list = getEntries().filter(e => e.id !== entryId);
  saveEntries(list);

  if (isFirebaseEnabled) {
    deleteLedgerEntryFromFirestore(entryId);
  }
};

export const deleteAllEntriesForCustomer = (customerId: string, entriesToDelete: LedgerEntry[]): void => {
  const list = getEntries().filter(e => e.customerId !== customerId);
  saveEntries(list);

  if (isFirebaseEnabled) {
    deleteAllLedgerEntriesForCustomer(entriesToDelete);
  }
};
