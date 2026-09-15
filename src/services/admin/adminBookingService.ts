import { AdminBooking } from '../../types/admin';
import { api, list, query } from '../api';
export interface CheckOutInput {
  mileageOut: number;
  fuelLevelOut: string;
  conditionNotesOut?: string;
  damageNotesOut?: string;
  checkoutPhotos?: string[];
}

export interface CheckInInput {
  mileageIn: number;
  fuelLevelIn: string;
  conditionNotesIn?: string;
  damageNotesIn?: string;
  checkinPhotos?: string[];
  finalVehicleStatus: 'available' | 'in_service';
  serviceReason?: string;
}

export const adminBookingService = {
 getBookings: () => list<AdminBooking>('bookings'),
 getBooking: async (id: string) => (await list<AdminBooking>('bookings')).find(v=>v.id===id || v.reference===id) || null,
 confirmBooking: (id: string) => api<AdminBooking>(`/admin/bookings/${id}/confirm`,{}),
 rejectBooking: (id: string, reason: string) => api<AdminBooking>(`/admin/bookings/${id}/reject`,{reason}),
 cancelBooking: (id: string, reason: string) => api<AdminBooking>(`/admin/bookings/${id}/cancel`,{reason}),
 checkOutBooking: (id: string, data: CheckOutInput) => api<AdminBooking>(`/admin/bookings/${id}/checkout`,data),
 checkInBooking: (id: string, data: CheckInInput) => api<AdminBooking>(`/admin/bookings/${id}/checkin`,data),
 checkAvailability: async (vehicleId:string,startDate:string,endDate:string,excludeBookingId?:string) => (await api<{isAvailable:boolean}>(`/admin/availability?${query({vehicleId,startDate,endDate,excludeBookingId})}`)).isAvailable,
};
