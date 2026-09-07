import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  ArrowRight,
  MapPin,
  FileText,
  Key,
  Gauge,
  RotateCcw,
} from 'lucide-react';
import { Assignment, AdminVehicle } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from './StatusBadge';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AssigneeDetailsModalProps {
  assigneeName: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectVehicleForProfile?: (vehicle: AdminVehicle) => void;
  onEndAssignment?: (assignment: Assignment) => void;
}

export const AssigneeDetailsModal: React.FC<AssigneeDetailsModalProps> = ({
  assigneeName,
  isOpen,
  onClose,
  onSelectVehicleForProfile,
  onEndAssignment,
}) => {
  const { assignments, vehicles } = useAdminData();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'history'>('all');

  if (!isOpen || !assigneeName) return null;

  // Filter all assignments belonging to this person
  const personAssignments = assignments.filter(
    (a) => a.assignedTo.toLowerCase() === assigneeName.toLowerCase()
  );

  const activeAssignments = personAssignments.filter((a) => a.status === 'Active' || a.status === 'active');
  const completedAssignments = personAssignments.filter(
    (a) => a.status === 'Completed' || a.status === 'returned' || a.status === 'Cancelled'
  );

  // Total km calculation
  const totalKmDriven = personAssignments.reduce((sum, a) => {
    if (a.mileageIn && a.mileageIn > a.mileageOut) {
      return sum + (a.mileageIn - a.mileageOut);
    }
    return sum;
  }, 0);

  // Primary assignment type
  const primaryType = personAssignments[0]?.assignmentType || 'Staff';

  const displayedList =
    activeTab === 'active'
      ? activeAssignments
      : activeTab === 'history'
      ? completedAssignments
      : personAssignments;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden text-xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Modal Header */}
        <div
          className="p-5 border-b bg-[#FAFBFB] flex items-start justify-between gap-4 flex-shrink-0"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#17324D] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#24313A] tracking-tight">{assigneeName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F1F4F6] text-[#17324D] border border-[#DCE2E6]">
                  {primaryType} Custody
                </span>
                {activeAssignments.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF5F0] text-[#8C5D30] border border-[#E8DCCE] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>In Active Custody ({activeAssignments.length} {activeAssignments.length === 1 ? 'vehicle' : 'vehicles'})</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EEF5F1] text-[#4F7D61] border border-[#CCE0D5] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>All Vehicles Returned</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#65727B] mt-0.5">
                Staff & Custodian Allocation Profile · Tracking corporate usage, keys handover, and return log
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
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Active In Possession</span>
              <div className="text-xl font-bold text-[#17324D] mt-0.5 flex items-baseline gap-1">
                <span>{activeAssignments.length}</span>
                <span className="text-xs font-normal text-[#65727B]">{activeAssignments.length === 1 ? 'vehicle' : 'vehicles'}</span>
              </div>
              <span className="text-[10px] text-[#8C5D30] font-medium">Currently on the road</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Lifetime Assignments</span>
              <div className="text-xl font-bold text-[#24313A] mt-0.5 flex items-baseline gap-1">
                <span>{personAssignments.length}</span>
                <span className="text-xs font-normal text-[#65727B]">allocations</span>
              </div>
              <span className="text-[10px] text-[#65727B]">{completedAssignments.length} successfully returned</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Logged Distance</span>
              <div className="text-xl font-bold text-[#4F7D61] mt-0.5 flex items-baseline gap-1">
                <span>{totalKmDriven.toLocaleString()}</span>
                <span className="text-xs font-normal text-[#65727B]">km</span>
              </div>
              <span className="text-[10px] text-[#65727B]">Across all returned logs</span>
            </div>

            <div className="p-3.5 rounded-xl border bg-white shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#65727B] block">Assignment Type</span>
              <div className="text-sm font-bold text-[#17324D] mt-1 truncate">
                {primaryType}
              </div>
              <span className="text-[10px] text-[#65727B]">Internal company operations</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b border-[#E5E9EC] pb-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'all'
                    ? 'bg-[#17324D] text-white'
                    : 'text-[#65727B] hover:bg-[#F1F4F6] hover:text-[#24313A]'
                }`}
              >
                All Allocated Vehicles ({personAssignments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'active'
                    ? 'bg-[#17324D] text-white'
                    : 'text-[#65727B] hover:bg-[#F1F4F6] hover:text-[#24313A]'
                }`}
              >
                Currently Active ({activeAssignments.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'bg-[#17324D] text-white'
                    : 'text-[#65727B] hover:bg-[#F1F4F6] hover:text-[#24313A]'
                }`}
              >
                Returned History ({completedAssignments.length})
              </button>
            </div>

            <span className="text-[11px] text-[#65727B] hidden sm:inline">
              Exact vehicle records for <strong>{assigneeName}</strong>
            </span>
          </div>

          {/* Assigned Vehicles List */}
          {displayedList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#DCE2E6] rounded-xl bg-[#FAFBFB] space-y-2">
              <Car className="w-8 h-8 text-[#95A2AA] mx-auto" />
              <h4 className="font-semibold text-sm text-[#24313A]">No vehicles found in this category</h4>
              <p className="text-xs text-[#65727B]">
                {activeTab === 'active'
                  ? 'There are currently no active vehicles in custody for this person.'
                  : 'No past assignment history records found.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedList.map((assignment) => {
                const vehicle = vehicles.find((v) => v.id === assignment.vehicleId);
                const isActive = assignment.status === 'Active' || assignment.status === 'active';
                const photoUrl =
                  vehicle?.photos?.[0] ||
                  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

                const kmDriven =
                  assignment.mileageIn && assignment.mileageIn > assignment.mileageOut
                    ? assignment.mileageIn - assignment.mileageOut
                    : vehicle && vehicle.mileage > assignment.mileageOut
                    ? vehicle.mileage - assignment.mileageOut
                    : 0;

                return (
                  <div
                    key={assignment.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-white border-[#17324D] shadow-xs'
                        : 'bg-white border-[#E5E9EC] shadow-2xs hover:border-[#CAD5DF]'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E5E9EC]">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            isActive ? 'bg-[#D97745] animate-pulse' : 'bg-[#4F7D61]'
                          }`}
                        />
                        <span className="font-bold text-xs text-[#24313A]">
                          {isActive ? 'CURRENTLY IN CUSTODY' : 'RETURNED TO DEPOT'}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F1F4F6] text-[#24313A] font-medium">
                          {assignment.assignmentType} Allocation
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#65727B]">Custody Period:</span>
                        <span className="font-semibold text-[#24313A]">
                          {assignment.startDate} → {isActive ? `Due ${assignment.expectedReturnDate}` : assignment.actualReturnDate || assignment.expectedReturnDate}
                        </span>
                      </div>
                    </div>

                    {/* Body: Vehicle Details + Odometer & Purpose */}
                    <div className="pt-3.5 grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Left: Vehicle Image & Specs (5 cols) */}
                      <div className="md:col-span-5 flex items-start gap-3">
                        <img
                          src={photoUrl}
                          alt={assignment.vehicleName}
                          className="w-24 h-18 object-cover rounded-lg border border-[#E5E9EC] flex-shrink-0 bg-slate-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#24313A] truncate">
                            {assignment.vehicleName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F1F4F6] text-[#17324D] border border-[#DCE2E6]">
                              {assignment.vehicleReg}
                            </span>
                            {vehicle && <StatusBadge status={vehicle.operationalStatus} />}
                          </div>

                          {vehicle && (
                            <div className="text-[11px] text-[#65727B] mt-1.5">
                              <span>{vehicle.year} · {vehicle.category} · {vehicle.transmission}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Middle: Odometer & Mileage Tracking (4 cols) */}
                      <div className="md:col-span-4 bg-[#F8F9FA] rounded-lg p-3 border border-[#E5E9EC] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#65727B] flex items-center gap-1">
                            <Gauge className="w-3.5 h-3.5 text-[#95A2AA]" />
                            <span>Out Odometer:</span>
                          </span>
                          <strong className="text-[#24313A]">{assignment.mileageOut.toLocaleString()} km</strong>
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#65727B] flex items-center gap-1">
                            <RotateCcw className="w-3.5 h-3.5 text-[#95A2AA]" />
                            <span>{isActive ? 'Current Odometer:' : 'Return In Odometer:'}</span>
                          </span>
                          <strong className="text-[#24313A]">
                            {isActive
                              ? vehicle
                                ? `${vehicle.mileage.toLocaleString()} km`
                                : 'Active'
                              : assignment.mileageIn
                              ? `${assignment.mileageIn.toLocaleString()} km`
                              : 'Logged'}
                          </strong>
                        </div>

                        <div className="pt-1 border-t border-[#E5E9EC] flex items-center justify-between text-[11px]">
                          <span className="text-[#65727B]">Distance Logged:</span>
                          <span className="font-bold text-[#4F7D61]">+{kmDriven.toLocaleString()} km</span>
                        </div>
                      </div>

                      {/* Right: Purpose & Handover Details (3 cols) */}
                      <div className="md:col-span-3 flex flex-col justify-between text-[11px] space-y-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#95A2AA] block">
                            Operational Purpose
                          </span>
                          <p className="text-[#24313A] mt-0.5 leading-relaxed font-medium line-clamp-2" title={assignment.reason}>
                            {assignment.reason}
                          </p>
                          {assignment.notes && (
                            <p className="text-[#65727B] text-[10px] mt-1 italic line-clamp-1" title={assignment.notes}>
                              Note: {assignment.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                          {vehicle && onSelectVehicleForProfile && (
                            <button
                              type="button"
                              onClick={() => onSelectVehicleForProfile(vehicle)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] hover:bg-[#E2E8EC] rounded-md transition-colors cursor-pointer"
                            >
                              <span>Profile</span>
                              <ExternalLink className="w-3 h-3 text-[#65727B]" />
                            </button>
                          )}

                          {isActive && onEndAssignment && (
                            <button
                              type="button"
                              onClick={() => onEndAssignment(assignment)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-md transition-colors cursor-pointer shadow-2xs"
                            >
                              <span>End Custody</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="p-4 border-t bg-[#FAFBFB] flex items-center justify-between gap-3 flex-shrink-0"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="text-xs text-[#65727B]">
            Showing <strong>{displayedList.length}</strong> allocated vehicle {displayedList.length === 1 ? 'record' : 'records'} for {assigneeName}
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
