import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { VehicleBookedRange } from '../../types/vehicle';
import { getTodayString, addDays, calculateRentalDays } from '../../utils/dateUtils';

interface VehicleAvailabilityCalendarProps {
  vehicleId: string;
  vehicleName?: string;
  pickupDate?: string;
  returnDate?: string;
  onSelectRange?: (pickup: string, returnDate: string) => void;
  compact?: boolean;
  className?: string;
  title?: string;
  showReservedList?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const VehicleAvailabilityCalendar: React.FC<VehicleAvailabilityCalendarProps> = ({
  vehicleId,
  vehicleName = 'This vehicle',
  pickupDate = '',
  returnDate = '',
  onSelectRange,
  compact = false,
  className = '',
  title = 'Live Availability Calendar',
  showReservedList = true,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  
  // Base month view (year, month 0-indexed)
  const [currentYear, setCurrentYear] = useState(() => {
    if (pickupDate) return parseInt(pickupDate.split('-')[0], 10);
    return parseInt(todayStr.split('-')[0], 10);
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    if (pickupDate) return parseInt(pickupDate.split('-')[1], 10) - 1;
    return parseInt(todayStr.split('-')[1], 10) - 1;
  });

  const [bookedRanges, setBookedRanges] = useState<VehicleBookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // Temporary selection state when clicking
  const [tempPickup, setTempPickup] = useState<string>(pickupDate);
  const [tempReturn, setTempReturn] = useState<string>(returnDate);

  useEffect(() => {
    setTempPickup(pickupDate);
  }, [pickupDate]);

  useEffect(() => {
    setTempReturn(returnDate);
  }, [returnDate]);

  // Load booked date ranges
  const loadRanges = async () => {
    try {
      setLoading(true);
      const ranges = await vehicleService.getBookedDateRanges(vehicleId);
      setBookedRanges(ranges);
    } catch (err) {
      console.error('Error loading booked ranges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanges();

    const handleUpdate = () => loadRanges();
    window.addEventListener('oceane_bookings_updated', handleUpdate);
    window.addEventListener('oceane_fleet_updated', handleUpdate);
    return () => {
      window.removeEventListener('oceane_bookings_updated', handleUpdate);
      window.removeEventListener('oceane_fleet_updated', handleUpdate);
    };
  }, [vehicleId]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const [y, m] = todayStr.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
  };

  // Helper to check if a single date string is within any booked range
  const getBookedInfoForDate = (dateStr: string): VehicleBookedRange | undefined => {
    return bookedRanges.find(
      (r) => dateStr >= r.startDate && dateStr <= r.endDate
    );
  };

  // Helper to check if a date range [start, end] intersects any booked range
  const hasBookedCollision = (start: string, end: string): VehicleBookedRange | undefined => {
    return bookedRanges.find(
      (r) => start <= r.endDate && end >= r.startDate
    );
  };

  // Handle clicking on a calendar day
  const handleDayClick = (dateStr: string) => {
    if (dateStr < todayStr) return; // cannot pick past dates

    const bookedInfo = getBookedInfoForDate(dateStr);
    if (bookedInfo) {
      setSelectionNotice(
        `Selected date (${dateStr}) is already reserved (${bookedInfo.label}). Please select an open date.`
      );
      setTimeout(() => setSelectionNotice(null), 4000);
      return;
    }

    setSelectionNotice(null);

    // Case 1: No pickup yet, or already have full range -> Start fresh with pickup
    if (!tempPickup || (tempPickup && tempReturn)) {
      setTempPickup(dateStr);
      setTempReturn('');
      return;
    }

    // Case 2: Only tempPickup exists
    if (tempPickup && !tempReturn) {
      if (dateStr < tempPickup) {
        // Clicked earlier date: reset pickup to this earlier date
        setTempPickup(dateStr);
        setTempReturn('');
      } else {
        // Clicked same or later date: check collision across the span
        const collision = hasBookedCollision(tempPickup, dateStr);
        if (collision) {
          setSelectionNotice(
            `Cannot select across reserved dates (${collision.startDate} to ${collision.endDate}). Please choose a range within an available window.`
          );
          setTimeout(() => setSelectionNotice(null), 5000);
          return;
        }

        setTempReturn(dateStr);
        if (onSelectRange) {
          onSelectRange(tempPickup, dateStr);
        }
      }
    }
  };

  const handleClearSelection = () => {
    setTempPickup('');
    setTempReturn('');
    setSelectionNotice(null);
    if (onSelectRange) {
      onSelectRange('', '');
    }
  };

  // Generate matrix for a given year & month (1-indexed month 0-11)
  const generateMonthMatrix = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // In JS, getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    // We want Mon=0, Sun=6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDay.getDate();
    const days: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isPast: boolean;
      isBooked: boolean;
      bookedInfo?: VehicleBookedRange;
      isSelectedPickup: boolean;
      isSelectedReturn: boolean;
      isInSelectedRange: boolean;
      isHoverRange: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(prevDate.getDate()).padStart(2, '0');
      const dateStr = `${prevDate.getFullYear()}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isBooked: false,
        isSelectedPickup: false,
        isSelectedReturn: false,
        isInSelectedRange: false,
        isHoverRange: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      const isPast = dateStr < todayStr;
      const bookedInfo = getBookedInfoForDate(dateStr);
      const isBooked = Boolean(bookedInfo);

      const isSelectedPickup = Boolean(tempPickup && tempPickup === dateStr);
      const isSelectedReturn = Boolean(tempReturn && tempReturn === dateStr);
      const isInSelectedRange = Boolean(
        tempPickup && tempReturn && dateStr >= tempPickup && dateStr <= tempReturn
      );

      // Hover preview when pickup is set but not return
      const isHoverRange = Boolean(
        tempPickup && !tempReturn && hoveredDate && hoveredDate > tempPickup && dateStr > tempPickup && dateStr <= hoveredDate
      );

      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isPast,
        isBooked,
        bookedInfo,
        isSelectedPickup,
        isSelectedReturn,
        isInSelectedRange,
        isHoverRange,
      });
    }

    // Next month padding to fill out to 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(nextDate.getDate()).padStart(2, '0');
      const dateStr = `${nextDate.getFullYear()}-${mStr}-${dStr}`;
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isBooked: false,
        isSelectedPickup: false,
        isSelectedReturn: false,
        isInSelectedRange: false,
        isHoverRange: false,
      });
    }

    return days;
  };

  const currentMonthDays = useMemo(
    () => generateMonthMatrix(currentYear, currentMonth),
    [currentYear, currentMonth, todayStr, bookedRanges, tempPickup, tempReturn, hoveredDate]
  );

  // Next month calculation for 2-month view on desktop
  const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  const nextMonthNum = currentMonth === 11 ? 0 : currentMonth + 1;

  const nextMonthDays = useMemo(
    () => generateMonthMatrix(nextMonthYear, nextMonthNum),
    [nextMonthYear, nextMonthNum, todayStr, bookedRanges, tempPickup, tempReturn, hoveredDate]
  );

  const selectedDaysCount = tempPickup && tempReturn ? calculateRentalDays(tempPickup, tempReturn) : 0;

  return (
    <div
      className={`bg-white rounded-2xl border border-[#DFE6EC] shadow-xs overflow-hidden ${className}`}
    >
      {/* Calendar Header */}
      <div className="p-4 sm:p-5 border-b border-[#DFE6EC] bg-[#FAFBFB] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF0F3] text-[#16324F] flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-4 h-4 text-[#2F6F6D]" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm sm:text-base text-[#16324F]">
              {title}
            </h4>
            <p className="text-[11px] text-[#66747E]">
              Dark red dates are already booked. Click available dates to select rental period.
            </p>
          </div>
        </div>

        {/* Quick Month Controls */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1 text-[11px] font-semibold text-[#16324F] hover:bg-[#EAF0F3] rounded-lg border border-[#CAD5DF] bg-white transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-[#24313A] hover:bg-[#EAF0F3] rounded-lg border border-[#CAD5DF] bg-white transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-[#24313A] hover:bg-[#EAF0F3] rounded-lg border border-[#CAD5DF] bg-white transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collision or selection notice toast */}
      {selectionNotice && (
        <div className="mx-4 sm:mx-5 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{selectionNotice}</div>
          <button
            type="button"
            onClick={() => setSelectionNotice(null)}
            className="text-red-500 hover:text-red-700 cursor-pointer p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Calendar Grid Container */}
      <div className={`p-4 sm:p-5 ${compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
        {/* Month 1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-sm text-[#16324F]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <span className="text-[11px] font-semibold text-[#66747E]">
              Month 1 of 2
            </span>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_LABELS.map((lbl, idx) => (
              <div
                key={idx}
                className="text-[10px] font-bold text-[#66747E] py-1 uppercase tracking-wider"
              >
                {lbl}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {currentMonthDays.map((d, idx) => {
              if (!d.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="h-10 sm:h-11 rounded-lg flex items-center justify-center text-[11px] text-slate-300 pointer-events-none select-none"
                  >
                    {d.dayNum}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={d.isPast}
                  onClick={() => handleDayClick(d.dateStr)}
                  onMouseEnter={() => !d.isPast && !d.isBooked && setHoveredDate(d.dateStr)}
                  onMouseLeave={() => setHoveredDate(null)}
                  title={
                    d.isBooked
                      ? `Unavailable: Already booked (${d.bookedInfo?.label})`
                      : d.isPast
                      ? 'Past date'
                      : d.isSelectedPickup
                      ? 'Selected Pickup Date'
                      : d.isSelectedReturn
                      ? 'Selected Return Date'
                      : `Click to select ${d.dateStr}`
                  }
                  className={`relative h-10 sm:h-11 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                    d.isSelectedPickup
                      ? 'bg-[#16324F] text-white shadow-sm z-10 scale-[1.03]'
                      : d.isSelectedReturn
                      ? 'bg-[#2F6F6D] text-white shadow-sm z-10 scale-[1.03]'
                      : d.isInSelectedRange
                      ? 'bg-[#2F6F6D]/20 text-[#16324F] font-bold rounded-none'
                      : d.isHoverRange
                      ? 'bg-[#EAF0F3] text-[#16324F] rounded-none'
                      : d.isBooked
                      ? 'bg-rose-50 border border-rose-200 text-rose-800 cursor-not-allowed hover:bg-rose-100'
                      : d.isPast
                      ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed'
                      : 'bg-white hover:bg-[#EAF0F3] hover:text-[#16324F] text-[#24313A] border border-slate-100'
                  }`}
                >
                  <span className={`${d.isBooked ? 'line-through decoration-rose-400 opacity-90' : ''}`}>
                    {d.dayNum}
                  </span>

                  {/* Indicators */}
                  {d.isBooked && (
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-rose-700 leading-none mt-0.5">
                      Booked
                    </span>
                  )}

                  {d.isSelectedPickup && (
                    <span className="text-[8px] uppercase tracking-tighter text-white/90 leading-none mt-0.5">
                      Pickup
                    </span>
                  )}

                  {d.isSelectedReturn && (
                    <span className="text-[8px] uppercase tracking-tighter text-white/90 leading-none mt-0.5">
                      Return
                    </span>
                  )}

                  {d.isToday && !d.isSelectedPickup && !d.isSelectedReturn && !d.isBooked && (
                    <span className="w-1 h-1 bg-[#2F6F6D] rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Month 2 (Only if not compact) */}
        {!compact && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-sm text-[#16324F]">
                {MONTH_NAMES[nextMonthNum]} {nextMonthYear}
              </span>
              <span className="text-[11px] font-semibold text-[#66747E]">
                Month 2 of 2
              </span>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {DAY_LABELS.map((lbl, idx) => (
                <div
                  key={idx}
                  className="text-[10px] font-bold text-[#66747E] py-1 uppercase tracking-wider"
                >
                  {lbl}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {nextMonthDays.map((d, idx) => {
                if (!d.isCurrentMonth) {
                  return (
                    <div
                      key={idx}
                      className="h-10 sm:h-11 rounded-lg flex items-center justify-center text-[11px] text-slate-300 pointer-events-none select-none"
                    >
                      {d.dayNum}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={d.isPast}
                    onClick={() => handleDayClick(d.dateStr)}
                    onMouseEnter={() => !d.isPast && !d.isBooked && setHoveredDate(d.dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={
                      d.isBooked
                        ? `Unavailable: Already booked (${d.bookedInfo?.label})`
                        : d.isPast
                        ? 'Past date'
                        : d.isSelectedPickup
                        ? 'Selected Pickup Date'
                        : d.isSelectedReturn
                        ? 'Selected Return Date'
                        : `Click to select ${d.dateStr}`
                    }
                    className={`relative h-10 sm:h-11 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                      d.isSelectedPickup
                        ? 'bg-[#16324F] text-white shadow-sm z-10 scale-[1.03]'
                        : d.isSelectedReturn
                        ? 'bg-[#2F6F6D] text-white shadow-sm z-10 scale-[1.03]'
                        : d.isInSelectedRange
                        ? 'bg-[#2F6F6D]/20 text-[#16324F] font-bold rounded-none'
                        : d.isHoverRange
                        ? 'bg-[#EAF0F3] text-[#16324F] rounded-none'
                        : d.isBooked
                        ? 'bg-rose-50 border border-rose-200 text-rose-800 cursor-not-allowed hover:bg-rose-100'
                        : d.isPast
                        ? 'text-slate-300 bg-slate-50/50 cursor-not-allowed'
                        : 'bg-white hover:bg-[#EAF0F3] hover:text-[#16324F] text-[#24313A] border border-slate-100'
                    }`}
                  >
                    <span className={`${d.isBooked ? 'line-through decoration-rose-400 opacity-90' : ''}`}>
                      {d.dayNum}
                    </span>

                    {d.isBooked && (
                      <span className="text-[8px] font-bold uppercase tracking-tighter text-rose-700 leading-none mt-0.5">
                        Booked
                      </span>
                    )}

                    {d.isSelectedPickup && (
                      <span className="text-[8px] uppercase tracking-tighter text-white/90 leading-none mt-0.5">
                        Pickup
                      </span>
                    )}

                    {d.isSelectedReturn && (
                      <span className="text-[8px] uppercase tracking-tighter text-white/90 leading-none mt-0.5">
                        Return
                      </span>
                    )}

                    {d.isToday && !d.isSelectedPickup && !d.isSelectedReturn && !d.isBooked && (
                      <span className="w-1 h-1 bg-[#2F6F6D] rounded-full mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Legend & Selection Summary */}
      <div className="p-4 sm:p-5 border-t border-[#DFE6EC] bg-[#FAFBFB] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-300 line-through text-[9px] text-rose-700 flex items-center justify-center font-bold">
                ✕
              </span>
              <span className="text-[#24313A] font-semibold">Already Booked / Reserved</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-[#16324F] text-white flex items-center justify-center text-[9px]">
                ✓
              </span>
              <span className="text-[#24313A] font-medium">Selected Period</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300" />
              <span className="text-[#66747E]">Available to Reserve</span>
            </div>
          </div>

          {/* Current Selection Bar */}
          {tempPickup && (
            <div className="flex items-center gap-2">
              <span className="text-[#16324F] font-semibold text-xs">
                {tempReturn ? (
                  <>
                    Selected: <strong>{tempPickup}</strong> → <strong>{tempReturn}</strong> ({selectedDaysCount} {selectedDaysCount === 1 ? 'day' : 'days'})
                  </>
                ) : (
                  <>
                    Pickup selected: <strong>{tempPickup}</strong> (Now click a return date)
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[11px] text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Reserved Date Blocks Listing */}
        {showReservedList && (
          <div className="pt-2 border-t border-[#E5EAEF]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66747E] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F6F6D]" />
                Upcoming Reserved Dates for {vehicleName}
              </span>
              <span className="text-[10px] text-[#66747E]">
                Updated live from island fleet operations
              </span>
            </div>

            {bookedRanges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1">
                {bookedRanges.map((range, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-rose-50/70 border border-rose-200/70 rounded-xl text-xs text-rose-900 flex items-start gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-rose-950">
                        {range.startDate} → {range.endDate}
                      </div>
                      <div className="text-[11px] text-rose-700/90 font-medium">
                        {range.label} {range.reference ? `(${range.reference})` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 bg-[#EDF6EE] border border-[#A4D5A8] rounded-xl text-xs text-[#2A6E3B] flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-[#2A6E3B] flex-shrink-0" />
                <span>100% Open Availability: There are currently no conflicting bookings for this vehicle across upcoming months.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
