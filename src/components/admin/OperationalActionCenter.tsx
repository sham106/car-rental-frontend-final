import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { alertPriority, notificationPath, sortAlerts } from '../../utils/operationalAlerts';
import type { AdminNotification } from '../../types/admin';

export function OperationalAlertCard({ alert }: { alert: AdminNotification }) {
  const badge = alertPriority[alert.priority] || alertPriority.upcoming;
  return <article className={`rounded-xl border p-4 ${badge.style}`}>
    <div className="flex flex-wrap justify-between gap-2 text-xs">
      <span className="font-bold uppercase tracking-wide">{badge.label}</span>
      {alert.read && <span>Seen · action still required</span>}
    </div>
    <h3 className="mt-2 text-sm font-bold">{alert.title}</h3>
    <p className="mt-1 text-xs leading-relaxed break-words">{alert.description || alert.message}</p>
    <Link to={notificationPath(alert)} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-current px-3 py-2 text-xs font-semibold bg-white/70">
      {alert.actionLabel || 'Review vehicle'} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </article>;
}

export function OperationalActionCenter() {
  const { notifications, isLoading, actionError, refreshAll, setIsNotificationDrawerOpen } = useAdminData();
  const [filter, setFilter] = useState<keyof typeof alertPriority | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const actions = sortAlerts(notifications.filter(n => n.requiresAction));
  const displayed = actions.filter(n => filter === 'all' || n.priority === filter);
  return <section aria-label="Action required" className="rounded-2xl border border-[#DCE2E6] bg-white p-4 sm:p-6 space-y-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-bold flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-700" />Action required ({actions.length})</h2>
        <p className="mt-1 text-xs text-[#65727B]">Live expiry, service and return reminders. Reading an alert does not resolve it.</p>
        <p className="mt-1 text-xs text-[#65727B]">Refreshes every 30 seconds while this app is open. Mileage reminders use the latest recorded odometer.</p></div>
      <button type="button" disabled={refreshing} onClick={async () => { setRefreshing(true); try { await refreshAll(); } finally { setRefreshing(false); } }} className="rounded-lg border px-3 py-2 text-xs font-semibold flex items-center gap-1">
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh alerts
      </button>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {Object.entries(alertPriority).map(([key, value]) => <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(filter === key ? 'all' : key as keyof typeof alertPriority)} className={`rounded-xl border p-3 text-left ${value.style} ${filter === key ? 'ring-2 ring-[#35658A]' : ''}`}>
        <span className="block text-xl font-bold">{actions.filter(n => n.priority === key).length}</span><span className="text-xs font-semibold">{value.label}</span>
      </button>)}
    </div>
    {filter !== 'all' && <button type="button" onClick={() => setFilter('all')} className="text-xs underline">Show all priorities</button>}
    {actionError ? <p role="status" className="text-sm text-red-800">Could not refresh alerts. Previously loaded information may be outdated.</p> : null}
    {isLoading ? <p>Checking fleet records…</p> : displayed.length ? <div className="grid gap-3 md:grid-cols-2">{displayed.slice(0, 6).map(alert => <OperationalAlertCard key={alert.id} alert={alert} />)}</div> : <p className="flex items-center gap-2 text-sm text-[#65727B]"><CheckCircle2 className="h-4 w-4" />{actionError ? 'Outstanding actions cannot be confirmed until refresh succeeds.' : actions.length ? 'No actions at this priority.' : 'No outstanding actions in the recorded fleet data.'}</p>}
    <button type="button" onClick={() => setIsNotificationDrawerOpen(true)} className="text-sm font-semibold text-[#35658A] underline">Open all alerts ({actions.length}) and activity</button>
  </section>;
}
