import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  UserCheck,
  Calendar,
  Contact,
  Wrench,
  ShieldAlert,
  FileText,
  Globe,
  BarChart3,
  UserCog,
  FileSpreadsheet,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ADMIN_THEME } from '../../constants/adminTheme';
import { useAdminData } from '../../context/AdminDataContext';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  onOpenWebsite?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  setIsCollapsed,
  onOpenWebsite,
}) => {
  const { bookings, compliance, maintenance } = useAdminData();

  const pendingBookings = bookings.filter((b) => b.bookingStatus === 'pending').length;
  const complianceIssues = compliance.filter((c) => c.status === 'Expired' || c.status === 'Expiring Soon').length;

  const NAV_SECTIONS = [
    {
      title: 'OPERATIONAL CORE',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'FLEET MANAGEMENT',
      items: [
        { id: 'fleet', label: 'Fleet Vehicles', icon: Car },
        { id: 'owners', label: 'Vehicle Owners', icon: Users },
        { id: 'assignments', label: 'Assignments', icon: UserCheck },
      ],
    },
    {
      title: 'RENTAL WORKFLOWS',
      items: [
        { id: 'bookings', label: 'Bookings & Rentals', icon: Calendar, badge: pendingBookings, badgeColor: '#C4623C' },
        { id: 'customers', label: 'Customers', icon: Contact },
      ],
    },
    {
      title: 'OPERATIONS & COMPLIANCE',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'compliance', label: 'Compliance & Legal', icon: ShieldAlert, badge: complianceIssues, badgeColor: '#B9534F' },
        { id: 'documents', label: 'Vehicle Documents', icon: FileText },
      ],
    },
    {
      title: 'BUSINESS & REPORTING',
      items: [
        { id: 'website-listings', label: 'Website Listings', icon: Globe },
        { id: 'reports', label: 'Fleet Reports', icon: BarChart3 },
      ],
    },
    {
      title: 'DATA & SYSTEM',
      items: [
        { id: 'excel-import', label: 'Excel Import Wizard', icon: FileSpreadsheet },
        { id: 'users-roles', label: 'Users & Permissions', icon: UserCog },
        { id: 'settings', label: 'System Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen flex flex-col border-r transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        backgroundColor: ADMIN_THEME.sidebar.bg,
        borderColor: ADMIN_THEME.sidebar.border,
      }}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b" style={{ borderColor: ADMIN_THEME.sidebar.border }}>
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#35658A] flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
              O
            </div>
            <div className="leading-tight">
              <div className="font-bold text-sm text-[#F4F6F8] tracking-tight truncate">
                Oceane Fleet
              </div>
              <div className="text-[10px] text-[#8C9BA5] uppercase tracking-wider font-medium">
                Operations & Admin
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-[#35658A] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            O
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-[#8C9BA5] hover:text-white p-1 rounded-md transition-colors ${
            isCollapsed ? 'hidden' : 'block'
          }`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div
                className="px-2 mb-1.5 text-[10px] font-semibold tracking-wider uppercase"
                style={{ color: ADMIN_THEME.sidebar.sectionHeader }}
              >
                {section.title}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left relative group ${
                      isActive
                        ? 'bg-[#17324D] text-white font-semibold'
                        : 'text-[#B8C4CC] hover:bg-[#152738] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#5084A8]' : 'text-[#8C9BA5] group-hover:text-white'}`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1">{item.label}</span>
                    )}
                    {!isCollapsed && Boolean(item.badge && item.badge > 0) && (
                      <span
                        className="px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white leading-tight"
                        style={{ backgroundColor: item.badgeColor || '#35658A' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isCollapsed && Boolean(item.badge && item.badge > 0) && (
                      <span
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.badgeColor || '#35658A' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Quick Launch Customer Website */}
      <div className="p-3 border-t" style={{ borderColor: ADMIN_THEME.sidebar.border }}>
        {onOpenWebsite && (
          <button
            type="button"
            onClick={onOpenWebsite}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg text-[#B8C4CC] hover:text-white bg-[#152738] hover:bg-[#1A3147] transition-colors cursor-pointer ${
              isCollapsed ? 'p-2' : ''
            }`}
            title="Switch to Customer Booking Website"
          >
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            {!isCollapsed && <span>Customer Website</span>}
          </button>
        )}

        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="w-full mt-2 text-[#8C9BA5] hover:text-white p-1 flex items-center justify-center rounded-md"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
