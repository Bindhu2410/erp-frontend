import React from "react";
import { Container, Card } from "react-bootstrap";
import { ERP_SETUP_ROUTES } from "../../constants/routes";
import ERPSetupHeader from "./ERPSetupHeader";
import "../../styles/ERPSetupHeader.css";

interface NavGroup {
  title: string;
  items: {
    path: string;
    label: string;
    icon: string;
  }[];
}

// Navigation groups - used in commented-out sidebar navigation
const _navigationGroups: NavGroup[] = [
  {
    title: "Company Management",
    items: [
      {
        path: ERP_SETUP_ROUTES.COMPANY_SETUP,
        label: "Company Setup",
        icon: "building",
      },
      {
        path: ERP_SETUP_ROUTES.BRANCH_SETUP,
        label: "Branch Setup",
        icon: "code-branch",
      },
      {
        path: ERP_SETUP_ROUTES.WAREHOUSE_SETUP,
        label: "Warehouse Setup",
        icon: "warehouse",
      },
      {
        path: ERP_SETUP_ROUTES.INVENTORY_LOCATION,
        label: "Inventory Location",
        icon: "boxes",
      },
      {
        path: ERP_SETUP_ROUTES.COST_CENTRE,
        label: "Cost Centre",
        icon: "money-bill",
      },
    ],
  },
  {
    title: "Financial Setup",
    items: [
      {
        path: ERP_SETUP_ROUTES.BANK_ACCOUNT,
        label: "Bank Account",
        icon: "university",
      },
      {
        path: ERP_SETUP_ROUTES.CHART_OF_ACCOUNTS,
        label: "Chart of Accounts",
        icon: "list-alt",
      },
      {
        path: ERP_SETUP_ROUTES.ACCOUNTING_PERIODS,
        label: "Accounting Periods",
        icon: "calendar-alt",
      },
      {
        path: ERP_SETUP_ROUTES.DEFAULT_ACCOUNTS,
        label: "Default Accounts",
        icon: "clipboard-list",
      },
      {
        path: ERP_SETUP_ROUTES.PAYMENT_TERMS,
        label: "Payment Terms",
        icon: "money-check-alt",
      },
      {
        path: ERP_SETUP_ROUTES.CURRENCY_RATES,
        label: "Currency Exchange Rates",
        icon: "exchange-alt",
      },
      {
        path: ERP_SETUP_ROUTES.FINANCIAL_STATEMENTS,
        label: "Financial Statements",
        icon: "file-invoice",
      },
      {
        path: ERP_SETUP_ROUTES.JOURNAL_TEMPLATES,
        label: "Journal Templates",
        icon: "copy",
      },
    ],
  },
  {
    title: "Tax Setup",
    items: [
      { path: ERP_SETUP_ROUTES.GST_SETUP, label: "GST Setup", icon: "percent" },
      { path: ERP_SETUP_ROUTES.HSN_CODES, label: "HSN Codes", icon: "tags" },
      { path: ERP_SETUP_ROUTES.SAC_CODES, label: "SAC Codes", icon: "tag" },
      {
        path: ERP_SETUP_ROUTES.TDS_SETUP,
        label: "TDS Setup",
        icon: "file-invoice-dollar",
      },
    ],
  },
  {
    title: "Additional Setup",
    items: [
      {
        path: ERP_SETUP_ROUTES.INTERCOMPANY_SETUP,
        label: "Intercompany Setup",
        icon: "project-diagram",
      },
      {
        path: ERP_SETUP_ROUTES.DOCUMENT_TEMPLATES,
        label: "Document Templates",
        icon: "file-alt",
      },
      {
        path: ERP_SETUP_ROUTES.SETUP_REPORTS,
        label: "Setup Reports",
        icon: "chart-bar",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      { path: ERP_SETUP_ROUTES.USER_SETUP, label: "User Setup", icon: "users" },
      {
        path: ERP_SETUP_ROUTES.ROLE_DEFINITION,
        label: "Role Definition",
        icon: "user-shield",
      },
      {
        path: ERP_SETUP_ROUTES.APPROVAL_HIERARCHY,
        label: "Approval Hierarchy",
        icon: "sitemap",
      },
      {
        path: ERP_SETUP_ROUTES.USER_ACTIVITY,
        label: "User Activity Log",
        icon: "history",
      },
    ],
  },
  {
    title: "Audit",
    items: [
      {
        path: ERP_SETUP_ROUTES.AUDIT_TRAIL,
        label: "Audit Trail",
        icon: "history",
      },
    ],
  },
];

interface Props {
  children: React.ReactNode;
}

const ErpSetupLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <ERPSetupHeader />
      <Container fluid className="p-2">
        <div className="d-flex">
          {/* Sidebar Navigation */}
          {/* <div style={{ width: '280px', minHeight: 'calc(100vh - 2rem)' }}>
                        <Card className="shadow-sm">
                            <Card.Body className="p-0">
                                <div className="px-3 py-4 border-bottom bg-light">
                                    <h5 className="mb-0">ERP Setup</h5>
                                </div>
                                <Nav className="flex-column py-2">
                                    {navigationGroups.map((group, index) => (
                                        <div key={index} className="mb-3">
                                            <div className="px-3 mb-2">
                                                <small className="text-muted fw-bold">{group.title}</small>
                                            </div>
                                            {group.items.map((item, itemIndex) => (
                                                <Nav.Item key={itemIndex}>
                                                    <Nav.Link
                                                        as={Link}
                                                        to={item.path}
                                                        className={`px-3 py-2 ${
                                                            location.pathname === item.path
                                                                ? 'active bg-primary text-white'
                                                                : 'text-dark'
                                                        }`}
                                                    >
                                                        <i className={`fas fa-${item.icon} me-2`}></i>
                                                        {item.label}
                                                    </Nav.Link>
                                                </Nav.Item>
                                            ))}
                                        </div>
                                    ))}
                                </Nav>
                            </Card.Body>
                        </Card>
                    </div> */}

          {/* Main Content Area */}
          <div className="flex-grow-1 ms-4">
            <Card className="shadow-sm">
              <Card.Body>{children}</Card.Body>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
};

export default ErpSetupLayout;
