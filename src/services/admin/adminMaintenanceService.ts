import { MaintenanceRecord } from '../../types/admin';
import { list, create } from '../api';
export const adminMaintenanceService = {
 getRecords: () => list<MaintenanceRecord>('maintenance'),
 getRecordsForVehicle: async (vehicleId: string) => (await list<MaintenanceRecord>('maintenance')).filter(v=>v.vehicleId===vehicleId),
 createRecord: (data: Omit<MaintenanceRecord,'id'|'createdAt'|'totalCost'>) => create<MaintenanceRecord>('maintenance',data),
};
