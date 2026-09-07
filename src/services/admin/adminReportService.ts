import {
  AdminVehicle,
  AdminBooking,
  MaintenanceRecord,
  ComplianceRecord,
  FleetUtilizationStat,
  VehiclePerformanceItem,
} from '../../types/admin';
import { adminVehicleService } from './adminVehicleService';
import { adminBookingService } from './adminBookingService';
import { adminMaintenanceService } from './adminMaintenanceService';
import { adminComplianceService } from './adminComplianceService';

class AdminReportService {
  async getFleetUtilization(): Promise<FleetUtilizationStat> {
    const vehicles = await adminVehicleService.getVehicles();
    const totalVehicles = vehicles.length;
    const activeRentals = vehicles.filter((v) => v.operationalStatus === 'rented').length;
    const assigned = vehicles.filter((v) => v.operationalStatus === 'assigned').length;
    const available = vehicles.filter((v) => v.operationalStatus === 'available').length;
    const inService = vehicles.filter((v) => v.operationalStatus === 'in_service').length;
    const complianceHold = vehicles.filter((v) => v.operationalStatus === 'compliance_hold').length;
    const inactive = vehicles.filter((v) => v.operationalStatus === 'inactive').length;

    // Active fleet in productive operation is rented + assigned
    const productive = activeRentals + assigned;
    const utilizationRate = totalVehicles > 0 ? Math.round((productive / totalVehicles) * 100) : 0;

    return {
      totalVehicles,
      activeRentals,
      assigned,
      available,
      inService,
      complianceHold,
      inactive,
      utilizationRate,
    };
  }

  async getRevenueByCategory(): Promise<{ category: string; revenue: number; bookingsCount: number }[]> {
    const bookings = await adminBookingService.getBookings();
    const vehicles = await adminVehicleService.getVehicles();

    const categoryMap: Record<string, { revenue: number; bookingsCount: number }> = {
      suv: { revenue: 0, bookingsCount: 0 },
      sedan: { revenue: 0, bookingsCount: 0 },
      economy: { revenue: 0, bookingsCount: 0 },
      van: { revenue: 0, bookingsCount: 0 },
      premium: { revenue: 0, bookingsCount: 0 },
      compact: { revenue: 0, bookingsCount: 0 },
    };

    const vehCategoryMap = new Map(vehicles.map((v) => [v.id, v.category]));

    bookings.forEach((b) => {
      if (b.bookingStatus === 'completed' || b.bookingStatus === 'active' || b.bookingStatus === 'confirmed') {
        const cat = vehCategoryMap.get(b.vehicleId) || 'economy';
        if (!categoryMap[cat]) categoryMap[cat] = { revenue: 0, bookingsCount: 0 };
        categoryMap[cat].revenue += b.finalAmount || b.estimatedAmount;
        categoryMap[cat].bookingsCount += 1;
      }
    });

    return Object.entries(categoryMap).map(([category, data]) => ({
      category: category.toUpperCase(),
      revenue: data.revenue,
      bookingsCount: data.bookingsCount,
    }));
  }

  async getVehiclePerformance(): Promise<VehiclePerformanceItem[]> {
    const vehicles = await adminVehicleService.getVehicles();
    const bookings = await adminBookingService.getBookings();
    const maintenance = await adminMaintenanceService.getRecords();
    const compliance = await adminComplianceService.getRecords();

    return vehicles.map((v) => {
      // Calculate revenue from completed or active bookings
      const vehBookings = bookings.filter(
        (b) => b.vehicleId === v.id && (b.bookingStatus === 'completed' || b.bookingStatus === 'active')
      );
      const rentalRevenue = vehBookings.reduce((sum, b) => sum + (b.finalAmount || b.estimatedAmount), 0);
      const daysRented = vehBookings.reduce((sum, b) => sum + b.days, 0);

      // Maintenance cost
      const vehMaint = maintenance.filter((m) => m.vehicleId === v.id);
      const maintenanceCost = vehMaint.reduce((sum, m) => sum + m.totalCost, 0);

      // Insurance cost
      const vehComp = compliance.filter((c) => c.vehicleId === v.id && c.complianceType === 'Insurance');
      const insuranceCost = vehComp.reduce((sum, c) => sum + (c.premium || 0), 0);

      const purchaseValue = v.purchaseValue || 1000000;
      const totalOperatingDays = 180; // approximate 6-month simulation base
      const idleDays = Math.max(0, totalOperatingDays - daysRented);
      const utilizationPercent = Math.min(100, Math.round((daysRented / totalOperatingDays) * 100));
      const netMargin = rentalRevenue - maintenanceCost - (insuranceCost / 2);

      return {
        vehicleId: v.id,
        registrationNumber: v.registrationNumber,
        name: `${v.brand} ${v.model}`,
        purchaseValue,
        rentalRevenue,
        maintenanceCost,
        insuranceCost,
        daysRented,
        idleDays,
        utilizationPercent,
        netMargin,
      };
    });
  }

  private triggerDownload(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async exportUtilizationCSV(): Promise<void> {
    const vehicles = await adminVehicleService.getVehicles();
    const headers = ['Registration', 'Brand', 'Model', 'Category', 'Status', 'Mileage (km)', 'Owner'];
    const rows = vehicles.map((v) => [
      v.registrationNumber,
      v.brand,
      v.model,
      v.category,
      v.operationalStatus,
      v.mileage.toString(),
      `"${v.ownerName.replace(/"/g, '""')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.triggerDownload(csv, `fleet-utilization-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async exportRevenueCSV(): Promise<void> {
    const bookings = await adminBookingService.getBookings();
    const headers = ['Reference', 'Customer', 'Vehicle', 'Pickup Date', 'Return Date', 'Amount (Rs)', 'Status'];
    const rows = bookings.map((b) => [
      b.reference,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.vehicleName.replace(/"/g, '""')}"`,
      b.pickupDate,
      b.returnDate,
      (b.finalAmount || b.estimatedAmount).toString(),
      b.bookingStatus,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.triggerDownload(csv, `revenue-report-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async exportMaintenanceCSV(): Promise<void> {
    const records = await adminMaintenanceService.getRecords();
    const headers = ['Vehicle Reg', 'Date', 'Mileage', 'Service Type', 'Garage', 'Parts Cost', 'Labour Cost', 'Total Cost'];
    const rows = records.map((r) => [
      r.vehicleReg,
      r.date,
      r.mileage.toString(),
      `"${r.serviceType}"`,
      `"${r.garage.replace(/"/g, '""')}"`,
      r.partsCost.toString(),
      r.labourCost.toString(),
      r.totalCost.toString(),
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.triggerDownload(csv, `maintenance-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  async exportComplianceCSV(): Promise<void> {
    const records = await adminComplianceService.getRecords();
    const headers = ['Vehicle Reg', 'Compliance Type', 'Provider / Company', 'Policy Number', 'Expiry Date', 'Status'];
    const rows = records.map((c) => [
      c.vehicleReg,
      `"${c.complianceType}"`,
      `"${(c.company || c.provider || '').replace(/"/g, '""')}"`,
      c.policyNumber || 'N/A',
      c.expiryDate,
      c.status,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    this.triggerDownload(csv, `compliance-audit-${new Date().toISOString().slice(0, 10)}.csv`);
  }
}

export const adminReportService = new AdminReportService();
