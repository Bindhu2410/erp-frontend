import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MdEdit,
  MdAdd,
  MdPerson,
  MdBusinessCenter,
  MdLocationOn,
  MdDateRange,
} from "react-icons/md";
import DynamicTable from "../../components/common/DynamicTable";
import Tab from "../../components/common/Tab";
import { ToWords } from "to-words";
import Modal from "../../components/common/Modal";
import OpportunityForm from "./OpportunityForm";
import { FiMonitor, FiArrowLeft } from "react-icons/fi";
import DataTable from "../../components/common/DataTable";
import { FaTrash } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { formatDate } from "../../components/lead/FormateDate";
import api from "../../services/api";
import ConfirmBox from "../../components/common/ConfirmBox";
import QuotationForm from "../quotation/QuotationForm";
import DemoForm from "../demo/DemoForm";
import { Label } from "recharts";
import OpportunityProducts from "./OpportunityProducts";
import { toast } from "react-toastify";

interface OpportunityData {
  id?: string;
  opportunityId: string;
  opportunityName: string;
  opportunityFor: string;
  opportunityType: string;
  dateCreated: string;
  dateUpdated: string;
  comments: string;
  contactName: string;
  contactMobileNo: string;
  customerName: string;
  customerId: string;
  leadId: string;
  salesLeadsId: string;
  salesRepresentativeId?: string; // Added property
  customerType: string;
  status: string;
  email: string;
  expectedCompletion: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  territory: string;
  products?: Array<{
    productName: string;
    qty: number;
    unitPrice: number;
    amount: number;
    status: string;
    id?: string;
  }>;
  leadAddress?: {
    pincode?: string;
    area?: string;
    state?: string;
    district?: string;
    city?: string;
    door_no?: string;
    street?: string;
    landmark?: string | null;
  };
}

export interface Quotation {
  id?: number;
  quotationId: string;
  quotationType: string;
  orderType: string;
  quotationDate: string;
  status: string;
  version: string;
  validTill: string;
  quotationFor: string;
  customerName: string;
  comments?: string;
  freightCharge?: string;
  discount?: string | null;
  taxes?: string;
  delivery?: string;
  payment?: string;
  warranty?: string;
  grandTotal: number | null;
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

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
  },
});

const convertToIndianRupees = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
};

const OpportunityView: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const id = searchParams.get("id");
  const [data, setData] = useState<OpportunityData | null>(null);
  const [loading, setLoading] = useState(true);

  const [quotationData, setQuotationData] = useState<Quotation | null>();

  const [dealData, setDealData] = useState<DealData | null>(null);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [productColumns] = useState({
    tableHeading: [
      { fieldName: "Product Name", id: "itemName" },
      { fieldName: "Prodcut Code", id: "itemCode" },
      { fieldName: "Category", id: "category" },
      { fieldName: "Product Accessories", id: "productAccessories" },
      { fieldName: "Other Accessories", id: "otherAccessories" },
      { fieldName: "Quantity", id: "qty" },
      { fieldName: "Unit Price", id: "unitPrice" },
      { fieldName: "Amount", id: "amount" },
    ],
    manageColumn: {
      itemName: true,
      qty: true,
      modelName: false,
      productAccessories: true,
      otherAccessories: true,
      category: true,
      itemCode: true,
      unitPrice: true,
      amount: true,
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [demo, setDemo] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isQuotationOpen, setQuotationOpen] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  
  const normalizeBomItems = (rawItems: any[]) => {
    return rawItems
      .filter((item: any) => {
        // Skip items that have no bomId and no bomChildItems — these are stale direct-item rows
        const hasBomId = item.bomId && String(item.bomId).trim() !== '';
        const hasChildItems = Array.isArray(item.bomChildItems) && item.bomChildItems.length > 0;
        return hasBomId || hasChildItems;
      })
      .map((item: any) => ({
      bomId: item.bomId ? String(item.bomId) : String(item.itemId || ''),
      bomName: item.bomName || item.itemName || '',
      bomType: item.bomType || item.categoryName || 'General',
      bomChildItems: Array.isArray(item.bomChildItems)
        ? item.bomChildItems.map((child: any) => ({
            ...child,
            id: child.id || child.childItemId || 0,
            itemId: child.itemId || child.childItemId || child.id || 0,
            unitPrice: child.unitPrice || child.price || 0,
            quoteRate: child.quoteRate || child.quotationRate || child.saleRate || child.unitPrice || 0,
          }))
        : [],
      accessoryItems: Array.isArray(item.accessoryItems)
        ? item.accessoryItems
        : Array.isArray(item.accessoriesItems)
        ? item.accessoriesItems
        : [],
      accessoryItemIds: item.accessoryItemIds || [],
      quantity: item.quantity || item.qty || 1,
      quoteRate: item.quoteRate || item.saleRate || item.unitPrice || 0,
    }));
  };

  // Memoize the transformed product data for view
  const transformedProducts = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) return { items: [] };
    return { items: normalizeBomItems(products) };
  }, [products]);

  // Memoize the quotation options to prevent infinite re-renders and ensure data is available
  const quotationOptions = useMemo(() => {
    // Early return if no products
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }
    
    // Transform products to BOM structure
    const bomItems = products
      .filter((item: any) => {
        // Keep items that have essential data
        const hasRequiredFields = item && 
          (item.itemId || item.id) && 
          (item.itemName || item.name) && 
          item.itemName !== 'null' && 
          item.itemName !== null;
        
        return hasRequiredFields;
      })
      .map((item: any, index: number) => {
        // Use fallback values for missing fields
        const itemId = item.itemId || item.id || index;
        const itemName = item.itemName || item.name || `Product ${index + 1}`;
        const unitPrice = parseFloat(item.unitPrice || item.price || 0);
        const quoteRate = parseFloat(item.quoteRate || item.saleRate || item.unitPrice || item.price || 0);
        
        // Create BOM structure expected by QuotationForm
        return {
          bomId: itemId.toString(),
          bomName: itemName,
          bomType: item.categoryName || item.category || 'Product',
          bomChildItems: [{
            id: itemId,
            itemId: itemId,
            itemName: itemName,
            itemCode: item.itemCode || item.code || '',
            make: item.make || '',
            model: item.model || '',
            product: item.product || itemName,
            unitPrice: unitPrice,
            quoteRate: quoteRate,
            saleRate: parseFloat(item.saleRate || item.unitPrice || item.price || 0),
            hsn: item.hsn || '',
            taxPercentage: parseFloat(item.taxPercentage || item.tax || 0),
            categoryName: item.categoryName || item.category || 'General',
            qty: parseInt(item.qty || item.quantity || 1),
            amount: parseFloat(item.amount || (unitPrice * parseInt(item.qty || 1)) || 0)
          }],
          accessoryItems: Array.isArray(item.accessoriesItems) ? item.accessoriesItems : [],
          accessoryItemIds: Array.isArray(item.accessoriesItems) 
            ? item.accessoriesItems.map((acc: any) => acc.id || acc.itemId || acc.accessoryId)
            : [],
          quantity: parseInt(item.qty || item.quantity || 1),
          includedChildItems: Array.isArray(item.includedChildItems) ? item.includedChildItems : [],
          totalAmount: parseFloat(item.amount || (unitPrice * parseInt(item.qty || 1)) || 0)
        };
      });
    
    return bomItems;
  }, [products]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateDeal = () => {
    window.location.href = "/create-deal"; // Replace with your actual form route
  };
  const handleProductChange = useCallback((_updatedProduct: any) => {
    // No-op for view mode; only used in edit mode via OpportunityForm
  }, []);

  const handleDeleteOpportunity = async () => {
    setShowConfirm(true);
  };

  const fetchQuotationData = useCallback(async () => {
    if (!id) return;
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/with-items/by-id/${id}`
      );
      const item = response.data?.quotation;
      if (item) {
        setQuotationData({
          id: item.id,
          quotationId: item.quotationId,
          quotationDate: item.quotationDate,
          quotationFor: item.quotationFor,
          customerName: item.customerName,
          quotationType: item.quotationType || "",
          orderType: item.orderType || "",
          status: item.status,
          version: item.version || "",
          validTill: item.validTill,
          comments: item.comments,
          freightCharge: item.freightCharge,
          discount: item.discount,
          taxes: item.taxes,
          delivery: item.delivery,
          payment: item.payment,
          warranty: item.warranty,
          grandTotal: null,
        });
        setQuotationOpen(false);
      }
    } catch (error: any) {
      console.error("Error fetching quotation data:", error);
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      fetchQuotationData();
    }
  }, [id, fetchQuotationData]);

  const confirmDeleteOpportunity = async () => {
    try {
      if (!data) {
        setShowConfirm(false);
        return;
      }
      const response = await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/${data.opportunityId}`
      );
      if (response) {
        navigate(-1);
      }
    } catch (error) {
      // handle error
    } finally {
      setShowConfirm(false);
    }
  };

  const handleEditOpportunity = () => {
    setModal(true);
  };
  const renderStatusCards = () => (
    <div className="mt-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h3 className="text-md font-semibold text-white flex items-center gap-2">
            <span className="bg-white/20 p-2 rounded-lg">
              <MdBusinessCenter className="text-xl sm:text-2xl" />
            </span>
            Quotation Details
          </h3>
          {quotationData && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              quotationData.status === "Draft" ? "bg-yellow-100 text-yellow-700" :
              quotationData.status === "Final Quotation" ? "bg-green-100 text-green-700" :
              quotationData.status === "Negotiation" ? "bg-blue-100 text-blue-700" :
              "bg-white/20 text-white"
            }`}>{quotationData.status}</span>
          )}
        </div>
        <div className="p-6">
          {quotationData ? (
            <div className="space-y-5">
              {/* Top row: ID + dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <p className="text-xs text-orange-500 font-medium mb-1">Quotation ID</p>
                  <a
                    href={`/sales/quotation?id=${quotationData.id}`}
                    className="text-blue-600 font-bold text-lg hover:underline"
                  >
                    {quotationData.quotationId}
                  </a>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-1">Quotation Date</p>
                  <p className="font-semibold text-slate-800">
                    {quotationData.quotationDate
                      ? new Date(quotationData.quotationDate).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-1">Valid Till</p>
                  <p className="font-semibold text-slate-800">
                    {quotationData.validTill
                      ? new Date(quotationData.validTill).toLocaleDateString("en-GB")
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Middle row: customer + order info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 bg-white border border-orange-50 rounded-xl p-4">
                {[
                  { label: "Customer Name", value: quotationData.customerName },
                  { label: "Quotation For", value: quotationData.quotationFor },
                  { label: "Order Type", value: quotationData.orderType },
                  { label: "Delivery", value: quotationData.delivery },
                  { label: "Payment", value: quotationData.payment },
                  { label: "Warranty", value: quotationData.warranty },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col sm:flex-row sm:items-center">
                    <span className="font-bold text-slate-700 min-w-[140px] sm:w-40 text-sm">{label}:</span>
                    <span className="text-slate-600 text-sm ml-0 sm:ml-2">{value || "N/A"}</span>
                  </div>
                ))}
              </div>

              {/* Financial summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-center">
                  <p className="text-xs text-blue-500 font-medium mb-1">Freight Charge</p>
                  <p className="font-bold text-blue-700 text-lg">₹{quotationData.freightCharge || "0"}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100 text-center">
                  <p className="text-xs text-green-500 font-medium mb-1">Taxes</p>
                  <p className="font-bold text-green-700 text-lg">{quotationData.taxes || "0"}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 text-center">
                  <p className="text-xs text-purple-500 font-medium mb-1">Discount</p>
                  <p className="font-bold text-purple-700 text-lg">{quotationData.discount ?? "N/A"}</p>
                </div>
              </div>

              {quotationData.comments && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-orange-500 text-lg">💬</span>
                    <span className="text-sm font-semibold text-orange-700">Comments</span>
                    <span className="flex-1 border-t border-orange-200 ml-2" />
                  </div>
                  <p className="text-slate-700 text-sm">{quotationData.comments}</p>
                </div>
              )}

              <div className="flex justify-end">
                <a
                  href={`/sales/quotation?id=${quotationData.id}`}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow transition-colors"
                >
                  View Quotation
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <button
                className="border px-4 py-2 rounded-md text-white bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base transition-colors hover:bg-orange-700"
                onClick={() => setQuotationOpen(true)}
                disabled={data?.status === "Cancelled"}
              >
                Create Quotation
              </button>
              <p className="text-gray-500 mt-2">No quotation data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (data?.opportunityId) {
      const fetchDemoData = async () => {
        try {
          const response = await api.get(
            `SalesDemo/opportunity/${data.opportunityId}`
          );
          setDemo(response.data);
        } catch (error: any) {
          console.error("Error fetching leads:", error);
        }
      };
      fetchDemoData();
    }
  }, [data?.opportunityId]);
  const section = {
    id: "demos",
    title: "Demo",
    icon: FiMonitor,
    count: 1,
    columns: [
      { key: "demoApproach", label: "Demo Type" },
      { key: "customerName", label: "Customer Name" },
      { key: "status", label: "Status" },
      { key: "demoContact", label: "Demo Contact" },
      { key: "demoApproach", label: "Demo Approach" },
      { key: "demoDate", label: "Demo Date" },
    ],
    data: Array.isArray(demo) ? demo : [],
  };

  const transformToFormProducts = (apiItems: any) => {
    return apiItems.map((item: any) => ({
      ...item,
      productAccessories: Array.isArray(item.includedChildItems)
        ? item.includedChildItems.map((acc: any) => acc.itemName)
        : [],
      otherAccessories: Array.isArray(item.accessoriesItems)
        ? item.accessoriesItems.map((acc: any) => acc.itemName)
        : [],
    }));
  };
  useEffect(() => {
    if (id) {
      const fetchOpportunity = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/with-items/by-id/${id}`
          );
          const rawData = response.data;

          // Address is inside rawData.opportunity now
          const formattedAddress = [
            rawData.opportunity.doorNo,
            rawData.opportunity.street,
            rawData.opportunity.landmark,
          ]
            .filter(Boolean)
            .join(", ");

          // Merge formatted address into opportunity object
          const formattedData = {
            ...rawData.opportunity,
            address: formattedAddress,
          };

          // items are at top-level in response
          const formProducts = Array.isArray(rawData.items) ? rawData.items : [];

          // Debug: Check what products we're getting
          if (formProducts.length === 0) {
            console.warn('No products found in opportunity data');
          }

          // set state
          setData(formattedData);
          setProducts(formProducts);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setError("No data found");
          } else {
            setError(
              error.response?.data?.message || "Failed to fetch opportunity data"
            );
          }
        } finally {
          setLoading(false);
        }
      };
      fetchOpportunity();
    }
  }, [id]);

  const generalInfoSection = {
    Internalid: data?.id,
    title: data?.opportunityName?.toUpperCase(),
    subTitle: `${data?.customerName?.toUpperCase()} | ${data?.contactMobileNo}`,
    status: data?.status,
    id: data?.opportunityId,
    details: {
      mainInfo: [
        { label: "Opportunity For", value: data?.opportunityFor },
        {
          label:
            data?.opportunityFor === "Lead" ? "Lead Name" : "Customer Name",
          value: data?.customerName ?? "N/A",
        },
        { label: "Contact Number", value: data?.contactMobileNo },

        // Show Customer Type only if opportunityFor is 'lead'
        ...(data?.opportunityFor === "lead"
          ? [{ label: "Customer Type", value: data?.customerType }]
          : []),
        { label: "Contact Name", value: data?.contactName },
        {
          label: "Expected Completion",
          value: data?.expectedCompletion
            ? new Date(data.expectedCompletion).toLocaleDateString("en-GB")
            : "N/A",
        },
      ],

      dates: {
        created: data?.dateCreated
          ? new Date(data.dateCreated).toLocaleDateString("en-GB")
          : "N/A",
        updated: data?.dateUpdated
          ? new Date(data.dateUpdated).toLocaleDateString("en-GB")
          : "N/A",
      },
    },
  };
  // Removed stray console.log; statement causing lint error
  const opportunityTab = [
    {
      label: "Activities",
      name: "activities",
      stage: "Opportunity",
      stageItemId: generalInfoSection?.Internalid ?? "",
    },
    {
      label: "External Comments",
      name: "externalComment",
      stage: "Opportunity",
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
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">No Opportunity data found</div>
      </div>
    );
  }
  const cancelOpportunity = async () => {
    if (data && id) {
      try {
        // Build Opportunity object as per your structure, only update status
        const Opportunity = {
          Id: Number(id),
          UserCreated: 1,
          DateCreated: new Date().toISOString(),
          UserUpdated: 1,
          DateUpdated: new Date().toISOString(),
          Status: "Cancelled", // or data.status if you want to use the current status
          ExpectedCompletion:
            data.expectedCompletion || new Date().toISOString(),
          OpportunityType: data.opportunityType || "",
          OpportunityFor: data.opportunityFor || "",
          CustomerId: data.customerId || "",
          CustomerName: data.customerName || "",
          CustomerType: data.customerType || "",
          OpportunityName: data.opportunityName || "",
          OpportunityId: data.opportunityId || "",
          Comments: data.comments || "",
          IsActive: true,
          LeadId: data.leadId || "",
          SalesLeadsId: Number(data.salesLeadsId) || 0,
          SalesRepresentativeId: Number(data.salesRepresentativeId) || 0,
          ContactName: data.contactName || "",
          ContactMobileNo: data.contactMobileNo || "",
        };
        // Items: only pass ItemId and required fields, or empty array if not needed
        const Items = Array.isArray(products) ? products.map((product) => ({
          ItemId: Number(product.itemId) || 0,
          UserCreated: 1,
          DateCreated: new Date().toISOString(),
          UserUpdated: 1,
          DateUpdated: new Date().toISOString(),
          Qty: Number(product.qty) || 0,
          Amount: Number(product.amount) || 0,
          IsActive: true,
          UnitPrice: Number(product.unitPrice) || 0,
          IncludedChildItemIds: Array.isArray(product.includedChildItems)
            ? product.includedChildItems.map((item: any) => item.id || 0)
            : [],
          AccessoriesIds: Array.isArray(product.accessoriesItems)
            ? product.accessoriesItems.map((item: any) => item.id || 0)
            : [],
        })) : [];
        const payload = { Opportunity, Items };
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/with-items/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (response.ok) {
          toast.success("Opportunity cancelled successfully");
        }
        // Optionally show a toast or reload
        setModal(false);
      } catch (e) {
        // Optionally handle error
        setModal(false);
      }
    } else {
      setModal(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-50 p-2 sm:p-6">
      <div className="sticky top-[64.16px] z-30 bg-white shadow flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-0 gap-2 sm:gap-0">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <FiArrowLeft
              className="text-xl text-gray-600 hover:text-orange-500"
              onClick={() => {
                navigate(-1);
              }}
            />
          </button>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-800">
            Opportunity Management
          </h1>
        </div>

        <div
          className="relative flex flex-wrap sm:flex-nowrap p-1 sm:p-2 gap-2 text-left w-full sm:w-auto"
          ref={menuRef}
        >
          <button
            className="flex-1 sm:flex-none px-2 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow transition text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            onClick={() => setShowDemoModal(true)}
            disabled={data?.status === "Cancelled"}
          >
            + Request Demo
          </button>
          <button
            onClick={() => setModal(true)}
            className="flex-1 sm:flex-none p-2 rounded-md bg-blue-500 text-white hover:bg-blue-200 text-xs sm:text-sm"
          >
            Edit
          </button>
          <button
            onClick={cancelOpportunity}
            className="flex-1 sm:flex-none p-2 rounded-md bg-red-700 text-white hover:bg-red-800 text-xs sm:text-sm"
          >
            Cancel
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50">
              <button
                className="px-4 py-2   rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center gap-2"
                onClick={handleEditOpportunity}
              >
                <MdEdit className="text-lg" />
                <span>Edit </span>
              </button>
              <button
                className="px-4 py-2  rounded-lg hover:bg-sky-600 transition-colors duration-200 flex items-center gap-2"
                onClick={() => setShowConfirm(true)}
              >
                <FaTrash className="text-lg" /> <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
      {/* <GeneralInfoCard data={data} generalInfoFields={generalInfoFields} /> */}
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 mx-auto mt-4 sm:mt-0">
        <div className="space-y-4 sm:space-y-6 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 border-b pb-2 border-blue-100">
            <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
              <div>
                <h2 className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-extrabold tracking-tight">
                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg flex-shrink-0">
                    <MdBusinessCenter className="text-xl sm:text-2xl" />
                  </span>
                  <span className="text-blue-800">General Information</span>
                </h2>
                <div className="text-slate-800 font-semibold text-sm sm:text-lg truncate pl-10 sm:pl-14">
                  OPP ID : {generalInfoSection.id || "—"}
                </div>
                <div className="text-slate-500 text-xs sm:text-sm mt-1 pl-10 sm:pl-14">
                  {generalInfoSection.subTitle}
                </div>
              </div>
            </div>
            {/* Status Tag with Tooltip */}
            <div className="mt-3 sm:mt-0 flex items-center gap-2 group relative">
              <span
                className={`px-4 py-1 rounded-full text-base font-bold shadow border border-blue-100 transition-colors duration-200 cursor-pointer
                             ${
                               generalInfoSection.status === "Identified"
                                 ? "bg-yellow-100 text-yellow-700"
                                 : generalInfoSection.status ===
                                   "Solution Presentation"
                                 ? "bg-indigo-100 text-indigo-700"
                                 : generalInfoSection.status === "Proposal"
                                 ? "bg-blue-100 text-blue-700"
                                 : generalInfoSection.status === "Negotiation"
                                 ? "bg-orange-100 text-orange-700"
                                 : generalInfoSection.status === "Won"
                                 ? "bg-green-100 text-green-700"
                                 : generalInfoSection.status === "Lost"
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
                      ? item.label.toLowerCase().includes("date")
                        ? new Date(item.value).toLocaleDateString()
                        : item.value
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
      <div className="bg-white rounded-lg shadow-md border border-slate-200 mt-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Products</h2>

            {/* <button
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-blue-700"
              onClick={() => setShowProduct(true)}
            >
              Add Products
            </button> */}
          </div>

          <OpportunityProducts
            onProductChange={handleProductChange}
            isEdit={false}
            product={transformedProducts}
          />
        </div>
      </div>

      {renderStatusCards()}

      <div className="bg-white rounded-xl mt-6  shadow-lg overflow-hidden p-2">
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl group">
          <div className="flex flex-row items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                <FiMonitor className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                <span className="font-semibold text-gray-800">
                  Demo
                </span>
                {section.data.length !== undefined && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700">
                    {section.data.length}
                  </span>
                )}
              </div>
            </div>
            <button
              className="whitespace-nowrap flex-shrink-0 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
              onClick={() => setShowDemoModal(true)}
              disabled={data?.status === "Cancelled"}
            >
              + Request Demo
            </button>
          </div>
          <DataTable
            columns={section.columns}
            data={
              section.data
                ? section.data.map((section: any) => ({
                    ...section,
                    demoDate: section.demoDate
                      ? new Date(section.demoDate).toLocaleDateString("en-GB")
                      : "",
                  }))
                : []
            }
          />
        </div>
      </div>
      <div className="bg-white rounded-xl mt-6  shadow-lg overflow-hidden p-2">
        <Tab
          tabData={opportunityTab}
          borderColor="border-orange-500"
          textColor="text-orange-500"
          active={opportunityTab[0].label}
        />
      </div>
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Edit Opportunity"
      >
        <OpportunityForm
          onClose={() => setModal(false)}
          opportunityData={{
            ...data,
            products: normalizeBomItems(Array.isArray(products) ? products : []),
          }}
          opportunityId={id || ""}
          isNew={false}
          isEdit={true}
        />
      </Modal>
      <Modal
        isOpen={isQuotationOpen}
        onClose={() => {
          setQuotationOpen(false);
          // Refresh the page after closing the modal
        }}
        title="Create Quotation"
      >
        <QuotationForm
          onClose={() => {
            setQuotationOpen(false);
          }}
          quotationData={(() => {
            const { comments, status, ...rest } = data || {};
            return rest;
          })()}
          options={quotationOptions}
          isdisable={true}
          onSaveSuccess={fetchQuotationData}
          opportunityNumericId={id ?? undefined}
        />
      </Modal>
      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        title="Request Demo"
      >
        <DemoForm
          onClose={() => setShowDemoModal(false)}
          demoData={(() => {
            const { comments, status, ...rest } = data || {};
            // Format leadAddress in the required order
            let demoAddress = "";
            if (
              data &&
              data.leadAddress &&
              typeof data.leadAddress === "object"
            ) {
              const addr = data.leadAddress;
              const ordered = [
                addr.door_no,
                addr.street,
                addr.area,
                addr.district,
                addr.state,
                addr.pincode,
                addr.landmark,
              ];
              demoAddress = ordered.filter(Boolean).join(", ");
            }
            return {
              ...rest,
              demoContact: rest.contactName,
              contactMobileNum: rest.contactMobileNo,
              opportunityId: rest.opportunityId,
              oppuserfrndID: rest.opportunityId,
              address: demoAddress,
            };
          })()}
          options={Array.isArray(quotationOptions) ? quotationOptions : []}
          opportunityNumericId={id ?? undefined}
        />
      </Modal>

      <Modal isOpen={showProduct} onClose={() => setShowProduct(false)}>
        <OpportunityProducts />
      </Modal>
      {showConfirm && (
        <ConfirmBox
          title={data?.opportunityName || "this opportunity"}
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onDelete={() => {
            confirmDeleteOpportunity();
          }}
          id={data?.opportunityId}
        />
      )}
    </div>
  );
};

export default OpportunityView;
