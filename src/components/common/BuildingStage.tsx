import React from 'react';
import { ArrowLeft, Settings } from './Icons';
import { useLanguage } from '../../context/LanguageContext';

interface BuildingStageProps {
  title: string;
  onBack: () => void;
}

export const BuildingStage: React.FC<BuildingStageProps> = ({ title, onBack }) => {
  const { language } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-md overflow-hidden animate-fade-in max-w-md w-full mx-auto mt-6">
      {/* Stripes Banner */}
      <div className="h-3 bg-amber-400" style={{
        backgroundImage: 'linear-gradient(45deg, #f59e0b 25%, #d97706 25%, #d97706 50%, #f59e0b 50%, #f59e0b 75%, #d97706 75%, #d97706 100%)',
        backgroundSize: '20px 20px'
      }}></div>

      <div className="p-6 md:p-8 text-center space-y-5 flex flex-col items-center">
        {/* Animated Icon */}
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-200 relative shrink-0">
          <Settings className="w-8 h-8 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="absolute -bottom-1 -right-1 text-xl">🚧</span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base md:text-lg font-black text-gray-900">
            {language === 'gu' ? 'કામ ચાલુ છે...' : 'Under Construction'}
          </h3>
          <p className="text-xs md:text-sm font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
            {title}
          </p>
          <p className="text-[11px] md:text-xs text-gray-500 max-w-xs mx-auto leading-relaxed pt-1.5">
            {language === 'gu' 
              ? 'આ સુવિધા હજુ બનાવવાના તબક્કામાં (Building Stage) છે. આગામી અપડેટમાં આ પેજ સંપૂર્ણ રીતે શરૂ થઈ જશે.'
              : 'This feature is currently in the building stage. It will be fully enabled in the upcoming update.'}
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'gu' ? 'પાછા જાઓ' : 'Go Back'}</span>
        </button>
      </div>
    </div>
  );
};
