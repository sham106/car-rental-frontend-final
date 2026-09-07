export type OperationalStatus = 
  | 'available'
  | 'reserved'
  | 'rented'
  | 'assigned'
  | 'in_service'
  | 'compliance_hold'
  | 'inactive';

export type TransmissionType = 'Automatic' | 'Manual';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';

export interface VehicleCategory {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  representativePhoto: string;
  startingDailyRate: number;
  vehicleCount: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  category: string; // references VehicleCategory.slug
  description: string;
  dailyRate: number; // in MUR (Rs)
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  luggageCapacity: number; // count of suitcases
  doors: number;
  airConditioning: boolean;
  features: string[];
  photos: string[];
  operationalStatus: OperationalStatus;
  published: boolean;
  featured: boolean;
  
  // Extra client display attributes (not administrative)
  engineCapacity?: string;
  fuelConsumption?: string; // e.g. "5.2L / 100km"
  minimumDriverAge?: number;
}

export interface VehicleFilterParams {
  search?: string;
  category?: string;
  brand?: string;
  transmission?: TransmissionType | 'all';
  fuelType?: FuelType | 'all';
  minSeats?: number;
  maxPrice?: number;
  minPrice?: number;
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'year_desc';
  pickupDate?: string;
  returnDate?: string;
}

export interface VehicleAvailabilityCheck {
  isAvailable: boolean;
  reason?: 'confirmed_booking' | 'active_rental' | 'maintenance_block' | 'administrative_hold' | 'invalid_dates';
  conflictingBookingReference?: string;
}

export interface VehicleBookedRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: 'confirmed_booking' | 'active_rental' | 'maintenance';
  label: string;
  reference?: string;
}
