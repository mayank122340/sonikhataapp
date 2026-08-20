import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldAlert, Store, UserCheck, Smartphone } from './Icons';

interface NavbarProps {
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLogin }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-[#1F2937] items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gold-500 text-white flex items-center justify-center shadow-md font-bold text-xl">
              {user?.role === 'merchant' && user.merchant?.tenantConfig.logoUrl ? (
                <img 
                  src={user.merchant.tenantConfig.logoUrl} 
                  alt="Shop Logo" 
                  className="w-10 h-10 rounded-lg object-cover" 
                  onError={(e) => {
                    // Fallback to initial icon if logo broken
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                '卐'
              )}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-charcoal-900 leading-tight">
                {user?.role === 'merchant' && user.merchant
                  ? user.merchant.tenantConfig.shopName
                  : 'Soni Khata Ledger'}
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                {user?.role === 'super_admin' ? (
                  <span className="text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded font-semibold text-[10px]">
                    SUPER ADMIN PANEL
                  </span>
                ) : user?.role === 'merchant' ? (
                  <span className="text-amber-800 bg-gold-100 px-1.5 py-0.5 rounded font-semibold text-[10px] flex items-center gap-1">
                    <Store className="w-3 h-3" /> MERCHANT PORTAL
                  </span>
                ) : (
                  <span className="text-gray-600 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-gold-500" /> Digital Ledger Book
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <span className="text-xs text-gray-400 block font-medium">Logged in as</span>
                  <span className="text-sm font-semibold text-charcoal-800">{user.username}</span>
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                <UserCheck className="w-4 h-4" />
                Login / Switch Portal
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
