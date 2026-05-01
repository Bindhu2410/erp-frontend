# Demo Product Management - Quick Start Guide

## 🚀 Quick Start in 5 Steps

### Step 1: Import Components

```typescript
// In your App.tsx or main routing file
import CheckDemoProductAvailability from '@/pages/inventory/demo/CheckDemoProductAvailability';
import InventoryReceivesDemoRequest from '@/pages/inventory/demo/InventoryReceivesDemoRequest';
```

### Step 2: Add Routes

```typescript
// In your router configuration
const routes = [
  {
    path: '/inventory/demo/check-availability',
    element: <CheckDemoProductAvailability />,
  },
  {
    path: '/inventory/demo/receive-request',
    element: <InventoryReceivesDemoRequest />,
  },
];
```

### Step 3: Replace Sample Data with API Calls

In **CheckDemoProductAvailability.tsx**, find and replace:

```typescript
// BEFORE: Using sample data
const sampleDemoProducts: DemoProduct[] = [...];
setDemoProducts(sampleDemoProducts);

// AFTER: Using API
const res = await api.get("DemoProducts");
setDemoProducts(res.data);
```

In **InventoryReceivesDemoRequest.tsx**:

```typescript
// BEFORE: Using sample data
setRequests(sampleRequests);

// AFTER: Using API
const res = await api.get("DemoRequests?status=pending");
setRequests(res.data);
```

### Step 4: Configure API Endpoints

Create these endpoints in your backend (Node.js/C# example):

```csharp
// C# Example (ASP.NET Core)
[HttpGet("api/DemoProducts")]
public async Task<ActionResult<List<DemoProduct>>> GetDemoProducts()
{
    var products = await _context.DemoProducts
        .Where(p => p.IsActive)
        .ToListAsync();
    return Ok(products);
}

[HttpPost("api/DemoRequests/approve")]
public async Task<ActionResult> ApproveDemoRequest(DemoApprovalPayload payload)
{
    var request = await _context.DemoRequests.FindAsync(payload.DemoRequestId);
    if (request == null) return NotFound();

    request.Status = "Approved";
    request.ApprovedBy = payload.ApprovalBy;
    request.ApprovalDate = DateTime.Now;

    // Create inventory assignment
    var assignment = new DemoInventoryAssignment
    {
        DemoRequestId = request.Id,
        ProductId = request.ProductId,
        WarehouseId = payload.AssignedWarehouse,
        RackId = payload.AssignedRack,
        Status = "Assigned"
    };

    _context.DemoInventoryAssignments.Add(assignment);
    await _context.SaveChangesAsync();

    return Ok(new { message = "Request approved successfully", assignmentId = assignment.Id });
}
```

### Step 5: Add Authentication Guards (Optional)

```typescript
// Use withAuth or withAdminAuth wrappers
import { withAuth } from '@/components/auth/withAuth';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

// In routes
{
  path: '/inventory/demo/check-availability',
  element: withAuth(<CheckDemoProductAvailability />),
},
{
  path: '/inventory/demo/receive-request',
  element: withAdminAuth(<InventoryReceivesDemoRequest />),
},
```

---

## 📊 Data Flow Diagrams

### Flow 1: Check Demo Product Availability

```
┌─────────────────────────────────────────────────────────────┐
│           Check Demo Product Availability                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌──────────────────────────────────┐
            │  Load Products & Categories      │
            │  GET /api/DemoProducts           │
            │  GET /api/DemoProductCategories │
            └──────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌────────────────┐         ┌─────────────────┐
        │  Calendar View │         │   List View     │
        │  - Mini picker │         │ - Search input  │
        │  - Products    │         │ - Category filter
        │  - Requests    │         │ - Sortable table
        │  - Conditions  │         │ - Availability  │
        └────────────────┘         └─────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────────┐
                    │  Select Product      │
                    │  onClick: handleClick│
                    └──────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────────┐
            │ Navigate to Create Demo Request     │
            │ Pass selected product data          │
            └─────────────────────────────────────┘
```

### Flow 2: Inventory Receives Demo Request

```
┌──────────────────────────────────────────────────────────┐
│    Inventory Department - Demo Request Processing        │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌──────────────────────────────────┐
            │  Load Pending Requests           │
            │  GET /api/DemoRequests?status=   │
            │  pending                         │
            └──────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  List with Priority/Status Badges       │
        │  Filter: Pending/Approved/All           │
        │  Select: Click request to view details  │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  Display Full Request Details            │
        │  - Customer info                         │
        │  - Product details                       │
        │  - Demo location & date                  │
        │  - Sales rep contact                     │
        └──────────────────────────────────────────┘
                              │
                              ▼
        ┌──────────────────────────────────────────┐
        │  VERIFICATION CHECKLIST                  │
        │  ☐ Verify Product Availability           │
        │  ☐ Check Product Condition               │
        │    └─ Maintenance Status (dropdown)      │
        │  ☐ Assign to Warehouse/Rack/Shelf       │
        │  ☐ Add Notes (optional)                  │
        └──────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
        ┌─────────────────┐         ┌──────────────┐
        │ APPROVE REQUEST │         │ REJECT REQST │
        │ All items ✓     │         │ Need reason  │
        └────────┬────────┘         └──────┬───────┘
                 │                         │
                 ▼                         ▼
        ┌──────────────────┐      ┌──────────────────────┐
        │ Show Confirm     │      │ Show Confirm Modal   │
        │ Modal with       │      │ Ask for reason       │
        │ details          │      │ (rejection reason)   │
        └────────┬─────────┘      └──────┬───────────────┘
                 │                       │
                 ▼                       ▼
        ┌──────────────────┐      ┌──────────────────────┐
        │POST /api/Demo    │      │POST /api/Demo        │
        │Requests/approve  │      │Requests/reject       │
        │- location data   │      │- reason              │
        │- verification    │      │- rejection details   │
        └────────┬─────────┘      └──────┬───────────────┘
                 │                       │
                 ▼                       ▼
        ┌──────────────────┐      ┌──────────────────────┐
        │Create Inventory  │      │Update Request Status │
        │Assignment        │      │Send Notification     │
        │Send Notification │      │  - Sales Rep         │
        │  - Sales Rep     │      │  - Customer          │
        │  - Customer      │      │  - Inventory Team    │
        │  - Inventory Team│      └──────────────────────┘
        └──────────────────┘
```

### Flow 3: Complete Demo Lifecycle

```
DEMO STAGE
    │
    ├─→ Check Demo Product Availability (Screen 1)
    │   ├─ Calendar View
    │   └─ List View
    │
    └─→ Select Demo Product
        │
        └─→ Create Inventory Demo Request
            │
            └─→ Inventory Department Receives (Screen 2)
                ├─ Verify Product Availability ✓
                ├─ Check Condition/Maintenance ✓
                ├─ Approve or Reject
                └─ Assign Product for Demo
                    │
                    └─→ APPROVAL STAGE (Optional)
                        │
                        └─→ Schedule Demo
                            │
                            └─→ Update Calendar & Notifications
                                ├─ Notify Sales Rep
                                ├─ Notify Customer
                                └─ Notify Inventory Team
                                    │
                                    └─→ DEMO EXECUTION STAGE
                                        │
                                        ├─ Inventory Team → Handover Product
                                        ├─ Sales Rep → Conduct Demo
                                        └─ Inventory Team → Track Movement
                                            │
                                            └─→ DEMO COMPLETION & RETURN
                                                │
                                                ├─ Product Returned to Inventory
                                                ├─ Condition Check
                                                └─ Update Stock Status → Available
                                                    │
                                                    └─→ Move to Next Stage
```

---

## 🔧 Configuration Examples

### Example 1: Basic Setup (No Auth)

```typescript
// routes.ts
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  CheckDemoProductAvailability,
  InventoryReceivesDemoRequest,
} from '@/pages/inventory/demo';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/inventory/demo/check-availability" element={<CheckDemoProductAvailability />} />
      <Route path="/inventory/demo/receive-request" element={<InventoryReceivesDemoRequest />} />
    </Routes>
  );
}
```

### Example 2: With Authentication

```typescript
// routes.ts with auth
import { withAuth, withAdminAuth } from '@/components/auth';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/inventory/demo/check-availability"
        element={withAuth(<CheckDemoProductAvailability />)}
      />
      <Route
        path="/inventory/demo/receive-request"
        element={withAdminAuth(<InventoryReceivesDemoRequest />)}
      />
    </Routes>
  );
}
```

### Example 3: With Navigation Links

```typescript
// Navbar.tsx
export function Navbar() {
  return (
    <nav>
      <Link to="/inventory/demo/check-availability">
        Check Demo Availability
      </Link>
      <Link to="/inventory/demo/receive-request">
        Process Demo Requests
      </Link>
    </nav>
  );
}
```

---

## 📝 Environment Variables

Add to your `.env` file:

```env
# Demo API Configuration
REACT_APP_DEMO_API_URL=${process.env.REACT_APP_API_BASE_URL}/api
REACT_APP_DEMO_TIMEOUT=30000
REACT_APP_ENABLE_DEMO_NOTIFICATIONS=true
REACT_APP_DEMO_EMAIL_NOTIFICATIONS=true
```

---

## 🧪 Testing

### Unit Tests Example

```typescript
// CheckDemoProductAvailability.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import CheckDemoProductAvailability from './CheckDemoProductAvailability';

describe('CheckDemoProductAvailability', () => {
  it('should render calendar and list view buttons', () => {
    render(<CheckDemoProductAvailability />);
    expect(screen.getByText('Calendar View')).toBeInTheDocument();
    expect(screen.getByText('List View')).toBeInTheDocument();
  });

  it('should filter products by category', async () => {
    render(<CheckDemoProductAvailability />);
    const filterSelect = screen.getByDisplayValue('All Categories');
    fireEvent.change(filterSelect, { target: { value: 'Medical Equipment' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Medical Equipment')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests Example

```typescript
// InventoryReceivesDemoRequest.integration.test.tsx
describe('Demo Request Approval Flow', () => {
  it('should approve demo request with all validations', async () => {
    render(<InventoryReceivesDemoRequest />);

    // Select request
    const requestItem = screen.getByText('REQ-001');
    fireEvent.click(requestItem);

    // Verify product
    const verifyCheckbox = screen.getByLabelText(/Verify Product Availability/);
    fireEvent.click(verifyCheckbox);

    // Check condition
    const conditionCheckbox = screen.getByLabelText(/Check Product Condition/);
    fireEvent.click(conditionCheckbox);

    // Assign location
    const warehouseInput = screen.getByPlaceholderText('Enter warehouse');
    fireEvent.change(warehouseInput, { target: { value: 'WH-01' } });

    // Approve
    const approveButton = screen.getByText('Approve Request');
    fireEvent.click(approveButton);

    // Confirm
    const confirmButton = screen.getByText('Approve Request', { selector: 'button' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/approved successfully/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🚨 Troubleshooting

### Issue: Products not loading

**Solution:**
```typescript
// Add error handling
useEffect(() => {
  try {
    const res = await api.get("DemoProducts");
    setDemoProducts(res.data);
  } catch (error) {
    console.error('Failed to load products:', error);
    // Fallback to sample data or show error message
  }
}, []);
```

### Issue: API timeout

**Solution:**
```typescript
// Add timeout configuration
const api = axios.create({
  timeout: 30000, // 30 seconds
  baseURL: process.env.REACT_APP_API_URL
});
```

### Issue: Auth errors

**Solution:**
```typescript
// Add token refresh logic
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token or redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## 📚 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)
- [Lucide React Icons](https://lucide.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: November 26, 2025
**Status**: Production Ready
