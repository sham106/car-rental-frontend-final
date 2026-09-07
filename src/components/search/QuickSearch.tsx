import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, ArrowRight, ArrowLeftRight, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { RENTAL_LOCATIONS } from '../../constants/locations';
import { useSearch } from '../../context/SearchContext';
import { addDays, getTodayString } from '../../utils/dateUtils';

interface QuickSearchProps {
  className?: string;
  variant?: 'hero' | 'compact';
}

export const QuickSearch: React.FC<QuickSearchProps> = ({ className = '', variant = 'hero' }) => {
  const navigate = useNavigate();
  const {
    pickupLocationId,
    returnLocationId,
    pickupDate,
    returnDate,
    setPickupLocationId,
    setReturnLocationId,
    setPickupDate,
    setReturnDate,
    setSameDayReturn,
    rentalDays,
    isSameDay,
    dateValidation,
    todayStr,
  } = useSearch();

  const [differentReturn, setDifferentReturn] = useState(pickupLocationId !== returnLocationId);
  const [dateError, setDateError] = useState<string | null>(null);

  const handlePickupLocationChange = (val: string) => {
    setPickupLocationId(val);
    if (!differentReturn) {
      setReturnLocationId(val);
    }
  };

  const handlePickupDateChange = (val: string) => {
    setDateError(null);
    if (val < todayStr) {
      setDateError('Pickup date cannot be in the past. Please choose today or a future date.');
      return;
    }
    setPickupDate(val);
  };

  const handleReturnDateChange = (val: string) => {
    setDateError(null);
    if (val < pickupDate) {
      setDateError('Return date cannot be before pickup date. Same-day return or future dates are accepted.');
      return;
    }
    setReturnDate(val);
  };

  const handleQuickDuration = (days: number) => {
    setDateError(null);
    if (days === 0) {
      // Same-day return
      setSameDayReturn();
    } else {
      setReturnDate(addDays(pickupDate || todayStr, days));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateValidation.isValid) {
      setDateError(dateValidation.errorMessage || 'Please select valid rental dates.');
      return;
    }
    navigate(`/fleet?pickupLoc=${encodeURIComponent(pickupLocationId)}&returnLoc=${encodeURIComponent(returnLocationId)}&pickupDate=${pickupDate}&returnDate=${returnDate}`);
  };

  return (
    <div
      id="quick-search-container"
      className={`bg-white rounded-2xl shadow-xl border border-[#DFE6EC] p-4 sm:p-6 transition-all ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Return location toggle & Duration Indicator */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#66747E] pb-2 border-b border-[#EAF0F3] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#16324F]">Rental Schedule</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EAF0F3] text-[#2F6F6D] font-medium text-[11px]">
              {isSameDay ? 'Same-day return (1 day)' : `${rentalDays} ${rentalDays === 1 ? 'day' : 'days'}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick date presets */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <span className="text-[#66747E]">Quick:</span>
              <button
                type="button"
                onClick={() => handleQuickDuration(0)}
                className={`px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                  isSameDay ? 'bg-[#2F6F6D] text-white' : 'bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3]'
                }`}
              >
                Same Day
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(1)}
                className="px-2 py-0.5 rounded-md font-medium bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
              >
                +1 Day
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(3)}
                className="px-2 py-0.5 rounded-md font-medium bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickDuration(7)}
                className="px-2 py-0.5 rounded-md font-medium bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
              >
                +1 Wk
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const next = !differentReturn;
                setDifferentReturn(next);
                if (!next) {
                  setReturnLocationId(pickupLocationId);
                }
              }}
              className="flex items-center gap-1.5 hover:text-[#16324F] font-medium transition-colors cursor-pointer text-[11px]"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#2F6F6D]" />
              <span>{differentReturn ? 'Same drop-off hub' : 'Different drop-off?'}</span>
            </button>
          </div>
        </div>

        {/* Validation error message if any */}
        {(dateError || dateValidation.errorMessage) && (
          <div className="p-2.5 rounded-xl bg-[#B9534F]/10 border border-[#B9534F]/20 text-xs text-[#B9534F] flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{dateError || dateValidation.errorMessage}</span>
          </div>
        )}

        {/* Input Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {/* 1. Pickup Location */}
          <div className="relative">
            <label htmlFor="search-pickup-location" className="block text-[11px] font-bold uppercase tracking-wider text-[#66747E] mb-1">
              Pickup Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#2F6F6D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="search-pickup-location"
                value={pickupLocationId}
                onChange={(e) => handlePickupLocationChange(e.target.value)}
                className="w-full pl-9 pr-8 py-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] focus:bg-white appearance-none cursor-pointer transition-all"
              >
                {RENTAL_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.pickupFee > 0 ? `(+Rs ${loc.pickupFee})` : '(Free Handover)'}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#66747E]">
                ▼
              </div>
            </div>
          </div>

          {/* 2. Pickup Date */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="search-pickup-date" className="block text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                Pickup Date
              </label>
              <span className="text-[10px] text-[#66747E]">Today onwards</span>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#2F6F6D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                id="search-pickup-date"
                min={todayStr}
                value={pickupDate}
                onChange={(e) => handlePickupDateChange(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] focus:bg-white cursor-pointer transition-all"
              />
            </div>
          </div>

          {/* 3. Return Location (or Drop-off Date if same location) */}
          {differentReturn ? (
            <div className="relative">
              <label htmlFor="search-return-location" className="block text-[11px] font-bold uppercase tracking-wider text-[#66747E] mb-1">
                Return Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#D97745] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="search-return-location"
                  value={returnLocationId}
                  onChange={(e) => setReturnLocationId(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] focus:bg-white appearance-none cursor-pointer transition-all"
                >
                  {RENTAL_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} {loc.dropoffFee > 0 ? `(+Rs ${loc.dropoffFee})` : '(Free Handover)'}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#66747E]">
                  ▼
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="search-return-date" className="block text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Return Date
                </label>
                <button
                  type="button"
                  onClick={setSameDayReturn}
                  className="text-[10px] text-[#2F6F6D] hover:underline font-semibold cursor-pointer"
                >
                  Return same day?
                </button>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#2F6F6D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  id="search-return-date"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => handleReturnDateChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] focus:bg-white cursor-pointer transition-all"
                />
              </div>
            </div>
          )}

          {/* 4. Action Button / Secondary date when different return is enabled */}
          {differentReturn ? (
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="search-return-date-diff" className="block text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
                  Return Date
                </label>
                <button
                  type="button"
                  onClick={setSameDayReturn}
                  className="text-[10px] text-[#2F6F6D] hover:underline font-semibold cursor-pointer"
                >
                  Return same day?
                </button>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#2F6F6D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  id="search-return-date-diff"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => handleReturnDateChange(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:outline-none focus:ring-2 focus:ring-[#2F6F6D] focus:bg-white cursor-pointer transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-end">
              <button
                type="submit"
                id="search-submit-btn"
                disabled={!dateValidation.isValid}
                className="w-full flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Find Available Cars</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sub-strip: Same-day return or rental length explanation */}
        <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-[#66747E] gap-2">
          {isSameDay ? (
            <div className="flex items-center gap-1.5 text-[#2F6F6D] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Same-day return: Vehicle returned before 20:00 on pickup day (billed as 1 standard day).</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#66747E]">
              <Clock className="w-3.5 h-3.5 text-[#2F6F6D]" />
              <span>Full 24-hour return billing with unlimited mileage across Mauritius.</span>
            </div>
          )}

          {/* Mobile quick duration row */}
          <div className="flex sm:hidden items-center gap-1 text-[11px]">
            <span className="text-[#66747E]">Quick:</span>
            <button
              type="button"
              onClick={() => handleQuickDuration(0)}
              className="px-2 py-0.5 rounded bg-[#F8F6F1] font-medium"
            >
              Same Day
            </button>
            <button
              type="button"
              onClick={() => handleQuickDuration(3)}
              className="px-2 py-0.5 rounded bg-[#F8F6F1] font-medium"
            >
              3 Days
            </button>
          </div>
        </div>

        {/* If differentReturn was checked, show full width submit button below */}
        {differentReturn && (
          <div className="pt-2">
            <button
              type="submit"
              id="search-submit-btn-full"
              disabled={!dateValidation.isValid}
              className="w-full flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>
                Find Available Cars ({isSameDay ? 'Same Day (1 Day)' : `${rentalDays} ${rentalDays === 1 ? 'Day' : 'Days'}`})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

