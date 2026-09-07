import { AdminBooking, AdminBookingStatus } from '../../types/admin';
import { INITIAL_ADMIN_BOOKINGS } from '../../mocks/adminFleet';
import { adminVehicleService } from './adminVehicleService';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_bookings_v1';

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

class AdminBookingService {
  private getStored(): AdminBooking[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_BOOKINGS));
        return INITIAL_ADMIN_BOOKINGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_BOOKINGS;
    }
  }

  private save(list: AdminBooking[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_bookings_updated'));
  }

  async getBookings(): Promise<AdminBooking[]> {
    return this.getStored();
  }

  async getBooking(id: string): Promise<AdminBooking | null> {
    const list = this.getStored();
    return list.find((b) => b.id === id || b.reference === id) || null;
  }

  async createBooking(data: Omit<AdminBooking, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<AdminBooking> {
    const list = this.getStored();
    const id = data.id || `booking-${Date.now()}`;
    const newBooking: AdminBooking = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.unshift(newBooking);
    this.save(list);

    adminAuditService.logAction({
      actorName: 'Website Customer',
      actorRole: 'Online Client',
      action: 'Online Booking Received',
      targetType: 'Booking',
      targetId: id,
      targetLabel: `${newBooking.reference} (${newBooking.customerName})`,
      details: `New online reservation submitted for ${newBooking.vehicleName} (${newBooking.pickupDate} to ${newBooking.returnDate}). Estimated: Rs ${newBooking.estimatedAmount}.`,
    });

    return newBooking;
  }

  async confirmBooking(id: string): Promise<AdminBooking> {
    const list = this.getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = list[idx];
    booking.bookingStatus = 'confirmed';
    booking.updatedAt = new Date().toISOString();
    list[idx] = booking;
    this.save(list);

    // Update vehicle to reserved if it's currently available
    const vehicle = await adminVehicleService.getVehicle(booking.vehicleId);
    if (vehicle && vehicle.operationalStatus === 'available') {
      await adminVehicleService.updateVehicle(booking.vehicleId, {
        operationalStatus: 'reserved',
        currentBookingId: booking.id,
        statusChangeReason: `Reserved for confirmed booking ${booking.reference} (${booking.customerName})`,
        statusChangedAt: new Date().toISOString(),
      });
    }

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Booking Confirmed',
      targetType: 'Booking',
      targetId: booking.id,
      targetLabel: `${booking.reference} (${booking.customerName})`,
      details: `Confirmed reservation for ${booking.vehicleName} (${booking.pickupDate} to ${booking.returnDate}). Total: Rs ${booking.finalAmount}.`,
    });

    return booking;
  }

  async rejectBooking(id: string, reason: string): Promise<AdminBooking> {
    const list = this.getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = list[idx];
    booking.bookingStatus = 'rejected';
    booking.specialRequests = (booking.specialRequests ? booking.specialRequests + ' | ' : '') + `Rejection Reason: ${reason}`;
    booking.updatedAt = new Date().toISOString();
    list[idx] = booking;
    this.save(list);

    // Release vehicle if it was reserved for this booking
    const vehicle = await adminVehicleService.getVehicle(booking.vehicleId);
    if (vehicle && vehicle.currentBookingId === booking.id) {
      await adminVehicleService.updateVehicle(booking.vehicleId, {
        operationalStatus: 'available',
        currentBookingId: undefined,
      });
    }

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Booking Rejected',
      targetType: 'Booking',
      targetId: booking.id,
      targetLabel: `${booking.reference}`,
      details: `Booking request rejected. Reason: ${reason}`,
      reason,
    });

    return booking;
  }

  async cancelBooking(id: string, reason: string): Promise<AdminBooking> {
    const list = this.getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = list[idx];
    booking.bookingStatus = 'cancelled';
    booking.specialRequests = (booking.specialRequests ? booking.specialRequests + ' | ' : '') + `Cancelled: ${reason}`;
    booking.updatedAt = new Date().toISOString();
    list[idx] = booking;
    this.save(list);

    const vehicle = await adminVehicleService.getVehicle(booking.vehicleId);
    if (vehicle && vehicle.currentBookingId === booking.id) {
      await adminVehicleService.updateVehicle(booking.vehicleId, {
        operationalStatus: 'available',
        currentBookingId: undefined,
      });
    }

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Booking Cancelled',
      targetType: 'Booking',
      targetId: booking.id,
      targetLabel: `${booking.reference}`,
      details: `Booking cancelled: ${reason}`,
      reason,
    });

    return booking;
  }

  async checkOutBooking(id: string, checkout: CheckOutInput): Promise<AdminBooking> {
    const list = this.getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = list[idx];
    booking.bookingStatus = 'active';
    booking.mileageOut = checkout.mileageOut;
    booking.fuelLevelOut = checkout.fuelLevelOut;
    booking.conditionNotesOut = checkout.conditionNotesOut;
    booking.damageNotesOut = checkout.damageNotesOut;
    booking.checkoutPhotos = checkout.checkoutPhotos || [];
    booking.checkedOutAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    list[idx] = booking;
    this.save(list);

    // Set Vehicle operational status to 'rented'
    await adminVehicleService.updateVehicle(booking.vehicleId, {
      operationalStatus: 'rented',
      currentBookingId: booking.id,
      mileage: checkout.mileageOut,
      statusChangeReason: `Checked out to ${booking.customerName} on booking ${booking.reference}`,
      statusChangedAt: new Date().toISOString(),
    });

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Vehicle Checked Out (Rental Started)',
      targetType: 'Booking',
      targetId: booking.id,
      targetLabel: `${booking.reference} (${booking.vehicleReg})`,
      details: `Customer ${booking.customerName} departed in ${booking.vehicleName}. Mileage out: ${checkout.mileageOut} km, Fuel: ${checkout.fuelLevelOut}.`,
    });

    return booking;
  }

  async checkInBooking(id: string, checkin: CheckInInput): Promise<AdminBooking> {
    const list = this.getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    const booking = list[idx];
    booking.bookingStatus = 'completed';
    booking.mileageIn = checkin.mileageIn;
    booking.fuelLevelIn = checkin.fuelLevelIn;
    booking.conditionNotesIn = checkin.conditionNotesIn;
    booking.damageNotesIn = checkin.damageNotesIn;
    booking.checkinPhotos = checkin.checkinPhotos || [];
    booking.checkedInAt = new Date().toISOString();
    booking.updatedAt = new Date().toISOString();
    list[idx] = booking;
    this.save(list);

    // Update vehicle to selected status: 'available' or 'in_service'
    await adminVehicleService.updateVehicle(booking.vehicleId, {
      operationalStatus: checkin.finalVehicleStatus,
      currentBookingId: undefined,
      mileage: Math.max(checkin.mileageIn, booking.mileageOut || 0),
      statusChangeReason:
        checkin.finalVehicleStatus === 'in_service'
          ? (checkin.serviceReason || `Damage/Service flagged at check-in for booking ${booking.reference}`)
          : `Returned by ${booking.customerName} in good order. Ready for rental.`,
      statusChangedAt: new Date().toISOString(),
    });

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Vehicle Checked In (Rental Completed)',
      targetType: 'Booking',
      targetId: booking.id,
      targetLabel: `${booking.reference} (${booking.vehicleReg})`,
      details: `Customer ${booking.customerName} returned ${booking.vehicleName}. Mileage in: ${checkin.mileageIn} km, Fuel: ${checkin.fuelLevelIn}. Final Vehicle Status: ${checkin.finalVehicleStatus.toUpperCase()}.`,
    });

    return booking;
  }

  async checkAvailability(vehicleId: string, startDate: string, endDate: string, excludeBookingId?: string): Promise<boolean> {
    const list = this.getStored();
    const conflicts = list.filter((b) => {
      if (b.id === excludeBookingId) return false;
      if (b.vehicleId !== vehicleId) return false;
      if (b.bookingStatus !== 'confirmed' && b.bookingStatus !== 'active') return false;
      // Overlap condition: start <= otherEnd && end >= otherStart
      return startDate <= b.returnDate && endDate >= b.pickupDate;
    });
    return conflicts.length === 0;
  }
}

export const adminBookingService = new AdminBookingService();
