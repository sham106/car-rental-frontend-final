import type { AdminVehicle } from '../types/admin';

export function compareVehiclesByCreatedAt(a: AdminVehicle, b: AdminVehicle): number {
  const aCreatedAt = Date.parse(a.createdAt);
  const bCreatedAt = Date.parse(b.createdAt);
  const aHasCreatedAt = Number.isFinite(aCreatedAt);
  const bHasCreatedAt = Number.isFinite(bCreatedAt);

  if (aHasCreatedAt && bHasCreatedAt && aCreatedAt !== bCreatedAt) {
    return bCreatedAt - aCreatedAt;
  }
  if (aHasCreatedAt !== bHasCreatedAt) {
    return aHasCreatedAt ? -1 : 1;
  }
  return a.registrationNumber.localeCompare(b.registrationNumber);
}
