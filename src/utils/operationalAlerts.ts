import type { AdminNotification } from '../types/admin';

export const alertPriority = {
  overdue: { label: 'Overdue', rank: 0, style: 'border-red-200 bg-red-50 text-red-800' },
  due_today: { label: 'Due now', rank: 1, style: 'border-orange-200 bg-orange-50 text-orange-800' },
  upcoming: { label: 'Due soon', rank: 2, style: 'border-amber-200 bg-amber-50 text-amber-900' },
  missing: { label: 'Missing records', rank: 3, style: 'border-slate-300 bg-slate-50 text-slate-700' },
};

export function sortAlerts(alerts: AdminNotification[]) {
  return [...alerts].sort((a, b) => {
    const rank = (alertPriority[a.priority]?.rank ?? 4) - (alertPriority[b.priority]?.rank ?? 4);
    if (rank) return rank;
    return (a.daysRemaining ?? Infinity) - (b.daysRemaining ?? Infinity) ||
      (a.mileageRemaining ?? Infinity) - (b.mileageRemaining ?? Infinity) ||
      a.title.localeCompare(b.title);
  });
}

export function notificationPath(notification: AdminNotification) {
  if (notification.vehicleId && (notification.type === 'service_due' || notification.type === 'service_overdue')) {
    return `/admin/fleet?${new URLSearchParams({ vehicleId: notification.vehicleId, action: 'record-service' })}`;
  }
  const path = notification.linkTo || notification.link || '/admin';
  return path === '/admin' || path.startsWith('/admin/') ? path : '/admin';
}
