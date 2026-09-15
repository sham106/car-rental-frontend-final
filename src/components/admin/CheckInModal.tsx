import { uploadFile } from '../../services/api';
import { useAdminData } from '../../context/AdminDataContext';
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Camera,
  Check,
  AlertCircle,
  ShieldCheck,
  Fuel,
  Gauge,
  Eye,
  Columns,
  ListFilter,
  Maximize2,
  Calendar,
  User,
  Info,
} from 'lucide-react';
import { AdminBooking } from '../../types/admin';
import { CheckInInput } from '../../services/admin/adminBookingService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface CheckInModalProps {
  booking: AdminBooking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingId: string, checkinData: CheckInInput) => Promise<void>;
}

// Helper to convert fuel string into approximate 8ths fraction
const getFuelFraction = (fuelStr?: string): number => {
  if (!fuelStr) return 8;
  if (fuelStr.includes('8/8') || fuelStr.toLowerCase().includes('full')) return 8;
  if (fuelStr.includes('7/8')) return 7;
  if (fuelStr.includes('6/8') || fuelStr.includes('3/4')) return 6;
  if (fuelStr.includes('4/8') || fuelStr.includes('1/2')) return 4;
  if (fuelStr.includes('2/8') || fuelStr.includes('1/4')) return 2;
  if (fuelStr.includes('1/8')) return 1;
  return 8;
};

export const CheckInModal: React.FC<CheckInModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'comparison'>('form');

  const [mileageIn, setMileageIn] = useState<number>(
    booking?.mileageOut ? booking.mileageOut + 350 : 25500
  );
  const [fuelLevelIn, setFuelLevelIn] = useState('8/8 Full');
  const [conditionNotesIn, setConditionNotesIn] = useState('Customer returned on time. Interior clean.');
  const [damageNotesIn, setDamageNotesIn] = useState('No new damage observed.');
  const [finalVehicleStatus, setFinalVehicleStatus] = useState<'available' | 'in_service'>('available');
  const [serviceReason, setServiceReason] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const photoInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { vehicles } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Lightbox preview for photos
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    setUploadedPhotos([]); setError('');
    setMileageIn(booking?.mileageOut ?? vehicles.find(v=>v.id===booking?.vehicleId)?.mileage ?? 0);
    setConditionNotesIn(''); setDamageNotesIn('');
  }, [booking?.id]);

  if (!isOpen || !booking) return null;

  const departureMileage = booking.mileageOut || 0;
  const kmDriven = departureMileage ? Math.max(0, mileageIn - departureMileage) : 0;

  const fuelOutFraction = getFuelFraction(booking.fuelLevelOut);
  const fuelInFraction = getFuelFraction(fuelLevelIn);
  const hasFuelShortfall = fuelInFraction < fuelOutFraction;

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
    if (!mileageIn || (booking.mileageOut && mileageIn < booking.mileageOut)) {
      setError(`Return mileage must be equal to or greater than departure mileage (${booking.mileageOut || 0} km).`);
      return;
    }
    if (finalVehicleStatus === 'in_service' && (!serviceReason || serviceReason.trim().length < 5)) {
      setError('Please provide a reason why this vehicle requires In-Service workshop transfer.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit(booking.id, {
        mileageIn: Number(mileageIn),
        fuelLevelIn,
        conditionNotesIn,
        damageNotesIn,
        checkinPhotos: uploadedPhotos,
        finalVehicleStatus,
        serviceReason: finalVehicleStatus === 'in_service' ? serviceReason : undefined,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to complete return');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#DCE2E6] bg-[#F4F6F7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#4F7D61] text-white">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#24313A]">
                  Check-In & Vehicle Return
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EAEFF2] text-[#17324D]">
                  {booking.reference}
                </span>
              </div>
              <p className="text-xs text-[#65727B] mt-0.5">
                Customer: <span className="font-medium text-[#24313A]">{booking.customerName}</span> · Vehicle: <span className="font-medium text-[#24313A]">{booking.vehicleName} ({booking.vehicleReg})</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Return Form vs Side-by-Side Verification */}
        <div className="flex items-center justify-between px-6 py-2 bg-white border-b border-[#E5E9EC] text-xs">
          <div className="flex items-center gap-1 bg-[#F1F4F6] p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-white text-[#17324D] shadow-2xs font-semibold'
                  : 'text-[#65727B] hover:text-[#24313A]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Inspection & Return Form</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-white text-[#17324D] shadow-2xs font-semibold'
                  : 'text-[#65727B] hover:text-[#24313A]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side Handover Audit</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#4F7D61] bg-[#EEF5F1] px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Handover baseline protection active</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* PERMANENT DEPARTURE BASELINE CARD (Always visible to refer to during return) */}
          <div className="p-4 rounded-xl border border-[#CCE0D5] bg-[#F7FAF8] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-[#D8E6DE]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#4F7D61] text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider">
                    Departure Handover Baseline (Agreed with Customer)
                  </h4>
                  <p className="text-[11px] text-[#65727B]">
                    Inspected & signed off {booking.checkedOutAt ? new Date(booking.checkedOutAt).toLocaleString() : 'at vehicle departure'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center text-[10px] font-semibold text-[#4F7D61] bg-white px-2 py-0.5 rounded border border-[#CCE0D5]">
                Verified Handover
              </span>
            </div>

            {/* Departure Baseline Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-[#DCE2E6]">
                <span className="text-[#65727B] text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-[#35658A]" /> Departure Mileage
                </span>
                <span className="font-bold text-[#24313A] text-sm mt-0.5 block">
                  {booking.mileageOut ? `${booking.mileageOut.toLocaleString()} km` : 'Not recorded'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#DCE2E6]">
                <span className="text-[#65727B] text-[10px] uppercase font-semibold flex items-center gap-1">
                  <Fuel className="w-3 h-3 text-[#B86645]" /> Departure Fuel
                </span>
                <span className="font-bold text-[#24313A] text-sm mt-0.5 block">
                  {booking.fuelLevelOut || '8/8 Full'}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-[#DCE2E6] sm:col-span-2">
                <span className="text-[#65727B] text-[10px] uppercase font-semibold block">
                  Departure Condition Notes
                </span>
                <span className="text-[#24313A] text-xs font-medium mt-0.5 line-clamp-2 block">
                  {booking.conditionNotesOut || 'Vehicle inspected clean inside and out.'}
                </span>
              </div>
            </div>

            {/* Pre-Existing Damages Box - CRITICAL FOR AVOIDING BLAME */}
            <div className="p-3 bg-[#FEF9E7] rounded-lg border border-[#FAD7A0] text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#B78103] flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#7D5A00] uppercase tracking-wide text-[11px]">
                      Pre-Existing Damages Noted at Departure:
                    </span>
                  </div>
                  <p className="text-[#5C4300] font-medium text-xs leading-relaxed">
                    {booking.damageNotesOut ? (
                      booking.damageNotesOut
                    ) : (
                      <span className="italic text-[#7D5A00]">
                        No pre-existing damages were recorded at handover. Vehicle was noted in pristine cosmetic order.
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-[#8C6D1E] pt-0.5">
                    💡 <em>Customer confirmed these pre-existing items at checkout. Do not penalize or charge for items already listed here.</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Checkout Photos Gallery */}
            {booking.checkoutPhotos && booking.checkoutPhotos.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#65727B] mb-1.5">
                  <span className="font-semibold text-[#24313A]">
                    Handover Photos taken with Customer ({booking.checkoutPhotos.length}):
                  </span>
                  <span className="text-[10px] text-[#35658A]">Click photo to enlarge</span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {booking.checkoutPhotos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setLightboxPhoto({
                          url: photo,
                          title: `Departure Inspection Photo #${i + 1} (${booking.vehicleReg})`,
                        })
                      }
                      className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#CCE0D5] flex-shrink-0 hover:ring-2 hover:ring-[#35658A] transition-all cursor-pointer group"
                    >
                      <img src={photo} alt={`Handover Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                        <Eye className="w-4 h-4 drop-shadow" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                        #{i + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: FORM VIEW */}
          {activeTab === 'form' && (
            
        <form onSubmit={handleSubmit} className="space-y-4">
<input ref={photoInput} type="file" aria-label="Inspection photos" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={e=>handlePhotoFiles(e.target.files)} />
              <div className="flex items-center justify-between pt-1">
                <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Current Return Inspection Checklist</span>
                </h4>
                <div className="text-xs text-[#35658A] font-semibold">
                  Distance on Trip: <span className="font-bold">{kmDriven} km</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                    Return Mileage (km) <span className="text-[#B9534F]">*</span>
                  </label>
                  <input
                    type="number"
                    value={mileageIn}
                    onChange={(e) => setMileageIn(Number(e.target.value))}
                    required
                    className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#4F7D61] focus:ring-1 focus:ring-[#4F7D61] bg-white text-[#24313A]"
                  />
                  <span className="text-[11px] text-[#65727B] mt-0.5 block">
                    Departure was {booking.mileageOut?.toLocaleString()} km (Difference: +{kmDriven} km)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                    Return Fuel Level
                  </label>
                  <select
                    value={fuelLevelIn}
                    onChange={(e) => setFuelLevelIn(e.target.value)}
                    className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#4F7D61] focus:ring-1 focus:ring-[#4F7D61] bg-white text-[#24313A]"
                  >
                    <option value="8/8 Full">8/8 (Full Tank)</option>
                    <option value="7/8">7/8</option>
                    <option value="6/8 (3/4)">6/8 (3/4 Tank)</option>
                    <option value="4/8 (1/2)">4/8 (1/2 Tank)</option>
                    <option value="2/8 (1/4)">2/8 (1/4 Tank)</option>
                    <option value="1/8 (Reserve)">1/8 (Reserve Tank)</option>
                  </select>
                  <span className="text-[11px] text-[#65727B] mt-0.5 block">
                    Departed with: <strong className="text-[#24313A]">{booking.fuelLevelOut || '8/8 Full'}</strong>
                  </span>
                </div>
              </div>

              {/* FUEL SHORTFALL WARNING */}
              {hasFuelShortfall && (
                <div className="p-3 bg-[#FDEDEC] rounded-lg border border-[#F8D7D5] text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#B9534F] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#B9534F] block">
                      Fuel Shortfall Detected ({fuelOutFraction - fuelInFraction}/8 Tank Missing)
                    </span>
                    <p className="text-[#7A2724] text-[11px] mt-0.5">
                      Vehicle departed with <strong>{booking.fuelLevelOut || '8/8 Full'}</strong> but returned with{' '}
                      <strong>{fuelLevelIn}</strong>. According to policy, a refueling fee may be settled with the customer before releasing their deposit.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                  Return Condition Summary
                </label>
                <input
                  type="text"
                  value={conditionNotesIn}
                  onChange={(e) => setConditionNotesIn(e.target.value)}
                  className="w-full text-sm p-2.5 rounded-lg border border-[#DCE2E6] focus:outline-none focus:border-[#4F7D61] focus:ring-1 focus:ring-[#4F7D61] bg-white text-[#24313A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider">
                    New Damage Observed (if any)
                  </label>
                  <span className="text-[11px] text-[#65727B]">Must be distinct from baseline</span>
                </div>
                <input
                  type="text"
                  value={damageNotesIn}
                  onChange={(e) => setDamageNotesIn(e.target.value)}
                  placeholder="None, or describe any new scratches, dents, or broken items..."
                  className={`w-full text-sm p-2.5 rounded-lg border focus:outline-none bg-white text-[#24313A] ${
                    damageNotesIn && damageNotesIn.toLowerCase() !== 'no new damage observed.' && damageNotesIn.toLowerCase() !== 'none'
                      ? 'border-[#B9534F] focus:border-[#B9534F] focus:ring-1 focus:ring-[#B9534F]'
                      : 'border-[#DCE2E6] focus:border-[#4F7D61]'
                  }`}
                />
              </div>

              {/* Post-Return Status */}
              <div className="p-3.5 rounded-lg bg-[#F8F9FA] border border-[#DCE2E6]">
                <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-2">
                  Post-Return Fleet Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      finalVehicleStatus === 'available'
                        ? 'bg-white border-[#4F7D61] ring-1 ring-[#4F7D61] text-[#24313A] font-semibold'
                        : 'bg-white/60 border-[#DCE2E6] text-[#65727B]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="finalStatus"
                      value="available"
                      checked={finalVehicleStatus === 'available'}
                      onChange={() => setFinalVehicleStatus('available')}
                      className="text-[#4F7D61]"
                    />
                    <span>Available (Ready for next rental)</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 cursor-pointer transition-all ${
                      finalVehicleStatus === 'in_service'
                        ? 'bg-white border-[#B86645] ring-1 ring-[#B86645] text-[#24313A] font-semibold'
                        : 'bg-white/60 border-[#DCE2E6] text-[#65727B]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="finalStatus"
                      value="in_service"
                      checked={finalVehicleStatus === 'in_service'}
                      onChange={() => setFinalVehicleStatus('in_service')}
                      className="text-[#B86645]"
                    />
                    <span>In Service (Needs valet/repair)</span>
                  </label>
                </div>

                {finalVehicleStatus === 'in_service' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={serviceReason}
                      onChange={(e) => setServiceReason(e.target.value)}
                      placeholder="Specify service required: e.g. Deep upholstery valet, replace wiper blades..."
                      className="w-full text-xs p-2 rounded-lg border border-[#DCE2E6] bg-white focus:outline-none focus:border-[#B86645]"
                    />
                  </div>
                )}
              </div>

              {/* Return Photos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider">
                    Return Photos ({uploadedPhotos.length})
                  </label>
                  <button
                    type="button"
                    onClick={()=>photoInput.current?.click()}
                    className="text-xs text-[#35658A] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> + Add Return Photo
                  </button>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {uploadedPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-16 rounded-lg overflow-hidden border border-[#DCE2E6] flex-shrink-0 group"
                    >
                      <img src={photoUrl} alt="Inspection" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setLightboxPhoto({
                            url: photoUrl,
                            title: `Return Inspection Photo #${idx + 1}`,
                          })
                        }
                        className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE2E6]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#4F7D61] hover:bg-[#436C54] disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Processing Return...' : 'Sign-Off & Complete Check-In'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SIDE-BY-SIDE AUDIT VIEW */}
          {activeTab === 'comparison' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F4F6F7] rounded-lg border border-[#DCE2E6] flex items-center gap-2 text-[#24313A]">
                <Info className="w-4 h-4 text-[#35658A] flex-shrink-0" />
                <span>
                  Compare vehicle condition between Handover Departure and Check-In Return side-by-side to verify wear, mileage, fuel, and avoid misunderstandings.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Column 1: Departure */}
                <div className="p-4 rounded-xl border border-[#CCE0D5] bg-[#F7FAF8] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#D8E6DE]">
                    <span className="font-bold text-[#4F7D61] uppercase tracking-wider text-[11px]">
                      1. Handover Departure
                    </span>
                    <span className="text-[10px] text-[#65727B]">
                      {booking.checkedOutAt ? new Date(booking.checkedOutAt).toLocaleDateString() : 'Baseline'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">Odometer</span>
                    <span className="font-bold text-sm text-[#24313A]">
                      {booking.mileageOut ? `${booking.mileageOut.toLocaleString()} km` : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">Fuel Level</span>
                    <span className="font-bold text-sm text-[#24313A]">
                      {booking.fuelLevelOut || '8/8 Full'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">General Condition</span>
                    <span className="text-xs text-[#24313A] font-medium block">
                      {booking.conditionNotesOut || 'Spotless handover'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FEF9E7] border border-[#FAD7A0]">
                    <span className="text-[#7D5A00] font-bold text-[10px] uppercase block">
                      Pre-Existing Damage Agreed
                    </span>
                    <span className="text-xs text-[#5C4300] block mt-0.5">
                      {booking.damageNotesOut || 'None'}
                    </span>
                  </div>

                  {booking.checkoutPhotos && booking.checkoutPhotos.length > 0 && (
                    <div>
                      <span className="text-[#65727B] text-[10px] uppercase block mb-1">
                        Departure Photos ({booking.checkoutPhotos.length})
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {booking.checkoutPhotos.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Departure"
                            onClick={() => setLightboxPhoto({ url: img, title: `Departure Photo #${i + 1}` })}
                            className="w-14 h-12 rounded object-cover border border-[#CCE0D5] cursor-pointer hover:opacity-80"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Column 2: Return */}
                <div className="p-4 rounded-xl border border-[#DCE2E6] bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#DCE2E6]">
                    <span className="font-bold text-[#17324D] uppercase tracking-wider text-[11px]">
                      2. Check-In Return
                    </span>
                    <span className="text-[10px] text-[#4F7D61] font-semibold">Current Inspection</span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">Odometer</span>
                    <span className="font-bold text-sm text-[#24313A] flex items-center gap-2">
                      {mileageIn.toLocaleString()} km
                      <span className="text-[10px] font-normal text-[#35658A]">
                        (+{kmDriven} km driven)
                      </span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">Fuel Level</span>
                    <span className={`font-bold text-sm ${hasFuelShortfall ? 'text-[#B9534F]' : 'text-[#24313A]'}`}>
                      {fuelLevelIn}
                      {hasFuelShortfall && (
                        <span className="text-[10px] font-normal text-[#B9534F] block">
                          ⚠️ Shortfall vs Departure
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block">Return Condition</span>
                    <span className="text-xs text-[#24313A] font-medium block">
                      {conditionNotesIn}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    damageNotesIn && damageNotesIn.toLowerCase() !== 'no new damage observed.' && damageNotesIn.toLowerCase() !== 'none'
                      ? 'bg-[#FDEDEC] border-[#F8D7D5] text-[#7A2724]'
                      : 'bg-[#EEF5F1] border-[#CCE0D5] text-[#24313A]'
                  }`}>
                    <span className="font-bold text-[10px] uppercase block">
                      New Damages Observed
                    </span>
                    <span className="text-xs block mt-0.5">
                      {damageNotesIn || 'None'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#65727B] text-[10px] uppercase block mb-1">
                      Return Photos ({uploadedPhotos.length})
                    </span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {uploadedPhotos.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Return"
                          onClick={() => setLightboxPhoto({ url: img, title: `Return Photo #${i + 1}` })}
                          className="w-14 h-12 rounded object-cover border border-[#DCE2E6] cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="px-4 py-2 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] hover:bg-[#E5E9EC] rounded-lg cursor-pointer"
                >
                  ← Back to Checklist Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-[#DCE2E6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#17324D] text-white">
              <span className="text-xs font-semibold">{lightboxPhoto.title}</span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={lightboxPhoto.url}
                alt="Inspection Enlarged"
                className="max-h-[68vh] max-w-full object-contain rounded"
              />
            </div>
            <div className="p-3 bg-white text-[11px] text-[#65727B] flex items-center justify-between">
              <span>Verified Handover Record · {booking.reference}</span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="px-3 py-1 bg-[#F4F6F7] hover:bg-[#EAEFF2] text-[#24313A] rounded font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
