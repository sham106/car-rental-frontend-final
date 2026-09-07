import { MOCK_VEHICLES } from '../mocks/vehicles';
import { MOCK_AVAILABILITY_BLOCKS } from '../mocks/bookings';
import { Vehicle, VehicleAvailabilityCheck, VehicleFilterParams, VehicleBookedRange } from '../types/vehicle';
import { getTodayString, addDays } from '../utils/dateUtils';
import { adminVehicleService } from './admin/adminVehicleService';
import { adminBookingService } from './admin/adminBookingService';
import { AdminVehicle } from '../types/admin';

// Helper to check if two date intervals overlap: [startA, endA] and [startB, endB]
function datesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA <= endB && endA >= startB;
}

// Map AdminVehicle record to public client Vehicle structure
function mapAdminVehicleToClient(av: AdminVehicle): Vehicle {
  const fallback = MOCK_VEHICLES.find((m) => m.id === av.id || m.slug === av.slug);
  return {
    id: av.id,
    slug: av.slug || `${av.brand.toLowerCase()}-${av.model.toLowerCase().replace(/\s+/g, '-')}`,
    brand: av.brand,
    model: av.model,
    year: av.year,
    color: av.color,
    category: av.category,
    description: av.description || fallback?.description || `${av.year} ${av.brand} ${av.model} available for rent in Mauritius.`,
    dailyRate: av.dailyRate,
    transmission: av.transmission,
    fuelType: av.fuelType,
    seats: av.seats,
    luggageCapacity: av.luggageCapacity ?? (fallback?.luggageCapacity || 2),
    doors: av.doors ?? (fallback?.doors || 4),
    airConditioning: av.airConditioning ?? true,
    features: av.features && av.features.length > 0 ? av.features : (fallback?.features || []),
    photos: av.photos && av.photos.length > 0 ? av.photos : (fallback?.photos || ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80']),
    operationalStatus: av.operationalStatus as any,
    published: av.published,
    featured: av.featured,
    engineCapacity: fallback?.engineCapacity,
    fuelConsumption: fallback?.fuelConsumption,
    minimumDriverAge: fallback?.minimumDriverAge || 21,
  };
}

async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    const adminList = await adminVehicleService.getVehicles();
    if (adminList && adminList.length > 0) {
      return adminList.map(mapAdminVehicleToClient);
    }
  } catch {
    // fallback
  }
  return MOCK_VEHICLES;
}

// Simulate realistic network latency for the mock API
const delay = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms));

export const vehicleService = {
  /**
   * Retrieves all published vehicles matching optional filters and availability dates.
   * Internal/unpublished vehicles are strictly excluded.
   */
  async getVehicles(params: VehicleFilterParams = {}): Promise<Vehicle[]> {
    await delay();
    const all = await getAllVehicles();

    // 1. Filter only published vehicles
    let list = all.filter(v => v.published === true);

    // 2. Filter by search query (brand, model, category, color)
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(v => 
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.color.toLowerCase().includes(q)
      );
    }

    // 3. Filter by category
    if (params.category && params.category !== 'all') {
      list = list.filter(v => v.category.toLowerCase() === params.category!.toLowerCase());
    }

    // 4. Filter by brand
    if (params.brand && params.brand !== 'all') {
      list = list.filter(v => v.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    // 5. Filter by transmission
    if (params.transmission && params.transmission !== 'all') {
      list = list.filter(v => v.transmission === params.transmission);
    }

    // 6. Filter by fuelType
    if (params.fuelType && params.fuelType !== 'all') {
      list = list.filter(v => v.fuelType === params.fuelType);
    }

    // 7. Filter by seats
    if (params.minSeats && params.minSeats > 0) {
      list = list.filter(v => v.seats >= params.minSeats!);
    }

    // 8. Filter by daily price range
    if (params.maxPrice && params.maxPrice > 0) {
      list = list.filter(v => v.dailyRate <= params.maxPrice!);
    }
    if (params.minPrice && params.minPrice > 0) {
      list = list.filter(v => v.dailyRate >= params.minPrice!);
    }

    // 9. If dates are provided, we can either filter out or mark availability
    // For general list, if pickup and return date are set, we sort available vehicles first or filter
    if (params.pickupDate && params.returnDate) {
      // Check each vehicle availability for sorting
      // We don't remove unavailable vehicles entirely unless specifically desired,
      // but let's keep them and let the UI indicate status, or sort available first!
    }

    // 10. Sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          list.sort((a, b) => a.dailyRate - b.dailyRate);
          break;
        case 'price_desc':
          list.sort((a, b) => b.dailyRate - a.dailyRate);
          break;
        case 'year_desc':
          list.sort((a, b) => b.year - a.year);
          break;
        case 'recommended':
        default:
          // Featured first, then lowest rate
          list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.dailyRate - b.dailyRate);
          break;
      }
    }

    return list;
  },

  /**
   * Retrieves featured vehicles for the home page showcase.
   */
  async getFeaturedVehicles(): Promise<Vehicle[]> {
    await delay();
    const all = await getAllVehicles();
    return all.filter(v => v.published === true && v.featured === true);
  },

  /**
   * Retrieves a vehicle by unique slug.
   */
  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    await delay();
    const all = await getAllVehicles();
    const vehicle = all.find(v => v.slug === slug && v.published === true);
    return vehicle || null;
  },

  /**
   * Retrieves a vehicle by ID.
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    await delay();
    const all = await getAllVehicles();
    const vehicle = all.find(v => v.id === id && v.published === true);
    return vehicle || null;
  },

  /**
   * Checks simulated date-based availability for a vehicle.
   * Respects confirmed bookings, active rentals, maintenance blocks, and holds.
   * Pending requests DO NOT block availability.
   */
  async checkVehicleAvailability(vehicleId: string, pickupDate: string, returnDate: string): Promise<VehicleAvailabilityCheck> {
    await delay(30);
    const all = await getAllVehicles();
    const vehicle = all.find(v => v.id === vehicleId && v.published === true);
    if (!vehicle) {
      return { isAvailable: false, reason: 'invalid_dates' };
    }

    // Check baseline operational status
    if (vehicle.operationalStatus === 'in_service') {
      return { isAvailable: false, reason: 'maintenance_block' };
    }
    if (vehicle.operationalStatus === 'compliance_hold' || vehicle.operationalStatus === 'inactive') {
      return { isAvailable: false, reason: 'administrative_hold' };
    }

    const todayStr = getTodayString();
    if (!pickupDate || !returnDate || pickupDate > returnDate || pickupDate < todayStr) {
      return { isAvailable: false, reason: 'invalid_dates' };
    }

    // Check dynamic live bookings in adminBookingService
    try {
      const isAvailableInAdmin = await adminBookingService.checkAvailability(vehicleId, pickupDate, returnDate);
      if (!isAvailableInAdmin) {
        return {
          isAvailable: false,
          reason: 'confirmed_booking',
        };
      }
    } catch {
      // ignore
    }

    // Check overlapping blocks from mock reservations
    const conflict = MOCK_AVAILABILITY_BLOCKS.find(block => 
      block.vehicleId === vehicleId &&
      datesOverlap(pickupDate, returnDate, block.startDate, block.endDate)
    );

    if (conflict) {
      if (conflict.type === 'confirmed_booking') {
        return {
          isAvailable: false,
          reason: 'confirmed_booking',
          conflictingBookingReference: conflict.reference,
        };
      }
      if (conflict.type === 'active_rental') {
        return {
          isAvailable: false,
          reason: 'active_rental',
          conflictingBookingReference: conflict.reference,
        };
      }
      if (conflict.type === 'maintenance') {
        return { isAvailable: false, reason: 'maintenance_block' };
      }
      if (conflict.type === 'hold') {
        return { isAvailable: false, reason: 'administrative_hold' };
      }
    }

    return { isAvailable: true };
  },

  /**
   * Retrieves all booked and reserved date ranges for a vehicle.
   * Pulls from confirmed/active bookings in adminBookingService,
   * mock availability blocks, and current operational maintenance statuses.
   */
  async getBookedDateRanges(vehicleId: string): Promise<VehicleBookedRange[]> {
    await delay(10);
    const ranges: VehicleBookedRange[] = [];

    // 1. Live confirmed / active bookings in adminBookingService
    try {
      const adminBookings = await adminBookingService.getBookings();
      for (const b of adminBookings) {
        if (b.vehicleId === vehicleId && (b.bookingStatus === 'confirmed' || b.bookingStatus === 'active')) {
          ranges.push({
            startDate: b.pickupDate,
            endDate: b.returnDate,
            type: b.bookingStatus === 'active' ? 'active_rental' : 'confirmed_booking',
            label: b.bookingStatus === 'active' ? 'Currently on Rental' : 'Confirmed Reservation',
            reference: b.reference,
          });
        }
      }
    } catch {
      // ignore
    }

    // 2. Mock availability blocks
    for (const block of MOCK_AVAILABILITY_BLOCKS) {
      if (block.vehicleId === vehicleId) {
        // avoid duplicating if reference already in ranges
        const alreadyExists = ranges.some(
          r => (r.reference && block.reference && r.reference === block.reference) ||
               (r.startDate === block.startDate && r.endDate === block.endDate)
        );
        if (!alreadyExists) {
          ranges.push({
            startDate: block.startDate,
            endDate: block.endDate,
            type: block.type as any,
            label: block.type === 'active_rental'
              ? 'Currently on Rental'
              : block.type === 'maintenance'
              ? 'Fleet Maintenance / Service'
              : 'Confirmed Reservation',
            reference: block.reference,
          });
        }
      }
    }

    // 3. Operational status blocks (e.g. if vehicle is in_service)
    try {
      const all = await getAllVehicles();
      const vehicle = all.find(v => v.id === vehicleId);
      if (vehicle?.operationalStatus === 'in_service') {
        const today = getTodayString();
        const nextTwoWeeks = addDays(today, 14);
        ranges.push({
          startDate: today,
          endDate: nextTwoWeeks,
          type: 'maintenance',
          label: 'Scheduled Fleet Maintenance',
        });
      }
    } catch {
      // ignore
    }

    // Sort chronologically by startDate
    return ranges.sort((a, b) => a.startDate.localeCompare(b.startDate));
  },

  /**
   * Retrieves similar vehicles in the same category or price band.
   */
  async getSimilarVehicles(vehicleId: string, category: string, limit = 3): Promise<Vehicle[]> {
    await delay();
    const all = await getAllVehicles();
    return all.filter(v => v.id !== vehicleId && v.published === true && v.category === category).slice(0, limit);
  }
};
