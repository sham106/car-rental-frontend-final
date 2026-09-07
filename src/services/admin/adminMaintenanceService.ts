import { MaintenanceRecord } from '../../types/admin';
import { INITIAL_ADMIN_MAINTENANCE } from '../../mocks/adminFleet';
import { adminVehicleService } from './adminVehicleService';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_maintenance_v1';

class AdminMaintenanceService {
  private getStored(): MaintenanceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_MAINTENANCE));
        return INITIAL_ADMIN_MAINTENANCE;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_MAINTENANCE;
    }
  }

  private save(list: MaintenanceRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_maint_updated'));
  }

  async getRecords(): Promise<MaintenanceRecord[]> {
    return this.getStored();
  }

  async getRecordsForVehicle(vehicleId: string): Promise<MaintenanceRecord[]> {
    const list = this.getStored();
    return list.filter((m) => m.vehicleId === vehicleId);
  }

  async createRecord(data: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'totalCost'>): Promise<MaintenanceRecord> {
    const list = this.getStored();
    const id = `maint-${Date.now().toString().slice(-6)}`;
    const totalCost = Number(data.labourCost || 0) + Number(data.partsCost || 0);
    const newRecord: MaintenanceRecord = {
      ...data,
      id,
      totalCost,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.save(list);

    // Update vehicle service data if provided
    if (data.nextServiceMileage || data.nextServiceDate) {
      await adminVehicleService.updateVehicle(data.vehicleId, {
        nextServiceMileage: data.nextServiceMileage,
        nextServiceDate: data.nextServiceDate,
      });
    }

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Maintenance Logged',
      targetType: 'Maintenance',
      targetId: id,
      targetLabel: `${data.vehicleReg} (${data.serviceType})`,
      details: `Service recorded at ${data.garage}. Total cost: Rs ${totalCost.toLocaleString()}. Description: ${data.description}`,
    });

    return newRecord;
  }
}

export const adminMaintenanceService = new AdminMaintenanceService();
