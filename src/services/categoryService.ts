import { MOCK_CATEGORIES } from '../mocks/categories';
import { MOCK_VEHICLES } from '../mocks/vehicles';
import { VehicleCategory } from '../types/vehicle';

const delay = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  async getCategories(): Promise<VehicleCategory[]> {
    await delay();
    // Compute dynamic count of published vehicles
    return MOCK_CATEGORIES.map(cat => {
      const publishedCount = MOCK_VEHICLES.filter(
        v => v.published === true && v.category === cat.slug
      ).length;
      return {
        ...cat,
        vehicleCount: publishedCount > 0 ? publishedCount : cat.vehicleCount,
      };
    });
  },

  async getCategoryBySlug(slug: string): Promise<VehicleCategory | null> {
    await delay();
    const cat = MOCK_CATEGORIES.find(c => c.slug.toLowerCase() === slug.toLowerCase());
    return cat || null;
  },
};
