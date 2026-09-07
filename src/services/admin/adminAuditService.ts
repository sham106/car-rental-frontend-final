import { AuditLog, AdminNotification } from '../../types/admin';
import { INITIAL_ADMIN_AUDIT_LOGS, INITIAL_ADMIN_NOTIFICATIONS } from '../../mocks/adminFleet';

const AUDIT_STORAGE_KEY = 'oceane_admin_audit_logs_v1';
const NOTIF_STORAGE_KEY = 'oceane_admin_notifications_v1';

class AdminAuditService {
  private getStored(): AuditLog[] {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_AUDIT_LOGS));
        return INITIAL_ADMIN_AUDIT_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_AUDIT_LOGS;
    }
  }

  async getLogs(): Promise<AuditLog[]> {
    return this.getStored();
  }

  logAction(entry: Omit<AuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getStored();
    const newEntry: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newEntry);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    window.dispatchEvent(new CustomEvent('oceane_audit_updated'));
  }
}

export const adminAuditService = new AdminAuditService();

class AdminNotificationService {
  private getStored(): AdminNotification[] {
    try {
      const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_NOTIFICATIONS));
        return INITIAL_ADMIN_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_ADMIN_NOTIFICATIONS;
    }
  }

  private save(list: AdminNotification[]): void {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('oceane_notifs_updated'));
  }

  async getNotifications(): Promise<AdminNotification[]> {
    return this.getStored();
  }

  async markAsRead(id: string): Promise<void> {
    const list = this.getStored();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.save(list);
    }
  }

  async markAllAsRead(): Promise<void> {
    const list = this.getStored().map((n) => ({ ...n, read: true }));
    this.save(list);
  }

  addNotification(n: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): void {
    const list = this.getStored();
    const newItem: AdminNotification = {
      ...n,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(newItem);
    this.save(list);
  }
}

export const adminNotificationService = new AdminNotificationService();
