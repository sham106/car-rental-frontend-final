import { Customer } from '../../types/admin';
import { list, create, update } from '../api';
export const adminCustomerService = {
 getCustomers: () => list<Customer>('customers'),
 getCustomer: async (id: string) => (await list<Customer>('customers')).find(v=>v.id===id) || null,
 createCustomer: (data: Omit<Customer,'id'|'createdAt'|'totalRentals'>) => create<Customer>('customers',data),
 updateCustomer: (id: string, data: Partial<Customer>) => update<Customer>('customers',id,data),
};
