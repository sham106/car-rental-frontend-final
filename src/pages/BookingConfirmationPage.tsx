import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Car, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Printer, 
  MessageSquare, 
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { BookingRequest } from '../types/booking';
import { BRAND } from '../constants/theme';

export const BookingConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBooking = () => {
    if (ref) {
      bookingService.getBookingByReference(ref).then((b) => {
        setBooking(b || null);
        setLoading(false);
      }).catch(() => { setBooking(null); setLoading(false); });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
    const handleUpdate = () => loadBooking();
    window.addEventListener('oceane_bookings_updated', handleUpdate);
    return () => window.removeEventListener('oceane_bookings_updated', handleUpdate);
  }, [ref]);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!booking) return;
    const vehicleInfo = booking.vehicle || (booking as any).vehicleSummary;
    const vehicleName = vehicleInfo ? `${vehicleInfo.brand} ${vehicleInfo.model}` : 'the vehicle';
    const msg = `Hello DailyCar, I have submitted booking request reference *${booking.reference}* for the ${vehicleName} (${booking.pickupDate} to ${booking.returnDate}).`;
    window.open(`https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-sm text-[#66747E]">
        Loading your booking request confirmation...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-[#16324F]">Booking Request Not Found</h2>
        <p className="text-sm text-[#66747E]">
          We could not locate reference code "{ref}". Open this receipt in the browser tab used to book, or contact our team with your reference.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-[#16324F] text-white rounded-xl text-xs font-semibold"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div id="booking-confirmation-page" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* 1. Success Notification Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#4F7D61]/10 text-[#4F7D61] flex items-center justify-center mx-auto ring-8 ring-[#4F7D61]/5">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#4F7D61]">
          Request Successfully Submitted
        </span>

        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#16324F] tracking-tight">
          We've Received Your Booking Request
        </h1>

        <div className="inline-flex flex-wrap justify-center items-center gap-2 px-4 py-2 rounded-xl bg-[#EAF0F3] border border-[#DFE6EC] text-xs font-semibold text-[#16324F]">
          <span>Booking Reference:</span>
          <span className="font-mono break-all text-[#D97745] font-bold text-sm tracking-wide">
            {booking.reference}
          </span>
        </div>
      </div>

      {/* 2. Status Banner */}
      {booking.status === 'confirmed' ? (
        <div className="bg-[#EDF6EE] border border-[#A4D5A8] rounded-2xl p-5 sm:p-6 space-y-2 text-xs sm:text-sm text-[#24313A] shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#2A6E3B]">
            <CheckCircle2 className="w-5 h-5 text-[#2A6E3B] flex-shrink-0" />
            <span>Reservation Confirmed by Operations!</span>
          </div>
          <p className="text-[#3F5B46] leading-relaxed pl-7">
            Your vehicle is officially reserved and assigned. Our delivery driver will meet you with your keys and inspection documents at your scheduled pickup location.
          </p>
        </div>
      ) : booking.status === 'active' ? (
        <div className="bg-[#EBF5FB] border border-[#AED6F1] rounded-2xl p-5 sm:p-6 space-y-2 text-xs sm:text-sm text-[#24313A] shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#1E5F8C]">
            <Car className="w-5 h-5 text-[#1E5F8C] flex-shrink-0" />
            <span>Rental Active · On the Road</span>
          </div>
          <p className="text-[#385973] leading-relaxed pl-7">
            You are currently driving this vehicle in Mauritius. For assistance or roadside support, reach our team 24/7 on WhatsApp.
          </p>
        </div>
      ) : booking.status === 'completed' ? (
        <div className="bg-[#F4F6F7] border border-[#CFD8DC] rounded-2xl p-5 sm:p-6 space-y-2 text-xs sm:text-sm text-[#24313A] shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#37474F]">
            <CheckCircle2 className="w-5 h-5 text-[#37474F] flex-shrink-0" />
            <span>Rental Completed & Returned</span>
          </div>
          <p className="text-[#546E7A] leading-relaxed pl-7">
            This vehicle has been returned and verified in our fleet records. Thank you for choosing DailyCar!
          </p>
        </div>
      ) : booking.status === 'cancelled' || booking.status === 'rejected' ? (
        <div role="status" className="bg-[#B9534F]/10 border border-[#B9534F]/30 rounded-2xl p-5 sm:p-6 space-y-2 text-sm">
          <p className="font-bold text-[#B9534F]">
            {booking.status === 'cancelled' ? 'Booking Cancelled' : 'Booking Request Declined'}
          </p>
          <p className="text-[#66747E]">This request is closed and no vehicle is reserved for it. Please contact our team or submit a new request.</p>
          <Link to="/fleet" className="inline-block font-semibold text-[#16324F] hover:underline">Explore available vehicles</Link>
        </div>
      ) : (
        <div className="bg-[#F8F6F1] border border-[#CAD5DF] rounded-2xl p-5 sm:p-6 space-y-2 text-xs sm:text-sm text-[#24313A] shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#16324F]">
            <Clock className="w-5 h-5 text-[#2F6F6D] flex-shrink-0" />
            <span>Next Step: Fleet Operations Confirmation</span>
          </div>
          <p className="text-[#66747E] leading-relaxed pl-7">
            Your request is in <strong className="text-[#16324F]">pending verification</strong>. Our island operations team will inspect calendar logistics and confirm your vehicle within <strong>2 hours</strong> via email and WhatsApp.
          </p>
          <div className="flex items-center gap-2 pl-7 pt-1 text-[11px] text-[#4F7D61] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>No credit card payment was charged today. Rental payment occurs at car handover.</span>
          </div>
        </div>
      )}

      {/* 3. Detailed Request Summary Voucher */}
      <div className="bg-white rounded-2xl border border-[#DFE6EC] shadow-md overflow-hidden print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="bg-[#16324F] text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base">Booking Summary Voucher</h3>
            <span className="text-xs text-[#EAF0F3]/80">DailyCar · Mauritius</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white ${
            booking.status === 'confirmed' ? 'bg-[#2A6E3B]' :
            booking.status === 'active' ? 'bg-[#1E5F8C]' :
            booking.status === 'completed' ? 'bg-[#37474F]' :
            booking.status === 'rejected' || booking.status === 'cancelled' ? 'bg-[#A83232]' :
            'bg-[#C88A32]'
          }`}>
            Status: {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Vehicle Row */}
          {(() => {
            const v = booking.vehicle || (booking as any).vehicleSummary;
            const photoUrl = v?.photo || (v as any)?.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
            return (
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[#EAF0F3]">
                <img
                  src={photoUrl}
                  alt={v?.model || 'Vehicle'}
                  className="w-full sm:w-44 h-28 object-cover rounded-xl border border-[#DFE6EC]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6F6D]">
                    {v?.category || 'Fleet Vehicle'}
                  </span>
                  <h4 className="font-display font-bold text-xl text-[#16324F]">
                    {v?.brand || ''} {v?.model || 'Vehicle'}
                  </h4>
                  <p className="text-xs text-[#66747E]">
                    {v?.transmission || 'Automatic'} {v?.year ? `· Year ${v.year}` : ''}
                  </p>
                  <p className="text-xs font-semibold text-[#16324F] pt-1">
                    Rate: Rs {booking.pricing?.dailyRate ? booking.pricing.dailyRate.toLocaleString() : (v?.dailyRate ? v.dailyRate.toLocaleString() : '1,500')} / day
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Schedule & Handover Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm pb-6 border-b border-[#EAF0F3]">
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Rental Period</span>
                  <span className="font-semibold text-[#16324F]">
                    {booking.pickupDate} → {booking.returnDate}
                  </span>
                  <span className="text-xs text-[#66747E] block">
                    Duration: {booking.pricing.days} {booking.pricing.days === 1 ? 'day' : 'days'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D97745] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Pickup Location</span>
                  <span className="font-semibold text-[#16324F]">
                    {booking.pickupLocation.name}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Return Location</span>
                  <span className="font-semibold text-[#16324F]">
                    {booking.returnLocation.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Contact Information */}
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Primary Driver / Customer</span>
                  <span className="font-semibold text-[#16324F]">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </span>
                  <span className="text-xs text-[#66747E] block">
                    {booking.customer.country}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Email Voucher Destination</span>
                  <span className="font-semibold text-[#16324F] break-all">
                    {booking.customer.email}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#2F6F6D] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-[#66747E] block">Contact Number</span>
                  <span className="font-semibold text-[#16324F]">
                    {booking.customer.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 text-xs sm:text-sm bg-[#F8F6F1] p-4 rounded-xl border border-[#DFE6EC]">
            <div className="flex justify-between text-[#66747E]">
              <span>Base Vehicle Rental ({booking.pricing.days} days)</span>
              <span className="font-semibold text-[#16324F] tabular-nums">
                Rs {booking.pricing.baseAmount.toLocaleString()}
              </span>
            </div>
            {booking.pricing.locationFee > 0 && (
              <div className="flex justify-between text-[#66747E]">
                <span>Pickup / Return Delivery Surcharge</span>
                <span className="font-semibold text-[#16324F] tabular-nums">
                  +Rs {booking.pricing.locationFee.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#66747E]">
              <span>Statutory 15% VAT</span>
              <span className="font-medium text-[#16324F] tabular-nums">
                Included (Rs {booking.pricing.vatIncluded.toLocaleString()})
              </span>
            </div>
            <div className="pt-2 border-t border-[#DFE6EC] flex items-baseline justify-between">
              <span className="font-display font-bold text-base text-[#16324F]">
                Total Estimated Payable Upon Pickup
              </span>
              <span className="font-display font-extrabold text-2xl text-[#16324F] tabular-nums">
                Rs {booking.pricing.estimatedTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-[#EAF0F3] text-[#16324F] border border-[#CAD5DF] px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Voucher</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#2F6F6D] hover:bg-[#255755] text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </button>
        </div>

        <Link
          to="/fleet"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#D97745] hover:text-[#c26534]"
        >
          <span>Browse other vehicles</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
