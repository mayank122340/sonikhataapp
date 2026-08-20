import { Customer, LedgerEntry, TenantConfig, CustomerBalance } from '../types';
import { calculateCustomerBalance, formatCurrency, formatDate } from './formatters';

// Generate Direct WhatsApp Link for Customer Chat
export const generateWhatsAppShareUrl = (
  customer: Customer,
  tenant: TenantConfig,
  entries: LedgerEntry[]
): string => {
  const activeEntries = entries.filter(e => !e.isRokda);
  const balance: CustomerBalance = calculateCustomerBalance(entries);
  const todayStr = formatDate(new Date().toISOString());
  const invoiceNo = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

  let moneyText = 'Settled (₹0)';
  if (balance.netMoney > 0) {
    moneyText = `₹${Math.round(balance.netMoney).toLocaleString('en-IN')} (Udhar / Owed)`;
  } else if (balance.netMoney < 0) {
    moneyText = `₹${Math.round(Math.abs(balance.netMoney)).toLocaleString('en-IN')} (Jama / Advance)`;
  }

  let goldText = 'Settled (0g)';
  if (balance.netGold > 0) {
    goldText = `${balance.netGold.toFixed(2)}g (Udhar / Owed)`;
  } else if (balance.netGold < 0) {
    goldText = `${Math.abs(balance.netGold).toFixed(2)}g (Jama / Advance)`;
  }

  let silverText = 'Settled (0g)';
  if (balance.netSilver > 0) {
    silverText = `${balance.netSilver.toFixed(1)}g (Udhar / Owed)`;
  } else if (balance.netSilver < 0) {
    silverText = `${Math.abs(balance.netSilver).toFixed(1)}g (Jama / Advance)`;
  }

  // Exact Requested Greeting Format:
  // Line 1: Tax Invoice Bill Statement from Shop Name
  // Line 2: Namaste Customer Name, your visual bill is here:
  const message = `📄 *Tax Invoice Bill Statement from ${tenant.shopName}*

Namaste ${customer.name}, your visual bill is here:

📜 *INVOICE STATEMENT DETAILS:*
• Invoice No: ${invoiceNo}
• Date: ${todayStr}
• Billed To: ${customer.name} (${customer.phone})

📊 *NET ACCOUNT SETTLEMENT SUMMARY:*
💵 *Money Balance:* ${moneyText}
🌟 *Gold Balance:* ${goldText}
🥈 *Silver Balance:* ${silverText}

Total Outstanding Transactions: ${activeEntries.length}

📞 *Shop Contact:* ${tenant.phone}
📍 *Address:* ${tenant.address || 'Soni Vad'}
${tenant.gstin ? `📄 *GSTIN:* ${tenant.gstin}\n` : ''}
_Thank you for your business & trust!_`;

  const encodedMessage = encodeURIComponent(message);
  
  // Clean phone number for WhatsApp link
  let phone = customer.phone.replace(/[^0-9]/g, '');
  if (phone.length === 10) {
    phone = '91' + phone;
  }

  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const triggerPrint = () => {
  window.print();
};
