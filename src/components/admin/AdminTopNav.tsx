import React, { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  Car,
  Calendar,
  Wrench,
  UserCheck,
  ChevronDown,
  ExternalLink,
  Shield,
  User,
} from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface AdminTopNavProps {
  onOpenAddVehicle: () => void;
  onOpenAssignModal: () => void;
  onOpenMaintenanceModal: () => void;
  onOpenWebsite?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  onOpenAddVehicle,
  onOpenAssignModal,
  onOpenMaintenanceModal,
  onOpenWebsite,
}) => {
  const {
    notifications,
    setIsSearchOpen,
    setIsNotificationDrawerOpen,
    users,
    currentUser,
    setCurrentUser,
  } = useAdminData();

  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  return (
    <header
      className="h-16 border-b px-6 flex items-center justify-between z-20 select-none bg-white"
      style={{ borderColor: ADMIN_THEME.border }}
    >
      {/* Search trigger */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="w-full max-w-md flex items-center justify-between px-3.5 py-1.5 text-xs text-[#65727B] bg-[#F4F6F7] hover:bg-[#EAEFF2] border border-[#DCE2E6] rounded-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#65727B]" />
            <span>Search registration, VIN, customer, booking...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-[#DCE2E6] rounded shadow-2xs text-[#65727B]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#17324D] hover:bg-[#1F4366] rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Action</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {isQuickActionsOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setIsQuickActionsOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#DCE2E6] py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    onOpenAddVehicle();
                  }}
                  className="w-full px-3.5 py-2 text-xs text-[#24313A] hover:bg-[#F4F6F7] flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <Car className="w-4 h-4 text-[#35658A]" />
                  <span>Add Fleet Vehicle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    onOpenAssignModal();
                  }}
                  className="w-full px-3.5 py-2 text-xs text-[#24313A] hover:bg-[#F4F6F7] flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <UserCheck className="w-4 h-4 text-[#77838C]" />
                  <span>Assign Vehicle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickActionsOpen(false);
                    onOpenMaintenanceModal();
                  }}
                  className="w-full px-3.5 py-2 text-xs text-[#24313A] hover:bg-[#F4F6F7] flex items-center gap-2.5 cursor-pointer text-left"
                >
                  <Wrench className="w-4 h-4 text-[#B86645]" />
                  <span>Record Maintenance</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative p-2 text-[#65727B] hover:text-[#24313A] hover:bg-[#F4F6F7] rounded-lg transition-colors cursor-pointer"
          title="Operational Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifs > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#B9534F] text-white text-[9px] font-bold flex items-center justify-center">
              {unreadNotifs}
            </span>
          )}
        </button>

        {/* Customer Website Quick Jump */}
        {onOpenWebsite && (
          <button
            type="button"
            onClick={onOpenWebsite}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#35658A] hover:text-[#17324D] bg-[#EDF4F8] hover:bg-[#DEEAF3] rounded-lg transition-colors font-medium cursor-pointer"
          >
            <span>Website</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}

        <div className="h-5 w-[1px] bg-[#DCE2E6] mx-1" />

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 hover:bg-[#F4F6F7] rounded-lg transition-colors cursor-pointer text-left"
          >
            <div className="w-7 h-7 rounded-full bg-[#35658A] text-white font-semibold text-xs flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block leading-tight pr-1">
              <div className="text-xs font-semibold text-[#24313A] truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-[#65727B] flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-[#35658A]" />
                <span>{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown className="w-3 h-3 text-[#65727B]" />
          </button>

          {isUserMenuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setIsUserMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#DCE2E6] p-2 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="px-2 py-1.5 border-b border-[#DCE2E6] mb-1">
                  <div className="font-semibold text-[#24313A]">{currentUser.name}</div>
                  <div className="text-[11px] text-[#65727B]">{currentUser.email}</div>
                  <div className="text-[10px] text-[#35658A] font-medium mt-0.5">Role: {currentUser.role}</div>
                </div>

                <div className="px-2 py-1 text-[10px] font-semibold text-[#8C9BA5] uppercase">
                  Simulate Role Switch
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setCurrentUser(u);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-md text-left flex items-center justify-between cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-[#F1F6FA] text-[#35658A] font-semibold'
                        : 'text-[#24313A] hover:bg-[#F4F6F7]'
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-[#65727B]">{u.role}</div>
                    </div>
                    {u.id === currentUser.id && <span className="text-[10px] font-bold">Active</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
