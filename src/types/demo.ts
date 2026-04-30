/**
 * Demo Product Management Type Definitions
 */

// Product-related types
export interface DemoProduct {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  availableQty: number;
  totalQty: number;
  location: string;
  lastServiceDate: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Maintenance';
  nextAvailableDate: string;
  image?: string;
}

export interface DemoProductFilters {
  searchTerm: string;
  category: string;
  condition?: string;
  availability?: 'available' | 'unavailable' | 'all';
}

// Request-related types
export interface DemoRequest {
  id: string;
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productCode: string;
  quantity: number;
  requestedDate: string;
  demoLocation: string;
  salesRepName: string;
  salesRepEmail: string;
  priority: 'High' | 'Medium' | 'Low';
  requestStatus: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
  submissionDate: string;
  notes: string;
  attachments?: string[];
}

export interface DemoRequestItem extends DemoRequest {
  demoType?: 'In-person' | 'Virtual' | 'Hybrid';
}

// Inventory processing types
export interface DemoRequestState {
  verified: boolean;
  conditionChecked: boolean;
  maintenance: 'none' | 'minor' | 'major' | 'repair';
  approved: boolean;
  assignedWarehouse: string;
  assignedRack: string;
  assignedShelf: string;
  notes: string;
  approvalDate: string;
  approvalBy: string;
}

export interface DemoApprovalPayload {
  demoRequestId: string;
  status: 'Approved' | 'Rejected';
  verified: boolean;
  conditionChecked: boolean;
  maintenance: string;
  assignedWarehouse: string;
  assignedRack: string;
  assignedShelf?: string;
  notes: string;
  rejectionReason?: string;
  approvalDate: string;
  approvalBy: string;
}

// Inventory assignment types
export interface DemoInventoryAssignment {
  id: string;
  demoRequestId: string;
  productId: string;
  warehouseId: string;
  rackId: string;
  shelfId?: string;
  assignmentDate: string;
  status: 'Assigned' | 'In Transit' | 'With Customer' | 'Returned' | 'Damaged';
  trackingNumber?: string;
}

// Tracking types
export interface DemoTracking {
  id: string;
  assignmentId: string;
  eventType: 'Assigned' | 'Shipped' | 'Delivered' | 'Returned' | 'Inspected';
  timestamp: string;
  location: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

// Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter/Query types
export interface RequestFilters {
  status?: 'Pending' | 'Approved' | 'Rejected' | 'all';
  priority?: 'High' | 'Medium' | 'Low' | 'all';
  dateFrom?: string;
  dateTo?: string;
  customerName?: string;
  salesRepId?: string;
}

// Notification types
export interface DemoNotification {
  id: string;
  type: 'approval' | 'rejection' | 'assignment' | 'shipment' | 'return';
  recipientId: string;
  recipientEmail: string;
  subject: string;
  message: string;
  demoRequestId: string;
  sentAt: string;
  read: boolean;
}

// Component prop types
export interface CheckDemoProductAvailabilityProps {
  onProductSelect?: (product: DemoProduct) => void;
  onCreateRequest?: (product: DemoProduct) => void;
  singleView?: 'calendar' | 'list';
}

export interface InventoryReceivesDemoRequestProps {
  requestId?: string;
  onRequestProcessed?: (requestId: string, status: string) => void;
  showFilters?: boolean;
}

// Statistics types
export interface DemoStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedDemos: number;
  averageApprovalTime: number;
  conversionRate: number;
}

// Export types
export type DemoProductCondition = 'Excellent' | 'Good' | 'Fair' | 'Maintenance';
export type RequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';
export type DemoType = 'In-person' | 'Virtual' | 'Hybrid';
export type MaintenanceStatus = 'none' | 'minor' | 'major' | 'repair';
export type TrackingEventType = 'Assigned' | 'Shipped' | 'Delivered' | 'Returned' | 'Inspected';
