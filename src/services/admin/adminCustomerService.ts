import { Customer } from '../../types/admin';
import { INITIAL_ADMIN_CUSTOMERS } from '../../mocks/adminFleet';
import { adminAuditService } from './adminAuditService';

const STORAGE_KEY = 'oceane_admin_customers_v1';

class AdminCustomerService {
  private getStored(): Customer[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_CUSTOMERS));
        return INITIAL_ADMIN_CUSTOMERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_CUSTOMERS;
    }
  }

  private save(list: Customer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_customers_updated'));
  }

  async getCustomers(): Promise<Customer[]> {
    return this.getStored();
  }

  async getCustomer(id: string): Promise<Customer | null> {
    const list = this.getStored();
    return list.find((c) => c.id === id) || null;
  }

  async createCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'totalRentals'>): Promise<Customer> {
    const list = this.getStored();
    const id = `cust-${Date.now().toString().slice(-6)}`;
    const newCustomer: Customer = {
      ...data,
      id,
      totalRentals: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newCustomer);
    this.save(list);

    adminAuditService.logAction({
      actorName: 'Admin User',
      actorRole: 'Operations Staff',
      action: 'Customer Registered',
      targetType: 'Customer' as any,
      targetId: id,
      targetLabel: `${newCustomer.firstName} ${newCustomer.lastName}`,
      details: `Created customer profile: ${newCustomer.firstName} ${newCustomer.lastName} (${newCustomer.country}), licence ${newCustomer.licenceNumber}.`,
    });

    return newCustomer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    const list = this.getStored();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Customer not found');

    list[idx] = { ...list[idx], ...updates };
    this.save(list);
    return list[idx];
  }
}

export const adminCustomerService = new AdminCustomerService();
