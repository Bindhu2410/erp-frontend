export const ERP_SETUP_ROUTES = {
    // Company Management
    COMPANY_SETUP: '/erp-setup/company-setup',
    COMPANY_CREATE: '/erp-setup/company-create',
    COMPANIES_LIST: '/erp-setup/companies-list',
    COMPANIES_CARDS: '/erp-setup/companies',
    COMPANY_VIEW: '/erp-setup',
    COMPANY_EDIT: '/erp-setup',
    BRANCH_SETUP: '/erp-setup/branch-setup',
    WAREHOUSE_SETUP: '/erp-setup/warehouse-setup',
    INVENTORY_LOCATION: '/erp-setup/inventory-location',
    COST_CENTRE: '/erp-setup/cost-centre',

    // Financial Setup
    BANK_ACCOUNT: '/erp-setup/bank-account',
    CHART_OF_ACCOUNTS: '/erp-setup/chart-of-accounts',
    ACCOUNTING_PERIODS: '/erp-setup/accounting-periods',
    DEFAULT_ACCOUNTS: '/erp-setup/default-accounts',
    PAYMENT_TERMS: '/erp-setup/payment-terms',
    CURRENCY_RATES: '/erp-setup/currency-rates',
    FINANCIAL_STATEMENTS: '/erp-setup/financial-statements',
    JOURNAL_TEMPLATES: '/erp-setup/journal-templates',

    // Tax Setup
    GST_SETUP: '/erp-setup/gst-setup',
    HSN_CODES: '/erp-setup/hsn-codes',
    SAC_CODES: '/erp-setup/sac-codes',
    TDS_SETUP: '/erp-setup/tds-setup',

    // Additional Setup
    INTERCOMPANY_SETUP: '/erp-setup/intercompany-setup',
    DOCUMENT_TEMPLATES: '/erp-setup/document-templates',
    SETUP_REPORTS: '/erp-setup/setup-reports',

    // User Management
    USER_SETUP: '/erp-setup/user-setup',
    ROLE_DEFINITION: '/erp-setup/role-definition',
    APPROVAL_HIERARCHY: '/erp-setup/approval-hierarchy',
    USER_ACTIVITY: '/erp-setup/user-activity',

    // Audit
    AUDIT_TRAIL: '/erp-setup/audit-trail',
} as const;
