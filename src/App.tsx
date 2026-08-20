import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AdminDashboard } from './components/superadmin/AdminDashboard';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { MerchantSettings } from './components/merchant/MerchantSettings';
import { Store, LogOut, KeyRound, AlertCircle, ShieldCheck, Settings } from './components/common/Icons';

const MainContent: React.FC = () => {
  const { user, loginAsAdmin, loginAsMerchant, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { isSynced } = useData();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShowUpdateToast(true);
    };
    window.addEventListener('pwa-update-available', handleUpdate);
    return () => window.removeEventListener('pwa-update-available', handleUpdate);
  }, []);

  const handleApplyUpdate = () => {
    window.location.reload();
  };
  
  // Detect if accessing Super Admin route via /admin or ?admin=true
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.search.includes('admin');
  });

  // Prevent PWA manifest loading and install prompts on Super Admin route
  useEffect(() => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (isAdminRoute) {
      if (manifestLink) {
        manifestLink.remove();
      }
    } else {
      if (!manifestLink) {
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = '/manifest.json';
        document.head.appendChild(link);
      }
    }

    const preventInstall = (e: Event) => {
      if (isAdminRoute) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeinstallprompt', preventInstall);
    return () => window.removeEventListener('beforeinstallprompt', preventInstall);
  }, [isAdminRoute]);

  // Admin login passcode state
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  // Merchant login form state
  const [merchantUser, setMerchantUser] = useState('');
  const [merchantPass, setMerchantPass] = useState('');
  const [merchantError, setMerchantError] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin') || window.location.search.includes('admin'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    const success = loginAsAdmin(adminPass);
    if (!success) {
      setAdminError('Invalid Super Admin passcode (Try: admin123)');
    }
  };

  const handleMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantError(null);
    if (!merchantUser.trim()) {
      setMerchantError('Please enter Merchant UserID');
      return;
    }
    const res = loginAsMerchant(merchantUser, merchantPass);
    if (!res.success) {
      setMerchantError(res.message);
    }
  };

  const setDemoMerchant = (u: string, p: string) => {
    setMerchantUser(u);
    setMerchantPass(p);
    setMerchantError(null);
  };

  // =========================================================================
  // ROUTE 1: SUPER ADMIN PORTAL (/admin or ?admin=true)
  // Completely isolated for SaaS App Owner
  // =========================================================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-purple-950/5 flex flex-col font-sans selection:bg-purple-700 selection:text-white">
        
        {/* Isolated Super Admin Navbar */}
        <header className="bg-purple-950 text-white border-b border-purple-900 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-800 text-purple-200 flex items-center justify-center font-bold text-lg">
                卐
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                  Super Admin SaaS Control Panel
                </h1>
                <p className="text-[10px] text-purple-300 font-semibold tracking-wider uppercase">
                  Merchant Management & Remote Subscriptions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-700 bg-purple-900 text-[10px] font-black text-purple-100 hover:bg-purple-800 transition-colors shadow-2xs"
              >
                🌐 {language === 'en' ? 'ગુજરાતી' : 'English'}
              </button>
              {user?.role === 'super_admin' ? (
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-900 hover:bg-purple-800 text-xs font-semibold text-purple-100 transition-colors border border-purple-800"
                >
                  <LogOut className="w-4 h-4 text-purple-300" />
                  <span>Admin Logout</span>
                </button>
              ) : (
                <a
                  href="/"
                  className="text-xs text-purple-300 hover:text-white underline font-semibold"
                >
                  Go to Merchant Portal →
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Super Admin Body */}
        <main className="flex-1">
          {user?.role === 'super_admin' ? (
            <AdminDashboard />
          ) : (
            /* Super Admin Security Login Screen */
            <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-purple-100">
                <div className="bg-purple-950 text-white p-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-800 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-purple-200" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Super Admin Access</h2>
                  <p className="text-xs text-purple-200">Enter passcode to access SaaS merchant control center</p>
                </div>

                <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
                  {adminError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Super Admin Security Passcode
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                      <input
                        type="password"
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder="Default: admin123"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 text-sm font-mono"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      🔑 Admin Passcode: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-purple-700 font-bold">admin123</code>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-sm shadow-lg transition-transform active:scale-95"
                  >
                    Authenticate Super Admin
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // ROUTE 2: SEPARATE MERCHANT / SHOP PORTAL (Default /)
  // Absolutely NO Super Admin icons or buttons displayed here!
  // =========================================================================
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-gold-500 selection:text-white">
      
      {/* Merchant Clean Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gold-500 text-white flex items-center justify-center shadow-md font-bold text-xl shrink-0">
              {user?.role === 'merchant' && user.merchant?.tenantConfig.logoUrl ? (
                <img
                  src={user.merchant.tenantConfig.logoUrl}
                  alt="Shop Logo"
                  className="w-10 h-10 rounded-xl object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : (
                '卐'
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate">
                {user?.role === 'merchant' && user.merchant
                  ? user.merchant.tenantConfig.shopName
                  : 'Soni Jewelry Merchant Ledger'}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-gray-500 font-medium">Digital Khata Book</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Real-time Cloud Sync Status Indicator */}
            <div 
              className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg"
              title={isSynced ? t('cloudSynced') : t('cloudSyncing')}
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSynced ? 'bg-green-500 animate-pulse' : 'bg-amber-400 animate-bounce'}`} />
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 select-none uppercase tracking-wide hidden sm:inline-block">
                {isSynced ? t('cloudSynced') : t('cloudSyncing')}
              </span>
            </div>

            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-gold-300 bg-amber-50 text-[10px] sm:text-[11px] font-black text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
            >
              🌐 <span className="hidden xs:inline">{language === 'en' ? 'ગુજરાતી' : 'English'}</span>
              <span className="xs:hidden">{language === 'en' ? 'ગુજ' : 'EN'}</span>
            </button>

            {/* Settings Icon (Only for Merchant) */}
            {user?.role === 'merchant' && (
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-1.5 sm:p-2 rounded-lg border transition-colors shadow-2xs ${
                  isSettingsOpen
                    ? 'bg-gray-900 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
                title={t('settings')}
              >
                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {user?.role === 'merchant' && (
              <button
                onClick={logout}
                className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-gray-200 text-[11px] sm:text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                <span className="hidden xs:inline">{t('logout')}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Merchant Body */}
      <main className="flex-1">
        {user?.role === 'merchant' ? (
          isSettingsOpen ? (
            <MerchantSettings onBack={() => setIsSettingsOpen(false)} />
          ) : (
            <MerchantDashboard />
          )
        ) : (
          /* Merchant Dedicated Login Portal (Zero Admin Icons!) */
          <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 space-y-6">
              
              {/* Header Banner */}
              <div className="bg-gray-900 text-white p-6 text-center space-y-2 relative">
                <div className="w-12 h-12 rounded-2xl bg-gold-500 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md">
                  卐
                </div>
                <h2 className="text-xl font-bold text-white">Jewelry Merchant Portal</h2>
                <p className="text-xs text-gray-300">Log in to manage your customer credit & deposit ledgers</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleMerchantSubmit} className="p-6 space-y-4">
                {merchantError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{merchantError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Merchant UserID / Username *
                  </label>
                  <input
                    type="text"
                    value={merchantUser}
                    onChange={(e) => setMerchantUser(e.target.value)}
                    placeholder="e.g. shreeram_jewellers"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm font-semibold"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={merchantPass}
                    onChange={(e) => setMerchantPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm"
                    required
                  />
                </div>

                {/* 1-Click Merchant Demo Credentials */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    ⚡ Quick Merchant Demo Logins:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDemoMerchant('shreeram_jewellers', 'password123')}
                      className="p-2.5 bg-gray-50 hover:bg-gold-50 border border-gray-200 rounded-xl text-left transition-all"
                    >
                      <span className="font-bold text-xs text-gray-900 block truncate">Shree Ram Jewellers</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Active Store</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoMerchant('navratri_ornaments', 'password123')}
                      className="p-2.5 bg-gray-50 hover:bg-gold-50 border border-gray-200 rounded-xl text-left transition-all"
                    >
                      <span className="font-bold text-xs text-gray-900 block truncate">Navratri Ornaments</span>
                      <span className="text-[10px] text-emerald-600 font-bold">Active Store</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-extrabold text-sm shadow-md transition-transform active:scale-95"
                  >
                    Log In to Khata Book
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-xs text-gray-400 print:hidden">
        <p>© 2026 SoniKhataApp | Made by Mayank (Tulsi Diamond)</p>
      </footer>

      {/* PWA Update Notification Toast */}
      {showUpdateToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-gray-900 border border-gray-800 text-white p-4 rounded-2xl shadow-xl z-50 flex flex-col gap-3 animate-slide-up">
          <div className="flex items-start gap-2.5">
            <span className="text-xl">🚀</span>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-white">
                {language === 'en' ? 'Update Available!' : 'નવું અપડેટ ઉપલબ્ધ છે!'}
              </h4>
              <p className="text-[11px] text-gray-400 font-medium">
                {language === 'en' 
                  ? 'A new version of Khata Admin is ready. Reload to apply changes.' 
                  : 'નવું વર્ઝન તૈયાર છે. બદલાવો લાગુ કરવા માટે પેજ રીલોડ કરો.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowUpdateToast(false)}
              className="px-3 py-1.5 rounded-lg text-[11px] text-gray-400 font-bold hover:bg-gray-800 transition-colors"
            >
              {language === 'en' ? 'Later' : 'પછીથી'}
            </button>
            <button
              onClick={handleApplyUpdate}
              className="px-3 py-1.5 rounded-lg text-[11px] bg-gold-500 hover:bg-gold-600 text-white font-extrabold shadow-sm transition-transform active:scale-95"
            >
              {language === 'en' ? 'Reload Now' : 'રીલોડ કરો'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <LanguageProvider>
          <MainContent />
        </LanguageProvider>
      </DataProvider>
    </AuthProvider>
  );
}
