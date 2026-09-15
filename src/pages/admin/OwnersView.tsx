import { RecordEditor } from '../../components/admin/RecordEditor';
import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building,
  Phone,
  Mail,
  Car,
  DollarSign,
  ChevronRight,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { Owner, AdminVehicle } from '../../types/admin';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { OwnerDetailsModal } from '../../components/admin/OwnerDetailsModal';
import { VehicleProfileModal } from './VehicleProfileModal';

export const OwnersView: React.FC = () => {
  const { owners, vehicles, refreshAll } = useAdminData();
  const [editor, setEditor] = useState<Owner | 'new' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [selectedVehicleForProfile, setSelectedVehicleForProfile] = useState<AdminVehicle | null>(null);

  const filtered = owners.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {editor && <RecordEditor resource="owners" record={editor==='new'?undefined:editor} onClose={()=>setEditor(null)} onSaved={refreshAll} />}
      <button onClick={()=>setEditor('new')} className="rounded-lg bg-[#17324D] text-white px-4 py-2 text-sm">Add owner</button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Fleet Ownership & Partner Hosts
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Manage company assets and private vehicle partners operating on consignment / revenue split. Click any owner card to view all exact vehicles in their fleet.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div
        className="p-3.5 rounded-xl border bg-white flex items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search owners by name, email, phone..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>
        <span className="text-xs text-[#65727B]">
          <strong>{filtered.length}</strong> registered owners
        </span>
      </div>

      {/* Grid of Owner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((o) => {
          const ownerVehicles = vehicles.filter((v) => v.ownerId === o.id);
          const isInternal = o.ownerType === 'Internal' || o.ownerType === 'Company';

          return (
            <div
              key={o.id}
              onClick={() => setSelectedOwner(o)}
              className="p-5 rounded-xl border bg-white shadow-2xs hover:border-[#17324D] hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
              style={{ borderColor: ADMIN_THEME.border }}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[#F1F4F6] text-[#17324D] group-hover:bg-[#17324D] group-hover:text-white transition-colors">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <button type="button" className="text-xs underline mr-2" onClick={e=>{e.stopPropagation();setEditor(o);}}>Edit owner</button>
                      <h3 className="font-bold text-sm text-[#24313A] group-hover:text-[#17324D] transition-colors">
                        {o.name}
                      </h3>
                      <span className="text-[11px] text-[#65727B]">{o.contactPerson || 'Direct Entity'}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isInternal
                        ? 'bg-[#EEF5F1] text-[#4F7D61] border-[#CCE0D5]'
                        : 'bg-[#F1F6FA] text-[#35658A] border-[#D0E0EC]'
                    }`}
                  >
                    {o.ownerType}
                  </span>
                </div>

                <div className="mt-3.5 space-y-1.5 text-xs text-[#65727B]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#95A2AA]" />
                    <span className="text-[#24313A]">{o.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#95A2AA]" />
                    <span className="text-[#24313A] truncate">{o.email}</span>
                  </div>
                  {o.bankAccount && (
                    <div className="text-[11px] pt-0.5 text-[#95A2AA] font-mono truncate">
                      Bank: {o.bankAccount}
                    </div>
                  )}
                </div>

                {/* Exact Vehicles Owned Preview */}
                <div className="mt-3.5 pt-3 border-t border-[#E5E9EC] space-y-1.5">
                  <div className="text-[11px] font-bold text-[#65727B] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-[#17324D]" />
                      <span>Exact Vehicles Owned ({ownerVehicles.length})</span>
                    </span>
                    <span className="text-[#17324D] group-hover:underline text-[11px] font-semibold flex items-center gap-0.5">
                      Inspect fleet &rarr;
                    </span>
                  </div>

                  {ownerVehicles.length === 0 ? (
                    <p className="text-[11px] text-[#95A2AA] italic">No vehicles currently linked</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ownerVehicles.slice(0, 3).map((v) => (
                        <span
                          key={v.id}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-[#F1F4F6] text-[#24313A] border border-[#DCE2E6] font-medium"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              v.operationalStatus === 'available'
                                ? 'bg-[#4F7D61]'
                                : v.operationalStatus === 'rented'
                                ? 'bg-[#35658A]'
                                : v.operationalStatus === 'assigned'
                                ? 'bg-[#8C5D30]'
                                : 'bg-[#D97745]'
                            }`}
                          />
                          <span className="font-semibold">{v.brand} {v.model}</span>
                          <span className="font-mono text-[9px] text-[#65727B]">({v.registrationNumber})</span>
                        </span>
                      ))}
                      {ownerVehicles.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-[#17324D] font-bold border border-[#DCE2E6]">
                          +{ownerVehicles.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mt-4 pt-3 border-t border-[#E5E9EC] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#24313A]">
                    <Car className="w-4 h-4 text-[#65727B]" />
                    <span>{ownerVehicles.length} total assets</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#65727B] block">Revenue Share</span>
                    <span className="font-semibold text-[#17324D]">
                      {isInternal ? '100% (Direct)' : `${o.revenueSplitPercentage || 70}% Host`}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOwner(o);
                  }}
                  className="w-full mt-3 py-2 px-3 text-xs font-semibold text-[#17324D] bg-[#F1F4F6] group-hover:bg-[#17324D] group-hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>View {ownerVehicles.length} Vehicles & Full Details</span>
                  <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Owner Details & Exact Vehicles Portfolio Modal */}
      {selectedOwner && (
        <OwnerDetailsModal
          owner={selectedOwner}
          isOpen={!!selectedOwner}
          onClose={() => setSelectedOwner(null)}
          onSelectVehicleForProfile={(v) => setSelectedVehicleForProfile(v)}
        />
      )}

      {/* Nested Vehicle Full Profile Modal */}
      {selectedVehicleForProfile && (
        <VehicleProfileModal
          vehicle={selectedVehicleForProfile}
          isOpen={!!selectedVehicleForProfile}
          onClose={() => setSelectedVehicleForProfile(null)}
        />
      )}
    </div>
  );
};

