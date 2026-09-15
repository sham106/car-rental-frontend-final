import { VehicleCategory } from '../types/vehicle';
import { api } from './api';
export const categoryService = {
 getCategories: () => api<VehicleCategory[]>('/public/categories'),
 getCategoryBySlug: async (slug:string) => (await api<VehicleCategory[]>('/public/categories')).find(c=>c.slug===slug) || null,
};
