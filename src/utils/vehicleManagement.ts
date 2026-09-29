import type { AdminVehicle, ComplianceRecord, ComplianceType, DocumentType, MaintenanceRecord } from '../types/admin';

export const certificationTypes: { type: ComplianceType; documentType: DocumentType }[] = [
  { type: 'Fitness Certificate', documentType: 'Fitness Certificate' },
  { type: 'Insurance', documentType: 'Insurance Certificate' },
  { type: 'MVL', documentType: 'MVL' },
  { type: 'Licence', documentType: 'Licence' },
];

export function vehicleManagement(vehicle: AdminVehicle, compliance: ComplianceRecord[], maintenance: MaintenanceRecord[]) {
  const missingDetails = [
    ['Brand', vehicle.brand], ['Model', vehicle.model], ['Color', vehicle.color],
    ['Registration number', vehicle.registrationNumber], ['VIN', vehicle.vin],
    ['Engine number', vehicle.engineNumber], ['Owner', vehicle.ownerId],
    ['Purchase date', vehicle.purchaseDate], ['Purchase value', vehicle.purchaseValue],
  ].filter(([, value]) => value == null || value === '').map(([label]) => String(label));
  const certifications = certificationTypes.map(({ type, documentType }) => {
    const record = compliance.filter(c => c.vehicleId === vehicle.id && c.complianceType === type)
      .sort((a, b) => b.expiryDate.localeCompare(a.expiryDate) || b.createdAt.localeCompare(a.createdAt))[0];
    const missing = !record ? ['Certificate and document'] : [
      ...(!record.documentUrl ? ['Document file'] : []),
      ...(type === 'Insurance' && !(record.company || record.provider) ? ['Insurance company'] : []),
      ...(type === 'Insurance' && !record.policyNumber ? ['Policy number'] : []),
      ...(type === 'Insurance' && record.premium == null ? ['Premium'] : []),
    ];
    return { type, documentType, record, missing };
  });
  const lastService = maintenance.filter(m => m.vehicleId === vehicle.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.mileage - a.mileage)[0];
  return { missingDetails, certifications, lastService };
}
