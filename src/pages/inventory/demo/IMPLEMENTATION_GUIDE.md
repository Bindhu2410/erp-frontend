# Demo Product Management - Implementation Guide

## Overview

This module implements the demo product management workflow with two main screens:

1. **Check Demo Product Availability** - Sales/Customer facing interface
2. **Inventory Department Receives Demo Request** - Inventory management interface

## Screen 1: Check Demo Product Availability

### Features

#### Calendar View
- Mini date picker to select demo dates
- Real-time product availability display for selected date
- Product condition indicators
- Available/Total quantity display
- Inventory location information
- Demo requests sidebar for selected date

#### List View
- Searchable table of all demo products
- Filterable by category
- Sortable columns (Product, Category, Location, Availability, Condition, Next Available)
- Quick action buttons for product selection
- Status indicators with color coding

### Key Components

```typescript
Interface DemoProduct {
  id: string;
  productName: string;
  productCode: string;
  category: string;
  availableQty: number;      // Current available quantity
  totalQty: number;           // Total demo units
  location: string;           // Warehouse location
  lastServiceDate: string;    // Last maintenance
  condition: string;          // Excellent/Good/Fair/Maintenance
  nextAvailableDate: string;  // When product will be available
  image?: string;            // Optional product image
}

Interface DemoRequest {
  id: string;
  customerName: string;
  productRequired: string;
  requestedDate: string;
  demoType: string;          // In-person/Virtual
  status: string;            // Pending/Scheduled
  priority: string;          // High/Medium/Low
}
```

### User Flow

```
1. Sales Rep / Customer accesses "Check Demo Product Availability"
2. Selects Calendar or List View
3. Searches/Filters products by category or name
4. Views product details:
   - Availability status
   - Product condition
   - Storage location
   - Next available date
5. Clicks "Select" to create demo request
6. Proceeds to "Create Inventory Demo Request" page
```

### API Integration

Replace sample data calls with:

```typescript
// Fetch all demo products
const res = await api.get("DemoProducts");

// Fetch specific date requests
const res = await api.get(`DemoRequests?date=${selectedDate}`);

// Fetch product categories
const res = await api.get("DemoProductCategories");
```

---

## Screen 2: Inventory Receives Demo Request

### Features

#### Request Management
- List view with status filtering (Pending/Approved/Rejected/All)
- Real-time request status updates
- Click-to-select request details
- Priority indicators (High/Medium/Low)
- Submission date tracking

#### Verification Workflow

1. **Verify Product Availability**
   - Checkbox to confirm product is in stock
   - Validates quantity matches customer requirement
   - Blocks approval without verification

2. **Check Product Condition/Maintenance**
   - Checkbox to confirm physical inspection
   - Maintenance status dropdown:
     - No Maintenance Needed
     - Minor Maintenance
     - Major Maintenance Required
     - Repair Required
   - Blocks approval until checked

3. **Assign Product Location**
   - Warehouse field (required)
   - Rack field (required)
   - Shelf field (optional)
   - Validates all required fields before approval

4. **Additional Notes**
   - Free text field for special conditions
   - Tracked in approval record

#### Approval/Rejection

- **Approve Request**: Creates inventory assignment
- **Reject Request**: Requires rejection reason, notifies requester

### Key Components

```typescript
Interface DemoRequestItem {
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
  requestStatus: 'Pending' | 'Approved' | 'Rejected';
  submissionDate: string;
  notes: string;
  attachments?: string[];
}

Interface DemoRequestState {
  verified: boolean;                  // Product availability verified
  conditionChecked: boolean;          // Physical condition checked
  maintenance: string;                // Maintenance status
  approved: boolean;                  // Approval status
  assignedWarehouse: string;          // Warehouse location
  assignedRack: string;              // Rack location
  assignedShelf: string;             // Shelf location (optional)
  notes: string;                     // Additional notes
  approvalDate: string;              // When approved
  approvalBy: string;                // User ID who approved
}
```

### Validation Rules

```typescript
Before Approval:
✓ Product availability must be verified
✓ Product condition must be checked
✓ Warehouse location must be assigned
✓ Rack location must be assigned
✗ Maintenance status can be any value
✗ Shelf location is optional

Before Rejection:
✓ Rejection reason must be provided
```

### Color Coding

**Status Badges:**
- Pending: Blue
- Approved: Green
- Rejected: Red
- In Progress: Purple

**Priority Badges:**
- High: Red
- Medium: Yellow
- Low: Green

### User Flow

```
1. Inventory manager accesses "Inventory Receives Demo Request"
2. Views list of pending requests (auto-filtered)
3. Clicks on a request to view full details
4. Performs verification steps:
   ✓ Confirms product availability
   ✓ Checks physical condition
   - Notes any maintenance issues
5. Assigns product location:
   - Selects warehouse
   - Selects rack
   - Optionally selects shelf
6. Adds any special notes
7. Clicks "Approve Request" or "Reject Request"
8. In modal:
   - Confirms action
   - (If rejecting) Provides reason
   - Clicks final confirmation
9. Request status updates, notifications sent to:
   - Sales rep
   - Customer
   - Inventory team
```

---

## Integration Checklist

### 1. Route Setup

Add to your router configuration:

```typescript
// In your main routing file (e.g., App.tsx or routes.tsx)
import {
  CheckDemoProductAvailability,
  InventoryReceivesDemoRequest,
} from '@/pages/inventory/demo';

// Add routes
{
  path: '/inventory/demo',
  children: [
    {
      path: 'check-availability',
      element: <CheckDemoProductAvailability />,
      // Add auth guard if needed
      // element: withAuth(<CheckDemoProductAvailability />)
    },
    {
      path: 'receive-request',
      element: <InventoryReceivesDemoRequest />,
      // Add admin/inventory auth guard
      // element: withAdminAuth(<InventoryReceivesDemoRequest />)
    },
  ],
}
```

### 2. API Endpoints (Backend Requirements)

Create these endpoints in your backend:

**GET Endpoints:**
```
GET /api/DemoProducts
GET /api/DemoProducts/{id}
GET /api/DemoRequests
GET /api/DemoRequests/{id}
GET /api/DemoRequests?status=pending
GET /api/DemoProductCategories
```

**POST Endpoints:**
```
POST /api/DemoRequests/approve
  {
    demoRequestId: string;
    verified: boolean;
    conditionChecked: boolean;
    maintenance: string;
    assignedWarehouse: string;
    assignedRack: string;
    assignedShelf?: string;
    notes: string;
    approvalDate: string;
    approvalBy: string;
  }

POST /api/DemoRequests/reject
  {
    demoRequestId: string;
    rejectionReason: string;
    rejectedBy: string;
    rejectionDate: string;
  }

POST /api/DemoInventory/track
  {
    demoRequestId: string;
    productId: string;
    warehouseId: string;
    rackId: string;
  }
```

### 3. Database Schema (Reference)

**DemoProducts Table:**
```sql
CREATE TABLE DemoProducts (
  id UNIQUEIDENTIFIER PRIMARY KEY,
  productId INT,
  productName NVARCHAR(255),
  productCode NVARCHAR(50),
  category NVARCHAR(100),
  totalQuantity INT,
  availableQuantity INT,
  warehouseId INT,
  location NVARCHAR(255),
  lastServiceDate DATETIME,
  condition NVARCHAR(50),
  nextAvailableDate DATETIME,
  isActive BIT,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE DemoRequests (
  id UNIQUEIDENTIFIER PRIMARY KEY,
  requestId NVARCHAR(50),
  customerId INT,
  customerName NVARCHAR(255),
  customerEmail NVARCHAR(255),
  customerPhone NVARCHAR(20),
  productId INT,
  productCode NVARCHAR(50),
  quantity INT,
  requestedDate DATETIME,
  demoLocation NVARCHAR(255),
  demoType NVARCHAR(50),
  salesRepId INT,
  salesRepName NVARCHAR(255),
  priority NVARCHAR(20),
  status NVARCHAR(50),
  notes NVARCHAR(MAX),
  submissionDate DATETIME,
  approvalDate DATETIME,
  rejectionDate DATETIME,
  rejectionReason NVARCHAR(MAX),
  approvedBy INT,
  rejectedBy INT,
  createdAt DATETIME,
  updatedAt DATETIME
);

CREATE TABLE DemoInventoryAssignments (
  id UNIQUEIDENTIFIER PRIMARY KEY,
  demoRequestId UNIQUEIDENTIFIER,
  productId INT,
  warehouseId INT,
  rackId INT,
  shelfId INT,
  assignmentDate DATETIME,
  returnDate DATETIME,
  status NVARCHAR(50),
  notes NVARCHAR(MAX),
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### 4. Context/User Integration

Both screens use `UserContext` for user information:

```typescript
const { user, role } = useUser();
// user.userId - ID of current user
// role - User's role for permission checking
```

Add role-based access control:
```typescript
// For Inventory Receive page - restrict to inventory/admin only
if (role !== 'inventory' && role !== 'admin') {
  return <AccessDenied />;
}
```

### 5. Notification Integration

Add notifications for approval/rejection:

```typescript
// After approval/rejection
const notifyUsers = async (requestId, action) => {
  // Notify sales rep
  // Notify customer
  // Notify inventory team
  // Update demo schedule
};
```

### 6. State Management (Optional)

For complex scenarios, consider Redux/Zustand:

```typescript
// Example with Redux
store.dispatch(fetchDemoRequests());
store.dispatch(approveDemoRequest({
  requestId,
  assignedLocation,
  notes
}));
```

---

## Styling Notes

- **Tailwind CSS**: Both components use Tailwind utilities
- **Color Scheme**: Blue (#0066cc) primary, green/yellow/red for status
- **Icons**: Lucide React icons used throughout
- **Responsive**: Full mobile/tablet support with grid layouts

## Future Enhancements

1. **Email Notifications** - Auto-send to customers and sales reps
2. **Demo Tracking** - Track product handover and return dates
3. **QC Integration** - Link to quality checks before demo
4. **Calendar Sync** - Integrate with calendar applications
5. **Document Management** - Store demo agreements and notes
6. **Analytics** - Track demo success rates and conversion
7. **Mobile App** - Offline capability for field visits
8. **Print/Export** - Generate demo request documents

---

## Testing Checklist

- [ ] Test calendar view navigation
- [ ] Test product search and filtering
- [ ] Test list view with sorting
- [ ] Test request approval workflow
- [ ] Test request rejection workflow
- [ ] Test validation rules
- [ ] Test API integration
- [ ] Test error handling
- [ ] Test responsive design
- [ ] Test accessibility (keyboard navigation, screen readers)

---

## File Structure

```
src/pages/inventory/demo/
├── index.ts                              # Export components
├── CheckDemoProductAvailability.tsx      # Screen 1
├── InventoryReceivesDemoRequest.tsx      # Screen 2
└── IMPLEMENTATION_GUIDE.md              # This file

Types should be added to:
src/types/demo.ts (recommended)
```

---

## Support & Debugging

Common issues and solutions:

**Issue**: Products not loading
- Check API endpoint URL
- Verify CORS configuration
- Check browser console for errors

**Issue**: Approval not saving
- Verify all validation rules are met
- Check API POST endpoint
- Ensure user authentication is valid

**Issue**: Styling issues
- Clear browser cache
- Verify Tailwind CSS is configured
- Check for CSS conflicts

**Issue**: Notifications not sending
- Verify notification service is configured
- Check email SMTP settings
- Review notification template

---

**Created**: November 26, 2025
**Status**: Ready for Integration
**Version**: 1.0
