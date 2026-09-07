import { INITIAL_MOCK_SUBMITTED_BOOKINGS } from '../mocks/bookings';
import { MOCK_VEHICLES } from '../mocks/vehicles';
import { RENTAL_LOCATIONS } from '../constants/locations';
import { BookingRequest, CreateBookingInput, PricingBreakdown } from '../types/booking';
import { vehicleService } from './vehicleService';
import { calculateRentalDays, getTodayString } from '../utils/dateUtils';
import { adminBookingService } from './admin/adminBookingService';
import { adminVehicleService } from './admin/adminVehicleService';
import { adminCustomerService } from './admin/adminCustomerService';
import { adminNotificationService } from './admin/adminNotificationService';

const STORAGE_KEY = 'oceane_booking_requests_v1';
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

function getStoredBookings(): BookingRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_SUBMITTED_BOOKINGS));
      return INITIAL_MOCK_SUBMITTED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return INITIAL_MOCK_SUBMITTED_BOOKINGS;
    }
    // Normalize items to ensure resilient vehicle snapshot data
    return parsed.map((item: any) => {
      const v = item.vehicle || item.vehicleSummary;
      const fallbackVehicle = MOCK_VEHICLES.find((m) => m.id === item.vehicleId);
      const photo = v?.photo || v?.photos?.[0] || fallbackVehicle?.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
      const normalizedVehicle = {
        id: v?.id || item.vehicleId || 'veh-fallback',
        slug: v?.slug || fallbackVehicle?.slug || '',
        brand: v?.brand || fallbackVehicle?.brand || 'Fleet',
        model: v?.model || fallbackVehicle?.model || 'Vehicle',
        year: v?.year || fallbackVehicle?.year || 2025,
        category: v?.category || fallbackVehicle?.category || 'sedan',
        dailyRate: v?.dailyRate || fallbackVehicle?.dailyRate || 1800,
        transmission: v?.transmission || fallbackVehicle?.transmission || 'Automatic',
        fuelType: v?.fuelType || fallbackVehicle?.fuelType || 'Petrol',
        seats: v?.seats || fallbackVehicle?.seats || 5,
        photo,
      };
      return {
        ...item,
        vehicle: normalizedVehicle,
        vehicleSummary: normalizedVehicle,
      };
    });
  } catch (err) {
    console.error('Error reading stored bookings:', err);
    return INITIAL_MOCK_SUBMITTED_BOOKINGS;
  }
}

function saveStoredBookings(list: BookingRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_bookings_updated'));
  } catch (err) {
    console.error('Error writing stored bookings:', err);
  }
}

export const bookingService = {
  /**
   * Calculates rental days and transparent estimated pricing.
   * Same-day returns (pickup === return) are supported and billed as 1 day.
   */
  calculatePricing(
    dailyRate: number,
    pickupDateStr: string,
    returnDateStr: string,
    pickupLocId = 'airport-mru',
    returnLocId = 'airport-mru'
  ): PricingBreakdown {
    const days = calculateRentalDays(pickupDateStr, returnDateStr);

    const pickupLoc = RENTAL_LOCATIONS.find(l => l.id === pickupLocId);
    const returnLoc = RENTAL_LOCATIONS.find(l => l.id === returnLocId);
    const locationFee = (pickupLoc?.pickupFee || 0) + (returnLoc?.dropoffFee || 0);

    const baseAmount = dailyRate * days;
    const estimatedTotal = baseAmount + locationFee;
    // 15% VAT included in Mauritian statutory display
    const vatIncluded = Math.round(estimatedTotal * (15 / 115));

    return {
      days,
      dailyRate,
      baseAmount,
      locationFee,
      vatIncluded,
      estimatedTotal,
      currency: 'MUR',
    };
  },

  /**
   * Submits a customer booking request.
   * Performs validation & simulated availability check before persisting.
   */
  async createBookingRequest(input: CreateBookingInput): Promise<BookingRequest> {
    await delay(350); // realistic network delay

    const todayStr = getTodayString();
    if (!input.pickupDate || input.pickupDate < todayStr) {
      throw new Error('Pickup date cannot be in the past. Please select today or a future date.');
    }

    if (!input.returnDate || input.returnDate < input.pickupDate) {
      throw new Error('Return date cannot be earlier than pickup date. Same-day return or future dates are accepted.');
    }

    const vehicle = MOCK_VEHICLES.find(v => v.id === input.vehicleId && v.published === true);
    if (!vehicle) {
      throw new Error('Requested vehicle does not exist or is no longer published.');
    }

    // Availability validation check
    const check = await vehicleService.checkVehicleAvailability(
      input.vehicleId,
      input.pickupDate,
      input.returnDate
    );

    if (!check.isAvailable) {
      throw new Error(
        'This vehicle is not available for the selected dates due to a scheduling block. Please choose different dates or select an alternative vehicle.'
      );
    }

    // Resolve locations
    const pickupLoc = RENTAL_LOCATIONS.find(l => l.id === input.pickupLocationId) || RENTAL_LOCATIONS[0];
    const returnLoc = RENTAL_LOCATIONS.find(l => l.id === input.returnLocationId) || RENTAL_LOCATIONS[0];

    const pricing = this.calculatePricing(
      vehicle.dailyRate,
      input.pickupDate,
      input.returnDate,
      pickupLoc.id,
      returnLoc.id
    );

    // Generate unique reference (e.g. OCR-2026-7193)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reference = `OCR-2026-${randomSuffix}`;

    const newRequest: BookingRequest = {
      id: `req-${Date.now()}-${randomSuffix}`,
      reference,
      vehicleId: vehicle.id,
      vehicle: {
        id: vehicle.id,
        slug: vehicle.slug,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        dailyRate: vehicle.dailyRate,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        seats: vehicle.seats,
        photo: vehicle.photos[0] || '',
      },
      pickupLocation: pickupLoc,
      returnLocation: returnLoc,
      pickupDate: input.pickupDate,
      returnDate: input.returnDate,
      pricing,
      customer: { ...input.customer },
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const currentList = getStoredBookings();
    currentList.unshift(newRequest);
    saveStoredBookings(currentList);

    // Synchronize to Admin Dashboard in background
    try {
      const customerFullName = `${input.customer.firstName.trim()} ${input.customer.lastName.trim()}`;
      
      // 1. Check or register customer profile in Admin CRM
      let customerId = `cust-${Date.now().toString().slice(-6)}`;
      try {
        const existingCustomers = await adminCustomerService.getCustomers();
        const match = existingCustomers.find(
          (c) => c.email.toLowerCase() === input.customer.email.trim().toLowerCase()
        );
        if (match) {
          customerId = match.id;
        } else {
          const newCust = await adminCustomerService.createCustomer({
            firstName: input.customer.firstName.trim(),
            lastName: input.customer.lastName.trim(),
            email: input.customer.email.trim(),
            phone: input.customer.phone.trim(),
            country: input.customer.country || 'Mauritius',
            address: input.customer.country || 'Mauritius',
            licenceNumber: 'Pending Verification at Pickup',
            licenceExpiryDate: '2028-12-31',
            licenceCountry: input.customer.country || 'Mauritius',
            idOrPassport: 'Pending Verification',
          });
          customerId = newCust.id;
        }
      } catch (err) {
        console.error('Customer sync fallback:', err);
      }

      // 2. Resolve vehicle registration number
      let vehicleReg = '5972 DZ 14';
      try {
        const adminVeh = await adminVehicleService.getVehicle(vehicle.id);
        if (adminVeh) {
          vehicleReg = adminVeh.registrationNumber;
        }
      } catch (err) {
        console.error('Vehicle reg fallback:', err);
      }

      // 3. Register in Admin Bookings
      await adminBookingService.createBooking({
        id: newRequest.id,
        reference,
        customerId,
        customerName: customerFullName,
        customerEmail: input.customer.email.trim(),
        customerPhone: input.customer.phone.trim(),
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.brand} ${vehicle.model}`,
        vehicleReg,
        pickupDate: input.pickupDate,
        returnDate: input.returnDate,
        pickupLocation: pickupLoc.name,
        returnLocation: returnLoc.name,
        dailyRate: vehicle.dailyRate,
        days: pricing.days,
        estimatedAmount: pricing.estimatedTotal,
        finalAmount: pricing.estimatedTotal,
        securityDeposit: 15000,
        bookingStatus: 'pending',
        paymentStatus: 'Unpaid',
        specialRequests: input.customer.specialRequest,
      });

      // 4. Send operational notification to Admin Top Nav Bell
      await adminNotificationService.addNotification({
        type: 'booking_request',
        title: `New Online Reservation: ${customerFullName}`,
        description: `Requested ${vehicle.brand} ${vehicle.model} (${vehicleReg}) for ${pricing.days} days (${input.pickupDate} to ${input.returnDate}). Ref: ${reference}`,
        link: '/admin',
      });
    } catch (err) {
      console.error('Failed to sync booking to Admin service:', err);
    }

    return newRequest;
  },

  /**
   * Retrieves a booking request by reference code, synchronized with Admin state
   */
  async getBookingByReference(reference: string): Promise<BookingRequest | null> {
    await delay(100);
    const list = getStoredBookings();
    const cleanRef = reference.trim().toUpperCase();
    let found = list.find(b => b.reference.toUpperCase() === cleanRef);

    // Cross-check with Admin bookings for live status changes (e.g. confirmed, active, completed)
    try {
      const adminBooking = await adminBookingService.getBooking(cleanRef);
      if (adminBooking) {
        if (found) {
          // Sync live operational status back into the customer request
          found.status = adminBooking.bookingStatus as any;
          return { ...found };
        } else {
          // If created in admin but queried on frontend
          const fallbackVehicle = MOCK_VEHICLES.find(v => v.id === adminBooking.vehicleId) || MOCK_VEHICLES[0];
          const reconstructed: BookingRequest = {
            id: adminBooking.id,
            reference: adminBooking.reference,
            vehicleId: adminBooking.vehicleId,
            vehicle: {
              id: fallbackVehicle.id,
              slug: fallbackVehicle.slug,
              brand: fallbackVehicle.brand,
              model: fallbackVehicle.model,
              year: fallbackVehicle.year,
              category: fallbackVehicle.category,
              dailyRate: adminBooking.dailyRate,
              transmission: fallbackVehicle.transmission,
              fuelType: fallbackVehicle.fuelType,
              seats: fallbackVehicle.seats,
              photo: fallbackVehicle.photos[0],
            },
            pickupLocation: { id: 'loc-airport', name: adminBooking.pickupLocation, address: adminBooking.pickupLocation, area: 'Airport', pickupFee: 0, dropoffFee: 0 },
            returnLocation: { id: 'loc-airport', name: adminBooking.returnLocation, address: adminBooking.returnLocation, area: 'Airport', pickupFee: 0, dropoffFee: 0 },
            pickupDate: adminBooking.pickupDate,
            returnDate: adminBooking.returnDate,
            pricing: {
              days: adminBooking.days,
              dailyRate: adminBooking.dailyRate,
              baseAmount: adminBooking.estimatedAmount,
              locationFee: 0,
              vatIncluded: 0,
              estimatedTotal: adminBooking.finalAmount || adminBooking.estimatedAmount,
              currency: 'MUR',
            },
            customer: {
              firstName: adminBooking.customerName.split(' ')[0] || 'Valued',
              lastName: adminBooking.customerName.split(' ').slice(1).join(' ') || 'Customer',
              email: adminBooking.customerEmail,
              phone: adminBooking.customerPhone,
              country: 'Mauritius',
              specialRequest: adminBooking.specialRequests || '',
            },
            status: adminBooking.bookingStatus as any,
            createdAt: adminBooking.createdAt,
          };
          return reconstructed;
        }
      }
    } catch {
      // ignore
    }

    return found || null;
  },

  /**
   * Retrieves all local mock bookings (for demo / state debugging)
   */
  async getAllSubmittedBookings(): Promise<BookingRequest[]> {
    await delay(100);
    return getStoredBookings();
  },
};
