export type UserRole = 'super_admin' | 'merchant';

export type TransactionType = 'udhar' | 'jama'; // udhar = owe (red), jama = deposit (green)

export interface User {
  id: string;
  username: string;
  role: UserRole;
  merchantId?: string; // Present if role === 'merchant'
  merchant?: Merchant;
}

export interface TenantConfig {
  shopName: string;
  logoUrl: string;
  phone: string;
  address: string;
  termsConditions: string;
  gstin?: string;
  billHeaderNotes?: string;
  enableGold?: boolean;   // default: true (Can be toggled OFF by Super Admin)
  enableSilver?: boolean; // default: true (Can be toggled OFF by Super Admin)
  enableBillPhotos?: boolean; // default: false (Can be toggled ON by Super Admin)
  entryFormLayout?: 'remarks_first' | 'assets_first'; // Layout ordering: Remarks/Details first vs Assets/Weights first
  allowManualDate?: boolean; // default: false (If true, merchant can manually select date)
  enableTime?: boolean; // default: true (If true, time is enabled and captured)
}

export interface Merchant {
  id: string;
  username: string;
  password: string;
  subscriptionActive: boolean;
  tenantConfig: TenantConfig;
  createdAt: string;
  lastActiveAt?: string; // Timestamp of merchant's last activity
}

export interface Customer {
  id: string;
  merchantId: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  merchantId: string;
  customerId: string;
  date: string;
  time?: string;
  description: string;
  hastak?: string;
  
  // Asset 1: Money (INR)
  moneyType: TransactionType;
  moneyAmount: number;

  // Asset 2: Gold (Grams)
  goldType: TransactionType;
  goldWeightGrams: number;

  // Asset 3: Silver (Grams)
  silverType: TransactionType;
  silverWeightGrams: number;

  isRokda?: boolean; // If true, entry is marked as settled/rokda, excluded from net balance & active bill
  rokdaAt?: string | null;
  billImageUrl?: string; // Base64 compressed image string representing the attached bill

  createdAt: string;
}

export interface CustomerBalance {
  netMoney: number;   // Positive = Customer owes money (Udhar), Negative = Jama
  netGold: number;    // Positive = Customer owes gold (Udhar), Negative = Jama
  netSilver: number;  // Positive = Customer owes silver (Udhar), Negative = Jama
}
