import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminData } from '../../context/AdminDataContext';
import { vehicleManagement } from '../../utils/vehicleManagement';
import { alertPriority } from '../../utils/operationalAlerts';
import type { ComplianceType } from '../../types/admin';

const columns: ComplianceType[] = ['Licence', 'MVL', 'Insurance', 'Fitness Certificate'];
const inputStyle = 'mt-1 w-full rounded-lg border border-[#DCE2E6] bg-white p-2 text-sm';

export function VehicleOverviewReport() {
  const { vehicles, compliance, maintenance, notifications, isLoading, actionError } = useAdminData();
  const [search, setSearch] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [status, setStatus] = useState('');
  const [attention, setAttention] = useState('');
  const rows = vehicles.map(vehicle => {
    const { certifications } = vehicleManagement(vehicle, compliance, maintenance);
    const certificates = columns.map(type => certifications.find(c => c.type === type)!);
    const alerts = notifications.filter(n => n.vehicleId === vehicle.id && n.requiresAction);
    const serviceAlert = alerts.find(n => n.type === 'service_due');
    const missingSchedule = !vehicle.nextServiceDate && vehicle.nextServiceMileage == null;
    return { vehicle, certificates, alerts, serviceAlert, missingSchedule };
  }).filter(({ vehicle, certificates, alerts, serviceAlert, missingSchedule }) => {
    const query = search.trim().toLowerCase();
    if (query && !`${vehicle.brand} ${vehicle.model} ${vehicle.registrationNumber}`.toLowerCase().includes(query)) return false;
    if (vehicleId && vehicle.id !== vehicleId) return false;
    if (status && vehicle.operationalStatus !== status) return false;
    if (attention === 'expired') return certificates.some(c => c.record?.status === 'Expired');
    if (attention === 'expiring') return certificates.some(c => c.record?.status === 'Expiring Soon');
    if (attention === 'service') return !!serviceAlert;
    if (attention === 'missing') return missingSchedule || certificates.some(c => c.missing.length);
    if (attention === 'any') return alerts.length > 0 || missingSchedule || certificates.some(c => c.missing.length);
    return true;
  }).sort((a, b) => a.vehicle.registrationNumber.localeCompare(b.vehicle.registrationNumber));

  const exportCSV = () => {
    const data = [
      ['Car name', 'Car number', 'Operational status', ...columns.flatMap(type => [`${type} expiry`, `${type} status`, `${type} document`]), 'Next service date', 'Next service mileage (km)', 'Current odometer (km)', 'Service status'],
      ...rows.map(({ vehicle, certificates, serviceAlert, missingSchedule }) => [
        `${vehicle.brand} ${vehicle.model}`, vehicle.registrationNumber, vehicle.operationalStatus,
        ...certificates.flatMap(c => [c.record?.expiryDate || '', c.record?.status || 'Missing record', c.record?.documentUrl ? 'Uploaded' : 'Missing']),
        vehicle.nextServiceDate || '', vehicle.nextServiceMileage ?? '', vehicle.mileage,
        serviceAlert?.title || (missingSchedule ? 'Missing schedule' : 'Scheduled'),
      ]),
    ];
    const csv = data.map(row => row.map(value => {
      const text = String(value);
      const safe = /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vehicle-overview.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <section aria-label="Vehicle overview report" className="p-4 space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-bold">Vehicle overview</h2><p className="text-sm text-[#65727B]">Latest certificates and next service together. Open a vehicle for full details and renewal history.</p></div>
      <button type="button" disabled={isLoading || !rows.length} onClick={exportCSV} className="rounded-lg bg-[#17324D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Export filtered vehicles</button>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label className="text-xs font-semibold">Search car name or number<input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Toyota or 342576" className={inputStyle} /></label>
      <label className="text-xs font-semibold">Specific vehicle<select value={vehicleId} onChange={e => setVehicleId(e.target.value)} className={inputStyle}><option value="">All vehicles</option>{[...vehicles].sort((a,b) => a.registrationNumber.localeCompare(b.registrationNumber)).map(v => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.brand} {v.model}</option>)}</select></label>
      <label className="text-xs font-semibold">Operational status<select value={status} onChange={e => setStatus(e.target.value)} className={inputStyle}><option value="">All statuses</option>{[...new Set(vehicles.map(v => v.operationalStatus))].sort().map(s => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select></label>
      <label className="text-xs font-semibold">Needs attention<select value={attention} onChange={e => setAttention(e.target.value)} className={inputStyle}><option value="">All vehicles</option><option value="any">Any outstanding action</option><option value="expired">Expired compliance</option><option value="expiring">Compliance due soon</option><option value="service">Service due / overdue</option><option value="missing">Missing records / documents / schedule</option></select></label>
    </div>
    <div className="flex justify-between gap-3 text-sm"><p role="status">{rows.length} of {vehicles.length} vehicles</p><button type="button" className="text-[#35658A] underline" onClick={() => { setSearch(''); setVehicleId(''); setStatus(''); setAttention(''); }}>Clear filters</button></div>
    {actionError && <p role="alert" className="text-sm text-red-800">Could not refresh fleet data. Displayed details may be outdated.</p>}
    {isLoading ? <p>Loading vehicle details…</p> : !rows.length ? <p className="py-6 text-center">No vehicles match these filters.</p> : <div className="overflow-x-auto rounded-lg border border-[#DCE2E6]" tabIndex={0} aria-label="Vehicle details table; scroll horizontally to see all columns">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <caption className="sr-only">Vehicle compliance expiry dates and next service schedule</caption>
        <thead className="bg-[#F4F6F7]"><tr>{['Car name', 'Car number', 'Licence', 'MVL', 'Insurance', 'Fitness', 'Next service', 'Details'].map(label => <th scope="col" key={label} className="p-3">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-[#DCE2E6]">{rows.map(({ vehicle, certificates, serviceAlert, missingSchedule }) => <tr key={vehicle.id} className="align-top hover:bg-slate-50">
          <td className="p-3"><span className="font-semibold">{vehicle.brand} {vehicle.model}</span><p className="mt-1 text-xs capitalize text-[#65727B]">{vehicle.operationalStatus.replaceAll('_', ' ')}</p></td>
          <th scope="row" className="p-3"><Link className="text-[#35658A] underline" to={`/admin/fleet?vehicleId=${encodeURIComponent(vehicle.id)}`}>{vehicle.registrationNumber}</Link></th>
          {certificates.map(({ type, record, missing }) => <td key={type} className="p-3 space-y-1">
            <p className="whitespace-nowrap">{record?.expiryDate || 'Not recorded'}</p>
            <p className={`text-xs font-semibold ${record?.status === 'Expired' ? 'text-red-700' : record?.status === 'Expiring Soon' ? 'text-amber-800' : 'text-slate-700'}`}>{record?.status || 'Missing record'}</p>
            {record?.documentUrl && <a href={record.documentUrl} target="_blank" rel="noreferrer" className="inline-block text-xs text-[#35658A] underline" aria-label={`View ${type} document for ${vehicle.registrationNumber}`}>View document</a>}
            {missing.length > 0 && <p className="text-xs text-amber-800">Missing: {missing.join(', ')}</p>}
          </td>)}
          <td className="p-3 min-w-48"><p>{vehicle.nextServiceDate || 'Date not set'}</p><p className="mt-1">{vehicle.nextServiceMileage != null ? `${vehicle.nextServiceMileage.toLocaleString()} km` : 'Mileage not set'}</p><p className="mt-1 text-xs text-[#65727B]">Odometer: {vehicle.mileage.toLocaleString()} km</p><p className={`mt-2 text-xs font-semibold ${serviceAlert ? 'text-red-800' : 'text-slate-700'}`}>{serviceAlert ? `${alertPriority[serviceAlert.priority]?.label || 'Due'}: ${serviceAlert.title}` : missingSchedule ? 'Missing schedule' : 'Scheduled'}</p></td>
          <td className="p-3"><Link className="inline-block rounded-lg border border-[#35658A] px-3 py-2 text-xs font-semibold text-[#35658A]" to={`/admin/fleet?vehicleId=${encodeURIComponent(vehicle.id)}`} aria-label={`View all details for ${vehicle.registrationNumber}`}>View all details</Link></td>
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
}
