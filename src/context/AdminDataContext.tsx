import { api } from '../services/api';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminVehicle,
  AdminBooking,
  Assignment,
  Owner,
  Customer,
  MaintenanceRecord,
  ComplianceRecord,
  VehicleDocument,
  AuditLog,
  AdminNotification,
  AdminOperationalStatus,
} from '../types/admin';
import { adminVehicleService } from '../services/admin/adminVehicleService';
import { adminBookingService, CheckOutInput, CheckInInput } from '../services/admin/adminBookingService';
import { adminAssignmentService } from '../services/admin/adminAssignmentService';
import { adminOwnerService } from '../services/admin/adminOwnerService';
import { adminCustomerService } from '../services/admin/adminCustomerService';
import { adminMaintenanceService } from '../services/admin/adminMaintenanceService';
import { adminComplianceService } from '../services/admin/adminComplianceService';
import { adminDocumentService } from '../services/admin/adminDocumentService';
import { adminAuditService } from '../services/admin/adminAuditService';
import { adminNotificationService } from '../services/admin/adminNotificationService';

interface AdminDataContextType {
  vehicles: AdminVehicle[];
  bookings: AdminBooking[];
  assignments: Assignment[];
  owners: Owner[];
  customers: Customer[];
  maintenance: MaintenanceRecord[];
  compliance: ComplianceRecord[];
  documents: VehicleDocument[];
  auditLogs: AuditLog[];
  notifications: AdminNotification[];
  isLoading: boolean;
  actionError: string | null;
  refreshAll: () => Promise<void>;

  // Common quick actions
  changeVehicleStatus: (id: string, newStatus: AdminOperationalStatus, reason: string) => Promise<void>;
  toggleVehiclePublish: (id: string, published: boolean) => Promise<void>;
  toggleVehicleFeatured: (id: string, featured: boolean) => Promise<void>;
  confirmBooking: (id: string) => Promise<void>;
  rejectBooking: (id: string, reason: string) => Promise<void>;
  cancelBooking: (id: string, reason: string) => Promise<void>;
  checkOutBooking: (id: string, checkout: CheckOutInput) => Promise<void>;
  checkInBooking: (id: string, checkin: CheckInInput) => Promise<void>;
  endAssignment: (id: string, mileageIn: number, notes?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Modals & global UI triggers
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [compliance, setCompliance] = useState<ComplianceRecord[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  // Global search & notification drawer controls
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const refreshAll = useCallback(async () => {
    try {
      const data = await api<{vehicles:AdminVehicle[];bookings:AdminBooking[];assignments:Assignment[];owners:Owner[];customers:Customer[];maintenance:MaintenanceRecord[];compliance:ComplianceRecord[];documents:VehicleDocument[];audit:AuditLog[];notifications:AdminNotification[]}>('/admin/data');
      const {vehicles:vList,bookings:bList,assignments:aList,owners:oList,customers:cList,maintenance:mList,compliance:compList,documents:dList,audit:logList,notifications:notifList} = data;
      setActionError(null);

      setVehicles(vList);
      setBookings(bList);
      setAssignments(aList);
      setOwners(oList);
      setCustomers(cList);
      setMaintenance(mList);
      setCompliance(compList);
      setDocuments(dList);
      setAuditLogs(logList);
      setNotifications(notifList);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to load fleet data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') refreshAll(); }, 30000);
    window.addEventListener('focus', refreshAll);

    const handleFleetUpdate = () => refreshAll();
    window.addEventListener('oceane_fleet_updated', handleFleetUpdate);
    window.addEventListener('oceane_bookings_updated', handleFleetUpdate);
    window.addEventListener('oceane_assignments_updated', handleFleetUpdate);
    window.addEventListener('oceane_owners_updated', handleFleetUpdate);
    window.addEventListener('oceane_customers_updated', handleFleetUpdate);
    window.addEventListener('oceane_maint_updated', handleFleetUpdate);
    window.addEventListener('oceane_compliance_updated', handleFleetUpdate);
    window.addEventListener('oceane_docs_updated', handleFleetUpdate);
    window.addEventListener('oceane_audit_updated', handleFleetUpdate);
    window.addEventListener('oceane_notifs_updated', handleFleetUpdate);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshAll);
      window.removeEventListener('oceane_fleet_updated', handleFleetUpdate);
      window.removeEventListener('oceane_bookings_updated', handleFleetUpdate);
      window.removeEventListener('oceane_assignments_updated', handleFleetUpdate);
      window.removeEventListener('oceane_owners_updated', handleFleetUpdate);
      window.removeEventListener('oceane_customers_updated', handleFleetUpdate);
      window.removeEventListener('oceane_maint_updated', handleFleetUpdate);
      window.removeEventListener('oceane_compliance_updated', handleFleetUpdate);
      window.removeEventListener('oceane_docs_updated', handleFleetUpdate);
      window.removeEventListener('oceane_audit_updated', handleFleetUpdate);
      window.removeEventListener('oceane_notifs_updated', handleFleetUpdate);
    };
  }, [refreshAll]);

  // Keyboard shortcut Ctrl/Cmd+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeVehicleStatus = async (id: string, newStatus: AdminOperationalStatus, reason: string) => {
    await adminVehicleService.changeOperationalStatus(id, newStatus, reason);
    await refreshAll();
  };

  const toggleVehiclePublish = async (id: string, published: boolean) => {
    await adminVehicleService.setPublished(id, published);
    await refreshAll();
  };

  const toggleVehicleFeatured = async (id: string, featured: boolean) => {
    await adminVehicleService.setFeatured(id, featured);
    await refreshAll();
  };

  const confirmBooking = async (id: string) => {
    setActionError(null);
    try {
      await adminBookingService.confirmBooking(id);
      await refreshAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to confirm this booking.');
    }
  };

  const rejectBooking = async (id: string, reason: string) => {
    await adminBookingService.rejectBooking(id, reason);
    await refreshAll();
  };

  const cancelBooking = async (id: string, reason: string) => {
    await adminBookingService.cancelBooking(id, reason);
    await refreshAll();
  };

  const checkOutBooking = async (id: string, checkout: CheckOutInput) => {
    await adminBookingService.checkOutBooking(id, checkout);
    await refreshAll();
  };

  const checkInBooking = async (id: string, checkin: CheckInInput) => {
    await adminBookingService.checkInBooking(id, checkin);
    await refreshAll();
  };

  const endAssignment = async (id: string, mileageIn: number, notes?: string) => {
    await adminAssignmentService.endAssignment(id, mileageIn, notes);
    await refreshAll();
  };

  const markNotificationRead = async (id: string) => {
    await adminNotificationService.markAsRead(id);
    await refreshAll();
  };

  const markAllNotificationsRead = async () => {
    await adminNotificationService.markAllAsRead();
    await refreshAll();
  };

  return (
    <AdminDataContext.Provider
      value={{
        vehicles,
        bookings,
        assignments,
        owners,
        customers,
        maintenance,
        compliance,
        documents,
        auditLogs,
        notifications,
        isLoading,
        actionError,
        refreshAll,
        changeVehicleStatus,
        toggleVehiclePublish,
        toggleVehicleFeatured,
        confirmBooking,
        rejectBooking,
        cancelBooking,
        checkOutBooking,
        checkInBooking,
        endAssignment,
        markNotificationRead,
        markAllNotificationsRead,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = (): AdminDataContextType => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within an AdminDataProvider');
  return ctx;
};
