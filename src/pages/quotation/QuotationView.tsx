import { toast } from "react-toastify";
import React, { useState, useEffect, useRef } from "react";
import { useUser } from "../../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdEdit,
  MdAdd,
  MdBusinessCenter,
  MdDateRange,
  MdOutlineMailOutline,
} from "react-icons/md";
import Tab from "../../components/common/Tab";
import { FiArrowLeft, FiBox, FiMonitor, FiUpload } from "react-icons/fi";
import DataTable from "../../components/common/DataTable";
import { FaPrint, FaTrash } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import Modal from "../../components/common/Modal";
import QuotationForm from "./QuotationForm";
import QuotationPrintTemplate from "./QuotationPrintTemplate";
import OrderAcceptancePrintTemplate from "./OrderAcceptancePrintTemplate";
import POPrintTemplate from "../purchase-order/POPrintTemplate";
import api from "../../services/api";
import ViewTermsAndConditions from "./ViewTermsAndConditions";
import OpportunityProducts from "../opportunity/OpportunityProducts";
import FileUploadLLM from "./FileUploadLLM";
import { IoMdSend } from "react-icons/io";
import StatusDropdown from "../../components/common/StatusDropdown";
interface OpportunityData {
  quotationId: string;
  quotationType: string;
  opportunityId: string;
  contactMobileNo: string;
  customerName: string;
  comments?: string;
  Name: string;
  quotationFor: string;
  quotationDate: string;
  version: string;
  validTill: string;
  orderType: string;
  status: string;
  city: string;
  state: string;
  taxes: string;
  territory: string;
  dateCreated?: string;
  dateUpdated?: string;
  products?: Array<{
    productCode: string;
    productName: string;
    description: string;
    category: string;
    make: string;
    model: string;
    uom: string;
    quantity: number;
    unitPrice: number;
    Amount?: number;
    status: string;
    tax?: number;
    id?: string;
  }>;
}

interface DealData {
  dealId: string;
  leadName: string;
  contactNo: string;
  po: string;
  poDate: string;
  oa: string;
  oaDate: string;
  closingDate: string;
  expectedRevenue: string;
  amount: string;
  opportunityId: string;
}

interface BomChildItem {
  id: number;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  hsn: string;
  taxPercentage: number;
  categoryName: string;
}

interface AccessoryItem {
  id: number;
  name: string;
  unitPrice: number;
  taxPercentage: number;
  quantity: number;
}

interface BomItem {
  bomId: string;
  bomName: string;
  bomType: string;
  bomChildItems: BomChildItem[];
  accessoryItemIds: number[];
  accessoryItems: AccessoryItem[];
  quantity: number;
}

interface Product {
  items: BomItem[];
}

const QuotationView: React.FC = () => {
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printType, setPrintType] = useState<"quotation" | "oa" | "proforma" | "po">("quotation");
  const printRef = useRef<HTMLDivElement>(null);

  const statusOptions = ["Negotiation", "Submitted", "Final Quotation", "Final Quotation Uploaded"];

  const handleStatusChange = async (newStatus: string, comments: string) => {
    try {
      await api.put(`quotation/${id}/status`, {
        status: newStatus,
        comments: comments,
        updatedBy: user?.userId,
      });

      toast.success("Status updated successfully");
      // Refresh quotation data
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Error updating status:", error);
    }
  };
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [data, setData] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState(false);
  const [dealData, setDealData] = useState<DealData | null>(null);
  // State for upload modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [demo, setDemo] = useState<any[]>([]);
  const [soData, setSOData] = useState<any>({});
  const [termsData, setTermsData] = useState<any>({});
  const [QuotationViewData, setQuotationViewData] = useState<any>({});
  const navigate = useNavigate();
  const [oaPrintId, setOaPrintId] = useState<number | null>(null);
  const [productColumns] = useState({
    tableHeading: [
      { fieldName: "Product code", id: "itemCode" },
      { fieldName: "Product Name", id: "itemName" },
      { fieldName: "Unit Price", id: "unitPrice" },
      { fieldName: "Quantity", id: "quantity" },

      { fieldName: "Amount", id: "amount" },
    ],
    manageColumn: {
      itemName: true,
      itemCode: true,
      unitPrice: true,
      amount: true,
      quantity: true,
    },
  });
  const { user, role } = useUser();

  console.log(user, role, "userContext");
  const handleDeleteQuotation = async (product: any) => {
    try {
      const response = await api.delete(`sales-quotations/${id}/with-items`);
      if (response.status === 200 || response.status === 204) {
        navigate("/sales/quotations");
        // Optionally, you can redirect or update the state to reflect the deletion
        // window.location.href = "/quotation"; // Redirect to the quotation list page
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
    } finally {
      // window.location.href = "/quotation";
      // Redirect to the quotation list page
    }
  };

  const handleOrderAcceptance = async () => {
    const purchaseOrderId = Number(soData?.id);
    if (!purchaseOrderId || Number.isNaN(purchaseOrderId)) {
      toast.error("Purchase Order not available. Please generate PO first.");
      return;
    }
    try {
      await api.post(`OrderAcceptance/create-from-po/${purchaseOrderId}`, {});
      setOaPrintId(purchaseOrderId);
      setPrintType("oa");
      setShowPrintModal(true);
    } catch (err) {
      toast.error("Order Acceptance could not be generated.");
    }
  };
  useEffect(() => {
    const fetchDemoData = async () => {
      try {
        const response = await api.get(`SalesDemo/opportunity/${id}`);
        setDemo(response.data);
      } catch (error: any) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchDemoData();
  }, [id]);
  // Helper to format PO data from various API response structures
  const formatPOData = (apiResponse: any) => {
    if (!apiResponse) return null;

    // Check for capitalized structure (PurchaseOrder, Id, PoId, etc.)
    if (apiResponse.PurchaseOrder) {
      const po = apiResponse.PurchaseOrder;
      const items = apiResponse.Items || [];
      return {
        id: po.Id,
        poId: po.PoId,
        status: po.Status,
        quotationId: po.QuotationId,
        amount: items.reduce((sum: number, item: any) => sum + (item.Amount || 0), 0),
        vendorName: apiResponse.VendorName || "",
        items: items,
        bomItems: apiResponse.items || items, // Fallback to Items if items is missing
      };
    }

    // Check for lowercase structure (purchaseOrder, id, poId, etc.)
    if (apiResponse.purchaseOrder) {
      const po = apiResponse.purchaseOrder;
      const items = apiResponse.items || [];
      return {
        id: po.id,
        poId: po.poId,
        status: po.status,
        quotationId: apiResponse.quotation?.quotationId || po.quotationId || apiResponse.quotationInfo?.quotation_id,
        amount: items.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
        vendorName: apiResponse.vendorName || "",
        items: items,
        bomItems: apiResponse.bomItems || items,
      };
    }

    return null;
  };

  // Fetch PO whenever quotation is loaded or status changes
  useEffect(() => {
    const fetchExistingPO = async () => {
      if (!id) return;
      try {
        const response = await api.post(
          `purchaseorder/get-by-po-quotationid?quotationId=${Number(id)}`,
          {},
          { headers: { "Content-Type": "application/json" } }
        );

        const formatted = formatPOData(response.data);
        if (formatted) {
          setSOData(formatted);
        } else {
          setSOData({});
        }
      } catch (error: any) {
        console.warn("PO not found or fetch error", error);
        setSOData({});
      }
    };
    fetchExistingPO();
  }, [id]);

  // State to hold matched opportunity's products
  const [matchedOpportunityProducts, setMatchedOpportunityProducts] = useState<
    any[]
  >([]);

  useEffect(() => {
    const fetchOpportunityProducts = async () => {
      try {
        const requestBody = {
          SearchText: null,
          CustomerNames: null,
          Statuses: null,
          LeadIds: null,
          PageNumber: 1,
          PageSize: 100,
          OrderBy: "date_created",
          OrderDirection: "asc",
          UserCreated: user?.userId ?? null,
        };
        const response = await api.post(`SalesOpportunity/grid`, requestBody);
        const found = response.data.results.find(
          (opp: any) => opp.opportunity.opportunityId == data?.opportunityId
        );

        console.log(found, "items");
        if (found && found.items) {
          setMatchedOpportunityProducts(found.items);
        } else {
          setMatchedOpportunityProducts([]);
        }
      } catch (error: any) {
        setMatchedOpportunityProducts([]);
      }
    };
    if (data?.opportunityId) {
      fetchOpportunityProducts();
    } else {
      setMatchedOpportunityProducts([]);
    }
  }, [data]);

  const generatePOFromQuotation = async (fileName?: string) => {
    if (!id) return;
    try {
      const loadingToast = toast.loading("Generating Purchase Order...");
      const response = await api.post(
        `purchaseorder/create-from-quotation/${id}`,
        id
      );

      // Immediately format and display the PO info using shared utility
      const formattedData = formatPOData(response.data);

      if (formattedData) {
        setSOData(formattedData);
        toast.update(loadingToast, {
          render: "Purchase Order generated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      // Update quotation status to "Final Quotation Uploaded"
      try {
        await api.put(`quotation/${id}/status`, {
          status: "Final Quotation Uploaded",
          comments: `PO uploaded: ${fileName || "N/A"}`,
          updatedBy: user?.userId,
        });
      } catch (e) {
        console.warn("Could not update quotation status to Uploaded", e);
      }

      // Final sync with Quotation state
      fetchQuotation();
      setShowUploadModal(false);
    } catch (error: any) {
      console.error("Error generating purchase order:", error);
      toast.error("Failed to generate Purchase Order.");
    }
  };

  const fetchGeneratePO = async () => {
    // Repurposed to refresh PO data
    if (!id) return;
    try {
      const response = await api.post(
        `purchaseorder/get-by-po-quotationid?quotationId=${Number(id)}`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.data && response.data.purchaseOrder) {
        const POData = response.data;
        const poItems = POData.items || [];
        setSOData({
          id: POData.purchaseOrder.id,
          poId: POData.purchaseOrder.poId,
          status: POData.purchaseOrder.status,
          quotationId: POData.quotation?.quotationId || POData.purchaseOrder.quotationId,
          amount: poItems.reduce((sum: number, item: any) => sum + (item.amount || 0), 0),
          vendorName: POData.vendorName || "",
          items: poItems,
          bomItems: POData.bomItems || poItems,
        });
      }
    } catch (error: any) {
      setSOData({});
    }
  };

  const sendInvoice = () => {
    const to = "brindha@magnusvista.com";
    const subject = "Quotation from JBS Meditec";
    const fileUrl = `${window.location.origin}/Quotation Print.pdf`; // file in /public
    const body = `Dear Customer,\n\nPlease find your Quotation attached.Best regards,\nJBS Meditec`;

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        to
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  const quotationTabs = [
    {
      label: "Activities",
      name: "activities",
      stage: "Quotation",
      stageItemId: id ?? "",
    },
    {
      label: "External Comments",
      name: "externalComment",
      stage: "Quotation",
      stageItemId: id ?? "",
    },
    {
      label: "Email",
      name: "email",
    },
    {
      label: "Summary",
      name: "summary",
      stageItemId: id ?? "",
    },
  ];

  const handleOrderIdClick = () => {
    if (soData?.id) {
      // Navigate to sales order detail page using the id
      navigate(`/po-view?id=${soData.id}`);
    }
  };

  const renderStatusCards = () => {
    const bomItems: any[] = soData?.bomItems || [];

    // Calculate totals from items or use pre-calculated amount
    const totalAmount = soData.amount || bomItems.reduce((sum: number, bom: any) => {
      const children: any[] = bom.childItems || [];
      const bomAmt = children.reduce((s: number, c: any) => {
        const rate = Number(c.quoteRate || c.saleRate || 0);
        const qty = Number(c.quantity || 1);
        const tax = Number(c.tax || 0);
        return s + rate * qty * (1 + tax / 100);
      }, 0) * Number(bom.quantity || 1);
      return sum + bomAmt;
    }, 0);

    if (!soData || !soData.poId) return null;

    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 mx-auto mt-8 overflow-hidden transition-all hover:shadow-xl">
        <div className="p-6 space-y-6">
          {/* Main Title Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-md">
              <MdBusinessCenter className="text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Purchase Order Information
              {soData?.status && (
                <span className={`px-4 py-1 rounded-full text-sm font-bold shadow-sm border ${soData.status === "Open" ? "bg-blue-100 text-blue-600 border-blue-200" :
                  soData.status === "Approved" || soData.status === "Completed" ? "bg-green-100 text-green-700 border-green-200" :
                    "bg-orange-100 text-orange-700 border-orange-200"
                  }`}>
                  {soData.status}
                </span>
              )}
            </h2>
          </div>

          {/* IDs Grid */}
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base">PO ID:</span>
                <span
                  className="text-blue-600 font-bold text-base cursor-pointer hover:underline decoration-2"
                  onClick={handleOrderIdClick}
                >
                  {soData.poId}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base">Quotation ID:</span>
                <span className="text-slate-600 font-medium text-base">
                  {soData.quotationId}
                </span>
              </div>
            </div>

            {/* PO Items Table */}
            {bomItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Purchase Order Items</h3>
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#FFF8F4]">
                      <tr>
                        <th className="px-6 py-4 text-sm font-bold text-slate-800 border-b border-slate-100">BOM Name</th>
                        <th className="px-6 py-4 text-sm font-bold text-slate-800 border-b border-slate-100">Type</th>
                        <th className="px-6 py-4 text-sm font-bold text-slate-800 border-b border-slate-100 text-center">Qty</th>
                        <th className="px-6 py-4 text-sm font-bold text-slate-800 border-b border-slate-100 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {bomItems.map((bom: any, i: number) => {
                        const children: any[] = bom.childItems || [];
                        const bomAmt = bom.amount || children.reduce((s: number, c: any) => {
                          const rate = Number(c.quoteRate || c.saleRate || 0);
                          const qty = Number(c.quantity || 1);
                          const tax = Number(c.tax || 0);
                          return s + rate * qty * (1 + tax / 100);
                        }, 0) * Number(bom.quantity || 1);

                        return (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">{bom.bomName || "—"}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="px-3 py-1 bg-orange-100 text-[#FF8A00] rounded-md text-xs font-bold whitespace-nowrap">
                                {bom.bomType || "Part"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-center text-slate-700 font-semibold">{bom.quantity || 1}</td>
                            <td className="px-6 py-4 text-sm text-right font-bold text-slate-800">
                              ₹{bomAmt.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-[#FFF8F4]">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-right text-sm font-bold text-slate-800 uppercase tracking-wider">Grand Total</td>
                        <td className="px-6 py-4 text-right text-sm font-extrabold text-[#D14D00]">
                          ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Details Info Box */}
          <div className="bg-[#FFF9F2] p-4 rounded-xl border border-orange-100/50 shadow-sm flex items-start gap-3">
            <div className="mt-0.5 text-xl">💡</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#D14D00] mb-1">Purchase Order Details</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Click on the PO ID above to view complete purchase order information and manage it further.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generalInfoSection = {
    title: data?.customerName,
    subTitle: `${data?.quotationId}`,
    status: data?.status,
    validTill: new Date(data?.validTill || "").toLocaleDateString("en-GB"),
    details: {
      mainInfo: [
        { label: "Lead/Customer Name", value: data?.customerName },
        { label: "Quotation Type", value: data?.quotationType },
        {
          label: "Quotation Date",
          value: new Date(data?.quotationDate || "").toLocaleDateString(
            "en-GB"
          ),
        },
        {
          label: "Valid Till",
          value: new Date(data?.validTill || "").toLocaleDateString("en-GB"),
        },
      ],

      dates: {
        created: isNaN(new Date(data?.dateCreated || "").getTime())
          ? "N/A"
          : new Date(data?.dateCreated || "").toLocaleDateString("en-GB"),
        updated: isNaN(new Date(data?.dateUpdated || "").getTime())
          ? "N/A"
          : new Date(data?.dateUpdated || "").toLocaleDateString("en-GB"),
      },
    },
  };

  console.log(generalInfoSection, "gen");
  const fetchQuotation = async () => {
    try {
      const response = await api.get(`sales-quotations/${id}/with-items`);
      // Destructure the API response
      const {
        quotation,
        items,
        termsAndConditions,
        versionHistory,
        customerName,
      } = response.data;
      const updatedItems = (items || []).map((item: any, index: number) => {
        const { qty, unitPrice, taxPercentage } = item;
        const amount = qty * unitPrice * (1 + (taxPercentage || 0) / 100);
        return {
          ...item,
          id: index + 1,
          amount: parseFloat(amount.toFixed(2)),
        };
      });

      const formattedVersions = (versionHistory || []).map((version: any) => ({
        id: version.quotationId || version.id || "",
        version: version.quotationVersionId || version.version || "N/A",
        customerName: version.customerName || "",
        status: version.status || "",
        valid_till: version.validTill
          ? new Date(version.validTill).toLocaleDateString("en-GB")
          : quotation?.validTill
            ? new Date(quotation.validTill).toLocaleDateString("en-GB")
            : "N/A",
      }));
      setVersionHistory(formattedVersions || []);
      console.log(formattedVersions, "versionHistory");

      // Fetch QuotationTitle if quoteTitleId is present
      let quoteTitleName: string | undefined;
      if (response.data.quoteTitleId) {
        try {
          const titleRes = await api.get(`QuotationTitle/${response.data.quoteTitleId}`);
          quoteTitleName = titleRes.data?.title;
        } catch (e) {
          console.error("Failed to fetch QuotationTitle:", e);
        }
      }

      setQuotationViewData({ ...response.data, quoteTitleName });
      // Merge root-level fields into the main data object
      setData({
        ...quotation,
        customerName: customerName || quotation.customerName,
        termsAndConditions: termsAndConditions,
      });
      setProducts(updatedItems || []);
      setTermsData(termsAndConditions || {});
      // Fetch TC template if tcTemplateId present
      if (response.data.tcTemplateId) {
        try {
          const tcRes = await api.get(`TermsConditions/${response.data.tcTemplateId}`);
          const TERMS_ORDER = ["Taxes", "Freight Charges", "Delivery", "Payment", "Warranty"];
          const raw: Record<string, string> = {};
          (tcRes.data?.details || [])
            .sort((a: any, b: any) => a.sno - b.sno)
            .forEach((d: any) => { raw[d.type] = d.termsAndConditions || ""; });
          const terms: Record<string, string> = {};
          TERMS_ORDER.forEach((key) => { terms[key] = raw[key] ?? ""; });
          setTermsData(terms);
        } catch (e) {
          console.error("Failed to fetch TC template:", e);
        }
      }
    } catch (error) {
      console.error("Error fetching opportunity:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchQuotation();
  }, [id]);
  console.log(data, "dataOPPORTUNITY");

  // State for version history
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  // Quotation status helpers
  const isDraft = data?.status === "Draft";
  const isNegotiation = data?.status === "Negotiation";
  const isFinalized = data?.status === "Final Quotation";
  const isCancelled = data?.status === "Cancelled";
  const draftCount = versionHistory.filter((v) => v.status === "Draft").length;
  const hasNegotiationInHistory = versionHistory.some((v) => v.status === "Negotiation");
  const canEdit = (isDraft && draftCount <= 1 && !hasNegotiationInHistory) || isNegotiation;

  // Handler for Final Quotation button (using consolidated API structure)
  const handleFinalizeQuotation = async () => {
    if (!data || !id) return;
    try {
      // Prepare Quotation payload with status updated
      const quotationPayload = {
        ...data,
        status: "Final Quotation",
        UserUpdated: user?.userId || 1,
        DateUpdated: new Date().toISOString()
      };
      // Items payload: use products state if available, else empty array
      const itemsPayload = (products || []).map((product) => ({
        BomId: product.bomId,
        Quantity: product.quantity || 1,
        AccessoryItemIds: product.accessoryItemIds || [],
      }));
      // Terms and conditions: use termsData state if available, else {}
      const termsAndConditionsPayload = {
        Id: 0,
        UserCreated: user?.userId || 1,
        DateCreated: new Date().toISOString(),
        UserUpdated: user?.userId || 1,
        DateUpdated: new Date().toISOString(),
        Taxes: termsData.Taxes || data.taxes || "",
        FreightCharges: termsData["Freight Charges"] || "",
        Delivery: termsData.Delivery || "",
        Payment: termsData.Payment || "",
        TemplateName: termsData.templateName || "",
        IsDefault: true,
        IsActive: true,
        QuotationId: Number(id) || 0,
      };
      // ChildItemsId: collect all child item IDs from products if present, filter out null/undefined
      let allChildItems: number[] = [];
      if (Array.isArray(products)) {
        products.forEach((item) => {
          if (item.bomChildItems && Array.isArray(item.bomChildItems)) {
            item.bomChildItems.forEach((child: any) => {
              if (child && child.id && !isNaN(Number(child.id))) {
                allChildItems.push(Number(child.id));
              }
            });
          }
        });
      }

      console.log('Debug - allChildItems:', allChildItems);
      console.log('Debug - products:', products);

      // Build request body with the request wrapper that the API expects
      const requestBody = {
        request: {
          Quotation: quotationPayload,
          Items: itemsPayload,
          TermsAndConditions: termsAndConditionsPayload,
          CustomerName: data.customerName || "",
          ChildItemsId: allChildItems.length > 0 ? allChildItems : [], // Send empty array if no valid child items
        }
      };

      console.log('Debug - Final request body:', JSON.stringify(requestBody, null, 2));

      // Use the consolidated endpoint
      const response = await api.put(
        `sales-quotations/${id}/consolidated`,
        requestBody
      );
      if (response.status === 200 || response.status === 204) {
        toast.success("Quotation finalized successfully!");
        setData((prev: any) => ({ ...prev, status: "Final Quotation" }));
      } else {
        toast.error("Failed to finalize quotation.");
      }
    } catch (error) {
      console.error("Error finalizing quotation:", error);
      toast.error("Failed to finalize quotation.");
    }
  };

  // Fetch version history

  // Calculate payment summary data
  const subTotal = products.reduce(
    (sum, p) =>
      sum +
      (p.amount !== undefined
        ? Number(p.amount)
        : (p.quantity || 0) * (p.unitPrice || 0)),
    0
  );
  const discount = subTotal * (10 / 100) || 0;
  const match = data?.taxes;
  const discountPercent = "10%";
  const taxRate = match ? parseFloat(match[1]) : 10;
  console.log(data, "reate");
  const tax = subTotal * (10 / 100);
  const taxPercent = taxRate.toString();
  const freightCharges = 100;
  const grandTotal = subTotal - discount + tax + freightCharges;
  const paymentData = {
    subTotal,
    discount,
    discountPercent,
    tax,
    taxPercent,
    freightCharges,
    grandTotal,
  };

  // Unified print handler for both Quotation and Order Acceptance
  const handlePrint = (type: "quotation" | "oa" | "proforma" | "po") => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=900");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${type === "quotation"
            ? "Quotation Print"
            : type === "po"
            ? "Purchase Order Print"
            : "Order Acceptance Print"
          }</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>${printContents}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  };

  // Example: Only allow edit/delete for last version, others can only print
  const isLastVersion = (currentVersion: string, versions: string[]) => {
    return (
      versions.length > 0 && currentVersion === versions[versions.length - 1]
    );
  };



  // --- Print Dropdown State and Handler (must be before return) ---

  const [showPrintDropdown, setShowPrintDropdown] = useState(false);
  useEffect(() => {
    const handler = () => {
      setShowPrintDropdown(false);
    };
    if (showPrintDropdown) {
      window.addEventListener("click", handler);
    }
    return () => window.removeEventListener("click", handler);
  }, [showPrintDropdown]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="sticky top-[64.16px] z-30 bg-white shadow px-2 py-2 flex justify-between items-center ">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft
            className="text-xl text-gray-600 hover:text-orange-500"
            onClick={() => {
              navigate("/sales/quotations");
            }}
          />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">
          Quotation Management
        </h1>

        {/* Hide action buttons until loading is false and data is loaded */}
        {!loading && data && (
          <div className="flex justify-between gap-2 text-left" ref={menuRef}>
            {/* Custom Print Dropdown Menu */}
            <div className="relative" style={{ minWidth: 140 }}>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-semibold focus:outline-none w-full"
                type="button"
                title="Print"
                disabled={data.status === "Draft" && data.quotationType === "Special"}
                style={data.status === "Draft" && data.quotationType === "Special" ? { opacity: 0.5, pointerEvents: "none" } : {}}
                onClick={e => {
                  e.stopPropagation();
                  setShowPrintDropdown((prev) => !prev);
                }}
              >
                <FaPrint className="w-5 h-5" />
                <span>Print</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {showPrintDropdown && (
                <div
                  className="absolute left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-20"
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-blue-50"
                    onClick={() => {
                      setPrintType("quotation");
                      setShowPrintDropdown(false);
                      setTimeout(() => setShowPrintModal(true), 0);
                    }}
                  >
                    Quotation
                  </button>
                  {data.status === "Final Quotation" && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      onClick={() => {
                        setPrintType("proforma");
                        setShowPrintDropdown(false);
                        setTimeout(() => setShowPrintModal(true), 0);
                      }}
                    >
                      Proforma Invoice
                    </button>
                  )}
                  {data.status === "Final Quotation" && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      onClick={() => {
                        setPrintType("po");
                        setShowPrintDropdown(false);
                        setTimeout(() => setShowPrintModal(true), 0);
                      }}
                    >
                      PO
                    </button>
                  )}
                  {soData?.poId && (
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      onClick={() => {
                        setPrintType("po");
                        setShowPrintDropdown(false);
                        setTimeout(() => setShowPrintModal(true), 0);
                      }}
                    >
                      Purchase Order Detail Template
                    </button>
                  )}
                </div>
              )}
            </div>
            {/* Upload PO Button next to Print */}
            {(isFinalized || data.status === "Final Quotation Uploaded") && !soData.poId && (
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 border border-green-600 font-semibold focus:outline-none shadow-sm transition-all"
                onClick={() => setShowUploadModal(true)}
                title="Upload PO"
              >
                <FiUpload size={18} />
                <span>Upload PO</span>
              </button>
            )}
            {/* Upload Modal - Moved outside version gate to ensure it opens from header button regardless of version */}
            {showUploadModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                    onClick={() => setShowUploadModal(false)}
                  >
                    &times;
                  </button>
                  <div className="p-6">
                    <FileUploadLLM
                      quotationId={id || ""}
                      onSuccess={(fileName) => generatePOFromQuotation(fileName)}
                    />
                  </div>
                </div>
              </div>
            )}


            {/* Status dropdown removed as per user request */}
            {/* Only show action buttons for the last version */}
            {versionHistory.length > 0 &&
              data.version ===
              versionHistory[versionHistory.length - 1].version && (
                <>
                  {/* Final Quotation Button: Only show if not Draft and not already Final Quotation or Cancelled */}
                  {!isDraft && !isFinalized && !isCancelled && (
                    <button
                      className="p-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 border border-purple-600"
                      onClick={handleFinalizeQuotation}
                      title="Mark as Final Quotation"
                    >
                      Final Quotation
                    </button>
                  )}
                  {/* Upload Button */}
                  <button
                    className="p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 border border-green-500"
                    onClick={sendInvoice}
                    disabled={data.status === "Draft" && data.quotationType === "Special"}
                    style={data.status === "Draft" && data.quotationType === "Special" ? { opacity: 0.5, pointerEvents: "none" } : {}}
                  >
                    <MdOutlineMailOutline size={18} title="Send Quotation" />
                  </button>
                  {/* Upload PO Button removed from here and moved to header */}



                  {isFinalized && soData?.id && (
                    <button
                      className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 border border-blue-600"
                      onClick={handleOrderAcceptance}
                      title="Print OA"
                    >
                      Print OA
                    </button>
                  )}
                </>
              )}
            {/* {soData.poId && (
              <button
                className={`p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 ${
                  !soData?.poId ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleOrderAcceptance}
                title="Order Acceptance"
                disabled={!soData?.poId}
              >
                Order Acceptance
              </button>
            )} */}
            {/* Unified Print Preview Modal */}
            {/* {showPrintModal && ( */}
            {showPrintModal && (
              <Modal
                isOpen={showPrintModal}
                onClose={() => setShowPrintModal(false)}
                title="Quotation"
              >
                <div className="  relative">
                  <div className="p-4" ref={printRef}>
                    {printType === "quotation" ? (
                      <QuotationPrintTemplate
                        data={{ ...QuotationViewData, termsAndConditions: termsData }}
                      />
                    ) : printType === "proforma" ? (
                      <QuotationPrintTemplate
                        data={{ ...QuotationViewData, termsAndConditions: termsData }}
                        titleOverride="Proforma Invoice"
                      />
                    ) : printType === "po" ? (
                      <POPrintTemplate
                        data={{
                          purchaseOrder: {
                            poId: `PO-${data?.quotationId || 'DRAFT'}`,
                            dateCreated: new Date().toISOString()
                          },
                          quotationInfo: {
                            customer_name: data?.customerName || "",
                            gst_no: "",
                            quotation_id: data?.quotationId || "",
                            quotation_type: data?.quotationType || "",
                            quotation_date: data?.quotationDate || "",
                            valid_till: data?.validTill || "",
                            deliveryWithin: "WITH 15 DAYS"
                          },
                          quotation: {
                            customerName: data?.customerName || "",
                            address: "",
                            gstNo: "",
                            deliveryWithin: "WITH 15 DAYS"
                          },
                          items: QuotationViewData?.items?.map((item: any) => ({
                            bomId: item.bomId || "",
                            bomName: item.bomName || "",
                            bomType: item.bomType || "",
                            quantity: item.quantity || 1,
                            childItems: item.childItems || item.bomChildItems || [],
                            bomChildItems: item.childItems || item.bomChildItems || []
                          })) || [],
                          leadAddress: null
                        }}
                      />
                    ) : (
                      <OrderAcceptancePrintTemplate
                        purchaseOrderId={String(oaPrintId ?? soData?.id ?? "")}
                      />
                    )}
                  </div>
                  <div className="flex flex-row justify-end items-center gap-2 p-4 border-t">
                    <button
                      className={`px-4 py-2 rounded text-white ${printType === "quotation"
                        ? "bg-gray-600 hover:bg-gray-700"
                        : printType === "po"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-orange-600 hover:bg-orange-700"
                        }`}
                      onClick={() => handlePrint(printType)}
                      disabled={data.status === "Draft" && data.quotationType === "Special"}
                      style={data.status === "Draft" && data.quotationType === "Special" ? { opacity: 0.5, pointerEvents: "none" } : {}}
                    >
                      Print
                    </button>
                    <button
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-200"
                      onClick={sendInvoice}
                      disabled={data.status === "Draft" && data.quotationType === "Special"}
                      style={data.status === "Draft" && data.quotationType === "Special" ? { opacity: 0.5, pointerEvents: "none" } : {}}
                    >
                      <IoMdSend size={18} />
                      Send Quotation
                    </button>
                  </div>
                </div>
              </Modal>
            )}

            {/* )} */}
            {/* Only show Edit/Make Copy/Delete buttons for the last version */}
            {/* {versionHistory.length > 0 &&
              data.version ===
                versionHistory[versionHistory.length - 1].version && ( */}
            <>
              {/* Show Edit button only if not a sales representative */}
              {canEdit && (
                <button
                  onClick={() => setModal(true)}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                >
                  <MdEdit className="text-lg" />
                  Edit
                </button>
              )}

              {/* Show Make Copy button only if not a sales representative */}
              {!isDraft &&
                role?.roleName !== "Sales Representative" &&
                role?.roleName !== "Sales Rep" && (
                  <button
                    onClick={() => setModal(true)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-md text-white ${isDraft
                      ? "bg-gray-300 cursor-not-allowed"
                      : isFinalized
                        ? "hidden"
                        : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    disabled={isDraft}
                  >
                    <MdAdd className="text-lg" />
                    Make Copy
                  </button>
                )}

              <button
                onClick={handleDeleteQuotation}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 ${isFinalized ? "cursor-not-allowed opacity-50" : ""
                  }`}
                disabled={isFinalized}
              >
                <FaTrash className="text-lg" />
                Delete
              </button>
            </>
            {/* )} */}
          </div>
        )}
      </div>

      {/* <GeneralInfoCard
        data={data ?? sampleData}
        generalInfoFields={generalInfoFields}
      /> */}

      <div className="bg-white rounded-lg shadow-lg p-6 mx-auto mt-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Quotation Version History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-4 font-medium">Version</th>
                <th className="pb-4 font-medium">Customer Name</th>
                <th className="pb-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {versionHistory.length > 0 ? (
                versionHistory.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-4 text-sm">
                      <span
                        className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        onClick={() => navigate(`/sales/quotation?id=${row.id}`)}
                      >
                        {row.version || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-700">{row.customerName || "N/A"}</td>
                    <td className="py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full ${row.status === "Draft" ? "bg-gray-100 text-gray-800" :
                        row.status === "Negotiation" ? "bg-yellow-100 text-yellow-800" :
                          row.status === "Final Quotation" ? "bg-green-100 text-green-800" :
                            row.status === "Cancelled" ? "bg-red-100 text-red-800" : ""
                        }`}>{row.status || "N/A"}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="text-center py-8 text-gray-500">No record found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white mt-[70px] rounded-lg shadow-lg p-6  mx-auto">
        <div className="space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 border-b pb-2 border-blue-100">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <div>
                <h2 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                    <MdBusinessCenter className="text-2xl" />
                  </span>
                  <span className="text-blue-800">General Information</span>
                </h2>
                <div className="text-slate-800 font-semibold text-lg truncate">
                  {generalInfoSection.title || "—"}
                </div>
                <div className="text-slate-500 text-sm mt-1">
                  {generalInfoSection.subTitle}
                </div>
              </div>
            </div>
            {/* Status Tag with Tooltip */}
            <div className="mt-3 sm:mt-0 flex items-center gap-2 group relative">
              <span
                className={`px-4 py-1 rounded-full text-base font-bold shadow border border-blue-100 transition-colors duration-200 cursor-pointer
                               ${generalInfoSection.status === "Submitted"
                    ? "bg-blue-100 text-blue-700"
                    : generalInfoSection.status === "Negotiation"
                      ? "bg-yellow-100 text-yellow-700"
                      : generalInfoSection.status ===
                        "Final Quotation"
                        ? "bg-green-100 text-green-700"
                        : generalInfoSection.status === "Lost" ||
                          generalInfoSection.status === "Failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                  }
                             `}
              >
                {generalInfoSection.status || "—"}
              </span>
              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
                Status of this opportunity
              </span>
            </div>
          </div>

          {/* Main Info Two-Column Layout */}
          <div className="bg-white border border-blue-100 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
              {generalInfoSection.details.mainInfo.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center mb-2"
                >
                  <span className="font-bold text-slate-800 min-w-[150px] sm:w-44 block">
                    {item.label}:
                  </span>
                  <span className="text-slate-700 text-base ml-0 sm:ml-2 mt-1 sm:mt-0">
                    {item.value &&
                      item.value !== "null" &&
                      item.value !== null &&
                      item.value !== undefined
                      ? item.value
                      : "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section with Divider and Icon */}
          {data?.comments && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-blue-500 text-lg">💬</span>
                <span className="text-sm font-semibold text-blue-700">
                  Comments
                </span>
                <span className="flex-1 border-t border-blue-200 ml-2" />
              </div>
              <p className="text-slate-700 text-sm mt-1">{data.comments}</p>
            </div>
          )}

          {/* Dates */}
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <div className="flex items-center gap-1">
              <MdDateRange className="inline-block mr-1 text-blue-300" />
              Created: {generalInfoSection.details.dates.created || "—"}
            </div>
            {generalInfoSection.details.dates.updated && (
              <div className="flex items-center gap-1">
                <MdDateRange className="inline-block mr-1 text-blue-300" />
                Updated: {generalInfoSection.details.dates.updated}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products section with updated styling */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200 mt-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Products</h2>
          </div>

          {/* <CommonTable
            columns={[
              { key: "itemCode", title: "Product Code", dataIndex: "itemCode" },
              { key: "itemName", title: "Product Name", dataIndex: "itemName" },
              { key: "unitPrice", title: "Unit Price", dataIndex: "unitPrice" },
              { key: "qty", title: "Quantity", dataIndex: "qty" },
              {
                key: "taxPercentage",
                title: "Tax (%)",
                dataIndex: "taxPercentage",
              },
              { key: "amount", title: "Amount", dataIndex: "amount" },
            ]}
            data={products}
            loading={loading}
            total={products.length}
            currentPage={1}
            onPageChange={() => {}}
            pagination={false}
          /> */}
          <OpportunityProducts
            onProductChange={(product) => {
              if (product?.items) {
                setProducts(product.items);
              }
            }}
            product={{
              items:
                QuotationViewData?.items?.map((item: any) => ({
                  bomId: item.bomId || "",
                  bomName: item.bomName || "",
                  bomType: item.bomType || "",
                  bomChildItems: item.childItems || item.bomChildItems || [],
                  accessoryItems: item.accessoryItems || [],
                  accessoryItemIds: item.accessoryItemIds || [],
                  quantity: item.quantity || 1,
                })) || [],
            }}
            isEdit={false}
            bomOptions={[]}
          />

          {/* <div className="flex justify-end">
            <PaymentSummary {...paymentData} />
          </div> */}

          <ViewTermsAndConditions data={termsData} />
        </div>
      </div>
      {soData && <div>{renderStatusCards()}</div>}

      {/* <div className="bg-white rounded-xl mt-6  shadow-lg overflow-hidden p-2">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <FiMonitor className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg text-gray-800">
                  Demo
                </span>
                {section.data.length !== undefined && (
                  <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                    {section.data.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DataTable
            columns={section.columns}
            data={section.data.map((section: any) => section)}
          />
        </div>
      </div> */}
      <div className="bg-white rounded-xl mt-6  shadow-lg overflow-hidden p-2">
        <Tab
          tabData={quotationTabs}
          borderColor="border-orange-500"
          textColor="text-orange-500"
          active={quotationTabs[0].label}
        />
      </div>
      <Modal
        isOpen={modal}
        onClose={() => {
          setModal(false);
          navigate("/sales/quotations");
        }}
        title={"Edit Quotation"}
      >
        <QuotationForm
          onClose={() => {
            setModal(false);
            navigate("/sales/quotations");
          }}
          onSaveSuccess={() => {
            setModal(false);
          }}
          onSave={fetchQuotation}
          quotationData={data}
          product={products}
          options={matchedOpportunityProducts}
          isdisable={true}
        />
      </Modal>

      {/* Quotation Version History */}
    </div>
  );
};

export default QuotationView;
