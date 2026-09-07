import { Owner } from '../../types/admin';
import { INITIAL_ADMIN_OWNERS } from '../../mocks/adminFleet';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_owners_v1';

class AdminOwnerService {
  private getStored(): Owner[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_OWNERS));
        return INITIAL_ADMIN_OWNERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_OWNERS;
    }
  }

  private save(list: Owner[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_owners_updated'));
  }

  async getOwners(): Promise<Owner[]> {
    return this.getStored();
  }

  async getOwner(id: string): Promise<Owner | null> {
    const list = this.getStored();
    return list.find((o) => o.id === id) || null;
  }

  async createOwner(data: Omit<Owner, 'id' | 'createdAt' | 'vehicleCount'>): Promise<Owner> {
    const list = this.getStored();
    const id = `own-${Date.now().toString().slice(-6)}`;
    const newOwner: Owner = {
      ...data,
      id,
      vehicleCount: 0,
      createdAt: new Date().toISOString(),
    };
    list.push(newOwner);
    this.save(list);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Admin',
      action: 'Owner Registered',
      targetType: 'User',
      targetId: id,
      targetLabel: newOwner.name,
      details: `Registered owner ${newOwner.name} (${newOwner.ownerType}).`,
    });

    return newOwner;
  }

  async updateOwner(id: string, updates: Partial<Owner>): Promise<Owner> {
    const list = this.getStored();
    const idx = list.findIndex((o) => o.id === id);
    if (idx === -1) throw new Error('Owner not found');

    list[idx] = { ...list[idx], ...updates };
    this.save(list);
    return list[idx];
  }
}

export const adminOwnerService = new AdminOwnerService();
