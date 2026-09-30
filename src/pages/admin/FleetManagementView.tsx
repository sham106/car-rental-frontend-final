import React, { useState, useMemo } from 'react';
import {
  Car,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Star,
  Globe,
  ArrowUpDown,
  Wrench,
  UserCheck,
  FileText,
  Eye,
  Edit,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Key,
} from 'lucide-react';
import { AdminVehicle, AdminOperationalStatus } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ChangeStatusModal } from '../../components/admin/ChangeStatusModal';
import { AssignVehicleModal } from '../../components/admin/AssignVehicleModal';
import { RecordMaintenanceModal } from '../../components/admin/RecordMaintenanceModal';
import { UploadDocumentModal } from '../../components/admin/UploadDocumentModal';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface FleetManagementViewProps {
  onOpenAddVehicle: () => void;
  onOpenEditVehicle: (vehicle: AdminVehicle) => void;
  onSelectVehicleProfile: (vehicle: AdminVehicle) => void;
}

export const FleetManagementView: React.FC<FleetManagementViewProps> = ({
  onOpenAddVehicle,
  onOpenEditVehicle,
  onSelectVehicleProfile,
}) => {
  const {
    vehicles,
    owners,
    changeVehicleStatus,
    toggleVehiclePublish,
    toggleVehicleFeatured,
    refreshAll,
  } = useAdminData();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'registration' | 'brand' | 'mileage' | 'dailyRate'>('registration');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [statusModalVehicle, setStatusModalVehicle] = useState<AdminVehicle | null>(null);
  const [assignModalVehicle, setAssignModalVehicle] = useState<AdminVehicle | null>(null);
  const [maintModalVehicle, setMaintModalVehicle] = useState<AdminVehicle | null>(null);
  const [docModalVehicle, setDocModalVehicle] = useState<AdminVehicle | null>(null);
  const [activeMenuVehicleId, setActiveMenuVehicleId] = useState<string | null>(null);

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            v.registrationNumber.toLowerCase().includes(q) ||
            v.brand.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.vin.toLowerCase().includes(q) ||
            v.ownerName.toLowerCase().includes(q);
          if (!match) return false;
        }

        // Status
        if (statusFilter !== 'all' && v.operationalStatus !== statusFilter) {
          return false;
        }

        // Category
        if (categoryFilter !== 'all' && v.category.toLowerCase() !== categoryFilter.toLowerCase()) {
          return false;
        }

        // Owner
        if (ownerFilter !== 'all') {
          if (ownerFilter === 'internal' && !v.ownerName.includes('Oceane')) return false;
          if (ownerFilter === 'partner' && v.ownerName.includes('Oceane')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'registration') {
          comp = a.registrationNumber.localeCompare(b.registrationNumber);
        } else if (sortField === 'brand') {
          comp = a.brand.localeCompare(b.brand);
        } else if (sortField === 'mileage') {
          comp = a.mileage - b.mileage;
        } else if (sortField === 'dailyRate') {
          comp = a.dailyRate - b.dailyRate;
        }
        return sortDirection === 'asc' ? comp : -comp;
      });
  }, [vehicles, searchQuery, statusFilter, categoryFilter, ownerFilter, sortField, sortDirection]);

  const toggleSort = (field: 'registration' | 'brand' | 'mileage' | 'dailyRate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const STATUS_TABS = [
    { id: 'all', label: 'All Fleet', count: vehicles.length },
    { id: 'available', label: 'Available', count: vehicles.filter((v) => v.operationalStatus === 'available').length },
    { id: 'reserved', label: 'Reserved', count: vehicles.filter((v) => v.operationalStatus === 'reserved').length },
    { id: 'rented', label: 'Rented', count: vehicles.filter((v) => v.operationalStatus === 'rented').length },
    { id: 'assigned', label: 'Assigned', count: vehicles.filter((v) => v.operationalStatus === 'assigned').length },
    { id: 'in_service', label: 'In Service', count: vehicles.filter((v) => v.operationalStatus === 'in_service').length },
    { id: 'compliance_hold', label: 'Hold', count: vehicles.filter((v) => v.operationalStatus === 'compliance_hold').length },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Fleet Vehicles Directory
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Manage operational status, specifications, ownership, and website visibility
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddVehicle}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DCE2E6]">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#17324D] text-white font-semibold'
                  : 'text-[#65727B] hover:bg-white hover:text-[#24313A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#E5E9EC] text-[#24313A]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Control Bar: Search + Category + Owner + Counter */}
      <div
        className="p-3.5 rounded-xl border bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registration, brand, model, VIN, owner..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white focus:outline-none focus:border-[#35658A] text-[#24313A]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A] focus:outline-none focus:border-[#35658A]"
          >
            <option value="all">All Categories</option>
            <option value="suv">SUV</option>
            <option value="sedan">Sedan</option>
            <option value="economy">Economy</option>
            <option value="van">Van / 7-Seater</option>
            <option value="compact">Compact</option>
            <option value="premium">Premium</option>
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A] focus:outline-none focus:border-[#35658A]"
          >
            <option value="all">All Ownership</option>
            <option value="internal">Internal</option>
            <option value="partner">Private Partner Owners</option>
          </select>

          <span className="text-xs text-[#65727B] ml-2">
            Showing <strong>{filteredVehicles.length}</strong> vehicles
          </span>
        </div>
      </div>

      {/* Main High-Density Fleet Table */}
      <div
        className="rounded-xl border bg-white overflow-hidden shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Vehicle Details</th>
                <th
                  onClick={() => toggleSort('registration')}
                  className="py-3 px-3 cursor-pointer hover:text-[#24313A]"
                >
                  <div className="flex items-center gap-1">
                    <span>Registration / VIN</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Operational Status</th>
                <th
                  onClick={() => toggleSort('mileage')}
                  className="py-3 px-3 cursor-pointer hover:text-[#24313A]"
                >
                  <div className="flex items-center gap-1">
                    <span>Current Odometer</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Next Service</th>
                <th
                  onClick={() => toggleSort('dailyRate')}
                  className="py-3 px-3 cursor-pointer hover:text-[#24313A]"
                >
                  <div className="flex items-center gap-1">
                    <span>Daily Rate</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3 text-center">Website</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#65727B]">
                    No vehicles match your active search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((v) => {
                  const photoUrl = v.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';
                  const isServiceClose = v.nextServiceMileage && v.nextServiceMileage - v.mileage <= 1500;
                  const isMenuOpen = activeMenuVehicleId === v.id;

                  return (
                    <tr
                      key={v.id}
                      className="hover:bg-[#F9FBFC] transition-colors group"
                    >
                      {/* Vehicle Column */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={photoUrl}
                            alt={`${v.brand} ${v.model}`}
                            className="w-12 h-9 rounded-md object-cover border border-[#DCE2E6] flex-shrink-0 bg-gray-100"
                          />
                          <div>
                            <div
                              onClick={() => onSelectVehicleProfile(v)}
                              className="font-semibold text-sm text-[#24313A] hover:text-[#35658A] cursor-pointer"
                            >
                              {v.brand} {v.model}
                            </div>
                            <div className="text-[11px] text-[#65727B] flex items-center gap-1.5 mt-0.5">
                              <span>{v.year}</span>
                              <span>·</span>
                              <span className="capitalize">{v.category}</span>
                              <span>·</span>
                              <span>{v.color}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Registration / VIN */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-semibold text-xs text-[#24313A] bg-[#F1F4F6] px-2 py-0.5 rounded inline-block">
                          {v.registrationNumber}
                        </div>
                        <div className="text-[10px] text-[#95A2AA] font-mono mt-0.5 truncate max-w-[130px]" title={v.vin}>
                          {v.vin}
                        </div>
                      </td>

                      {/* Operational Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={v.operationalStatus} size="sm" />
                      </td>

                      {/* Current Mileage */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#24313A]">
                          {v.mileage.toLocaleString()} km
                        </div>
                      </td>

                      {/* Next Service */}
                      <td className="py-3 px-3">
                        <div className={`text-xs ${isServiceClose ? 'text-[#B86645] font-semibold' : 'text-[#65727B]'}`}>
                          {v.nextServiceMileage ? `${v.nextServiceMileage.toLocaleString()} km` : 'Scheduled'}
                        </div>
                        {isServiceClose && (
                          <span className="text-[10px] text-[#B86645] block font-medium">Due soon!</span>
                        )}
                      </td>

                      {/* Daily Rate */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#24313A]">
                          Rs {v.dailyRate.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-[#65727B]">/ day</span>
                      </td>

                      {/* Owner */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-[#24313A] font-medium truncate max-w-[120px]" title={v.ownerName}>
                          {v.ownerName}
                        </div>
                        <div className="text-[10px] text-[#65727B]">
                          {v.ownerName.includes('Oceane') ? 'Internal Fleet' : 'Partner Host'}
                        </div>
                      </td>

                      {/* Website Status */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleVehiclePublish(v.id, !v.published)}
                            title={v.published ? 'Live on website (Click to unpublish)' : 'Unpublished (Click to publish)'}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              v.published
                                ? 'text-[#4F7D61] hover:bg-[#EEF5F1]'
                                : 'text-[#95A2AA] hover:bg-gray-100'
                            }`}
                          >
                            <Globe className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleVehicleFeatured(v.id, !v.featured)}
                            title={v.featured ? 'Featured on home page' : 'Not featured'}
                            className={`p-1 rounded cursor-pointer transition-colors ${
                              v.featured
                                ? 'text-[#C4802C] hover:bg-amber-50'
                                : 'text-[#95A2AA] hover:bg-gray-100'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${v.featured ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right relative">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onSelectVehicleProfile(v)}
                            className="p-1 text-[#65727B] hover:text-[#35658A] hover:bg-[#F4F6F7] rounded cursor-pointer"
                            title="360° Vehicle Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setStatusModalVehicle(v)}
                            className="p-1 text-[#65727B] hover:text-[#35658A] hover:bg-[#F4F6F7] rounded cursor-pointer"
                            title="Change Operational Status"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setActiveMenuVehicleId(isMenuOpen ? null : v.id)}
                              className="p-1 text-[#65727B] hover:text-[#24313A] hover:bg-[#F4F6F7] rounded cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {isMenuOpen && (
                              <>
                                <div
                                  className="fixed inset-0 z-20"
                                  onClick={() => setActiveMenuVehicleId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-xl border border-[#DCE2E6] py-1 z-30 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      onSelectVehicleProfile(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-[#35658A]" />
                                    <span>View Profile</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      onOpenEditVehicle(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <Edit className="w-3.5 h-3.5 text-[#65727B]" />
                                    <span>Edit Details</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      setStatusModalVehicle(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <ShieldAlert className="w-3.5 h-3.5 text-[#B9534F]" />
                                    <span>Change Status</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      setAssignModalVehicle(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-[#77838C]" />
                                    <span>Assign Vehicle</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      setMaintModalVehicle(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <Wrench className="w-3.5 h-3.5 text-[#B86645]" />
                                    <span>Log Maintenance</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuVehicleId(null);
                                      setDocModalVehicle(v);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-[#F4F6F7] flex items-center gap-2 cursor-pointer text-[#24313A]"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#17324D]" />
                                    <span>Upload Document</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
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

      {/* Reusable Operational Modals */}
      <ChangeStatusModal
        vehicle={statusModalVehicle}
        isOpen={Boolean(statusModalVehicle)}
        onClose={() => setStatusModalVehicle(null)}
        onSubmit={async (id, newStatus, reason) => {
          await changeVehicleStatus(id, newStatus, reason);
        }}
      />

      <AssignVehicleModal
        vehicle={assignModalVehicle}
        isOpen={Boolean(assignModalVehicle)}
        onClose={() => setAssignModalVehicle(null)}
        onSuccess={refreshAll}
      />

      <RecordMaintenanceModal
        vehicle={maintModalVehicle}
        isOpen={Boolean(maintModalVehicle)}
        onClose={() => setMaintModalVehicle(null)}
        onSuccess={refreshAll}
      />

      <UploadDocumentModal
        vehicle={docModalVehicle}
        isOpen={Boolean(docModalVehicle)}
        onClose={() => setDocModalVehicle(null)}
        onSuccess={refreshAll}
      />
    </div>
  );
};
