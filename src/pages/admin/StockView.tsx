import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../services/api';
import { Package, Plus, RefreshCw } from 'lucide-react';

type ItemFields = { name: string; sku: string; category: string; unit: string; supplier: string; location: string; description: string; unitCost: number; lowStockThreshold: number; active: boolean };
type Item = ItemFields & { id: string; version: number; received: number; issued: number; remaining: number; status: string };
type Movement = { id: string; itemId: string; direction: 'in' | 'out'; quantity: number; reason: string; reference: string; actorName: string; createdAt: string; balanceAfter: number };
const blank: ItemFields = { name: '', sku: '', category: '', unit: 'pieces', supplier: '', location: '', description: '', unitCost: 0, lowStockThreshold: 5, active: true };
const fieldClass = 'mt-1 w-full rounded-lg border border-[#DCE2E6] bg-white p-2 text-sm';
const buttonClass = 'rounded-lg bg-[#17324D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50';

export function StockView() {
  const [data, setData] = useState<{ items: Item[]; movements: Movement[] }>({ items: [], movements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ id?: string; version?: number; requestId: string; fields: ItemFields } | null>(null);
  const [movement, setMovement] = useState<{ item: Item; direction: 'in' | 'out'; quantity: string; reason: string; reference: string; requestId: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const formOpen = Boolean(editor || movement);
  useEffect(() => {
    if (formOpen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [formOpen]);

  async function load() {
    setLoading(true); setError('');
    try { setData(await api('/admin/stock')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to load stock.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const active = data.items.filter(i => i.active);
  const visible = data.items.filter(i => (filter === 'archived' ? !i.active : i.active)
    && (filter !== 'low' || i.status !== 'In stock')
    && `${i.name} ${i.sku} ${i.category} ${i.location} ${i.supplier}`.toLowerCase().includes(query.trim().toLowerCase()));

  function edit(item?: Item) {
    setFormError('');
    const fields = item ? Object.fromEntries(Object.keys(blank).map(key => [key, item[key as keyof ItemFields]])) as ItemFields : { ...blank };
    setEditor({ id: item?.id, version: item?.version, requestId: crypto.randomUUID(), fields });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setFormError(''); setNotice('');
    try {
      if (editor) {
        await api(`/admin/stock/items${editor.id ? `/${editor.id}` : ''}`, { ...editor.fields, version: editor.version, requestId: editor.requestId }, editor.id ? 'PATCH' : 'POST');
        setEditor(null); setNotice('Item saved. Record stock received to add quantity.');
      } else if (movement) {
        await api(`/admin/stock/items/${movement.item.id}/movements`, { direction: movement.direction, quantity: Number(movement.quantity), reason: movement.reason, reference: movement.reference, requestId: movement.requestId });
        setMovement(null); setNotice('Stock movement recorded.');
      }
      await load();
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Unable to save.'); }
    finally { setSaving(false); }
  }

  return <div className="space-y-5 pb-16">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-[#24313A]">Stock Management</h1><p className="mt-1 text-sm text-[#65727B]">Track supplies, receipts and withdrawals. Quantities are calculated from the movement history.</p></div>
      <div className="flex gap-2"><button type="button" onClick={() => void load()} disabled={loading || saving} aria-label="Refresh stock" className="rounded-lg border p-2"><RefreshCw size={18} /></button><button type="button" onClick={() => edit()} disabled={loading || !!error} className={buttonClass}><Plus className="mr-1 inline h-4 w-4" />Add item</button></div>
    </div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error} Previously loaded quantities may be outdated. Refresh before making changes.</p>}
    {notice && <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[['Active items', active.length], ['Low stock', active.filter(i => i.status === 'Low stock').length], ['Out of stock', active.filter(i => i.remaining === 0).length], ['Stock value (Rs)', active.reduce((sum, i) => sum + i.remaining * i.unitCost, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })]].map(([label, value]) => <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-[#65727B]">{label}</p><p className="mt-2 text-xl font-bold">{loading ? '…' : error ? '—' : value}</p></div>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row"><input aria-label="Search stock" placeholder="Search name, SKU, category, location or supplier" value={query} onChange={e => setQuery(e.target.value)} className={`${fieldClass} sm:flex-1`} /><select aria-label="Stock status" value={filter} onChange={e => setFilter(e.target.value)} className={`${fieldClass} sm:w-auto`}><option value="all">All active items</option><option value="low">Low / out of stock</option><option value="archived">Archived items</option></select></div>
    {loading && <p role="status">Loading stock…</p>}
    {!loading && !error && visible.length === 0 && <div className="rounded-xl border bg-white p-10 text-center text-sm text-[#65727B]">No items match this view. Add an item to start tracking stock.</div>}
    {visible.map(item => <section key={item.id} className="overflow-hidden rounded-xl border bg-white">
      <button type="button" aria-expanded={expanded === item.id} aria-controls={`stock-${item.id}`} onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left">
        <span className="flex min-w-0 items-center gap-3"><Package className="h-5 w-5 shrink-0 text-[#35658A]" /><span><span className="block break-words font-semibold">{item.name}</span><span className="text-xs text-[#65727B]">{item.sku} · {item.category || 'Uncategorized'}</span></span></span>
        <span className="flex flex-wrap items-center gap-3"><span className="text-sm font-bold">{item.remaining.toLocaleString()} {item.unit} remaining</span><span className={`rounded-full px-3 py-1 text-xs ${!item.active ? 'bg-gray-100' : item.status === 'In stock' ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'}`}>{item.active ? item.status : 'Archived'}</span><span aria-hidden="true">{expanded === item.id ? '−' : '+'}</span></span>
      </button>
      <div id={`stock-${item.id}`} hidden={expanded !== item.id} className="space-y-4 border-t p-4">
        <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">{[['Received', `${item.received} ${item.unit}`], ['Taken out', `${item.issued} ${item.unit}`], ['Low-stock threshold', `${item.lowStockThreshold} ${item.unit}`], ['Unit cost', `Rs ${item.unitCost}`], ['Supplier', item.supplier || '—'], ['Location', item.location || '—']].map(([label, value]) => <div key={label}><dt className="text-xs text-[#65727B]">{label}</dt><dd className="break-words font-medium">{value}</dd></div>)}</dl>
        {item.description && <p className="whitespace-pre-wrap break-words text-sm">{item.description}</p>}
        <div className="flex flex-wrap gap-2"><button type="button" disabled={loading || !!error} className="rounded-lg border px-3 py-2 text-sm" onClick={() => edit(item)}>Edit details</button>{item.active && (['in', 'out'] as const).map(direction => <button type="button" key={direction} className={buttonClass} disabled={loading || !!error || (direction === 'out' && item.remaining === 0)} onClick={() => { setFormError(''); setMovement({ item, direction, quantity: '', reason: '', reference: '', requestId: crypto.randomUUID() }); }}>{direction === 'in' ? 'Stock in' : 'Stock out'}</button>)}</div>
        <h3 className="text-sm font-semibold">Movement history</h3>
        <p className="text-xs text-[#65727B]">History is retained. Correct mistakes with a new opposite movement and explain the reason.</p>
        <div className="max-h-80 overflow-auto"><table className="w-full min-w-[640px] text-left text-xs"><thead><tr>{['Date', 'Movement', 'Quantity', 'Balance after', 'Reason / reference', 'Recorded by'].map(label => <th className="p-2" key={label}>{label}</th>)}</tr></thead><tbody>{data.movements.filter(m => m.itemId === item.id).map(m => <tr key={m.id} className="border-t"><td className="p-2">{new Date(m.createdAt).toLocaleString()}</td><td className="p-2">{m.direction === 'in' ? 'Received' : 'Taken out'}</td><td className="p-2">{m.quantity} {item.unit}</td><td className="p-2">{m.balanceAfter}</td><td className="max-w-xs break-words p-2">{m.reason}{m.reference && <span className="block text-[#65727B]">{m.reference}</span>}</td><td className="p-2">{m.actorName}</td></tr>)}</tbody></table>{!data.movements.some(m => m.itemId === item.id) && <p className="p-3 text-sm text-[#65727B]">No movements yet.</p>}</div>
      </div>
    </section>)}
    {(editor || movement) && <dialog ref={dialog} onCancel={e => { e.preventDefault(); if (!saving) { setEditor(null); setMovement(null); } }} aria-labelledby="stock-form-title" className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl bg-white p-5 backdrop:bg-black/50">
      <h2 id="stock-form-title" className="mb-4 text-lg font-bold">{editor ? editor.id ? 'Edit item' : 'Add stock item' : `${movement?.direction === 'in' ? 'Receive stock' : 'Take stock out'} · ${movement?.item.name}`}</h2>
      <form onSubmit={save}><fieldset disabled={saving} className="space-y-4">
        {editor && <><div className="grid gap-3 sm:grid-cols-2">{([['name', 'Item name'], ['sku', 'SKU / item code'], ['category', 'Category'], ['unit', 'Unit (pieces, litres, etc.)'], ['supplier', 'Supplier'], ['location', 'Storage location']] as const).map(([key, label]) => <label key={key} className="text-xs">{label}<input autoFocus={key === 'name'} required={['name','sku','unit'].includes(key)} maxLength={160} value={editor.fields[key]} onChange={e => setEditor({ ...editor, fields: { ...editor.fields, [key]: e.target.value }, requestId: crypto.randomUUID() })} className={fieldClass} /></label>)}{([['unitCost', 'Unit cost (Rs)'], ['lowStockThreshold', 'Low-stock threshold']] as const).map(([key, label]) => <label key={key} className="text-xs">{label}<input type="number" required min="0" max="1000000000" step={key === 'unitCost' ? '0.01' : '0.001'} value={editor.fields[key]} onChange={e => setEditor({ ...editor, fields: { ...editor.fields, [key]: Number(e.target.value) }, requestId: crypto.randomUUID() })} className={fieldClass} /></label>)}</div><label className="block text-xs">Description / notes<textarea maxLength={4000} value={editor.fields.description} onChange={e => setEditor({ ...editor, fields: { ...editor.fields, description: e.target.value }, requestId: crypto.randomUUID() })} className={fieldClass} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editor.fields.active} onChange={e => setEditor({ ...editor, fields: { ...editor.fields, active: e.target.checked } })} />Active item (uncheck to archive)</label>{!editor.id && <p className="text-xs text-[#65727B]">New items start at zero. Use Stock in to record opening stock.</p>}</>}
        {movement && <><p className="text-sm">Available: {movement.item.remaining} {movement.item.unit}</p><label className="block text-xs">Quantity ({movement.item.unit})<input autoFocus type="number" min="0.001" step="0.001" max={movement.direction === 'out' ? movement.item.remaining : 1000000000} required value={movement.quantity} onChange={e => setMovement({ ...movement, quantity: e.target.value, requestId: crypto.randomUUID() })} className={fieldClass} /></label><label className="block text-xs">Reason / issued to<input required maxLength={160} value={movement.reason} placeholder="Opening stock, delivery, used for service…" onChange={e => setMovement({ ...movement, reason: e.target.value, requestId: crypto.randomUUID() })} className={fieldClass} /></label><label className="block text-xs">Reference (optional)<input maxLength={4000} value={movement.reference} placeholder="Invoice, vehicle registration or job number" onChange={e => setMovement({ ...movement, reference: e.target.value, requestId: crypto.randomUUID() })} className={fieldClass} /></label></>}
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
        <div className="flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => { setEditor(null); setMovement(null); }} className="rounded-lg border px-4 py-2">Cancel</button><button type="submit" disabled={saving} className={buttonClass}>{saving ? 'Saving…' : 'Save'}</button></div>
      </fieldset></form>
    </dialog>}
  </div>;
}
