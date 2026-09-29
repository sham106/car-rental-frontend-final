import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, MessageSquare, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { Vehicle } from '../../types/vehicle';
import { useSearch } from '../../context/SearchContext';
import { vehicleService } from '../../services/vehicleService';
import { useQuote } from '../../hooks/useQuote';
import { useLocations } from '../../hooks/useLocations';
import { BRAND } from '../../constants/theme';
import { VehicleAvailabilityCalendar } from './VehicleAvailabilityCalendar';

interface PriceBreakdownBoxProps {
  vehicle: Vehicle;
}

export const PriceBreakdownBox: React.FC<PriceBreakdownBoxProps> = ({ vehicle }) => {
  const RENTAL_LOCATIONS = useLocations();
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
    setSearchParameters,
    isSameDay,
    dateValidation,
    todayStr,
  } = useSearch();

  const [availability, setAvailability] = useState<{ isAvailable: boolean; reason?: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const {pricing: quote, error: quoteError, loading: quoteLoading} = useQuote(vehicle.id,pickupDate,returnDate,pickupLocationId,returnLocationId);
  const pricing = quote || {days:0,locationFee:0,vatIncluded:0,estimatedTotal:0};

  useEffect(() => {
    let isMounted = true;
    if (pickupDate && returnDate && dateValidation.isValid) {
      setChecking(true);
      vehicleService.checkVehicleAvailability(vehicle.id, pickupDate, returnDate).then((res) => {
        if (isMounted) {
          setAvailability(res);
          setChecking(false);
        }
      }).catch((error) => { if (isMounted) { setDateError(error.message); setAvailability(null); setChecking(false); } });
    } else {
      setAvailability(null);
      setChecking(false);
    }
    return () => {
      isMounted = false;
    };
  }, [vehicle.id, pickupDate, returnDate, dateValidation.isValid]);

  const handlePickupDateChange = (val: string) => {
    setDateError(null);
    if (val < todayStr) {
      setDateError('Pickup date cannot be in the past.');
      return;
    }
    setPickupDate(val);
  };

  const handleReturnDateChange = (val: string) => {
    setDateError(null);
    if (val < pickupDate) {
      setDateError('Return date cannot be earlier than pickup date.');
      return;
    }
    setReturnDate(val);
  };

  const handleProceedBooking = () => {
    if (!dateValidation.isValid) {
      setDateError(dateValidation.errorMessage || 'Please select valid rental dates.');
      return;
    }
    navigate(`/book?vehicleId=${vehicle.id}`);
  };

  const handleWhatsAppInquiry = () => {
    const text = `Hello Oceane Car Rental, I am inquiring about the ${vehicle.brand} ${vehicle.model} (${vehicle.year}) from ${pickupDate} to ${returnDate}. Could you confirm availability?`;
    const url = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="pricing-breakdown-card" className="bg-white rounded-2xl border border-[#DFE6EC] shadow-lg p-5 sm:p-6 space-y-5">
      {quoteError && <p role="alert" className="text-sm text-red-700">{quoteError}</p>}
      {quoteLoading && <p className="text-sm text-slate-500">Updating price...</p>}
      {/* Rate Banner */}
      <div className="flex items-baseline justify-between border-b border-[#EAF0F3] pb-4">
        <div>
          <span className="text-xs text-[#66747E] font-medium block">Daily Rental Rate</span>
          <div className="flex items-baseline gap-1">
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-[#16324F] tabular-nums">
              Rs {vehicle.dailyRate.toLocaleString()}
            </span>
            <span className="text-xs text-[#66747E]">/day</span>
          </div>
        </div>
        <div className="text-right">
          {checking ? (
            <span className="inline-flex items-center text-xs text-[#66747E] bg-[#EAF0F3] px-2.5 py-1 rounded-full animate-pulse">
              Checking dates...
            </span>
          ) : !dateValidation.isValid ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B9534F] bg-[#B9534F]/10 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Adjust Dates
            </span>
          ) : availability && !availability.isAvailable ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B9534F] bg-[#B9534F]/10 px-2.5 py-1 rounded-full">
              <AlertCircle className="w-3.5 h-3.5" />
              Unavailable on dates
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F7D61] bg-[#4F7D61]/10 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Available to Request
            </span>
          )}
        </div>
      </div>

      {/* Date & Location Selectors */}
      <div className="space-y-3 text-xs">
        {/* Dates Header & Calendar Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E]">
            Rental Dates
          </span>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('availability-calendar-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                setShowCalendar(!showCalendar);
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F6F6D] hover:text-[#16324F] transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{showCalendar ? 'Close Calendar' : 'View Booked Dates'}</span>
            {showCalendar ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Dates */}
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#66747E]">
                  Pickup Date
                </label>
                <span className="text-[9px] text-[#66747E]">≥ Today</span>
              </div>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={pickupDate}
                  onChange={(e) => handlePickupDateChange(e.target.value)}
                  className="w-full p-2 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-xs font-semibold text-[#24313A] focus:outline-none focus:ring-1 focus:ring-[#2F6F6D]"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#66747E]">
                  Return Date
                </label>
                <button
                  type="button"
                  onClick={setSameDayReturn}
                  className="text-[9px] text-[#2F6F6D] hover:underline font-semibold cursor-pointer"
                >
                  Same Day?
                </button>
              </div>
              <div className="relative">
                <input
                  type="date"
                  min={pickupDate || todayStr}
                  value={returnDate}
                  onChange={(e) => handleReturnDateChange(e.target.value)}
                  className="w-full p-2 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-xs font-semibold text-[#24313A] focus:outline-none focus:ring-1 focus:ring-[#2F6F6D]"
                />
              </div>
            </div>
          </div>

          {/* Inline notification of date state */}
          {dateError || dateValidation.errorMessage ? (
            <p className="text-[11px] text-[#B9534F] flex items-center gap-1 font-medium pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{dateError || dateValidation.errorMessage}</span>
            </p>
          ) : isSameDay ? (
            <p className="text-[11px] text-[#2F6F6D] flex items-center gap-1 font-medium pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Same-day return: Return before 20:00 on pickup date (1-day standard rate).</span>
            </p>
          ) : null}

          {/* Booked / Unavailable Alert */}
          {availability && !availability.isAvailable && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1 mt-2 animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Vehicle Already Booked</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                {availability.reason || 'This vehicle is already reserved for the selected period. Please choose alternative dates on the calendar.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('availability-calendar-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else setShowCalendar(true);
                }}
                className="text-[11px] font-bold text-rose-800 underline hover:text-rose-950 flex items-center gap-1 pt-1 cursor-pointer"
              >
                Open Calendar to See Available Open Dates &rarr;
              </button>
            </div>
          )}
        </div>

        {/* Expandable Compact Calendar inside sidebar */}
        {showCalendar && (
          <div className="pt-2">
            <VehicleAvailabilityCalendar
              vehicleId={vehicle.id}
              vehicleName={`${vehicle.brand} ${vehicle.model}`}
              pickupDate={pickupDate}
              returnDate={returnDate}
              compact={true}
              title="Vehicle Schedule & Bookings"
              onSelectRange={(pickup, ret) => {
                if (pickup && ret) setSearchParameters({ pickupDate: pickup, returnDate: ret });
              }}
            />
          </div>
        )}

        {/* Pickup Location */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#66747E] mb-1">
            Pickup Location
          </label>
          <select
            value={pickupLocationId}
            onChange={(e) => setPickupLocationId(e.target.value)}
            className="w-full p-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-xs font-medium text-[#24313A] focus:outline-none focus:ring-1 focus:ring-[#2F6F6D]"
          >
            {RENTAL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.pickupFee > 0 ? `(+Rs ${loc.pickupFee})` : '(Free)'}
              </option>
            ))}
          </select>
        </div>

        {/* Return Location */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#66747E] mb-1">
            Return Location
          </label>
          <select
            value={returnLocationId}
            onChange={(e) => setReturnLocationId(e.target.value)}
            className="w-full p-2.5 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-xs font-medium text-[#24313A] focus:outline-none focus:ring-1 focus:ring-[#2F6F6D]"
          >
            {RENTAL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.dropoffFee > 0 ? `(+Rs ${loc.dropoffFee})` : '(Free)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing Summary Calculation */}
      <div className="bg-[#F8F6F1] p-3.5 rounded-xl space-y-2 text-xs border border-[#DFE6EC]/70">
        <div className="flex justify-between text-[#66747E]">
          <span>
            Rental Duration ({pricing.days} {pricing.days === 1 ? 'day' : 'days'})
            {isSameDay && ' • Same day'}
          </span>
          <span className="font-semibold text-[#24313A] tabular-nums">
            Rs {vehicle.dailyRate.toLocaleString()} × {pricing.days}
          </span>
        </div>

        {pricing.locationFee > 0 && (
          <div className="flex justify-between text-[#66747E]">
            <span>Special Location Handover</span>
            <span className="font-semibold text-[#24313A] tabular-nums">
              +Rs {pricing.locationFee.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-[#66747E]">
          <span>Comprehensive CDW Insurance</span>
          <span className="text-[#4F7D61] font-semibold">Included</span>
        </div>

        <div className="flex justify-between text-[#66747E]">
          <span>Unlimited Island Mileage</span>
          <span className="text-[#4F7D61] font-semibold">Included</span>
        </div>

        <div className="pt-2 border-t border-[#DFE6EC] flex items-baseline justify-between">
          <div>
            <span className="font-display font-bold text-sm text-[#16324F] block">
              Estimated Total
            </span>
            <span className="text-[10px] text-[#66747E]">
              Includes VAT (Rs {pricing.vatIncluded.toLocaleString()})
            </span>
          </div>
          <span className="font-display font-extrabold text-xl sm:text-2xl text-[#16324F] tabular-nums">
            Rs {pricing.estimatedTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          id="btn-request-vehicle"
          onClick={handleProceedBooking}
          disabled={!quote || quoteLoading || checking || !dateValidation.isValid || !availability?.isAvailable}
          className="w-full flex items-center justify-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Request This Vehicle</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          id="btn-whatsapp-inquiry"
          onClick={handleWhatsAppInquiry}
          className="w-full flex items-center justify-center gap-2 bg-[#EAF0F3] hover:bg-[#DFE6EC] text-[#16324F] py-2.5 px-4 rounded-xl font-semibold text-xs transition-colors cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 text-[#2F6F6D]" />
          <span>Ask Question on WhatsApp</span>
        </button>
      </div>

      {/* Booking Peace of Mind Notice */}
      <div className="pt-1 flex items-start gap-2 text-[11px] text-[#66747E] leading-tight">
        <ShieldCheck className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
        <span>
          No payment charged now. Our concierge team reviews dates and confirms vehicle availability within 2 hours.
        </span>
      </div>
    </div>
  );
};
