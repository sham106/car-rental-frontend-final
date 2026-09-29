import assert from 'node:assert/strict';
import { test } from 'node:test';
import { vehicleManagement } from '../src/utils/vehicleManagement.ts';
import { INITIAL_ADMIN_VEHICLES } from '../src/mocks/adminFleet.ts';
import type { ComplianceRecord, MaintenanceRecord } from '../src/types/admin.ts';

test('vehicle checklist identifies missing details and files, and selects the latest renewal for this car', () => {
  const vehicle = {...INITIAL_ADMIN_VEHICLES[0], color: '', engineNumber: '', purchaseValue: 0};
  const cert = {id:'old',vehicleId:vehicle.id,complianceType:'Insurance',expiryDate:'2025-01-01',createdAt:'2024-01-01',company:'Company',policyNumber:'P1',premium:0,documentUrl:'/api/admin/files/one'} as ComplianceRecord;
  const result = vehicleManagement(vehicle, [cert, {...cert,id:'new',expiryDate:'2027-01-01',documentUrl:''}, {...cert,vehicleId:'other',expiryDate:'2030-01-01'}], []);
  assert.ok(result.missingDetails.includes('Color'));
  assert.ok(result.missingDetails.includes('Engine number'));
  assert.ok(!result.missingDetails.includes('Purchase value'));
  const insurance = result.certifications.find(c=>c.type==='Insurance')!;
  assert.equal(insurance.record?.id,'new');
  assert.deepEqual(insurance.missing,['Document file']);
  assert.equal(result.certifications.filter(c=>!c.record).length,3);
});

test('last service uses completion date and service mileage, not input order or another car', () => {
  const vehicle = INITIAL_ADMIN_VEHICLES[0];
  const service = {vehicleId:vehicle.id,date:'2026-01-01',mileage:100} as MaintenanceRecord;
  const result = vehicleManagement(vehicle, [], [{...service,id:'older'}, {...service,id:'latest',date:'2026-03-01',mileage:200}, {...service,id:'other',vehicleId:'other',date:'2030-01-01'}]);
  assert.equal(result.lastService?.id,'latest');
});
