import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Search, AlertTriangle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { UploadDocumentModal } from '../../components/admin/UploadDocumentModal';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const ComplianceView: React.FC = () => {
  const { compliance, vehicles, refreshAll } = useAdminData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tabFilter, setTabFilter] = useState<'all' | 'expired' | 'next30' | 'valid'>('all');

  const now = new Date().getTime();

  const expiredList = compliance.filter((c) => c.status === 'Expired');
  const expiringSoonList = compliance.filter((c) => c.status === 'Expiring Soon');
  const validList = compliance.filter((c) => c.status === 'Valid');

  const filtered = compliance.filter((c) => {
    if (tabFilter === 'expired' && c.status !== 'Expired') return false;
    if (tabFilter === 'next30' && c.status !== 'Expiring Soon') return false;
    if (tabFilter === 'valid' && c.status !== 'Valid') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.vehicleReg.toLowerCase().includes(q) ||
        c.vehicleName.toLowerCase().includes(q) ||
        c.complianceType.toLowerCase().includes(q) ||
        (c.company || c.provider || '').toLowerCase().includes(q) ||
        c.policyNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Legal Compliance & Certifications
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Monitor Fitness Certificates, Insurance Policies, Road Tax (MVL), and Public Carrier Licences
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Renew Document</span>
        </button>
      </div>

      {/* Expiry Priority Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => setTabFilter('expired')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            tabFilter === 'expired' ? 'ring-2 ring-[#B9534F] bg-[#FDEDEC]' : 'bg-white'
          }`}
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#B9534F] uppercase tracking-wider">
            <span>Expired Documents</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-bold text-[#B9534F]">{expiredList.length}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">
            Requires immediate inspection / renewal
          </div>
        </div>

        <div
          onClick={() => setTabFilter('next30')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            tabFilter === 'next30' ? 'ring-2 ring-[#B86645] bg-[#FFF9F2]' : 'bg-white'
          }`}
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#B86645] uppercase tracking-wider">
            <span>Expiring in 30 Days</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-bold text-[#B86645]">{expiringSoonList.length}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">
            Schedule renewals before grace period
          </div>
        </div>

        <div
          onClick={() => setTabFilter('valid')}
          className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs ${
            tabFilter === 'valid' ? 'ring-2 ring-[#4F7D61] bg-[#EEF5F1]' : 'bg-white'
          }`}
          style={{ borderColor: ADMIN_THEME.border }}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#4F7D61] uppercase tracking-wider">
            <span>Compliant & Valid</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-1 text-2xl font-bold text-[#4F7D61]">{validList.length}</div>
          <div className="mt-1 text-[11px] text-[#65727B]">
            Authorized for commercial road operation
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search vehicle reg, policy #, provider (Swan, SICOM)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              tabFilter === 'all' ? 'bg-[#17324D] text-white' : 'text-[#65727B] hover:bg-gray-100'
            }`}
          >
            All ({compliance.length})
          </button>
          <button
            type="button"
            onClick={() => setTabFilter('expired')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              tabFilter === 'expired' ? 'bg-[#B9534F] text-white' : 'text-[#65727B] hover:bg-gray-100'
            }`}
          >
            Expired ({expiredList.length})
          </button>
          <button
            type="button"
            onClick={() => setTabFilter('next30')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
              tabFilter === 'next30' ? 'bg-[#B86645] text-white' : 'text-[#65727B] hover:bg-gray-100'
            }`}
          >
            Next 30 Days ({expiringSoonList.length})
          </button>
        </div>
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
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-3">Compliance Certificate</th>
                <th className="py-3 px-3">Issuer / Provider</th>
                <th className="py-3 px-3">Policy / Cert #</th>
                <th className="py-3 px-3">Expiry Date</th>
                <th className="py-3 px-3">Annual Premium</th>
                <th className="py-3 px-3">Legal Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#65727B]">
                    No compliance documents match this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const expiryMs = new Date(c.expiryDate).getTime();
                  const diffDays = Math.ceil((expiryMs - now) / (1000 * 60 * 60 * 24));

                  return (
                    <tr key={c.id} className="hover:bg-[#F9FBFC] transition-colors">
                      {/* Vehicle */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#24313A]">{c.vehicleName}</div>
                        <div className="font-mono text-[10px] text-[#65727B]">{c.vehicleReg}</div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-[#24313A]">{c.complianceType}</span>
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-3">
                        <div className="text-[#24313A] font-medium">{c.provider}</div>
                      </td>

                      {/* Policy / Cert # */}
                      <td className="py-3 px-3 font-mono text-[#65727B]">
                        {c.policyNumber || '—'}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#24313A]">{c.expiryDate}</div>
                        <div className={`text-[10px] font-semibold ${
                          diffDays < 0 ? 'text-[#B9534F]' : diffDays <= 30 ? 'text-[#B86645]' : 'text-[#65727B]'
                        }`}>
                          {diffDays < 0
                            ? `Expired ${Math.abs(diffDays)} days ago`
                            : `${diffDays} days remaining`}
                        </div>
                      </td>

                      {/* Premium */}
                      <td className="py-3 px-3">
                        {c.premium ? (
                          <div className="font-semibold text-[#24313A]">
                            Rs {c.premium.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-[#95A2AA]">Standard Fee</span>
                        )}
                      </td>

                      {/* Legal Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={c.status} type="compliance" size="sm" />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#35658A] hover:text-[#17324D] bg-[#F1F6FA] hover:bg-[#EAEFF2] rounded-md transition-colors cursor-pointer"
                        >
                          Renew / File
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UploadDocumentModal
        vehicle={null}
        vehiclesList={vehicles}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
};
