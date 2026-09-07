import { AdminNotification } from '../../types/admin';

const STORAGE_KEY = 'oceane_admin_notifications';

const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    type: 'booking_request',
    title: 'New Online Reservation: Jean-Luc Ramgoolam',
    description: 'Requested Suzuki Jimny (2412 MR 23) for 7 days starting Sep 15.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    read: false,
    link: '/admin',
  },
  {
    id: 'notif-2',
    type: 'insurance_expiring',
    title: 'Compliance Alert: Fitness Expiry Soon',
    description: 'Fitness certificate for Toyota Fortuner (1842 OC 24) expires in 12 days.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
    link: '/admin',
  },
  {
    id: 'notif-3',
    type: 'service_overdue',
    title: 'Service Due: Nissan Magnite (3091 JL 22)',
    description: 'Current mileage 29,400 km is within 600 km of the 30,000 km service mark.',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    read: true,
    link: '/admin',
  },
];

class AdminNotificationService {
  private getStore(): AdminNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    this.saveStore(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  }

  private saveStore(items: AdminNotification[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage error
    }
  }

  async getNotifications(): Promise<AdminNotification[]> {
    return this.getStore();
  }

  async markAsRead(id: string): Promise<void> {
    const list = this.getStore().map((n) => (n.id === id ? { ...n, read: true } : n));
    this.saveStore(list);
  }

  async markAllAsRead(): Promise<void> {
    const list = this.getStore().map((n) => ({ ...n, read: true }));
    this.saveStore(list);
  }

  async clearAll(): Promise<void> {
    this.saveStore([]);
  }

  async addNotification(notif: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): Promise<AdminNotification> {
    const newNotif: AdminNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const list = [newNotif, ...this.getStore()];
    this.saveStore(list);
    window.dispatchEvent(new CustomEvent('oceane_notifs_updated'));
    return newNotif;
  }
}

export const adminNotificationService = new AdminNotificationService();
