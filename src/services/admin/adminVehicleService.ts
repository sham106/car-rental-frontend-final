import { AdminVehicle, AdminOperationalStatus } from '../../types/admin';
import { api, list, create, update } from '../api';
export const adminVehicleService = {
 getVehicles: () => list<AdminVehicle>('vehicles'),
 getVehicle: async (id: string) => (await list<AdminVehicle>('vehicles')).find(v => v.id === id || v.slug === id) || null,
 createVehicle: (data: Omit<AdminVehicle, 'id' | 'createdAt' | 'updatedAt'>) => create<AdminVehicle>('vehicles',data),
 updateVehicle: (id: string, data: Partial<AdminVehicle>) => update<AdminVehicle>('vehicles',id,data),
 changeOperationalStatus: (id: string, operationalStatus: AdminOperationalStatus, statusChangeReason: string) => update<AdminVehicle>('vehicles',id,{operationalStatus,statusChangeReason}),
 setPublished: (id: string, published: boolean, featured?: boolean) => update<AdminVehicle>('vehicles',id,{published,...(featured === undefined ? {} : {featured})}),
 setFeatured: (id: string, featured: boolean) => update<AdminVehicle>('vehicles',id,{featured}),
 updateDailyRate: (id: string, dailyRate: number) => update<AdminVehicle>('vehicles',id,{dailyRate}),
 bulkPublish: async (ids: string[], published: boolean) => (await api<{count:number}>('/admin/vehicles/bulk-publish',{ids,published})).count,
};
