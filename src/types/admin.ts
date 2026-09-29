export type AdminOperationalStatus =
  | 'available'
  | 'reserved'
  | 'rented'
  | 'assigned'
  | 'in_service'
  | 'compliance_hold'
  | 'inactive';

export type AdminOwnerType = 'Company' | 'Individual' | 'Partner Company' | 'Internal';

export type AdminCategory = 'sedan' | 'suv' | 'economy' | 'van' | 'compact' | 'premium';

export type AdminAssignmentType = 'Staff' | 'Personal' | 'Company' | 'Temporary' | 'Other';
export type AdminAssignmentStatus = 'Active' | 'Completed' | 'Cancelled' | 'active' | 'returned';

export type AdminBookingStatus =
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type AdminPaymentStatus = 'Unpaid' | 'Deposit Paid' | 'Fully Paid' | 'Refunded';

export type MaintenanceServiceType =
  | 'Routine Service'
  | 'Oil Change'
  | 'Tyres'
  | 'Brakes'
  | 'Mechanical'
  | 'Electrical'
  | 'Body Repair'
  | 'Inspection'
  | 'Other';

export type ComplianceType =
  | 'Fitness Certificate'
  | 'Insurance'
  | 'MVL'
  | 'Licence';

export type ComplianceStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export type DocumentType =
  | 'Insurance Certificate'
  | 'Fitness Certificate'
  | 'MVL'
  | 'Licence'
  | 'Purchase Document'
  | 'Service Invoice'
  | 'Inspection'
  | 'Rental Agreement'
  | 'Other';

export type UserRole = 'Super Admin' | 'Admin' | 'Operations Staff' | 'Viewer';

export interface AdminVehicle {
  version?: number;
  id: string;
  slug: string;
  registrationNumber: string; // e.g. "5972 DZ 14"
  brand: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  engineNumber: string;
  category: AdminCategory | string;
  dailyRate: number; // in MUR Rs
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  seats: number;
  luggageCapacity: number;
  doors: number;
  airConditioning: boolean;
  features: string[];
  description: string;
  photos: string[];

  // Ownership & Valuation
  ownerId: string;
  ownerName: string;
  purchaseDate?: string;
  purchaseValue?: number;
  currentValue?: number;

  // Operational State
  mileage: number; // current odometer km
  operationalStatus: AdminOperationalStatus;
  statusChangeReason?: string;
  statusChangedAt?: string;
  published: boolean;
  featured: boolean;

  // Service tracking
  nextServiceMileage?: number;
  nextServiceDate?: string;

  // Active links
  currentAssignmentId?: string;
  currentBookingId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Owner {
  id: string;
  name: string;
  contactPerson?: string;
  ownerType: AdminOwnerType;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
  bankAccount?: string;
  revenueSplitPercentage?: number;
  vehicleCount: number;
  createdAt: string;
}

export interface Assignment {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  assignedTo: string; // Name of staff, partner, or executive
  assignmentType: AdminAssignmentType;
  startDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  actualReturnDate?: string; // YYYY-MM-DD
  mileageOut: number;
  mileageIn?: number;
  reason: string;
  notes?: string;
  status: AdminAssignmentStatus;
  createdAt: string;
}

export interface Customer {
  id: string;
  name?: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  nationality?: string;
  address: string;
  licenceNumber: string;
  licenseNumber?: string;
  licenceExpiryDate: string;
  licenceCountry: string;
  idOrPassport: string;
  rating?: number;
  totalSpend?: number;
  notes?: string;
  totalRentals: number;
  totalBookings?: number;
  createdAt: string;
}

export interface AdminBooking {
  paidAmount?: number;
  id: string;
  reference: string; // e.g. "OCR-2026-0012"
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId: string;
  vehicleName: string;
  vehicleReg: string;
  pickupDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  pickupLocation: string;
  returnLocation: string;
  dailyRate: number;
  days: number;
  estimatedAmount: number;
  finalAmount: number;
  securityDeposit?: number;
  bookingStatus: AdminBookingStatus;
  paymentStatus: AdminPaymentStatus;

  // Check-out record
  mileageOut?: number;
  fuelLevelOut?: string; // e.g. "8/8 Full"
  conditionNotesOut?: string;
  damageNotesOut?: string;
  checkoutPhotos?: string[];
  checkedOutAt?: string;

  // Check-in record
  mileageIn?: number;
  fuelLevelIn?: string;
  conditionNotesIn?: string;
  damageNotesIn?: string;
  checkinPhotos?: string[];
  checkedInAt?: string;

  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  serviceType: MaintenanceServiceType;
  date: string; // YYYY-MM-DD
  mileage: number;
  garage: string;
  description: string;
  partsReplaced?: string;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  nextServiceMileage?: number;
  nextServiceDate?: string;
  invoiceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ComplianceRecord {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  complianceType: ComplianceType;
  company?: string; // e.g. "Swan Insurance", "SICOM", "Phoenix"
  provider?: string; // alias
  broker?: string;
  policyNumber?: string;
  premium?: number;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: ComplianceStatus;
  documentUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  documentType: DocumentType;
  title: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl: string;
  fileSize: string; // e.g. "1.8 MB"
  notes?: string;
  uploadedAt: string;
}

export interface UserPermission {
  vehicles: boolean;
  bookings: boolean;
  customers: boolean;
  financials: boolean;
  documents: boolean;
  reports: boolean;
  users: boolean;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  permissions: UserPermission;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO
  actorName: string;
  performedBy?: string; // alias
  actorRole: string;
  action: string;
  targetType: 'Vehicle' | 'Booking' | 'Assignment' | 'Maintenance' | 'Compliance' | 'Document' | 'User';
  targetEntity?: string; // alias
  targetId: string;
  targetEntityId?: string; // alias
  targetLabel: string;
  details: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface AdminNotification {
  id: string;
  type: 'booking_request' | 'insurance_expiring' | 'vehicle_due_back' | 'service_overdue' | 'vehicle_returned' | 'compliance_expiring' | 'service_due' | 'records_missing';
  requiresAction?: boolean;
  priority?: 'overdue' | 'due_today' | 'upcoming' | 'missing';
  vehicleId?: string;
  vehicleReg?: string;
  actionLabel?: string;
  dueDate?: string;
  daysRemaining?: number;
  mileageRemaining?: number;
  title: string;
  description: string;
  message?: string; // alias
  timestamp: string;
  createdAt?: string; // alias
  read: boolean;
  link?: string;
  linkTo?: string; // alias
}

export interface FleetUtilizationStat {
  totalVehicles: number;
  activeRentals: number;
  assigned: number;
  available: number;
  inService: number;
  complianceHold: number;
  inactive: number;
  utilizationRate: number; // percentage
}

export interface VehiclePerformanceItem {
  vehicleId: string;
  registrationNumber: string;
  name: string;
  purchaseValue: number;
  rentalRevenue: number;
  maintenanceCost: number;
  insuranceCost: number;
  daysRented: number;
  idleDays: number;
  utilizationPercent: number;
  netMargin: number;
}
