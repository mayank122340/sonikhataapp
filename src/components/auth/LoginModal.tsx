import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Store, KeyRound, AlertCircle, X, CheckCircle2 } from '../common/Icons';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAsAdmin, loginAsMerchant } = useAuth();
  const [role, setRole] = useState<'merchant' | 'super_admin'>('merchant');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === 'super_admin') {
      const success = loginAsAdmin(password);
      if (success) {
        onClose();
      } else {
        setError('Invalid Super Admin password (Try: admin123)');
      }
    } else {
      if (!username.trim()) {
        setError('Please enter Merchant UserID / Username');
        return;
      }
      const res = loginAsMerchant(username, password);
      if (res.success) {
        onClose();
      } else {
        setError(res.message);
      }
    }
  };

  const setDemoMerchant = (user: string, pass: string) => {
    setRole('merchant');
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-gold-500 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-lg">
            卐
          </div>
          <h2 className="text-xl font-bold">Sign In to Khata Ledger</h2>
          <p className="text-xs text-gray-300 mt-1">Select your account type to proceed</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 p-1">
          <button
            type="button"
            onClick={() => { setRole('merchant'); setError(null); }}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              role === 'merchant'
                ? 'bg-white text-gold-600 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Store className="w-4 h-4" />
            Jewelry Merchant
          </button>
          <button
            type="button"
            onClick={() => { setRole('super_admin'); setError(null); }}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              role === 'super_admin'
                ? 'bg-white text-purple-700 shadow-sm border border-gray-200'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Super Admin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {role === 'merchant' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Merchant UserID / Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. shreeram_jewellers"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gold-500 focus:border-gold-500 text-sm"
                  required
                />
              </div>

              {/* Quick Demo Credentials Box */}
              <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 -mb-2 p-4 text-xs">
                <span className="font-semibold text-gray-700 block mb-2">⚡ One-Click Demo Logins:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoMerchant('shreeram_jewellers', 'password123')}
                    className="p-2 bg-white border border-gray-200 rounded-md text-left hover:border-gold-500 transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-gray-900 block truncate">Shree Ram Jewellers</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Active Merchant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoMerchant('navratri_ornaments', 'password123')}
                    className="p-2 bg-white border border-gray-200 rounded-md text-left hover:border-gold-500 transition-colors shadow-2xs"
                  >
                    <span className="font-bold text-gray-900 block truncate">Navratri Ornaments</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Active Merchant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoMerchant('soni_heritage', 'password123')}
                    className="p-2 bg-white border border-gray-200 rounded-md text-left hover:border-red-300 transition-colors col-span-1 sm:col-span-2 shadow-2xs"
                  >
                    <span className="font-bold text-gray-900 block truncate">Soni Heritage (Locked)</span>
                    <span className="text-[10px] text-red-600 font-semibold">Test Inactive Remote Lock</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Super Admin Security Passcode
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default: admin123"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    required
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  🔑 Demo Admin Passcode: <code className="bg-gray-100 px-1 py-0.5 rounded text-purple-700 font-mono font-bold">admin123</code>
                </p>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-white text-sm shadow-md transition-all ${
                role === 'super_admin'
                  ? 'bg-purple-700 hover:bg-purple-800 focus:ring-2 focus:ring-purple-500'
                  : 'bg-gold-500 hover:bg-gold-600 focus:ring-2 focus:ring-gold-400'
              }`}
            >
              Sign In to {role === 'super_admin' ? 'Super Admin Panel' : 'Merchant Portal'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
