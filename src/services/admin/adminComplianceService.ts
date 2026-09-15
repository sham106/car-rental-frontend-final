import { ComplianceRecord } from '../../types/admin';
import { list, create } from '../api';
export const adminComplianceService = {
 getRecords: () => list<ComplianceRecord>('compliance'),
 getRecordsForVehicle: async (vehicleId: string) => (await list<ComplianceRecord>('compliance')).filter(v=>v.vehicleId===vehicleId),
 createRecord: (data: Omit<ComplianceRecord,'id'|'createdAt'|'status'>) => create<ComplianceRecord>('compliance',data),
 getAlerts: async () => {
  const rows = await list<ComplianceRecord>('compliance');
  const days = (v: ComplianceRecord) => Math.ceil((new Date(v.expiryDate).getTime()-Date.now())/86400000);
  return { expired:rows.filter(v=>days(v)<0), next7Days:rows.filter(v=>days(v)>=0&&days(v)<=7), next30Days:rows.filter(v=>days(v)>=0&&days(v)<=30), next60Days:rows.filter(v=>days(v)>=0&&days(v)<=60) };
 },
};
