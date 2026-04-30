/**
 * Demo Management Module
 *
 * This module contains screens for managing the demo product workflow:
 *
 * 1. CheckDemoProductAvailability.tsx
 *    - Calendar view of available demo products
 *    - List view with filtering and search
 *    - Shows demo requests for selected date
 *    - Product availability status and condition tracking
 *
 * 2. InventoryReceivesDemoRequest.tsx
 *    - Inventory department receives demo requests
 *    - Verify product availability
 *    - Check product condition and maintenance status
 *    - Approve or reject requests with comments
 *    - Assign products to warehouse locations
 *
 * 3. CreateDemoRequest.tsx
 *    - Form to create new demo requests
 *    - Customer information collection (name, email, phone)
 *    - Product selection from available inventory
 *    - Demo date range picker with availability constraints
 *    - Demo type selection (In-person, Virtual, Hybrid)
 *    - Notes and requirements input
 *
 * ROUTING SETUP:
 * Add these routes to your main router configuration:
 *
 * import { CheckDemoProductAvailability, InventoryReceivesDemoRequest, CreateDemoRequest } from '@/pages/inventory/demo';
 *
 * {
 *   path: '/inventory/demo/check-availability',
 *   element: <CheckDemoProductAvailability />
 * },
 * {
 *   path: '/inventory/demo/receive-request',
 *   element: <InventoryReceivesDemoRequest />
 * },
 * {
 *   path: '/inventory/demo/create-request',
 *   element: <CreateDemoRequest />
 * },
 *
 * API INTEGRATION POINTS:
 *
 * CheckDemoProductAvailability.tsx:
 * - GET /api/DemoProducts - Fetch all available demo products
 * - GET /api/DemoRequests - Fetch demo requests for filtering
 *
 * InventoryReceivesDemoRequest.tsx:
 * - GET /api/DemoRequests?status=pending - Fetch pending demo requests
 * - GET /api/DemoRequests/{id} - Fetch specific request details
 * - POST /api/DemoRequests/approve - Approve a demo request
 * - POST /api/DemoRequests/reject - Reject a demo request
 *
 * CreateDemoRequest.tsx:
 * - GET /api/DemoProducts - Fetch available products for selection
 * - POST /api/DemoRequests - Create new demo request
 *
 * DATA TYPES:
 *
 * DemoProduct:
 * {
 *   id: string;
 *   productName: string;
 *   productCode: string;
 *   category: string;
 *   availableQty: number;
 *   totalQty: number;
 *   location: string;
 *   lastServiceDate: string;
 *   condition: 'Excellent' | 'Good' | 'Fair' | 'Maintenance';
 *   nextAvailableDate: string;
 *   availableFrom?: string;
 *   availableTo?: string;
 *   image?: string;
 * }
 *
 * DemoRequest:
 * {
 *   id: string;
 *   requestId: string;
 *   customerName: string;
 *   customerEmail: string;
 *   customerPhone: string;
 *   productId: string;
 *   productName: string;
 *   productCode: string;
 *   quantity: number;
 *   startDate?: string;
 *   endDate?: string;
 *   requestedDate?: string;
 *   demoType: 'In-person' | 'Virtual' | 'Hybrid';
 *   demoLocation: string;
 *   salesRepName: string;
 *   salesRepEmail: string;
 *   priority: 'High' | 'Medium' | 'Low';
 *   requestStatus: 'Pending' | 'Approved' | 'Rejected';
 *   submissionDate: string;
 *   notes: string;
 *   attachments?: string[];
 * }
 *
 */

export { default as CheckDemoProductAvailability } from './CheckDemoProductAvailability';
export { default as InventoryReceivesDemoRequest } from './InventoryReceivesDemoRequest';
export { default as CreateDemoRequest } from './CreateDemoRequest';
