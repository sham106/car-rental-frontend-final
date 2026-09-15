import { Assignment } from '../../types/admin';
import { api, list, create } from '../api';
export const adminAssignmentService = {
 getAssignments: () => list<Assignment>('assignments'),
 getAssignment: async (id: string) => (await list<Assignment>('assignments')).find(v=>v.id===id) || null,
 createAssignment: (data: Omit<Assignment,'id'|'createdAt'|'status'>) => create<Assignment>('assignments',data),
 endAssignment: (id: string, mileageIn: number, notes?: string) => api<Assignment>(`/admin/assignments/${id}/end`,{mileageIn,notes}),
 cancelAssignment: (id: string, reason: string) => api<Assignment>(`/admin/assignments/${id}/cancel`,{reason}),
};
