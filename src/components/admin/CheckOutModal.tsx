import { uploadFile } from '../../services/api';
import { useAdminData } from '../../context/AdminDataContext';
import React, { useState, useRef, useEffect } from 'react';
import { X, Key, Upload, Camera, Check, AlertCircle } from 'lucide-react';
import { AdminBooking } from '../../types/admin';
import { CheckOutInput } from '../../services/admin/adminBookingService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface CheckOutModalProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingId: string, checkoutData: CheckOutInput) => Promise<void>;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [mileageOut, setMileageOut] = useState<number>(25000);
  const [fuelLevelOut, setFuelLevelOut] = useState('8/8 Full');
  const [conditionNotesOut, setConditionNotesOut] = useState('Vehicle inspected with client. Interior and exterior spotless.');
  const [damageNotesOut, setDamageNotesOut] = useState('No pre-existing damages noted.');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { vehicles } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUploadedPhotos([]); setError('');
    setMileageOut(vehicles.find(v=>v.id===booking?.vehicleId)?.mileage ?? 0);
    setConditionNotesOut(''); setDamageNotesOut('');
  }, [booking?.id]);

  if (!isOpen || !booking) return null;

  const handlePhotoFiles = async (files: FileList | null) => {
    if (!files) return; setUploading(true); setError('');
    try {
      const urls:string[]=[];
      for (const file of Array.from(files)) urls.push((await uploadFile(file,'document')).url);
      setUploadedPhotos(p=>[...p,...urls]);
    } catch(e) {setError(e instanceof Error?e.message:'Unable to upload inspection photos.');}
    finally {setUploading(false);}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mileageOut || mileageOut <= 0) {
      setError('Please provide a valid departure odometer reading.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(booking.id, {
        mileageOut: Number(mileageOut),
        fuelLevelOut,
        conditionNotesOut,
        damageNotesOut,
        checkoutPhotos: uploadedPhotos,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to complete checkout');
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
            <div className="p-2 rounded-lg bg-[#35658A] text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#24313A]">
                Check-Out Vehicle (Start Rental)
              </h3>
              <p className="text-xs text-[#65727B] mt-0.5">
                Ref: {booking.reference} · Customer: {booking.customerName}
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

        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
<input ref={photoInput} type="file" aria-label="Inspection photos" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>handlePhotoFiles(e.target.files)} />
          {/* Summary Box */}
          <div className="p-4 rounded-lg bg-[#F8F9FA] border border-[#DCE2E6] grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#65727B] block">Vehicle</span>
              <span className="font-semibold text-[#24313A] text-sm">{booking.vehicleName}</span>
              <span className="text-[11px] text-[#65727B] block">{booking.vehicleReg}</span>
            </div>
            <div>
              <span className="text-[#65727B] block">Rental Period</span>
              <span className="font-medium text-[#24313A]">
                {booking.pickupDate} → {booking.returnDate} ({booking.days} days)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Departure Mileage (km) <span className="text-[#B9534F]">*</span>
              </label>
              <input
                type="number"
                value={mileageOut}
                onChange={(e) => setMileageOut(Number(e.target.value))}
                required
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] focus:ring-1 focus:ring-[#35658A] bg-white text-[#24313A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Fuel Level Out
              </label>
              <select
                value={fuelLevelOut}
                onChange={(e) => setFuelLevelOut(e.target.value)}
                className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] focus:ring-1 focus:ring-[#35658A] bg-white text-[#24313A]"
              >
                <option value="8/8 Full">8/8 (Full Tank)</option>
                <option value="7/8">7/8</option>
                <option value="6/8 (3/4)">6/8 (3/4 Tank)</option>
                <option value="4/8 (1/2)">4/8 (1/2 Tank)</option>
                <option value="2/8 (1/4)">2/8 (1/4 Tank)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Vehicle Departure Condition Notes
            </label>
            <input
              type="text"
              value={conditionNotesOut}
              onChange={(e) => setConditionNotesOut(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] focus:ring-1 focus:ring-[#35658A] bg-white text-[#24313A]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider">
                Pre-existing Damage Notes (Agreed with Customer)
              </label>
              <span className="text-[10px] text-[#4F7D61] font-semibold">Dispute Protection Baseline</span>
            </div>
            <input
              type="text"
              value={damageNotesOut}
              onChange={(e) => setDamageNotesOut(e.target.value)}
              placeholder="e.g. Scuff mark on passenger rear bumper, stone chip on hood..."
              className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#35658A] focus:ring-1 focus:ring-[#35658A] bg-white text-[#24313A]"
            />
            <p className="text-[11px] text-[#65727B] mt-1">
              💡 <em>These notes and handover photos will be presented to the return inspector during check-in to avoid confusion or unfair damage claims.</em>
            </p>
          </div>

          {/* Departure Inspection Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider">
                Handover Photos ({uploadedPhotos.length})
              </label>
              <button
                type="button"
                onClick={()=>photoInput.current?.click()}
                className="text-xs text-[#35658A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" /> + Add Inspection Photo
              </button>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {uploadedPhotos.map((photoUrl, idx) => (
                <div key={idx} className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#DCE2E6] flex-shrink-0 group">
                  <img src={photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                    #{idx + 1}
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={()=>photoInput.current?.click()}
                className="w-20 h-16 rounded-lg border-2 border-dashed border-[#DCE2E6] hover:border-[#35658A] flex flex-col items-center justify-center text-[#65727B] text-[10px] gap-1 flex-shrink-0 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs text-[#B9534F] bg-[#FDEDEC] rounded-lg border border-[#F8D7D5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-[#EEF5F1] text-[#4F7D61] rounded-lg text-xs flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            <span>Confirming check-out sets Booking to <strong>Active</strong> and Vehicle to <strong>Rented</strong>.</span>
          </div>

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
              disabled={isSubmitting || uploading}
              className="px-5 py-2 text-sm font-medium text-white bg-[#17324D] hover:bg-[#1F4366] disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              {isSubmitting ? 'Starting Rental...' : 'Complete Check-Out (Start Rental)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
