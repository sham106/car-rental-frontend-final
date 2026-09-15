import React, { useState } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';
import { AdminVehicle, AdminAssignmentType } from '../../types/admin';
import { adminAssignmentService } from '../../services/admin/adminAssignmentService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AssignVehicleModalProps {
  vehicle: AdminVehicle | null;
  vehiclesList?: AdminVehicle[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  vehicle,
  vehiclesList = [],
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle?.id || '');
  const [assignedTo, setAssignedTo] = useState('Airport Handover Operations Team');
  const [assignmentType, setAssignmentType] = useState<AdminAssignmentType>('Staff');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [mileageOut, setMileageOut] = useState<number>(vehicle?.mileage || 20000);
  const [reason, setReason] = useState('Staff airport shuttle and client vehicle relocation duties');
  const [notes, setNotes] = useState('Fuel card #2 issued. Keep logbook updated.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Keep state synced with prop
  React.useEffect(() => {
    if (vehicle) {
      setSelectedVehicleId(vehicle.id);
      setMileageOut(vehicle.mileage);
    }
  }, [vehicle]);

  if (!isOpen) return null;

  const currentVehicle = vehicle || vehiclesList.find((v) => v.id === selectedVehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) {
      setError('Please select a vehicle.');
      return;
    }
    if (!assignedTo.trim()) {
      setError('Please enter assignee name.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide an operational reason for this assignment.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await adminAssignmentService.createAssignment({
        vehicleId: currentVehicle.id,
        vehicleReg: currentVehicle.registrationNumber,
        vehicleName: `${currentVehicle.brand} ${currentVehicle.model}`,
        assignedTo: assignedTo.trim(),
        assignmentType,
        startDate,
        expectedReturnDate,
        mileageOut: Number(mileageOut),
        reason: reason.trim(),
        notes: notes.trim(),
      });
      await onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create assignment');
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#77838C] text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#24313A]">Assign Fleet Vehicle</h3>
              <p className="text-xs text-[#65727B] mt-0.5">
                Allocate vehicle for company, staff, or executive usage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {vehicle ? (
            <div className="p-3 bg-[#F8F9FA] rounded-lg border border-[#DCE2E6] text-xs">
              <span className="text-[#65727B]">Selected Vehicle:</span>
              <div className="font-semibold text-sm text-[#24313A] mt-0.5">
                {vehicle.registrationNumber} · {vehicle.brand} {vehicle.model}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Select Vehicle <span className="text-[#B9534F]">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  const selected = vehiclesList.find((v) => v.id === e.target.value);
                  if (selected) setMileageOut(selected.mileage);
                }}
                required
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] bg-white text-[#24313A]"
              >
                <option value="">-- Choose available vehicle --</option>
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} - {v.brand} {v.model} ({v.operationalStatus})
                  </option>
                ))}
              </select>
              {vehiclesList.length === 0 && (
                <p className="mt-1.5 text-[11px] text-[#B9534F]">
                  No assignable vehicles found. Ensure at least one vehicle is in available status.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Assigned To (Staff / Entity) <span className="text-[#B9534F]">*</span>
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Kaviraj Seetah (Ops Lead)"
                required
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] bg-white text-[#24313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Assignment Type
              </label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value as AdminAssignmentType)}
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] bg-white text-[#24313A]"
              >
                <option value="Staff">Staff Operations</option>
                <option value="Company">Company Internal</option>
                <option value="Personal">Personal / Partner</option>
                <option value="Temporary">Temporary Courtesy</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Expected Return
              </label>
              <input
                type="date"
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Mileage Out (km)
              </label>
              <input
                type="number"
                value={mileageOut}
                onChange={(e) => setMileageOut(Number(e.target.value))}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Operational Reason <span className="text-[#B9534F]">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. VIP client escort, hotel concierge visits..."
              required
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
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
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium text-white bg-[#17324D] hover:bg-[#1F4366] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting ? 'Creating Assignment...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
