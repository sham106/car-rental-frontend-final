import React from 'react';
import {
  CheckCircle2,
  Clock,
  Key,
  UserCheck,
  AlertTriangle,
  Wrench,
  Ban,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { AdminOperationalStatus, AdminBookingStatus, ComplianceStatus } from '../../types/admin';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface StatusBadgeProps {
  status: AdminOperationalStatus | AdminBookingStatus | ComplianceStatus | string;
  type?: 'vehicle' | 'booking' | 'compliance';
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'vehicle',
  size = 'md',
  className = '',
}) => {
  const normStatus = (status || '').toLowerCase();

  // Vehicle Status Config
  if (type === 'vehicle') {
    switch (normStatus) {
      case 'available':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.available.bg,
              color: ADMIN_THEME.status.available.color,
              border: `1px solid ${ADMIN_THEME.status.available.border}`,
            }}
          >
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
            <span>Available</span>
          </span>
        );
      case 'reserved':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.reserved.bg,
              color: ADMIN_THEME.status.reserved.color,
              border: `1px solid ${ADMIN_THEME.status.reserved.border}`,
            }}
          >
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>Reserved</span>
          </span>
        );
      case 'rented':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.rented.bg,
              color: ADMIN_THEME.status.rented.color,
              border: `1px solid ${ADMIN_THEME.status.rented.border}`,
            }}
          >
            <Key className="w-3 h-3 flex-shrink-0" />
            <span>Rented</span>
          </span>
        );
      case 'assigned':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.assigned.bg,
              color: ADMIN_THEME.status.assigned.color,
              border: `1px solid ${ADMIN_THEME.status.assigned.border}`,
            }}
          >
            <UserCheck className="w-3 h-3 flex-shrink-0" />
            <span>Assigned</span>
          </span>
        );
      case 'compliance_hold':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.compliance_hold.bg,
              color: ADMIN_THEME.status.compliance_hold.color,
              border: `1px solid ${ADMIN_THEME.status.compliance_hold.border}`,
            }}
          >
            <ShieldAlert className="w-3 h-3 flex-shrink-0" />
            <span>Compliance Hold</span>
          </span>
        );
      case 'in_service':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.in_service.bg,
              color: ADMIN_THEME.status.in_service.color,
              border: `1px solid ${ADMIN_THEME.status.in_service.border}`,
            }}
          >
            <Wrench className="w-3 h-3 flex-shrink-0" />
            <span>In Service</span>
          </span>
        );
      case 'inactive':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.status.inactive.bg,
              color: ADMIN_THEME.status.inactive.color,
              border: `1px solid ${ADMIN_THEME.status.inactive.border}`,
            }}
          >
            <Ban className="w-3 h-3 flex-shrink-0" />
            <span>Inactive</span>
          </span>
        );
    }
  }

  // Booking Status Config
  if (type === 'booking') {
    switch (normStatus) {
      case 'pending':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.bookingStatus.pending.bg,
              color: ADMIN_THEME.bookingStatus.pending.color,
              border: '1px solid #F4D4C5',
            }}
          >
            <Clock className="w-3 h-3" />
            <span>Pending Request</span>
          </span>
        );
      case 'confirmed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.bookingStatus.confirmed.bg,
              color: ADMIN_THEME.bookingStatus.confirmed.color,
              border: '1px solid #C8DCF0',
            }}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirmed</span>
          </span>
        );
      case 'active':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.bookingStatus.active.bg,
              color: ADMIN_THEME.bookingStatus.active.color,
              border: '1px solid #B8D1E6',
            }}
          >
            <Key className="w-3 h-3" />
            <span>Active Rental</span>
          </span>
        );
      case 'completed':
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: ADMIN_THEME.bookingStatus.completed.bg,
              color: ADMIN_THEME.bookingStatus.completed.color,
              border: '1px solid #CCE0D5',
            }}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
      default:
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
              size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            style={{
              backgroundColor: '#F5F7F8',
              color: '#65727B',
              border: '1px solid #DCE2E6',
            }}
          >
            <Ban className="w-3 h-3" />
            <span className="capitalize">{status}</span>
          </span>
        );
    }
  }

  // Compliance Status Config
  if (normStatus === 'valid') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        style={{
          backgroundColor: ADMIN_THEME.complianceStatus.valid.bg,
          color: ADMIN_THEME.complianceStatus.valid.color,
          border: '1px solid #CCE0D5',
        }}
      >
        <ShieldCheck className="w-3 h-3" />
        <span>Valid</span>
      </span>
    );
  } else if (normStatus.includes('expiring')) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        style={{
          backgroundColor: ADMIN_THEME.complianceStatus.expiring_soon.bg,
          color: ADMIN_THEME.complianceStatus.expiring_soon.color,
          border: '1px solid #F2DDBB',
        }}
      >
        <Clock className="w-3 h-3" />
        <span>Expiring Soon</span>
      </span>
    );
  } else {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        style={{
          backgroundColor: ADMIN_THEME.complianceStatus.expired.bg,
          color: ADMIN_THEME.complianceStatus.expired.color,
          border: '1px solid #F8D7D5',
        }}
      >
        <AlertTriangle className="w-3 h-3" />
        <span>Expired</span>
      </span>
    );
  }
};
