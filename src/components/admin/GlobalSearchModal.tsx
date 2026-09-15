import React, { useState, useMemo } from 'react';
import { Search, X, Car, Calendar, User, FileText, ArrowRight } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from './StatusBadge';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface GlobalSearchModalProps {
  onNavigate: (tab: string, entityId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    vehicles,
    bookings,
    customers,
    owners,
    assignments,
  } = useAdminData();

  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { vehicles: [], bookings: [], customers: [], owners: [], assignments: [] };

    const matchedVehicles = vehicles.filter(
      (v) =>
        v.registrationNumber.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q) ||
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedBookings = bookings.filter(
      (b) =>
        b.reference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.vehicleReg.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedCustomers = customers.filter(
      (c) =>
        (c.name || c.fullName || `${c.firstName} ${c.lastName}`).toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedOwners = owners.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.contactPerson || '').toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedAssignments = assignments.filter(
      (a) =>
        a.assignedTo.toLowerCase().includes(q) ||
        a.vehicleReg.toLowerCase().includes(q)
    ).slice(0, 4);

    return {
      vehicles: matchedVehicles,
      bookings: matchedBookings,
      customers: matchedCustomers,
      owners: matchedOwners,
      assignments: matchedAssignments,
    };
  }, [query, vehicles, bookings, customers, owners, assignments]);

  if (!isSearchOpen) return null;

  const totalResults =
    results.vehicles.length +
    results.bookings.length +
    results.customers.length +
    results.owners.length +
    results.assignments.length;

  const handleSelect = (tab: string, id?: string) => {
    setIsSearchOpen(false);
    setQuery('');
    onNavigate(tab, id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-150"
        style={{ borderColor: ADMIN_THEME.border }}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#DCE2E6] bg-white gap-3">
          <Search className="w-5 h-5 text-[#65727B] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search registration, VIN, customer, booking ref, owner, assignee..."
            className="w-full text-base focus:outline-none bg-transparent text-[#24313A] placeholder-[#65727B]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-[#65727B] hover:text-[#24313A] text-xs px-1.5 py-0.5 rounded bg-gray-100"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="text-[#65727B] hover:text-[#24313A] p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className="text-center py-8 text-[#65727B] text-sm">
              <p>Type a vehicle registration (e.g. <strong>2841 JL 23</strong>), customer name, or booking ref.</p>
              <p className="text-xs text-[#95A2AA] mt-1.5">Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded text-[10px]">Esc</kbd> anytime to close</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-[#65727B] text-sm">
              No matching fleet vehicles, bookings, customers, or owners found for &quot;{query}&quot;.
            </div>
          ) : (
            <>
              {/* Vehicles */}
              {results.vehicles.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" /> Fleet Vehicles ({results.vehicles.length})
                  </div>
                  <div className="space-y-1">
                    {results.vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => handleSelect('fleet', v.id)}
                        className="p-2.5 rounded-lg hover:bg-[#F4F6F7] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm text-[#24313A] group-hover:text-[#35658A]">
                            {v.registrationNumber}
                          </span>
                          <span className="text-xs text-[#65727B]">
                            {v.brand} {v.model} ({v.year})
                          </span>
                          <span className="text-[11px] text-[#95A2AA]">VIN: {v.vin}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={v.operationalStatus} size="sm" />
                          <ArrowRight className="w-4 h-4 text-[#65727B] group-hover:text-[#35658A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {results.bookings.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Bookings & Rentals ({results.bookings.length})
                  </div>
                  <div className="space-y-1">
                    {results.bookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelect('bookings', b.id)}
                        className="p-2.5 rounded-lg hover:bg-[#F4F6F7] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-[#35658A]">{b.reference}</span>
                            <span className="text-xs font-medium text-[#24313A]">{b.customerName}</span>
                          </div>
                          <div className="text-[11px] text-[#65727B] mt-0.5">
                            {b.vehicleReg} ({b.vehicleName}) · {b.pickupDate} to {b.returnDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={b.bookingStatus} type="booking" size="sm" />
                          <ArrowRight className="w-4 h-4 text-[#65727B] group-hover:text-[#35658A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers */}
              {results.customers.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Customers ({results.customers.length})
                  </div>
                  <div className="space-y-1">
                    {results.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect('customers', c.id)}
                        className="p-2.5 rounded-lg hover:bg-[#F4F6F7] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <span className="font-medium text-xs text-[#24313A] group-hover:text-[#35658A]">
                            {c.name || c.fullName || `${c.firstName} ${c.lastName}`}
                          </span>
                          <span className="text-[11px] text-[#65727B] ml-2">{c.phone} · {c.email}</span>
                        </div>
                        <span className="text-[11px] text-[#65727B]">{c.totalBookings} rentals</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owners */}
              {results.owners.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-[#65727B] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Vehicle Owners ({results.owners.length})
                  </div>
                  <div className="space-y-1">
                    {results.owners.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => handleSelect('owners', o.id)}
                        className="p-2.5 rounded-lg hover:bg-[#F4F6F7] flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div>
                          <span className="font-medium text-xs text-[#24313A] group-hover:text-[#35658A]">
                            {o.name}
                          </span>
                          <span className="text-[11px] text-[#65727B] ml-2">Type: {o.ownerType} · Contact: {o.contactPerson}</span>
                        </div>
                        <span className="text-[11px] text-[#65727B]">{o.vehicleCount} vehicles</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
