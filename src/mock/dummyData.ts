import { Merchant, Customer, LedgerEntry } from '../types';

export const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: 'merchant_shreeram',
    username: 'shreeram_jewellers',
    password: 'password123',
    subscriptionActive: true,
    tenantConfig: {
      shopName: 'Shree Ram Jewellers',
      logoUrl: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80&w=200',
      phone: '+91 98250 12345',
      address: 'Shop No. 12, Soni Vad, Manek Chowk, Ahmedabad',
      gstin: '24ABCDE1234F1Z5',
      billHeaderNotes: 'Certified 22K/18K Hallmarked Gold & Pure 925 Silver Ornaments',
      termsConditions: '1. All ornaments tested on digital purity scale.\n2. Goods once sold cannot be returned without cash memo.\n3. Khata subject to periodic settlement.',
      enableGold: true,
      enableSilver: true
    },
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'merchant_navratri',
    username: 'navratri_ornaments',
    password: 'password123',
    subscriptionActive: true,
    tenantConfig: {
      shopName: 'Navratri Ornaments & Bullion',
      logoUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200',
      phone: '+91 99090 87654',
      address: 'Near Soni Bazaar, Rajkot, Gujarat',
      gstin: '24XYZAB5678G2Z9',
      billHeaderNotes: 'Wholesale & Retail Dealers of Gold Chains & Silver Utensils',
      termsConditions: '1. Ornaments subject to purity scale verification.\n2. Interest applied after 30 days.',
      enableGold: true,
      enableSilver: true
    },
    createdAt: '2026-01-15T00:00:00.000Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_ramesh',
    merchantId: 'merchant_shreeram',
    name: 'Ramesh Bhai Patel',
    phone: '+91 98765 43210',
    address: 'Satellite, Ahmedabad',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'cust_suresh',
    merchantId: 'merchant_shreeram',
    name: 'Suresh Kumar Shah',
    phone: '+91 98240 11223',
    address: 'Navrangpura, Ahmedabad',
    createdAt: '2026-02-05T11:30:00.000Z'
  }
];

export const INITIAL_ENTRIES: LedgerEntry[] = [
  {
    id: 'entry_1',
    merchantId: 'merchant_shreeram',
    customerId: 'cust_ramesh',
    date: '2026-08-15',
    time: '11:30',
    description: 'Gold Chain (22K) 15g Purchase + Cash Advance',
    hastak: 'Ramesh Self',
    moneyType: 'udhar',
    moneyAmount: 25000,
    goldType: 'udhar',
    goldWeightGrams: 15.000,
    silverType: 'jama',
    silverWeightGrams: 0,
    createdAt: '2026-08-15T11:30:00.000Z'
  },
  {
    id: 'entry_2',
    merchantId: 'merchant_shreeram',
    customerId: 'cust_ramesh',
    date: '2026-08-18',
    time: '16:45',
    description: 'Silver Payal Deposit (200g)',
    hastak: 'Brother Jagdish',
    moneyType: 'jama',
    moneyAmount: 10000,
    goldType: 'jama',
    goldWeightGrams: 0,
    silverType: 'jama',
    silverWeightGrams: 200.0,
    createdAt: '2026-08-18T16:45:00.000Z'
  }
];
