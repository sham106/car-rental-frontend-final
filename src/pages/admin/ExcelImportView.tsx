import React, { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Car } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { adminImportService, ParsedImportRow } from '../../services/admin/adminImportService';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const ExcelImportView: React.FC = () => {
  const { vehicles, refreshAll } = useAdminData();
  const [parsedRows, setParsedRows] = useState<ParsedImportRow[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const existingRegs = vehicles.map((v) => v.registrationNumber);

  const handleLoadSample = () => {
    const sample = adminImportService.generateSampleRows();
    const validated = adminImportService.validateRows(sample, existingRegs);
    setParsedRows(validated);
    setImportStatus(null);
  };

  const handleDownloadTemplate = () => {
    const csvContent = adminImportService.getTemplateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'oceane-fleet-import-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    // For prototype simulation, load and parse sample data with realistic feedback
    handleLoadSample();
  };

  const handleConfirmImport = async () => {
    try {
      setIsImporting(true);
      const res = await adminImportService.commitImport(parsedRows);
      await refreshAll();
      setImportStatus(`Successfully imported ${res.importedCount} vehicles into active fleet!`);
      setParsedRows([]);
    } finally {
      setIsImporting(false);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Excel & CSV Fleet Migration
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Bulk onboard vehicles from legacy operational spreadsheets, partner lists, or fleet inventories
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-2 text-xs font-medium text-[#24313A] bg-white border border-[#DCE2E6] hover:bg-[#F4F6F7] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#65727B]" />
            <span>Download CSV Template</span>
          </button>
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Load Sample Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleFileDrop}
        className="p-8 rounded-xl border-2 border-dashed bg-white text-center hover:bg-[#F9FBFC] transition-colors cursor-pointer"
        style={{ borderColor: ADMIN_THEME.border }}
        onClick={handleLoadSample}
      >
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#F1F4F6] text-[#17324D] flex items-center justify-center mb-3">
          <Upload className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#24313A]">
          Drop your vehicle inventory (.xlsx, .csv) here or click to browse
        </h3>
        <p className="text-xs text-[#65727B] mt-1">
          Supports Mauritian registration formats, chassis VINs, odometer readings, and commercial rates
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#35658A]">
          <span>(Click here to test instant sample parsing)</span>
        </div>
      </div>

      {/* Success Banner */}
      {importStatus && (
        <div className="p-4 rounded-xl bg-[#EEF5F1] border border-[#CCE0D5] text-[#4F7D61] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Data Grid Preview */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-[#DCE2E6] shadow-2xs">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-[#65727B]">Parsed Rows:</span>{' '}
                <strong className="text-[#24313A]">{parsedRows.length}</strong>
              </div>
              <div className="flex items-center gap-1 text-[#4F7D61]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{validRows.length} Ready to Import</span>
              </div>
              {invalidRows.length > 0 && (
                <div className="flex items-center gap-1 text-[#B9534F]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{invalidRows.length} Warnings / Conflicts</span>
                </div>
              )}
            </div>

            <button
              type="button"
              disabled={validRows.length === 0 || isImporting}
              onClick={handleConfirmImport}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#4F7D61] hover:bg-[#436C54] disabled:opacity-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Committing to Fleet...</span>
                </>
              ) : (
                <>
                  <span>Commit {validRows.length} Vehicles to Fleet</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Table */}
          <div
            className="rounded-xl border bg-white overflow-hidden shadow-2xs"
            style={{ borderColor: ADMIN_THEME.border }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#DCE2E6] bg-[#F8F9FA] text-[#65727B] font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-3">Brand & Model</th>
                    <th className="py-3 px-3">Year / Color</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Mileage</th>
                    <th className="py-3 px-3">Daily Rate</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-4 text-right">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9EC]">
                  {parsedRows.map((r, idx) => (
                    <tr key={idx} className={`hover:bg-[#F9FBFC] ${!r.isValid ? 'bg-[#FFF9F9]' : ''}`}>
                      <td className="py-3 px-4 font-mono font-semibold text-[#24313A]">
                        {r.registrationNumber}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#24313A]">
                        {r.brand} {r.model}
                      </td>
                      <td className="py-3 px-3 text-[#65727B]">
                        {r.year} · {r.color}
                      </td>
                      <td className="py-3 px-3 capitalize">{r.category}</td>
                      <td className="py-3 px-3">{r.mileage.toLocaleString()} km</td>
                      <td className="py-3 px-3 font-semibold text-[#24313A]">
                        Rs {r.dailyRate.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[#65727B]">{r.ownerName}</td>
                      <td className="py-3 px-4 text-right">
                        {r.isValid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EEF5F1] text-[#4F7D61]">
                            Valid
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FDEDEC] text-[#B9534F]" title={r.errors?.join(', ')}>
                            {r.errors?.[0] || 'Error'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
