/**
 * Accounting Module Type Definitions
 * Based on Double-Entry Accounting System
 */

// ============ CHART OF ACCOUNTS ============

export type AccountType = 
  | "Asset" 
  | "Liability" 
  | "Equity" 
  | "Revenue" 
  | "Expense" 
  | "COGS"
  | "Tax";

export type AccountCategory = 
  | "Bank & Cash" 
  | "Accounts Receivable" 
  | "Inventory" 
  | "Fixed Assets"
  | "Accounts Payable"
  | "Loans & Advances"
  | "Capital"
  | "Sales Revenue"
  | "Other Income"
  | "Purchases"
  | "Operating Expenses"
  | "Tax"
  | "Other";

export interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  category: AccountCategory;
  description?: string;
  isActive: boolean;
  openingBalance: number;
  debitOrCredit: "Debit" | "Credit"; // Normal balance
  createdAt: string;
  modifiedAt: string;
}

// ============ JOURNAL & POSTING ============

export type JournalType = 
  | "Sales Invoice"
  | "Purchase Invoice"
  | "Payment Receipt"
  | "Payment Made"
  | "Journal Entry"
  | "Adjustment"
  | "Opening Balance";

export interface JournalLine {
  id: string;
  lineNumber: number;
  accountId: string;
  accountCode: string;
  accountName: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  reference?: string;
}

export interface Journal {
  id: string;
  journalNumber: string;
  journalType: JournalType;
  postingDate: string;
  period: string; // YYYY-MM
  referenceDocument?: string; // Invoice/Payment ID
  description?: string;
  journalLines: JournalLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
  status: "Draft" | "Posted" | "Reversed";
  createdBy: string;
  createdAt: string;
}

// ============ CUSTOMERS & SUPPLIERS ============

export interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstin?: string;
  creditLimit: number;
  creditDays: number;
  arAccountId: string; // Linked to AR control account
  isActive: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  gstin?: string;
  apAccountId: string; // Linked to AP control account
  isActive: boolean;
  createdAt: string;
}

// ============ SALES INVOICE ============

export interface SalesInvoiceLine {
  id: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number; // quantity * unitPrice (before tax)
  taxPercent: number;
  taxAmount: number;
  lineTotal: number; // lineAmount + taxAmount
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string;
  customerGST?: string;
  dueDate: string;
  
  lines: SalesInvoiceLine[];
  
  subtotal: number; // Sum of lineAmount
  taxableAmount: number; // Subtotal
  totalTax: number; // Sum of tax amounts
  totalAmount: number; // Subtotal + tax
  
  notes?: string;
  status: "Draft" | "Open" | "PartiallyPaid" | "Paid" | "Cancelled";
  posted: boolean;
  journalId?: string;
  
  amountReceived: number; // For tracking payments
  amountDue: number;
  
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
}

// ============ PURCHASE INVOICE ============

export interface PurchaseInvoiceLine {
  id: string;
  lineNumber: number;
  itemId?: string;
  itemCode?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  taxPercent: number;
  taxAmount: number;
  lineTotal: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  supplierId: string;
  supplierName: string;
  supplierGST?: string;
  dueDate: string;
  
  lines: PurchaseInvoiceLine[];
  
  subtotal: number;
  taxableAmount: number;
  totalTax: number;
  totalAmount: number;
  
  notes?: string;
  status: "Draft" | "Open" | "PartiallyPaid" | "Paid" | "Cancelled";
  posted: boolean;
  journalId?: string;
  
  amountPaid: number;
  amountDue: number;
  
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
}

// ============ PAYMENTS ============

export type PaymentType = "Receipt" | "Payment";

export interface PaymentApply {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  appliedAmount: number;
  remainingAmount: number;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  paymentDate: string;
  paymentType: PaymentType; // Receipt or Payment
  
  // For Receipts
  customerId?: string;
  customerName?: string;
  
  // For Payments
  supplierId?: string;
  supplierName?: string;
  
  bankAccountId: string;
  bankAccountName: string;
  
  paymentMethod: "Cash" | "Cheque" | "Bank Transfer" | "Card" | "Other";
  referenceNumber?: string;
  
  paymentAmount: number;
  
  appliedInvoices: PaymentApply[];
  unappliedAmount: number;
  
  notes?: string;
  status: "Draft" | "Received" | "Pending" | "Cleared" | "Cancelled";
  posted: boolean;
  journalId?: string;
  
  createdBy: string;
  createdAt: string;
  modifiedAt: string;
}

// ============ INVENTORY ITEMS ============

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  category?: string;
  unitOfMeasure: string; // pieces, kg, etc
  purchasePrice: number;
  salesPrice: number;
  isActive: boolean;
  createdAt: string;
}

// ============ INVENTORY MOVEMENTS ============

export interface InventoryMovement {
  id: string;
  movementDate: string;
  movementType: "Receipt" | "Issue";
  referenceDocumentType?: "Purchase Invoice" | "Sales Invoice";
  referenceDocumentId?: string;
  
  movements: {
    itemId: string;
    itemCode: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

// ============ TAX ============

export interface TaxRate {
  id: string;
  taxName: string;
  taxCode: string;
  taxPercent: number;
  description?: string;
  isActive: boolean;
  glAccountId: string; // Output tax account for sales, Input tax for purchases
  createdAt: string;
}

// ============ PERIOD & CLOSING ============

export type PeriodStatus = "Open" | "Locked" | "Closed";

export interface Period {
  id: string;
  periodNumber: string; // YYYY-MM
  startDate: string;
  endDate: string;
  status: PeriodStatus;
  description?: string;
  lockedAt?: string;
  lockedBy?: string;
  closedAt?: string;
  closedBy?: string;
}

// ============ REPORTS & QUERIES ============

export interface GLBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: AccountType;
  openingBalance: number;
  debitTotal: number;
  creditTotal: number;
  closingBalance: number;
  debitOrCredit: "Debit" | "Credit";
}

export interface ARAgingBucket {
  customerName: string;
  customerCode: string;
  current: number; // 0-30 days
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

export interface APAgingBucket {
  supplierName: string;
  supplierCode: string;
  current: number;
  days31to60: number;
  days61to90: number;
  over90: number;
  total: number;
}

// ============ RESPONSES ============

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
