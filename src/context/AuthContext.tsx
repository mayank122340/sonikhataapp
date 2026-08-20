import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Merchant } from '../types';
import { getMerchants } from '../services/storageService';

interface AuthContextType {
  user: AuthUser | null;
  loginAsAdmin: (pass: string) => boolean;
  loginAsMerchant: (username: string, pass: string) => { success: boolean; message: string };
  logout: () => void;
  checkSubscriptionStatus: () => boolean;
  refreshMerchantData: () => void;
}

const AUTH_STORAGE_KEY = 'soni_khata_current_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Periodic and reactive check for remote subscription deactivation
  useEffect(() => {
    if (user && user.role === 'merchant' && user.merchantId) {
      const merchants = getMerchants();
      const current = merchants.find(m => m.id === user.merchantId);
      
      if (!current || !current.subscriptionActive) {
        // Immediate remote logout enforcement!
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        alert('⚠️ Your merchant subscription has been deactivated or locked by the Super Admin. You have been logged out.');
      } else if (current && JSON.stringify(current.tenantConfig) !== JSON.stringify(user.merchant?.tenantConfig)) {
        // Update live white-labeling tenant config changes in session
        setUser(prev => prev ? { ...prev, merchant: current } : null);
      }
    }
  }, [user]);

  const loginAsAdmin = (pass: string): boolean => {
    if (pass === 'admin123' || pass === 'admin') {
      const adminUser: AuthUser = {
        role: 'super_admin',
        username: 'Super Admin'
      };
      setUser(adminUser);
      return true;
    }
    return false;
  };

  const loginAsMerchant = (username: string, pass: string): { success: boolean; message: string } => {
    const merchants = getMerchants();
    const found = merchants.find(
      m => m.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!found) {
      return { success: false, message: 'Merchant account not found' };
    }

    if (found.password && found.password !== pass) {
      return { success: false, message: 'Invalid password' };
    }

    if (!found.subscriptionActive) {
      return { 
        success: false, 
        message: 'Your merchant subscription is inactive/locked. Please contact Super Admin.' 
      };
    }

    const merchantUser: AuthUser = {
      role: 'merchant',
      username: found.username,
      merchantId: found.id,
      merchant: found
    };

    setUser(merchantUser);
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const checkSubscriptionStatus = (): boolean => {
    if (!user || user.role !== 'merchant' || !user.merchantId) return true;
    const merchants = getMerchants();
    const current = merchants.find(m => m.id === user.merchantId);
    if (!current || !current.subscriptionActive) {
      logout();
      return false;
    }
    return true;
  };

  const refreshMerchantData = () => {
    if (user && user.role === 'merchant' && user.merchantId) {
      const merchants = getMerchants();
      const current = merchants.find(m => m.id === user.merchantId);
      if (current) {
        setUser(prev => prev ? { ...prev, merchant: current } : null);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginAsAdmin,
      loginAsMerchant,
      logout,
      checkSubscriptionStatus,
      refreshMerchantData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
