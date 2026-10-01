import type { AdminVehicle, MaintenanceRecord } from '../types/admin';
import { BRAND } from '../constants/theme';
import { html } from './html';

export interface ServiceCardJob {
  reference: string;
  status: 'Pending' | 'Completed';
  garage: string;
  dateOut: string;
  expectedReturnDate: string;
  deliveredBy: string;
  contactNumber: string;
  requestedWork: string;
  instructions: string;
  vehicleSnapshot: AdminVehicle;
  lastService?: MaintenanceRecord;
  completion?: Record<string, unknown>;
}

function display(value: unknown, fallback = 'Not recorded'): string {
  return value === undefined || value === null || String(value).trim() === '' ? fallback : String(value);
}

function numeric(value: unknown): number | null {
  if (value === undefined || value === null || value === '' || typeof value === 'boolean') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function mileage(value: unknown): string {
  const number = numeric(value);
  return number === null ? '—' : `${number.toLocaleString('en-GB')} km`;
}

function amount(value: unknown): string {
  const number = numeric(value);
  return number === null ? '—' : number.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return '—';
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/** A self-contained print document. Every interpolated record value is HTML-escaped. */
export function serviceCard(job: ServiceCardJob): string {
  const v = job.vehicleSnapshot;
  const c = job.completion;
  const completed = job.status === 'Completed';
  const parts = numeric(c?.partsCost);
  const labour = numeric(c?.labourCost);
  const total = parts !== null && labour !== null ? parts + labour : null;
  return html`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${job.reference} — ${v.registrationNumber} | ${BRAND.name} service job card</title>
  <style>
    :root{--navy:#16324f;--teal:#2f6f6d;--ink:#24313a;--muted:#63717c;--line:#dce4e8;--pale:#f2f6f7;--accent:#d97745}
    *{box-sizing:border-box}
    body{margin:0;background:#e9eef1;color:var(--ink);font:12px/1.45 Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .toolbar{max-width:850px;margin:22px auto 16px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 24px;color:var(--navy)}
    .toolbar p{margin:0;font-size:12px}.toolbar strong{display:block;font-size:14px;margin-bottom:2px}
    .toolbar button{border:0;border-radius:8px;background:var(--navy);color:white;padding:12px 19px;font:600 13px Arial;cursor:pointer;white-space:nowrap;min-height:44px}
    .toolbar button:hover{background:var(--teal)}.toolbar button:focus-visible{outline:3px solid var(--accent);outline-offset:3px}
    .sheet{max-width:794px;margin:0 auto 30px;padding:35px 38px 25px;background:#fff;box-shadow:0 12px 36px #16324f16;border-top:5px solid var(--teal)}
    .masthead{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:1px solid var(--line);padding-bottom:17px}
    .brand{font-size:30px;line-height:1.05;font-weight:800;letter-spacing:-1.4px;color:var(--navy)}
    .brand-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--accent);margin-left:3px}
    .brand-caption{margin-top:7px;color:var(--teal);font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase}
    .contact{text-align:right;font-size:10px;line-height:1.7;color:var(--muted);overflow-wrap:anywhere}.contact strong{color:var(--navy)}
    .title-row{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin:19px 0 17px}
    .eyebrow{color:var(--teal);font-size:9px;letter-spacing:1.7px;font-weight:700;text-transform:uppercase;margin:0 0 4px}
    h1{font-size:28px;line-height:1.15;letter-spacing:-.8px;color:var(--navy);margin:0 0 5px}
    .subtitle{color:var(--muted);font-size:10px;margin:0;max-width:380px}
    .reference{text-align:right;max-width:42%;min-width:140px;overflow-wrap:anywhere}.reference .label{margin-bottom:4px}
    .ref-number{font-family:Consolas,'Courier New',monospace;font-size:12px;font-weight:700;color:var(--navy)}
    .status{display:inline-block;margin-top:8px;padding:4px 9px;border:1px solid #b9d6d1;border-radius:4px;font-size:9px;letter-spacing:.7px;font-weight:700;text-transform:uppercase;color:var(--teal);background:#f0f7f4}
    .status.pending{border-color:#e6cfa8;color:#895918;background:#fcf6ea}
    .vehicle-banner{display:flex;justify-content:space-between;align-items:center;gap:20px;background:var(--navy);color:white;padding:15px 17px;border-radius:7px}
    .vehicle-banner .label{color:#c6d6e2}.registration{font-size:23px;font-weight:700;letter-spacing:1.4px;line-height:1.25;overflow-wrap:anywhere}
    .vehicle-name{text-align:right;font-size:15px;font-weight:700;overflow-wrap:anywhere}.vehicle-name span{display:block;font-size:10px;font-weight:400;color:#dce6ed;margin-top:3px}
    .label{display:block;color:var(--muted);font-size:8px;line-height:1.3;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 5px}
    .value{font-size:11px;font-weight:600;line-height:1.45;overflow-wrap:anywhere;white-space:pre-wrap}
    .specs{display:grid;grid-template-columns:1fr 1.35fr 1fr;gap:13px 20px;padding:15px 0}
    .service-history{display:grid;grid-template-columns:1fr 1fr;gap:15px;padding:10px 13px;background:var(--pale);border:1px solid var(--line);border-radius:5px;margin-bottom:17px}
    .service-history .value{font-size:10px;font-weight:400}
    .section{margin-top:16px}.section-heading{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding-bottom:7px;margin-bottom:11px;break-after:avoid}
    .step{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:4px;border:1px solid #c9dcdb;background:#edf5f4;color:var(--teal);font-size:9px;font-weight:700;flex-shrink:0}
    h2{margin:0;font-size:11px;line-height:1.3;text-transform:uppercase;letter-spacing:1px;color:var(--navy)}
    .section-hint{margin-left:auto;color:var(--muted);font-size:9px}
    .handover{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:13px 18px;margin-bottom:12px}
    .request{padding:10px 12px;border:1px solid var(--line);border-left:3px solid var(--teal);border-radius:3px;background:#fafcfc;margin-top:8px}
    .text{margin:0;font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}
    .instructions{margin-top:8px}.instructions .label{margin-bottom:3px}
    .work-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:14px}
    .work-box{border:1px solid var(--line);border-radius:5px;padding:10px 12px;min-width:0}
    .ruled{min-height:57px;line-height:19px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 18px,#e5eaed 18px,#e5eaed 19px);overflow-wrap:anywhere;white-space:pre-wrap;margin:0;font-size:11px}
    .completed .ruled{background:none;min-height:38px}
    .completion-grid{display:grid;grid-template-columns:1.45fr 1fr;gap:20px}
    .completion-fields{display:grid;grid-template-columns:1fr 1fr;gap:13px 18px;align-content:start}
    .field-line{min-height:21px;border-bottom:1px solid #aebdc6;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}
    .costs{border:1px solid var(--line);border-radius:5px;overflow:hidden;align-self:start}
    .costs table{width:100%;border-collapse:collapse;font-size:11px;table-layout:fixed}
    .costs caption{text-align:left;padding:8px 11px;background:var(--pale);font-size:8px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--muted)}
    .costs th,.costs td{padding:7px 11px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}.costs th{text-align:left;font-weight:400}.costs td{text-align:right;font-variant-numeric:tabular-nums}
    .costs .total th,.costs .total td{background:#edf5f4;color:var(--teal);font-weight:700;border-bottom:0}
    .notes{margin-top:11px}.notes .ruled{min-height:25px}
    .signatures{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:20px;break-inside:avoid}
    .signature-line{min-height:35px;padding:0 0 6px;border-bottom:1px solid #889da9;font-size:11px;overflow-wrap:anywhere}
    .signature-caption{display:flex;justify-content:space-between;gap:10px;margin-top:5px;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
    footer{display:flex;justify-content:space-between;gap:16px;border-top:1px solid var(--line);margin-top:17px;padding-top:10px;font-size:8px;color:var(--muted)}
    footer strong{color:var(--navy)}.small-block{break-inside:avoid}
    @page{size:A4;margin:12mm}
    @media print{
      body{background:white;font-size:11px}.toolbar{display:none!important}
      .sheet{max-width:none;width:100%;margin:0;padding:0 0 4px;border-top:4px solid var(--teal);box-shadow:none}
      .masthead{padding-top:10px;padding-bottom:10px}.title-row{margin:12px 0}.section{margin-top:10px}
      h1{font-size:25px}.vehicle-banner{padding:12px 15px}.specs{gap:9px 20px;padding:11px 0}
      .service-history{padding:8px 11px;margin-bottom:11px}.label{margin-bottom:4px}
      .section-heading{padding-bottom:6px;margin-bottom:9px}.handover{gap:8px 18px;margin-bottom:9px}
      .request{padding:8px 10px}.work-box{padding:8px 10px}.completion-fields{gap:9px 18px}
      .field-line{min-height:19px}.notes{margin-top:8px}.signatures{margin-top:14px}
      .signature-line{min-height:28px}footer{margin-top:12px;padding-top:8px}
      .vehicle-banner,.service-history,.work-box,.costs,.handover{break-inside:avoid}
      .work-box:has(.ruled:not(:empty)){break-inside:auto}.section-heading{break-after:avoid}
      a{color:inherit;text-decoration:none}
    }
    @media screen and (max-width:600px){
      .toolbar{margin:14px 0;padding:0 14px;align-items:flex-start}.toolbar p{font-size:10px}.toolbar button{padding:12px;font-size:11px}
      .sheet{margin:0 8px 16px;padding:22px 18px;max-width:none}.contact{font-size:9px}.brand{font-size:25px}
      h1{font-size:23px}.title-row{gap:12px}.reference{min-width:105px}.ref-number{font-size:10px}
      .vehicle-banner{padding:13px;gap:12px}.registration{font-size:19px}.vehicle-name{font-size:12px}
      .specs,.handover{grid-template-columns:1fr 1fr;gap:13px}.work-grid,.completion-grid{grid-template-columns:1fr}
      .service-history{grid-template-columns:1fr;gap:10px}.section-hint{display:none}.signatures{gap:18px}
      footer{flex-direction:column;gap:3px}
    }
  </style>
</head>
<body>
  <nav class="toolbar" aria-label="Document actions">
    <p><strong>Service job card</strong>A4 workshop copy · Print or choose “Save as PDF”</p>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </nav>
  <main class="sheet ${completed ? 'completed' : 'pending'}">
    <header class="masthead">
      <div><div class="brand">${BRAND.name}<span class="brand-dot" aria-hidden="true"></span></div><div class="brand-caption">Fleet care · Mauritius</div></div>
      <div class="contact"><strong>${BRAND.legalName}</strong><br>${BRAND.phoneDisplay}<br>${BRAND.email}</div>
    </header>
    <div class="title-row">
      <div><p class="eyebrow">Workshop documentation</p><h1>Vehicle service job card</h1><p class="subtitle">${completed ? 'Completed work, costs and collection record.' : 'Service request, vehicle handover and workshop completion record.'}</p></div>
      <div class="reference"><span class="label">Job reference</span><div class="ref-number">${job.reference}</div><span class="status ${completed ? 'completed' : 'pending'}">${completed ? 'Completed' : 'Pending service'}</span></div>
    </div>

    <section aria-label="Vehicle identification">
      <div class="vehicle-banner"><div><span class="label">Vehicle registration</span><div class="registration">${v.registrationNumber}</div></div><div class="vehicle-name">${v.brand} ${v.model}<span>${v.year} · ${display(v.color, 'Colour not recorded')}</span></div></div>
      <div class="specs">
        <div><span class="label">Registered owner</span><div class="value">${display(v.ownerName)}</div></div>
        <div><span class="label">VIN / chassis number</span><div class="value">${display(v.vin)}</div></div>
        <div><span class="label">Engine number</span><div class="value">${display(v.engineNumber)}</div></div>
        <div><span class="label">Recorded odometer</span><div class="value">${mileage(v.mileage)}</div></div>
        <div><span class="label">Tyre size</span><div class="value">${display(v.tyreSize)}</div></div>
        <div><span class="label">Transmission / fuel</span><div class="value">${display(v.transmission, '—')} / ${display(v.fuelType, '—')}</div></div>
      </div>
      <div class="service-history"><div><span class="label">Last recorded service</span><div class="value">${date(job.lastService?.date)} · ${mileage(job.lastService?.mileage)}</div></div><div><span class="label">Service due at handover</span><div class="value">${date(v.nextServiceDate)} · ${mileage(v.nextServiceMileage)}</div></div></div>
    </section>

    <section class="section" aria-labelledby="handover-heading">
      <div class="section-heading"><span class="step">01</span><h2 id="handover-heading">Handover & service request</h2></div>
      <div class="handover">
        <div><span class="label">Garage / workshop</span><div class="value">${job.garage}</div></div>
        <div><span class="label">Date sent</span><div class="value">${date(job.dateOut)}</div></div>
        <div><span class="label">Expected return</span><div class="value">${date(job.expectedReturnDate)}</div></div>
        <div><span class="label">Delivered by</span><div class="value">${job.deliveredBy}</div></div>
        <div><span class="label">Contact number</span><div class="value">${display(job.contactNumber)}</div></div>
        <div><span class="label">Actual mileage out (km)</span><div class="field-line"></div></div>
      </div>
      <div class="request"><span class="label">Requested work</span><p class="text">${job.requestedWork}</p></div>
      <div class="instructions"><span class="label">Reported problems / special instructions</span><p class="text">${display(job.instructions, 'None recorded.')}</p></div>
    </section>

    <section class="section" aria-labelledby="work-heading">
      <div class="section-heading"><span class="step">02</span><h2 id="work-heading">Workshop record</h2><span class="section-hint">To be completed by the mechanic</span></div>
      <div class="work-grid">
        <div class="work-box"><span class="label">Work completed / findings</span><p class="ruled">${display(c?.description, '')}</p></div>
        <div class="work-box"><span class="label">Parts replaced</span><p class="ruled">${display(c?.partsReplaced, '')}</p></div>
      </div>
    </section>

    <section class="section" aria-labelledby="completion-heading">
      <div class="section-heading"><span class="step">03</span><h2 id="completion-heading">Completion & next service</h2></div>
      <div class="completion-grid">
        <div class="completion-fields">
          <div class="small-block"><span class="label">Completion date</span><div class="field-line">${c?.date ? date(c.date) : ''}</div></div>
          <div class="small-block"><span class="label">Service odometer (km)</span><div class="field-line">${c?.mileage !== undefined ? mileage(c.mileage) : ''}</div></div>
          <div class="small-block"><span class="label">Next service date</span><div class="field-line">${c?.nextServiceDate ? date(c.nextServiceDate) : ''}</div></div>
          <div class="small-block"><span class="label">Next service odometer (km)</span><div class="field-line">${c?.nextServiceMileage !== undefined ? mileage(c.nextServiceMileage) : ''}</div></div>
          <div class="small-block"><span class="label">Invoice number</span><div class="field-line">${display(c?.invoiceNumber, '')}</div></div>
        </div>
        <div class="costs"><table><caption>Service costs · MUR</caption><tbody>
          <tr><th scope="row">Parts</th><td>${amount(parts)}</td></tr>
          <tr><th scope="row">Labour</th><td>${amount(labour)}</td></tr>
          <tr class="total"><th scope="row">Total cost</th><td>${amount(total)}</td></tr>
        </tbody></table></div>
      </div>
      <div class="notes"><span class="label">Recommendations / outstanding issues</span><p class="ruled">${display(c?.notes, '')}</p></div>
    </section>

    <section class="signatures" aria-label="Service and collection sign-off">
      <div><div class="signature-line">${display(c?.mechanic, '')}</div><div class="signature-caption"><span>Mechanic name & signature</span><span>Date: __________</span></div></div>
      <div><div class="signature-line">${display(c?.collectedBy, '')}</div><div class="signature-caption"><span>Collected by & signature</span><span>Date: __________</span></div></div>
    </section>
    <footer><span><strong>${BRAND.name} / Fleet operations</strong> · ${job.reference}</span><span>Return the signed job card and invoice with the vehicle.</span></footer>
  </main>
</body>
</html>`;
}
