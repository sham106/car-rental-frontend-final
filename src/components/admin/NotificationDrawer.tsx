import React, { useState } from 'react';
import { X, Bell, Check, ShieldAlert, Wrench, Calendar, CheckCircle2 } from 'lucide-react';
import { useAdminData } from '../../context/AdminDataContext';
import { ADMIN_THEME } from '../../constants/adminTheme';

interface NotificationDrawerProps {
  onNavigate: (tab: string, entityId?: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onNavigate }) => {
  const {
    notifications,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAdminData();

  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  if (!isNotificationDrawerOpen) return null;

  const displayed = notifications.filter((n) => (filter === 'unread' ? !n.read : true));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'compliance_alert':
        return <ShieldAlert className="w-4 h-4 text-[#B9534F]" />;
      case 'maintenance_due':
        return <Wrench className="w-4 h-4 text-[#B86645]" />;
      case 'booking_request':
        return <Calendar className="w-4 h-4 text-[#35658A]" />;
      case 'vehicle_returned':
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#4F7D61]" />;
    }
  };

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.read) {
      await markNotificationRead(notif.id);
    }
    setIsNotificationDrawerOpen(false);
    if (notif.linkTo) {
      onNavigate(notif.linkTo);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className="w-screen max-w-md bg-white shadow-2xl border-l flex flex-col animate-in slide-in-from-right duration-200"
          style={{ borderColor: ADMIN_THEME.border }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#DCE2E6] flex items-center justify-between bg-[#F4F6F7]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#17324D]" />
              <h3 className="font-semibold text-base text-[#24313A]">Operational Alerts</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#B9534F] text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsNotificationDrawerOpen(false)}
              className="text-[#65727B] hover:text-[#24313A] p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Filters & Mark all read */}
          <div className="px-4 py-2.5 border-b border-[#DCE2E6] flex items-center justify-between bg-white text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  filter === 'unread'
                    ? 'bg-[#17324D] text-white'
                    : 'text-[#65727B] hover:bg-gray-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#17324D] text-white'
                    : 'text-[#65727B] hover:bg-gray-100'
                }`}
              >
                All ({notifications.length})
              </button>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead()}
                className="text-[#35658A] hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {displayed.length === 0 ? (
              <div className="text-center py-12 text-[#65727B] text-sm">
                No {filter === 'unread' ? 'unread ' : ''}notifications at this time.
              </div>
            ) : (
              displayed.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-[#F9FBFC] border-[#C8DCF0] hover:bg-[#F1F6FA]'
                      : 'bg-white border-[#E5E9EC] hover:bg-[#F8F9FA] opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-2 rounded-lg bg-white border border-[#DCE2E6] shadow-2xs">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#24313A]">{n.title}</span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#35658A] flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-[#65727B] mt-1 leading-normal">{n.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-[#95A2AA]">
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        <span className="text-[#35658A] font-medium hover:underline">View details →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
