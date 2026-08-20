import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Customer } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { X, UserPlus, Phone, MapPin, User } from '../common/Icons';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: { name: string; phone: string; address: string }) => void;
  initialCustomer?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer
}) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (initialCustomer) {
      setName(initialCustomer.name);
      setPhone(initialCustomer.phone);
      setAddress(initialCustomer.address);
    } else {
      setName('');
      setPhone('');
      setAddress('');
    }
  }, [initialCustomer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim()
    });

    onClose();
  };

  return createPortal(
    /* Fullscreen Dark Overlay positioned higher up (pt-8) towards top of mobile screen */
    <div className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-md overflow-y-auto p-3 sm:p-4 flex flex-col justify-start items-center pt-8 sm:pt-12 pb-24 animate-fade-in min-h-screen w-full">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-xl w-full overflow-hidden border border-gray-100 shrink-0 mt-2 sm:mt-6">
        
        {/* Header */}
        <div className="bg-gold-500 text-white p-4 md:p-5 relative flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <h2 className="text-base md:text-xl font-black text-white">
              {initialCustomer ? t('editCustomer') : t('addNewCustomer')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gold-100 hover:text-white p-1 rounded-full hover:bg-gold-600 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Simple Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm md:text-base font-black text-gray-800 mb-1.5 md:mb-2">
              {t('customerName')} *
            </label>
            <div className="relative">
              <User className="w-4.5 h-4.5 md:w-5 md:h-5 absolute left-3.5 md:left-4 top-3.5 md:top-4.5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Bhai Patel"
                className="w-full pl-10 md:pl-12 pr-3.5 py-3 md:py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-extrabold text-gray-900"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-base font-black text-gray-800 mb-1.5 md:mb-2">
              {t('phone')} *
            </label>
            <div className="relative">
              <Phone className="w-4.5 h-4.5 md:w-5 md:h-5 absolute left-3.5 md:left-4 top-3.5 md:top-4.5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 md:pl-12 pr-3.5 py-3 md:py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-extrabold text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-base font-black text-gray-800 mb-1.5 md:mb-2">
              {t('address')}
            </label>
            <div className="relative">
              <MapPin className="w-4.5 h-4.5 md:w-5 md:h-5 absolute left-3.5 md:left-4 top-3.5 md:top-4.5 text-gray-400" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Soni Vad, Ahmedabad"
                className="w-full pl-10 md:pl-12 pr-3.5 py-3 md:py-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-extrabold text-gray-900"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-3.5 md:pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 md:px-6 md:py-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm md:text-base font-bold text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 md:px-8 md:py-3.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-white text-xs sm:text-sm md:text-base font-black shadow-md active:scale-95 transition-all"
            >
              {initialCustomer ? t('saveChanges') : t('addCustomerBtn')}
            </button>
          </div>
        </form>

      </div>
    </div>,
    document.body
  );
};
