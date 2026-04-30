import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { ItemReference } from "../../types/itemLocation";
import issueFormConfig from "./issueFormConfig.json";
import DropDown from "../../components/common/DropDown";
import InputField from "../../components/common/InputField";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import OptionalItemTable, { OptionalItem } from "./OptionalItemTable";
import IssueDetailGrid, { IssueItem } from "./IssueDetailGrid";
import { getUserRoles } from "../../services/user.service";
import salesLeadService from "../../services/salesLeadService";

import { Item } from "../inventory/demo-stock-status/ItemMaster";
import { useUser } from "../../context/UserContext";
import issueService from "../../services/issueService";
import ewayBillService from "../../services/ewayBillService";

interface HeaderFields {
  [key: string]: string | string[];
}

interface Issue {
  id: number;
  userCreated: number;
  dateCreated?: string;
  userUpdated: number;
  dateUpdated: string;
  locationId: string;
  bomIds: string[];
  issTo: string;
  issueTo: string;
  customerName: string;
  salesRepresentative: string;
  demoFrom: string;
  demoReport: string;
  docId: string;
  issueDate: string;
  refNo: string;
  refDate: string;
  bookingAddress: string;
  bookingQty: number;
  comments: string;
  narration: string;
  partyBranch: string;
  status: string;
  goodsConsignFrom: string;
  goodsConsignTo: string;
  deliveredBy: string;
  appValue: number;
  receivedOn: string;
  demoRemarks: string;
  generateInvoice: string;
  billNo: string;
  billDate: string;
  doctorName: string;
  billingDescription: string;
  billingAmount: number;
  gross: number;
  totalQty: number;
  amountInWords: string;
  ewayBillNo?: string;
  ewayBillDate?: string;
  transporter?: string;
  vehicleNo?: string;
  fromGstin?: string;
  toGstin?: string;
  distance?: number;
  transporterId?: string;
  ewayBillStatus?: string;
  supplyType?: string;
  subType?: string;
  docType?: string;
  bomName?: string;
  demoRequest?: string;
  optionalItems?: OptionalItem[];
  issueItems?: IssueItem[];
}

interface BomChildItem {
  childItemId: number;
  quantity: number;
  make: string;
  model: string;
  product: string;
  categoryName: string;
  valuationMethodName: string;
  inventoryMethodName: string;
  unitPrice: number;
  itemName: string;
  itemCode: string;
  catNo: string;
  uomName: string;
  hsn: string;
  tax: number;
}

interface BomDetail {
  id: number;
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: BomChildItem[];
}

interface IssueData {
  issue: Issue;
  bomDetails: BomDetail[];
}

interface IssueRequest {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
  locationId: string;
  bomIds: string[];
  issTo: string;
  issueTo: string;
  customerName: string;
  salesRepresentative: string;
  demoFrom: string;
  demoReport: string;
  docId: string;
  issueDate: string;
  refNo: string;
  refDate: string;
  bookingAddress: string;
  bookingQty: number;
  comments: string;
  narration: string;
  partyBranch: string;
  status: string;
  goodsConsignFrom: string;
  goodsConsignTo: string;
  deliveredBy: string;
  appValue: number;
  receivedOn: string;
  demoRemarks: string;
  generateInvoice: string;
  billNo: string;
  billDate: string;
  doctorName: string;
  billingDescription: string;
  billingAmount: number;
  gross: number;
  totalQty: number;
  amountInWords: string;
  ewayBillNo?: string;
  ewayBillDate?: string;
  transporter?: string;
  vehicleNo?: string;
  fromGstin?: string;
  toGstin?: string;
  distance?: number;
  transporterId?: string;
  ewayBillStatus?: string;
  supplyType?: string;
  subType?: string;
  docType?: string;
  bomName?: string;
  demoRequest?: string;
  optionalItems?: OptionalItem[];
  issueItems?: IssueItem[];
}

interface IssueProbs {
  isEdit: boolean;
  data?: IssueData;
  initialBomDetails?: BomDetail[];
  onSave?: () => void;
  onClose?: () => void;
}

const IssueProduct: React.FC<IssueProbs> = ({
  isEdit = false,
  data,
  initialBomDetails,
  onSave,
  onClose,
}) => {
  const [headerFields, setHeaderFields] = useState<HeaderFields>(() => {
    const obj: HeaderFields = {};
    issueFormConfig.headerFields.forEach((f) => {
      obj[f.name] = "";
    });
    return obj;
  });

  const validInitialBomDetails = React.useMemo(() => {
    return (initialBomDetails || []).filter(
      (bom: any): bom is BomDetail =>
        bom !== undefined &&
        typeof bom.bomId === "string" &&
        Array.isArray(bom.childItems)
    );
  }, [initialBomDetails]);

  const [selectedBomData, setSelectedBomData] = useState<string[]>(() =>
    validInitialBomDetails.map((bom: BomDetail) => bom.bomId)
  );

  const [bomItems, setBomItems] = useState<BomChildItem[]>(() =>
    validInitialBomDetails.flatMap((bom: BomDetail) => bom.childItems || [])
  );

  const [activeTab, setActiveTab] = useState("issuesDetail");
  const [optionalItems, setOptionalItems] = useState<OptionalItem[]>([]);
  const [issueItems, setIssueItems] = useState<IssueItem[]>([]);

  const handleBomSelect = (selectedBomIds: string[]) => {
    setSelectedBomData(selectedBomIds);
  };

  const [apiOptions, setApiOptions] = useState<
    Record<string, { label: string; value: string }[]>
  >({});
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchedFields, setFetchedFields] = useState<Set<string>>(new Set());
  const [rawLeads, setRawLeads] = useState<any[]>([]);
  const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
    {}
  );
  const { user, role } = useUser();
  const [isLoadingData, setIsLoadingData] = useState(isEdit);

  useEffect(() => {
    // Fetch salesmen using the same pattern as Delivery Challan (getUserRoles + filter by role)
    const fetchSalesmen = async () => {
      try {
        const res = await getUserRoles();
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const salesReps = data
          .filter((u: any) => u.roleName === "Sales Representative")
          .map((u: any) => ({
            label: u.username || "",
            value: u.username || "",
          }));
        setApiOptions((prev) => ({ ...prev, salesRepresentative: salesReps }));
        setFetchedFields((prev) => new Set(prev).add("salesRepresentative"));
      } catch (err) {
        console.error("Error fetching salesmen:", err);
        setApiOptions((prev) => ({ ...prev, salesRepresentative: [] }));
      }
    };

    // Fetch Party Name (same as Delivery Challan: SalesLead/dropdown POST)
    const fetchLeads = async () => {
      try {
        const response = await salesLeadService.getDropdown({ pageNumber: 1, pageSize: 500 });
        const leads = response.results || [];
        setRawLeads(leads);
        const leadOptions = leads.map((lead: any) => ({
          label: `${lead.customerName} (${lead.leadId})`,
          value: lead.id.toString(),
        }));
        setApiOptions((prev) => ({
          ...prev,
          customerName: leadOptions,
          partyBranch: leadOptions,
        }));
        setFetchedFields((prev) => {
          const next = new Set(prev);
          next.add("customerName");
          next.add("partyBranch");
          return next;
        });
      } catch (err) {
        console.error("Error fetching leads (party name):", err);
      }
    };

    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await api.get("ItemDropdown/item-list");
        const data = await response.data;
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchBoms = async () => {
      try {
        const res = await api.post("BomDropdown/bom-list", { page: 1, pageSize: 500 });
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const boms = data.map((b: any) => ({
          label: `${b.bomName} (${b.bomId})`,
          value: (b.bomName || b.bomId || "").toString().trim(),
        }));
        setApiOptions((prev) => ({ ...prev, bomName: boms }));
        setFetchedFields((prev) => new Set(prev).add("bomName"));
      } catch (err) {
        console.error("Error fetching BOMs:", err);
      }
    };

    fetchSalesmen();
    fetchLeads();
    fetchItems();
    fetchBoms();
  }, []);

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    if (data) {
      // Robust mapping: check if fields are in data.issue or at top-level
      const issue = data.issue || data;
      const mappedFields: HeaderFields = {
        dateCreated: formatDisplayDate(issue?.dateCreated),
        dateUpdated: formatDisplayDate(issue?.dateUpdated),
        locationId: issue?.locationId || "",
        issTo: issue?.issTo || "",
        issueTo: issue?.issueTo || "",
        customerName: issue?.customerName || "",
        salesRepresentative: issue?.salesRepresentative || "",
        demoFrom: issue?.demoFrom || "",
        demoReport: issue?.demoReport || "",
        docId: issue?.docId || "",
        issueDate: formatDateForInput(issue?.issueDate),
        refNo: issue?.refNo || "",
        refDate: formatDateForInput(issue?.refDate),
        bookingAddress: issue?.bookingAddress || "",
        bookingQty: issue?.bookingQty?.toString() || "0",
        comments: issue?.comments || "",
        narration: issue?.narration || "",
        partyBranch: issue?.partyBranch || "",
        status: issue?.status || "",
        goodsConsignFrom: issue?.goodsConsignFrom || "",
        goodsConsignTo: issue?.goodsConsignTo || "",
        deliveredBy: issue?.deliveredBy || "",
        appValue: issue?.appValue?.toString() || "0",
        receivedOn: formatDateForInput(issue?.receivedOn),
        demoRemarks: issue?.demoRemarks || "",
        generateInvoice: issue?.generateInvoice || "NO",
        billNo: issue?.billNo || "",
        billDate: formatDateForInput(issue?.billDate),
        doctorName: issue?.doctorName || "",
        billingDescription: issue?.billingDescription || "",
        billingAmount: issue?.billingAmount?.toString() || "0",
        gross: issue?.gross?.toString() || "0",
        totalQty: issue?.totalQty?.toString() || "0",
        amountInWords: issue?.amountInWords || "",
        ewayBillNo: issue?.ewayBillNo || "",
        ewayBillDate: formatDateForInput(issue?.ewayBillDate),
        transporter: issue?.transporter || "",
        vehicleNo: issue?.vehicleNo || "",
        bomName: (issue?.bomName || "").toString().trim(),
        demoRequest: (issue?.demoRequest || "").toString().trim(),
        fromGstin: issue?.fromGstin || "",
        toGstin: issue?.toGstin || "",
        distance: issue?.distance?.toString() || "0",
        transporterId: issue?.transporterId || "",
        supplyType: issue?.supplyType || "O",
        subType: issue?.subType || "1",
        docType: issue?.docType || "INV",
      };

      setHeaderFields(mappedFields);

      if (issue.optionalItems) {
        setOptionalItems(issue.optionalItems);
      }
      setIssueItems(
        issue?.issueItems?.map((ii: any) => ({
          ...ii,
          id: ii.id || 0,
          equIns: ii.equIns || "",
          batchNo: ii.batchNo || "",
          receiptNo: ii.receiptNo || "",
          unit: ii.unit || "",
          qtyAvl: ii.qtyAvl || 0,
          qty: ii.qty || 0,
          rate: ii.rate || 0,
          amount: ii.amount || 0,
          remarks: ii.remarks || "",
        })) || []
      );

      if (data.bomDetails && Array.isArray(data.bomDetails)) {
        const validBomDetails = data.bomDetails.filter(
          (bom: BomDetail | undefined) =>
            bom &&
            typeof bom.bomId === "string" &&
            Array.isArray(bom.childItems)
        );

        const bomIds = validBomDetails.map((bom: BomDetail) => bom.bomId);
        setSelectedBomData(bomIds);

        const childItems = validBomDetails.flatMap(
          (bom: BomDetail) => bom.childItems || []
        );
        setBomItems(childItems);
      }
    }
  }, [isEdit, data]);

  const fetchOptions = async (field: { name: string; URL?: string }) => {
    if (!field.URL || fetchedFields.has(field.name)) return;

    try {
      setLoadingFields((prev) => ({ ...prev, [field.name]: true }));
      const res = await api.get(`${field.URL}`);
      const mappedOptions = res.data.map((item: any) => {
        if (field.name === "customerName") {
          return {
            label: item.vendorName || item.name || "", // vendorname from API
            value: item.vendorName || item.id || "",
          };
        }
        if (field.name === "salesRepresentative") {
          return {
            label: item.username || item.name || "",
            value: item.username || item.id || "",
          };
        }
        return {
          label: item.name || "", // default case
          value: item.id || "",
        };
      });
      setApiOptions((prev) => ({
        ...prev,
        [field.name]: mappedOptions,
      }));
      setFetchedFields((prev) => new Set(prev).add(field.name));
    } catch (err) {
      console.error(`Error fetching ${field.URL}:`, err);
    } finally {
      setLoadingFields((prev) => ({ ...prev, [field.name]: false }));
    }
  };

  const prepareRequestData = (): IssueRequest => {
    // Helper function to safely get string value
    const getStringValue = (value: string | string[] | undefined): string => {
      if (Array.isArray(value)) return "";
      return value || "";
    };

    // Helper function to safely format date
    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) {
        return new Date().toISOString();
      }

      try {
        let date: Date;

        if (dateStr.includes("T")) {
          // If it's already an ISO string, parse it
          date = new Date(dateStr);
        } else if (dateStr.includes("/")) {
          // Handle DD/MM/YYYY format
          const [day, month, year] = dateStr.split("/").map(Number);
          date = new Date(year, month - 1, day);
        } else {
          // Handle YYYY-MM-DD format
          const [year, month, day] = dateStr.split("-").map(Number);
          date = new Date(year, month - 1, day);
        }

        if (isNaN(date.getTime())) {
          throw new Error("Invalid date");
        }

        // Convert to UTC by constructing a new UTC date
        return new Date(
          Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            12, // Set to noon UTC to avoid timezone issues
            0,
            0,
            0
          )
        ).toISOString();
      } catch (error) {
        console.error("Date parsing error:", error);
        return new Date().toISOString();
      }
    };

    // Map header fields to the API request structure
    return {
      id: isEdit && data ? data.issue.id : 0,
      userCreated: isEdit && data ? data.issue.userCreated : user?.userId ?? 0,
      dateCreated: formatDate(getStringValue(headerFields.dateCreated)),
      userUpdated: user?.userId ?? 0,
      dateUpdated: formatDate(getStringValue(headerFields.dateUpdated)),
      locationId: getStringValue(headerFields.locationId),
      bomIds: selectedBomData || [],
      issTo: getStringValue(headerFields.issTo),
      issueTo: getStringValue(headerFields.issueTo),
      customerName: getStringValue(headerFields.customerName),
      salesRepresentative: getStringValue(headerFields.salesRepresentative),
      demoFrom: getStringValue(headerFields.demoFrom),
      demoReport: getStringValue(headerFields.demoReport),
      docId: getStringValue(headerFields.docId),
      issueDate: formatDate(getStringValue(headerFields.issueDate)),
      refNo: getStringValue(headerFields.refNo),
      refDate: formatDate(getStringValue(headerFields.refDate)),
      bookingAddress: getStringValue(headerFields.bookingAddress),
      bookingQty: parseInt(getStringValue(headerFields.bookingQty)) || 0,
      comments: getStringValue(headerFields.comments),
      narration: getStringValue(headerFields.narration),
      partyBranch: getStringValue(headerFields.partyBranch),
      status: getStringValue(headerFields.status),
      goodsConsignFrom: getStringValue(headerFields.goodsConsignFrom),
      goodsConsignTo: getStringValue(headerFields.goodsConsignTo),
      deliveredBy: getStringValue(headerFields.deliveredBy),
      appValue: parseFloat(getStringValue(headerFields.appValue)) || 0,
      receivedOn: formatDate(getStringValue(headerFields.receivedOn)),
      demoRemarks: getStringValue(headerFields.demoRemarks),
      generateInvoice: getStringValue(headerFields.generateInvoice),
      billNo: getStringValue(headerFields.billNo),
      billDate: formatDate(getStringValue(headerFields.billDate)),
      doctorName: getStringValue(headerFields.doctorName),
      billingDescription: getStringValue(headerFields.billingDescription),
      billingAmount: parseFloat(getStringValue(headerFields.billingAmount)) || 0,
      gross: parseFloat(getStringValue(headerFields.gross)) || 0,
      totalQty: parseFloat(getStringValue(headerFields.totalQty)) || 0,
      amountInWords: getStringValue(headerFields.amountInWords),
      ewayBillNo: getStringValue(headerFields.ewayBillNo),
      ewayBillDate: formatDate(getStringValue(headerFields.ewayBillDate)),
      transporter: getStringValue(headerFields.transporter),
      vehicleNo: getStringValue(headerFields.vehicleNo),
      fromGstin: getStringValue(headerFields.fromGstin),
      toGstin: getStringValue(headerFields.toGstin),
      distance: parseInt(getStringValue(headerFields.distance)) || 0,
      transporterId: getStringValue(headerFields.transporterId),
      supplyType: getStringValue(headerFields.supplyType),
      subType: getStringValue(headerFields.subType),
      docType: getStringValue(headerFields.docType),
      bomName: getStringValue(headerFields.bomName),
      demoRequest: getStringValue(headerFields.demoRequest),
      optionalItems: optionalItems,
      issueItems: issueItems,
    };
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [generatingEwayBill, setGeneratingEwayBill] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();



    // Validate that data is available in edit mode
    if (isEdit && !data) {
      setSubmitError("Issue data is not available for editing");
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const requestData = prepareRequestData();

      if (isEdit) {
        await issueService.update(data?.issue.id!, requestData as any);
      } else {
        await issueService.create(requestData as any);
      }

      toast.success(`Issue ${isEdit ? "updated" : "saved"} successfully!`);

      if (!isEdit) {
        // Reset form for new entries
        setHeaderFields(() => {
          const obj: HeaderFields = {};
          issueFormConfig.headerFields.forEach((f) => {
            obj[f.name] = "";
          });
          return obj;
        });
        setBomItems([]);
        setSelectedBomData([]);
      }

      // Notify parent to refresh list and close modal
      if (onSave) onSave();
    } catch (error: any) {
      console.error("Error saving issue:", error);
      setSubmitError(error.message || "An unexpected error occurred");
      toast.error(
        `Failed to ${isEdit ? "update" : "save"} issue. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEwayBill = async () => {
    if (!data?.issue.id || data?.issue.id === 0) {
      toast.error("Please save the issue first before generating e-Way Bill");
      return;
    }

    setGeneratingEwayBill(true);
    try {
      const response = await ewayBillService.generate(Number(data?.issue.id));
      if (response.success) {
        toast.success(`e-Way Bill generated: ${response.ewayBillNo}`);
        setHeaderFields(prev => ({
          ...prev,
          ewayBillNo: response.ewayBillNo,
          ewayBillDate: formatDateForInput(response.ewayBillDate),
          ewayBillStatus: "GENERATED"
        }));
      } else {
        toast.error(`Failed to generate e-Way Bill: ${response.errorDetails || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Error generating e-Way Bill:", error);
      toast.error(error.response?.data?.errorDetails || "Error connecting to e-Way Bill service");
    } finally {
      setGeneratingEwayBill(false);
    }
  };

  // Suppliers and salesmen are now pre-fetched eagerly in the main useEffect above

  // Show loading state when in edit mode and data is being loaded

  // Show error if in edit mode but data is not available
  if (isEdit && !data) {
    return (
      <div className="w-full mx-auto p-8 flex justify-center items-center">
        <div className="text-red-600 text-lg font-medium">
          Error: Issue data not available
        </div>
      </div>
    );
  }

  // Handler for dropdown changes
  const handleOptionChange = async (fieldName: string, value: string) => {
    setHeaderFields((prev) => {
      // Ensure only the specific field is updated
      const updatedFields = { ...prev };
      updatedFields[fieldName] = value;
      return updatedFields;
    });

    // Auto-fill logic from opportunity when Party Name is selected
    if (fieldName === "customerName" && value) {
      const selectedLead = rawLeads.find(l => l.id.toString() === value);
      if (selectedLead && selectedLead.leadId) {
        await autoFillFromOpportunity(selectedLead.leadId);
      }
    }
  };

  const autoFillFromOpportunity = async (leadId: string) => {
    try {
      setLoading(true);
      // 1. Get the first opportunity for this lead
      const oppIdRes = await api.post("SalesOpportunity/lead/by-leadid", { leadId });
      const opportunity = oppIdRes.data?.opportunity || oppIdRes.data?.Opportunity;
      
      if (opportunity && opportunity.id) {
        const oppId = opportunity.id;
        
        // 2. Get full opportunity details with items
        const oppDetailRes = await api.get(`SalesOpportunity/with-items/by-id/${oppId}`);
        const oppData = oppDetailRes.data?.opportunity || oppDetailRes.data?.Opportunity;
        const itemsList = oppDetailRes.data?.items || oppDetailRes.data?.Items || [];
        
        if (oppData) {
          // Update header fields if they exist in opportunity
          setHeaderFields(prev => ({
            ...prev,
            salesRepresentative: (oppData.salesRepresentativeId || oppData.SalesRepresentativeId)?.toString() || prev.salesRepresentative,
          }));
        }
        
        if (itemsList.length > 0) {
          // 3. Flatten childItems from all BOMs into a single array for IssueDetailGrid
          const mappedItems: any[] = [];
          let sNo = 1;

          itemsList.forEach((group: any) => {
            const childItems = group.childItems || group.ChildItems || [];
            const groupQty = group.quantity || group.Quantity || 1;

            if (childItems.length > 0) {
              // It's a BOM-based item
              childItems.forEach((item: any) => {
                const unitPrice = item.unitPrice || item.UnitPrice || item.saleRate || item.SaleRate || 0;
                const itemQty = (item.quantity || item.Quantity || 0) * groupQty;
                
                mappedItems.push({
                  id: 0,
                  sNo: sNo++,
                  make: item.make || item.Make || "",
                  category: item.categoryName || item.CategoryName || "",
                  product: item.product || item.Product || "",
                  model: item.model || item.Model || "",
                  item: item.itemName || item.ItemName || "",
                  equIns: "",
                  batchNo: "",
                  receiptNo: "",
                  unit: item.uomName || item.UomName || "",
                  qtyAvl: 0,
                  qty: itemQty,
                  rate: unitPrice,
                  amount: itemQty * unitPrice,
                  remarks: "",
                  readonly: true
                });
              });
            } else if (group.itemId || group.ItemId || group.itemName || group.ItemName) {
              // It's a direct product
              const unitPrice = group.unitPrice || group.UnitPrice || group.saleRate || group.SaleRate || 0;
              const itemQty = groupQty;

              mappedItems.push({
                id: 0,
                sNo: sNo++,
                make: group.make || group.Make || "",
                category: group.categoryName || group.CategoryName || "",
                product: group.product || group.Product || "",
                model: group.model || group.Model || "",
                item: group.itemName || group.ItemName || "",
                equIns: "",
                batchNo: "",
                receiptNo: "",
                unit: group.uomName || group.UomName || "",
                qtyAvl: 0,
                qty: itemQty,
                rate: unitPrice,
                amount: itemQty * unitPrice,
                remarks: "",
                readonly: true
              });
            }
          });
          
          if (mappedItems.length > 0) {
            setIssueItems(mappedItems);
            toast.info(`Auto-filled ${mappedItems.length} items from opportunity ${opportunity.opportunityId || opportunity.OpportunityId}`);
          }
        }
      }
    } catch (error) {
      console.error("Error auto-filling from opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handler for input field changes
  const handleHeaderInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setHeaderFields((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Issue Management
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Fields */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  {issueFormConfig.headerFields
                    .filter((f) => ![ "generateInvoice", "billNo", "billDate", "doctorName", "billingDescription", "billingAmount", "gross", "totalQty", "amountInWords" ].includes(f.name))
                    .map((field) => (
                      <div key={field.name}>
                        {field.type === "text" || field.type === "date" || field.type === "number" ? (
                          <InputField
                            FieldName={field.label}
                            IdName={field.name}
                            Name={field.name}
                            Type={field.type}
                            value={
                              Array.isArray(headerFields[field.name])
                                ? ""
                                : (headerFields[field.name] as string) || ""
                            }
                            handleInputChange={(fieldName, value) =>
                              setHeaderFields((prev) => ({
                                ...prev,
                                [fieldName]: value,
                              }))
                            }
                          />
                        ) : (
                          <DropDown
                            FieldName={field.label}
                            IdName={field.name}
                            handleOptionChange={handleOptionChange}
                            values={
                              Array.isArray(headerFields[field.name])
                                ? ""
                                : headerFields[field.name]?.toString() || ""
                            }
                            Options={
                              field.options
                                ? field.options
                                : loadingFields[field.name]
                                ? [{ label: "Loading...", value: "" }]
                                : apiOptions[field.name] || []
                            }
                            onFocus={() => fetchOptions(field)}
                          />
                        )}
                      </div>
                    ))}
                </div>

                {/* Billing Section (Highlighted) */}
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 space-y-4">
                  <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wider border-b border-yellow-200 pb-2">
                    Billing Details
                  </h3>
                  {issueFormConfig.headerFields
                    .filter((f) => [ "generateInvoice", "billNo", "billDate", "doctorName", "billingDescription", "billingAmount" ].includes(f.name))
                    .map((field) => {
                      if (["billNo", "billDate", "doctorName", "billingDescription", "billingAmount"].includes(field.name) && headerFields.generateInvoice !== "YES") {
                        return null;
                      }
                      return (
                        <div key={field.name}>
                          {field.type === "text" || field.type === "date" || field.type === "number" ? (
                            <InputField
                              FieldName={field.label}
                              IdName={field.name}
                              Name={field.name}
                              Type={field.type}
                              value={
                                Array.isArray(headerFields[field.name])
                                  ? ""
                                  : (headerFields[field.name] as string) || ""
                              }
                              handleInputChange={(fieldName, value) =>
                                setHeaderFields((prev) => ({
                                  ...prev,
                                  [fieldName]: value,
                                }))
                              }
                            />
                          ) : (
                            <DropDown
                              FieldName={field.label}
                              IdName={field.name}
                              handleOptionChange={handleOptionChange}
                              values={
                                Array.isArray(headerFields[field.name])
                                  ? ""
                                  : headerFields[field.name]?.toString() || ""
                              }
                              Options={
                                field.options
                                  ? field.options
                                  : loadingFields[field.name]
                                  ? [{ label: "Loading...", value: "" }]
                                  : apiOptions[field.name] || []
                              }
                              onFocus={() => fetchOptions(field)}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex border-b">
              {[
                { id: "issuesDetail", label: "Issues Detail" },
                { id: "optionalItem", label: "Optional Item" },
                { id: "issuesFooter", label: "Issues Footer" },
                { id: "ewayBill", label: "Eway Bill Details" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 text-sm font-bold transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "issuesDetail" && (
                <IssueDetailGrid
                  items={issueItems}
                  onChange={(items) => setIssueItems(items)}
                />
              )}

              {activeTab === "optionalItem" && (
                <OptionalItemTable
                  items={optionalItems}
                  onChange={setOptionalItems}
                />
              )}

              {activeTab === "issuesFooter" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <InputField
                      FieldName="Gross"
                      IdName="gross"
                      Name="gross"
                      Type="number"
                      value={(headerFields.gross as string) || "0"}
                      handleInputChange={(name, value) => handleOptionChange(name, value)}
                    />
                    <InputField
                      FieldName="Amount in Words"
                      IdName="amountInWords"
                      Name="amountInWords"
                      Type="text"
                      value={(headerFields.amountInWords as string) || ""}
                      handleInputChange={(name, value) => handleOptionChange(name, value)}
                    />
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Remarks</label>
                       <textarea
                         className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                         rows={3}
                         value={(headerFields.comments as string) || ""}
                         onChange={(e) => handleOptionChange("comments", e.target.value)}
                       />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <InputField
                      FieldName="Total Qty"
                      IdName="totalQty"
                      Name="totalQty"
                      Type="number"
                      value={(headerFields.totalQty as string) || "0"}
                      handleInputChange={(name, value) => handleOptionChange(name, value)}
                    />
                    <div className="space-y-2">
                       <label className="block text-sm font-semibold text-gray-700">Narration</label>
                       <textarea
                         className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                         rows={4}
                         value={(headerFields.narration as string) || ""}
                         onChange={(e) => handleOptionChange("narration", e.target.value)}
                       />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ewayBill" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    FieldName="EWay Bill No"
                    IdName="ewayBillNo"
                    Name="ewayBillNo"
                    Type="text"
                    value={(headerFields.ewayBillNo as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="EWay Bill Date"
                    IdName="ewayBillDate"
                    Name="ewayBillDate"
                    Type="date"
                    value={(headerFields.ewayBillDate as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="Transporter"
                    IdName="transporter"
                    Name="transporter"
                    Type="text"
                    value={(headerFields.transporter as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="Vehicle No"
                    IdName="vehicleNo"
                    Name="vehicleNo"
                    Type="text"
                    value={(headerFields.vehicleNo as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="From GSTIN"
                    IdName="fromGstin"
                    Name="fromGstin"
                    Type="text"
                    value={(headerFields.fromGstin as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="To GSTIN"
                    IdName="toGstin"
                    Name="toGstin"
                    Type="text"
                    value={(headerFields.toGstin as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="Distance (KM)"
                    IdName="distance"
                    Name="distance"
                    Type="number"
                    value={(headerFields.distance as string) || "0"}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                  <InputField
                    FieldName="Transporter ID"
                    IdName="transporterId"
                    Name="transporterId"
                    Type="text"
                    value={(headerFields.transporterId as string) || ""}
                    handleInputChange={(name, value) => handleOptionChange(name, value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pb-12">
            <button
              type="button"
              className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all"
              onClick={() => { if (onClose) onClose(); else window.history.back(); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`bg-blue-600 text-white px-12 py-3 rounded-xl shadow-lg font-bold text-lg transition-all duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700 hover:-translate-y-0.5"
              }`}
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Issue"
                : "Save Issue"}
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={handleGenerateEwayBill}
                disabled={generatingEwayBill || !headerFields.billNo}
                className={`bg-green-600 text-white px-8 py-3 rounded-xl shadow-lg font-bold transition-all duration-200 ${
                  generatingEwayBill || !headerFields.billNo ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700 hover:-translate-y-0.5"
                }`}
              >
                {generatingEwayBill ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate e-Way Bill"
                )}
              </button>
            )}
          </div>
        </form>

        {/* Success Modal */}
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Success"
        >
          <div className="p-6 text-center">
            <div className="mb-4 text-green-500 flex justify-center">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Issue {isEdit ? "Updated" : "Saved"} Successfully!
            </h3>
            <p className="mb-6 text-gray-600">
              The issue has been {isEdit ? "updated" : "saved"} in the system.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-blue-600 text-white px-8 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </Modal>

        {/* Error Display */}
        {submitError && (
          <div className="fixed bottom-6 right-6 bg-white border-l-4 border-red-500 p-4 max-w-md rounded-xl shadow-2xl z-50 animate-bounce-short">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider">Error</h3>
                <p className="mt-1 text-sm text-red-700">{submitError}</p>
              </div>
              <button onClick={() => setSubmitError(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    // If ISO string, parse and format as DD/MM/YYYY
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    // If not ISO, try to parse as DD/MM/YYYY or YYYY-MM-DD
    if (dateStr.includes("/")) return dateStr;
    if (dateStr.includes("-")) {
      const [year, month, day] = dateStr.split("-");
      if (year && month && day) {
        return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
      }
    }
    return dateStr;
  } catch {
    return "";
  }
}

function formatDateForInput(dateStr?: string | Date): string {
  if (!dateStr) return "";
  try {
    const date = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Return YYYY-MM-DD required by browsers for <input type="date">
      return date.toISOString().split("T")[0];
    }
    return "";
  } catch {
    return "";
  }
}

export default IssueProduct;
