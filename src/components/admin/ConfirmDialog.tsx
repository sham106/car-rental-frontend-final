import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl border overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`p-3 rounded-full flex-shrink-0 ${
                isDestructive ? 'bg-[#FDEDEC] text-[#B9534F]' : 'bg-[#EDF4F8] text-[#35658A]'
              }`}
            >
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-[#24313A]">{title}</h3>
              <p className="mt-1.5 text-sm text-[#65727B] leading-relaxed">{message}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-[#65727B] hover:text-[#24313A] p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer ${
                isDestructive
                  ? 'bg-[#B9534F] hover:bg-[#A3433F]'
                  : 'bg-[#17324D] hover:bg-[#1F4366]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
