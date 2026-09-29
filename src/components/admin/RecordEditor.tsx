import React, { useState } from 'react';
import { create, update } from '../../services/api';

type Field = { key: string; label: string; type?: string; required?: boolean; options?: string[] };
const ownerFields: Field[] = [
  {key:'name',label:'Owner name',required:true}, {key:'ownerType',label:'Owner type',options:['Company','Individual','Partner Company','Internal']},
  {key:'contactPerson',label:'Contact person'}, {key:'phone',label:'Phone'}, {key:'email',label:'Email',type:'email'},
  {key:'address',label:'Address'}, {key:'bankAccount',label:'Bank account'},
  {key:'revenueSplitPercentage',label:'Owner revenue share (%)',type:'number'}, {key:'notes',label:'Notes'},
];
const customerFields: Field[] = [
  {key:'firstName',label:'First name',required:true}, {key:'lastName',label:'Last name',required:true},
  {key:'email',label:'Email',type:'email',required:true}, {key:'phone',label:'Phone',required:true},
  {key:'country',label:'Country'}, {key:'address',label:'Address'}, {key:'nationality',label:'Nationality'},
  {key:'licenceNumber',label:'Driving licence number'}, {key:'licenceExpiryDate',label:'Licence expiry',type:'date'},
  {key:'licenceCountry',label:'Licence country'}, {key:'idOrPassport',label:'ID or passport'}, {key:'notes',label:'Notes'},
];

export function RecordEditor({resource,record,onClose,onSaved,onCreated}:{resource:'owners'|'customers';record?:object;onClose:()=>void;onSaved:()=>Promise<void>;onCreated?:(record:{id:string})=>void}) {
  const initial = (record || {}) as Record<string,unknown>;
  const [values,setValues] = useState<Record<string,unknown>>({...initial, ...(resource==='owners'&&!record?{ownerType:'Company',revenueSplitPercentage:0}:{})});
  const [error,setError]=useState(''); const [saving,setSaving]=useState(false);
  const fields=resource==='owners'?ownerFields:customerFields;
  const title=`${record?'Edit':'Add'} ${resource==='owners'?'owner':'customer'}`;
  async function save(e:React.FormEvent) {
    e.preventDefault();setSaving(true);setError('');
    const payload=Object.fromEntries(fields.filter(f=>values[f.key]!==undefined).map(f=>[f.key,f.type==='number'?Number(values[f.key]):values[f.key]]));
    try {
      if(initial.id) await update(resource,String(initial.id),{...payload,version:initial.version});
      else { const saved = await create<{id:string}>(resource,payload); onCreated?.(saved); }
      await onSaved();onClose();
    } catch(e) {setError(e instanceof Error?e.message:'Unable to save.');}
    finally {setSaving(false);}
  }
  return <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <section role="dialog" aria-modal="true" aria-label={title} className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between mb-5"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} type="button" aria-label="Close editor">✕</button></div>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">{fields.map(f=><label key={f.key} className="text-sm space-y-1"><span>{f.label}</span>
          {f.options?<select className="block w-full border rounded-lg p-2" value={String(values[f.key]||f.options[0])} onChange={e=>setValues({...values,[f.key]:e.target.value})}>{f.options.map(o=><option key={o}>{o}</option>)}</select>
          :<input className="block w-full border rounded-lg p-2" type={f.type||'text'} required={f.required} min={f.type==='number'?0:undefined} max={f.key==='revenueSplitPercentage'?100:undefined} value={String(values[f.key]??'')} onChange={e=>setValues({...values,[f.key]:e.target.value})} />}
        </label>)}</div>
        {error&&<p role="alert" className="text-red-700 text-sm">{error}</p>}
        <button disabled={saving} className="bg-[#17324D] text-white rounded-lg px-5 py-2">{saving?'Saving...':'Save'}</button>
      </form>
    </section>
  </div>;
}
