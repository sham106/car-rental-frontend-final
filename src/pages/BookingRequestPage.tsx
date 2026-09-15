import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  CheckCircle2,
  ArrowLeft, 
  ArrowRight, 
  Car, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { vehicleService } from '../services/vehicleService';
import { bookingService } from '../services/bookingService';
import { useQuote } from '../hooks/useQuote';
import { Vehicle } from '../types/vehicle';
import { CustomerDetails, RentalLocation } from '../types/booking';
import { useSearch } from '../context/SearchContext';
import { useLocations } from '../hooks/useLocations';
import { BRAND } from '../constants/theme';
import { addDays } from '../utils/dateUtils';
import { VehicleAvailabilityCalendar } from '../components/vehicle/VehicleAvailabilityCalendar';

export const BookingRequestPage: React.FC = () => {
  const RENTAL_LOCATIONS = useLocations();
  const [searchParams] = useSearchParams();
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

  const vehicleIdParam = searchParams.get('vehicleId');

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(true);

  // Customer Details Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    country: 'Mauritius',
    specialRequest: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fleetVersion, setFleetVersion] = useState(0);
  const [availabilityCheck, setAvailabilityCheck] = useState<{ isAvailable: boolean; reason?: string } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Check availability when dates change
  useEffect(() => {
    let isMounted = true;
    if (vehicle?.id && pickupDate && returnDate && dateValidation.isValid) {
      setCheckingAvailability(true);
      vehicleService.checkVehicleAvailability(vehicle.id, pickupDate, returnDate).then((res) => {
        if (isMounted) {
          setAvailabilityCheck(res);
          setCheckingAvailability(false);
        }
      });
    } else {
      setAvailabilityCheck(null);
      setCheckingAvailability(false);
    }
    return () => {
      isMounted = false;
    };
  }, [vehicle?.id, pickupDate, returnDate, dateValidation.isValid]);

  useEffect(() => {
    const handleUpdate = () => setFleetVersion((v) => v + 1);
    window.addEventListener('oceane_fleet_updated', handleUpdate);
    return () => window.removeEventListener('oceane_fleet_updated', handleUpdate);
  }, []);

  // Load selected vehicle
  useEffect(() => {
    let isMounted = true;
    if (vehicleIdParam) {
      setLoadingVehicle(true);
      vehicleService.getVehicleById(vehicleIdParam).then((v) => {
        if (isMounted) {
          setVehicle(v);
          setLoadingVehicle(false);
        }
      }).catch(e => { if (isMounted) {setLoadingVehicle(false);setSubmitError(e.message);} });
    } else {
      // If no vehicle selected, pick the first featured vehicle
      vehicleService.getFeaturedVehicles().then((feats) => {
        if (isMounted) {
          setVehicle(feats[0] || null);
          setLoadingVehicle(false);
        }
      }).catch(e => { if (isMounted) {setLoadingVehicle(false);setSubmitError(e.message);} });
    }
    return () => {
      isMounted = false;
    };
  }, [vehicleIdParam, fleetVersion]);

  const {pricing, error: quoteError} = useQuote(vehicle?.id,pickupDate,returnDate,pickupLocationId,returnLocationId);
  const pickupLocation = RENTAL_LOCATIONS.find((l) => l.id === pickupLocationId) || RENTAL_LOCATIONS[0];
  const returnLocation = RENTAL_LOCATIONS.find((l) => l.id === returnLocationId) || RENTAL_LOCATIONS[0];

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!customer.firstName.trim()) errs.firstName = 'First name is required';
    if (!customer.lastName.trim()) errs.lastName = 'Last name is required';
    if (!customer.email.trim() || !customer.email.includes('@')) {
      errs.email = 'Valid email address is required for confirmation';
    }
    if (!customer.phone.trim() || customer.phone.length < 7) {
      errs.phone = 'Phone number with country code is required';
    }
    if (!customer.country.trim()) errs.country = 'Country is required';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextToStep2 = async () => {
    if (!vehicle || !pricing) { setSubmitError(quoteError || 'Wait for the current price before continuing.'); return; }
    setSubmitError(null);

    // Date validity check (cannot be in the past, return cannot be before pickup)
    if (!dateValidation.isValid) {
      setSubmitError(dateValidation.errorMessage || 'Please select valid rental dates.');
      return;
    }

    // Check availability before advancing
    try {
    const check = await vehicleService.checkVehicleAvailability(vehicle.id, pickupDate, returnDate);
    if (!check.isAvailable) {
      setSubmitError('This vehicle is not available on the selected dates. Please adjust your dates or choose another car.');
      return;
    }
    setStep(2);
    } catch(e) {setSubmitError(e instanceof Error ? e.message : "Unable to check availability.");}
  };

  const handleNextToStep3 = () => {
    if (validateStep2()) {
      setStep(3);
    }
  };

  const handleFinalSubmit = async () => {
    if (!vehicle || !pricing) { setSubmitError(quoteError || 'Wait for the current price before continuing.'); return; }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const result = await bookingService.createBookingRequest({
        vehicleId: vehicle.id,
        pickupLocationId,
        returnLocationId,
        pickupDate,
        returnDate,
        customer,
      });

      // Navigate to confirmation page
      navigate(`/confirmation?ref=${result.reference}`);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while submitting your booking request.');
      setSubmitting(false);
    }
  };

  if (loadingVehicle) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#2F6F6D] animate-spin mx-auto" />
        <p className="text-sm text-[#66747E]">Preparing booking schedule...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#16324F]">No Vehicle Selected</h2>
        <p className="text-sm text-[#66747E]">Please choose a car from our fleet first.</p>
        <Link to="/fleet" className="inline-block px-5 py-2.5 bg-[#16324F] text-white rounded-xl text-xs font-semibold">
          Explore Fleet
        </Link>
      </div>
    );
  }

  return (
    <div id="booking-request-page" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* 1. Header & Step Indicator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            to={`/vehicle/${vehicle.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16324F] hover:text-[#2F6F6D]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Vehicle Details</span>
          </Link>
          <span className="text-xs text-[#66747E]">Step {step} of 3</span>
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#16324F]">
          Request Vehicle Booking
        </h1>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
          <div
            className={`p-3 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 ${
              step >= 1
                ? 'bg-white border-[#2F6F6D] text-[#16324F] shadow-xs'
                : 'bg-[#EAF0F3] border-transparent text-[#66747E]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step > 1 ? 'bg-[#4F7D61] text-white' : 'bg-[#16324F] text-white'
              }`}
            >
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span className="truncate">1. Dates & Pickup</span>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 ${
              step >= 2
                ? 'bg-white border-[#2F6F6D] text-[#16324F] shadow-xs'
                : 'bg-[#EAF0F3] border-transparent text-[#66747E]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step > 2 ? 'bg-[#4F7D61] text-white' : step === 2 ? 'bg-[#16324F] text-white' : 'bg-[#CAD5DF] text-white'
              }`}
            >
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span className="truncate">2. Customer Info</span>
          </div>

          <div
            className={`p-3 rounded-xl border transition-all text-xs font-semibold flex items-center gap-2.5 ${
              step === 3
                ? 'bg-white border-[#2F6F6D] text-[#16324F] shadow-xs'
                : 'bg-[#EAF0F3] border-transparent text-[#66747E]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                step === 3 ? 'bg-[#16324F] text-white' : 'bg-[#CAD5DF] text-white'
              }`}
            >
              3
            </div>
            <span className="truncate">3. Review & Submit</span>
          </div>
        </div>
      </div>

      {/* Global Error Banner */}
      {submitError && (
        <div className="p-4 rounded-xl bg-[#B9534F]/10 border border-[#B9534F]/30 text-[#B9534F] text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Booking Scheduling Issue</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* 2. Main Step Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Interactive Wizard Column */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#DFE6EC] shadow-sm space-y-6">
          {/* STEP 1: Vehicle & Dates Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display font-bold text-lg text-[#16324F]">
                Step 1: Confirm Vehicle & Rental Schedule
              </h2>

              {/* Selected Vehicle Card Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC]">
                <img
                  src={vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'}
                  alt={vehicle.model}
                  className="w-full sm:w-36 h-24 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="space-y-1 text-center sm:text-left flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2F6F6D] bg-white px-2 py-0.5 rounded">
                    {vehicle.category}
                  </span>
                  <h3 className="font-display font-bold text-base text-[#16324F]">
                    {vehicle.brand} {vehicle.model} ({vehicle.year})
                  </h3>
                  <p className="text-xs text-[#66747E]">
                    {vehicle.transmission} · {vehicle.fuelType} · {vehicle.seats} Seats · {vehicle.color}
                  </p>
                </div>
                <div className="text-center sm:text-right">
                  <span className="text-xs text-[#66747E]">Daily Rate</span>
                  <p className="font-display font-bold text-lg text-[#16324F] tabular-nums">
                    Rs {vehicle.dailyRate.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Availability & Booked Dates Interactive Calendar */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#16324F] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#2F6F6D]" />
                    <span>Availability & Booked Dates Calendar</span>
                  </label>
                  <span className="text-[11px] text-[#66747E]">
                    Dates in red are already booked · Click open dates to select
                  </span>
                </div>

                <VehicleAvailabilityCalendar
                  vehicleId={vehicle.id}
                  vehicleName={`${vehicle.brand} ${vehicle.model}`}
                  pickupDate={pickupDate}
                  returnDate={returnDate}
                  onSelectRange={(p, r) => {
                    if (p && r) setSearchParameters({ pickupDate: p, returnDate: r });
                  }}
                />
              </div>

              {/* Rental Dates Inputs & Adjustments */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E]">
                        Pickup Date
                      </label>
                      <span className="text-[10px] text-[#66747E]">Cannot be in the past</span>
                    </div>
                    <input
                      type="date"
                      min={todayStr}
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-semibold text-[#24313A] focus:ring-2 focus:ring-[#2F6F6D]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E]">
                        Return Date
                      </label>
                      <button
                        type="button"
                        onClick={setSameDayReturn}
                        className="text-[11px] font-semibold text-[#2F6F6D] hover:underline cursor-pointer"
                      >
                        Return same day?
                      </button>
                    </div>
                    <input
                      type="date"
                      min={pickupDate || todayStr}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-semibold text-[#24313A] focus:ring-2 focus:ring-[#2F6F6D]"
                    />
                  </div>
                </div>

                {/* Quick Presets & Validation Helper */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#66747E]">Preset:</span>
                    <button
                      type="button"
                      onClick={setSameDayReturn}
                      className={`px-2.5 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                        isSameDay ? 'bg-[#2F6F6D] text-white' : 'bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3]'
                      }`}
                    >
                      Same Day (1 Day)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnDate(addDays(pickupDate || todayStr, 1))}
                      className="px-2.5 py-1 rounded-lg font-medium text-xs bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
                    >
                      +1 Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnDate(addDays(pickupDate || todayStr, 3))}
                      className="px-2.5 py-1 rounded-lg font-medium text-xs bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
                    >
                      +3 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnDate(addDays(pickupDate || todayStr, 7))}
                      className="px-2.5 py-1 rounded-lg font-medium text-xs bg-[#F8F6F1] text-[#24313A] hover:bg-[#EAF0F3] transition-colors cursor-pointer"
                    >
                      +1 Wk
                    </button>
                  </div>

                  {isSameDay ? (
                    <span className="inline-flex items-center gap-1 text-xs text-[#2F6F6D] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Same-day return by 20:00 (1 day standard rental)
                    </span>
                  ) : (
                    <span className="text-xs text-[#66747E]">
                      {pricing?.days} {pricing?.days === 1 ? 'day' : 'days'} booking period
                    </span>
                  )}
                </div>

                {/* Unavailable Collision Alert */}
                {availabilityCheck && !availabilityCheck.isAvailable && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-950">Dates Already Booked:</span>{' '}
                      <span className="text-rose-800">
                        {availabilityCheck.reason || 'This vehicle is already reserved for the selected period. Please choose available dates on the calendar above.'}
                      </span>
                    </div>
                  </div>
                )}

                {!dateValidation.isValid && (
                  <div className="p-3 bg-[#B9534F]/10 border border-[#B9534F]/20 rounded-xl text-xs text-[#B9534F] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{dateValidation.errorMessage}</span>
                  </div>
                )}
              </div>

              {/* Handover Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1.5">
                    Pickup Location
                  </label>
                  <select
                    value={pickupLocationId}
                    onChange={(e) => setPickupLocationId(e.target.value)}
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:ring-2 focus:ring-[#2F6F6D]"
                  >
                    {RENTAL_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.pickupFee > 0 ? `(+Rs ${loc.pickupFee})` : '(Free Handover)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1.5">
                    Return Location
                  </label>
                  <select
                    value={returnLocationId}
                    onChange={(e) => setReturnLocationId(e.target.value)}
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm font-medium text-[#24313A] focus:ring-2 focus:ring-[#2F6F6D]"
                  >
                    {RENTAL_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.dropoffFee > 0 ? `(+Rs ${loc.dropoffFee})` : '(Free Handover)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Next Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  id="btn-step1-next"
                  onClick={handleNextToStep2}
                  disabled={!dateValidation.isValid || (availabilityCheck ? !availabilityCheck.isAvailable : false)}
                  className="inline-flex items-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all cursor-pointer"
                >
                  <span>Continue to Customer Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Customer Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#DFE6EC] pb-3">
                <h2 className="font-display font-bold text-lg text-[#16324F]">
                  Step 2: Customer Contact Information
                </h2>
                <span className="text-xs text-[#66747E]">Required for reservation voucher</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="input-first-name"
                    value={customer.firstName}
                    onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                    placeholder="e.g. Marcus"
                    className={`w-full p-3 bg-[#F8F6F1] border rounded-xl text-sm ${
                      formErrors.firstName ? 'border-[#B9534F]' : 'border-[#CAD5DF]'
                    } focus:ring-2 focus:ring-[#2F6F6D]`}
                  />
                  {formErrors.firstName && (
                    <span className="text-[11px] text-[#B9534F] mt-1 block">{formErrors.firstName}</span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="input-last-name"
                    value={customer.lastName}
                    onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                    placeholder="e.g. Vance"
                    className={`w-full p-3 bg-[#F8F6F1] border rounded-xl text-sm ${
                      formErrors.lastName ? 'border-[#B9534F]' : 'border-[#CAD5DF]'
                    } focus:ring-2 focus:ring-[#2F6F6D]`}
                  />
                  {formErrors.lastName && (
                    <span className="text-[11px] text-[#B9534F] mt-1 block">{formErrors.lastName}</span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="input-email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="e.g. marcus.vance@example.com"
                    className={`w-full p-3 bg-[#F8F6F1] border rounded-xl text-sm ${
                      formErrors.email ? 'border-[#B9534F]' : 'border-[#CAD5DF]'
                    } focus:ring-2 focus:ring-[#2F6F6D]`}
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-[#B9534F] mt-1 block">{formErrors.email}</span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Phone / WhatsApp (with country code) *
                  </label>
                  <input
                    type="tel"
                    id="input-phone"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    placeholder="e.g. +44 7700 900077"
                    className={`w-full p-3 bg-[#F8F6F1] border rounded-xl text-sm ${
                      formErrors.phone ? 'border-[#B9534F]' : 'border-[#CAD5DF]'
                    } focus:ring-2 focus:ring-[#2F6F6D]`}
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-[#B9534F] mt-1 block">{formErrors.phone}</span>
                  )}
                </div>

                {/* Country */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Country of Residence *
                  </label>
                  <input
                    type="text"
                    id="input-country"
                    value={customer.country}
                    onChange={(e) => setCustomer({ ...customer, country: e.target.value })}
                    placeholder="e.g. United Kingdom, France, South Africa, Germany..."
                    className={`w-full p-3 bg-[#F8F6F1] border rounded-xl text-sm ${
                      formErrors.country ? 'border-[#B9534F]' : 'border-[#CAD5DF]'
                    } focus:ring-2 focus:ring-[#2F6F6D]`}
                  />
                  {formErrors.country && (
                    <span className="text-[11px] text-[#B9534F] mt-1 block">{formErrors.country}</span>
                  )}
                </div>

                {/* Special Request / Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#66747E] mb-1">
                    Special Request or Flight Number (Optional)
                  </label>
                  <textarea
                    rows={3}
                    id="input-special-request"
                    value={customer.specialRequest || ''}
                    onChange={(e) => setCustomer({ ...customer, specialRequest: e.target.value })}
                    placeholder="e.g. Arriving on British Airways flight BA2061 at 11:30. Child booster seat requested."
                    className="w-full p-3 bg-[#F8F6F1] border border-[#CAD5DF] rounded-xl text-sm text-[#24313A] focus:ring-2 focus:ring-[#2F6F6D] resize-none"
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66747E] hover:text-[#16324F]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dates</span>
                </button>
                <button
                  type="button"
                  id="btn-step2-next"
                  onClick={handleNextToStep3}
                  className="inline-flex items-center gap-2 bg-[#D97745] hover:bg-[#c26534] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all"
                >
                  <span>Review Booking Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Final Review & Confirmation of Terms */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#DFE6EC] pb-3">
                <h2 className="font-display font-bold text-lg text-[#16324F]">
                  Step 3: Review Details & Submit Request
                </h2>
                <span className="text-xs text-[#4F7D61] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>No payment required now</span>
                </span>
              </div>

              {/* Review Overview Blocks */}
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Vehicle & Duration */}
                <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#16324F]">Vehicle Selected:</span>
                    <span className="font-semibold text-[#2F6F6D]">
                      {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Rental Duration:</span>
                    <span className="font-semibold text-[#24313A]">
                      {pickupDate} to {returnDate} ({pricing?.days} days)
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Pickup Location:</span>
                    <span className="font-medium text-[#24313A]">{pickupLocation?.name}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Return Location:</span>
                    <span className="font-medium text-[#24313A]">{returnLocation?.name}</span>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 rounded-xl bg-[#F8F6F1] border border-[#DFE6EC] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#16324F]">Customer:</span>
                    <span className="font-semibold text-[#24313A]">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Email Address:</span>
                    <span className="text-[#24313A]">{customer.email}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Contact Number:</span>
                    <span className="text-[#24313A]">{customer.phone}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#66747E]">Country:</span>
                    <span className="text-[#24313A]">{customer.country}</span>
                  </div>
                  {customer.specialRequest && (
                    <div className="pt-2 border-t border-[#DFE6EC]">
                      <span className="text-[#66747E] block mb-0.5">Special Request:</span>
                      <p className="text-xs text-[#24313A] italic bg-white p-2 rounded-lg border border-[#DFE6EC]">
                        "{customer.specialRequest}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* V1 Policy Acknowledgment Notice */}
              <div className="p-4 rounded-xl bg-[#EAF0F3] border border-[#DFE6EC] text-xs text-[#24313A] space-y-2">
                <p className="font-semibold text-[#16324F] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#2F6F6D]" />
                  <span>How availability confirmation works in V1:</span>
                </p>
                <p className="text-[#66747E] leading-relaxed">
                  By clicking "Submit Booking Request", your inquiry is registered with our fleet dispatch system. Our team reviews fleet logistics and contacts you via email or WhatsApp within 2 hours to confirm your reservation. Payment is made upon vehicle inspection at pickup.
                </p>
              </div>

              {/* Navigation Controls */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66747E] hover:text-[#16324F]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Edit Contact Info</span>
                </button>
                <button
                  type="button"
                  id="btn-submit-booking-request"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-[#D97745] hover:bg-[#c26534] disabled:bg-[#CAD5DF] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Booking Request</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: Summary Card */}
        {pricing && (
          <aside className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#DFE6EC] shadow-sm space-y-4 sticky top-24">
            <h3 className="font-display font-bold text-base text-[#16324F]">
              Estimated Pricing Summary
            </h3>

            <div className="space-y-2.5 text-xs border-y border-[#EAF0F3] py-3">
              <div className="flex justify-between text-[#66747E]">
                <span>
                  {vehicle.brand} {vehicle.model}
                </span>
                <span className="font-semibold text-[#16324F]">
                  Rs {vehicle.dailyRate.toLocaleString()}/day
                </span>
              </div>
              <div className="flex justify-between text-[#66747E]">
                <span>Rental Period</span>
                <span className="font-semibold text-[#16324F]">
                  {pricing.days} {pricing.days === 1 ? 'day' : 'days'}
                </span>
              </div>
              <div className="flex justify-between text-[#66747E]">
                <span>Base Total</span>
                <span className="font-semibold text-[#16324F] tabular-nums">
                  Rs {pricing.baseAmount.toLocaleString()}
                </span>
              </div>
              {pricing.locationFee > 0 && (
                <div className="flex justify-between text-[#66747E]">
                  <span>Location Delivery Fee</span>
                  <span className="font-semibold text-[#16324F] tabular-nums">
                    +Rs {pricing.locationFee.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[#66747E]">
                <span>Standard CDW Insurance</span>
                <span className="text-[#4F7D61] font-semibold">Included</span>
              </div>
            </div>

            <div className="pt-1 flex items-baseline justify-between">
              <div>
                <span className="font-display font-bold text-sm text-[#16324F] block">
                  Estimated Total
                </span>
                <span className="text-[10px] text-[#66747E]">
                  Includes 15% VAT (Rs {pricing.vatIncluded.toLocaleString()})
                </span>
              </div>
              <span className="font-display font-extrabold text-2xl text-[#16324F] tabular-nums">
                Rs {pricing.estimatedTotal.toLocaleString()}
              </span>
            </div>

            <div className="p-3 bg-[#F8F6F1] rounded-xl text-[11px] text-[#66747E] space-y-1">
              <p className="font-medium text-[#16324F]">Payment Policy:</p>
              <p>No upfront charge today. Final settlement in MUR, EUR or USD upon vehicle collection.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
