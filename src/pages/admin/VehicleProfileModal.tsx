import React, { useState } from 'react';
import {
  X,
  Car,
  Calendar,
  Wrench,
  ShieldAlert,
  FileText,
  UserCheck,
  Globe,
  Clock,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { AdminVehicle } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface VehicleProfileModalProps {
  vehicle: AdminVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenStatusModal?: (v: AdminVehicle) => void;
  onOpenEditModal?: (v: AdminVehicle) => void;
}

export const VehicleProfileModal: React.FC<VehicleProfileModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onOpenStatusModal,
  onOpenEditModal,
}) => {
  const { bookings, maintenance, compliance, documents, assignments, auditLogs } = useAdminData();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'rentals' | 'maintenance' | 'compliance' | 'assignments' | 'audit'
  >('overview');

  if (!isOpen || !vehicle) return null;

  const vehicleBookings = bookings.filter((b) => b.vehicleId === vehicle.id);
  const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === vehicle.id);
  const vehicleCompliance = compliance.filter((c) => c.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter((d) => d.vehicleId === vehicle.id);
  const vehicleAssignments = assignments.filter((a) => a.vehicleId === vehicle.id);
  const vehicleAudit = auditLogs.filter((l) => l.targetEntityId === vehicle.id || l.details.includes(vehicle.registrationNumber));

  const totalEarnings = vehicleBookings
    .filter((b) => b.bookingStatus === 'completed' || b.bookingStatus === 'active')
    .reduce((sum, b) => sum + (b.finalAmount || b.estimatedAmount), 0);

  const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.totalCost, 0);

  const photoUrl = vehicle.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#17324D] text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#24313A]">
                  {vehicle.brand} {vehicle.model} ({vehicle.year})
                </h2>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-[#DCE2E6] text-[#17324D]">
                  {vehicle.registrationNumber}
                </span>
              </div>
              <p className="text-xs text-[#65727B] mt-0.5">
                VIN: <span className="font-mono">{vehicle.vin}</span> · Owner: {vehicle.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={vehicle.operationalStatus} size="md" />
            <button
              type="button"
              onClick={onClose}
              className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-[#DCE2E6] bg-[#F8F9FA] overflow-x-auto text-xs flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            360° Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rentals')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rentals'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            <span>Rental History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-[10px]">
              {vehicleBookings.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            <span>Maintenance & Service</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-[10px]">
              {vehicleMaintenance.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'compliance'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            <span>Compliance & Documents</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-[10px]">
              {vehicleCompliance.length + vehicleDocs.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            <span>Assignments</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gray-200 text-[10px]">
              {vehicleAssignments.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'border-[#17324D] text-[#17324D] font-bold'
                : 'border-transparent text-[#65727B] hover:text-[#24313A]'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Banner: Photo & Vital Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1 rounded-xl overflow-hidden border border-[#DCE2E6] bg-gray-100 h-48">
                  <img
                    src={photoUrl}
                    alt={vehicle.model}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Current Odometer</span>
                    <span className="text-base font-bold text-[#24313A] mt-0.5 block">
                      {vehicle.mileage.toLocaleString()} km
                    </span>
                    <span className="text-[10px] text-[#65727B]">
                      Next service: {vehicle.nextServiceMileage ? `${vehicle.nextServiceMileage.toLocaleString()} km` : 'Due soon'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Daily Rental Rate</span>
                    <span className="text-base font-bold text-[#24313A] mt-0.5 block">
                      Rs {vehicle.dailyRate.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#4F7D61]">Standard Tier</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Total Revenue Yield</span>
                    <span className="text-base font-bold text-[#4F7D61] mt-0.5 block">
                      Rs {totalEarnings.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#65727B]">Across {vehicleBookings.length} bookings</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Service & Repair Costs</span>
                    <span className="text-base font-bold text-[#24313A] mt-0.5 block">
                      Rs {totalMaintenanceCost.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#65727B]">Lifetime garage spend</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Net Operating Yield</span>
                    <span className="text-base font-bold text-[#17324D] mt-0.5 block">
                      Rs {(totalEarnings - totalMaintenanceCost).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#65727B]">Gross minus repairs</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-[#DCE2E6] bg-[#F8F9FA]">
                    <span className="text-[#65727B] block text-[11px]">Website Listing</span>
                    <span className="text-base font-bold text-[#24313A] mt-0.5 block">
                      {vehicle.published ? 'Live Online' : 'Hidden'}
                    </span>
                    <span className="text-[10px] text-[#C4802C]">
                      {vehicle.featured ? 'Featured Hero' : 'Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A] mb-3 pb-1 border-b border-[#DCE2E6]">
                  Technical & Mechanical Specifications
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[#65727B] block">Body Category</span>
                    <span className="font-semibold text-[#24313A] capitalize">{vehicle.category}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Transmission</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.transmission}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Fuel Type</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Color</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.color}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Seating Capacity</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.seats} Passengers</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Luggage Bags</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.luggageCapacity || 3} Suitcases</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Doors</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.doors || 5} Doors</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Air Conditioning</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.airConditioning ? 'Dual Climate' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Ownership & Commercial Valuation */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A] mb-3 pb-1 border-b border-[#DCE2E6]">
                  Ownership, Commercial & Depreciation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[#65727B] block">Registered Owner</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Purchase Date</span>
                    <span className="font-semibold text-[#24313A]">{vehicle.purchaseDate || '2024-01-01'}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Purchase Acquisition Cost</span>
                    <span className="font-semibold text-[#24313A]">Rs {(vehicle.purchaseValue || 1200000).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#65727B] block">Current Estimated Book Value</span>
                    <span className="font-semibold text-[#24313A]">Rs {(vehicle.currentValue || 1100000).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Footer inside Modal */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#DCE2E6]">
                {onOpenStatusModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStatusModal(vehicle);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg cursor-pointer"
                  >
                    Change Operational Status
                  </button>
                )}
                {onOpenEditModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditModal(vehicle);
                    }}
                    className="px-4 py-2 text-xs font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg cursor-pointer"
                  >
                    Edit Specifications
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: RENTALS */}
          {activeTab === 'rentals' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A]">
                Customer Booking History ({vehicleBookings.length})
              </h4>
              {vehicleBookings.length === 0 ? (
                <div className="py-8 text-center text-[#65727B] bg-gray-50 rounded-lg">
                  No rental bookings recorded yet for this vehicle.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE2E6] text-[#65727B]">
                      <th className="py-2">Reference</th>
                      <th className="py-2">Customer</th>
                      <th className="py-2">Rental Dates</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9EC]">
                    {vehicleBookings.map((b) => (
                      <tr key={b.id}>
                        <td className="py-2.5 font-mono font-semibold text-[#35658A]">{b.reference}</td>
                        <td className="py-2.5 font-medium">{b.customerName}</td>
                        <td className="py-2.5">{b.pickupDate} → {b.returnDate} ({b.days} days)</td>
                        <td className="py-2.5 font-semibold">Rs {(b.finalAmount || b.estimatedAmount).toLocaleString()}</td>
                        <td className="py-2.5 text-right capitalize font-medium">{b.bookingStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A]">
                Maintenance & Service Log ({vehicleMaintenance.length})
              </h4>
              {vehicleMaintenance.length === 0 ? (
                <div className="py-8 text-center text-[#65727B] bg-gray-50 rounded-lg">
                  No maintenance records logged for this vehicle.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE2E6] text-[#65727B]">
                      <th className="py-2">Date</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Garage</th>
                      <th className="py-2">Description</th>
                      <th className="py-2 text-right">Cost (Rs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9EC]">
                    {vehicleMaintenance.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2.5">{m.date} ({m.mileage} km)</td>
                        <td className="py-2.5 font-medium">{m.serviceType}</td>
                        <td className="py-2.5">{m.garage}</td>
                        <td className="py-2.5 max-w-xs truncate">{m.description}</td>
                        <td className="py-2.5 text-right font-bold">Rs {m.totalCost.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: COMPLIANCE & DOCUMENTS */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A] mb-2">
                  Legal Compliance Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {vehicleCompliance.map((c) => (
                    <div key={c.id} className="p-3 bg-[#F8F9FA] rounded-lg border border-[#DCE2E6]">
                      <div className="flex justify-between font-semibold text-[#24313A]">
                        <span>{c.complianceType}</span>
                        <span className={`text-[10px] ${c.status === 'Expired' ? 'text-[#B9534F]' : 'text-[#4F7D61]'}`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#65727B] mt-1">Provider: {c.provider}</div>
                      <div className="text-[11px] text-[#65727B]">Expires: {c.expiryDate}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A] mb-2">
                  Archived Digital Documents ({vehicleDocs.length})
                </h4>
                {vehicleDocs.length === 0 ? (
                  <div className="py-6 text-center text-[#65727B] bg-gray-50 rounded-lg">
                    No documents uploaded.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicleDocs.map((d) => (
                      <div key={d.id} className="p-3 bg-white rounded-lg border border-[#DCE2E6] flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[#24313A]">{d.title}</div>
                          <div className="text-[11px] text-[#65727B]">{d.documentType} ({d.fileSize})</div>
                        </div>
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#35658A] hover:underline text-[11px] font-medium"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ASSIGNMENTS */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A]">
                Vehicle Custody & Assignments ({vehicleAssignments.length})
              </h4>
              {vehicleAssignments.length === 0 ? (
                <div className="py-8 text-center text-[#65727B] bg-gray-50 rounded-lg">
                  No staff or internal custody records logged for this vehicle.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#DCE2E6] text-[#65727B]">
                      <th className="py-2">Assigned To</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Period</th>
                      <th className="py-2">Purpose</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E9EC]">
                    {vehicleAssignments.map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 font-semibold text-[#24313A]">{a.assignedTo}</td>
                        <td className="py-2.5">{a.assignmentType}</td>
                        <td className="py-2.5">{a.startDate} → {a.expectedReturnDate}</td>
                        <td className="py-2.5 max-w-xs truncate">{a.reason}</td>
                        <td className="py-2.5 text-right font-medium capitalize">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 6: AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A]">
                Activity Log & State Changes
              </h4>
              {vehicleAudit.length === 0 ? (
                <div className="py-8 text-center text-[#65727B] bg-gray-50 rounded-lg">
                  No recorded state changes yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {vehicleAudit.map((log) => (
                    <div key={log.id} className="p-3 bg-[#F8F9FA] rounded-lg border border-[#DCE2E6] flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-[#24313A]">{log.action}: </span>
                        <span className="text-[#65727B]">{log.details}</span>
                        <div className="text-[10px] text-[#95A2AA] mt-0.5">By {log.performedBy}</div>
                      </div>
                      <span className="text-[10px] text-[#65727B]">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
