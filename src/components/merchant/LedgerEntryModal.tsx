import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LedgerEntry, TransactionType, TenantConfig } from '../../types';
import { formatDate, formatTime12Hr } from '../../utils/formatters';
import { useLanguage } from '../../context/LanguageContext';
import { X, FileText, User, Coins, Sparkles, Award, Camera, Image } from '../common/Icons';

interface LedgerEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entryData: Omit<LedgerEntry, 'id' | 'createdAt' | 'merchantId' | 'customerId'>) => void;
  initialEntry?: LedgerEntry | null;
  customerName: string;
  merchantTenant?: TenantConfig;
}

export const LedgerEntryModal: React.FC<LedgerEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEntry,
  customerName,
  merchantTenant
}) => {
  const { t, language } = useLanguage();
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getCurrentTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const [date, setDate] = useState(getTodayDate());
  const [time, setTime] = useState(getCurrentTime());
  const [description, setDescription] = useState('');
  const [hastak, setHastak] = useState('');

  // Asset 1: Money
  const [moneyType, setMoneyType] = useState<TransactionType>('udhar');
  const [moneyAmount, setMoneyAmount] = useState<string>('');

  // Asset 2: Gold
  const [goldType, setGoldType] = useState<TransactionType>('udhar');
  const [goldWeightGrams, setGoldWeightGrams] = useState<string>('');

  // Asset 3: Silver
  const [silverType, setSilverType] = useState<TransactionType>('udhar');
  const [silverWeightGrams, setSilverWeightGrams] = useState<string>('');

  // Bill Image Attachment
  const [billImageUrl, setBillImageUrl] = useState('');
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);
  const moneyInputRef = useRef<HTMLInputElement>(null);
  const hastakInputRef = useRef<HTMLInputElement>(null);

  // Admin Asset Toggle Controls
  const isGoldEnabledByAdmin = merchantTenant?.enableGold !== false;
  const isSilverEnabledByAdmin = merchantTenant?.enableSilver !== false;
  const isBillPhotosEnabledByAdmin = merchantTenant?.enableBillPhotos === true;
  const isAssetsFirst = merchantTenant?.entryFormLayout === 'assets_first';

  // Show Gold row if Enabled by Admin OR if Editing an existing entry that already has Gold data!
  const hasGoldValue = initialEntry && initialEntry.goldWeightGrams > 0;
  const showGoldField = isGoldEnabledByAdmin || hasGoldValue;
  
  // Show Silver row if Enabled by Admin OR if Editing an existing entry that already has Silver data!
  const hasSilverValue = initialEntry && initialEntry.silverWeightGrams > 0;
  const showSilverField = isSilverEnabledByAdmin || hasSilverValue;

  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    const target = e.target as HTMLElement;
    const isEnterKey = e.key === 'Enter' || e.keyCode === 13 || e.which === 13;
    if (isEnterKey && target.tagName === 'INPUT') {
      const form = e.currentTarget;
      // Get all input elements in the form that are not file inputs or disabled
      const inputs = Array.from(
        form.querySelectorAll('input:not([type="file"]):not([disabled])')
      ) as HTMLInputElement[];

      // Sort by visual position on the screen
      inputs.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top || rectA.left - rectB.left;
      });

      const index = inputs.indexOf(target as HTMLInputElement);

      if (index > -1 && index < inputs.length - 1) {
        e.preventDefault();
        inputs[index + 1].focus();
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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
            resolve(canvas.toDataURL('image/jpeg', 0.6));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = () => resolve('');
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const compressed = await compressImage(files[0]);
      setBillImageUrl(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialEntry) {
        setDate(initialEntry.date);
        setTime(initialEntry.time || getCurrentTime());
        setDescription(initialEntry.description);
        setHastak(initialEntry.hastak || '');
        
        setMoneyType(initialEntry.moneyType);
        setMoneyAmount(initialEntry.moneyAmount > 0 ? String(initialEntry.moneyAmount) : '');

        setGoldType(initialEntry.goldType);
        setGoldWeightGrams(initialEntry.goldWeightGrams > 0 ? String(initialEntry.goldWeightGrams) : '');

        setSilverType(initialEntry.silverType);
        setSilverWeightGrams(initialEntry.silverWeightGrams > 0 ? String(initialEntry.silverWeightGrams) : '');
        
        setBillImageUrl(initialEntry.billImageUrl || '');
      } else {
        setDate(getTodayDate());
        setTime(getCurrentTime());
        setDescription('');
        setHastak('');

        setMoneyType('udhar');
        setMoneyAmount('');

        setGoldType('udhar');
        setGoldWeightGrams('');

        setSilverType('udhar');
        setSilverWeightGrams('');
        
        setBillImageUrl('');
      }
      setIsImagePreviewOpen(false);
      
      // Dynamic autofocus based on layout config
      setTimeout(() => {
        if (isAssetsFirst) {
          moneyInputRef.current?.focus();
        } else {
          descriptionInputRef.current?.focus();
        }
      }, 50);
    }
  }, [initialEntry, isOpen, isAssetsFirst]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Intercept mobile numeric keyboard "Enter/Next" submit triggers on non-final input fields
    const activeEl = document.activeElement as HTMLInputElement;
    if (activeEl && activeEl.tagName === 'INPUT' && activeEl.type !== 'file') {
      const inputs = Array.from(
        e.currentTarget.querySelectorAll('input:not([type="file"]):not([disabled])')
      ) as HTMLInputElement[];

      // Sort by visual position on the screen to align with CSS flexbox swapped layouts
      inputs.sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        return rectA.top - rectB.top || rectA.left - rectB.left;
      });

      const index = inputs.indexOf(activeEl);

      if (index > -1 && index < inputs.length - 1) {
        inputs[index + 1].focus();
        return; // Prevent saving, shift focus instead
      }
    }

    const parsedMoney = parseFloat(moneyAmount) || 0;
    const parsedGold = parseFloat(goldWeightGrams) || 0;
    const parsedSilver = parseFloat(silverWeightGrams) || 0;

    if (parsedMoney === 0 && parsedGold === 0 && parsedSilver === 0) {
      alert('Please fill at least one transaction amount (Money, Gold, or Silver).');
      return;
    }

    const entryDate = initialEntry ? date : getTodayDate();
    const entryTime = initialEntry ? time : getCurrentTime();

    onSave({
      date: entryDate,
      time: entryTime,
      description: description.trim() || 'General Khata Entry',
      hastak: hastak.trim() || 'Self',
      moneyType,
      moneyAmount: parsedMoney,
      goldType,
      goldWeightGrams: parsedGold,
      silverType,
      silverWeightGrams: parsedSilver,
      billImageUrl: billImageUrl || undefined
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-md overflow-y-auto p-2 sm:p-4 flex flex-col justify-start items-center pt-6 sm:pt-10 pb-20 animate-fade-in min-h-screen w-full">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md md:max-w-2xl w-full overflow-hidden border border-gray-200 shrink-0 mt-1 sm:mt-4">
        
        {/* Compact Header */}
        <div className="bg-gray-900 text-white px-4 py-3.5 md:px-5 md:py-4.5 relative flex items-center justify-between">
          <div>
            <span className="text-gold-400 text-xs md:text-sm font-black uppercase tracking-wider block leading-tight">
              Customer: {customerName}
            </span>
            <h2 className="text-sm sm:text-base md:text-xl font-black text-white leading-tight mt-0.5">
              {initialEntry ? t('editTransaction') : t('newTransaction')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-4 md:p-6 flex flex-col space-y-3.5 md:space-y-5">
          
          {/* Auto Date Banner */}
          <div style={{ order: 1 }} className="bg-amber-50 rounded-xl px-3 py-2.5 md:px-4 md:py-3.5 border border-amber-200 flex items-center justify-between text-xs md:text-sm font-black">
            <span className="text-amber-900 truncate">
              📅 Date: <strong className="text-gray-900">{formatDate(date)}</strong>
            </span>
            <span className="text-[11px] md:text-xs font-black bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded shrink-0">
              ⏰ {formatTime12Hr(time)}
            </span>
          </div>

          {/* Remarks & Hastak Row */}
          <div style={{ order: isAssetsFirst ? 3 : 2 }} className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs md:text-sm font-black text-gray-800 mb-1.5 md:mb-2">
                {t('remarks')}
              </label>
              <input
                ref={descriptionInputRef}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Gold Chain / Cash"
                className="w-full px-3.5 py-2.5 md:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-extrabold text-gray-900"
                enterKeyHint="next"
              />
            </div>

            <div className="col-span-1 md:col-span-1">
              <label className="block text-xs md:text-sm font-black text-gray-800 mb-1.5 md:mb-2">
                {t('hastak')}
              </label>
              <input
                ref={hastakInputRef}
                type="text"
                value={hastak}
                onChange={(e) => setHastak(e.target.value)}
                placeholder={t('self')}
                className="w-full px-3.5 py-2.5 md:py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-extrabold text-gray-900"
                enterKeyHint={isAssetsFirst ? "done" : "next"}
              />
            </div>
          </div>

          {/* DYNAMIC TRIPLE ASSET INPUT ROWS */}
          <div style={{ order: isAssetsFirst ? 2 : 3 }} className="space-y-2 pt-0.5">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider block border-b pb-1">
              Enter Assets
            </span>

            {/* Asset 1: Money (₹) Compact Row (Always Active) */}
            <div className="bg-gray-50 p-2.5 md:p-4 rounded-2xl md:rounded-3xl border border-gray-200 flex items-center gap-2">
              <div className="flex items-center gap-1 w-24 md:w-28 shrink-0">
                <Coins className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 shrink-0" />
                <span className="text-xs md:text-sm font-black text-gray-800">{t('moneyCol')}</span>
              </div>

              <div className="flex bg-gray-200 p-0.5 rounded-md text-[11px] md:text-xs font-black shrink-0">
                <button
                  type="button"
                  onClick={() => setMoneyType('udhar')}
                  className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                    moneyType === 'udhar' ? 'bg-red-600 text-white' : 'text-gray-600'
                  }`}
                >
                  {t('udhar')}
                </button>
                <button
                  type="button"
                  onClick={() => setMoneyType('jama')}
                  className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                    moneyType === 'jama' ? 'bg-emerald-600 text-white' : 'text-gray-600'
                  }`}
                >
                  {t('jama')}
                </button>
              </div>

              <input
                ref={moneyInputRef}
                type="number"
                step="any"
                value={moneyAmount}
                onChange={(e) => setMoneyAmount(e.target.value)}
                placeholder="0"
                className="flex-1 min-w-0 px-3 py-2.5 md:py-3.5 bg-white rounded-xl border border-gray-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-black text-gray-900 text-right placeholder-gray-400"
                enterKeyHint={isAssetsFirst ? "next" : (showGoldField || showSilverField ? "next" : "done")}
              />
            </div>

            {/* Asset 2: Gold (grams) Row (Rendered if Admin Enabled OR if Historical Entry has Gold Data) */}
            {showGoldField && (
              <div className="bg-amber-50/50 p-2.5 md:p-4 rounded-2xl md:rounded-3xl border border-amber-200 flex items-center gap-2">
                <div className="flex items-center gap-1 w-24 md:w-28 shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-amber-600 shrink-0" />
                  <span className="text-xs md:text-sm font-black text-amber-900">{t('goldCol')}</span>
                </div>

                <div className="flex bg-amber-200/60 p-0.5 rounded-md text-[11px] md:text-xs font-black shrink-0">
                  <button
                    type="button"
                    onClick={() => setGoldType('udhar')}
                    className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                      goldType === 'udhar' ? 'bg-red-600 text-white' : 'text-amber-900'
                    }`}
                  >
                    {t('udhar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGoldType('jama')}
                    className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                      goldType === 'jama' ? 'bg-emerald-600 text-white' : 'text-amber-900'
                    }`}
                  >
                    {t('jama')}
                  </button>
                </div>

                <input
                  type="number"
                  step="0.001"
                  value={goldWeightGrams}
                  onChange={(e) => setGoldWeightGrams(e.target.value)}
                  placeholder="0.000"
                  className="flex-1 min-w-0 px-3 py-2.5 md:py-3.5 bg-white rounded-xl border border-amber-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-black text-gray-900 text-right placeholder-gray-400"
                  enterKeyHint={isAssetsFirst ? "next" : (showSilverField ? "next" : "done")}
                />
              </div>
            )}

            {/* Asset 3: Silver (grams) Row (Rendered if Admin Enabled OR if Historical Entry has Silver Data) */}
            {showSilverField && (
              <div className="bg-slate-100/70 p-2.5 md:p-4 rounded-2xl md:rounded-3xl border border-slate-300 flex items-center gap-2">
                <div className="flex items-center gap-1 w-24 md:w-28 shrink-0">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-slate-600 shrink-0" />
                  <span className="text-xs md:text-sm font-black text-slate-800">{t('silverCol')}</span>
                </div>

                <div className="flex bg-slate-200 p-0.5 rounded-md text-[11px] md:text-xs font-black shrink-0">
                  <button
                    type="button"
                    onClick={() => setSilverType('udhar')}
                    className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                      silverType === 'udhar' ? 'bg-red-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {t('udhar')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSilverType('jama')}
                    className={`px-2.5 py-1 md:px-3.5 md:py-1.5 rounded transition-all ${
                      silverType === 'jama' ? 'bg-emerald-600 text-white' : 'text-slate-700'
                    }`}
                  >
                    {t('jama')}
                  </button>
                </div>

                <input
                  type="number"
                  step="0.001"
                  value={silverWeightGrams}
                  onChange={(e) => setSilverWeightGrams(e.target.value)}
                  placeholder="0.000"
                  className="flex-1 min-w-0 px-3 py-2.5 md:py-3.5 bg-white rounded-xl border border-slate-300 focus:ring-2 focus:ring-gold-500 text-sm md:text-base font-black text-gray-900 text-right placeholder-gray-400"
                  enterKeyHint={isAssetsFirst ? "next" : "done"}
                />
              </div>
            )}

            {/* Asset 4: Bill Photo (Only shown if Admin Enabled) */}
            {isBillPhotosEnabledByAdmin && (
              <div style={{ order: 4 }} className="bg-purple-50/40 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-purple-200 space-y-2 md:space-y-3">
                <span className="text-[11px] md:text-xs font-black text-purple-950 uppercase tracking-wide block">
                  {language === 'en' ? 'Attach Bill / Photo' : 'બીલ / ફોટો અપલોડ કરો'}
                </span>

                <div className="flex items-center gap-2">
                  {/* Hidden Inputs */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    type="file"
                    ref={galleryInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Buttons */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex-1 py-2 md:py-3 px-3 md:px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] md:text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{language === 'en' ? 'Camera' : 'કેમેરા'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="flex-1 py-2 md:py-3 px-3 md:px-4 bg-white border border-purple-300 text-purple-900 hover:bg-purple-50 rounded-xl text-[11px] md:text-xs font-black flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <Image className="w-4 h-4 md:w-5 md:h-5" />
                    <span>{language === 'en' ? 'Gallery' : 'ગેલેરી'}</span>
                  </button>
                </div>

                {/* Upload Status / Thumbnail Preview */}
                {isUploading && (
                  <p className="text-[11px] md:text-xs text-purple-600 font-semibold animate-pulse">
                    Processing photo...
                  </p>
                )}

                {billImageUrl && (
                  <div className="flex items-center gap-2 bg-white p-2 md:p-3 rounded-xl md:rounded-2xl border border-purple-100 relative">
                    <img
                      src={billImageUrl}
                      alt="Bill Thumbnail"
                      onClick={() => setIsImagePreviewOpen(true)}
                      className="w-12 h-12 md:w-16 md:h-16 rounded object-cover cursor-zoom-in border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] md:text-xs font-black text-gray-800 block truncate">
                        Photo Attached
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsImagePreviewOpen(true)}
                        className="text-[10px] md:text-xs text-purple-700 font-black hover:underline"
                      >
                        {language === 'en' ? 'View Fullscreen' : 'મોટી કરી જુઓ'}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBillImageUrl('')}
                      className="p-1 rounded-full hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                      title="Remove Photo"
                    >
                      <X className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div style={{ order: 5 }} className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
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
              {initialEntry ? t('saveChanges') : t('recordEntry')}
            </button>
          </div>

        </form>

        {isImagePreviewOpen && billImageUrl && createPortal(
          <div 
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col justify-center items-center p-4 animate-fade-in"
            onClick={() => setIsImagePreviewOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <img
              src={billImageUrl}
              alt="Fullscreen Bill"
              className="max-w-full max-h-[85vh] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent close on clicking image
            />
            
            <span className="text-white text-xs mt-4 font-bold bg-white/10 px-3 py-1.5 rounded-full select-none">
              {language === 'en' ? 'Click outside to close' : 'બંધ કરવા માટે બહાર ક્લિક કરો'}
            </span>
          </div>,
          document.body
        )}

      </div>
    </div>,
    document.body
  );
};
