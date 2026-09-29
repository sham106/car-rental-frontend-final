import { useSearchParams } from 'react-router-dom';
import { NewBookingModal } from '../../components/admin/NewBookingModal';
import { api } from '../../services/api';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Key,
  Clock,
  ArrowRight,
  Filter,
  DollarSign,
  AlertCircle,
  MapPin,
  User,
  Ban,
  Printer,
  Eye,
  ShieldCheck,
  Gauge,
  Fuel,
  AlertTriangle,
  FileText,
  Maximize2,
  X,
} from 'lucide-react';
import { AdminBooking } from '../../types/admin';
import { useAdminData } from '../../context/AdminDataContext';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { CheckOutModal } from '../../components/admin/CheckOutModal';
import { CheckInModal } from '../../components/admin/CheckInModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { html } from '../../utils/html';

export const BookingsManagementView: React.FC = () => {
  const {
    bookings,
    confirmBooking,
    rejectBooking,
    cancelBooking,
    checkOutBooking,
    checkInBooking,
    refreshAll,
  } = useAdminData();

  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  useEffect(() => { setSearchQuery(searchParams.get('q') || ''); }, [searchParams]);

  // Modals
  const [checkoutBooking, setCheckoutBooking] = useState<AdminBooking | null>(null);
  const [checkinBooking, setCheckinBooking] = useState<AdminBooking | null>(null);
  const [rejectDialogBooking, setRejectDialogBooking] = useState<AdminBooking | null>(null);
  const [cancelDialogBooking, setCancelDialogBooking] = useState<AdminBooking | null>(null);
  const [viewDetailBooking, setViewDetailBooking] = useState<AdminBooking | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string } | null>(null);

  const handlePrintSlip = (b: AdminBooking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const kmDriven =
      b.mileageOut && b.mileageIn
        ? `${b.mileageIn - b.mileageOut} km`
        : b.mileageOut
        ? 'In progress'
        : 'N/A';

    printWindow.document.write(html`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inspection Slip - ${b.reference}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 32px; color: #24313A; max-width: 800px; margin: 0 auto; font-size: 13px; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #17324D; padding-bottom: 12px; margin-bottom: 18px; }
            .title { font-size: 18px; font-weight: bold; color: #17324D; }
            .subtitle { font-size: 11px; color: #65727B; }
            .box { border: 1px solid #DCE2E6; border-radius: 6px; padding: 12px; margin-bottom: 14px; background: #FAFBFB; }
            .box-title { font-weight: bold; font-size: 11px; text-transform: uppercase; color: #17324D; margin-bottom: 8px; border-bottom: 1px solid #E5E9EC; padding-bottom: 4px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
            .highlight { background: #FEF9E7; border: 1px solid #FAD7A0; padding: 8px; border-radius: 4px; margin-top: 6px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed #A0AEC0; }
            .sig-line { border-bottom: 1px solid #24313A; height: 35px; margin-bottom: 6px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">OCR Car Rental Mauritius</div>
              <div class="subtitle">Vehicle Handover & Return Inspection Certificate · Dispute Protection Record</div>
            </div>
            <div style="text-align: right;">
              <strong>Ref: ${b.reference}</strong><br/>
              <span>Status: ${b.bookingStatus.toUpperCase()}</span>
            </div>
          </div>

          <div class="box">
            <div class="box-title">1. Rental & Client Details</div>
            <div class="grid">
              <div><strong>Customer:</strong> ${b.customerName} (${b.customerPhone})</div>
              <div><strong>Email:</strong> ${b.customerEmail}</div>
              <div><strong>Vehicle:</strong> ${b.vehicleName}</div>
              <div><strong>Registration:</strong> ${b.vehicleReg}</div>
              <div><strong>Rental Period:</strong> ${b.pickupDate} to ${b.returnDate} (${b.days} days)</div>
              <div><strong>Locations:</strong> ${b.pickupLocation} / ${b.returnLocation}</div>
            </div>
          </div>

          <div class="box" style="border-left: 4px solid #35658A;">
            <div class="box-title" style="color: #35658A;">2. Handover at Departure (Outbound Baseline)</div>
            <div class="grid">
              <div><strong>Odometer Out:</strong> ${b.mileageOut ? `${b.mileageOut.toLocaleString()} km` : 'N/A'}</div>
              <div><strong>Fuel Tank Out:</strong> ${b.fuelLevelOut || '8/8 Full'}</div>
              <div><strong>Checkout Time:</strong> ${b.checkedOutAt ? new Date(b.checkedOutAt).toLocaleString() : 'N/A'}</div>
              <div><strong>Condition Notes:</strong> ${b.conditionNotesOut || 'Clean and operational'}</div>
            </div>
            <div class="highlight">
              <strong>Pre-existing Damages Agreed at Handover:</strong><br/>
              ${b.damageNotesOut || 'No pre-existing damages recorded at checkout.'}
            </div>
          </div>

          <div class="box" style="border-left: 4px solid #4F7D61;">
            <div class="box-title" style="color: #4F7D61;">3. Return Inspection (Inbound Verification)</div>
            <div class="grid">
              <div><strong>Odometer In:</strong> ${b.mileageIn ? `${b.mileageIn.toLocaleString()} km` : 'Pending return'}</div>
              <div><strong>Fuel Tank In:</strong> ${b.fuelLevelIn || 'Pending return'}</div>
              <div><strong>Check-in Time:</strong> ${b.checkedInAt ? new Date(b.checkedInAt).toLocaleString() : 'Pending return'}</div>
              <div><strong>Total Distance Driven:</strong> ${kmDriven}</div>
            </div>
            <div style="margin-top: 6px; padding: 8px; border: 1px solid #DCE2E6; border-radius: 4px; background: white;">
              <strong>New Damages Observed on Return:</strong><br/>
              ${b.damageNotesIn || (b.bookingStatus === 'completed' ? 'None observed.' : 'Pending return inspection.')}
            </div>
          </div>

          <div class="signatures">
            <div>
              <div class="sig-line"></div>
              <strong>Customer Signature</strong><br/>
              <span style="font-size: 10px; color: #65727B;">I confirm the inspection condition notes & vehicle state above.</span>
            </div>
            <div>
              <div class="sig-line"></div>
              <strong>Authorized Inspector Signature</strong><br/>
              <span style="font-size: 10px; color: #65727B;">OCR Car Rental Operations Agent</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const pendingCount = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const activeCount = bookings.filter((b) => b.bookingStatus === 'active').length;

  const STATUS_TABS = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'pending', label: 'Pending Requests', count: pendingCount, badgeColor: '#C4623C' },
    { id: 'confirmed', label: 'Confirmed', count: bookings.filter((b) => b.bookingStatus === 'confirmed').length },
    { id: 'active', label: 'Active Rentals', count: activeCount, badgeColor: '#35658A' },
    { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.bookingStatus === 'completed').length },
    { id: 'cancelled', label: 'Cancelled / Rejected', count: bookings.filter((b) => b.bookingStatus === 'cancelled' || b.bookingStatus === 'rejected').length },
  ];

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status
      if (statusFilter !== 'all') {
        if (statusFilter === 'cancelled') {
          if (b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'rejected') return false;
        } else if (b.bookingStatus !== statusFilter) {
          return false;
        }
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          b.reference.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.vehicleReg.toLowerCase().includes(q) ||
          b.vehicleName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {newBookingOpen && <NewBookingModal onClose={()=>setNewBookingOpen(false)} />}
      <button onClick={()=>setNewBookingOpen(true)} className="rounded-lg bg-[#17324D] text-white px-4 py-2 text-sm">New booking</button>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24313A] tracking-tight">
            Bookings & Rental Operations
          </h1>
          <p className="text-sm text-[#65727B] mt-0.5">
            Process incoming customer reservations, vehicle handovers (Check-Out), and returns (Check-In)
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#DCE2E6]">
        {STATUS_TABS.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-[#17324D] text-white font-semibold'
                  : 'text-[#65727B] hover:bg-white hover:text-[#24313A]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : tab.badgeColor
                    ? 'text-white'
                    : 'bg-[#E5E9EC] text-[#24313A]'
                }`}
                style={{ backgroundColor: !isActive && tab.badgeColor ? tab.badgeColor : undefined }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
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
            placeholder="Search booking ref, customer name, vehicle registration..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#DCE2E6] bg-[#F8F9FA] focus:bg-white focus:outline-none focus:border-[#35658A] text-[#24313A]"
          />
        </div>
        <span className="text-xs text-[#65727B]">
          Showing <strong>{filteredBookings.length}</strong> bookings
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
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Vehicle</th>
                <th className="py-3 px-3">Rental Dates</th>
                <th className="py-3 px-3">Locations</th>
                <th className="py-3 px-3">Financials</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9EC]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#65727B]">
                    No bookings found in this category.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const amount = b.finalAmount || b.estimatedAmount;

                  return (
                    <tr key={b.id} className="hover:bg-[#F9FBFC] transition-colors">
                      {/* Ref */}
                      <td className="py-3 px-4 font-mono">
                        <div
                          onClick={() => setViewDetailBooking(b)}
                          className="font-bold text-xs text-[#35658A] hover:underline cursor-pointer"
                        >
                          {b.reference}
                        </div>
                        <div className="text-[10px] text-[#95A2AA]">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#24313A]">{b.customerName}</div>
                        <div className="text-[11px] text-[#65727B]">{b.customerPhone}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#24313A]">{b.vehicleName}</div>
                        <div className="font-mono text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded inline-block mt-0.5">
                          {b.vehicleReg}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#24313A]">
                          {b.pickupDate} → {b.returnDate}
                        </div>
                        <div className="text-[11px] text-[#65727B] font-medium mt-0.5">
                          {b.days} {b.days === 1 ? 'day' : 'days'}
                        </div>
                      </td>

                      {/* Locations */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-[#24313A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#65727B] flex-shrink-0" />
                          <span className="truncate max-w-[130px]" title={b.pickupLocation}>
                            {b.pickupLocation}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#95A2AA] ml-4">
                          Return: {b.returnLocation}
                        </div>
                      </td>

                      {/* Financials */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#24313A]">
                          Rs {amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-[#4F7D61] font-medium capitalize">
                          Deposit: Rs {(b.securityDeposit ?? 15000).toLocaleString()} ({b.paymentStatus})
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={b.bookingStatus} type="booking" size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Pending Actions */}
                          {b.bookingStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => confirmBooking(b.id)}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-[#35658A] hover:bg-[#17324D] rounded-md transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectDialogBooking(b)}
                                className="px-2.5 py-1 text-xs font-semibold text-[#B9534F] bg-[#FDEDEC] hover:bg-[#F8D7D5] rounded-md transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Confirmed: Start Rental */}
                          {b.bookingStatus === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => setCheckoutBooking(b)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Key className="w-3.5 h-3.5" />
                              <span>Check-Out (Start)</span>
                            </button>
                          )}

                          {/* Active: Complete Rental */}
                          {b.bookingStatus === 'active' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setViewDetailBooking(b)}
                                title="Refer to Handover Baseline & Agreed Damages"
                                className="px-2 py-1 text-xs font-semibold text-[#35658A] bg-[#EEF4F8] hover:bg-[#DDE9F0] border border-[#CCE0ED] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Baseline</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCheckinBooking(b)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-[#4F7D61] hover:bg-[#436C54] rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Check-In (Return)</span>
                              </button>
                            </div>
                          )}

                          {/* Completed info */}
                          {b.bookingStatus === 'completed' && (
                            <button
                              type="button"
                              onClick={() => setViewDetailBooking(b)}
                              className="px-2.5 py-1 text-xs font-medium text-[#35658A] bg-[#EEF4F8] hover:bg-[#DDE9F0] rounded-md cursor-pointer flex items-center gap-1"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Audit & Slip</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Check-Out Modal */}
      <CheckOutModal
        booking={checkoutBooking}
        isOpen={Boolean(checkoutBooking)}
        onClose={() => setCheckoutBooking(null)}
        onSubmit={async (id, data) => {
          await checkOutBooking(id, data);
        }}
      />

      {/* Check-In Modal */}
      <CheckInModal
        booking={checkinBooking}
        isOpen={Boolean(checkinBooking)}
        onClose={() => setCheckinBooking(null)}
        onSubmit={async (id, data) => {
          await checkInBooking(id, data);
        }}
      />

      {/* Reject Dialog */}
      <ConfirmDialog
        isOpen={Boolean(rejectDialogBooking)}
        title="Reject Booking Request"
        message={`Are you sure you want to reject reservation request ${rejectDialogBooking?.reference} for ${rejectDialogBooking?.customerName}? The vehicle will be released back to available status.`}
        confirmLabel="Reject Reservation"
        isDestructive={true}
        onConfirm={async () => {
          if (rejectDialogBooking) {
            await rejectBooking(rejectDialogBooking.id, 'Vehicle unavailable / schedule conflict');
            setRejectDialogBooking(null);
          }
        }}
        onCancel={() => setRejectDialogBooking(null)}
      />

      {/* Detail & Handover Audit Modal */}
      {viewDetailBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-[#DCE2E6] overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE2E6] bg-[#F4F6F7]">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#24313A]">
                      Booking {viewDetailBooking.reference}
                    </h3>
                    <StatusBadge status={viewDetailBooking.bookingStatus} type="booking" size="sm" />
                  </div>
                  <span className="text-xs text-[#65727B]">
                    Created {new Date(viewDetailBooking.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintSlip(viewDetailBooking)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#17324D] bg-white hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Print / Save Handover Inspection Certificate"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Inspection Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewDetailBooking(null)}
                  className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Customer & Vehicle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#F8F9FA] rounded-xl border border-[#DCE2E6]">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#65727B] tracking-wider block">Customer Details</span>
                  <div className="font-bold text-sm text-[#24313A]">{viewDetailBooking.customerName}</div>
                  <div className="text-[#65727B]">{viewDetailBooking.customerEmail} · {viewDetailBooking.customerPhone}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#65727B] tracking-wider block">Vehicle Assigned</span>
                  <div className="font-bold text-sm text-[#24313A]">{viewDetailBooking.vehicleName}</div>
                  <div className="font-mono text-[#35658A] font-semibold">{viewDetailBooking.vehicleReg}</div>
                </div>
              </div>

              {/* Rental Period, Locations & Financials */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-lg border border-[#DCE2E6]">
                  <span className="text-[10px] uppercase font-semibold text-[#65727B] block">Rental Period</span>
                  <span className="font-semibold text-[#24313A] block mt-0.5">
                    {viewDetailBooking.days} Days
                  </span>
                  <span className="text-[11px] text-[#65727B]">
                    {viewDetailBooking.pickupDate} → {viewDetailBooking.returnDate}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#DCE2E6]">
                  <span className="text-[10px] uppercase font-semibold text-[#65727B] block">Pick-up / Drop-off</span>
                  <span className="font-semibold text-[#24313A] block mt-0.5 truncate" title={viewDetailBooking.pickupLocation}>
                    {viewDetailBooking.pickupLocation}
                  </span>
                  <span className="text-[11px] text-[#65727B] truncate block" title={viewDetailBooking.returnLocation}>
                    Return: {viewDetailBooking.returnLocation}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#DCE2E6]">
                  <span className="text-[10px] uppercase font-semibold text-[#65727B] block">Total Amount</span>
                  <span className="font-bold text-sm text-[#24313A] block mt-0.5">
                    Rs {(viewDetailBooking.finalAmount || viewDetailBooking.estimatedAmount).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#4F7D61] font-medium">
                    {viewDetailBooking.paymentStatus}<form className="mt-3 space-y-2" onSubmit={async e=>{
                      e.preventDefault();setPaymentError('');const form=new FormData(e.currentTarget);
                      try { const updated=await api<AdminBooking>(`/admin/bookings/${viewDetailBooking.id}/payment`,{paidAmount:Number(form.get('paidAmount')),reason:String(form.get('reason'))});setViewDetailBooking(updated);await refreshAll(); }
                      catch(e){setPaymentError(e instanceof Error?e.message:'Unable to record payment.');}
                    }}>
                      <label className="block text-xs">Total amount received (MUR)<input name="paidAmount" type="number" min="0" step="0.01" required className="block border rounded p-2 mt-1" defaultValue={viewDetailBooking.paidAmount || 0} /></label>
                      <label className="block text-xs">Payment note / receipt reference<input name="reason" required className="block border rounded p-2 mt-1" /></label>
                      <button className="bg-[#17324D] text-white rounded px-3 py-2 text-xs">Record payment</button>
                      {paymentError && <p role="alert" className="text-red-700 text-xs">{paymentError}</p>}
                    </form>
                  </span>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#DCE2E6]">
                  <span className="text-[10px] uppercase font-semibold text-[#65727B] block">Security Deposit</span>
                  <span className="font-bold text-sm text-[#24313A] block mt-0.5">
                    Rs {(viewDetailBooking.securityDeposit ?? 15000).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#65727B]">Refundable at Return</span>
                </div>
              </div>

              {/* HANDOVER BASELINE & DISPUTE AUDIT SECTION */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#4F7D61]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#24313A]">
                      Handover & Inspection Audit Trail (Dispute Protection)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#65727B]">
                    Baseline signed at departure vs check-in condition
                  </span>
                </div>

                {viewDetailBooking.mileageOut ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Departure Baseline Card */}
                    <div className="p-4 rounded-xl border border-[#CCE0D5] bg-[#F7FAF8] space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#D8E6DE]">
                        <span className="font-bold text-[#4F7D61] uppercase tracking-wider text-[11px]">
                          Departure Handover (Agreed with Customer)
                        </span>
                        <span className="text-[10px] text-[#65727B]">
                          {viewDetailBooking.checkedOutAt ? new Date(viewDetailBooking.checkedOutAt).toLocaleString() : 'Departure'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#65727B] text-[10px] uppercase block">Mileage Out</span>
                          <span className="font-bold text-[#24313A] text-sm">
                            {viewDetailBooking.mileageOut.toLocaleString()} km
                          </span>
                        </div>
                        <div>
                          <span className="text-[#65727B] text-[10px] uppercase block">Fuel Tank Out</span>
                          <span className="font-bold text-[#24313A] text-sm">
                            {viewDetailBooking.fuelLevelOut || '8/8 Full'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[#65727B] text-[10px] uppercase block">Departure Condition</span>
                        <span className="text-xs text-[#24313A] font-medium block mt-0.5">
                          {viewDetailBooking.conditionNotesOut || 'Clean and operational'}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-[#FEF9E7] border border-[#FAD7A0]">
                        <span className="text-[#7D5A00] font-bold text-[10px] uppercase block flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pre-Existing Damage Agreed
                        </span>
                        <span className="text-xs text-[#5C4300] font-medium block mt-1">
                          {viewDetailBooking.damageNotesOut || 'No pre-existing damage noted at checkout.'}
                        </span>
                      </div>

                      {viewDetailBooking.checkoutPhotos && viewDetailBooking.checkoutPhotos.length > 0 && (
                        <div>
                          <span className="text-[#65727B] text-[10px] uppercase block mb-1">
                            Handover Photos ({viewDetailBooking.checkoutPhotos.length})
                          </span>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {viewDetailBooking.checkoutPhotos.map((img, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setLightboxPhoto({ url: img, title: `Departure Photo #${i + 1}` })}
                                className="relative w-16 h-14 rounded-lg overflow-hidden border border-[#CCE0D5] flex-shrink-0 group cursor-pointer"
                              >
                                <img src={img} alt="Departure" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                  <Maximize2 className="w-3.5 h-3.5" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Return Inspection Card */}
                    <div className="p-4 rounded-xl border border-[#DCE2E6] bg-white space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-[#DCE2E6]">
                        <span className="font-bold text-[#17324D] uppercase tracking-wider text-[11px]">
                          Check-In Return Inspection
                        </span>
                        <span className="text-[10px] font-semibold text-[#4F7D61]">
                          {viewDetailBooking.bookingStatus === 'completed' ? 'Completed & Verified' : 'Pending Return'}
                        </span>
                      </div>

                      {viewDetailBooking.mileageIn ? (
                        <>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-[#65727B] text-[10px] uppercase block">Mileage In</span>
                              <span className="font-bold text-[#24313A] text-sm">
                                {viewDetailBooking.mileageIn.toLocaleString()} km
                              </span>
                              <span className="text-[10px] text-[#35658A] block">
                                (+{viewDetailBooking.mileageIn - viewDetailBooking.mileageOut} km driven)
                              </span>
                            </div>
                            <div>
                              <span className="text-[#65727B] text-[10px] uppercase block">Fuel Tank In</span>
                              <span className="font-bold text-[#24313A] text-sm">
                                {viewDetailBooking.fuelLevelIn || '8/8 Full'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-[#65727B] text-[10px] uppercase block">Return Condition</span>
                            <span className="text-xs text-[#24313A] font-medium block mt-0.5">
                              {viewDetailBooking.conditionNotesIn || 'Clean return'}
                            </span>
                          </div>

                          <div className={`p-2.5 rounded-lg border ${
                            viewDetailBooking.damageNotesIn && viewDetailBooking.damageNotesIn.toLowerCase() !== 'none' && viewDetailBooking.damageNotesIn.toLowerCase() !== 'no new damage observed.'
                              ? 'bg-[#FDEDEC] border-[#F8D7D5] text-[#7A2724]'
                              : 'bg-[#EEF5F1] border-[#CCE0D5] text-[#24313A]'
                          }`}>
                            <span className="font-bold text-[10px] uppercase block">
                              New Damages Observed on Return
                            </span>
                            <span className="text-xs font-medium block mt-1">
                              {viewDetailBooking.damageNotesIn || 'No new damages observed.'}
                            </span>
                          </div>

                          {viewDetailBooking.checkinPhotos && viewDetailBooking.checkinPhotos.length > 0 && (
                            <div>
                              <span className="text-[#65727B] text-[10px] uppercase block mb-1">
                                Return Photos ({viewDetailBooking.checkinPhotos.length})
                              </span>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {viewDetailBooking.checkinPhotos.map((img, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setLightboxPhoto({ url: img, title: `Return Photo #${i + 1}` })}
                                    className="relative w-16 h-14 rounded-lg overflow-hidden border border-[#DCE2E6] flex-shrink-0 group cursor-pointer"
                                  >
                                    <img src={img} alt="Return" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                      <Maximize2 className="w-3.5 h-3.5" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-6 text-center space-y-3">
                          <p className="text-[#65727B] text-xs">
                            Vehicle is currently out with customer. Refer to the departure baseline on the left during check-in to verify condition.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              const b = viewDetailBooking;
                              setViewDetailBooking(null);
                              setCheckinBooking(b);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-white bg-[#4F7D61] hover:bg-[#436C54] rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Open Vehicle Check-In & Return</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#DCE2E6] text-center text-[#65727B]">
                    Vehicle has not departed yet. Departure handover checklist and photos will appear here once checked out.
                  </div>
                )}
              </div>

              {/* Special Requests / Notes */}
              {viewDetailBooking.specialRequests && (
                <div className="p-3 bg-[#FAFBFB] rounded-lg border border-[#DCE2E6]">
                  <span className="text-[10px] uppercase font-bold text-[#65727B] block mb-1">
                    Special Requests / Booking Notes
                  </span>
                  <p className="text-xs text-[#24313A]">{viewDetailBooking.specialRequests}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#DCE2E6]">
                <button
                  type="button"
                  onClick={() => handlePrintSlip(viewDetailBooking)}
                  className="px-3 py-2 text-xs font-medium text-[#17324D] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Handover Certificate</span>
                </button>

                <div className="flex items-center gap-2">
                  {viewDetailBooking.bookingStatus === 'active' && (
                    <button
                      type="button"
                      onClick={() => {
                        const b = viewDetailBooking;
                        setViewDetailBooking(null);
                        setCheckinBooking(b);
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#4F7D61] hover:bg-[#436C54] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Proceed to Check-In</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewDetailBooking(null)}
                    className="px-4 py-2 text-xs font-medium text-[#24313A] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl border border-[#DCE2E6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#17324D] text-white">
              <span className="text-xs font-semibold">{lightboxPhoto.title}</span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="text-white/80 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={lightboxPhoto.url}
                alt="Enlarged"
                className="max-h-[68vh] max-w-full object-contain rounded"
              />
            </div>
            <div className="p-3 bg-white text-[11px] text-[#65727B] flex items-center justify-between">
              <span>High-Resolution Inspection Record</span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="px-3 py-1 bg-[#F4F6F7] hover:bg-[#EAEFF2] text-[#24313A] rounded font-medium cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
