import { AdminVehicle, AdminOperationalStatus } from '../../types/admin';
import { INITIAL_ADMIN_VEHICLES } from '../../mocks/adminFleet';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_vehicles_v1';

class AdminVehicleService {
  private getStored(): AdminVehicle[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_VEHICLES));
        return INITIAL_ADMIN_VEHICLES;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_VEHICLES;
    }
  }

  private save(vehicles: AdminVehicle[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
    window.dispatchEvent(new CustomEvent('oceane_fleet_updated'));
  }

  async getVehicles(): Promise<AdminVehicle[]> {
    return this.getStored();
  }

  async getVehicle(id: string): Promise<AdminVehicle | null> {
    const list = this.getStored();
    return list.find((v) => v.id === id || v.slug === id) || null;
  }

  async createVehicle(data: Omit<AdminVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const id = `veh-${Date.now().toString().slice(-6)}`;
    const newVehicle: AdminVehicle = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vehicles.unshift(newVehicle);
    this.save(vehicles);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Vehicle Created',
      targetType: 'Vehicle',
      targetId: id,
      targetLabel: `${newVehicle.registrationNumber} (${newVehicle.brand} ${newVehicle.model})`,
      details: `Added new vehicle to fleet: ${newVehicle.year} ${newVehicle.brand} ${newVehicle.model}, Daily Rate Rs ${newVehicle.dailyRate}.`,
    });

    return newVehicle;
  }

  async updateVehicle(id: string, updates: Partial<AdminVehicle>): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    const updated = {
      ...vehicles[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    vehicles[idx] = updated;
    this.save(vehicles);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Vehicle Updated',
      targetType: 'Vehicle',
      targetId: id,
      targetLabel: `${updated.registrationNumber} (${updated.brand} ${updated.model})`,
      details: `Updated fleet specifications for ${updated.brand} ${updated.model}.`,
    });

    return updated;
  }

  async changeOperationalStatus(id: string, newStatus: AdminOperationalStatus, reason: string): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    const oldStatus = vehicles[idx].operationalStatus;
    const vehicle = vehicles[idx];

    vehicle.operationalStatus = newStatus;
    vehicle.statusChangeReason = reason;
    vehicle.statusChangedAt = new Date().toISOString();
    vehicle.updatedAt = new Date().toISOString();

    vehicles[idx] = vehicle;
    this.save(vehicles);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: `Status Change: ${oldStatus} → ${newStatus}`,
      targetType: 'Vehicle',
      targetId: id,
      targetLabel: `${vehicle.registrationNumber} (${vehicle.brand} ${vehicle.model})`,
      details: `Operational status transitioned from ${oldStatus} to ${newStatus}.`,
      reason,
    });

    return vehicle;
  }

  async setPublished(id: string, published: boolean, featured?: boolean): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    vehicles[idx].published = published;
    if (featured !== undefined) {
      vehicles[idx].featured = featured;
    }
    vehicles[idx].updatedAt = new Date().toISOString();
    this.save(vehicles);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: published ? 'Vehicle Published to Website' : 'Vehicle Unpublished from Website',
      targetType: 'Vehicle',
      targetId: id,
      targetLabel: `${vehicles[idx].registrationNumber} (${vehicles[idx].brand} ${vehicles[idx].model})`,
      details: published ? 'Listing is now LIVE on public car rental website.' : 'Listing removed from public guest view.',
    });

    return vehicles[idx];
  }

  async setFeatured(id: string, featured: boolean): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    vehicles[idx].featured = featured;
    vehicles[idx].updatedAt = new Date().toISOString();
    this.save(vehicles);
    return vehicles[idx];
  }

  async updateDailyRate(id: string, dailyRate: number): Promise<AdminVehicle> {
    const vehicles = this.getStored();
    const idx = vehicles.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');

    const oldRate = vehicles[idx].dailyRate;
    vehicles[idx].dailyRate = dailyRate;
    vehicles[idx].updatedAt = new Date().toISOString();
    this.save(vehicles);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: 'Daily Rate Adjusted',
      targetType: 'Vehicle',
      targetId: id,
      targetLabel: `${vehicles[idx].registrationNumber}`,
      details: `Rate adjusted from Rs ${oldRate} to Rs ${dailyRate} / day.`,
    });

    return vehicles[idx];
  }

  async bulkPublish(ids: string[], published: boolean): Promise<number> {
    const vehicles = this.getStored();
    let count = 0;
    for (const v of vehicles) {
      if (ids.includes(v.id)) {
        v.published = published;
        v.updatedAt = new Date().toISOString();
        count++;
      }
    }
    this.save(vehicles);
    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: published ? 'Bulk Published Vehicles' : 'Bulk Unpublished Vehicles',
      targetType: 'Vehicle',
      targetId: 'bulk',
      targetLabel: `${count} Vehicles`,
      details: `Changed published status to ${published} for ${count} vehicles.`,
    });
    return count;
  }
}

export const adminVehicleService = new AdminVehicleService();
