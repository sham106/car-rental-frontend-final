import React from 'react';
import {
  Car,
  CheckCircle2,
  Clock,
  Key,
  UserCheck,
  Wrench,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { StatusBadge } from '../../components/admin/StatusBadge';

import { AdminVehicle } from '../../types/admin';

interface AdminDashboardProps {
  onNavigate: (tab: string, entityId?: string) => void;
  onOpenAddVehicle?: () => void;
  onSelectVehicleProfile?: (v: AdminVehicle) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onOpenAddVehicle,
  onSelectVehicleProfile,
}) => {
  const {
    vehicles,
    bookings,
    compliance,
    maintenance,
    auditLogs,
    confirmBooking,
  } = useAdminData();

  // Fleet operational breakdowns
  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.operationalStatus === 'available').length;
  const reservedCount = vehicles.filter((v) => v.operationalStatus === 'reserved').length;
  const rentedCount = vehicles.filter((v) => v.operationalStatus === 'rented').length;
  const assignedCount = vehicles.filter((v) => v.operationalStatus === 'assigned').length;
  const inServiceCount = vehicles.filter((v) => v.operationalStatus === 'in_service').length;
  const holdCount = vehicles.filter((v) => v.operationalStatus === 'compliance_hold').length;

  // Productive utilization: rented + assigned
  const productiveCount = rentedCount + assignedCount;
  const utilizationRate = totalVehicles > 0 ? Math.round((productiveCount / totalVehicles) * 100) : 0;

  // Alerts
  const pendingBookings = bookings.filter((b) => b.bookingStatus === 'pending');
  const expiredCompliance = compliance.filter((c) => c.status === 'Expired');
  const expiringCompliance = compliance.filter((c) => c.status === 'Expiring Soon');
  const vehiclesDueService = vehicles.filter((v) => {
    if (!v.nextServiceMileage) return false;
    return v.nextServiceMileage - v.mileage <= 1500;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Fleet Operations Overview
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Real-time status, fleet utilization, and operational priority alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddVehicle}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: High-density Operational Statuses */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Fleet */}
        <div
          onClick={() => onNavigate('fleet')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#35658A] transition-all cursor-pointer shadow-2xs group"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider flex items-center justify-between">
            <span>Total Fleet</span>
            <Car className="w-3.5 h-3.5 text-[#65727B] group-hover:text-[#35658A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{totalVehicles}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">Active inventory</div>
        </div>

        {/* Available */}
        <div
          onClick={() => onNavigate('fleet')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#4F7D61] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#4F7D61] uppercase tracking-wider flex items-center justify-between">
            <span>Available</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4F7D61]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{availableCount}</div>
          <div className="mt-1 text-[11px] text-[#4F7D61] font-medium">Ready for hire</div>
        </div>

        {/* Reserved */}
        <div
          onClick={() => onNavigate('bookings')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#5B7B9A] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#5B7B9A] uppercase tracking-wider flex items-center justify-between">
            <span>Reserved</span>
            <Clock className="w-3.5 h-3.5 text-[#5B7B9A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{reservedCount}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">Upcoming bookings</div>
        </div>

        {/* Rented */}
        <div
          onClick={() => onNavigate('bookings')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#35658A] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#35658A] uppercase tracking-wider flex items-center justify-between">
            <span>Rented</span>
            <Key className="w-3.5 h-3.5 text-[#35658A]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{rentedCount}</div>
          <div className="mt-1 text-[11px] text-[#35658A] font-medium">Active customer trips</div>
        </div>

        {/* Assigned */}
        <div
          onClick={() => onNavigate('assignments')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#77838C] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#77838C] uppercase tracking-wider flex items-center justify-between">
            <span>Assigned</span>
            <UserCheck className="w-3.5 h-3.5 text-[#77838C]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{assignedCount}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">Staff & Company use</div>
        </div>

        {/* In Service */}
        <div
          onClick={() => onNavigate('maintenance')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#B86645] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#B86645] uppercase tracking-wider flex items-center justify-between">
            <span>In Service</span>
            <Wrench className="w-3.5 h-3.5 text-[#B86645]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#24313A]">{inServiceCount}</div>
          <div className="mt-1 text-[11px] text-[#B86645]">In workshop / repairs</div>
        </div>

        {/* Compliance Hold */}
        <div
          onClick={() => onNavigate('compliance')}
          className="p-3.5 rounded-xl border bg-white hover:border-[#B9534F] transition-all cursor-pointer shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-[11px] font-semibold text-[#B9534F] uppercase tracking-wider flex items-center justify-between">
            <span>Hold</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#B9534F]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#B9534F]">{holdCount}</div>
          <div className="mt-1 text-[11px] text-[#B9534F] font-medium">Compliance grounded</div>
        </div>
      </div>

      {/* Utilization Rate Bar Card */}
      <div
        className="p-5 rounded-xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#35658A]" />
            <span className="text-sm font-semibold text-[#24313A]">Fleet Commercial Utilization</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDF4F8] text-[#35658A] font-bold">
              {utilizationRate}%
            </span>
          </div>
          <p className="text-xs text-[#65727B]">
            {productiveCount} of {totalVehicles} vehicles generating commercial revenue or active staff utility.
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-72">
          <div className="h-3 bg-[#F4F6F7] rounded-full overflow-hidden flex border border-[#DCE2E6]">
            <div
              style={{ width: `${(rentedCount / totalVehicles) * 100}%` }}
              className="bg-[#35658A] h-full"
              title={`Rented: ${rentedCount}`}
            />
            <div
              style={{ width: `${(assignedCount / totalVehicles) * 100}%` }}
              className="bg-[#77838C] h-full"
              title={`Assigned: ${assignedCount}`}
            />
            <div
              style={{ width: `${(reservedCount / totalVehicles) * 100}%` }}
              className="bg-[#C8DCF0] h-full"
              title={`Reserved: ${reservedCount}`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-[10px] text-[#65727B]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#35658A]" /> Rented ({rentedCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#77838C]" /> Assigned ({assignedCount})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#CCE0D5]" /> Available ({availableCount})
            </span>
          </div>
        </div>
      </div>

      {/* Critical Operational Action Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Booking Requests Action Box */}
        <div
          className="p-5 rounded-xl border bg-white shadow-2xs flex flex-col justify-between"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E6]">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#35658A]" />
                <h2 className="text-sm font-bold text-[#24313A]">
                  Pending Booking Requests ({pendingBookings.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('bookings')}
                className="text-xs text-[#35658A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                View all bookings <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {pendingBookings.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#65727B]">
                  No pending booking requests. All rentals processed.
                </div>
              ) : (
                pendingBookings.slice(0, 3).map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#24313A]">{b.customerName}</span>
                        <span className="text-[11px] text-[#65727B]">({b.reference})</span>
                      </div>
                      <div className="text-[11px] text-[#65727B] mt-0.5">
                        {b.vehicleName} · {b.pickupDate} ({b.days} days) · Rs {(b.finalAmount || b.estimatedAmount).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => confirmBooking(b.id)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#35658A] hover:bg-[#17324D] rounded-md transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Compliance & Legal Grounding Alerts */}
        <div
          className="p-5 rounded-xl border bg-white shadow-2xs flex flex-col justify-between"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E6]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#B9534F]" />
                <h2 className="text-sm font-bold text-[#24313A]">
                  Compliance & Expirations ({expiredCompliance.length + expiringCompliance.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('compliance')}
                className="text-xs text-[#B9534F] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                Manage compliance <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {expiredCompliance.length === 0 && expiringCompliance.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#4F7D61]">
                  All fleet vehicle fitness, insurance, and road taxes are valid.
                </div>
              ) : (
                <>
                  {expiredCompliance.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-[#F8D7D5] bg-[#FDEDEC] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#B9534F]">{c.vehicleReg}</span>
                        <span className="text-[#24313A] ml-2 font-medium">
                          {c.complianceType} EXPIRED on {c.expiryDate}
                        </span>
                        <div className="text-[11px] text-[#65727B]">Carrier: {c.provider}</div>
                      </div>
                      <StatusBadge status="Expired" type="compliance" size="sm" />
                    </div>
                  ))}

                  {expiringCompliance.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-lg border border-[#F2DDBB] bg-[#FFF9F2] flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#24313A]">{c.vehicleReg}</span>
                        <span className="text-[#B86645] ml-2 font-medium">
                          {c.complianceType} expires on {c.expiryDate}
                        </span>
                        <div className="text-[11px] text-[#65727B]">Provider: {c.provider}</div>
                      </div>
                      <StatusBadge status="Expiring Soon" type="compliance" size="sm" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Maintenance Approaching Schedule & Live Audit History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Approaching */}
        <div
          className="p-5 rounded-xl border bg-white shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E6]">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#B86645]" />
              <h2 className="text-sm font-bold text-[#24313A]">
                Maintenance Proximity Alerts ({vehiclesDueService.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('maintenance')}
              className="text-xs text-[#35658A] hover:underline font-medium cursor-pointer"
            >
              All maintenance
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {vehiclesDueService.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#65727B]">
                No vehicles currently overdue for service.
              </div>
            ) : (
              vehiclesDueService.map((v) => {
                const diff = (v.nextServiceMileage || 0) - v.mileage;
                return (
                  <div
                    key={v.id}
                    className="p-3 rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[#24313A]">{v.registrationNumber}</span>
                      <span className="text-[#65727B] ml-2">
                        {v.brand} {v.model}
                      </span>
                      <div className="text-[11px] text-[#B86645] font-medium mt-0.5">
                        Current: {v.mileage.toLocaleString()} km · Due: {v.nextServiceMileage?.toLocaleString()} km ({diff} km left)
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('maintenance')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#24313A] bg-white border border-[#DCE2E6] hover:bg-[#F4F6F7] rounded-md cursor-pointer"
                    >
                      Log Service
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Operational Audit Feed */}
        <div
          className="p-5 rounded-xl border bg-white shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE2E6]">
            <h2 className="text-sm font-bold text-[#24313A]">Live Operational Audit Trail</h2>
            <span className="text-xs text-[#65727B]">Single source of truth</span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {auditLogs.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg border border-[#E5E9EC] bg-[#FCFDFD] text-xs space-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#24313A]">{log.action}</span>
                  <span className="text-[10px] text-[#95A2AA]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-[11px] text-[#35658A] font-medium">{log.targetLabel}</div>
                <p className="text-[11px] text-[#65727B] leading-tight">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
