// Cleaned exports and routes for accounts module
export { default as AccountingDashboard } from "./AccountingDashboard";
export { default as ChartOfAccounts } from "./master-data/ChartOfAccountsList";
export { default as FixedAssets } from "./master-data/FixedAssets";
export { default as CostCenters } from "./master-data/CostCenters";

export { default as JournalEntriesForm } from "./forms/JournalEntriesForm";
export { default as SalesInvoiceForm } from "./forms/SalesInvoiceForm";
export { default as PurchaseInvoiceForm } from "./forms/PurchaseInvoiceForm";
export { default as BankReconciliationForm } from "./forms/BankReconciliationForm";
export { default as PaymentForm } from "./forms/PaymentForm";

export { default as AccountsReceivablePage } from "./pages/AccountsReceivablePage";
export { default as AccountsPayablePage } from "./pages/AccountsPayablePage";
export { default as PaymentsReceiptsPage } from "./pages/PaymentsReceiptsPage";
export { default as BankReconciliationPage } from "./pages/BankReconciliationPage";
export { default as CashManagementPage } from "./pages/CashManagementPage";
export { default as InventoryValuationPage } from "./pages/InventoryValuationPage";
export { default as TaxManagementPage } from "./pages/TaxManagementPage";
export { default as ConsolidationPage } from "./pages/ConsolidationPage";
export { default as MultiCurrencyPage } from "./pages/MultiCurrencyPage";
export { default as ApprovalsWorkflowsPage } from "./pages/ApprovalsWorkflowsPage";
export { default as AuditTrailPage } from "./pages/AuditTrailPage";
export { default as ImportExportPage } from "./pages/ImportExportPage";

export { default as TrialBalance } from "./reports/TrialBalance";
export { default as FinancialStatements } from "./reports/FinancialStatements";
export { default as AgingReports } from "./reports/AgingReports";
export { default as GeneralLedgerReports } from "./reports/GeneralLedgerReports";
export { default as AccountsReceivableReport } from "./reports/AccountsReceivable";
export { default as AccountsPayableReport } from "./reports/AccountsPayable";

export { default as JournalEntriesList } from "./journals/JournalEntriesList";
export { default as PurchaseInvoiceList } from "./purchase/PurchaseInvoiceList";
export { default as BankReconciliationList } from "./bank/BankReconciliationList";

export const accountsRoutes = [
  { path: "/accounts", key: "dashboard", name: "Accounting Dashboard" },
  { path: "/accounts/chart-of-accounts", key: "chart_of_accounts", name: "Chart of Accounts" },
  { path: "/accounts/journals", key: "journal_entries", name: "Journal Entries" },
  { path: "/accounts/trial-balance", key: "trial_balance", name: "Trial Balance" },
  { path: "/accounts/financial-statements", key: "financial_statements", name: "Financial Statements" },
  { path: "/accounts/accounts-receivable", key: "accounts_receivable", name: "Accounts Receivable" },
  { path: "/accounts/accounts-payable", key: "accounts_payable", name: "Accounts Payable" },
  { path: "/accounts/sales-invoices", key: "sales_invoicing", name: "Sales Invoicing" },
  { path: "/accounts/purchase-invoices", key: "purchase_invoicing", name: "Purchase Invoicing" },
  { path: "/accounts/payments", key: "payments_receipts", name: "Payments & Receipts" },
  { path: "/accounts/bank-reconciliation", key: "bank_reconciliation", name: "Bank Reconciliation" },
  { path: "/accounts/cash-management", key: "cash_management", name: "Cash Management" },
  { path: "/accounts/fixed-assets", key: "fixed_assets", name: "Fixed Assets" },
  { path: "/accounts/inventory-valuation", key: "inventory_valuation", name: "Inventory Valuation" },
  { path: "/accounts/tax-management", key: "tax_management", name: "Tax Management" },
  { path: "/accounts/aging-reports", key: "aging_reports", name: "Aging Reports" },
  { path: "/accounts/general-ledger", key: "general_ledger", name: "General Ledger Reports" },
  { path: "/accounts/consolidation", key: "consolidation", name: "Consolidation / Multi-company" },
  { path: "/accounts/multi-currency", key: "multi_currency", name: "Multi-currency" },
  { path: "/accounts/cost-centers", key: "cost_centers", name: "Cost Centers" },
  { path: "/accounts/approvals", key: "approvals_workflows", name: "Approvals & Workflows" },
  { path: "/accounts/audit-trail", key: "audit_trail", name: "Audit Trail" },
  { path: "/accounts/integrations", key: "import_export", name: "Import/Export & Integrations" },
];

export default accountsRoutes;
