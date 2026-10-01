import React, { useEffect, useState } from 'react';
import { api, create, list, uploadFile } from '../../services/api';
import { useAdminData } from '../../context/AdminDataContext';
import type { AdminVehicle, MaintenanceRecord } from '../../types/admin';
import { getTodayString } from '../../utils/dateUtils';
import { serviceCard } from '../../utils/serviceCard';
export { serviceCard } from '../../utils/serviceCard';

interface Job {
  id: string; reference: string; vehicleId: string; vehicleReg: string; vehicleName: string;
  status: 'Pending' | 'Completed'; garage: string; dateOut: string; expectedReturnDate: string;
  deliveredBy: string; contactNumber: string; requestedWork: string; instructions: string;
  vehicleSnapshot: AdminVehicle; lastService?: MaintenanceRecord;
  completion?: Record<string, any>;
}

export function ServiceJobs({ vehicle }: { vehicle?: AdminVehicle }) {
  const { vehicles, refreshAll } = useAdminData();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'new' | Job | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState('Pending');
  const [search, setSearch] = useState('');
  async function reload() { setJobs(await list<Job>('service_jobs')); }
  useEffect(() => { let active = true; list<Job>('service_jobs').then(data => { if (active) setJobs(data); }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [vehicle?.id]);
  function open(job?: Job) {
    setError(''); setFiles([]); setMode(job || 'new');
    setValues(job ? { vehicleId: job.vehicleId, garage: job.garage, date: getTodayString(), mileage: String(vehicles.find(v => v.id === job.vehicleId)?.mileage ?? job.vehicleSnapshot.mileage), serviceType: 'Routine Service', partsCost: '0', labourCost: '0' } : { vehicleId: vehicle?.id || '', dateOut: getTodayString(), expectedReturnDate: getTodayString() });
  }
  function print(job: Job) {
    const popup = window.open('', '_blank');
    if (!popup) { setError('Allow pop-ups to open the printable service card.'); return; }
    popup.opener = null;
    popup.document.write(serviceCard(job)); popup.document.close(); popup.focus();
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (mode === 'new') {
        await create<Job>('service_jobs', values);
        setFilter('Pending');
      } else if (mode) {
        if (files.length > 10) throw new Error('Choose no more than 10 files.');
        if (files.some(file => file.size > 10 * 1024 * 1024)) throw new Error('Each file must be no larger than 10 MB.');
        const attachmentIds: string[] = [];
        for (const file of files) attachmentIds.push((await uploadFile(file, 'document')).id);
        await api(`/admin/service-jobs/${mode.id}/complete`, {
          ...values, mileage: Number(values.mileage), labourCost: Number(values.labourCost), partsCost: Number(values.partsCost),
          ...(values.nextServiceMileage ? { nextServiceMileage: Number(values.nextServiceMileage) } : { nextServiceMileage: null }),
          attachmentIds,
        });
        setFilter('Completed');
      }
      setMode(null); await reload(); await refreshAll();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save service job.'); }
    finally { setBusy(false); }
  }
  const displayed = jobs.filter(j => (!vehicle || j.vehicleId === vehicle.id) && (!filter || j.status === filter) && `${j.reference} ${j.vehicleReg} ${j.vehicleName} ${j.garage} ${j.deliveredBy}`.toLowerCase().includes(search.toLowerCase()));
  const fields = mode === 'new' ? [
    ['garage', 'Garage / workshop', 'text', true], ['dateOut', 'Date sent', 'date', true], ['expectedReturnDate', 'Expected return', 'date', true],
    ['deliveredBy', 'Person taking the car', 'text', true], ['contactNumber', 'Contact number', 'tel', false], ['requestedWork', 'Requested work', 'text', true], ['instructions', 'Reported problems / instructions', 'textarea', false],
  ] : [
    ['garage', 'Garage / workshop', 'text', true], ['date', 'Completion date', 'date', true], ['mileage', 'Actual service mileage (km)', 'number', true],
    ['description', 'Work completed', 'textarea', true], ['partsReplaced', 'Parts replaced', 'textarea', false], ['partsCost', 'Parts cost (MUR)', 'number', true], ['labourCost', 'Labour cost (MUR)', 'number', true],
    ['invoiceNumber', 'Invoice number', 'text', false], ['nextServiceDate', 'Next service date', 'date', false], ['nextServiceMileage', 'Next service mileage (km)', 'number', false],
    ['mechanic', 'Mechanic name', 'text', true], ['collectedBy', 'Person collecting the car', 'text', true], ['notes', 'Recommendations / outstanding issues', 'textarea', false],
  ];
  return <section className="rounded-xl border bg-white p-4 space-y-3" aria-label="Service job cards">
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-bold text-lg">Service job cards</h2><p className="text-sm text-slate-600">Save → print / save as PDF → send with the car → complete from the returned paperwork.</p></div><button type="button" onClick={() => open()} className="rounded-lg bg-[#17324D] px-4 py-2 text-white">New service job</button></div>
    <p className="text-xs text-slate-600">Job cards track paperwork. Use the vehicle’s status controls to place it in service while it is unavailable.</p>
    <div className="flex flex-wrap gap-3"><label className="text-sm">Job status <select value={filter} onChange={e => setFilter(e.target.value)} className="border rounded p-2"><option>Pending</option><option>Completed</option><option value="">All jobs</option></select></label><input aria-label="Search service jobs" placeholder="Search registration, reference or garage" value={search} onChange={e => setSearch(e.target.value)} className="border rounded p-2 text-sm flex-1" /></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {loading ? <p>Loading service jobs…</p> : !displayed.length ? <p className="text-sm text-slate-600">No matching service jobs.</p> : displayed.map(job => <article key={job.id} className="border rounded-lg p-3 space-y-2">
      <h3 className="font-bold">{job.vehicleReg} — {job.vehicleName}</h3><p className="text-sm">{job.reference} · {job.status} · {job.garage}</p><p className="text-sm">Sent: {job.dateOut} · Expected back: {job.expectedReturnDate} · Taken by: {job.deliveredBy}</p><p className="text-sm whitespace-pre-wrap">{job.requestedWork}</p>
      {job.completion && <div className="text-sm"><p>Completed: {job.completion.date} · Mechanic: {job.completion.mechanic} · Collected by: {job.completion.collectedBy}</p><p className="whitespace-pre-wrap">{job.completion.description}</p>{job.completion.attachmentIds?.map((id: string, i: number) => <a key={id} href={`/api/admin/files/${encodeURIComponent(id)}`} target="_blank" rel="noreferrer" className="mr-3 text-blue-800 underline">Paperwork {i + 1}</a>)}</div>}
      <div className="flex gap-3"><button type="button" onClick={() => print(job)} className="border rounded px-3 py-2 text-sm">Print service job card</button>{job.status === 'Pending' && <button type="button" onClick={() => open(job)} className="rounded bg-[#17324D] text-white px-3 py-2 text-sm">Complete service job</button>}</div>
    </article>)}
    {mode && <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-label={mode === 'new' ? 'New service job' : 'Complete service job'} className="bg-white rounded-xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between gap-3"><h2 className="text-lg font-bold">{mode === 'new' ? 'New service job' : `Complete ${mode.reference}`}</h2><button type="button" disabled={busy} onClick={() => setMode(null)} aria-label="Close service job">✕</button></div>
      <form onSubmit={save} className="mt-4 space-y-4"><fieldset disabled={busy} className="grid sm:grid-cols-2 gap-3">
        {mode === 'new' && <label className="text-sm">Vehicle<select required disabled={!!vehicle} value={values.vehicleId} onChange={e => setValues({ ...values, vehicleId: e.target.value })} className="block w-full border rounded p-2"><option value="">Choose vehicle</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.brand} {v.model}</option>)}</select></label>}
        {mode !== 'new' && <label className="text-sm">Service type<select value={values.serviceType} onChange={e => setValues({ ...values, serviceType: e.target.value })} className="block w-full border rounded p-2">{['Routine Service','Oil Change','Tyres','Brakes','Mechanical','Electrical','Body Repair','Inspection','Other'].map(t => <option key={t}>{t}</option>)}</select></label>}
        {fields.map(([key, label, type, required]) => <label key={String(key)} className={`text-sm ${type === 'textarea' ? 'sm:col-span-2' : ''}`}>{label}{required ? ' *' : ''}{type === 'textarea' ? <textarea required={!!required} maxLength={4000} value={values[String(key)] || ''} onChange={e => setValues({ ...values, [String(key)]: e.target.value })} className="block w-full border rounded p-2" /> : <input required={!!required} type={String(type)} min={type === 'number' ? 0 : undefined} step={type === 'number' ? (String(key).includes('Cost') ? '0.01' : '1') : undefined} maxLength={['garage','deliveredBy','requestedWork','mechanic','collectedBy'].includes(String(key)) ? 160 : 4000} value={values[String(key)] ?? ''} onChange={e => setValues({ ...values, [String(key)]: e.target.value })} className="block w-full border rounded p-2" />}</label>)}
        {mode !== 'new' && <label className="sm:col-span-2 text-sm">Signed job card and invoice (PDF or images, up to 10 files, 10 MB each)<input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setFiles(Array.from(e.target.files || []))} className="block mt-1" /><span className="block mt-1 text-xs">If next service mileage is left blank, the configured service interval is used.</span></label>}
      </fieldset>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="bg-[#17324D] text-white rounded px-4 py-2">{busy ? 'Saving…' : mode === 'new' ? 'Save pending job' : 'Complete and record service'}</button></form>
    </section></div>}
  </section>;
}
