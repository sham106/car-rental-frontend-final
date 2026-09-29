import { uploadFile } from '../../services/api';
import React, { useState } from 'react';
import { X, FileText, Upload, Check, AlertCircle } from 'lucide-react';
import { AdminVehicle, DocumentType, ComplianceRecord } from '../../types/admin';
import { adminDocumentService } from '../../services/admin/adminDocumentService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface UploadDocumentModalProps {
  vehicle: AdminVehicle | null;
  vehiclesList?: AdminVehicle[];
  initialDocumentType?: DocumentType;
  renewalRecord?: ComplianceRecord;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

const DOC_TYPES: DocumentType[] = [
  'Insurance Certificate',
  'Fitness Certificate',
  'MVL',
  'Licence',
  'Purchase Document',
  'Service Invoice',
  'Inspection',
  'Rental Agreement',
  'Other',
];

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  vehicle,
  vehiclesList = [],
  initialDocumentType = 'Insurance Certificate',
  renewalRecord,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicle?.id || '');
  const [documentType, setDocumentType] = useState<DocumentType>('Insurance Certificate');
  const [title, setTitle] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [company, setCompany] = useState('');
  const [broker, setBroker] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [premium, setPremium] = useState('');
  const isCompliance = ['Insurance Certificate', 'Fitness Certificate', 'MVL', 'Licence'].includes(documentType);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedVehicleId(vehicle?.id || '');
    setDocumentType(initialDocumentType);
    setTitle(initialDocumentType);
    setIssueDate(''); setExpiryDate(''); setNotes('');
    setCompany(renewalRecord?.company || renewalRecord?.provider || '');
    setBroker(renewalRecord?.broker || '');
    setPolicyNumber(renewalRecord?.policyNumber || '');
    setPremium(renewalRecord?.premium == null ? '' : String(renewalRecord.premium));
    setSelectedFile(null); setError('');
  }, [isOpen, vehicle?.id, initialDocumentType, renewalRecord?.id]);

  if (!isOpen) return null;

  const currentVehicle = vehicle || vehiclesList.find((v) => v.id === selectedVehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle) {
      setError('Please select a vehicle.');
      return;
    }
    if (isCompliance && (!issueDate || !expiryDate)) { setError('Enter the issue and expiry dates for this certification.'); return; }
    if (issueDate && expiryDate && expiryDate < issueDate) { setError('Expiry must be on or after issue date.'); return; }
    if (documentType === 'Insurance Certificate' && (!company.trim() || !policyNumber.trim() || premium === '')) { setError('Enter the insurance company, policy number and premium. Enter 0 if there is no premium.'); return; }
    if (!selectedFile) { setError('Select a PDF or image to upload.'); return; }
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const uploaded = await uploadFile(selectedFile, 'document');
      await adminDocumentService.createDocument({
        vehicleId: currentVehicle.id,
        vehicleReg: currentVehicle.registrationNumber,
        vehicleName: `${currentVehicle.brand} ${currentVehicle.model}`,
        documentType,
        title: title.trim(),
        issueDate,
        expiryDate,
        fileId: uploaded.id,
        ...(isCompliance ? { compliance: { company: company.trim(), broker: documentType === 'Insurance Certificate' ? broker.trim() : '', policyNumber: policyNumber.trim(), premium: documentType === 'Insurance Certificate' ? Number(premium) : 0 } } : {}),
        notes: notes.trim(),
      });
      await onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to upload document');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#17324D] text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#24313A]">{renewalRecord ? 'Renew Certification' : 'Upload Fleet Document'}</h3>
              <p className="text-xs text-[#65727B] mt-0.5">Attach digital records, policies, and inspections</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                onChange={(e) => setSelectedVehicleId(e.target.value)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Document Type
              </label>
              <select
                value={documentType}
                onChange={(e) => { setDocumentType(e.target.value as DocumentType); setTitle(e.target.value); setCompany(''); setBroker(''); setPolicyNumber(''); setPremium(''); }}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Document Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Issue Date
              </label>
              <input
                type="date"
                required={isCompliance}
                aria-label="Issue date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
                Expiry Date (if applicable)
              </label>
              <input
                type="date"
                required={isCompliance}
                aria-label="Expiry date"
                min={issueDate || undefined}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full text-sm p-2 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
              />
            </div>
          </div>

          {isCompliance && <fieldset className="space-y-3 rounded-lg border border-[#DCE2E6] p-3">
            <legend className="font-semibold text-sm">Certification details</legend>
            <p className="text-xs text-[#65727B]">This upload also records the certification and its expiry in Compliance.</p>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">{documentType === 'Insurance Certificate' ? 'Insurance Company' : 'Issuing Authority'}<input className="w-full border rounded p-2 mt-1" required={documentType === 'Insurance Certificate'} value={company} onChange={e => setCompany(e.target.value)} /></label>
              <label className="text-xs">{documentType === 'Insurance Certificate' ? 'Policy Number' : 'Certificate Number'}<input className="w-full border rounded p-2 mt-1" required={documentType === 'Insurance Certificate'} value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} /></label>
              {documentType === 'Insurance Certificate' && <>
                <label className="text-xs">Broker (optional)<input className="w-full border rounded p-2 mt-1" value={broker} onChange={e => setBroker(e.target.value)} /></label>
                <label className="text-xs">Insurance Premium (Rs)<input type="number" min="0" step="0.01" className="w-full border rounded p-2 mt-1" required value={premium} onChange={e => setPremium(e.target.value)} /></label>
              </>}
            </div>
          </fieldset>}
          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              File Attachment
            </label>
            <div className="p-4 border-2 border-dashed border-[#DCE2E6] rounded-xl flex flex-col items-center justify-center text-center bg-[#F8F9FA]">
              <Upload className="w-8 h-8 text-[#65727B] mb-2" />
              <input aria-label="Document file" key={`${isOpen}-${vehicle?.id || selectedVehicleId}`} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              <div className="text-xs font-medium text-[#24313A]">
                {selectedFile ? (
                  <span className="text-[#4F7D61] font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4 inline" /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                ) : (
                  'Choose a PDF or image to attach'
                )}
              </div>
              <p className="text-[11px] text-[#65727B] mt-1">Supports PDF, JPG, PNG and WebP up to 10 MB</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#24313A] uppercase tracking-wider mb-1">
              Document Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Original signed contract filed with legal department..."
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
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
