import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";
import OpportunityProducts from "../opportunity/OpportunityProducts";
import generalConfig from "../configs/quotation/generalInfo.json";
import QuotationPrintTemplate from "./QuotationPrintTemplate";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import { BomChildItem, AccessoryItem, BomItem, Product } from "../../types/bom";
import TermsAndConditions from "./TermsandConditon";

interface ProductOption {
  id: number;
  name: string;
  category: string;
  itemName?: string;
  productName?: string;
  itemId?: number;
  bomChildItems?: BomChildItem[];
  accessoryItemIds?: number[];
  accessoryItems?: AccessoryItem[];
  quantity?: number;
}

interface BomOption {
  bomId: string;
  bomName: string;
  bomType: string;
  bomChildItems?: BomChildItem[];
  accessoryItemIds?: number[];
  accessoryItems?: AccessoryItem[];
  quantity?: number;
  quoteRate?: number;
}

const PreviewModal: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onPrint?: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}> = ({ open, onClose, children, onPrint, onSave, isSaving }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl z-50"
          style={{ right: "0.75rem", top: "0.75rem" }}
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-4">{children}</div>
        <div className="flex flex-row items-center justify-end gap-2 p-4 border-t">
          {onSave && (
            <button
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          {onPrint && (
            <button
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              onClick={onPrint}
            >
              Print
            </button>
          )}
          <button
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded disabled:opacity-50"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

interface QuotationFormProps {
  onClose?: () => void;
  quotationData?: any;
  quotationId?: string;
  product?: BomItem[];
  options?: any[];
  onSave?: () => void;
  isdisable?: boolean;
  onSaveSuccess?: () => void;
  selectedProductNames?: string[];
  isCopy?: boolean;
  opportunityNumericId?: string;
}

const QuotationForm: React.FC<QuotationFormProps> = ({
  onClose,
  quotationData,
  quotationId,
  product,
  options = [],
  onSave,
  isdisable,
  onSaveSuccess,
  selectedProductNames = [],
  isCopy = false,
  opportunityNumericId,
}) => {
  // Helper: Map product names to IDs using productOptions
  const getProductIdsFromNames = (names: string[]): number[] => {
    if (!Array.isArray(names) || !productOptions.length) return [];
    return names
      .map((name) => {
        const found = productOptions.find(
          (p: any) =>
            p.itemName === name || p.productName === name || p.name === name,
        );
        return found ? found.itemId || found.id : null;
      })
      .filter((id): id is number => typeof id === "number");
  };

  // Example usage: If you receive product names as ["product1","product2"]
  // const selectedProductIds = getProductIdsFromNames(selectedProductNames);
  // Pass selectedProductIds to the opportunity as needed
  const navigate = useNavigate();
  const location = useLocation();
  const generalInfoRef = useRef<GeneralInformationRef>(null);
  const [productOptions, setProductOptions] = useState<ProductOption[]>(
    (Array.isArray(options) ? options : []).map((opt) => ({
      id: (opt as any).id || (opt as any).itemId || 0,
      name:
        (opt as any).name ||
        (opt as any).itemName ||
        (opt as any).productName ||
        "",
      category: (opt as any).category || (opt as any).type || "",
      itemId: (opt as any).itemId,
      itemName: (opt as any).itemName,
      productName: (opt as any).productName,
      bomChildItems: (opt as any).bomChildItems || [],
      accessoryItemIds: (opt as any).accessoryItemIds || [],
      accessoryItems: (opt as any).accessoryItems || [],
      quantity: (opt as any).quantity || 1,
    })),
  );

  // BOM options derived from opportunity items when an opportunity is selected
  const [opportunityBomOptions, setOpportunityBomOptions] = useState<
    BomOption[]
  >(
    (Array.isArray(options) ? options : []).map((opt: any) => ({
      bomId: opt.bomId || opt.itemCode || opt.id?.toString() || "",
      bomName: opt.bomName || opt.itemName || opt.name || "",
      bomType: opt.bomType || opt.categoryName || opt.category || "General",
      bomChildItems: opt.includedChildItems || opt.bomChildItems || [],
      accessoryItems: opt.accessoriesItems || opt.accessoryItems || [],
      accessoryItemIds: opt.accessoryItemIds || [],
      quantity: opt.qty || opt.quantity || 1,
    })),
  );

  const fetchOpportunityItems = async (opportunityNumericId: string) => {
    try {
      const res = await api.get(
        `SalesOpportunity/with-items/by-id/${opportunityNumericId}`,
      );
      const data = res.data;
      const items: any[] = Array.isArray(data.items) ? data.items : [];
      // Capture tcTemplateId from response
      const [tcRes, titleRes] = await Promise.allSettled([
        data.tcTemplateId
          ? api.get(`TermsConditions/${data.tcTemplateId}`)
          : Promise.resolve(null),
        data.quoteTitleId
          ? api.get(`QuotationTitle/${data.quoteTitleId}`)
          : Promise.resolve(null),
      ]);
      if (data.tcTemplateId && tcRes.status === "fulfilled" && tcRes.value) {
        setTcTemplateId(Number(data.tcTemplateId));
        setTcTemplateData(tcRes.value.data);
        const TERMS_ORDER = [
          "Taxes",
          "Freight Charges",
          "Delivery",
          "Payment",
          "Warranty",
        ];
        const raw: Record<string, string> = {};
        (tcRes.value.data?.details || [])
          .sort((a: any, b: any) => a.sno - b.sno)
          .forEach((d: any) => {
            raw[d.type] = d.termsAndConditions || "";
          });
        const terms: Record<string, string> = {};
        TERMS_ORDER.forEach((key) => {
          terms[key] = raw[key] ?? "";
        });
        setTermsAndConditions(terms);
      }
      if (
        data.quoteTitleId &&
        titleRes.status === "fulfilled" &&
        titleRes.value
      ) {
        setQuoteTitle(titleRes.value.data?.title || "");
      }
      const bomOpts: BomOption[] = items
        .filter((item: any) => item.bomId && item.bomName && item.bomType)
        .map((item: any) => ({
          bomId: item.bomId,
          bomName: item.bomName || "",
          bomType: item.bomType || "General",
          bomChildItems: (item.bomChildItems || item.childItems || []).map(
            (c: any) => ({
              id: c.childItemId || c.id || null,
              make: c.make || "",
              model: c.model || "",
              product: c.product || "",
              itemName: c.itemName || "",
              itemCode: c.itemCode || "",
              unitPrice: c.unitPrice || 0,
              quoteRate: c.quoteRate || c.saleRate || c.unitPrice || 0,
              hsn: c.hsn || "",
              taxPercentage: c.tax || c.taxPercentage || 0,
              categoryName: c.categoryName || "",
            }),
          ),
          accessoryItems: item.accessoryItems || [],
          accessoryItemIds: item.accessoryItemIds || [],
          quantity: item.quantity || item.qty || 1,
          quoteRate: item.quoteRate || item.saleRate || item.unitPrice || 0,
        }));
      setOpportunityBomOptions(bomOpts);
      setProducts(
        bomOpts.map((b) => ({
          bomId: b.bomId,
          bomName: b.bomName,
          bomType: b.bomType,
          bomChildItems: (b.bomChildItems || []).map((c: any) => ({
            id: c.id || 0,
            make: c.make || "",
            model: c.model || "",
            product: c.product || "",
            itemName: c.itemName || "",
            itemCode: c.itemCode || "",
            unitPrice: c.unitPrice || 0,
            quoteRate: c.quoteRate || c.saleRate || c.unitPrice || 0,
            hsn: c.hsn || "",
            taxPercentage: c.taxPercentage || 0,
            categoryName: c.categoryName || "",
          })),
          accessoryItems: b.accessoryItems || [],
          accessoryItemIds: b.accessoryItemIds || [],
          quantity: b.quantity || 1,
          quoteRate: b.quoteRate || 0,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch opportunity items by id:", err);
      toast.error("Failed to load opportunity products");
    }
  };

  useEffect(() => {
    if (opportunityNumericId) {
      fetchOpportunityItems(opportunityNumericId);
    }
  }, [opportunityNumericId]);

  console.log("Product Options:", product, "in QuoonForm");
  const searchParams = new URLSearchParams(location.search);
  const idFromURL = searchParams.get("id");
  const isEdit = Boolean(quotationId || idFromURL);
  const [selectedTerms, setSelectedTerms] = useState<any>({});
  const id = quotationId || idFromURL;
  console.log(productOptions, "Product Options in QuotationForm");
  const parseComments = (val: any): any => {
    if (!val || Array.isArray(val)) return val || [];
    if (typeof val === "string") {
      try { const p = JSON.parse(val); if (Array.isArray(p)) return p; } catch {}
      return val.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const src = quotationData?.quotation ?? quotationData;
    if (src) {
      return { ...src, status: src.status || "Draft", comments: parseComments(src.comments) };
    }
    return { status: "Draft" };
  });
  console.log("Form Data:", formData, "Quotation Data:", quotationData);
  const [products, setProducts] = useState<BomItem[]>(product ?? []);
  const [quotationProducts, setQuotationProducts] = useState<{
    items: BomItem[];
  }>({ items: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(null);
  const [isSavingInPreview, setIsSavingInPreview] = useState(false);
  console.log(formData, "Form Data in QuotationForm");
  const [termsAndConditions, setTermsAndConditions] = useState<any>({});
  const [tcTemplateId, setTcTemplateId] = useState<number | undefined>(
    undefined,
  );
  const [tcTemplateData, setTcTemplateData] = useState<any>(null);
  const [quoteTitle, setQuoteTitle] = useState<string>("");
  const { user, role } = useUser();
  useEffect(() => {
    console.log("Terms and Conditions in QuotationForm:", termsAndConditions);
  }, [termsAndConditions]);

  useEffect(() => {
    if (isEdit && id) {
      setSavedQuotationId(id);
    }
  }, [id]);
  useEffect(() => {
    if (!isEdit) {
      setFormData((prev) => {
        if (prev.status !== "Draft") {
          return { ...prev, status: "Draft" };
        }
        return prev;
      });
    }
  }, [isEdit, setFormData]);
  const handleTermsChange = (terms: any) => {
    console.log(terms, "derder");
    setTermsAndConditions(terms);
  };

  const handleShowPrintPreview = () => {
    // Validate GeneralInformation form
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }
    if (products.length === 0) {
      toast.error("Please add at least one product before saving.");
      return;
    }
    // If special quotation, save directly without showing modal
    if (formData.quotationType?.toLowerCase() === "special") {
      handleSaveProducts();
      return;
    }
    setShowPrintPreview(true);
  };

  // Save button in print preview: call API
  const handleSaveProducts = async () => {
    setIsSavingInPreview(true);
    try {
      // Build the request body as per the required structure
      const quotationPayload = {
        UserCreated: user?.userId || 1,
        UserUpdated: user?.userId || 1,
        Version: formData.version || "",
        Terms: formData.terms || "",
        ValidTill: formData.validTill || new Date().toISOString(),
        QuotationFor: formData.quotationFor || "",
        Status: formData.status || "Draft",
        LostReason: formData.lostReason || "",
        CustomerId: formData.customerId || null,
        QuotationType: formData.quotationType || "",
        QuotationDate: formData.quotationDate || new Date().toISOString(),
        OrderType: formData.orderType || "",
        Comments: Array.isArray(formData.comments) ? formData.comments.join(",") : (formData.comments || ""),
        DeliveryWithin: formData.deliveryWithin || "",
        DeliveryAfter: formData.deliveryAfter || "",
        IsActive: true,
        QuotationId: Number(savedQuotationId) || 0,
        OpportunityId: formData.opportunityId || "",
        LeadId: formData.leadId || "",
        CustomerName: formData.customerName || "",
        ContactName: formData.contactName || "",
        ContactMobileNo: formData.contactMobileNo || "",
        Taxes: formData.taxes || 0,
        Delivery: formData.delivery || "",
        Payment: formData.payment || "",
        Warranty: formData.warranty || "",
        FreightCharge: formData.freightCharge || 0,
        IsCurrent: formData.isCurrent ?? true,
        ParentSalesQuotationsId: formData.parentSalesQuotationsId || null,
        Discount: formData.discount || 0,
        AssignedTo: formData.assignedTo || null,
      };

      // Helper to extract child/accessory item ids from productAccessories/otherAccessories
      const getChildItemIds = (arr: any[] | undefined) =>
        Array.isArray(arr) ? arr.map((item) => item?.id).filter(Boolean) : [];

      const itemsPayload = products.map((product) => {
        // Derive AccessoryItemIds from accessoryItems if present (UI adds to accessoryItems)
        const accIds = product.accessoryItems && product.accessoryItems.length > 0
          ? product.accessoryItems.map((acc: any) => acc.itemId || acc.id).filter(Boolean)
          : product.accessoryItemIds || [];
        return {
          BomId: product.bomId,
          Quantity: product.quantity || 1,
          AccessoryItemIds: accIds,
          AccessoryItems: (product.accessoryItems || []).map((acc: any) => ({
            AccessoryDetailId: acc.itemId || acc.id,
            AccessoriesName: acc.itemName,
            Qty: acc.quantity || 1,
            ItemType: acc.categoryName || "",
            ParentChildItemId: acc.parentChildItemId ?? null,
          })),
        };
      });

      const termsAndConditionsPayload = {
        Id: 0,
        UserCreated: user?.userId,
        DateCreated: new Date().toISOString(),
        UserUpdated: user?.userId,
        DateUpdated: new Date().toISOString(),
        Taxes: termsAndConditions.Taxes || formData.taxes || "",
        FreightCharges:
          termsAndConditions["Freight Charges"] ||
          formData.freightCharges ||
          "",
        Delivery: termsAndConditions.Delivery || formData.delivery || "",
        Payment: termsAndConditions.Payment || formData.payment || "",
        Warranty: termsAndConditions.Warranty || formData.warranty || "",
        TemplateName:
          formData.templateName || termsAndConditions.templateName || "",
        IsDefault: true,
        IsActive: true,
        QuotationId: Number(savedQuotationId) || 0,
      };

      // Get all child item IDs from the BOM items
      const allChildItems = products.flatMap((p) =>
        p.bomChildItems
          .map(
            (child) =>
              child.id || (child as any).childItemId || (child as any).itemId,
          )
          .filter((id): id is number => id != null && id !== 0),
      );

      // Only use idFromURL if the route is /quotation?id=xxx
      const isQuotationEditRoute =
        location.pathname.toLowerCase().includes("quotation") && !!idFromURL;
      const url = isQuotationEditRoute
        ? `sales-quotations/${idFromURL}/consolidated`
        : "sales-quotations/with-items";
      const method = isQuotationEditRoute ? "put" : "post";

      const requestBody = isQuotationEditRoute ? {
        Quotation: {
          ...quotationPayload,
          QuotationId: Number(idFromURL) || Number(savedQuotationId) || 0,
        },
        Items: itemsPayload,
        TermsAndConditions: {
          ...termsAndConditionsPayload,
          QuotationId: Number(idFromURL) || Number(savedQuotationId) || 0,
        },
        CustomerName: formData.customerName || "",
        ChildItemsId: allChildItems,
      } : {
        Quotation: quotationPayload,
        Items: itemsPayload,
        TermsAndConditions: termsAndConditionsPayload,
        CustomerName: formData.customerName || "",
        ChildItemsId: allChildItems,
      };

      const response = await api[method](url, requestBody);
      // If your API client throws on error, this block is only reached on success
      console.log("Quotation saved successfully:", response.data);
      onSave?.(); // Call onSave callback to trigger refresh
      if (onSaveSuccess) {
        onSaveSuccess(); // Let parent handle modal state (print preview)
      }
      setShowPrintPreview(false); // Always close preview modal after save
      toast.success("Quotation and products saved successfully ✅");
      // Optionally navigate or close modal
    } catch (error) {
      console.error("Error saving quotation with items:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save quotation with items",
      );
    } finally {
      setIsSavingInPreview(false);
    }
  };

  const handleCancel = () => {
    navigate("sales/quotation");
    onClose?.();
  };
  console.log("QuotationForm rendered with formData:", productOptions);
  // Print handler for the preview modal
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const printWindow = window.open("", "", "height=800,width=900");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Quotation Print</title>
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
  console.log("QuotationForm rendered with formData:", productOptions);
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<any>(null);

  useEffect(() => {
    // Fetch assigned to options only if status is Negotiation
    if (formData.status === "Negotiation") {
      fetch("/api/SalesLead/assigned-to-dropdown")
        .then((res) => res.json())
        .then((data) => setAssignedToOptions(data || []));
    }
  }, [formData.status]);

  // Dynamically add Assigned To field to config only if status is Negotiation
  const generalInfoConfig = (() => {
    const configCopy = JSON.parse(JSON.stringify(generalConfig));
    // Remove existing assignedTo field if present
    configCopy.fields = configCopy.fields.filter(
      (f: any) => f.id !== "assignedTo",
    );
    // Set OpportunityId and CustomerName fields to text and disabled in edit mode
    if (isEdit) {
      const oppField = configCopy.fields.find(
        (f: any) => f.id === "opportunityId",
      );
      if (oppField) {
        oppField.type = "text";
        oppField.disabled = true;
      }
      const custField = configCopy.fields.find(
        (f: any) => f.id === "customerName",
      );
      if (custField) {
        custField.type = "text";
        custField.disabled = true;
      }
      const custMobileNum = configCopy.fields.find(
        (f: any) => f.id === "contactMobileNo",
      );
      if (custMobileNum) {
        custMobileNum.disabled = true;
      }
    }
    // Remove Draft option from status dropdown if current status is not Draft
    const statusField = configCopy.fields.find(
      (f: any) => f.idName === "status" || f.id === "status",
    );
    if (statusField && formData.status !== "Draft") {
      statusField.options = statusField.options.filter(
        (o: string) => o !== "Draft",
      );
    }

    if (formData.status === "Negotiation") {
      configCopy.fields.push({
        fieldName: "Assigned To",
        id: "assignedTo",
        type: "dropdown",
        required: false,
        URL: "/api/SalesLead/assigned-to-dropdown",
        options: assignedToOptions.map((opt: any) => ({
          label: opt.username,
          value: opt.userId,
        })),
      });
    }
    return configCopy;
  })();
  console.log(formData, "::::QQQ");
  return (
    <>
      <div className="p-8 bg-gray-100">
        <div className="flex flex-col gap-6">
          {/* General Information Section */}
          <GeneralInformation
            ref={generalInfoRef}
            config={generalInfoConfig}
            type="ccc"
            data={quotationData?.quotation ?? quotationData}
            formData={formData}
            setFormData={setFormData}
            setOptions={() => {}}
            setOpportunityId={(numericId) => fetchOpportunityItems(numericId)}
          />

          {/* Products Section */}
          <OpportunityProducts
            onProductChange={(product) => {
              if (product?.items) {
                setProducts(product.items);
              }
            }}
            product={{ items: products }}
            isEdit={true}
            bomOptions={opportunityBomOptions}
          />

          <TermsAndConditions
            data={termsAndConditions}
            onChange={handleTermsChange}
            applyChanges
            tcTemplateId={tcTemplateId}
            tcTemplateData={tcTemplateData}
          />
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={handleShowPrintPreview}
            >
              Save
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded ${
                formData.stageItemId
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              disabled={formData.stageItemId}
              onClick={handleCancel}
              title={
                formData.stageItemId
                  ? "Please save products before leaving"
                  : "Cancel"
              }
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* Print Preview Modal */}
      {/* Only show print preview modal if not special quotation */}
      {formData.quotationType?.toLowerCase() !== "special" && (
        <PreviewModal
          open={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          // Only enable print for non-special quotations, or for special quotations if status is Approved and user is Admin
          onPrint={
            isEdit
              ? handlePrint
              : undefined
          }
          onSave={handleSaveProducts}
          isSaving={isSavingInPreview}
        >
          <div ref={printRef}>
            <QuotationPrintTemplate
              data={{
                ...formData,
                items: products,
                termsAndConditions,
                quoteTitle,
              }}
            />
          </div>
        </PreviewModal>
      )}
    </>
  );
};

export default QuotationForm;
