export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'rejected' | 'cancelled';

export interface RentalLocation {
  id: string;
  name: string;
  area: string; // e.g. "Airport", "North", "West", "East", "Central"
  pickupFee: number; // in MUR Rs
  dropoffFee: number; // in MUR Rs
  address: string;
  isPopular?: boolean;
}

export interface CustomerDetails {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  specialRequest?: string;
}

export interface VehicleSnapshot {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  dailyRate: number;
  transmission: string;
  fuelType: string;
  seats: number;
  photo: string;
}

export interface PricingBreakdown {
  days: number;
  dailyRate: number;
  baseAmount: number;
  locationFee: number;
  vatIncluded: number;
  estimatedTotal: number;
  currency: string;
}

export interface BookingRequest {
  id: string;
  reference: string; // e.g. "OCR-2026-7842"
  vehicleId: string;
  vehicle: VehicleSnapshot;
  pickupLocation: RentalLocation;
  returnLocation: RentalLocation;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  pricing: PricingBreakdown;
  customer: CustomerDetails;
  status: BookingStatus;
  createdAt: string; // ISO string
}

export interface CreateBookingInput {
  vehicleId: string;
  pickupLocationId: string;
  returnLocationId: string;
  pickupDate: string;
  returnDate: string;
  customer: CustomerDetails;
}

export interface AvailabilityBlock {
  id: string;
  vehicleId: string;
  type: 'confirmed_booking' | 'active_rental' | 'maintenance' | 'hold';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reference?: string;
  notes?: string;
}
