import { Vehicle, VehicleFilterParams, VehicleAvailabilityCheck, VehicleBookedRange } from '../types/vehicle';
import { api, ApiError, query } from './api';
async function getOne(key:string):Promise<Vehicle|null> {
 try { return await api<Vehicle>(`/public/vehicles/${encodeURIComponent(key)}`); }
 catch(e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
}
export const vehicleService = {
 getVehicles: (params: VehicleFilterParams = {}) => api<Vehicle[]>(`/public/vehicles?${query(params)}`),
 getFeaturedVehicles: () => api<Vehicle[]>('/public/vehicles?featured=true'),
 getVehicleBySlug: getOne,
 getVehicleById: getOne,
 checkVehicleAvailability: (vehicleId:string,pickupDate:string,returnDate:string) => api<VehicleAvailabilityCheck>(`/public/vehicles/${encodeURIComponent(vehicleId)}/availability?${query({pickupDate,returnDate})}`),
 getBookedDateRanges: (vehicleId:string) => api<VehicleBookedRange[]>(`/public/vehicles/${encodeURIComponent(vehicleId)}/ranges`),
 getSimilarVehicles: async (vehicleId:string,category:string,limit=3) => (await api<Vehicle[]>(`/public/vehicles?${query({category})}`)).filter(v=>v.id!==vehicleId).slice(0,limit),
};
