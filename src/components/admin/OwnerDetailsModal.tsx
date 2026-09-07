import React, { useState, useMemo } from 'react';
import {
  X,
  Building,
  Phone,
  Mail,
  Car,
  DollarSign,
  Calendar,
  MapPin,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  Wrench,
  Clock,
  ChevronRight,
  UserCheck,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { Owner, AdminVehicle } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from './StatusBadge';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface OwnerDetailsModalProps {
  owner: Owner | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicleForProfile?: (vehicle: AdminVehicle) => void;
}

export const OwnerDetailsModal: React.FC<OwnerDetailsModalProps> = ({
  owner,
  isOpen,
  onClose,
  onSelectVehicleForProfile,
}) => {
  const { vehicles, bookings, assignments, maintenance } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!isOpen || !owner) return null;

  const isInternal = owner.ownerType === 'Internal' || owner.ownerType === 'Company';
  const ownerVehicles = vehicles.filter((v) => v.ownerId === owner.id);

  // Financial and operational metrics
  const totalFleetValue = ownerVehicles.reduce((sum, v) => sum + (v.currentValue || v.purchaseValue || 0), 0);
  const totalDailyRevenuePotential = ownerVehicles.reduce((sum, v) => sum + (v.dailyRate || 0), 0);
  
  const availableCount = ownerVehicles.filter((v) => v.operationalStatus === 'available').length;
  const rentedCount = ownerVehicles.filter((v) => v.operationalStatus === 'rented').length;
  const assignedCount = ownerVehicles.filter((v) => v.operationalStatus === 'assigned').length;
  const inServiceCount = ownerVehicles.filter(
    (v) => v.operationalStatus === 'in_service' || v.operationalStatus === 'compliance_hold'
  ).length;

  // Filtered vehicles within owner portfolio
  const filteredVehicles = ownerVehicles.filter((v) => {
    if (statusFilter !== 'all' && v.operationalStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden text-xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Modal Header */}
        <div className="p-5 border-b bg-[#FAFBFB] flex items-start justify-between gap-4 flex-shrink-0" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#17324D] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#24313A] tracking-tight">{owner.name}</h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    isInternal
                      ? 'bg-[#EEF5F1] text-[#4F7D61] border-[#CCE0D5]'
                      : 'bg-[#F1F6FA] text-[#35658A] border-[#D0E0EC]'
                  }`}
                >
                  {isInternal ? 'Direct Company Asset' : `${owner.ownerType} (Host Partner)`}
                </span>
              </div>
              <p className="text-xs text-[#65727B] mt-0.5">
                {owner.contactPerson ? `Contact Person: ${owner.contactPerson}` : 'Direct Enterprise Entity'} · Registered since{' '}
                {new Date(owner.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#65727B] hover:text-[#24313A] hover:bg-[#F1F4F6] transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Owner Profile & Contact Details Bar */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E5E9EC] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#95A2AA] block">Phone Contact</span>
              <div className="flex items-center gap-1.5 text-[#24313A] font-semibold mt-0.5">
                <Phone className="w-3.5 h-3.5 text-[#65727B]" />
                <span>{owner.phone || 'Not recorded'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#95A2AA] block">Email Address</span>
              <div className="flex items-center gap-1.5 text-[#24313A] font-semibold mt-0.5 truncate" title={owner.email}>
                <Mail className="w-3.5 h-3.5 text-[#65727B] flex-shrink-0" />
                <span className="truncate">{owner.email || 'Not recorded'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#95A2AA] block">Revenue Agreement</span>
              <div className="flex items-center gap-1.5 text-[#17324D] font-bold mt-0.5">
                <DollarSign className="w-3.5 h-3.5 text-[#4F7D61]" />
                <span>
                  {isInternal ? '100% Direct Retention' : `${owner.revenueSplitPercentage || 70}% Host / ${100 - (owner.revenueSplitPercentage || 70)}% Platform`}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#95A2AA] block">Bank Account / Settlement</span>
              <div className="font-mono text-[11px] text-[#24313A] font-medium mt-0.5 truncate" title={owner.bankAccount}>
                {owner.bankAccount ? `MCB: ${owner.bankAccount}` : 'Direct Ledger Account'}
              </div>
            </div>

            {owner.address && (
              <div className="sm:col-span-2 md:col-span-4 pt-2 border-t border-[#E5E9EC] flex items-center gap-2 text-[#65727B]">
                <MapPin className="w-3.5 h-3.5 text-[#95A2AA] flex-shrink-0" />
                <span>{owner.address}</span>
              </div>
            )}
            {owner.notes && (
              <div className="sm:col-span-2 md:col-span-4 text-[11px] text-[#65727B] italic">
                Notes: {owner.notes}
              </div>
            )}
          </div>

          {/* KPI Dashboard Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Owned Fleet</span>
              <div className="text-xl font-bold text-[#17324D] mt-0.5 flex items-baseline gap-1">
                <span>{ownerVehicles.length}</span>
                <span className="text-xs font-normal text-[#65727B]">vehicles</span>
              </div>
              <span className="text-[10px] text-[#4F7D61] font-medium">100% Verified in fleet</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Available</span>
              <div className="text-xl font-bold text-[#4F7D61] mt-0.5 flex items-baseline gap-1">
                <span>{availableCount}</span>
                <span className="text-xs font-normal text-[#65727B]">in depot</span>
              </div>
              <span className="text-[10px] text-[#65727B]">Ready for booking</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Active on Road</span>
              <div className="text-xl font-bold text-[#35658A] mt-0.5 flex items-baseline gap-1">
                <span>{rentedCount + assignedCount}</span>
                <span className="text-xs font-normal text-[#65727B]">active</span>
              </div>
              <span className="text-[10px] text-[#65727B]">{rentedCount} rented, {assignedCount} staff</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Maintenance / Hold</span>
              <div className="text-xl font-bold text-[#D97745] mt-0.5 flex items-baseline gap-1">
                <span>{inServiceCount}</span>
                <span className="text-xs font-normal text-[#65727B]">in service</span>
              </div>
              <span className="text-[10px] text-[#65727B]">Inspection / repairs</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Fleet Valuation</span>
              <div className="text-base font-bold text-[#17324D] mt-1 truncate">
                Rs {totalFleetValue.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#65727B]">Rs {totalDailyRevenuePotential.toLocaleString()}/day potential</span>
            </div>
          </div>

          {/* Exact Vehicles Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#24313A] flex items-center gap-2">
                  <Car className="w-4 h-4 text-[#17324D]" />
                  <span>Exact Vehicles Owned ({ownerVehicles.length})</span>
                </h3>
                <p className="text-[11px] text-[#65727B] mt-0.5">
                  Detailed breakdown of every motor asset registered under this ownership contract
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#95A2AA] absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brand, model, plate..."
                    className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A] w-44 sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] text-[#24313A] focus:bg-white cursor-pointer"
                >
                  <option value="all">All Statuses ({ownerVehicles.length})</option>
                  <option value="available">Available ({availableCount})</option>
                  <option value="rented">Rented ({rentedCount})</option>
                  <option value="assigned">Assigned ({assignedCount})</option>
                  <option value="in_service">In Service</option>
                  <option value="compliance_hold">Compliance Hold</option>
                </select>
              </div>
            </div>

            {/* Vehicle List */}
            {filteredVehicles.length === 0 ? (
              <div className="p-10 rounded-xl border border-dashed border-[#DCE2E6] text-center bg-[#FAFBFB] space-y-2">
                <Car className="w-8 h-8 text-[#95A2AA] mx-auto" />
                <h4 className="font-semibold text-sm text-[#24313A]">No vehicles found</h4>
                <p className="text-xs text-[#65727B] max-w-sm mx-auto">
                  {ownerVehicles.length === 0
                    ? 'No vehicles are currently registered under this owner.'
                    : 'No vehicles match your current search or filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredVehicles.map((vehicle) => {
                  // Find active context
                  const activeBooking = bookings.find(
                    (b) => b.vehicleId === vehicle.id && b.bookingStatus === 'active'
                  );
                  const activeAssignment = assignments.find(
                    (a) => a.vehicleId === vehicle.id && a.status === 'Active'
                  );
                  const activeMaintenance = maintenance.find(
                    (m) => m.vehicleId === vehicle.id
                  );

                  const photoUrl =
                    vehicle.photos?.[0] ||
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

                  return (
                    <div
                      key={vehicle.id}
                      className="p-3.5 rounded-xl border bg-white shadow-2xs hover:border-[#17324D] hover:shadow-xs transition-all flex flex-col justify-between group"
                      style={{ borderColor: ADMIN_THEME.border }}
                    >
                      <div>
                        {/* Top Row: Thumbnail + Specs + Status */}
                        <div className="flex items-start gap-3">
                          <img
                            src={photoUrl}
                            alt={`${vehicle.brand} ${vehicle.model}`}
                            className="w-20 h-16 object-cover rounded-lg border border-[#E5E9EC] flex-shrink-0 bg-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-[#24313A] truncate">
                                {vehicle.brand} {vehicle.model}
                              </h4>
                              <StatusBadge status={vehicle.operationalStatus} />
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F4F6] text-[#17324D] border border-[#DCE2E6]">
                                {vehicle.registrationNumber}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 capitalize font-medium">
                                {vehicle.category}
                              </span>
                              <span className="text-[10px] text-[#65727B]">
                                {vehicle.year} · {vehicle.transmission}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#65727B]">
                              <span>
                                Odometer:{' '}
                                <strong className="text-[#24313A]">
                                  {vehicle.mileage ? vehicle.mileage.toLocaleString() : '0'} km
                                </strong>
                              </span>
                              <span>·</span>
                              <span>
                                Rate:{' '}
                                <strong className="text-[#17324D]">
                                  Rs {vehicle.dailyRate ? vehicle.dailyRate.toLocaleString() : '0'}/day
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Operational Context Notification Banner */}
                        {vehicle.operationalStatus === 'rented' && activeBooking && (
                          <div className="mt-2.5 p-2 rounded-lg bg-[#F1F6FA] border border-[#D0E0EC] text-[11px] text-[#35658A] flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#35658A]" />
                            <div className="truncate">
                              <span>Currently on rental: </span>
                              <strong className="text-[#17324D]">{activeBooking.customerName}</strong>
                              <span className="text-[#65727B]"> (Returns {activeBooking.returnDate})</span>
                            </div>
                          </div>
                        )}

                        {vehicle.operationalStatus === 'assigned' && activeAssignment && (
                          <div className="mt-2.5 p-2 rounded-lg bg-[#FAF5F0] border border-[#E8DCCE] text-[11px] text-[#8C5D30] flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 flex-shrink-0 text-[#8C5D30]" />
                            <div className="truncate">
                              <span>Assigned Custody: </span>
                              <strong className="text-[#24313A]">{activeAssignment.assignedTo}</strong>
                              <span className="text-[#65727B]"> ({activeAssignment.assignmentType})</span>
                            </div>
                          </div>
                        )}

                        {vehicle.operationalStatus === 'in_service' && (
                          <div className="mt-2.5 p-2 rounded-lg bg-[#FAF3F0] border border-[#EAD5CC] text-[11px] text-[#A64B2A] flex items-center gap-2">
                            <Wrench className="w-3.5 h-3.5 flex-shrink-0 text-[#A64B2A]" />
                            <span className="truncate">
                              In Workshop: {activeMaintenance?.serviceType || 'Maintenance Inspection'}
                            </span>
                          </div>
                        )}

                        {vehicle.operationalStatus === 'compliance_hold' && (
                          <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                            <span className="truncate">
                              Hold: {vehicle.statusChangeReason || 'Awaiting fitness certificate / insurance renewal'}
                            </span>
                          </div>
                        )}

                        {vehicle.operationalStatus === 'available' && (
                          <div className="mt-2.5 p-2 rounded-lg bg-[#EEF5F1] border border-[#CCE0D5] text-[11px] text-[#4F7D61] flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#4F7D61]" />
                            <span>In Depot: Cleared for customer dispatch</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-3 pt-2.5 border-t border-[#E5E9EC] flex items-center justify-between">
                        <span className="text-[10px] text-[#95A2AA]">
                          {vehicle.nextServiceMileage
                            ? `Next service: ${vehicle.nextServiceMileage.toLocaleString()} km`
                            : 'Inspection up to date'}
                        </span>

                        <button
                          type="button"
                          onClick={() => onSelectVehicleForProfile && onSelectVehicleForProfile(vehicle)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] hover:bg-[#E2E8EC] rounded-lg transition-colors cursor-pointer"
                        >
                          <span>Full Profile</span>
                          <ExternalLink className="w-3 h-3 text-[#65727B]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t bg-[#FAFBFB] flex items-center justify-between gap-3 flex-shrink-0" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-xs text-[#65727B]">
            Showing <strong>{filteredVehicles.length}</strong> of <strong>{ownerVehicles.length}</strong> vehicles in portfolio
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#24313A] bg-white hover:bg-[#F1F4F6] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
