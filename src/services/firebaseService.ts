import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { Merchant, Customer, LedgerEntry } from '../types';

/**
 * 🔒 FIRESTORE SECURITY RULES
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{document=**} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 */

export const firebaseConfig = {
  apiKey: "AIzaSyBAPr7nF8H34-eqnad6u4s6hXxCTZU1oHQ",
  authDomain: "soni-udharapp.firebaseapp.com",
  projectId: "soni-udharapp",
  storageBucket: "soni-udharapp.firebasestorage.app",
  messagingSenderId: "699521367247",
  appId: "1:699521367247:web:81fcab9ff0ccc834f50bba",
  measurementId: "G-KKV6X2XBNR"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const isFirebaseEnabled = true;

// Firestore Collection Names
export const COLLECTIONS = {
  MERCHANTS: 'merchants',
  CUSTOMERS: 'customers',
  LEDGER_ENTRIES: 'ledger_entries'
};

// --- REAL-TIME FIRESTORE ON_SNAPSHOT LISTENERS ---

export const subscribeToMerchants = (onData: (merchants: Merchant[], fromCache: boolean) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.MERCHANTS), (snapshot) => {
    const list: Merchant[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Merchant);
    });
    onData(list, snapshot.metadata.fromCache);
  }, (err) => {
    console.error('Merchants snapshot error:', err);
  });
};

export const subscribeToCustomers = (onData: (customers: Customer[], fromCache: boolean) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.CUSTOMERS), (snapshot) => {
    const list: Customer[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Customer);
    });
    onData(list, snapshot.metadata.fromCache);
  }, (err) => {
    console.error('Customers snapshot error:', err);
  });
};

export const subscribeToLedgerEntries = (onData: (entries: LedgerEntry[], fromCache: boolean) => void) => {
  return onSnapshot(collection(db, COLLECTIONS.LEDGER_ENTRIES), (snapshot) => {
    const list: LedgerEntry[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as LedgerEntry);
    });
    onData(list, snapshot.metadata.fromCache);
  }, (err) => {
    console.error('LedgerEntries snapshot error:', err);
  });
};

// Helper to remove undefined properties before sending to Firestore (prevents runtime crashes)
const cleanUndefined = (obj: any): any => {
  const clean: any = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean;
};

// --- FIRESTORE WRITE HELPERS ---

export const saveMerchantToFirestore = async (merchant: Merchant) => {
  try {
    const cleaned = cleanUndefined(merchant);
    await setDoc(doc(db, COLLECTIONS.MERCHANTS, merchant.id), cleaned, { merge: true });
  } catch (e) {
    console.error('Firestore saveMerchant error:', e);
  }
};

export const deleteMerchantFromFirestore = async (merchantId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.MERCHANTS, merchantId));
  } catch (e) {
    console.error('Firestore deleteMerchant error:', e);
  }
};

export const saveCustomerToFirestore = async (customer: Customer) => {
  try {
    const cleaned = cleanUndefined(customer);
    await setDoc(doc(db, COLLECTIONS.CUSTOMERS, customer.id), cleaned, { merge: true });
  } catch (e) {
    console.error('Firestore saveCustomer error:', e);
  }
};

export const deleteCustomerFromFirestore = async (customerId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.CUSTOMERS, customerId));
  } catch (e) {
    console.error('Firestore deleteCustomer error:', e);
  }
};

export const saveLedgerEntryToFirestore = async (entry: LedgerEntry) => {
  try {
    const cleaned = cleanUndefined(entry);
    await setDoc(doc(db, COLLECTIONS.LEDGER_ENTRIES, entry.id), cleaned, { merge: true });
  } catch (e) {
    console.error('Firestore saveLedgerEntry error:', e);
  }
};

export const deleteLedgerEntryFromFirestore = async (entryId: string) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.LEDGER_ENTRIES, entryId));
  } catch (e) {
    console.error('Firestore deleteLedgerEntry error:', e);
  }
};

export const deleteAllLedgerEntriesForCustomer = async (entries: LedgerEntry[]) => {
  try {
    const promises = entries.map(entry => deleteDoc(doc(db, COLLECTIONS.LEDGER_ENTRIES, entry.id)));
    await Promise.all(promises);
  } catch (e) {
    console.error('Firestore deleteAllLedgerEntriesForCustomer error:', e);
  }
};
