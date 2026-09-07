export const ADMIN_THEME = {
  bg: '#F4F6F7',
  background: '#F4F6F7',
  surface: '#FFFFFF',
  primaryNav: '#17324D',
  primaryText: '#24313A',
  secondaryText: '#65727B',
  border: '#DCE2E6',
  accent: '#D97745',
  accentHover: '#C26534',
  danger: '#B9534F',

  // Sidebar specific styling
  sidebar: {
    bg: '#0E1D2D',
    border: '#17324D',
    text: '#B8C4CC',
    textActive: '#FFFFFF',
    sectionHeader: '#6A7D8B',
  },
  
  // Functional status colors
  status: {
    available: {
      color: '#4F7D61',
      bg: '#EEF5F1',
      border: '#CCE0D5',
      label: 'Available',
    },
    reserved: {
      color: '#477A9C',
      bg: '#EDF4F8',
      border: '#C8DCF0',
      label: 'Reserved',
    },
    rented: {
      color: '#35658A',
      bg: '#EBF2F8',
      border: '#B8D1E6',
      label: 'Rented',
    },
    assigned: {
      color: '#77838C',
      bg: '#F1F4F6',
      border: '#D5DCE2',
      label: 'Assigned',
    },
    compliance_hold: {
      color: '#C88A32',
      bg: '#FBF5EB',
      border: '#F2DDBB',
      label: 'Compliance Hold',
    },
    in_service: {
      color: '#B86645',
      bg: '#FDF2ED',
      border: '#F4D4C5',
      label: 'In Service',
    },
    inactive: {
      color: '#8C969C',
      bg: '#F5F7F8',
      border: '#DFE4E8',
      label: 'Inactive',
    },
  },

  // Booking statuses
  bookingStatus: {
    pending: {
      color: '#D97745',
      bg: '#FDF2ED',
      label: 'Pending Request',
    },
    confirmed: {
      color: '#477A9C',
      bg: '#EDF4F8',
      label: 'Confirmed',
    },
    active: {
      color: '#35658A',
      bg: '#EBF2F8',
      label: 'Active (On Road)',
    },
    completed: {
      color: '#4F7D61',
      bg: '#EEF5F1',
      label: 'Completed',
    },
    cancelled: {
      color: '#8C969C',
      bg: '#F5F7F8',
      label: 'Cancelled',
    },
    rejected: {
      color: '#B9534F',
      bg: '#FDEDEC',
      label: 'Rejected',
    },
  },

  // Compliance statuses
  complianceStatus: {
    valid: {
      color: '#4F7D61',
      bg: '#EEF5F1',
      label: 'Valid',
    },
    expiring_soon: {
      color: '#C88A32',
      bg: '#FBF5EB',
      label: 'Expiring Soon',
    },
    expired: {
      color: '#B9534F',
      bg: '#FDEDEC',
      label: 'Expired',
    },
  },
} as const;
