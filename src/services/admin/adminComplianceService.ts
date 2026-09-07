import { ComplianceRecord, ComplianceStatus } from '../../types/admin';
import { INITIAL_ADMIN_COMPLIANCE } from '../../mocks/adminFleet';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_compliance_v1';

export function calculateComplianceStatus(expiryDate: string): ComplianceStatus {
  const today = new Date().toISOString().split('T')[0];
  if (expiryDate < today) {
    return 'Expired';
  }
  const expiry = new Date(expiryDate).getTime();
  const now = new Date(today).getTime();
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  if (diffDays <= 30) {
    return 'Expiring Soon';
  }
  return 'Valid';
}

class AdminComplianceService {
  private getStored(): ComplianceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: ComplianceRecord[] = raw ? JSON.parse(raw) : INITIAL_ADMIN_COMPLIANCE;
      // Recalculate status dynamically
      return list.map((item) => ({
        ...item,
        status: calculateComplianceStatus(item.expiryDate),
      }));
    } catch {
      return INITIAL_ADMIN_COMPLIANCE;
    }
  }

  private save(list: ComplianceRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_compliance_updated'));
  }

  async getRecords(): Promise<ComplianceRecord[]> {
    return this.getStored();
  }

  async getRecordsForVehicle(vehicleId: string): Promise<ComplianceRecord[]> {
    const list = this.getStored();
    return list.filter((c) => c.vehicleId === vehicleId);
  }

  async createRecord(data: Omit<ComplianceRecord, 'id' | 'createdAt' | 'status'>): Promise<ComplianceRecord> {
    const list = this.getStored();
    const id = `comp-${Date.now().toString().slice(-6)}`;
    const status = calculateComplianceStatus(data.expiryDate);
    const newRecord: ComplianceRecord = {
      ...data,
      id,
      status,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newRecord);
    this.save(list);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: 'Compliance Document Registered',
      targetType: 'Compliance',
      targetId: id,
      targetLabel: `${data.vehicleReg} (${data.complianceType})`,
      details: `Registered ${data.complianceType} expiring on ${data.expiryDate}. Status: ${status}.`,
    });

    return newRecord;
  }

  async getAlerts(): Promise<{
    expired: ComplianceRecord[];
    next7Days: ComplianceRecord[];
    next30Days: ComplianceRecord[];
    next60Days: ComplianceRecord[];
  }> {
    const list = this.getStored();
    const today = new Date().toISOString().split('T')[0];
    const now = new Date(today).getTime();

    const expired: ComplianceRecord[] = [];
    const next7Days: ComplianceRecord[] = [];
    const next30Days: ComplianceRecord[] = [];
    const next60Days: ComplianceRecord[] = [];

    list.forEach((rec) => {
      const expiry = new Date(rec.expiryDate).getTime();
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        expired.push(rec);
      } else if (diffDays <= 7) {
        next7Days.push(rec);
      } else if (diffDays <= 30) {
        next30Days.push(rec);
      } else if (diffDays <= 60) {
        next60Days.push(rec);
      }
    });

    return { expired, next7Days, next30Days, next60Days };
  }
}

export const adminComplianceService = new AdminComplianceService();
