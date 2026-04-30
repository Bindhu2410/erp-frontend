import ClaimsPage from "./pages/ClaimsPage";
import ChatPageV2 from "./pages/chat/ChatPageV2";
import HRMSPage from "./pages/hrms/HRMSPage";
import WhatsAppLayout from "./components/layouts/whatsapp-layout/WhatsAppLayout";

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import LeadList from "./pages/lead/LeadList";
import ProtectedAdminInventoryLayout from "./components/layouts/protected-admin-inventory-layout/ProtectedAdminInventoryLayout";
import LeadView from "./pages/lead/LeadView";
import TargetList from "./pages/sales/TargetList";
import TargetDetails from "./pages/sales/TargetDetails";
import TargetFormPage from "./pages/sales/TargetForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DemoList from "./pages/demo/DemoList";
import DemoForm from "./pages/demo/DemoForm";
import DemoView from "./pages/demo/DemoView";
import DemoAvailability from "./pages/demo/DemoAvailability";

import OpportunityList from "./pages/opportunity/OpportunityList";
import OpportunityView from "./pages/opportunity/OpportunityView";
import QuotationList from "./pages/quotation/QuotationList";
import QuotationView from "./pages/quotation/QuotationView";
import QuotationForm from "./pages/quotation/QuotationForm";
import OpportunityForm from "../src/pages/opportunity/OpportunityForm";
import SalesKanban from "./pages/kanban/SalesKanban";
import PaymentForm from "./pages/payment/payment";
import OrderTrackingDetails from "./pages/delivery/OrderTrackingDetails";
import DeliveryList from "./pages/delivery/DeliveryList";
import DeliveryChallanPage from "./pages/delivery-challan/DeliveryChallanPage";
import OAuthCallback from "./components/email/OAuthCallback";
import GmailConfig from "./components/email/GmailConfig";
import PaymentViewScreen from "./pages/payment/payment";
import PreLeadList from "./pages/preLead/PreLeadList";
import BomMaster from "./pages/inventory/bom/BomMaster";
import SalesOrderDetail from "./pages/sales-order/SalesOrderDetail";
import UOMMaster from "./pages/inventory/uom/UOMMaster";
import InvoiceForm from "./pages/invoice/InvoiceForm";
import ItemMasterPage from "./pages/inventory/demo-stock-status/ItemMaster";
import ItemPriceList from "./pages/inventory/demo-stock-status/ItemPriceList";
import DemoStock from "./pages/inventory/demo-stock-status/DemoStock";
import QuotationInvoiceManager from "./pages/invoice/InvoiceForm";
import SalesOrderList from "./pages/sales-order/SalesOrderList";
import PurchaseOrderManagement from "./pages/purchase-order/PurchaseOrderManagement";
import PurchaseOrderViewPage from "./pages/purchase-order/PurchaseOrderViewPage";
// import ComparePOProcessing from "./pages/purchase-order/ComparePOProcessing";

import CalendarPage from "./pages/CalendarPage";
import Layout from "./components/layouts/sales-layout/SalesLayout";
import Dashboard from "./pages/Dashboard";
import UserLayout from "./components/layouts/user-layout/UserLayout";
import TaskNotification from "./components/common/TaskNotification";
import InventoryLayout from "./components/layouts/inventory-layout/InventoryLayout";
import UserManagement from "./pages/user-management/UserManagement";
import RolePermissions from "./pages/user-management/RolePermissions";
import TeamHierarchy from "./pages/user-management/TeamHierarchy";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import ForgotPassword from "./pages/ForgotPassword";
import withAuth from "./components/auth/withAuth";
import withAdminAuth from "./components/auth/withAdminAuth";
import ComparePOProcessing from "./pages/purchase-order/ComparePOProcessing";
import InvoiceList from "./pages/invoice/invoiceLists";
import InvoiceDetails from "./pages/invoice/InvoiceDetails";
import { InvoiceViewPage } from "./pages/invoice/InvoiceViewPage";
import PaymentList from "./pages/payment/PaymentList";
import SalesDashboard from "./pages/dashboards/SalesDashboard";
import TaskManagement from "./pages/configs/tasks/taskMangement";
import ClaimVoucher from "./pages/claims/ClaimVoucher";
import ClaimVoucherList from "./pages/claims/ClaimVoucherList";
import ClaimsTasksPage from "./pages/claims/ClaimsTasksPage";
import EventManagement from "./pages/configs/events/eventManagement";
import InventoryDashboard from "./pages/inventory/InventoryDashboard";
import ItemGroupForm from "./components/inventory/ItemGroupForm";
import ItemMaster from "./pages/inventory/master-data/ItemMaster";
import BillOfMaterial from "./pages/inventory/bom/components/BillOfMaterial";
import BOMListPage from "./pages/inventory/bom/BOMListPage";
import ProcurementLayout from "./components/layouts/procurement-layout/ProcurementLayout";
import AccountingLayout from "./components/layouts/accounting-layout/AccountsLayout";
import CreateVendor from "./pages/Procurement/CreateVendor";
import VendorManagement from "./pages/Procurement/VendorManagement";

import { LocationManagement } from "./pages/inventory/master-data/hooks/LocationManagement";
import ItemStockManagement from "./pages/inventory/stock/ItemStockManagement";
import WarehouseDynamicForm from "./pages/inventory/master-data/WarehouseDynamicForm";
import StockTransactionPage from "./pages/inventory/stock/StockTransactionPage";
import RateMasterPage from "./pages/inventory/rate/RateMasterPage";
import GRNListPage from "./pages/inventory/grn/GRNListPage";
import GRNFormPage from "./pages/inventory/grn/GRNFormPage";
import BomsPage from "./pages/inventory/master-data/product/BomsPage";
import InventoryMethodPage from "./pages/inventory/master-data/product/InventoryMethodPage";
import InventoryGroupPage from "./pages/inventory/master-data/product/InventoryGroupPage";
import InventoryTypePage from "./pages/inventory/master-data/product/InventoryTypePage";
import ValuationPage from "./pages/inventory/master-data/product/ValuationPage";
import CategoriesPage from "./pages/inventory/master-data/product/CategoriesPage";
import UOMPage from "./pages/inventory/master-data/product/UOMPage";
import StockUpdateScreen from "./pages/inventory/StockUpdateScreen";
import StockBalanceScreen from "./pages/inventory/StockBalanceScreen";
import PurchaseInvoiceScreen from "./pages/purchase/PurchaseInvoiceScreen";
import GRNToVendorBill from "./pages/grn/GRNToVendorBill";
import IssueProduct from "./pages/issue/IssueProduct";
import QaSessionListPage from "./pages/QA/QaSessionListPage";
import QaSessionCreatePage from "./pages/QA/QaSessionCreatePage";
import QaInspectionFormPage from "./pages/QA/QaInspectionFormPage";
import QaSessionReportPage from "./pages/QA/QaSessionReportPage";
import QaTemplateListPage from "./pages/QA/templates/QaTemplateListPage";
import QaLayout from "./components/layouts/qa-layout/QaLayout";
import PurchaseBill from "./pages/purchase/PurchaseBill";
import { IssueManagement } from "./pages/issue/IssueManagement";
import { ReceiptManagement } from "./pages/receipt/ReceiptManagement";
import CreatePurchaseRequisition from "./pages/purchaseRequisition/CreatePurchaseRequisition";
import PurchaseRequisitionList from "./pages/purchaseRequisition/PurchaseRequisitionList";
import ViewPurchaseRequisition from "./pages/purchaseRequisition/viewPurchaseRequistion";
import ProcurementDashboard from "./pages/Procurement/dashboard";
import PurchaseOrderList from "./pages/purchase-order/PurchaseOrderList";
import MakeMaster from "./pages/inventory/master-data/MakeMaster";
import ModelMaster from "./pages/inventory/master-data/ModelMaster";
import ProductMaster from "./pages/inventory/master-data/ProductMaster";
import QuotationTitle from "./pages/inventory/master-data/QuotationTitle";
import TermsConditions from "./pages/inventory/master-data/TermsConditions";
import AccessoriesPage from "./pages/inventory/master-data/AccessoriesPage";
import { ErpSetupRoutes } from "./modules/erp-setup/routes";
import {
  StockOpeningBalanceList,
  StockOpeningBalanceForm,
} from "./pages/inventory/stock-opening-balance";
import {
  CheckDemoProductAvailability,
  InventoryReceivesDemoRequest,
  CreateDemoRequest,
} from "./pages/inventory/demo";
import {
  ChartOfAccounts,
  SalesInvoiceForm,
  PurchaseInvoiceForm,
  PaymentsReceiptsPage,
  GeneralLedgerReports,
  AccountingDashboard,
  AccountsReceivablePage,
  AccountsPayablePage,
  TrialBalance,
  FinancialStatements,
  BankReconciliationPage,
  CashManagementPage,
  FixedAssets,
  InventoryValuationPage,
  TaxManagementPage,
  AgingReports,
  ConsolidationPage,
  MultiCurrencyPage,
  CostCenters,
  ApprovalsWorkflowsPage,
  AuditTrailPage,
  ImportExportPage,
  JournalEntriesList,
  PurchaseInvoiceList,
  BankReconciliationList,
  BankReconciliationForm,
  PaymentForm as AccountsPaymentForm,
  JournalEntriesForm,
  AccountsReceivableReport,
  AccountsPayableReport,
} from "./pages/accounts";
import CreditNoteList from "./pages/accounts/notes/CreditNoteList";
import CreditNoteView from "./pages/accounts/notes/CreditNoteView";
import CreditNoteForm from "./pages/accounts/notes/CreditNoteForm";
import DebitNoteList from "./pages/accounts/notes/DebitNoteList";
import DebitNoteView from "./pages/accounts/notes/DebitNoteView";
import DebitNoteForm from "./pages/accounts/notes/DebitNoteForm";
import SalesInvoiceList from "./pages/accounts/sales/SalesInvoiceList";
import SalesInvoiceCreate from "./pages/accounts/sales/SalesInvoiceCreate";
import EmployeeList from "./pages/Employees/EmployeeList";
import EmployeeInfoForm from "./pages/Employees/EmployeeInfoForm";
import AttendanceEntry from "./pages/attendance/AttendanceEntry";
import AttendanceDashboard from "./pages/attendance/AttendanceDashboard";
import ClaimsLayout from "./components/layouts/claims-layout/ClaimsLayout";
import SchedulerPage from "./pages/scheduler/SchedulerPage";
import EmployeeLayout from "./components/layouts/employee-layout/EmployeeLayout";
import ChatLayout from "./components/layouts/chat-layout/ChatLayout";
import TaskManagementPage from "./pages/task-management/TaskManagementPage";
import TaskManagementLayout from "./components/layouts/task-management-layout/TaskManagementLayout";
import WhatsAppModule from "./pages/whatsapp/WhatsAppModule";
import DashboardLayout from "./components/layouts/DashboardLayout";
import CalendarLayout from "./components/layouts/calendar-layout/CalendarLayout";

import IssuesScreen from "./pages/inventory/IssuesScreen";
import AssignedByMePage from "./pages/task-management/AssignedByMePage";

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white p-8 rounded-lg shadow-md">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">This page is under development.</p>
  </div>
);

// Create protected components with withAuth
const ProtectedUserLayout = withAuth(UserLayout);
const ProtectedLayout = withAuth(Layout);
const ProtectedInventoryLayout = withAuth(InventoryLayout);
const ProtectedProcuremntLayout = withAuth(ProcurementLayout);
const ProtectedAccountingLayout = withAuth(AccountingLayout);
const ProtectedEmployeeLayout = withAuth(EmployeeLayout);
const ProtectedChatLayout = withAuth(ChatLayout);
const ProtectedTaskManagementLayout = withAuth(TaskManagementLayout);
const ProtectedQaLayout = withAuth(QaLayout);
const ProtectedDashboard = withAuth(Dashboard);
const ProtectedDashboardLayout = withAuth(DashboardLayout);
const ProtectedCalendarLayout = withAuth(CalendarLayout);
const ProtectedWhatsAppLayout = withAuth(WhatsAppLayout);

// Root redirect component
const RootRedirect: React.FC = () => {
  const token =
    localStorage.getItem("token") || localStorage.getItem("authToken");
  if (token && token.trim() !== "") {
    return <Navigate to="/Dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  // Store roleName in state so it updates reactively
  const [roleName, setRoleName] = React.useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(false);

  React.useEffect(() => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("authToken");
    const isTokenValid = !!(token && token.trim() !== "");
    console.log("App loaded. Token exists:", isTokenValid);
    setIsAuthenticated(isTokenValid);

    // Get role from localStorage
    let newRole = "";
    try {
      const roleDtoStr = localStorage.getItem("roleDto");
      if (roleDtoStr) {
        const roleDto = JSON.parse(roleDtoStr);
        newRole = roleDto.roleName;
      }
    } catch (e) {
      newRole = "";
    }
    setRoleName(newRole);
  }, []);

  const isAdmin = roleName === "Administrator";
  const isSales = roleName === "Sales Representative";

  return (
    <UserProvider>
      <Router>
        <TaskNotification />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />
          {/* Authentication Routes - No Layout, No Protection */}
          <Route path="/login" element={<Login />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/settings/email" element={<GmailConfig />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route
            path="/item-group"
            element={
              <ProtectedInventoryLayout>
                <InventoryGroupPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/warehouses"
            element={
              <ProtectedInventoryLayout>
                <WarehouseDynamicForm />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/demo/demo-availability"
            element={
              <ProtectedInventoryLayout>
                <DemoAvailability />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/Purchase-Requisition"
            element={
              <ProtectedProcuremntLayout>
                <PurchaseRequisitionList />
              </ProtectedProcuremntLayout>
            }
          />
          <Route path="/erp-setup/*" element={<ErpSetupRoutes />} />
          <Route
            path="/purchase-order"
            element={
              <ProtectedProcuremntLayout>
                <PurchaseOrderList />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/view-purchase-requisition/:id"
            element={
              <ProtectedAdminInventoryLayout>
                <ViewPurchaseRequisition />
              </ProtectedAdminInventoryLayout>
            }
          />
          <Route
            path="/claims"
            element={
              <ClaimsLayout>
                <ClaimsPage />
              </ClaimsLayout>
            }
          />
          {/* Claims reports route removed */}
          <Route
            path="/claims/tasks"
            element={
              <ClaimsLayout>
                <ClaimsTasksPage />
              </ClaimsLayout>
            }
          />
          <Route
            path="/claims/voucher"
            element={
              <ClaimsLayout>
                <ClaimVoucher />
              </ClaimsLayout>
            }
          />
          <Route
            path="/claims/vouchers"
            element={
              <ClaimsLayout>
                <ClaimVoucherList />
              </ClaimsLayout>
            }
          />
          <Route
            path="/Locations"
            element={
              <ProtectedInventoryLayout>
                <LocationManagement />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/make-master"
            element={
              <ProtectedInventoryLayout>
                <MakeMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/model-master"
            element={
              <ProtectedInventoryLayout>
                <ModelMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/product-master"
            element={
              <ProtectedInventoryLayout>
                <ProductMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/quotation-title"
            element={
              <ProtectedInventoryLayout>
                <QuotationTitle />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/accessories"
            element={
              <ProtectedInventoryLayout>
                <AccessoriesPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/terms-conditions"
            element={
              <ProtectedInventoryLayout>
                <TermsConditions />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/Stocks"
            element={
              <ProtectedInventoryLayout>
                <ItemStockManagement />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/stock-transaction"
            element={
              <ProtectedInventoryLayout>
                <StockTransactionPage />
              </ProtectedInventoryLayout>
            }
          />
          {/* <Route
            path="/procurement/vendors"
            element={
              <ProtectedProcuremntLayout>
                <CreateVendor />
              </ProtectedProcuremntLayout>
            }
          /> */}
          <Route
            path="/procurement/vendors"
            element={
              <ProtectedProcuremntLayout>
                <VendorManagement />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/procurement/dashboard"
            element={
              <ProtectedProcuremntLayout>
                <ProcurementDashboard />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/procurement/tasks"
            element={
              <ProtectedProcuremntLayout>
                <ProcurementDashboard />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/item-master"
            element={
              <ProtectedInventoryLayout>
                <ItemMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/product-variants"
            element={
              <ProtectedInventoryLayout>
                <BomsPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/stock-balance"
            element={
              <ProtectedInventoryLayout>
                <StockBalanceScreen />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/purchase-invoice"
            element={
              <ProtectedProcuremntLayout>
                <PurchaseInvoiceScreen />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/item-category"
            element={
              <ProtectedInventoryLayout>
                <CategoriesPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/item-method"
            element={
              <ProtectedInventoryLayout>
                <InventoryMethodPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/item-group"
            element={
              <ProtectedInventoryLayout>
                <InventoryGroupPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory-type"
            element={
              <ProtectedInventoryLayout>
                <InventoryTypePage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/item-valuation"
            element={
              <ProtectedInventoryLayout>
                <ValuationPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/uom-master"
            element={
              <ProtectedInventoryLayout>
                <UOMPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/stock-opening-balance"
            element={
              <ProtectedInventoryLayout>
                <StockOpeningBalanceList />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/stock-opening-balance/new"
            element={
              <ProtectedInventoryLayout>
                <StockOpeningBalanceForm />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/stock-opening-balance/:id"
            element={
              <ProtectedInventoryLayout>
                <StockOpeningBalanceForm />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/goods-receipt-note"
            element={
              <ProtectedProcuremntLayout>
                <GRNListPage />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/goods-receipt-note/new"
            element={
              <ProtectedProcuremntLayout>
                <GRNFormPage />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/goods-receipt-note/:id/edit"
            element={
              <ProtectedProcuremntLayout>
                <GRNFormPage />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/vendor-bill"
            element={
              <ProtectedProcuremntLayout>
                <PurchaseBill />
              </ProtectedProcuremntLayout>
            }
          />
          <Route
            path="/item-rate-master"
            element={
              <ProtectedInventoryLayout>
                <RateMasterPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/issues"
            element={
              <ProtectedInventoryLayout>
                <IssueManagement />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/receipt"
            element={
              <ProtectedInventoryLayout>
                <ReceiptManagement />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/stock-update"
            element={
              <ProtectedInventoryLayout>
                <StockUpdateScreen />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedInventoryLayout>
                <TaskManagement stage="demo" />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/whatsapp"
            element={
              <ProtectedWhatsAppLayout>
                <WhatsAppModule />
              </ProtectedWhatsAppLayout>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/task-management"
            element={
              <ProtectedTaskManagementLayout>
                <TaskManagementPage />
              </ProtectedTaskManagementLayout>
            }
          />
          <Route
            path="/task-management/assigned-by-me"
            element={
              <ProtectedTaskManagementLayout>
                <AssignedByMePage />
              </ProtectedTaskManagementLayout>
            }
          />
          {/* User Management Routes - Only for Admin */}
          {/* {isAdmin && ( */}
          <Route
            path="/user-management/*"
            element={
              <ProtectedUserLayout>
                <Routes>
                  <Route index element={<UserManagement />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="roles" element={<RolePermissions />} />
                  <Route path="hierarchy" element={<TeamHierarchy />} />
                </Routes>
              </ProtectedUserLayout>
            }
          />
          {/* )} */}
          {/* Delivery note route retired; preview available inside Delivery Challan page */}
          <Route
            path="/events"
            element={
              <ProtectedLayout>
                <EventManagement />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedLayout>
                <TaskManagement />
              </ProtectedLayout>
            }
          />
          {/* Dashboard - Only for Admin */}
          <Route path="/Dashboard" element={<ProtectedDashboard />} />
          <Route
            path="/sales-dashboard"
            element={
              <ProtectedLayout>
                <SalesDashboard />
              </ProtectedLayout>
            }
          />
          {/* Sales Routes - For Admin and Sales Representative */}
          <>
            <Route
              path="/sales/leads"
              element={
                <ProtectedLayout>
                  <LeadList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/tasks"
              element={
                <ProtectedLayout>
                  <TaskManagement />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/targets"
              element={
                <ProtectedLayout>
                  <TargetList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/targets/new"
              element={
                <ProtectedLayout>
                  <TargetFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/targets/:id/edit"
              element={
                <ProtectedLayout>
                  <TargetFormPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/targets/:id"
              element={
                <ProtectedLayout>
                  <TargetDetails />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/lead"
              element={
                <ProtectedLayout>
                  <LeadView />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/prelead"
              element={
                <ProtectedLayout>
                  <PreLeadList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/opportunities"
              element={
                <ProtectedLayout>
                  <OpportunityList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/opportunity/opportunityForm"
              element={
                <ProtectedLayout>
                  <OpportunityForm />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/opportunity"
              element={
                <ProtectedLayout>
                  <OpportunityView />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/quotations"
              element={
                <ProtectedLayout>
                  <QuotationList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/quotation/quotationForm"
              element={
                <ProtectedLayout>
                  <QuotationForm />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/quotation"
              element={
                <ProtectedLayout>
                  <QuotationView />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/demos"
              element={
                <ProtectedLayout>
                  <DemoList />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/demo/demoForm"
              element={
                <ProtectedLayout>
                  <DemoForm />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sales/demo"
              element={
                <ProtectedLayout>
                  <DemoView />
                </ProtectedLayout>
              }
            />
          </>
          {/* Sales Routes with Protection */}
          <Route
            path="/customers"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Customers" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/leads"
            element={
              <ProtectedLayout>
                <LeadList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/lead"
            element={
              <ProtectedLayout>
                <LeadView />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/prelead"
            element={
              <ProtectedLayout>
                <PreLeadList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/payments"
            element={
              <ProtectedLayout>
                <PaymentList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/opportunities"
            element={
              <ProtectedLayout>
                <OpportunityList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/opportunity/opportunityForm"
            element={
              <ProtectedLayout>
                <OpportunityForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/opportunity"
            element={
              <ProtectedLayout>
                <OpportunityView />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/quotations"
            element={
              <ProtectedLayout>
                <QuotationList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/quotation/quotationForm"
            element={
              <ProtectedLayout>
                <QuotationForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/quotation"
            element={
              <ProtectedLayout>
                <QuotationView />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/demos"
            element={
              <ProtectedLayout>
                <DemoList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/demo/demoForm"
            element={
              <ProtectedLayout>
                <DemoForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/demo"
            element={
              <ProtectedLayout>
                <DemoView />
              </ProtectedLayout>
            }
          />
          {/* Kanban Route */}
          <Route
            path="/kanban"
            element={
              <ProtectedLayout>
                <SalesKanban />
              </ProtectedLayout>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedInventoryLayout>
                <InvoiceList />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/sales/invoiceForm"
            element={
              <ProtectedLayout>
                <InvoiceForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/invoiceForm"
            element={
              <ProtectedLayout>
                <InvoiceForm />
              </ProtectedLayout>
            }
          />
          <Route
            path="/po-view"
            element={
              <ProtectedLayout>
                <PurchaseOrderViewPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/po-management"
            element={
              <ProtectedLayout>
                <PurchaseOrderManagement />
              </ProtectedLayout>
            }
          />
          <Route
            path="/invoice"
            element={
              <ProtectedLayout>
                <InvoiceDetails />
              </ProtectedLayout>
            }
          />
          <Route
            path="/sales/comparison"
            element={
              <ProtectedLayout>
                <ComparePOProcessing />
              </ProtectedLayout>
            }
          />
          {/* Delivery Routes */}
          <Route
            path="/deliveries"
            element={
              <ProtectedLayout>
                <DeliveryList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/inventory/delivery-challan"
            element={
              <ProtectedInventoryLayout>
                <DeliveryChallanPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/delivery"
            element={
              <ProtectedLayout>
                <OrderTrackingDetails />
              </ProtectedLayout>
            }
          />
          {/* Sales Order Routes */}
          <Route
            path="/sales-orders"
            element={
              <ProtectedLayout>
                <SalesOrderDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/salesorder"
            element={
              <ProtectedLayout>
                <SalesOrderList />
              </ProtectedLayout>
            }
          />
          <Route
            path="/salesorderDetail"
            element={
              <ProtectedLayout>
                <SalesOrderDetail />
              </ProtectedLayout>
            }
          />
          {/* Payment Routes */}
          <Route
            path="/payments"
            element={
              <ProtectedLayout>
                <PaymentViewScreen />
              </ProtectedLayout>
            }
          />
          <Route
            path="/Payment"
            element={
              <ProtectedLayout>
                <PaymentForm />
              </ProtectedLayout>
            }
          />
          {/* Inventory Main Route */}
          <Route
            path="/inventory/dashboard"
            element={
              <ProtectedInventoryLayout>
                <InventoryDashboard />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/bill-of-material"
            element={
              <InventoryLayout>
                <BOMListPage />
              </InventoryLayout>
            }
          />
          {/* Inventory Subroutes */}
          <Route
            path="/demo-item-master"
            element={
              <ProtectedInventoryLayout>
                <ItemMasterPage />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="inventory/item-price-list"
            element={
              <ProtectedInventoryLayout>
                <ItemPriceList />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/bom-master"
            element={
              <ProtectedInventoryLayout>
                <BomMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/uom-master"
            element={
              <ProtectedInventoryLayout>
                <UOMMaster />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/demo-stock-status"
            element={
              <ProtectedInventoryLayout>
                <DemoStock />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/demo/check-availability"
            element={
              <ProtectedInventoryLayout>
                <CheckDemoProductAvailability />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/demo/receive-request"
            element={
              <ProtectedInventoryLayout>
                <InventoryReceivesDemoRequest />
              </ProtectedInventoryLayout>
            }
          />
          <Route
            path="/inventory/demo/create-request"
            element={
              <ProtectedInventoryLayout>
                <CreateDemoRequest />
              </ProtectedInventoryLayout>
            }
          />
          {/* Accounts Module Routes */}
          <Route
            path="/accounts"
            element={
              <ProtectedAccountingLayout>
                <AccountingDashboard />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/chart-of-accounts"
            element={
              <ProtectedAccountingLayout>
                <ChartOfAccounts />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/journals"
            element={
              <ProtectedAccountingLayout>
                <JournalEntriesList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/journals/new"
            element={
              <ProtectedAccountingLayout>
                <JournalEntriesForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/trial-balance"
            element={
              <ProtectedAccountingLayout>
                <TrialBalance />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/financial-statements"
            element={
              <ProtectedAccountingLayout>
                <FinancialStatements />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/sales-invoices"
            element={
              <ProtectedAccountingLayout>
                <SalesInvoiceList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/sales-invoices/new"
            element={
              <ProtectedAccountingLayout>
                <SalesInvoiceCreate />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/purchase-invoices"
            element={
              <ProtectedAccountingLayout>
                <PurchaseInvoiceList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/purchase-invoices/new"
            element={
              <ProtectedAccountingLayout>
                <PurchaseInvoiceForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/payments"
            element={
              <ProtectedAccountingLayout>
                <PaymentsReceiptsPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/payments/new"
            element={
              <ProtectedAccountingLayout>
                <AccountsPaymentForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/bank-reconciliation"
            element={
              <ProtectedAccountingLayout>
                <BankReconciliationList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/bank-reconciliation/new"
            element={
              <ProtectedAccountingLayout>
                <BankReconciliationForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/accounts-receivable"
            element={
              <ProtectedAccountingLayout>
                <AccountsReceivablePage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/accounts-payable"
            element={
              <ProtectedAccountingLayout>
                <AccountsPayablePage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/general-ledger"
            element={
              <ProtectedAccountingLayout>
                <GeneralLedgerReports />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/fixed-assets"
            element={
              <ProtectedAccountingLayout>
                <FixedAssets />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/inventory-valuation"
            element={
              <ProtectedAccountingLayout>
                <InventoryValuationPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/tax-management"
            element={
              <ProtectedAccountingLayout>
                <TaxManagementPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/aging-reports"
            element={
              <ProtectedAccountingLayout>
                <AgingReports />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/consolidation"
            element={
              <ProtectedAccountingLayout>
                <ConsolidationPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/multi-currency"
            element={
              <ProtectedAccountingLayout>
                <MultiCurrencyPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/cost-centers"
            element={
              <ProtectedAccountingLayout>
                <CostCenters />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/approvals"
            element={
              <ProtectedAccountingLayout>
                <ApprovalsWorkflowsPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/audit-trail"
            element={
              <ProtectedAccountingLayout>
                <AuditTrailPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/integrations"
            element={
              <ProtectedAccountingLayout>
                <ImportExportPage />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/credit-notes"
            element={
              <ProtectedAccountingLayout>
                <CreditNoteList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/credit-notes/new"
            element={
              <ProtectedAccountingLayout>
                <CreditNoteForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/credit-notes/:id"
            element={
              <ProtectedAccountingLayout>
                <CreditNoteView />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/debit-notes"
            element={
              <ProtectedAccountingLayout>
                <DebitNoteList />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/debit-notes/new"
            element={
              <ProtectedAccountingLayout>
                <DebitNoteForm />
              </ProtectedAccountingLayout>
            }
          />
          <Route
            path="/accounts/debit-notes/:id"
            element={
              <ProtectedAccountingLayout>
                <DebitNoteView />
              </ProtectedAccountingLayout>
            }
          />
          {/* Master Data Routes */}
          <Route
            path="/contacts"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Contacts" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/addresses"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Address" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Products" />
              </ProtectedLayout>
            }
          />
          {/* Scheduler Routes */}
          <Route
            path="/meetings"
            element={
              <ProtectedLayout>
                <SchedulerPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Tasks" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/calls"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Calls" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Events" />
              </ProtectedLayout>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedCalendarLayout>
                <CalendarPage />
              </ProtectedCalendarLayout>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedEmployeeLayout>
                <EmployeeList />
              </ProtectedEmployeeLayout>
            }
          />
          <Route
            path="/employeeform"
            element={
              <ProtectedEmployeeLayout>
                <EmployeeInfoForm />
              </ProtectedEmployeeLayout>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedUserLayout>
                <AttendanceDashboard />
              </ProtectedUserLayout>
            }
          />
          <Route
            path="/attendance/entry"
            element={
              <ProtectedUserLayout>
                <AttendanceEntry />
              </ProtectedUserLayout>
            }
          />
          {/* Other Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedChatLayout>
                <ChatPageV2 />
              </ProtectedChatLayout>
            }
          />
          {/* ─── QA Module Routes ─── */}
          <Route
            path="/qa/sessions"
            element={
              <ProtectedQaLayout>
                <QaSessionListPage />
              </ProtectedQaLayout>
            }
          />
          <Route
            path="/qa/sessions/new"
            element={
              <ProtectedQaLayout>
                <QaSessionCreatePage />
              </ProtectedQaLayout>
            }
          />
          <Route
            path="/qa/sessions/:id/inspect"
            element={
              <ProtectedQaLayout>
                <QaInspectionFormPage />
              </ProtectedQaLayout>
            }
          />
          <Route
            path="/qa/sessions/:id/report"
            element={
              <ProtectedQaLayout>
                <QaSessionReportPage />
              </ProtectedQaLayout>
            }
          />
          <Route
            path="/qa/templates"
            element={
              <ProtectedQaLayout>
                <QaTemplateListPage />
              </ProtectedQaLayout>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedLayout>
                <PlaceholderPage title="Settings" />
              </ProtectedLayout>
            }
          />
          {/* 404 Route */}
          <Route path="/hrms" element={<HRMSPage />} />

          <Route
            path="*"
            element={
              <ProtectedLayout>
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <h1 className="text-2xl font-bold mb-4">
                    404 - Page Not Found
                  </h1>
                  <p className="text-gray-600">
                    The page you're looking for doesn't exist.
                  </p>
                </div>
              </ProtectedLayout>
            }
          />
        </Routes>
      </Router>

      {/* Global ToastContainer - Available for all routes */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </UserProvider>
  );
}

export default App;
