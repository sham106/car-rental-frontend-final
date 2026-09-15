import { RecordEditor } from '../../components/admin/RecordEditor';
import { Customer } from '../../types/admin';
import React, { useState } from 'react';
import { Users, Search, CheckCircle2, Star, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const CustomersView: React.FC = () => {
  const { customers, bookings, refreshAll } = useAdminData();
  const [editor, setEditor] = useState<Customer | 'new' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = customers.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.fullName || `${c.firstName} ${c.lastName}`).toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.nationality || c.country).toLowerCase().includes(q) ||
        (c.licenseNumber || c.licenceNumber).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {editor && <RecordEditor resource="customers" record={editor==='new'?undefined:editor} onClose={()=>setEditor(null)} onSaved={refreshAll} />}
      <button onClick={()=>setEditor('new')} className="rounded-lg bg-[#17324D] text-white px-4 py-2 text-sm">Add customer</button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Customer Directory & Renter Profiles
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Verified driver records, contact details, total booking history, and customer lifetime value
          </p>
        </div>
      </div>

      {/* Search Bar */}
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
            placeholder="Search customers by name, phone, license, country..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>
        <span className="text-xs text-[#65727B]">
          <strong>{filtered.length}</strong> registered clients
        </span>
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
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Country / Nationality</th>
                <th className="py-3 px-3">Driving License #</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Rental History</th>
                <th className="py-3 px-4 text-right">Fully Paid Rentals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.map((c) => {
                const clientBookings = bookings.filter((b) => b.customerId === c.id);
                const spend = clientBookings.filter(b => b.paymentStatus === 'Fully Paid').reduce((sum, b) => sum + (b.finalAmount ?? b.estimatedAmount), 0);

                return (
                  <tr onDoubleClick={()=>setEditor(c)} key={c.id} className="hover:bg-[#F9FBFC] transition-colors">
                    <td className="py-3 px-4"><button type="button" className="text-xs underline block mb-1" onClick={()=>setEditor(c)}>Edit customer</button>
                      <div className="font-semibold text-[#24313A]">{c.fullName || `${c.firstName} ${c.lastName}`}</div>
                      <div className="flex items-center gap-1 text-[11px] text-[#C4802C] mt-0.5">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{c.rating ? c.rating.toFixed(1) : '5.0'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[#24313A]">{c.email}</div>
                      <div className="text-[11px] text-[#65727B]">{c.phone}</div>
                    </td>

                    <td className="py-3 px-3 text-[#24313A] font-medium">
                      {c.nationality || c.country}
                    </td>

                    <td className="py-3 px-3 font-mono text-[#65727B]">
                      {c.licenseNumber || c.licenceNumber}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F7D61] bg-[#EEF5F1] px-2 py-0.5 rounded-full border border-[#CCE0D5]">
                        <ShieldCheck className="w-3 h-3" /> Verification required
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#24313A]">
                        {clientBookings.length} booking requests
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-[#17324D]">
                      Rs {spend.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
