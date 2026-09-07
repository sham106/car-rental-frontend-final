import React from 'react';
import { Car, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No vehicles found',
  message = 'Try adjusting your search criteria or choosing different dates.',
  onReset,
  resetLabel = 'Reset all filters',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#DFE6EC] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-[#EAF0F3] text-[#2F6F6D] flex items-center justify-center mx-auto mb-4">
        <Car className="w-7 h-7" />
      </div>
      <h3 className="font-display font-bold text-lg text-[#16324F] mb-1.5">{title}</h3>
      <p className="text-sm text-[#66747E] leading-relaxed mb-6">{message}</p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16324F] hover:bg-[#2F6F6D] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
};
