import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import CommonTable from "../../components/CommonTable";
import api from "../../services/api";

// API Response interfaces
interface SalesOrderData {
  id: number;
  orderId: string;
  customerId: number | null;
  orderDate: string;
  expectedDeliveryDate: string | null;
  status: string;
  quotationId: number;
  poId: string | null;
  acceptanceDate: string | null;
  totalAmount: number;
  taxAmount: number;
  grandTotal: number;
  notes: string | null;
  mobileNum: string;
  customerName: string;
  customerEmail?: string;
  userCreated: number;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
}

interface QuotationData {
  id: number;
  version: string;
  quotationId: string;
  customerName: string;
  quotationType: string;
  quotationDate: string;
  opportunityId: string;
  orderType: string;
  status: string;
}

interface PurchaseOrderData {
  id: number;
  poId: string;
  status: string;
  quotationId: number;
  deliveryDate: string | null;
  description: string | null;
  dateCreated: string;
  items: any;
}

interface BomChildItem {
  itemId: number;
  quantity: number;
  itemName: string;
  itemCode: string;
  catNo: string;
  quoteRate: number;
  saleRate: number;
  taxPercentage: number;
  make: string;
  model: string;
  product: string;
  categoryName: string;
  uomName: string;
  hsn: string;
}

interface BomItem {
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: BomChildItem[];
}

interface ApiResponse {
  salesOrder: SalesOrderData;
  quotation: QuotationData;
  purchaseOrder: PurchaseOrderData | null;
  items: BomItem[];
}
const tabs = ["Overview", "Order Items", "Related Documents"];

// Define columns for the nested structure
const orderColumns = [
  { key: "itemName", title: "Product Name", dataIndex: "itemName" },
  { key: "category", title: "Category", dataIndex: "category" },
  { key: "itemCode", title: "Product Code", dataIndex: "itemCode" },
  { key: "unitPrice", title: "Unit Price", dataIndex: "unitPrice" },
  { key: "qty", title: "Quantity", dataIndex: "qty" },
  { key: "amount", title: "Amount", dataIndex: "amount" },
];

// Mock related documents data
const relatedDocuments = [
  {
    type: "Quotation",
    number: "QT-2025-06-0038",
    date: "2025-06-15",
    status: "Accepted",
  },
  {
    type: "Customer PO",
    number: "PO-TS-78452",
    date: "2025-06-18",
    status: "Received",
  },
];

const relatedDocColumns = [
  { key: "type", title: "Document Type", dataIndex: "type" },
  { key: "number", title: "Document #", dataIndex: "number" },
  {
    key: "date",
    title: "Date",
    dataIndex: "date",
    render: (record: any) =>
      new Date(record.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
  },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    render: (record: any) => (
      <span
        className={`px-3 py-1 rounded text-xs font-semibold ${
          record.status === "Accepted"
            ? "bg-green-500 text-white"
            : "bg-green-400 text-white"
        }`}
      >
        {record.status}
      </span>
    ),
  },
];

// Mock inventory data
const inventoryData = [
  {
    sku: "NW-RTR-001",
    product: "High-Performance Router",
    orderQty: 5,
    availableQty: 5,
    reserved: 0,
    requiredPurchase: 0,
    status: "Available",
  },
  {
    sku: "SR-RACK-102",
    product: "Enterprise Server Rack",
    orderQty: 2,
    availableQty: 12,
    reserved: 0,
    requiredPurchase: 0,
    status: "Available",
  },
  {
    sku: "NW-CBL-064",
    product: "Network Cable Bundle",
    orderQty: 20,
    availableQty: 8,
    reserved: 0,
    requiredPurchase: 12,
    status: "Insufficient",
  },
  {
    sku: "SC-CAM-022",
    product: "Security Camera - Indoor",
    orderQty: 10,
    availableQty: 18,
    reserved: 0,
    requiredPurchase: 0,
    status: "Available",
  },
];

const inventoryColumns = [
  { key: "sku", title: "SKU", dataIndex: "sku" },
  { key: "product", title: "Product", dataIndex: "product" },
  { key: "orderQty", title: "Order Quantity", dataIndex: "orderQty" },
  {
    key: "availableQty",
    title: "Available Quantity",
    dataIndex: "availableQty",
  },
  { key: "reserved", title: "Reserved", dataIndex: "reserved" },
  {
    key: "requiredPurchase",
    title: "Required Purchase",
    dataIndex: "requiredPurchase",
  },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    render: (record: any) => (
      <span
        className={`px-3 py-1 rounded text-xs font-semibold ${
          record.status === "Available"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}
      >
        {record.status}
      </span>
    ),
  },
];

// Quotation version history (simulate in localStorage)
function getQuotationHistory() {
  return JSON.parse(localStorage.getItem("quotationHistory") || "[]");
}
function addQuotationVersion(version: any) {
  const history = getQuotationHistory();
  history.push(version);
  localStorage.setItem("quotationHistory", JSON.stringify(history));
}

const SalesOrderDetail = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const salesOrderId = searchParams.get("id");
  const navigate = useNavigate();

  // State for API data
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Existing state
  const [activeTab, setActiveTab] = useState("Overview");
  const [salesOrderStatus, setSalesOrderStatus] = useState("Draft");
  const [poUploaded, setPoUploaded] = useState(false);
  const [poVerified, setPoVerified] = useState(false);
  const [showPoUpload, setShowPoUpload] = useState(false);
  const [showPoGenerate, setShowPoGenerate] = useState(false);
  const [poSigned, setPoSigned] = useState(false);
  const [signedPoDoc, setSignedPoDoc] = useState<any>(null);
  const [poData, setPoData] = useState<any>(null);
  const [poValidation, setPoValidation] = useState<string | null>(null);
  const [quotationHistory, setQuotationHistory] = useState<any[]>(
    getQuotationHistory()
  );
  const [crmStatus, setCrmStatus] = useState<string>("Lead");

  // Fetch sales order data from API
  useEffect(() => {
    const fetchSalesOrderData = async () => {
      if (!salesOrderId) {
        setError("Sales Order ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`SalesOrder/${salesOrderId}`);
        setApiData(response.data);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching sales order data:", error);
        setError("Failed to fetch sales order data");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesOrderData();
  }, [salesOrderId]);

  // On mount, check if PO is signed (simulate file read with localStorage)
  React.useEffect(() => {
    const signedStatus = localStorage.getItem("poSigned");
    const signedDoc = localStorage.getItem("signedPoDoc");
    if (signedStatus === "true") {
      setPoSigned(true);
      setSalesOrderStatus("Completed");
      if (signedDoc) setSignedPoDoc(JSON.parse(signedDoc));
    }
  }, []);

  // Create order summary from API data
  const orderSummary = React.useMemo(() => {
    if (!apiData) return null;
    // Grand total from salesOrder, fallback to 0
    const grandTotal = apiData.salesOrder.grandTotal || apiData.salesOrder.totalAmount || 0;
    return {
      subtotal: grandTotal,
      totalDiscount: 0,
      totalTax: apiData.salesOrder.taxAmount || 0,
      shipping: 0,
      grandTotal,
    };
  }, [apiData]);

  // Transform API items for table display (legacy fallback - BOM items rendered via flatPoItems)
  const transformedOrderItems = React.useMemo(() => {
    return [];
  }, []);

  // Create display data from API response
  const displayData = React.useMemo(() => {
    if (!apiData) return null;

    return {
      orderNumber: apiData.salesOrder.orderId,
      status: apiData.salesOrder.status,
      totalAmount: apiData.salesOrder.grandTotal,
      createdDate: apiData.salesOrder.dateCreated,
      expectedDelivery:
        apiData.salesOrder.expectedDeliveryDate || apiData.salesOrder.orderDate,
      salesRep: "N/A", // Not provided in API
      customer: {
        name: apiData.quotation.customerName,
        contact: apiData.salesOrder.customerName,
        email: apiData.salesOrder.customerEmail || "",
        phone: apiData.salesOrder.mobileNum,
      },
      shipping: {
        address: "N/A", // Not provided in API
        expected:
          apiData.salesOrder.expectedDeliveryDate ||
          apiData.salesOrder.orderDate,
      },
      billing: {
        address: "N/A", // Not provided in API
        paymentTerms: "N/A", // Not provided in API
      },
      details: {
        salesRep: "N/A", // Not provided in API
        quotation: {
          number: apiData.quotation.quotationId,
          link: `/sales/quotation?id=${apiData.quotation.id}`,
        },
      },
    };
  }, [apiData]);

  // Flatten BOM childItems from API response items
  const flatPoItems = React.useMemo(() => {
    const bomItems: BomItem[] = apiData?.items || [];
    const out: any[] = [];
    bomItems.forEach((bom) => {
      const children: BomChildItem[] = bom.childItems || [];
      children.forEach((child) => {
        out.push({
          itemName: child.itemName || "",
          itemCode: child.catNo || child.itemCode || "",
          qty: Number(child.quantity ?? 1),
          unitPrice: Number(child.quoteRate ?? child.saleRate ?? 0),
          taxPercentage: Number(child.taxPercentage ?? 0),
          amount: Number(child.quoteRate ?? 0) * Number(child.quantity ?? 1),
          bomName: bom.bomName || "",
          uom: child.uomName || "",
          hsn: child.hsn || "",
        });
      });
    });
    return out;
  }, [apiData?.items]);

  // Add signed PO and other docs to related documents
  const allRelatedDocuments = React.useMemo(() => {
    const docs = [...relatedDocuments];
    if (signedPoDoc) {
      docs.push({ ...signedPoDoc, actions: true });
    }
    // Add other uploaded docs
    const otherDocs = JSON.parse(localStorage.getItem("otherDocs") || "[]");
    otherDocs.forEach((doc: any) => docs.push({ ...doc, actions: true }));
    return docs;
  }, [signedPoDoc]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales order details...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !apiData || !displayData) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-600">
            {error || "Failed to load sales order data"}
          </p>
        </div>
      </div>
    );
  }

  // Handler for internal PO generation (fallback)
  // Generate PO and navigate to PO view page
  const handlePoGenerate = async () => {
    setShowPoGenerate(false);
    if (!apiData.salesOrder.orderId) return;
    try {
      const res = await api.get(
        `purchaseorder/by-salesorder/${apiData.salesOrder.orderId}`
      );
      // Assuming the response contains the PO id or object
      const poId =
        res?.data?.purchaseOrder?.poId ||
        res?.data?.id ||
        res?.data?.purchaseOrder.poId;
      if (poId) {
        navigate(`/po-view?id=${res.data.purchaseOrder.id || poId}`);
      } else {
        alert("Purchase Order generated, but PO ID not found in response.");
      }
    } catch (err) {
      alert("Failed to generate Purchase Order.");
    }
  };

  // Message for PO requirement

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* PO Message Banner */}

      {/* PO Upload Modal */}

      {/* Internal PO Modal */}
      {showPoGenerate && !signedPoDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Generate Internal PO</h2>
            <div className="mb-2">
              Signature:{" "}
              <input className="border px-2 py-1" placeholder="Signature" />
            </div>
            <div className="mb-4">
              Seal: <input className="border px-2 py-1" placeholder="Seal" />
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowPoGenerate(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handlePoGenerate}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PO Validation/Linking Results */}
      {poValidation && (
        <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-800 rounded">
          {poValidation}
        </div>
      )}
      {/* Quotation Version History */}
      {quotationHistory.length > 0 && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <div className="font-semibold mb-2">Quotation Version History:</div>
          <ul className="list-disc ml-6">
            {quotationHistory.map((ver, idx) => (
              <li key={idx}>
                {ver.date}:{" "}
                {ver.items
                  .map(
                    (i: any) =>
                      `${i.itemName} (Qty: ${i.qty}, Price: $${i.unitPrice})`
                  )
                  .join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* CRM Status */}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-semibold">
          Sales Order:{" "}
          <span className="text-blue-600">{displayData.orderNumber}</span>
        </h1>
        <div className="flex items-center gap-2">
          <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium mr-2">
            {displayData.status}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500">Total Amount</div>
          <div className="text-2xl font-bold mt-2">
            ₹
            {flatPoItems.length > 0
              ? flatPoItems
                  .reduce(
                    (sum, item) =>
                      sum +
                      item.unitPrice * item.qty * (1 + item.taxPercentage / 100),
                    0
                  )
                  .toLocaleString("en-IN", { minimumFractionDigits: 2 })
              : orderSummary
              ? orderSummary.grandTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })
              : "0.00"}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500">Created Date</div>
          <div className="text-xl font-semibold mt-2">
            {new Date(displayData.createdDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500">Expected Delivery</div>
          <div className="text-xl font-semibold mt-2">
            {displayData.expectedDelivery
              ? new Date(displayData.expectedDelivery).toLocaleDateString(
                  undefined,
                  { year: "numeric", month: "short", day: "2-digit" }
                )
              : "N/A"}
          </div>
        </div>
        <div className="bg-white rounded shadow p-6 text-center">
          <div className="text-gray-500">Sales Rep</div>
          <div className="text-xl font-semibold mt-2">
            {displayData.salesRep}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium rounded-t ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-blue-700 hover:bg-blue-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content - Overview */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer */}
          <div className="bg-white rounded shadow p-6">
            <div className="font-semibold text-lg mb-2">Customer</div>
            <div className="font-medium">{displayData.customer.name}</div>
            <div className="text-gray-600 mt-2">
              Contact: {displayData.customer.contact}
            </div>
            {/* <div className="text-gray-600">
              Email: {displayData.customer.email}
            </div> */}
            <div className="text-gray-600">
              Phone: {displayData.customer.phone}
            </div>
          </div>
          {/* Shipping */}
          {/* <div className="bg-white rounded shadow p-6">
            <div className="font-semibold text-lg mb-2">Shipping</div>
            <div>{displayData.shipping.address}</div>
            <div className="text-gray-600 mt-2">
              Expected:{" "}
              {displayData.shipping.expected
                ? new Date(displayData.shipping.expected).toLocaleDateString(
                    undefined,
                    { year: "numeric", month: "short", day: "2-digit" }
                  )
                : "N/A"}
            </div>
          </div> */}
          {/* Billing */}
          {/* <div className="bg-white rounded shadow p-6">
            <div className="font-semibold text-lg mb-2">Billing</div>
            <div>{displayData.billing.address}</div>
            <div className="text-gray-600 mt-2">
              Payment Terms: {displayData.billing.paymentTerms}
            </div>
          </div> */}
          {/* Details */}
          <div className="bg-white rounded shadow p-6">
            <div className="font-semibold text-lg mb-2">Details</div>
            <div>Sales Rep: {displayData.details.salesRep}</div>
            <div className="mt-2">
              Quotation:{" "}
              <a
                href={displayData.details.quotation.link}
                className="text-blue-600 underline"
              >
                {displayData.details.quotation.number}
              </a>
            </div>
          </div>

          {/* PO Information */}
          {apiData?.purchaseOrder && (
            <div className="bg-white rounded shadow p-6 md:col-span-2">
              <div className="font-semibold text-lg mb-4 text-orange-600 border-b border-orange-100 pb-2">
                Purchase Order Information
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "PO Number", value: apiData.purchaseOrder.poId },
                  { label: "Status", value: apiData.purchaseOrder.status },
                  { label: "Customer", value: apiData.salesOrder.customerName },
                  {
                    label: "Order Date",
                    value: apiData.purchaseOrder.dateCreated
                      ? new Date(apiData.purchaseOrder.dateCreated).toLocaleDateString("en-GB")
                      : "N/A",
                  },
                  {
                    label: "Delivery Date",
                    value: apiData.purchaseOrder.deliveryDate
                      ? new Date(apiData.purchaseOrder.deliveryDate).toLocaleDateString("en-GB")
                      : "N/A",
                  },
                  { label: "Description", value: apiData.purchaseOrder.description },
                ].map((row, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm text-gray-800 font-medium mt-1">{row.value || "N/A"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content - Order Items */}
      {activeTab === "Order Items" && (
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Order Items
            </div>
          </div>

          {/* BOM Items from linked PO */}
          {flatPoItems.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded">
                <table className="min-w-full text-sm border-collapse">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-600">#</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-600">Item Name</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-600">Item Code</th>
                      <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-600">BOM</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-600">Qty</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-600">Unit Price (₹)</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-600">Tax (%)</th>
                      <th className="border border-gray-200 px-4 py-2 text-right font-semibold text-gray-600">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatPoItems.map((item: any, index: number) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
                        <td className="border border-gray-200 px-4 py-2">{item.itemName}</td>
                        <td className="border border-gray-200 px-4 py-2">{item.itemCode || "—"}</td>
                        <td className="border border-gray-200 px-4 py-2 text-xs text-gray-500">{item.bomName}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.qty}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.unitPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="border border-gray-200 px-4 py-2 text-right">{item.taxPercentage}%</td>
                        <td className="border border-gray-200 px-4 py-2 text-right font-medium">
                          {(item.unitPrice * item.qty * (1 + item.taxPercentage / 100)).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Grand total */}
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-800">Grand Total: </span>
                  <span className="text-lg font-bold text-orange-600">
                    ₹{flatPoItems.reduce((sum: number, item: any) => sum + item.unitPrice * item.qty * (1 + item.taxPercentage / 100), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="overflow-x-auto rounded">
              <CommonTable
                columns={orderColumns}
                data={transformedOrderItems}
                total={0}
                currentPage={0}
                onPageChange={() => {}}
              />
              {/* Summary rows */}
              {orderSummary && (
                <div className="mt-2">
                  <table className="w-full text-right">
                    <tbody>
                      <tr>
                        <td colSpan={8} className="font-semibold">Subtotal:</td>
                        <td className="pr-4">₹{orderSummary.subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                      {orderSummary.totalTax > 0 && (
                        <tr>
                          <td colSpan={8} className="font-semibold text-gray-600">Total Tax:</td>
                          <td className="pr-4 text-gray-600">₹{orderSummary.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                      )}
                      <tr>
                        <td colSpan={8} className="text-2xl font-bold pt-2">Grand Total:</td>
                        <td className="pr-4 text-2xl font-bold pt-2">₹{orderSummary.grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Tab Content - Related Documents */}
      {activeTab === "Related Documents" && (
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xl font-semibold">Related Documents</div>
          </div>
          <div className="overflow-x-auto rounded">
            <CommonTable
              columns={relatedDocColumns}
              data={allRelatedDocuments}
              total={0}
              currentPage={0}
              onPageChange={() => {}}
            />
          </div>
        </div>
      )}

      {/* Tab Content - Inventory & Procurement */}
      {activeTab === "Inventory & Procurement" && (
        <div className="bg-white rounded shadow p-6">
          <div className="text-xl font-semibold mb-4">Inventory Status</div>
          <div className="overflow-x-auto rounded">
            <CommonTable
              columns={inventoryColumns}
              data={inventoryData}
              total={0}
              currentPage={0}
              onPageChange={() => {}}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700">
              Reserve Inventory
            </button>
            <button className="border border-blue-400 text-blue-600 px-6 py-2 rounded font-semibold bg-blue-50 cursor-not-allowed">
              Generate Purchase Request
            </button>
            <span className="text-gray-500 flex items-center">
              These actions become available once the order is approved
            </span>
          </div>
        </div>
      )}

      {/* Other tabs can be implemented similarly */}
    </div>
  );
};

export default SalesOrderDetail;
