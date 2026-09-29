import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Bell, Check } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { OperationalAlertCard } from './OperationalActionCenter';
import { notificationPath, sortAlerts } from '../../utils/operationalAlerts';

interface NotificationDrawerProps { onNavigate: (tab: string, entityId?: string) => void; }

export const NotificationDrawer: React.FC<NotificationDrawerProps> = () => {
  const { notifications, actionError, isNotificationDrawerOpen, setIsNotificationDrawerOpen, markNotificationRead, markAllNotificationsRead } = useAdminData();
  const [filter, setFilter] = useState<'actions' | 'unread' | 'all'>('actions');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (isNotificationDrawerOpen) { setFilter('actions'); setError(''); } }, [isNotificationDrawerOpen]);
  if (!isNotificationDrawerOpen) return null;
  const actions = notifications.filter(n => n.requiresAction);
  const unread = notifications.filter(n => !n.read);
  const displayed = sortAlerts(filter === 'actions' ? actions : filter === 'unread' ? unread : notifications);
  const acknowledge = async (id?: string) => {
    setSaving(true); setError('');
    try { if (id) await markNotificationRead(id); else await markAllNotificationsRead(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to mark notifications as seen.'); }
    finally { setSaving(false); }
  };
  return <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs" onKeyDown={e => { if (e.key === 'Escape') setIsNotificationDrawerOpen(false); }}>
    <section role="dialog" aria-modal="true" aria-label="Operational alerts" className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col">
      <div className="p-4 border-b bg-[#F4F6F7] flex items-center justify-between gap-2">
        <div><h2 className="font-bold text-lg flex items-center gap-2"><Bell className="h-5 w-5" />Operational alerts</h2><p className="text-xs text-[#65727B] mt-1">{actions.length} unresolved actions · {unread.length} unseen updates</p></div>
        <button type="button" autoFocus aria-label="Close alerts" onClick={() => setIsNotificationDrawerOpen(false)} className="rounded-lg p-2"><X className="h-5 w-5" /></button>
      </div>
      <div className="p-4 border-b space-y-3">
        <div className="flex gap-2 text-xs">{([['actions', `Action required (${actions.length})`], ['unread', `Unseen (${unread.length})`], ['all', 'All activity']] as const).map(([key,label]) => <button type="button" key={key} aria-pressed={filter === key} onClick={() => setFilter(key)} className={`rounded-lg px-3 py-2 ${filter === key ? 'bg-[#17324D] text-white' : 'bg-[#F4F6F7]'}`}>{label}</button>)}</div>
        <p className="text-xs text-[#65727B]">Alerts stay in Action required until a renewal, service record or return resolves them. Escalations become unseen again.</p>
        {unread.length > 0 && <button type="button" disabled={saving} onClick={() => acknowledge()} className="text-xs text-[#35658A] font-semibold inline-flex gap-1 items-center"><Check className="h-3.5 w-3.5" />Mark all seen</button>}
        {actionError && <p role="status" className="text-sm text-red-700">Alert refresh failed. Displayed information may be outdated.</p>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={e => { if ((e.target as HTMLElement).closest('a')) setIsNotificationDrawerOpen(false); }}>
        {!displayed.length && <p className="py-10 text-center text-sm text-[#65727B]">{actionError ? 'Refresh the fleet data to check for outstanding actions.' : filter === 'actions' ? 'No outstanding actions in the recorded fleet data.' : 'No updates in this view.'}</p>}
        {displayed.map(alert => <div key={alert.id}>
          {alert.requiresAction ? <OperationalAlertCard alert={alert} /> : <article className="rounded-xl border p-4"><h3 className="text-sm font-bold">{alert.title}</h3><p className="mt-1 text-xs text-[#65727B]">{alert.description || alert.message}</p><Link to={notificationPath(alert)} className="mt-3 inline-block text-xs font-semibold text-[#35658A] underline">View details</Link></article>}
          {!alert.read && <button type="button" disabled={saving} onClick={() => acknowledge(alert.id)} className="mt-1 px-2 py-1 text-xs text-[#65727B] underline">Mark seen</button>}
        </div>)}
      </div>
    </section>
  </div>;
};
