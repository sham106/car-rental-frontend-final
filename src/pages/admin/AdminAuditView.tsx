import React, { useState } from 'react';
import { History, Search, Shield, User, Clock, Filter } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';

export const AdminAuditView: React.FC = () => {
  const { auditLogs } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const filtered = auditLogs.filter((log) => {
    if (entityFilter !== 'all' && log.targetEntity !== entityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.targetEntity.toLowerCase().includes(q)
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
            Operational Audit Trail & Activity Logs
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Activity history of state transitions, status overrides, vehicle check-outs, maintenance records, and permissions
          </p>
        </div>
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
            placeholder="Search action, details, operator name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-[#DCE2E6] bg-white text-[#24313A]"
          >
            <option value="all">All Target Entities</option>
            <option value="vehicle">Vehicle</option>
            <option value="booking">Booking</option>
            <option value="maintenance">Maintenance</option>
            <option value="compliance">Compliance</option>
            <option value="assignment">Assignment</option>
            <option value="document">Document</option>
          </select>
          <span className="text-xs text-[#65727B]">
            <strong>{filtered.length}</strong> log events
          </span>
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
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-4 text-left">Event Details & State Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#F9FBFC] transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-[#65727B] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#24313A] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#65727B]" />
                      <span>{log.performedBy}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F1F4F6] text-[#17324D]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 capitalize font-medium text-[#65727B]">
                    {log.targetEntity}
                  </td>

                  <td className="py-3 px-4 text-[#24313A]">
                    <div>{log.details}</div>
                    {log.oldValue && log.newValue && (
                      <div className="text-[10px] text-[#95A2AA] mt-0.5 font-mono">
                        {log.oldValue} → {log.newValue}
                      </div>
                    )}
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
