import { LedgerEntry, CustomerBalance } from '../types';

export const calculateCustomerBalance = (entries: LedgerEntry[]): CustomerBalance => {
  return entries.reduce(
    (acc, entry) => {
      // EXCLUDE entries marked as Rokda (Settled) from net running balance calculations!
      if (entry.isRokda) {
        return acc;
      }

      // Money Calculation
      if (entry.moneyAmount > 0) {
        if (entry.moneyType === 'udhar') {
          acc.netMoney += entry.moneyAmount;
        } else {
          acc.netMoney -= entry.moneyAmount;
        }
      }

      // Gold Calculation
      if (entry.goldWeightGrams > 0) {
        if (entry.goldType === 'udhar') {
          acc.netGold += entry.goldWeightGrams;
        } else {
          acc.netGold -= entry.goldWeightGrams;
        }
      }

      // Silver Calculation
      if (entry.silverWeightGrams > 0) {
        if (entry.silverType === 'udhar') {
          acc.netSilver += entry.silverWeightGrams;
        } else {
          acc.netSilver -= entry.silverWeightGrams;
        }
      }

      return acc;
    },
    { netMoney: 0, netGold: 0, netSilver: 0 }
  );
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export const formatTime12Hr = (timeStr?: string): string => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const m = minutes ? minutes : '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  } catch {
    return timeStr || '';
  }
};
