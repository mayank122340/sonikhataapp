import React from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, Trash2, Edit3, CheckCircle2, X } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  type?: 'delete' | 'edit' | 'alert' | 'default';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  type = 'default'
}) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isAlert = type === 'alert';
  const isRed = isDelete || isAlert;

  return createPortal(
    <div className="fixed inset-0 z-[110] bg-gray-950/80 backdrop-blur-xs p-4 flex flex-col justify-center items-center animate-fade-in w-full h-full">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-gray-200 shrink-0">
        
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isRed ? 'bg-red-600' : 'bg-gold-500'
        }`}>
          <div className="flex items-center space-x-2">
            {isAlert ? (
              <AlertCircle className="w-5 h-5 text-white" />
            ) : isDelete ? (
              <Trash2 className="w-5 h-5 text-white" />
            ) : (
              <Edit3 className="w-5 h-5 text-white" />
            )}
            <h3 className="text-sm font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
              isRed ? 'text-red-500' : 'text-gold-500'
            }`} />
            <p className="text-xs font-semibold text-gray-700 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            {!isAlert && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-xl text-white text-xs font-black shadow-md active:scale-95 transition-all ${
                isRed
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gold-500 hover:bg-gold-600'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
