import React, { useState } from 'react';
import { FileText, Upload, Plus, Search, Download, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { UploadDocumentModal } from '../../components/admin/UploadDocumentModal';
import { adminDocumentService } from '../../services/admin/adminDocumentService';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const DocumentsView: React.FC = () => {
  const { documents, vehicles, refreshAll } = useAdminData();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<typeof documents[0] | null>(null);

  const filtered = documents.filter((d) => {
    if (typeFilter !== 'all' && d.documentType !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.vehicleReg.toLowerCase().includes(q) ||
        d.vehicleName.toLowerCase().includes(q) ||
        d.documentType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this vehicle document record?')) {
      await adminDocumentService.deleteDocument(id);
      await refreshAll();
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Vehicle Digital Documents
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Centralized digital archive for insurance policies, fitness certificates, invoices, and legal records
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Control Bar */}
      <div
        className="p-3.5 rounded-xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title, vehicle registration..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
          >
            <option value="all">All Document Types</option>
            <option value="Insurance Certificate">Insurance Certificate</option>
            <option value="Fitness Certificate">Fitness Certificate</option>
            <option value="MVL">MVL</option>
            <option value="Purchase Document">Purchase Document</option>
            <option value="Service Invoice">Service Invoice</option>
            <option value="Rental Agreement">Rental Agreement</option>
          </select>
          <span className="text-xs text-[#65727B]">
            <strong>{filtered.length}</strong> files
          </span>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-[#65727B] bg-white rounded-xl border border-[#DCE2E6]">
            No documents found in this category.
          </div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border bg-white shadow-2xs flex flex-col justify-between hover:border-[#35658A] transition-all group"
              style={{ borderColor: ADMIN_THEME.border }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-lg bg-[#F1F4F6] text-[#17324D] group-hover:bg-[#EDF4F8] group-hover:text-[#35658A] transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700">
                    {d.documentType}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-[#24313A] mt-3 leading-snug">
                  {d.title}
                </h3>
                <div className="text-xs text-[#35658A] font-medium mt-1">
                  {d.vehicleReg} ({d.vehicleName})
                </div>

                <div className="mt-3 pt-3 border-t border-[#E5E9EC] text-[11px] text-[#65727B] space-y-1">
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium text-[#24313A]">
                      {new Date(d.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {d.expiryDate && (
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className="font-medium text-[#24313A]">{d.expiryDate}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="font-mono text-[#24313A]">{d.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E9EC] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(d)}
                  className="text-[#35658A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
                  className="text-[#B9534F] hover:text-[#913D39] p-1 cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <UploadDocumentModal
        vehicle={null}
        vehiclesList={vehicles}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Private Document Preview */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden border border-[#DCE2E6]">
            <div className="px-6 py-4 border-b border-[#DCE2E6] flex items-center justify-between bg-[#F4F6F7]">
              <div>
                <h3 className="font-semibold text-sm text-[#24313A]">{previewDoc.title}</h3>
                <span className="text-xs text-[#65727B]">
                  {previewDoc.vehicleReg} · {previewDoc.documentType} ({previewDoc.fileSize})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-[#65727B] hover:text-[#24313A] p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-[#DCE2E6] flex items-center justify-center relative">
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="bg-white/90 px-4 py-2 rounded-lg text-xs font-semibold text-[#24313A] shadow-md">
                    Verified Digital Copy on File
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#65727B] italic">{previewDoc.notes}</p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 text-xs font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
