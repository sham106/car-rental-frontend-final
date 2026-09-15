import { AdminNotification } from '../../types/admin';
import { api, list } from '../api';
export const adminNotificationService = {
 getNotifications: () => list<AdminNotification>('notifications'),
 markAsRead: async (id: string): Promise<void> => { await api('/admin/notifications/read',{id}); },
 markAllAsRead: async (): Promise<void> => { await api('/admin/notifications/read',{all:true}); },
};
