import { AvailabilityBlock, BookingRequest } from '../types/booking';

export const MOCK_AVAILABILITY_BLOCKS: AvailabilityBlock[] = [
  // RAV4 Confirmed Booking in mid September 2026
  {
    id: 'block-rav4-01',
    vehicleId: 'veh-rav4-02',
    type: 'confirmed_booking',
    startDate: '2026-09-10',
    endDate: '2026-09-15',
    reference: 'OCR-2026-4412',
    notes: 'Confirmed rental - UK client honeymoon',
  },
  // Corolla Confirmed Booking in late September 2026
  {
    id: 'block-corolla-02',
    vehicleId: 'veh-corolla-01',
    type: 'confirmed_booking',
    startDate: '2026-09-20',
    endDate: '2026-09-25',
    reference: 'OCR-2026-5120',
    notes: 'Airport arrival package',
  },
  // Swift Active Rental ongoing
  {
    id: 'block-swift-03',
    vehicleId: 'veh-swift-03',
    type: 'active_rental',
    startDate: '2026-09-01',
    endDate: '2026-09-04',
    reference: 'OCR-2026-3980',
    notes: 'In use - Grand Baie',
  },
  // Renault Duster Workshop Service block
  {
    id: 'block-duster-04',
    vehicleId: 'veh-duster-11',
    type: 'maintenance',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    notes: 'Scheduled 30,000km full brake service & suspension check',
  },
  // BMW 3 Series confirmed booking early October 2026
  {
    id: 'block-bmw-05',
    vehicleId: 'veh-bmw3-06',
    type: 'confirmed_booking',
    startDate: '2026-10-05',
    endDate: '2026-10-12',
    reference: 'OCR-2026-6288',
    notes: 'Corporate executive booking',
  },
];

export const INITIAL_MOCK_SUBMITTED_BOOKINGS: BookingRequest[] = [
  {
    id: 'req-sample-01',
    reference: 'OCR-2026-7842',
    vehicleId: 'veh-corolla-01',
    vehicle: {
      id: 'veh-corolla-01',
      slug: 'toyota-corolla-automatic',
      brand: 'Toyota',
      model: 'Corolla Prestige',
      year: 2025,
      category: 'sedan',
      dailyRate: 1900,
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 5,
      photo: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
    },
    pickupLocation: {
      id: 'airport-mru',
      name: 'SSR International Airport (MRU)',
      area: 'South / Airport',
      pickupFee: 0,
      dropoffFee: 0,
      address: 'Terminal 1 Arrivals Hall & Dedicated Car Park P2, Plaine Magnien',
    },
    returnLocation: {
      id: 'airport-mru',
      name: 'SSR International Airport (MRU)',
      area: 'South / Airport',
      pickupFee: 0,
      dropoffFee: 0,
      address: 'Terminal 1 Arrivals Hall & Dedicated Car Park P2, Plaine Magnien',
    },
    pickupDate: '2026-09-12',
    returnDate: '2026-09-17',
    pricing: {
      days: 5,
      dailyRate: 1900,
      baseAmount: 9500,
      locationFee: 0,
      vatIncluded: 1239,
      estimatedTotal: 9500,
      currency: 'MUR',
    },
    customer: {
      firstName: 'Sophie',
      lastName: 'Laurent',
      email: 'sophie.laurent@example.fr',
      phone: '+33 6 12 34 56 78',
      country: 'France',
      specialRequest: 'Arriving on Air Mauritius flight MK015 at 10:30am. Child booster seat needed if possible.',
    },
    status: 'pending',
    createdAt: '2026-09-02T08:30:00Z',
  },
];
