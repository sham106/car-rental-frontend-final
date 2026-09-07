import React, { useState } from 'react';
import { X, ArrowRight, ShieldAlert, Wrench, Ban, AlertCircle } from 'lucide-react';
import { AdminVehicle, AdminOperationalStatus } from '../../types/admin';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { StatusBadge } from './StatusBadge';

interface ChangeStatusModalProps {
  vehicle: AdminVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleId: string, newStatus: AdminOperationalStatus, reason: string) => Promise<void>;
}

const STATUS_OPTIONS: { status: AdminOperationalStatus; label: string; desc: string }[] = [
  { status: 'available', label: 'Available', desc: 'Vehicle is cleaned, inspected, and ready for rental or assignment.' },
  { status: 'reserved', label: 'Reserved', desc: 'Allocated to an upcoming confirmed booking request.' },
  { status: 'rented', label: 'Rented', desc: 'Currently checked out to a customer on an active rental.' },
  { status: 'assigned', label: 'Assigned', desc: 'Allocated for internal company, staff, or executive usage.' },
  { status: 'in_service', label: 'In Service', desc: 'Undergoing workshop inspection, maintenance, or mechanical repairs.' },
  { status: 'compliance_hold', label: 'Compliance Hold', desc: 'Legally grounded due to expired fitness, insurance, or carrier permit.' },
  { status: 'inactive', label: 'Inactive', desc: 'Decommissioned, in storage, or permanently removed from operations.' },
];

export const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<AdminOperationalStatus | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !vehicle) return null;

  const requiresReason =
    selectedStatus === 'in_service' ||
    selectedStatus === 'compliance_hold' ||
    selectedStatus === 'inactive' ||
    vehicle.operationalStatus === 'in_service' ||
    vehicle.operationalStatus === 'compliance_hold';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) {
      setError('Please select a new operational status.');
      return;
    }
    if (selectedStatus === vehicle.operationalStatus) {
      setError('Vehicle is already in this status.');
      return;
    }
    if (requiresReason && (!reason || reason.trim().length < 5)) {
      setError('A descriptive reason (min 5 characters) is required for this status change.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(vehicle.id, selectedStatus, reason.trim() || 'Manual operational status update by staff');
      onClose();
      setSelectedStatus('');
      setReason('');
    } catch (err) {
      setError((err as Error).message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7]">
          <div>
            <h3 className="text-base font-semibold text-[#24313A]">Change Operational Status</h3>
            <p className="text-xs text-[#65727B] mt-0.5">
              {vehicle.registrationNumber} · {vehicle.brand} {vehicle.model}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Current vs Target status transition */}
          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#DCE2E6] flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-[#65727B] uppercase tracking-wider mb-1">
                Current Status
              </div>
              <StatusBadge status={vehicle.operationalStatus} size="sm" />
            </div>
            <ArrowRight className="w-5 h-5 text-[#65727B]" />
            <div>
              <div className="text-[11px] font-medium text-[#65727B] uppercase tracking-wider mb-1">
                New Target Status
              </div>
              {selectedStatus ? (
                <StatusBadge status={selectedStatus} size="sm" />
              ) : (
                <span className="text-xs text-[#65727B] italic">Select below</span>
              )}
            </div>
          </div>

          {/* Status Selection list */}
          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-2">
              Select New Status
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {STATUS_OPTIONS.map((opt) => {
                const isCurrent = opt.status === vehicle.operationalStatus;
                const isSelected = opt.status === selectedStatus;
                return (
                  <button
                    key={opt.status}
                    type="button"
                    disabled={isCurrent}
                    onClick={() => {
                      setSelectedStatus(opt.status);
                      setError('');
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-sm transition-all flex items-start justify-between cursor-pointer ${
                      isCurrent
                        ? 'opacity-40 bg-gray-50 border-gray-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#F1F6FA] border-[#35658A] ring-1 ring-[#35658A]'
                        : 'bg-white border-[#DCE2E6] hover:bg-[#F8F9FA]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#24313A]">{opt.label}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#65727B] mt-0.5 leading-normal">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason Input (Guarded for critical transitions) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider">
                Reason for Status Change {requiresReason && <span className="text-[#B9534F]">*</span>}
              </label>
              {requiresReason && (
                <span className="text-[11px] text-[#B9534F] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Mandatory for audit log
                </span>
              )}
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                selectedStatus === 'in_service'
                  ? 'e.g. Brake service required; dispatched to Leal workshop for pad replacement.'
                  : selectedStatus === 'compliance_hold'
                  ? 'e.g. Fitness certificate expired; pending inspection at Curepipe centre.'
                  : 'Provide operational justification for this change...'
              }
              rows={3}
              className="w-full text-sm p-3 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] focus:ring-1 focus:ring-[#35658A] bg-white text-[#24313A]"
            />
          </div>

          {error && (
            <div className="p-3 text-xs text-[#B9534F] bg-[#FDEDEC] rounded-lg border border-[#F8D7D5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE2E6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedStatus}
              className="px-4 py-2 text-sm font-medium text-white bg-[#17324D] hover:bg-[#1F4366] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Updating...' : 'Confirm Status Change'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
