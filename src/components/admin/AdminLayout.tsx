import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { AssignVehicleModal } from './AssignVehicleModal';
import { RecordMaintenanceModal } from './RecordMaintenanceModal';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AdminLayoutProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab: (tab: string, entityId?: string) => void;
  onOpenAddVehicle?: () => void;
  onOpenWebsite?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onOpenAddVehicle = () => {},
  onOpenWebsite,
  children,
}) => {
  const effectiveTab = currentTab || activeTab || 'dashboard';
  const { vehicles, refreshAll } = useAdminData();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: ADMIN_THEME.background }}>
      {/* Sidebar */}
      <AdminSidebar
        currentTab={effectiveTab}
        onSelectTab={onSelectTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenWebsite={onOpenWebsite}
      />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopNav
          onOpenAddVehicle={onOpenAddVehicle}
          onOpenAssignModal={() => setIsAssignModalOpen(true)}
          onOpenMaintenanceModal={() => setIsMaintenanceModalOpen(true)}
          onOpenWebsite={onOpenWebsite}
        />

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Search Dialog */}
      <GlobalSearchModal onNavigate={onSelectTab} />

      {/* Slide-out Notifications */}
      <NotificationDrawer onNavigate={onSelectTab} />

      {/* Global Quick Assign Modal */}
      <AssignVehicleModal
        vehicle={null}
        vehiclesList={vehicles.filter((v) => v.operationalStatus === 'available')}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={refreshAll}
      />

      {/* Global Quick Maintenance Modal */}
      <RecordMaintenanceModal
        vehicle={null}
        vehiclesList={vehicles}
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
};
