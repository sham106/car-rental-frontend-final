import React, { useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import { useLocations } from '../../hooks/useLocations';
import { api } from '../../services/api';
import { getTodayString, addDays } from '../../utils/dateUtils';

export function NewBookingModal({onClose}:{onClose:()=>void}) {
  const {vehicles,refreshAll}=useAdminData();const locations=useLocations();
  const [form,setForm]=useState({vehicleId:vehicles[0]?.id||'',pickupDate:getTodayString(),returnDate:addDays(getTodayString(),1),pickupLocationId:'airport-mru',returnLocationId:'airport-mru',firstName:'',lastName:'',email:'',phone:'',country:'Mauritius',specialRequest:''});
  const [key]=useState(()=>crypto.randomUUID());const [error,setError]=useState('');const [saving,setSaving]=useState(false);
  const set=(name:string,value:string)=>setForm(f=>({...f,[name]:value}));
  async function submit(e:React.FormEvent) {
    e.preventDefault();setSaving(true);setError('');
    const {vehicleId,pickupDate,returnDate,pickupLocationId,returnLocationId,...customer}=form;
    try {await api('/admin/bookings',{vehicleId,pickupDate,returnDate,pickupLocationId,returnLocationId,customer,idempotencyKey:key});await refreshAll();onClose();}
    catch(e){setError(e instanceof Error?e.message:'Unable to create booking.');}finally{setSaving(false);}
  }
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"><section role="dialog" aria-modal="true" aria-label="New booking" className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
    <div className="flex justify-between mb-4"><h2 className="font-bold text-lg">New booking request</h2><button onClick={onClose} aria-label="Close booking form">✕</button></div>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">Vehicle<select required className="block border rounded-lg p-2 w-full" value={form.vehicleId} onChange={e=>set('vehicleId',e.target.value)}>{vehicles.map(v=><option key={v.id} value={v.id}>{v.registrationNumber} · {v.brand} {v.model}</option>)}</select></label>
      <div className="grid sm:grid-cols-2 gap-3">{(['pickupDate','returnDate'] as const).map(k=><label key={k} className="text-sm">{k==='pickupDate'?'Pickup date':'Return date'}<input required type="date" className="block border rounded-lg p-2 w-full" value={form[k]} onChange={e=>set(k,e.target.value)} /></label>)}
      {(['pickupLocationId','returnLocationId'] as const).map(k=><label key={k} className="text-sm">{k==='pickupLocationId'?'Pickup location':'Return location'}<select className="block border rounded-lg p-2 w-full" value={form[k]} onChange={e=>set(k,e.target.value)}>{locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label>)}
      {(['firstName','lastName','email','phone','country','specialRequest'] as const).map(k=><label key={k} className="text-sm">{{firstName:'First name',lastName:'Last name',email:'Email',phone:'Phone',country:'Country',specialRequest:'Special request'}[k]}<input required={k!=='specialRequest'} type={k==='email'?'email':'text'} className="block border rounded-lg p-2 w-full" value={form[k]} onChange={e=>set(k,e.target.value)} /></label>)}</div>
      <p className="text-xs text-slate-600">Current fleet rates and location fees determine the price. The request remains pending until confirmed.</p>
      {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
      <button disabled={saving||!vehicles.length} className="bg-[#17324D] text-white px-5 py-2 rounded-lg">{saving?'Saving...':'Create request'}</button>
    </form></section></div>;
}
