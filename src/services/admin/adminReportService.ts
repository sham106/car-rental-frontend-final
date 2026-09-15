import { FleetUtilizationStat, VehiclePerformanceItem } from '../../types/admin';
import { api, downloadReport } from '../api';
interface Reports { utilization: FleetUtilizationStat; performance: VehiclePerformanceItem[]; revenueByCategory: {category:string; revenue:number; bookingsCount:number}[]; }
export const adminReportService = {
 getFleetUtilization: async () => (await api<Reports>('/admin/reports')).utilization,
 getRevenueByCategory: async () => (await api<Reports>('/admin/reports')).revenueByCategory,
 getVehiclePerformance: async () => (await api<Reports>('/admin/reports')).performance,
 exportUtilizationCSV: () => downloadReport('utilization'),
 exportRevenueCSV: () => downloadReport('revenue'),
 exportMaintenanceCSV: () => downloadReport('maintenance'),
 exportOwnersCSV: () => downloadReport('owners'),
 exportComplianceCSV: () => downloadReport('compliance'),
};
