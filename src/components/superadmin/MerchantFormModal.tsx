import React, { useState, useEffect, useRef } from 'react';
import { Merchant, TenantConfig } from '../../types';
import { X, Store, Sparkles, Award, Upload, Calendar, Clock, Package } from '../common/Icons';

interface MerchantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (merchantData: Omit<Merchant, 'id' | 'createdAt'>) => void;
  initialMerchant?: Merchant | null;
}

export const MerchantFormModal: React.FC<MerchantFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMerchant
}) => {
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  // Tenant Config
  const [shopName, setShopName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [billHeaderNotes, setBillHeaderNotes] = useState('');
  const [termsConditions, setTermsConditions] = useState('');

  // Asset Enable/Disable Controls for Gold & Silver
  const [enableGold, setEnableGold] = useState(true);
  const [enableSilver, setEnableSilver] = useState(true);
  const [enableBillPhotos, setEnableBillPhotos] = useState(false);
  const [entryFormLayout, setEntryFormLayout] = useState<'remarks_first' | 'assets_first'>('remarks_first');
  const [allowManualDate, setAllowManualDate] = useState(false);
  const [enableTime, setEnableTime] = useState(true);
  const [enableStock, setEnableStock] = useState(false);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const compressed = await compressImage(files[0]);
      setLogoUrl(compressed);
    } catch (err) {
      console.error('Logo upload failed:', err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  useEffect(() => {
    if (initialMerchant) {
      setUsername(initialMerchant.username);
      setPassword(initialMerchant.password);
      setSubscriptionActive(initialMerchant.subscriptionActive);

      setShopName(initialMerchant.tenantConfig.shopName);
      setLogoUrl(initialMerchant.tenantConfig.logoUrl);
      setPhone(initialMerchant.tenantConfig.phone);
      setAddress(initialMerchant.tenantConfig.address);
      setGstin(initialMerchant.tenantConfig.gstin || '');
      setBillHeaderNotes(initialMerchant.tenantConfig.billHeaderNotes || '');
      setTermsConditions(initialMerchant.tenantConfig.termsConditions || '');

      setEnableGold(initialMerchant.tenantConfig.enableGold !== false);
      setEnableSilver(initialMerchant.tenantConfig.enableSilver !== false);
      setEnableBillPhotos(initialMerchant.tenantConfig.enableBillPhotos === true);
      setEntryFormLayout(initialMerchant.tenantConfig.entryFormLayout || 'remarks_first');
      setAllowManualDate(initialMerchant.tenantConfig.allowManualDate === true);
      setEnableTime(initialMerchant.tenantConfig.enableTime !== false);
      setEnableStock(initialMerchant.tenantConfig.enableStock === true);
    } else {
      setUsername('');
      setPassword('password123');
      setSubscriptionActive(true);

      setShopName('');
      setLogoUrl('');
      setPhone('');
      setAddress('');
      setGstin('');
      setBillHeaderNotes('Certified 22K/18K Hallmarked Gold & Pure 925 Silver Ornaments');
      setTermsConditions('1. Ornaments tested on digital purity scale.\n2. Goods once sold cannot be returned without cash memo.');
      
      setEnableGold(true);
      setEnableSilver(true);
      setEnableBillPhotos(false);
      setEntryFormLayout('remarks_first');
      setAllowManualDate(false);
      setEnableTime(true);
      setEnableStock(false);
    }
  }, [initialMerchant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !shopName.trim()) return;

    // Both Gold and Silver can be turned OFF if merchant only trades in Money (₹)
    const tenantConfig: TenantConfig = {
      shopName: shopName.trim(),
      logoUrl: logoUrl.trim(),
      phone: phone.trim(),
      address: address.trim(),
      gstin: gstin.trim(),
      billHeaderNotes: billHeaderNotes.trim(),
      termsConditions: termsConditions.trim(),
      enableGold,
      enableSilver,
      enableBillPhotos,
      entryFormLayout,
      allowManualDate,
      enableTime,
      enableStock
    };

    onSave({
      username: username.trim().toLowerCase(),
      password: password.trim(),
      subscriptionActive,
      tenantConfig
    });

    onClose();
  };

  return (
    /* Fullscreen Dark Purple Overlay covering 100% viewport */
    <div className="fixed inset-0 z-[100] bg-purple-950/95 backdrop-blur-md overflow-y-auto p-2 sm:p-4 flex flex-col justify-start items-center pt-4 sm:pt-6 pb-20 animate-fade-in min-h-screen w-full">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-purple-300 shrink-0 mt-1 sm:mt-2">
        
        {/* Compact Header */}
        <div className="bg-purple-950 text-white px-3.5 py-2.5 relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-purple-300" />
            <h2 className="text-xs sm:text-sm font-bold text-white leading-tight">
              {initialMerchant ? 'Edit SaaS Merchant' : 'Register New SaaS Merchant'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white p-1 rounded-full hover:bg-purple-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Complete Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-2.5 max-h-[82vh] overflow-y-auto">
          
          {/* Section 1: Shop White-Label Branding */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-purple-950 uppercase tracking-wider block border-b pb-0.5">
              1. Shop White-Label Branding
            </span>

            <div>
              <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Shop Name *</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Shree Ram Jewellers"
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-bold text-gray-900"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-0.5">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="24ABCDE1234F1Z5"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-mono font-bold text-purple-950 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Shop Logo (Optional)</label>
                <input
                  type="file"
                  ref={logoFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoFileChange}
                />
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 text-purple-900 rounded-lg text-[10px] font-black text-center active:scale-95 transition-transform flex items-center justify-center gap-1"
                  >
                    <Upload className="w-3 h-3 text-purple-700 shrink-0" />
                    <span>{isUploadingLogo ? 'Processing...' : 'Choose Logo'}</span>
                  </button>
                  {logoUrl && (
                    <div className="relative w-7 h-7 rounded border border-gray-200 overflow-hidden shrink-0">
                      <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center text-[8px] font-bold hover:bg-black/75 opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Del
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">City / Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Soni Vad, Ahmedabad"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ASSET TRADING TOGGLES (INDEPENDENT GOLD & SILVER ON/OFF) */}
          <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-purple-950 uppercase tracking-wider block">
                2. Trading Asset Toggles (Money is Always ON)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              
              {/* Gold Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                enableGold ? 'bg-amber-50 border-amber-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-bold text-gray-900">Gold (Sona)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableGold(!enableGold)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    enableGold ? 'bg-amber-600 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {enableGold ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Silver Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                enableSilver ? 'bg-slate-50 border-slate-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-xs font-bold text-gray-900">Silver (Chandi)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableSilver(!enableSilver)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    enableSilver ? 'bg-slate-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {enableSilver ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Bill Photo Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                enableBillPhotos ? 'bg-purple-50 border-purple-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Upload className="w-3.5 h-3.5 text-purple-700" />
                  <span className="text-xs font-bold text-gray-900">Bill Photo Upload</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableBillPhotos(!enableBillPhotos)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    enableBillPhotos ? 'bg-purple-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {enableBillPhotos ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Manual Date Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                allowManualDate ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                  <span className="text-xs font-bold text-gray-900">Allow Manual Date</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowManualDate(!allowManualDate)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    allowManualDate ? 'bg-indigo-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {allowManualDate ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Capture Time Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                enableTime ? 'bg-teal-50 border-teal-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-700" />
                  <span className="text-xs font-bold text-gray-900">Capture Time</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableTime(!enableTime)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    enableTime ? 'bg-teal-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {enableTime ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Stock Management Toggle */}
              <div className={`p-2 rounded-lg border transition-all flex items-center justify-between ${
                enableStock ? 'bg-amber-50 border-amber-300' : 'bg-gray-100 border-gray-200 opacity-60'
              }`}>
                <div className="flex items-center space-x-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-xs font-bold text-gray-900">Stock Management</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEnableStock(!enableStock)}
                  className={`px-2 py-0.5 rounded text-[10px] font-black transition-all ${
                    enableStock ? 'bg-amber-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {enableStock ? 'ON' : 'OFF'}
                </button>
              </div>

            </div>
          </div>

          {/* Section 3: Bill Customization Notes */}
          <div className="space-y-2 pt-0.5">
            <span className="text-[10px] font-black text-purple-950 uppercase tracking-wider block border-b pb-0.5">
              3. Custom Bill Invoice Header & Terms
            </span>

            <div>
              <label className="block text-[10px] font-semibold text-gray-800 mb-0.5">Bill Header Tagline / Subtitle</label>
              <input
                type="text"
                value={billHeaderNotes}
                onChange={(e) => setBillHeaderNotes(e.target.value)}
                placeholder="e.g. Certified 22K/18K Hallmarked Gold & 925 Silver Ornaments"
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-800 mb-0.5">Terms & Conditions</label>
              <textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows={2}
                placeholder="1. All ornaments tested on purity scale."
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Entry Form Layout (એન્ટ્રી ફોર્મ ગોઠવણી)</label>
              <select
                value={entryFormLayout}
                onChange={(e) => setEntryFormLayout(e.target.value as 'remarks_first' | 'assets_first')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-semibold text-gray-900 bg-white"
              >
                <option value="remarks_first">Remarks First, then Assets (વિગત પહેલા, પછી એસેટ્સ)</option>
                <option value="assets_first">Assets First, then Remarks (એસેટ્સ પહેલા, પછી વિગત)</option>
              </select>
            </div>
          </div>

          {/* Section 4: Login Credentials */}
          <div className="space-y-2 pt-0.5">
            <span className="text-[10px] font-black text-purple-950 uppercase tracking-wider block border-b pb-0.5">
              4. Merchant Login Credentials
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Login UserID *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="shreeram_jewellers"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-mono font-bold text-purple-950"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-800 mb-0.5">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 text-xs font-medium text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-purple-950 hover:bg-purple-900 text-white text-xs font-black shadow-md active:scale-95 transition-all"
            >
              {initialMerchant ? 'Save Changes' : 'Register Merchant'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
