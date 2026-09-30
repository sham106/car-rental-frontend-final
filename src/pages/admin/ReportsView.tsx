import React, { useState } from 'react';
import { BarChart3, Download, FileText, Calendar, Filter, DollarSign, TrendingUp, Car } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { adminReportService } from '../../services/admin/adminReportService';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { VehicleOverviewReport } from '../../components/admin/VehicleOverviewReport';

export const ReportsView: React.FC = () => {
  const { vehicles, bookings, maintenance, compliance, owners } = useAdminData();
  const [activeReport, setActiveReport] = useState<
    'overview' | 'utilization' | 'revenue' | 'maintenance' | 'owners' | 'compliance'
  >('overview');

  // Computed data
  const totalFleet = vehicles.length;
  const activeRentals = vehicles.filter((v) => v.operationalStatus === 'rented').length;
  const utilizationRate = totalFleet ? Math.round((activeRentals / totalFleet) * 100) : 0;

  const totalRevenue = bookings
    .filter((b) => b.bookingStatus === 'completed')
    .reduce((sum, b) => sum + (b.finalAmount ?? b.estimatedAmount), 0);

  const totalMaintenance = maintenance.reduce((sum, m) => sum + m.totalCost, 0);

  const handleExportCSV = async () => {
    if (activeReport === 'utilization') {
      await adminReportService.exportUtilizationCSV();
    } else if (activeReport === 'revenue') {
      await adminReportService.exportRevenueCSV();
    } else if (activeReport === 'maintenance') {
      await adminReportService.exportMaintenanceCSV();
    } else if (activeReport === 'owners') {
      await adminReportService.exportOwnersCSV();
    } else if (activeReport === 'compliance') {
      await adminReportService.exportComplianceCSV();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Vehicle & Fleet Reports
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Find a car’s compliance and service details, or review fleet operations and finances.
          </p>
        </div>
        {activeReport !== 'overview' && <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>}
      </div>

      {/* KPI Highlights */}
      {activeReport !== 'overview' && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider">
            Current Fleet Utilization
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">{utilizationRate}%</div>
          <div className="mt-1 text-[11px] text-[#4F7D61]">
            {activeRentals} of {totalFleet} vehicles currently earning revenue
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider">
            Completed Rental Revenue
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            Rs {totalRevenue.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">From completed rentals</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider">
            Maintenance & Service Expense
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            Rs {totalMaintenance.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Fleet-wide technical repairs & parts</div>
        </div>
      </div>

      }

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#DCE2E6]">
        <button type="button" onClick={() => setActiveReport('overview')} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium ${activeReport === 'overview' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'}`}>Vehicle overview</button>
        <button
          type="button"
          onClick={() => setActiveReport('utilization')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeReport === 'utilization' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'
          }`}
        >
          Fleet Utilization
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('revenue')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeReport === 'revenue' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'
          }`}
        >
          Revenue by Vehicle
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('maintenance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeReport === 'maintenance' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'
          }`}
        >
          Maintenance Cost Ledger
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('owners')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeReport === 'owners' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'
          }`}
        >
          Partner Payout Statements
        </button>
        <button
          type="button"
          onClick={() => setActiveReport('compliance')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
            activeReport === 'compliance' ? 'bg-[#17324D] text-white font-semibold' : 'text-[#65727B] hover:bg-white'
          }`}
        >
          Legal Compliance Expirations
        </button>
      </div>

      {/* Report Content Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {activeReport === 'overview' && <VehicleOverviewReport />}
        {activeReport === 'utilization' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Registration</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Odometer</th>
                <th className="py-3 px-3">Ownership</th>
                <th className="py-3 px-4 text-right">Daily Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-[#F9FBFC]">
                  <td className="py-3 px-4 font-semibold text-[#24313A]">{v.brand} {v.model}</td>
                  <td className="py-3 px-3 font-mono text-[#24313A]">{v.registrationNumber}</td>
                  <td className="py-3 px-3 capitalize">{v.category}</td>
                  <td className="py-3 px-3 capitalize font-medium">{v.operationalStatus.replace('_', ' ')}</td>
                  <td className="py-3 px-3">{v.mileage.toLocaleString()} km</td>
                  <td className="py-3 px-3">{v.ownerName}</td>
                  <td className="py-3 px-4 text-right font-semibold text-[#24313A]">Rs {v.dailyRate.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'revenue' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Registration</th>
                <th className="py-3 px-3">Total Completed Bookings</th>
                <th className="py-3 px-3">Total Days Rented</th>
                <th className="py-3 px-3">Average Daily Yield</th>
                <th className="py-3 px-4 text-right">Gross Earnings (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {vehicles.map((v) => {
                const vehicleBookings = bookings.filter((b) => b.vehicleId === v.id && (b.bookingStatus === 'completed'));
                const daysRented = vehicleBookings.reduce((sum, b) => sum + b.days, 0);
                const vehicleRevenue = vehicleBookings.reduce((sum, b) => sum + (b.finalAmount ?? b.estimatedAmount), 0);

                return (
                  <tr key={v.id} className="hover:bg-[#F9FBFC]">
                    <td className="py-3 px-4 font-semibold text-[#24313A]">{v.brand} {v.model}</td>
                    <td className="py-3 px-3 font-mono text-[#24313A]">{v.registrationNumber}</td>
                    <td className="py-3 px-3">{vehicleBookings.length}</td>
                    <td className="py-3 px-3">{daysRented} days</td>
                    <td className="py-3 px-3">Rs {daysRented > 0 ? Math.round(vehicleRevenue / daysRented).toLocaleString() : v.dailyRate.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#4F7D61]">Rs {vehicleRevenue.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeReport === 'maintenance' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Service Date</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Service Type</th>
                <th className="py-3 px-3">Garage / Workshop</th>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-4 text-right">Total Cost (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {maintenance.map((m) => (
                <tr key={m.id} className="hover:bg-[#F9FBFC]">
                  <td className="py-3 px-4 font-medium text-[#24313A]">{m.date}</td>
                  <td className="py-3 px-3">{m.vehicleReg} ({m.vehicleName})</td>
                  <td className="py-3 px-3">{m.serviceType}</td>
                  <td className="py-3 px-3">{m.garage}</td>
                  <td className="py-3 px-3 font-mono">{m.invoiceNumber || '—'}</td>
                  <td className="py-3 px-4 text-right font-bold text-[#24313A]">Rs {m.totalCost.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeReport === 'owners' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Vehicles in Fleet</th>
                <th className="py-3 px-3">Split Share</th>
                <th className="py-3 px-3">Total Gross Booked</th>
                <th className="py-3 px-4 text-right">Estimated Payout (Rs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {owners.map((o) => {
                const ownerVehicles = vehicles.filter((v) => v.ownerId === o.id);
                const ownerGross = bookings
                  .filter((b) => ownerVehicles.some((ov) => ov.id === b.vehicleId) && (b.bookingStatus === 'completed'))
                  .reduce((sum, b) => sum + (b.finalAmount ?? b.estimatedAmount), 0);
                const splitRate = o.ownerType === 'Internal' ? 1.0 : (o.revenueSplitPercentage ?? 0) / 100;
                const payout = Math.round(ownerGross * splitRate);

                return (
                  <tr key={o.id} className="hover:bg-[#F9FBFC]">
                    <td className="py-3 px-4 font-semibold text-[#24313A]">{o.name}</td>
                    <td className="py-3 px-3">{o.ownerType}</td>
                    <td className="py-3 px-3">{ownerVehicles.length} vehicles</td>
                    <td className="py-3 px-3 font-semibold">{o.ownerType === 'Internal' ? '100% (Direct)' : `${o.revenueSplitPercentage ?? 0}% Owner`}</td>
                    <td className="py-3 px-3">Rs {ownerGross.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-[#17324D]">Rs {payout.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeReport === 'compliance' && (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Certificate Type</th>
                <th className="py-3 px-3">Provider</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Annual Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {compliance.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FBFC]">
                  <td className="py-3 px-4 font-semibold text-[#24313A]">{c.vehicleReg} ({c.vehicleName})</td>
                  <td className="py-3 px-3">{c.complianceType}</td>
                  <td className="py-3 px-3">{c.provider}</td>
                  <td className="py-3 px-3 font-medium">{c.expiryDate}</td>
                  <td className="py-3 px-3 font-semibold text-[#B9534F]">{c.status}</td>
                  <td className="py-3 px-4 text-right font-mono">Rs {c.premium ? c.premium.toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
