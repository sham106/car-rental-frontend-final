import React, { useState } from 'react';
import { Globe, Star, Search, Check, X, ExternalLink, Tag, ArrowUpDown } from 'lucide-react';
import { AdminVehicle } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { adminVehicleService } from '../../services/admin/adminVehicleService';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface WebsiteListingsViewProps {
  onOpenWebsite?: () => void;
}

export const WebsiteListingsView: React.FC<WebsiteListingsViewProps> = ({ onOpenWebsite }) => {
  const { vehicles, refreshAll, toggleVehiclePublish, toggleVehicleFeatured } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'published' | 'unpublished'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkOperating, setIsBulkOperating] = useState(false);

  const filtered = vehicles.filter((v) => {
    if (filterMode === 'published' && !v.published) return false;
    if (filterMode === 'unpublished' && v.published) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((v) => v.id));
    }
  };

  const handleBulkPublish = async (published: boolean) => {
    try {
      setIsBulkOperating(true);
      await adminVehicleService.bulkPublish(selectedIds, published);
      await refreshAll();
      setSelectedIds([]);
    } finally {
      setIsBulkOperating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Customer Website Listings
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Configure catalog visibility, featured showcases, and promotional pricing for public booking
          </p>
        </div>
        {onOpenWebsite && (
          <button
            type="button"
            onClick={onOpenWebsite}
            className="px-4 py-2 text-xs font-semibold text-[#17324D] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Preview Customer Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#4F7D61] uppercase tracking-wider">
            Published Live on Website
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            {vehicles.filter((v) => v.published).length} / {vehicles.length}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Available for online reservations</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#C4802C] uppercase tracking-wider">
            Featured on Homepage
          </div>
          <div className="mt-1 text-2xl font-bold text-[#C4802C]">
            {vehicles.filter((v) => v.featured).length}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Hero promotion spotlight</div>
        </div>

        <div className="p-4 rounded-xl border bg-white shadow-2xs" style={{ borderColor: ADMIN_THEME.border }}>
          <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider">
            Average Online Daily Rate
          </div>
          <div className="mt-1 text-2xl font-bold text-[#24313A]">
            Rs {Math.round(vehicles.reduce((s, v) => s + v.dailyRate, 0) / (vehicles.length || 1)).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-[#65727B]">Across all published categories</div>
        </div>
      </div>

      {/* Control & Bulk Action Bar */}
      <div
        className="p-3.5 rounded-xl border bg-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-[#65727B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter listings..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white text-[#24313A]"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterMode === 'all' ? 'bg-[#17324D] text-white' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              All ({vehicles.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('published')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterMode === 'published' ? 'bg-[#17324D] text-white' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              Published ({vehicles.filter((v) => v.published).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unpublished')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer ${
                filterMode === 'unpublished' ? 'bg-[#17324D] text-white' : 'text-[#65727B] hover:bg-gray-100'
              }`}
            >
              Unpublished ({vehicles.filter((v) => !v.published).length})
            </button>
          </div>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 bg-[#F1F6FA] p-1.5 rounded-lg border border-[#C8DCF0] text-xs">
            <span className="font-semibold text-[#35658A] px-2">
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              disabled={isBulkOperating}
              onClick={() => handleBulkPublish(true)}
              className="px-2.5 py-1 bg-[#4F7D61] text-white font-semibold rounded hover:bg-[#436C54] cursor-pointer"
            >
              Publish Selected
            </button>
            <button
              type="button"
              disabled={isBulkOperating}
              onClick={() => handleBulkPublish(false)}
              className="px-2.5 py-1 bg-white border border-[#DCE2E6] text-[#24313A] font-medium rounded hover:bg-gray-50 cursor-pointer"
            >
              Unpublish
            </button>
          </div>
        )}
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
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#17324D]"
                  />
                </th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Website Rate (Rs/day)</th>
                <th className="py-3 px-3">Key Features</th>
                <th className="py-3 px-3 text-center">Featured Spotlight</th>
                <th className="py-3 px-4 text-right">Online Publishing Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filtered.map((v) => {
                const isSelected = selectedIds.includes(v.id);
                const photoUrl = v.photos?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=400&q=80';

                return (
                  <tr key={v.id} className="hover:bg-[#F9FBFC] transition-colors">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(v.id)}
                        className="w-4 h-4 rounded text-[#17324D]"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={photoUrl}
                          alt={v.brand}
                          className="w-12 h-9 rounded object-cover border border-[#DCE2E6] flex-shrink-0"
                        />
                        <div>
                          <div className="font-semibold text-[#24313A]">
                            {v.brand} {v.model} ({v.year})
                          </div>
                          <div className="font-mono text-[10px] text-[#65727B]">{v.registrationNumber}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 capitalize text-[#24313A]">{v.category}</td>

                    <td className="py-3 px-3 font-semibold text-[#24313A]">
                      Rs {v.dailyRate.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(v.features || ['A/C', 'Auto']).slice(0, 3).map((f, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 bg-[#F1F4F6] text-[#24313A] rounded text-[10px]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleVehicleFeatured(v.id, !v.featured)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          v.featured
                            ? 'bg-amber-50 border-[#F2DDBB] text-[#C4802C]'
                            : 'bg-white border-[#DCE2E6] text-[#95A2AA] hover:bg-gray-50'
                        }`}
                        title={v.featured ? 'Featured in hero showcase' : 'Standard catalog'}
                      >
                        <Star className={`w-4 h-4 ${v.featured ? 'fill-current' : ''}`} />
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toggleVehiclePublish(v.id, !v.published)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                          v.published
                            ? 'bg-[#EEF5F1] text-[#4F7D61] border-[#CCE0D5] hover:bg-[#E2EDE6]'
                            : 'bg-[#F4F6F7] text-[#65727B] border-[#DCE2E6] hover:bg-[#EAEFF2]'
                        }`}
                      >
                        {v.published ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Live Online</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>Unpublished</span>
                          </>
                        )}
                      </button>
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
