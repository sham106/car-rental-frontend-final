import React, { useState } from 'react';
import { Shield, UserPlus, Search, CheckCircle2, Lock, UserCheck } from 'lucide-react';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Fleet Operations Manager' | 'Rental / Reservations Agent' | 'Accountant' | 'Viewer / Read-only';
  department: string;
  status: 'Active' | 'Suspended';
  lastLogin: string;
}

const MOCK_USERS: AdminUserRecord[] = [
  {
    id: 'u-1',
    name: 'Gilles Ramgoolam',
    email: 'gilles@oceanecarrental.mu',
    role: 'Super Admin',
    department: 'Executive Management',
    status: 'Active',
    lastLogin: 'Today, 10:14 AM',
  },
  {
    id: 'u-2',
    name: 'Kavita Seebun',
    email: 'kavita.ops@oceanecarrental.mu',
    role: 'Fleet Operations Manager',
    department: 'Fleet Operations',
    status: 'Active',
    lastLogin: 'Today, 09:30 AM',
  },
  {
    id: 'u-3',
    name: 'Darren Appadoo',
    email: 'darren.desk@oceanecarrental.mu',
    role: 'Rental / Reservations Agent',
    department: 'SSR Airport Desk',
    status: 'Active',
    lastLogin: 'Yesterday, 17:45 PM',
  },
  {
    id: 'u-4',
    name: 'Anoushka Moothoo',
    email: 'anoushka.fin@oceanecarrental.mu',
    role: 'Accountant',
    department: 'Finance & Payouts',
    status: 'Active',
    lastLogin: 'Aug 30, 2026',
  },
  {
    id: 'u-5',
    name: 'Partner Auditor Guest',
    email: 'audits@partnerfleet.mu',
    role: 'Viewer / Read-only',
    department: 'External Audit',
    status: 'Active',
    lastLogin: 'Aug 24, 2026',
  },
];

export const UsersRolesView: React.FC = () => {
  const [users, setUsers] = useState<AdminUserRecord[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = users.filter((u) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q)
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
            Users & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Manage administrative operators, dispatch staff, accountants, and granular permission tiers
          </p>
        </div>
      </div>

      {/* Role Descriptions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-xs font-semibold text-[#17324D] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#35658A]" />
            <span>Super Admin & Fleet Manager</span>
          </div>
          <p className="text-[11px] text-[#65727B] mt-1">
            Full authority over vehicle registrations, status overrides, maintenance logs, and financial records.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-xs font-semibold text-[#17324D] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#4F7D61]" />
            <span>Reservations & Airport Desk</span>
          </div>
          <p className="text-[11px] text-[#65727B] mt-1">
            Handles customer check-ins, vehicle condition inspections, and reservation confirmations.
          </p>
        </div>

        <div className="p-3.5 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-xs font-semibold text-[#17324D] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#77838C]" />
            <span>Accountant & Read-Only</span>
          </div>
          <p className="text-[11px] text-[#65727B] mt-1">
            Dedicated view of partner payout schedules, expense ledgers, and revenue utilization exports.
          </p>
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
                <th className="py-3 px-4">Operator Name</th>
                <th className="py-3 px-3">Role & Access Tier</th>
                <th className="py-3 px-3">Department / Station</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Last System Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9FBFC] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#24313A]">{u.name}</div>
                    <div className="text-[11px] text-[#65727B]">{u.email}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F4F6] text-[#17324D]">
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-[#24313A] font-medium">
                    {u.department}
                  </td>

                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F7D61] bg-[#EEF5F1] px-2 py-0.5 rounded-full border border-[#CCE0D5]">
                      <CheckCircle2 className="w-3 h-3" /> {u.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right text-[#65727B]">
                    {u.lastLogin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
