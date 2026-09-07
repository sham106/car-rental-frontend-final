import React, { useState } from 'react';
import { Wrench, Plus, Search, AlertCircle, Calendar, DollarSign, Filter } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { RecordMaintenanceModal } from '../../components/admin/RecordMaintenanceModal';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const MaintenanceView: React.FC = () => {
  const { maintenance, vehicles, refreshAll } = useAdminData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all');

  const totalSpend = maintenance.reduce((sum, m) => sum + m.totalCost, 0);

  const overdueVehicles = vehicles.filter((v) => {
    if (!v.nextServiceMileage) return false;
    return v.nextServiceMileage - v.mileage <= 1500;
  });

  const filtered = maintenance.filter((m) => {
    if (selectedServiceType !== 'all' && m.serviceType !== selectedServiceType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.vehicleReg.toLowerCase().includes(q) ||
        m.vehicleName.toLowerCase().includes(q) ||
        m.garage.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Fleet Maintenance & Service Records
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Log garage repairs, scheduled inspections, parts replacement, and expense tracking
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Service</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider">
            Total Maintenance Spend
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            Rs {totalSpend.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">{maintenance.length} services logged to date</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#B86645] uppercase tracking-wider">
            Vehicles Nearing Service
          </div>
          <div className="mt-1 text-2xl font-bold text-[#B86645]">
            {overdueVehicles.length}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Within 1,500 km of service threshold</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#4F7D61] uppercase tracking-wider">
            Active Garages / Suppliers
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            {new Set(maintenance.map((m) => m.garage)).size}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Certified technical partners in Mauritius</div>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className="p-3.5 rounded-xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vehicle reg, garage, parts, invoice #..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedServiceType}
            onChange={(e) => setSelectedServiceType(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
          >
            <option value="all">All Service Types</option>
            <option value="Routine Service">Routine Service</option>
            <option value="Oil Change">Oil Change</option>
            <option value="Brakes">Brakes</option>
            <option value="Tyres">Tyres</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Body Repair">Body Repair</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Service Type</th>
                <th className="py-3 px-3">Date & Odometer</th>
                <th className="py-3 px-3">Garage / Workshop</th>
                <th className="py-3 px-3">Work Summary</th>
                <th className="py-3 px-3">Total Cost</th>
                <th className="py-3 px-3">Next Due</th>
                <th className="py-3 px-4 text-right">Invoice #</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#65727B]">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-[#F9FBFC] transition-colors">
                      {/* Vehicle */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#24313A]">{m.vehicleName}</div>
                        <div className="font-mono text-[10px] text-[#65727B]">{m.vehicleReg}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF4EE] text-[#B86645] border border-[#F4D4C5]">
                          {m.serviceType}
                        </span>
                      </td>

                      {/* Date & Odometer */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#24313A]">{m.date}</div>
                        <div className="text-[10px] text-[#65727B]">{m.mileage.toLocaleString()} km</div>
                      </td>

                      {/* Garage */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#24313A] truncate max-w-[150px]" title={m.garage}>
                          {m.garage}
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-3">
                        <div className="text-[#24313A] max-w-[220px] truncate" title={m.description}>
                          {m.description}
                        </div>
                        {m.partsReplaced && (
                          <div className="text-[10px] text-[#95A2AA] truncate max-w-[200px]" title={m.partsReplaced}>
                            Parts: {m.partsReplaced}
                          </div>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-3 font-semibold text-[#24313A]">
                        Rs {m.totalCost.toLocaleString()}
                      </td>

                      {/* Next Due */}
                      <td className="py-3 px-3">
                        <div className="text-[#24313A]">
                          {m.nextServiceMileage ? `${m.nextServiceMileage.toLocaleString()} km` : 'N/A'}
                        </div>
                        {m.nextServiceDate && (
                          <div className="text-[10px] text-[#95A2AA]">By {m.nextServiceDate}</div>
                        )}
                      </td>

                      {/* Invoice */}
                      <td className="py-3 px-4 text-right font-mono text-[#65727B]">
                        {m.invoiceNumber || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordMaintenanceModal
        vehicle={null}
        vehiclesList={vehicles}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
};
