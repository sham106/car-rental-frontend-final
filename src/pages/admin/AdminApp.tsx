import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminDataProvider, useAdminData } from '../../context/AdminDataContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDashboard } from './AdminDashboard';
import { FleetManagementView } from './FleetManagementView';
import { BookingsManagementView } from './BookingsManagementView';
import { AssignmentsView } from './AssignmentsView';
import { MaintenanceView } from './MaintenanceView';
import { ComplianceView } from './ComplianceView';
import { DocumentsView } from './DocumentsView';
import { WebsiteListingsView } from './WebsiteListingsView';
import { ReportsView } from './ReportsView';
import { ExcelImportView } from './ExcelImportView';
import { OwnersView } from './OwnersView';
import { CustomersView } from './CustomersView';
import { UsersRolesView } from './UsersRolesView';
import { AdminAuditView } from './AdminAuditView';
import { SystemSettingsView } from './SystemSettingsView';
import { AddVehicleModal } from './AddVehicleModal';
import { VehicleProfileModal } from './VehicleProfileModal';
import { ChangeStatusModal } from '../../components/admin/ChangeStatusModal';
import { AdminErrorBoundary } from '../../components/admin/AdminErrorBoundary';
import { AdminVehicle } from '../../types/admin';

const normalizeTab = (raw: string): string => {
  const clean = (raw || '').toLowerCase().trim();
  if (!clean || clean === 'dashboard') return 'dashboard';
  if (clean === 'fleet' || clean === 'vehicles') return 'fleet';
  if (clean === 'bookings' || clean === 'rentals' || clean === 'reservations') return 'bookings';
  if (clean === 'assignments' || clean === 'internal-custody') return 'assignments';
  if (clean === 'maintenance' || clean === 'service') return 'maintenance';
  if (clean === 'compliance' || clean === 'legal') return 'compliance';
  if (clean === 'documents' || clean === 'docs') return 'documents';
  if (clean === 'website-listings' || clean === 'website' || clean === 'listings') return 'website-listings';
  if (clean === 'reports' || clean === 'analytics') return 'reports';
  if (clean === 'excel-import' || clean === 'import') return 'excel-import';
  if (clean === 'owners') return 'owners';
  if (clean === 'customers') return 'customers';
  if (clean === 'users-roles' || clean === 'users') return 'users-roles';
  if (clean === 'audit' || clean === 'logs') return 'audit';
  if (clean === 'settings' || clean === 'config') return 'settings';
  return clean;
};

const AdminContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract tab from location.pathname, e.g. /admin/bookings -> 'bookings'
  const subpath = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || '';
  const initialTab = normalizeTab(subpath);

  const [activeTab, setActiveTabState] = useState<string>(initialTab);

  // Sync state when URL pathname changes (e.g. back/forward button)
  useEffect(() => {
    const currentFromPath = normalizeTab(subpath);
    if (currentFromPath !== activeTab) {
      setActiveTabState(currentFromPath);
    }
  }, [subpath]);

  const handleSelectTab = (tab: string) => {
    const normalized = normalizeTab(tab);
    setActiveTabState(normalized);
    if (normalized === 'dashboard') {
      navigate('/admin');
    } else {
      navigate(`/admin/${normalized}`);
    }
  };

  // Modals state
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<AdminVehicle | null>(null);
  const [profileVehicle, setProfileVehicle] = useState<AdminVehicle | null>(null);
  const [statusVehicle, setStatusVehicle] = useState<AdminVehicle | null>(null);

  const { refreshAll, changeVehicleStatus } = useAdminData();

  const handleOpenAdd = () => {
    setVehicleToEdit(null);
    setIsAddVehicleOpen(true);
  };

  const handleOpenEdit = (v: AdminVehicle) => {
    setVehicleToEdit(v);
    setIsAddVehicleOpen(true);
  };

  const handleOpenProfile = (v: AdminVehicle) => {
    setProfileVehicle(v);
  };

  return (
    <AdminLayout
      currentTab={activeTab}
      onSelectTab={handleSelectTab}
      onOpenAddVehicle={handleOpenAdd}
      onOpenWebsite={() => navigate('/')}
    >
      <AdminErrorBoundary fallbackTitle={`Error displaying ${activeTab} view`} onReset={() => handleSelectTab('dashboard')}>
        {/* Route Views */}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            onNavigate={handleSelectTab}
            onOpenAddVehicle={handleOpenAdd}
            onSelectVehicleProfile={handleOpenProfile}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManagementView
            onOpenAddVehicle={handleOpenAdd}
            onOpenEditVehicle={handleOpenEdit}
            onSelectVehicleProfile={handleOpenProfile}
          />
        )}

        {activeTab === 'bookings' && <BookingsManagementView />}

        {activeTab === 'assignments' && <AssignmentsView />}

        {activeTab === 'maintenance' && <MaintenanceView />}

        {activeTab === 'compliance' && <ComplianceView />}

        {activeTab === 'documents' && <DocumentsView />}

        {(activeTab === 'website-listings' || activeTab === 'website') && (
          <WebsiteListingsView onOpenWebsite={() => navigate('/fleet')} />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {(activeTab === 'excel-import' || activeTab === 'import') && <ExcelImportView />}

        {activeTab === 'owners' && <OwnersView />}

        {activeTab === 'customers' && <CustomersView />}

        {(activeTab === 'users-roles' || activeTab === 'users') && <UsersRolesView />}

        {activeTab === 'audit' && <AdminAuditView />}

        {activeTab === 'settings' && <SystemSettingsView />}
      </AdminErrorBoundary>

      {/* Global Add / Edit Vehicle Modal */}
      <AddVehicleModal
        vehicleToEdit={vehicleToEdit}
        isOpen={isAddVehicleOpen}
        onClose={() => {
          setIsAddVehicleOpen(false);
          setVehicleToEdit(null);
        }}
        onSuccess={refreshAll}
      />

      {/* 360° Profile Inspector Modal */}
      <VehicleProfileModal
        vehicle={profileVehicle}
        isOpen={Boolean(profileVehicle)}
        onClose={() => setProfileVehicle(null)}
        onOpenStatusModal={(v) => setStatusVehicle(v)}
        onOpenEditModal={(v) => handleOpenEdit(v)}
      />

      {/* Direct Status Modal */}
      <ChangeStatusModal
        vehicle={statusVehicle}
        isOpen={Boolean(statusVehicle)}
        onClose={() => setStatusVehicle(null)}
        onSubmit={async (id, newStatus, reason) => {
          await changeVehicleStatus(id, newStatus, reason);
        }}
      />
    </AdminLayout>
  );
};

export const AdminApp: React.FC = () => {
  return (
    <AdminDataProvider>
      <AdminContent />
    </AdminDataProvider>
  );
};

