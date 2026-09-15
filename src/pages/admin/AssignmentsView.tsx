import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Calendar,
  Car,
  AlertCircle,
  LayoutGrid,
  List,
  ChevronRight,
  Gauge,
  ArrowRight,
  ExternalLink,
  Shield,
  Eye,
} from 'lucide-react';
import { Assignment, AdminVehicle } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { AssignVehicleModal } from '../../components/admin/AssignVehicleModal';
import { AssigneeDetailsModal } from '../../components/admin/AssigneeDetailsModal';
import { VehicleProfileModal } from './VehicleProfileModal';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { StatusBadge } from '../../components/admin/StatusBadge';

interface AssigneeSummary {
  assignedTo: string;
  assignmentType: string;
  allAssignments: Assignment[];
  activeAssignments: Assignment[];
  completedAssignments: Assignment[];
  totalAssignments: number;
  totalKmLogged: number;
  latestDate: string;
}

export const AssignmentsView: React.FC = () => {
  const { assignments, vehicles, endAssignment, refreshAll } = useAdminData();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'returned'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal inspection states
  const [selectedAssigneeName, setSelectedAssigneeName] = useState<string | null>(null);
  const [selectedVehicleForProfile, setSelectedVehicleForProfile] = useState<AdminVehicle | null>(null);

  // End Assignment Dialog
  const [endingAssignment, setEndingAssignment] = useState<Assignment | null>(null);
  const [returnMileage, setReturnMileage] = useState<number>(0);
  const [returnNotes, setReturnNotes] = useState('Vehicle returned in good operational condition.');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter individual assignment records
  const filteredAssignments = assignments.filter((a) => {
    const isActive = a.status.toLowerCase() === 'active';
    const isReturned = a.status.toLowerCase() === 'completed' || a.status.toLowerCase() === 'returned';

    if (filterStatus === 'active' && !isActive) return false;
    if (filterStatus === 'returned' && !isReturned) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.assignedTo.toLowerCase().includes(q) ||
        a.vehicleReg.toLowerCase().includes(q) ||
        a.vehicleName.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group assignments by person / custodian
  const assigneeSummaries = useMemo(() => {
    const map = new Map<string, AssigneeSummary>();

    assignments.forEach((a) => {
      const name = a.assignedTo;
      if (!map.has(name)) {
        map.set(name, {
          assignedTo: name,
          assignmentType: a.assignmentType,
          allAssignments: [],
          activeAssignments: [],
          completedAssignments: [],
          totalAssignments: 0,
          totalKmLogged: 0,
          latestDate: a.startDate,
        });
      }
      const summary = map.get(name)!;
      summary.allAssignments.push(a);
      summary.totalAssignments += 1;

      const isActive = a.status.toLowerCase() === 'active';
      if (isActive) {
        summary.activeAssignments.push(a);
      } else {
        summary.completedAssignments.push(a);
      }

      if (a.mileageIn && a.mileageIn > a.mileageOut) {
        summary.totalKmLogged += a.mileageIn - a.mileageOut;
      }

      if (a.startDate > summary.latestDate) {
        summary.latestDate = a.startDate;
      }
    });

    return Array.from(map.values());
  }, [assignments]);

  // Filter assignee summaries for Cards View
  const filteredAssignees = useMemo(() => {
    return assigneeSummaries.filter((s) => {
      if (filterStatus === 'active' && s.activeAssignments.length === 0) return false;
      if (filterStatus === 'returned' && s.activeAssignments.length > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.assignedTo.toLowerCase().includes(q);
        const matchesVehicles = s.allAssignments.some(
          (a) =>
            a.vehicleName.toLowerCase().includes(q) ||
            a.vehicleReg.toLowerCase().includes(q) ||
            a.reason.toLowerCase().includes(q)
        );
        return matchesName || matchesVehicles;
      }
      return true;
    });
  }, [assigneeSummaries, filterStatus, searchQuery]);

  const handleOpenEndModal = (a: Assignment) => {
    setEndingAssignment(a);
    setReturnMileage(a.mileageOut + 150);
    setError('');
  };

  const handleConfirmEnd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endingAssignment) return;
    if (returnMileage < endingAssignment.mileageOut) {
      setError(`Return mileage must be at least ${endingAssignment.mileageOut} km.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await endAssignment(endingAssignment.id, Number(returnMileage), returnNotes);
      setEndingAssignment(null);
      // Close detail modal if currently open to refresh state smoothly
      setSelectedAssigneeName(null);
    } catch (err) {
      setError((err as Error).message || 'Failed to end assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCount = assignments.filter((a) => a.status.toLowerCase() === 'active').length;
  const returnedCount = assignments.filter(
    (a) => a.status.toLowerCase() === 'completed' || a.status.toLowerCase() === 'returned'
  ).length;
  const activelyAssignedVehicleIds = new Set(
    assignments
      .filter((a) => a.status.toLowerCase() === 'active')
      .map((a) => a.vehicleId)
  );
  const assignableVehicles = vehicles.filter(
    (v) =>
      (v.operationalStatus || '').toLowerCase() === 'available' &&
      !activelyAssignedVehicleIds.has(v.id)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Vehicle Custody & Staff Assignments
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Track staff allocation, internal company utility, executive use, and custody history. Click any person card to inspect all exact vehicles assigned.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAssignModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Control Bar */}
      <div
        className="p-3.5 rounded-xl border bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignee, vehicle registration, reason..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status filters */}
          <div className="flex items-center gap-1 border border-[#E5E9EC] p-1 rounded-lg bg-[#F8F9FA]">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterStatus === 'all' ? 'bg-[#17324D] text-white shadow-2xs' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterStatus === 'active' ? 'bg-[#17324D] text-white shadow-2xs' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('returned')}
              className={`px-3 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                filterStatus === 'returned' ? 'bg-[#17324D] text-white shadow-2xs' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              Returned ({returnedCount})
            </button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 border border-[#E5E9EC] p-1 rounded-lg bg-[#F8F9FA]">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-[#17324D] text-white shadow-2xs' : 'text-[#65727B] hover:bg-gray-100'
              }`}
              title="View grouped by Assignee cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>By Person ({filteredAssignees.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-[#17324D] text-white shadow-2xs' : 'text-[#65727B] hover:bg-gray-100'
              }`}
              title="View all records in table"
            >
              <List className="w-3.5 h-3.5" />
              <span>All Logs ({filteredAssignments.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: ASSIGNEE / PERSON CARDS */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#65727B] px-1">
            <span>
              Showing <strong>{filteredAssignees.length}</strong> staff / partner custodians
            </span>
            <span className="text-[11px] text-[#95A2AA]">
              Click any person card to view all exact vehicles in their custody
            </span>
          </div>

          {filteredAssignees.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-[#DCE2E6] rounded-xl bg-white space-y-2 shadow-2xs">
              <UserCheck className="w-8 h-8 text-[#95A2AA] mx-auto" />
              <h4 className="font-semibold text-sm text-[#24313A]">No assignees match criteria</h4>
              <p className="text-xs text-[#65727B] max-w-sm mx-auto">
                No staff members or custodians found for your search or filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAssignees.map((summary) => {
                const hasActive = summary.activeAssignments.length > 0;
                const activeAssignment = summary.activeAssignments[0];
                const activeVehicle = activeAssignment
                  ? vehicles.find((v) => v.id === activeAssignment.vehicleId)
                  : null;

                const photoUrl =
                  activeVehicle?.photos?.[0] ||
                  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

                return (
                  <div
                    key={summary.assignedTo}
                    onClick={() => setSelectedAssigneeName(summary.assignedTo)}
                    className="p-5 rounded-xl border bg-white shadow-2xs hover:border-[#17324D] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                    style={{ borderColor: ADMIN_THEME.border }}
                  >
                    <div>
                      {/* Top Header: Avatar + Name + Custody Status */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2.5 rounded-lg bg-[#F1F4F6] text-[#17324D] group-hover:bg-[#17324D] group-hover:text-white transition-colors flex-shrink-0">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-[#24313A] group-hover:text-[#17324D] transition-colors truncate">
                              {summary.assignedTo}
                            </h3>
                            <span className="text-[11px] text-[#65727B]">{summary.assignmentType} Allocation</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex-shrink-0 flex items-center gap-1 ${
                            hasActive
                              ? 'bg-[#FAF5F0] text-[#8C5D30] border-[#E8DCCE]'
                              : 'bg-[#EEF5F1] text-[#4F7D61] border-[#CCE0D5]'
                          }`}
                        >
                          {hasActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D97745] animate-pulse" />
                              <span>Active Custody</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-[#4F7D61]" />
                              <span>All Returned</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Exact Vehicles Assigned Preview Card */}
                      <div className="mt-4 pt-3 border-t border-[#E5E9EC] space-y-2">
                        <div className="text-[11px] font-bold text-[#65727B] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-[#17324D]" />
                            <span>
                              {hasActive ? 'Current Active Vehicle' : 'Past Vehicle Assignment'}
                            </span>
                          </span>
                          <span className="text-[#17324D] group-hover:underline text-[11px] font-semibold flex items-center gap-0.5">
                            Inspect all &rarr;
                          </span>
                        </div>

                        {hasActive && activeAssignment ? (
                          <div className="p-2.5 rounded-lg bg-[#FAFBFB] border border-[#E5E9EC] flex items-center gap-3">
                            <img
                              src={photoUrl}
                              alt={activeAssignment.vehicleName}
                              className="w-14 h-11 object-cover rounded-md border border-[#E5E9EC] flex-shrink-0 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-xs text-[#24313A] truncate">
                                {activeAssignment.vehicleName}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F1F4F6] text-[#17324D] border border-[#DCE2E6]">
                                  {activeAssignment.vehicleReg}
                                </span>
                                <span className="text-[10px] text-[#8C5D30] font-medium truncate">
                                  Due: {activeAssignment.expectedReturnDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-[#F8F9FA] border border-[#E5E9EC] text-xs text-[#65727B] flex items-center justify-between">
                            <div className="truncate">
                              <span>Last: </span>
                              <strong className="text-[#24313A]">
                                {summary.allAssignments[0]?.vehicleName || 'Vehicle'}
                              </strong>
                            </div>
                            <span className="text-[10px] font-mono text-[#65727B]">
                              ({summary.allAssignments[0]?.vehicleReg})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer KPI & CTA Button */}
                    <div>
                      <div className="mt-4 pt-3 border-t border-[#E5E9EC] grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-[#95A2AA] block uppercase tracking-wider font-semibold">
                            Total Allocations
                          </span>
                          <span className="font-bold text-[#24313A] mt-0.5 block">
                            {summary.totalAssignments} {summary.totalAssignments === 1 ? 'vehicle' : 'vehicles'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#95A2AA] block uppercase tracking-wider font-semibold">
                            Distance Logged
                          </span>
                          <span className="font-bold text-[#4F7D61] mt-0.5 block">
                            {summary.totalKmLogged.toLocaleString()} km
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssigneeName(summary.assignedTo);
                        }}
                        className="w-full mt-3.5 py-2 px-3 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] group-hover:bg-[#17324D] group-hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>View Assigned Vehicles & History ({summary.totalAssignments})</span>
                        <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABLE LOG VIEW */}
      {viewMode === 'table' && (
        <div
          className="rounded-xl border bg-white overflow-hidden shadow-2xs"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-3">Assigned Person</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Assignment Dates</th>
                  <th className="py-3 px-3">Odometer</th>
                  <th className="py-3 px-3">Operational Purpose</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9EC]">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#65727B]">
                      No assignment records found.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a) => {
                    const isActive = a.status.toLowerCase() === 'active';
                    const vehicle = vehicles.find((v) => v.id === a.vehicleId);

                    return (
                      <tr key={a.id} className="hover:bg-[#F9FBFC] transition-colors">
                        {/* Vehicle */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#24313A] flex items-center gap-1.5">
                            <span>{a.vehicleName}</span>
                            {vehicle && (
                              <button
                                type="button"
                                onClick={() => setSelectedVehicleForProfile(vehicle)}
                                className="text-[#95A2AA] hover:text-[#17324D] cursor-pointer"
                                title="View Vehicle Profile"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <div className="font-mono text-[10px] text-[#65727B]">{a.vehicleReg}</div>
                        </td>

                        {/* Assigned To */}
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setSelectedAssigneeName(a.assignedTo)}
                            className="font-bold text-[#17324D] hover:underline flex items-center gap-1.5 cursor-pointer text-left"
                            title="Click to view all vehicles assigned to this person"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-[#65727B] flex-shrink-0" />
                            <span>{a.assignedTo}</span>
                          </button>
                        </td>

                        {/* Type */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F4F6] text-[#24313A]">
                            {a.assignmentType}
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="py-3 px-3">
                          <div className="text-[#24313A] font-medium">{a.startDate}</div>
                          <div className="text-[10px] text-[#95A2AA]">Due: {a.expectedReturnDate}</div>
                        </td>

                        {/* Mileage */}
                        <td className="py-3 px-3">
                          <div className="text-[#24313A]">Out: {a.mileageOut.toLocaleString()} km</div>
                          {a.mileageIn && (
                            <div className="text-[10px] text-[#4F7D61]">In: {a.mileageIn.toLocaleString()} km</div>
                          )}
                        </td>

                        {/* Purpose */}
                        <td className="py-3 px-3">
                          <div className="text-[#24313A] max-w-[200px] truncate" title={a.reason}>
                            {a.reason}
                          </div>
                          {a.notes && <div className="text-[10px] text-[#95A2AA] italic truncate max-w-[200px]">{a.notes}</div>}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C5D30] bg-[#FAF5F0] px-2 py-0.5 rounded-full border border-[#E8DCCE]">
                              <Clock className="w-3 h-3" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4F7D61] bg-[#EEF5F1] px-2 py-0.5 rounded-full border border-[#CCE0D5]">
                              <CheckCircle2 className="w-3 h-3" /> Returned
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedAssigneeName(a.assignedTo)}
                              className="px-2 py-1 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-md transition-colors cursor-pointer"
                              title="Inspect all vehicles assigned to this person"
                            >
                              <span>Inspect Person</span>
                            </button>

                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => handleOpenEndModal(a)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-md transition-colors cursor-pointer shadow-2xs"
                              >
                                End Custody
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#95A2AA]">Completed</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignee Details & Vehicle Custody Modal */}
      {selectedAssigneeName && (
        <AssigneeDetailsModal
          assigneeName={selectedAssigneeName}
          isOpen={!!selectedAssigneeName}
          onClose={() => setSelectedAssigneeName(null)}
          onSelectVehicleForProfile={(v) => setSelectedVehicleForProfile(v)}
          onEndAssignment={(a) => handleOpenEndModal(a)}
        />
      )}

      {/* Nested Vehicle Profile Modal */}
      {selectedVehicleForProfile && (
        <VehicleProfileModal
          vehicle={selectedVehicleForProfile}
          isOpen={!!selectedVehicleForProfile}
          onClose={() => setSelectedVehicleForProfile(null)}
        />
      )}

      {/* New Assignment Modal */}
      <AssignVehicleModal
        vehicle={null}
        vehiclesList={assignableVehicles}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={refreshAll}
      />

      {/* End Assignment Return Modal */}
      {endingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#DCE2E6] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7]">
              <h3 className="font-semibold text-base text-[#24313A]">
                End Vehicle Custody & Return
              </h3>
              <p className="text-xs text-[#65727B] mt-0.5">
                {endingAssignment.vehicleReg} · Assigned to: {endingAssignment.assignedTo}
              </p>
            </div>

            <form onSubmit={handleConfirmEnd} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-[#F8F9FA] border border-[#DCE2E6]">
                <span className="text-[#65727B]">Mileage at Handover:</span>
                <span className="font-semibold text-sm text-[#24313A] ml-2">
                  {endingAssignment.mileageOut.toLocaleString()} km
                </span>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                  Return Odometer Reading (km) <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="number"
                  value={returnMileage}
                  onChange={(e) => setReturnMileage(Number(e.target.value))}
                  required
                  className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                  Return Condition & Handover Notes
                </label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
                />
              </div>

              {error && (
                <div className="p-2.5 text-xs text-[#B9534F] bg-[#FDEDEC] rounded-lg border border-[#F8D7D5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-2.5 bg-[#EEF5F1] text-[#4F7D61] rounded-lg text-[11px]">
                Ending this assignment will release <strong>{endingAssignment.vehicleReg}</strong> back to <strong>Available</strong> status.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE2E6]">
                <button
                  type="button"
                  onClick={() => setEndingAssignment(null)}
                  className="px-4 py-2 text-xs font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg cursor-pointer"
                >
                  {isSubmitting ? 'Ending...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

