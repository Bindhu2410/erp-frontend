import React from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import ErpSetupLayout from "./components/layouts/ErpSetupLayout";
import CompanyList from "./company/pages/CompanyList";
import CompanyView from "./company/pages/CompanyView";
import BranchView from "./company/pages/BranchView";
import BranchEdit from "./company/pages/BranchEdit";
import BranchDelete from "./company/pages/BranchDelete";

// Company Management
import BranchSetup from "./company/pages/BranchSetup";
import WarehouseSetup from "./company/pages/WarehouseSetup";
import WarehouseView from "./company/pages/WarehouseView";
import InventoryLocationSetup from "./company/pages/InventoryLocationSetup";
import InventoryLocationView from "./company/pages/InventoryLocationView";
import InventoryLocationEdit from "./company/pages/InventoryLocationEdit";
import CostCentreSetup from "./company/pages/CostCentreSetup";
import CostCentreView from "./company/pages/CostCentreView";
import CostCentreEdit from "./company/pages/CostCentreEdit";

// Financial Setup
import BankAccountSetup from "./finance/pages/BankAccountSetup";
import BankAccountView from "./finance/pages/BankAccountView";
import BankAccountEdit from "./finance/pages/BankAccountEdit";
import ChartOfAccounts from "./finance/pages/ChartOfAccounts";
import AccountingPeriods from "./finance/pages/AccountingPeriods";
import DefaultAccounts from "./finance/pages/DefaultAccounts";
import PaymentTerms from "./finance/pages/PaymentTerms";
import CurrencyRates from "./finance/pages/CurrencyRates";
import FinancialStatements from "./finance/pages/FinancialStatements";
import JournalTemplates from "./finance/pages/JournalTemplates";

// Tax Setup
import GstSetup from "./tax/pages/GstSetup";
import HsnCodes from "./tax/pages/HsnCodes";
import SacCodes from "./tax/pages/SacCodes";
import TdsSetup from "./tax/pages/TdsSetup";

// Additional Setup
import IntercompanySetup from "./additional/pages/IntercompanySetup";
import DocumentTemplates from "./additional/pages/DocumentTemplates";
import SetupReports from "./additional/pages/SetupReports";

// User Management
import UserSetup from "./users/pages/UserSetup";
import RoleDefinition from "./users/pages/RoleDefinition";
import ApprovalHierarchy from "./users/pages/ApprovalHierarchy";
import UserActivity from "./users/pages/UserActivity";

// Audit
import AuditTrail from "./audit/pages/AuditTrail";

const ErpSetupIndexRoute: React.FC = () => {
  return <CompanyList />;
};

export const ErpSetupRoutes: React.FC = () => {
  return (
    <ErpSetupLayout>
      <Routes>
        {/* Company Management */}
        <Route path="/" element={<ErpSetupIndexRoute />} />
        <Route path="company-setup" element={<ErpSetupIndexRoute />} />
        <Route path="companies" element={<CompanyList />} />
        <Route path="branch-setup" element={<BranchSetup />} />
        <Route path="company-view/:companyId" element={<CompanyView />} />
        <Route path="warehouse-setup" element={<WarehouseSetup />} />
        <Route path="warehouse-view/:warehouseId" element={<WarehouseView />} />
        <Route path="inventory-location" element={<InventoryLocationSetup />} />
        <Route path="inventory-location-view/:locationId" element={<InventoryLocationView />} />
        <Route path="inventory-location-edit/:locationId" element={<InventoryLocationEdit />} />
        <Route path="cost-centre" element={<CostCentreSetup />} />
        <Route path="cost-centre-view/:costCentreId" element={<CostCentreView />} />
        <Route path="cost-centre-edit/:costCentreId" element={<CostCentreEdit />} />
        <Route path="branch-view/:branchId" element={<BranchView />} />
        <Route path="branch-edit/:branchId" element={<BranchEdit />} />
        <Route path="branch-delete" element={<BranchDelete />} />

        {/* Financial Setup */}
        <Route path="bank-account" element={<BankAccountSetup />} />
        <Route path="bank-account-view/:bankAccountId" element={<BankAccountView />} />
        <Route path="bank-account-edit/:bankAccountId" element={<BankAccountEdit />} />
        <Route path="bank-account-create" element={<BankAccountEdit />} />
        <Route path="chart-of-accounts" element={<ChartOfAccounts />} />
        <Route path="accounting-periods" element={<AccountingPeriods />} />
        <Route path="default-accounts" element={<DefaultAccounts />} />
        <Route path="payment-terms" element={<PaymentTerms />} />
        <Route path="currency-rates" element={<CurrencyRates />} />
        <Route path="financial-statements" element={<FinancialStatements />} />
        <Route path="journal-templates" element={<JournalTemplates />} />

        {/* Tax Setup */}
        <Route path="gst-setup" element={<GstSetup />} />
        <Route path="hsn-codes" element={<HsnCodes />} />
        <Route path="sac-codes" element={<SacCodes />} />
        <Route path="tds-setup" element={<TdsSetup />} />

        {/* Additional Setup */}
        <Route path="intercompany-setup" element={<IntercompanySetup />} />
        <Route path="document-templates" element={<DocumentTemplates />} />
        <Route path="setup-reports" element={<SetupReports />} />

        {/* User Management */}
        <Route path="user-setup" element={<UserSetup />} />
        <Route path="role-definition" element={<RoleDefinition />} />
        <Route path="approval-hierarchy" element={<ApprovalHierarchy />} />
        <Route path="user-activity" element={<UserActivity />} />

        {/* Audit */}
        <Route path="audit-trail" element={<AuditTrail />} />

        {/* Default Route */}
        <Route path="" element={<CompanyList />} />
      </Routes>
    </ErpSetupLayout>
  );
};
