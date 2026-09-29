import React from 'react';
import { Link } from 'react-router-dom';
import type { AdminVehicle, ComplianceRecord, DocumentType, MaintenanceRecord } from '../../types/admin';
import { vehicleManagement } from '../../utils/vehicleManagement';

export function VehicleSetupChecklist({ vehicle, compliance, maintenance, onEdit, onUpload, onService, onAssign, onClose }: {
  vehicle: AdminVehicle;
  compliance: ComplianceRecord[];
  maintenance: MaintenanceRecord[];
  onEdit?: () => void;
  onUpload: (type: DocumentType, record?: ComplianceRecord) => void;
  onService: () => void;
  onAssign: () => void;
  onClose: () => void;
}) {
  const { missingDetails, certifications, lastService } = vehicleManagement(vehicle, compliance, maintenance);
  const buttonClass = 'text-[#35658A] underline text-xs font-semibold';
  return <section aria-label="Vehicle setup checklist" className="rounded-xl border border-[#DCE2E6] bg-[#F8F9FA] p-4 space-y-4">
    <div><h3 className="text-sm font-bold">Complete this car's management record</h3>
      <p className="mt-1 text-[#65727B]">Keep identification, documents and service history together. Assign or rent the car when needed.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><h4 className="font-semibold">1. Vehicle & ownership</h4>
        <p className="my-1">{missingDetails.length ? `Missing: ${missingDetails.join(', ')}` : 'All identification and purchase details recorded.'}</p>
        {onEdit && <button type="button" className={buttonClass} onClick={onEdit}>Edit vehicle details</button>}
      </div>
      <div><h4 className="font-semibold">2. Compliance & insurance broker</h4>
        <p className="my-1">Upload Fitness, Insurance, MVL and Licence below. Insurance includes company, policy, premium and optional broker.</p>
        <p>{certifications.filter(c => c.record && !c.missing.length).length} of 4 certification records have their details and file.</p>
      </div>
      <div><h4 className="font-semibold">3. Maintenance</h4>
        <p className="my-1">{lastService ? `Last service: ${lastService.date} at ${lastService.mileage.toLocaleString()} km.` : 'No service history recorded. Add the last completed service, including historical work.'}</p>
        <p className="mb-1">{vehicle.nextServiceMileage == null ? 'Next service mileage not recorded.' : `Next service: ${vehicle.nextServiceMileage.toLocaleString()} km${vehicle.mileage >= vehicle.nextServiceMileage ? ' — due now' : ''}.`}</p>
        <button type="button" className={buttonClass} onClick={onService}>Record service</button>
      </div>
      <div><h4 className="font-semibold">4. Assignment (when needed)</h4>
        <p className="my-1">Record the custodian, reason, date out, expected return and mileage. Use Assignments to record the return.</p>
        <button type="button" className={buttonClass} onClick={onAssign}>Assign vehicle</button>
        <Link to={`/admin/assignments?q=${encodeURIComponent(vehicle.registrationNumber)}`} onClick={onClose} className={`${buttonClass} ml-3`}>Manage assignments / returns</Link>
      </div>
      <div><h4 className="font-semibold">5. Booking & handover (when rented)</h4>
        <p className="my-1">Booking dates are planned dates. Actual Date Out and Date In are saved at check-out and check-in.</p>
        <Link to={`/admin/bookings?q=${encodeURIComponent(vehicle.registrationNumber)}`} onClick={onClose} className={buttonClass}>Manage bookings / check-out / check-in</Link>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {certifications.map(({ type, documentType, record, missing }) => <div key={type} className="rounded-lg border bg-white p-3 space-y-2">
        <h4 className="font-semibold">{type}</h4>
        <p className={record?.status === 'Expired' || missing.length ? 'text-[#B9534F]' : 'text-[#24313A]'}>{record?.status || 'Not recorded'}</p>
        {record && <p>Expires: {record.expiryDate}</p>}
        {missing.length > 0 && <p className="text-[#B9534F]">Missing: {missing.join(', ')}</p>}
        {record?.documentUrl && <a className={`${buttonClass} block`} href={record.documentUrl} target="_blank" rel="noreferrer">View {type}</a>}
        <button type="button" className={buttonClass} onClick={() => onUpload(documentType, record)}>{record ? 'Renew / complete' : 'Add certificate'}</button>
      </div>)}
    </div>
    <p className="text-[#65727B]">Website: {vehicle.published ? 'Published' : 'Hidden — publish from Edit Vehicle when ready'}. This checklist shows recorded information; review certificate validity before handover.</p>
  </section>;
}
