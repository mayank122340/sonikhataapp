import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'gu';

const translations = {
  en: {
    money: 'Money',
    gold: 'Gold',
    silver: 'Silver',
    udhar: 'Udhar',
    jama: 'Jama',
    nil: 'Nil',
    back: 'Back',
    edit: 'Edit',
    entry: 'Entry',
    bill: 'Bill',
    whatsapp: 'WhatsApp',
    ledgerHistory: 'Ledger History',
    searchEntries: 'Search entries / hastak...',
    showMore: 'Show More Entries',
    remaining: 'remaining',
    hastak: 'Hastak',
    addNewCustomer: 'Add New Customer',
    editCustomer: 'Edit Customer',
    customerName: 'Customer Name',
    phone: 'Phone Number',
    address: 'Address',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    addCustomerBtn: 'Add Customer',
    newTransaction: 'New Transaction Entry',
    editTransaction: 'Edit Entry',
    remarks: 'Item Remarks / Description',
    recordEntry: 'Record Entry',
    confirmDeleteTitle: 'Confirm Delete Entry',
    confirmDeleteMsg: 'Are you sure you want to delete this ledger transaction entry?',
    deleteBtn: 'Delete Entry',
    confirmEditTitle: 'Confirm Update Entry',
    confirmEditMsg: 'Are you sure you want to save the edited changes for this ledger transaction?',
    saveBtn: 'Save Changes',
    confirmRokdaTitle: 'Mark as Rokda (Settled)?',
    confirmRokdaMsg: 'Kya aap is entry ko Rokda (Settled) mark karna chahte hain? Yeh entry net balance se minus ho jayegi aur bill mein nahi aayegi, lekin record mein saved rahegi.',
    confirmUnrokdaTitle: 'Undo Rokda?',
    confirmUnrokdaMsg: 'Kya aap is entry ka Rokda status hatana chahte hain? Yeh entry net balance mein wapas jod di jayegi.',
    confirmRokdaBtn: 'Haan, Rokda Karo',
    confirmUnrokdaBtn: 'Haan, Undo Karo',
    rokda: 'Rokda',
    settled: 'Settled',
    netSettlementTitle: 'NET KHATA ACCOUNT SETTLEMENT SUMMARY',
    netUdhar: 'Net Udhar',
    netJama: 'Net Jama',
    billedTo: 'BILLED TO CUSTOMER',
    customerAddress: 'CUSTOMER ADDRESS',
    dateTime: 'Date & Time',
    descHastak: 'Description & Hastak',
    moneyCol: 'Money (₹)',
    goldCol: 'Gold (g)',
    silverCol: 'Silver (g)',
    invoiceDetails: 'INVOICE STATEMENT DETAILS',
    statementInvoice: 'STATEMENT INVOICE',
    printSave: 'Print / Save',
    sharePdf: 'Share PDF to WhatsApp',
    billScope: 'Bill Scope',
    last15: 'Last 15',
    last30: 'Last 30',
    all: 'All',
    searchCustomer: 'Search name or phone...',
    customers: 'Customers',
    registerCustomerBtn: 'Register Customer',
    noCustomers: 'No customers registered yet',
    logout: 'Log Out',
    terms: 'Terms & Conditions',
    authorizedSign: 'Authorized Signature / Stamp',
    forShop: 'For',
    creatingPdf: 'Creating PDF...',
    cloudSynced: 'Cloud Synced',
    cloudSyncing: 'Syncing...',
    settings: 'Settings',
    backToDashboard: 'Back to Dashboard',
    downloadBackup: 'Download Backup',
    backupIndex: 'Backup Index',
    backupDesc: 'Download offline database backup file of all customer accounts and transaction history. Keep these files safe for recovery.',
    self: 'Self',
    optional: 'Optional'
  },
  gu: {
    money: 'નાણાં (રૂપિયા)',
    gold: 'સોનું',
    self: 'પોતે (Self)',
    silver: 'ચાંદી',
    udhar: 'ઉધાર',
    jama: 'જમા',
    nil: 'નિલ',
    back: 'પાછા',
    edit: 'સુધારો',
    entry: 'એન્ટ્રી',
    bill: 'બીલ',
    whatsapp: 'વોટ્સએપ',
    ledgerHistory: 'ખાતા હિસ્ટ્રી',
    searchEntries: 'એન્ટ્રીઓ / હસ્તક શોધો...',
    showMore: 'વધુ એન્ટ્રીઓ બતાવો',
    remaining: 'બાકી',
    hastak: 'હસ્તક',
    addNewCustomer: 'નવો ગ્રાહક ઉમેરો',
    editCustomer: 'ગ્રાહક વિગતો બદલો',
    customerName: 'ગ્રાહકનું નામ',
    phone: 'ફોન નંબર',
    address: 'સરનામું',
    cancel: 'રદ કરો',
    saveChanges: 'ફેરફાર સાચવો',
    addCustomerBtn: 'ગ્રાહક ઉમેરો',
    newTransaction: 'નવી વ્યવહાર એન્ટ્રી',
    editTransaction: 'એન્ટ્રી સુધારો',
    remarks: 'વસ્તુ વિગત / વર્ણન',
    recordEntry: 'એન્ટ્રી ઉમેરો',
    confirmDeleteTitle: 'એન્ટ્રી કાઢી નાખવાની પુષ્ટિ',
    confirmDeleteMsg: 'શું તમે ખરેખર આ ખાતાવહી વ્યવહાર એન્ટ્રી કાઢી નાખવા માંગો છો?',
    deleteBtn: 'એન્ટ્રી કાઢી નાખો',
    confirmEditTitle: 'સુધારેલ ફેરફાર સાચવો',
    confirmEditMsg: 'શું તમે આ ખાતાવહી વ્યવહારમાં કરેલા સુધારા સાચવવા માંગો છો?',
    semibold: 'સાચવો',
    saveBtn: 'સાચવો',
    confirmRokdaTitle: 'રોકડા (પતાવટ) માર્ક કરવું છે?',
    confirmRokdaMsg: 'શું તમે આ એન્ટ્રીને રોકડા (પતાવટ) માર્ક કરવા માંગો છો? આ રકમ ચોખ્ખા બેલેન્સમાંથી બાદ થઈ જશે અને બિલમાં નહીં આવે, પણ રેકોર્ડમાં રહેશે.',
    confirmUnrokdaTitle: 'રોકડા પતાવટ રદ કરવી છે?',
    confirmUnrokdaMsg: 'શું તમે આ એન્ટ્રીની રોકડા પતાવટ રદ કરવા માંગો છો? આ રકમ ફરીથી ઉધાર/જમા બેલેન્સમાં ઉમેરાઈ જશે.',
    confirmRokdaBtn: 'હા, રોકડા કરો',
    confirmUnrokdaBtn: 'હા, રદ કરો',
    rokda: 'રોકડા',
    settled: 'ચૂકતે',
    netSettlementTitle: 'ચોખ્ખો ખાતા પતાવટ સારાંશ',
    netUdhar: 'ચોખ્ખું ઉધાર',
    netJama: 'ચોખ્ખું જમા',
    billedTo: 'ગ્રાહકની વિગત',
    customerAddress: 'ગ્રાહકનું સરનામું',
    dateTime: 'તારીખ અને સમય',
    descHastak: 'વિગત અને હસ્તક',
    moneyCol: 'રૂપિયા (₹)',
    goldCol: 'સોનું (ગ્રામ)',
    silverCol: 'ચાંદી (ગ્રામ)',
    invoiceDetails: 'સ્ટેટમેન્ટ વિગતો',
    statementInvoice: 'બીલ સ્ટેટમેન્ટ',
    printSave: 'પ્રિન્ટ / સેવ',
    sharePdf: 'બીલ વોટ્સએપ પર મોકલો',
    billScope: 'બીલ લિમિટ',
    last15: 'છેલ્લા ૧૫',
    last30: 'છેલ્લા ૩૦',
    all: 'બધા',
    searchCustomer: 'નામ અથવા ફોન નંબર શોધો...',
    customers: 'ગ્રાહકો',
    registerCustomerBtn: 'નવો ગ્રાહક ઉમેરો',
    noCustomers: 'હજુ સુધી કોઈ ગ્રાહકો નથી',
    logout: 'લોગ આઉટ',
    terms: 'નિયમો અને શરતો',
    authorizedSign: 'અધિકૃત સહી / સિક્કો',
    creatingPdf: 'પીડીએફ બને છે...',
    cloudSynced: 'ક્લાઉડ સિંક ચાલુ છે',
    cloudSyncing: 'કનેક્ટ થઈ રહ્યું છે...',
    settings: 'સેટિંગ્સ',
    backToDashboard: 'ડેશબોર્ડ પર પાછા',
    downloadBackup: 'બેકઅપ ડાઉનલોડ કરો',
    backupIndex: 'બેકઅપ ક્રમ',
    backupDesc: 'બધા ગ્રાહક ખાતાઓ અને વ્યવહારના ઇતિહાસની ઑફલાઇન ડેટાબેઝ બેકઅપ ફાઇલ ડાઉનલોડ કરો. પુનઃપ્રાપ્તિ માટે આ ફાઇલોને સુરક્ષિત રાખો.',
    optional: 'વૈકલ્પિક'
  }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('soni_khata_lang') as Language) || 'en';
  });

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'en' ? 'gu' : 'en';
      localStorage.setItem('soni_khata_lang', next);
      return next;
    });
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
