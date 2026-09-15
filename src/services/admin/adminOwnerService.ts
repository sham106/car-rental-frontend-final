import { Owner } from '../../types/admin';
import { list, create, update } from '../api';
export const adminOwnerService = {
 getOwners: () => list<Owner>('owners'),
 getOwner: async (id: string) => (await list<Owner>('owners')).find(v=>v.id===id) || null,
 createOwner: (data: Omit<Owner,'id'|'createdAt'|'vehicleCount'>) => create<Owner>('owners',data),
 updateOwner: (id: string, data: Partial<Owner>) => update<Owner>('owners',id,data),
};
