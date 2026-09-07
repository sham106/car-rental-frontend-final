import React, { useState } from 'react';
import { X, Wrench, AlertCircle } from 'lucide-react';
import { AdminVehicle, MaintenanceServiceType } from '../../types/admin';
import { adminMaintenanceService } from '../../services/admin/adminMaintenanceService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface RecordMaintenanceModalProps {
  vehicle: AdminVehicle | null;
  vehiclesList?: AdminVehicle[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const SERVICE_TYPES: MaintenanceServiceType[] = [
  'Routine Service',
  'Oil Change',
  'Tyres',
  'Brakes',
  'Mechanical',
  'Electrical',
  'Body Repair',
  'Inspection',
  'Other',
];

export const RecordMaintenanceModal: React.FC<RecordMaintenanceModalProps> = ({
  vehicle,
  vehiclesList = [],
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle?.id || '');
  const [serviceType, setServiceType] = useState<MaintenanceServiceType>('Routine Service');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState<number>(vehicle?.mileage || 20000);
  const [garage, setGarage] = useState('Toyota Mauritius Service Centre, Grand Baie');
  const [description, setDescription] = useState('Periodic 20,000 km scheduled maintenance, synthetic oil & filter change.');
  const [partsReplaced, setPartsReplaced] = useState('Oil filter, 0W-20 Full Synthetic (4.5L), Washer');
  const [labourCost, setLabourCost] = useState<number>(1800);
  const [partsCost, setPartsCost] = useState<number>(3200);
  const [nextServiceMileage, setNextServiceMileage] = useState<number>((vehicle?.mileage || 20000) + 10000);
  const [nextServiceDate, setNextServiceDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-5)}`);
  const [notes, setNotes] = useState('Battery and alternator health test passed.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (vehicle) {
      setSelectedVehicleId(vehicle.id);
      setMileage(vehicle.mileage);
      setNextServiceMileage(vehicle.mileage + 10000);
    }
  }, [vehicle]);

  if (!isOpen) return null;

  const currentVehicle = vehicle || vehiclesList.find((v) => v.id === selectedVehicleId);
  const totalCost = Number(labourCost || 0) + Number(partsCost || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) {
      setError('Please select a vehicle.');
      return;
    }
    if (!garage.trim()) {
      setError('Please specify the garage/workshop.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await adminMaintenanceService.createRecord({
        vehicleId: currentVehicle.id,
        vehicleReg: currentVehicle.registrationNumber,
        vehicleName: `${currentVehicle.brand} ${currentVehicle.model}`,
        serviceType,
        date,
        mileage: Number(mileage),
        garage: garage.trim(),
        description: description.trim(),
        partsReplaced: partsReplaced.trim(),
        labourCost: Number(labourCost),
        partsCost: Number(partsCost),
        nextServiceMileage: Number(nextServiceMileage),
        nextServiceDate,
        invoiceNumber: invoiceNumber.trim(),
        notes: notes.trim(),
      });
      await onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to record maintenance');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#B86645] text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#24313A]">Record Fleet Maintenance</h3>
              <p className="text-xs text-[#65727B] mt-0.5">
                Log garage service, mechanical parts, and scheduled upkeep
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
              <span className="text-[#65727B]">Vehicle:</span>
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
                  if (selected) {
                    setMileage(selected.mileage);
                    setNextServiceMileage(selected.mileage + 10000);
                  }
                }}
                required
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              >
                <option value="">-- Choose vehicle --</option>
                {vehiclesList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} - {v.brand} {v.model}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as MaintenanceServiceType)}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              >
                {SERVICE_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Date Completed
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Odometer (km)
              </label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Garage / Workshop <span className="text-[#B9534F]">*</span>
              </label>
              <input
                type="text"
                value={garage}
                onChange={(e) => setGarage(e.target.value)}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Invoice Reference #
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Description of Work
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Parts Replaced
            </label>
            <input
              type="text"
              value={partsReplaced}
              onChange={(e) => setPartsReplaced(e.target.value)}
              placeholder="e.g. Front brake pads, wiper blades, air filter..."
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 p-3 bg-[#F8F9FA] rounded-lg border border-[#DCE2E6]">
            <div>
              <label className="block text-[11px] font-semibold text-[#65727B] uppercase mb-1">
                Labour Cost (Rs)
              </label>
              <input
                type="number"
                value={labourCost}
                onChange={(e) => setLabourCost(Number(e.target.value))}
                className="w-full text-sm p-1.5 rounded border border-[#DCE2E6] bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#65727B] uppercase mb-1">
                Parts Cost (Rs)
              </label>
              <input
                type="number"
                value={partsCost}
                onChange={(e) => setPartsCost(Number(e.target.value))}
                className="w-full text-sm p-1.5 rounded border border-[#DCE2E6] bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#65727B] uppercase mb-1">
                Total Service Cost
              </label>
              <div className="text-sm font-bold text-[#24313A] py-1.5">
                Rs {totalCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Next Service Due Mileage (km)
              </label>
              <input
                type="number"
                value={nextServiceMileage}
                onChange={(e) => setNextServiceMileage(Number(e.target.value))}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Next Service Due Date
              </label>
              <input
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
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
              {isSubmitting ? 'Saving Record...' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
