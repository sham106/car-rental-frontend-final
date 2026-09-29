import { uploadFile } from '../../services/api';
import React, { useState, useEffect, useRef } from 'react';
import { X, Car, Upload, Plus, Trash2, AlertCircle, Check, Image as ImageIcon, Star, Loader2, Link as LinkIcon, RotateCcw } from 'lucide-react';
import { AdminVehicle, AdminCategory, AdminOperationalStatus } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { adminVehicleService } from '../../services/admin/adminVehicleService';
import { RecordEditor } from '../../components/admin/RecordEditor';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AddVehicleModalProps {
  vehicleToEdit?: AdminVehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: AdminVehicle) => Promise<void>;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  vehicleToEdit,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { owners, refreshAll } = useAdminData();

  const [addingOwner, setAddingOwner] = useState(false);

  // Form Fields
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');
  const [engineNumber, setEngineNumber] = useState('');
  const [category, setCategory] = useState<AdminCategory>('suv');
  const [seats, setSeats] = useState<number>(5);
  const [luggageCapacity, setLuggageCapacity] = useState<number>(3);
  const [doors, setDoors] = useState<number>(5);
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuelType, setFuelType] = useState<'Petrol' | 'Diesel' | 'Hybrid' | 'Electric'>('Hybrid');
  const [airConditioning, setAirConditioning] = useState(true);

  // Commercial
  const [dailyRate, setDailyRate] = useState<number>(2200);
  const [ownerId, setOwnerId] = useState('');
  const [purchaseValue, setPurchaseValue] = useState<number | ''>('');
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState('');

  // Operational
  const [mileage, setMileage] = useState<number>(0);
  const [nextServiceMileage, setNextServiceMileage] = useState<number>(20000);
  const [operationalStatus, setOperationalStatus] = useState<AdminOperationalStatus>('available');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState(
    ''
  );

  const [photos, setPhotos] = useState<string[]>(
    vehicleToEdit?.photos?.length
      ? vehicleToEdit.photos
      : []
  );
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Populate on edit
  useEffect(() => {
    if (vehicleToEdit) {
      setBrand(vehicleToEdit.brand);
      setModel(vehicleToEdit.model);
      setYear(vehicleToEdit.year);
      setColor(vehicleToEdit.color);
      setRegistrationNumber(vehicleToEdit.registrationNumber);
      setVin(vehicleToEdit.vin);
      setEngineNumber(vehicleToEdit.engineNumber || '');
      setCategory(vehicleToEdit.category as AdminCategory);
      setSeats(vehicleToEdit.seats);
      setLuggageCapacity(vehicleToEdit.luggageCapacity || 3);
      setDoors(vehicleToEdit.doors || 4);
      setTransmission(vehicleToEdit.transmission as 'Automatic' | 'Manual');
      setFuelType(vehicleToEdit.fuelType as 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric');
      setAirConditioning(vehicleToEdit.airConditioning);
      setDailyRate(vehicleToEdit.dailyRate);
      setOwnerId(vehicleToEdit.ownerId);
      setPurchaseValue(vehicleToEdit.purchaseValue ?? 0);
      setCurrentValue(vehicleToEdit.currentValue ?? 0);
      setPurchaseDate(vehicleToEdit.purchaseDate || '');
      setMileage(vehicleToEdit.mileage);
      setNextServiceMileage(vehicleToEdit.nextServiceMileage || vehicleToEdit.mileage + 10000);
      setOperationalStatus(vehicleToEdit.operationalStatus);
      setPublished(vehicleToEdit.published);
      setFeatured(vehicleToEdit.featured);
      setDescription(vehicleToEdit.description);
      setPhotos(vehicleToEdit.photos?.length ? vehicleToEdit.photos : []);
    } else {
      setPhotos([]);
    }
  }, [vehicleToEdit]);



  if (!isOpen) return null;

  const processImageFile = async (file: File): Promise<string> => (await uploadFile(file, 'photo')).url;

  const handleFilesUpload = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    setIsProcessingImages(true);
    try {
      const promises = files.map((f) => processImageFile(f));
      const processed = (await Promise.all(promises)).filter(Boolean);
      if (processed.length > 0) {
        setPhotos((prev) => [...prev, ...processed]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload images.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleAddPhotoFromUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim() || !model.trim() || !registrationNumber.trim() || !vin.trim() || !color.trim() || !engineNumber.trim() || !ownerId || !purchaseDate || purchaseValue === '') {
      setError('Complete the vehicle identification, owner, purchase date and purchase value before saving.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const ownerObj = owners.find((o) => o.id === ownerId);
      if (!ownerObj) throw new Error('Select a registered owner or add one.');
      const ownerName = ownerObj.name;

      const finalPhotos = photos;

      let savedVehicle: AdminVehicle;
      if (vehicleToEdit) {
        savedVehicle = await adminVehicleService.updateVehicle(vehicleToEdit.id, {
          version: vehicleToEdit.version,
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          color: color.trim(),
          registrationNumber: registrationNumber.trim(),
          vin: vin.trim(),
          engineNumber: engineNumber.trim(),
          category,
          seats: Number(seats),
          luggageCapacity: Number(luggageCapacity),
          doors: Number(doors),
          transmission,
          fuelType,
          airConditioning,
          dailyRate: Number(dailyRate),
          ownerId,
          ownerName,
          purchaseValue: Number(purchaseValue),
          currentValue: Number(currentValue),
          purchaseDate,
          mileage: Number(mileage),
          nextServiceMileage: Number(nextServiceMileage),
          operationalStatus,
          published,
          featured,
          description: description.trim(),
          photos: finalPhotos,
        });
      } else {
        const slug = `${brand.toLowerCase()}-${model.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
        savedVehicle = await adminVehicleService.createVehicle({
          slug,
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          color: color.trim(),
          registrationNumber: registrationNumber.trim(),
          vin: vin.trim(),
          engineNumber: engineNumber.trim(),
          category,
          seats: Number(seats),
          luggageCapacity: Number(luggageCapacity),
          doors: Number(doors),
          transmission,
          fuelType,
          airConditioning,
          dailyRate: Number(dailyRate),
          ownerId,
          ownerName,
          purchaseValue: Number(purchaseValue),
          currentValue: Number(currentValue),
          purchaseDate,
          mileage: Number(mileage),
          nextServiceMileage: Number(nextServiceMileage),
          operationalStatus,
          published,
          featured,
          description: description.trim(),
          photos: finalPhotos,
          features: ['Air Conditioning', 'Power Steering', 'Bluetooth', 'Reverse Camera', 'ABS'],
        });
      }

      await onSuccess(savedVehicle);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to save vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#17324D] text-white">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#24313A]">
                {vehicleToEdit ? `Edit Vehicle: ${vehicleToEdit.registrationNumber}` : 'Register New Fleet Vehicle'}
              </h3>
              <p className="text-xs text-[#65727B] mt-0.5">
                Full operational specifications, legal records, and commercial attributes
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {!vehicleToEdit && <div className="rounded-lg bg-[#F1F6FA] p-3 text-sm">
            <strong>1. Register vehicle → 2. Add compliance → 3. Record service history</strong>
            <p className="mt-1 text-xs">Save to open the car profile and complete its documents and maintenance. New cars start hidden from the website; publish when ready. Assignments and bookings are recorded from the profile.</p>
          </div>}
          {/* Section 1: Identification & Specs */}
          <div>
            <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider mb-3 pb-1 border-b border-[#DCE2E6]">
              1. Vehicle Identification & Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Brand <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                  placeholder="e.g. Toyota"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Model <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  placeholder="e.g. Corolla Cross"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Year of Manufacture
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Registration Number <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                  placeholder="e.g. 2841 JL 23"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A] font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  VIN (Chassis #) <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  required
                  placeholder="17-character VIN"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Engine Number
                </label>
                <input
                  type="text"
                  required
                  aria-label="Engine number"
                  value={engineNumber}
                  onChange={(e) => setEngineNumber(e.target.value)}
                  placeholder="Engine block code"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AdminCategory)}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                >
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="economy">Economy</option>
                  <option value="van">Van / 7-Seater</option>
                  <option value="compact">Compact</option>
                  <option value="premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Color</label>
                <input
                  type="text"
                  required
                  aria-label="Color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Polar White"
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value as 'Automatic' | 'Manual')}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Fuel Type</label>
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid (Petrol/Electric)</option>
                  <option value="Electric">Electric (EV)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Passenger Seats</label>
                <input
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  min={2}
                  max={12}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Luggage Capacity (Bags)</label>
                <input
                  type="number"
                  value={luggageCapacity}
                  onChange={(e) => setLuggageCapacity(Number(e.target.value))}
                  min={1}
                  max={8}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ownership & Commercial Values */}
          <div>
            <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider mb-3 pb-1 border-b border-[#DCE2E6]">
              2. Ownership, Commercial & Valuation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Registered Fleet Owner <span className="text-[#B9534F]">*</span>
                </label>
                <select
                  aria-label="Registered fleet owner"
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                >
                  <option value="">Choose an owner</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.ownerType})
                    </option>
                  ))}
                </select>
                <button type="button" className="mt-2 text-[#35658A] underline" onClick={() => setAddingOwner(true)}>Add owner without leaving this form</button>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Daily Rental Rate (Rs) <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="number"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Purchase Date *</label>
                <input
                  type="date"
                  required
                  aria-label="Purchase date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Purchase Value (Rs)
                </label>
                <input
                  type="number"
                  required
                  aria-label="Purchase value (Rs)"
                  min={0}
                  step="0.01"
                  value={purchaseValue}
                  onChange={(e) => setPurchaseValue(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Current Market Value (Rs)
                </label>
                <input
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Operational Status & Mileage */}
          <div>
            <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider mb-3 pb-1 border-b border-[#DCE2E6]">
              3. Operational Status & Maintenance Proximity
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Current Odometer Mileage (km) <span className="text-[#B9534F]">*</span>
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">
                  Next Service Due Mileage (km)
                </label>
                <input
                  type="number"
                  value={nextServiceMileage}
                  onChange={(e) => setNextServiceMileage(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Initial Status</label>
                <select
                  disabled={Boolean(vehicleToEdit)}
                  value={operationalStatus}
                  onChange={(e) => setOperationalStatus(e.target.value as AdminOperationalStatus)}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                >
                  <option value="available">Available (Ready for hire)</option>
                  {vehicleToEdit && ['reserved', 'rented', 'assigned'].includes(operationalStatus) && <option value={operationalStatus}>{operationalStatus}</option>}
                  <option value="in_service">In Service</option>
                  <option value="compliance_hold">Compliance Hold</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Public Website Visibility */}
          <div>
            <h4 className="text-xs font-bold text-[#24313A] uppercase tracking-wider mb-3 pb-1 border-b border-[#DCE2E6]">
              4. Customer Website Listing & Photos
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#24313A]">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 text-[#35658A] rounded"
                  />
                  <span>Publish immediately to customer booking website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-[#24313A]">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-[#35658A] rounded"
                  />
                  <span>Highlight as Featured vehicle</span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#24313A] mb-1">Commercial Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2 rounded-lg border border-[#DCE2E6] bg-white text-xs text-[#24313A]"
                />
              </div>

              {/* Photos Upload & Gallery Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#24313A] text-xs">
                    Vehicle Gallery Images ({photos.length})
                  </label>
                  <div className="flex items-center gap-2">
                    {photos.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setPhotos([])}
                        className="text-[11px] text-[#B9534F] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Clear all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-[11px] text-[#35658A] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {showUrlInput ? 'Hide URL input' : 'Paste image URL instead'}
                    </button>
                  </div>
                </div>

                {/* Primary Upload Dropzone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.length) {
                      await handleFilesUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-[#17324D] bg-[#EBF2F7] scale-[1.01]'
                      : 'border-[#CAD5DF] bg-[#F8F9FA] hover:bg-[#F0F4F8] hover:border-[#35658A]'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    multiple
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        handleFilesUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                    className="hidden"
                  />

                  {isProcessingImages ? (
                    <div className="flex flex-col items-center gap-2 py-2 text-[#17324D]">
                      <Loader2 className="w-8 h-8 animate-spin text-[#35658A]" />
                      <span className="text-xs font-semibold">Optimizing and preparing uploaded photos...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-[#EAEFF4] flex items-center justify-center text-[#17324D]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#24313A]">
                          Click to browse vehicle photos or drag & drop here
                        </p>
                        <p className="text-[11px] text-[#65727B] mt-0.5">
                          Upload multiple files (PNG, JPG, WEBP) · Client-compressed for fast website loading
                        </p>
                      </div>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1.5 bg-white border border-[#CAD5DF] hover:bg-[#F4F6F7] text-xs font-semibold text-[#24313A] rounded-lg shadow-xs pointer-events-none"
                      >
                        Select from Computer / Device
                      </button>
                    </>
                  )}
                </div>

                {/* Optional URL input toggle */}
                {showUrlInput && (
                  <div className="p-3 bg-[#F4F6F7] rounded-lg border border-[#DCE2E6] space-y-2 animate-in fade-in duration-150">
                    <div className="text-[11px] font-semibold text-[#24313A]">Attach Photo via External URL:</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={newPhotoUrl}
                        onChange={(e) => setNewPhotoUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="p-2 text-xs border border-[#DCE2E6] rounded-lg flex-1 bg-white text-[#24313A]"
                      />
                      <button
                        type="button"
                        onClick={handleAddPhotoFromUrl}
                        disabled={!newPhotoUrl.trim()}
                        className="px-3 py-2 bg-[#17324D] hover:bg-[#1F4366] disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add URL
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploaded Photos Preview Gallery */}
                {photos.length > 0 ? (
                  <div>
                    <div className="text-[11px] text-[#65727B] mb-2 flex items-center justify-between">
                      <span>Preview Gallery (First photo is used as Primary Cover on website):</span>
                      <span className="font-semibold text-[#24313A]">{photos.length} image{photos.length > 1 ? 's' : ''} attached</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {photos.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-xl overflow-hidden border group aspect-4/3 bg-slate-100 ${
                            idx === 0 ? 'ring-2 ring-[#35658A] border-transparent shadow-xs' : 'border-[#DCE2E6]'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Vehicle photo ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge */}
                          {idx === 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-[#17324D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Cover Photo
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCover(idx)}
                                className="p-1.5 bg-white text-[#17324D] hover:bg-[#EAEFF4] rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Set as Main Cover Photo"
                              >
                                <Star className="w-3 h-3" /> Make Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="p-1.5 bg-[#B9534F] text-white hover:bg-[#A84440] rounded-lg shadow-xs cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add more tile */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl border-2 border-dashed border-[#CAD5DF] hover:border-[#35658A] hover:bg-[#F0F4F8] aspect-4/3 flex flex-col items-center justify-center gap-1 text-[#65727B] hover:text-[#17324D] transition-colors cursor-pointer"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-[11px] font-semibold">Add More</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#65727B] bg-[#F8F9FA] p-2.5 rounded-lg border border-[#E5E9EC] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#8C9BA5] flex-shrink-0" />
                    <span>No photos uploaded yet. Drop photos above or select from your computer. (A clean default vehicle image will be used if none are uploaded).</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-xs text-[#B9534F] bg-[#FDEDEC] rounded-lg border border-[#F8D7D5] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DCE2E6] flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImages}
              className="px-5 py-2 text-sm font-medium text-white bg-[#17324D] hover:bg-[#1F4366] disabled:opacity-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving Fleet Data...' : vehicleToEdit ? 'Update Vehicle' : 'Save & Continue to Vehicle Profile'}
            </button>
          </div>
        </form>
      </div>
      {addingOwner && <RecordEditor resource="owners" onClose={() => setAddingOwner(false)} onSaved={refreshAll} onCreated={owner => setOwnerId(owner.id)} />}
    </div>
  );
};
