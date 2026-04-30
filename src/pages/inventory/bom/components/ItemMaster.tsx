import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import api from "../../../../services/api";
import { toast } from "react-toastify";
import DynamicFormWithTabs from "../../../../components/common/SampleApp";
import { useUser } from "../../../../context/UserContext";

// Updated Types
interface Item {
  itemId: number;
  quantity: number | null;
  categoryName: string;
  groupName: string;
  valuationMethodName: string;
  inventoryMethodName: string | null;
  inventoryTypeName: string | null;
  unitPrice: number;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  catNo: string | null;
  uomName: string | null;
  purchaseRate: number | null;
  saleRate: number | null;
  quoteRate: number | null;
  hsn: string | null;
  taxPercentage: number | null;
}

interface Vendor {
  id: number;
  vendorCode: string | null;
  vendorName: string;
  phone: string[];
  email: string[];
  doorNo: string | null;
  street: string | null;
  area: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string | null;
  address: string;
  gstNumber: string;
  panNumber: string | null;
  isRegistered: boolean;
  bankName: string | null;
  accountHolderName: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface FormDataFromChild {
  formData: Record<string, any>;
  productImage?: File | null;
  tabsData: Record<string, any[]>;
}

// Enhanced Field Types
interface BaseField {
  id: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  minWidth?: number | string;
  disabled?: boolean;
}

interface SelectField extends BaseField {
  type: "select";
  url?: string;
  options?: DropdownOption[];
  disabled?: boolean;
  searchable?: boolean;
}

interface TextField extends BaseField {
  type: "text";
}

interface TextAreaField extends BaseField {
  type: "textarea";
}

interface NumberField extends BaseField {
  type: "number";
}

interface CheckboxField extends BaseField {
  type: "checkbox";
}

type FormField =
  | SelectField
  | TextField
  | TextAreaField
  | NumberField
  | CheckboxField;

interface TableColumn {
  Header: string;
  accessor: string;
  type: "dropdown" | "text" | "number" | "display" | "date";
  url?: string;
  options?: DropdownOption[];
  placeholder?: string;
  minWidth?: number | string;
}

interface TableConfig {
  columns: TableColumn[];
  data: any[];
}

interface FormTab {
  id: string;
  label: string;
  type: "form";
  fields: FormField[];
}

interface TableTab {
  id: string;
  label: string;
  type: "table";
  tableConfig: TableConfig;
}

type TabConfig = FormTab | TableTab;

interface FormConfig {
  fields: FormField[];
}

interface ProductMasterConfig {
  formConfig: FormConfig;
  tabsConfig: TabConfig[];
}

// Enhanced configuration with proper typing
const productMasterConfig: ProductMasterConfig = {
  formConfig: {
    fields: [
      {
        id: "itemCode",
        type: "text",
        label: "Item Code",
        placeholder: "Enter Item Code",
        required: false,
        disabled: true,
      },

      {
        id: "itemGroup",
        type: "select",
        label: "Item Group",
        required: true,
        url: "InventoryGroup",
        searchable: true,
      },
      {
        id: "inventoryMethod",
        type: "select",
        label: "Inventory Method",
        required: true,
        url: "InventoryMethod",
        searchable: true,
      },
      {
        id: "make",
        type: "select",
        label: "Make",
        required: true,
        url: "Make",
        searchable: true,
      },
      {
        id: "brand",
        type: "text",
        label: "Brand",
        required: false,
      },
      {
        id: "category",
        type: "select",
        label: "Category",
        required: true,
        url: "Category",
        searchable: true,
      },

      {
        id: "model",
        type: "select",
        label: "Model",
        required: true,
        url: "Model",
        searchable: true,
      },
      {
        id: "product",
        type: "select",
        label: "Product",
        required: true,
        url: "Product",
        searchable: true,
      },
      {
        id: "catNo",
        type: "text",
        label: "Cat No",
        placeholder: "Enter Cat No",
      },
      {
        id: "uom",
        type: "select",
        label: "UOM",
        placeholder: "Enter UOM",
        required: true,
        url: "Uom",
        searchable: true,
      },

      {
        id: "Critical",
        type: "select",
        label: "Critical",
        placeholder: "select Critical",
        searchable: true,
        options: [
          { value: "A", label: "A" },
          { value: "B", label: "B" },
          { value: "C", label: "C" },
        ],
      },
      {
        id: "StockToBank",
        type: "select",
        label: "Stock To Bank",
        placeholder: "select Stock To Bank",
        searchable: true,
        options: [
          { value: "Yes", label: "Yes" },
          { value: "No", label: "No" },
        ],
      },

      {
        id: "itemName",
        type: "text",
        label: "Item Name",
        placeholder: "select Item Name",
        required: true,
      },
      {
        id: "item",
        type: "text",
        label: "Item Description",
      },
      {
        id: "valuationMethod",
        type: "select",
        label: "Valuation Method",
        placeholder: "select Valuation Method",
        url: "ValuationMethod",
        searchable: true,
      },
      {
        id: "lpRate",
        type: "number",
        label: "LP Rate",
        placeholder: "Enter LP Rate",
      },
      {
        id: "relatedStockAccount",
        type: "select",
        label: "Related Stock Account",
        placeholder: "Select Stock Account",
        searchable: true,
        options: [
          { label: "Stock In Trade", value: "Stock In Trade" },
          { label: "Stock ", value: "Stock " },
        ],
      },

      {
        id: "hsnNo",
        type: "text",
        label: "HSN no",
        placeholder: "Enter Text",
      },

      {
        id: "taxPercentage",
        type: "number",
        label: "TaxPercentage",
      },

      {
        id: "description",
        type: "textarea",
        label: "Description",
        placeholder: "Enter product description",
      },
      {
        id: "isActive",
        type: "checkbox",
        label: "Active Product",
      },
      {
        id: "bomApplicable",
        type: "checkbox",
        label: "BOM Applicable",
      },
    ],
  },
  tabsConfig: [
    {
      id: "uom",
      label: "UOM and Packaging Details",
      type: "form",
      fields: [
        {
          id: "PrimaryUOM",
          type: "select",
          label: "Primary UOM",
          url: "Uom",
          searchable: true,
        },

        {
          id: "buyingUOM",
          type: "select",
          label: "Buying UOM",
          url: "Uom",
          searchable: true,
        },

        {
          id: "conversiontoPrimaryUOM",
          type: "number",
          label: "Conversion to Primary UOM",
          placeholder: "0",
        },
        {
          id: "consumptionUOM",
          type: "select",
          label: "Consumption UOM",
          url: "Uom",
          searchable: true,
        },

        {
          id: "conversiontoPrimaryUOM2",
          type: "number",
          label: "Conversion to Primary UOM 2",
          placeholder: "0",
        },
      ],
    },
    {
      id: "supplier",
      label: "Supplier/Manufacturers",
      type: "table",
      tableConfig: {
        columns: [
          {
            Header: "Supplier/Manufacturer",
            accessor: "supplier",
            type: "dropdown",
            url: "Suppliers",
          },
          {
            Header: "Code/Part No",
            accessor: "code",
            type: "dropdown",
            options: [
              { value: "CODE001", label: "CODE001" },
              { value: "CODE002", label: "CODE002" },
              { value: "CODE003", label: "CODE003" },
            ],
          },
          {
            Header: "Description",
            accessor: "description",
            type: "text",
          },
          {
            Header: "Remarks",
            accessor: "remarks",
            type: "text",
            minWidth: 200,
          },
          {
            Header: "Rate",
            accessor: "rate",
            type: "number",
          },
        ],
        data: [
          {
            supplier: "",
            code: "",
            description: "",
            remarks: "",
            rate: 0,
          },
        ],
      },
    },
    {
      id: "planning",
      label: "Planning",
      type: "form",
      fields: [
        {
          id: "safetyStock",
          type: "number",
          label: "Safety Stock(Primary UOM)",
          placeholder: "0",
        },
        {
          id: "minOrderQty",
          type: "number",
          label: "Min Order Qty",
          placeholder: "0",
        },
        {
          id: "maxOrderQty",
          type: "number",
          label: "Max Order Qty",
          placeholder: "0",
        },
        {
          id: "standardCostPrice",
          type: "number",
          label: "Standard Cost Price",
          placeholder: "0",
        },
        {
          id: "orderDays",
          type: "text",
          label: "Order Days",
          placeholder: "enter order Days",
        },
        {
          id: "avgLeadTime",
          type: "number",
          label: "Average Lead Time",
          placeholder: "enter average lead time",
        },
        {
          id: "reOrderQty",
          type: "number",
          label: "Re-Order Qty",
          placeholder: "enter Re Order Qty",
        },
        {
          id: "minimumStock",
          type: "number",
          label: "Minimum Stock",
          placeholder: "enter minimum stock",
        },
      ],
    },
    {
      id: "itemFooter",
      label: "Item Footer",
      type: "form",
      fields: [
        {
          id: "longItemName",
          type: "textarea",
          label: "Long Item Name",
          placeholder: "Enter long item name",
          minWidth: 300,
        },
      ],
    },
    {
      id: "accounting",
      label: "Accounting Information",
      type: "form",
      fields: [
        {
          id: "assetAccount",
          type: "text",
          label: "Asset Account",
          disabled: true,
        },

        {
          id: "depriciationAccount",
          type: "text",
          label: "Depriciation Account",
          disabled: true,
        },

        {
          id: "purchaseAccount",
          type: "text",
          label: "Purchase Account",
          disabled: true,
        },
        {
          id: "salesAccount",
          type: "text",
          label: "Sales Account",
          disabled: true,
        },
      ],
    },
    {
      id: "locationStock",
      label: "Location Stock",
      type: "table",
      tableConfig: {
        columns: [
          {
            Header: "Location",
            accessor: "location",
            type: "dropdown",
            url: "InventoryGroup",
          },
          {
            Header: "Doc Date",
            accessor: "docDate",
            type: "date",
          },
          {
            Header: "Rack",
            accessor: "rack",
            type: "dropdown",
            options: [
              { label: "R1", value: "R1" },
              { label: "R2", value: "R2" },
              { label: "R3", value: "R3" },
              { label: "R4", value: "R4" },
              { label: "R5", value: "R5" },
              { label: "R6", value: "R6" },
              { label: "R7", value: "R7" },
              { label: "R8", value: "R8" },
              { label: "R9", value: "R9" },
              { label: "R10", value: "R10" },
              { label: "floor1", value: "Floor" },
            ],
          },
          {
            Header: "Self",
            accessor: "self",
            type: "dropdown",
            placeholder: "Enter Self",
            options: [
              { label: "S1", value: "S1" },
              { label: "S2", value: "S2" },
              { label: "S3", value: "S3" },
              { label: "S4", value: "S4" },
              { label: "S5", value: "S5" },
              { label: "S6", value: "S6" },
            ],
          },
          {
            Header: "Column",
            accessor: "column",
            type: "dropdown",
            placeholder: "Enter Column",
            options: [
              { label: "A1", value: "A1" },
              { label: "A2", value: "A2" },
              { label: "A3", value: "A3" },
              { label: "A4", value: "A4" },
              { label: "A5", value: "A5" },
              { label: "A6", value: "A6" },
              { label: "A7", value: "A7" },
              { label: "A8", value: "A8" },
              { label: "A9", value: "A9" },
              { label: "B1", value: "B1" },
              { label: "B2", value: "B2" },
              { label: "B3", value: "B3" },
              { label: "B4", value: "B4" },
              { label: "B5", value: "B5" },
              { label: "C1", value: "C1" },
              { label: "C2", value: "C2" },
              { label: "C3", value: "C3" },
              { label: "C4", value: "C4" },
              { label: "C5", value: "C5" },
              { label: "D1", value: "D1" },
              { label: "D2", value: "D2" },
              { label: "D3", value: "D3" },
              { label: "D4", value: "D4" },
              { label: "D5", value: "D5" },
            ],
          },
          {
            Header: "Item In Place",
            accessor: "itemInPlace",
            type: "text",
          },
          {
            Header: "locidc",
            accessor: "locidc",
            type: "text",
          },
          {
            Header: "OP.Stk",
            accessor: "opStk",
            type: "text",
          },
          {
            Header: "OP.Stk Value",
            accessor: "opStkValue",
            type: "text",
          },
          {
            Header: "OP.Cost Rate",
            accessor: "opCostRate",
            type: "text",
          },
          {
            Header: "ReOrder Level",
            accessor: "reOrderLevel",
            type: "text",
          },
          {
            Header: "Min.Level",
            accessor: "minLevel",
            type: "text",
          },
          {
            Header: "Max.Level",
            accessor: "maxLevel",
            type: "text",
          },
          {
            Header: "Selling Rate",
            accessor: "sellingRate",
            type: "text",
          },
          {
            Header: "Rec.Qty(p)",
            accessor: "recQty",
            type: "text",
          },
          {
            Header: "Iss.Qty(p)",
            accessor: "issQty",
            type: "text",
          },
          {
            Header: "PuUnit",
            accessor: "puUnit",
            type: "text",
          },
          {
            Header: "Euro Rate Purchase",
            accessor: "euroRatePurchase",
            type: "text",
          },
          {
            Header: "Inc Tax",
            accessor: "incTax",
            type: "text",
          },
        ],
        data: [],
      },
    },
    {
      id: "itemSpec",
      label: "Item Spec",
      type: "table",
      tableConfig: {
        columns: [
          {
            Header: "Specification",
            accessor: "spec",
            type: "text",
            minWidth: 200,
          },
        ],
        data: [{ spec: "" }],
      },
    },
    {
      id: "qc",
      label: "QC",
      type: "form",
      fields: [
        {
          id: "qcTemplateId",
          type: "select",
          label: "QC Template",
          url: "QcTemplates",
        },

        {
          id: "qcFlag",
          type: "select",
          label: "QC Flag",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
        {
          id: "opstQty",
          type: "number",
          label: "Opst Qty",
          placeholder: "0",
        },
        {
          id: "notes",
          type: "textarea",
          label: "Variant Notes",
          placeholder: "Additional notes for this variant...",
          minWidth: 300,
        },
      ],
    },
  ],
};

interface ItemMasterProps {
  editItemId?: number | string | null;
  onSaved?: (id?: number | string) => void;
  readOnly?: boolean;
}

function ItemMaster({ editItemId, onSaved, readOnly = false }: ItemMasterProps) {
  console.log(editItemId, "edit");
  const [searchParams] = useSearchParams();
  
  // Get editItemId from props or URL query parameters
  const finalEditItemId = editItemId || searchParams.get("id");
  
  const [fieldsWithOptions, setFieldsWithOptions] = useState<{
    [key: string]: DropdownOption[];
  }>({});
  const { user, role } = useUser();
  const [itemList, setItemList] = useState<Item[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedValues, setSelectedValues] = useState<{
    [key: string]: string;
  }>({ relatedStockAccount: "Stock In Trade" });
  const [filteredOptions, setFilteredOptions] = useState<{
    [key: string]: DropdownOption[];
  }>({});
  const [receivedFormData, setReceivedFormData] =
    useState<FormDataFromChild | null>(null);
  const [currentFormData, setCurrentFormData] = useState<Record<string, any>>(
    {}
  );
  const [autoFillData, setAutoFillData] = useState<Record<string, any>>({});
  const [tabsWithOptions, setTabsWithOptions] = useState<{
    [key: string]: { [key: string]: DropdownOption[] };
  }>({});
  const [initialTabsData, setInitialTabsData] = useState<Record<string, any[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission from child component and POST to ItemAggregate
  const handleFormSubmit = async (formDataFromChild: FormDataFromChild) => {
    console.log("Form data received from child:", formDataFromChild);
    setReceivedFormData(formDataFromChild);

    // Merge selectedValues (pre-loaded edit data) with submitted form data
    // so fields not touched by the user are still included
    const form = { ...selectedValues, ...(formDataFromChild.formData || {}) };
    const tabs = formDataFromChild.tabsData || {};
    const tabsAny: any = tabs as any;

    // Resolve selected category, group and inventory method ids/labels
    const selectedCategoryValue = form.category ?? "";
    const selectedCategoryId = Number(selectedCategoryValue) || 0;
    const selectedCategoryLabel =
      (fieldsWithOptions["category"] || []).find(
        (opt) => opt.value === String(selectedCategoryValue)
      )?.label ||
      form.categoryName ||
      "";

    const selectedGroupValue = form.itemGroup ?? "";
    const selectedGroupId = Number(selectedGroupValue) || 0;
    const selectedGroupLabel =
      (fieldsWithOptions["itemGroup"] || []).find(
        (opt) => opt.value === String(selectedGroupValue)
      )?.label ||
      form.groupName ||
      "";

    const selectedInventoryMethodValue = form.inventoryMethod ?? "";
    const selectedInventoryMethodId = Number(selectedInventoryMethodValue) || 0;
    const selectedInventoryMethodLabel =
      (fieldsWithOptions["inventoryMethod"] || []).find(
        (opt) => opt.value === String(selectedInventoryMethodValue)
      )?.label ||
      form.inventoryMethodName ||
      "";

    // Convert image file to data URL
    const readFileAsDataUrl = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        try {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        } catch (e) {
          reject(e);
        }
      });

    let imageUrlFromFile: string | null = null;
    if (formDataFromChild.productImage) {
      try {
        imageUrlFromFile = await readFileAsDataUrl(
          formDataFromChild.productImage as File
        );
      } catch (err) {
        console.warn("Failed to read product image file:", err);
        imageUrlFromFile = null;
      }
    }

    // Build ItemMaster section
    const selectedUomValue = form.uom ?? "";
    const uomOptions = fieldsWithOptions["uom"] || [];
    let selectedUomId = Number(selectedUomValue) || 0;
    if (!selectedUomId && selectedUomValue) {
      const byValue = uomOptions.find(
        (opt) => opt.value === String(selectedUomValue)
      );
      if (byValue) {
        selectedUomId = Number(byValue.value) || 0;
      } else {
        const byLabel = uomOptions.find(
          (opt) =>
            String(opt.label).toLowerCase() ===
            String(selectedUomValue).toLowerCase()
        );
        if (byLabel) selectedUomId = Number(byLabel.value) || 0;
      }
    }
    const selectedUomLabel =
      uomOptions.find((opt) => opt.value === String(selectedUomValue))?.label ||
      uomOptions.find(
        (opt) =>
          String(opt.label).toLowerCase() ===
          String(selectedUomValue).toLowerCase()
      )?.label ||
      form.uomName ||
      "";

    // Resolve valuation method
    const selectedValuationValue = form.valuationMethod ?? "";
    const valuationOptions = fieldsWithOptions["valuationMethod"] || [];
    let selectedValuationId = Number(selectedValuationValue) || 0;
    if (!selectedValuationId && selectedValuationValue) {
      const byValue = valuationOptions.find(
        (opt) => opt.value === String(selectedValuationValue)
      );
      if (byValue) {
        selectedValuationId = Number(byValue.value) || 0;
      } else {
        const byLabel = valuationOptions.find(
          (opt) =>
            String(opt.label).toLowerCase() ===
            String(selectedValuationValue).toLowerCase()
        );
        if (byLabel) selectedValuationId = Number(byLabel.value) || 0;
      }
    }
    let selectedValuationLabel =
      valuationOptions.find(
        (opt) => opt.value === String(selectedValuationValue)
      )?.label ||
      valuationOptions.find(
        (opt) =>
          String(opt.label).toLowerCase() ===
          String(selectedValuationValue).toLowerCase()
      )?.label ||
      form.valuationMethodName ||
      "";

    // If valuation id still unresolved, try API
    if (
      (!selectedValuationId || selectedValuationId === 0) &&
      selectedValuationValue
    ) {
      try {
        const resp = await api.get("ValuationMethod");
        const items = await resp.data;
        if (Array.isArray(items) && items.length > 0) {
          const found = items.find((it: any) => {
            const idStr = String(it.id ?? it.value ?? "");
            const name = String(it.name ?? it.label ?? it.value ?? "");
            return (
              idStr === String(selectedValuationValue) ||
              name.toLowerCase() ===
                String(selectedValuationValue).toLowerCase()
            );
          });
          if (found) {
            selectedValuationId =
              Number(found.id ?? found.value) || selectedValuationId;
            selectedValuationLabel = String(
              found.name ?? found.label ?? selectedValuationLabel
            );
          }
        }
      } catch (err) {
        console.warn("Could not fetch ValuationMethod to resolve id:", err);
      }
    }

    if (!selectedValuationId || selectedValuationId === 0) {
      console.error(
        "ValuationMethodId could not be resolved for value:",
        selectedValuationValue
      );
      toast.warning(
        "Please select a valid Valuation Method from the dropdown before saving."
      );
      return;
    }

    const itemMasterPayload: any = {
      userCreated: user?.userId || 0,
      dateCreated: new Date().toISOString(),
      userUpdated: user?.userId || 0,
      dateUpdated: new Date().toISOString(),
      groupId: selectedGroupId,
      categoryId: selectedCategoryId,
      inventoryMethodId: selectedInventoryMethodId,
      uomId: selectedUomId,
      valuationMethodId: selectedValuationId,
      itemName: form.itemName || "",
      longItemName: form.longItemName || "",
      itemCode: form.itemCode || "",
      itemDescription: form.item || form.description || form.itemDescription || "",
      makeId: Number(form.makeId ?? form.make) || 0,
      modelId: Number(form.modelId ?? form.model) || 0,
      productId: Number(form.productId ?? form.product) || 0,
      brand: form.brand || "",
      inventoryType: form.inventoryType || "",
      specification: form.specification || "",
      criticality: form.Critical || "",
      stockToBank: form.StockToBank || "",
      lpRate: Number(form.lpRate) || 0,
      unitPrice: Number(form.unitPrice) || 0,
      taxPercentage: Number(form.taxPercentage) || 0,
      valuationMethod: selectedValuationLabel,
      relatedStockAccount: form.relatedStockAccount || "Stock In Trade",
      cf: Number(form.Cf ?? form.cf ?? form.CF) || 0,
      hsn: form.hsnNo || form.hsn || "",
      bomApplicable: Boolean(form.bomApplicable),
      isActive: Boolean(form.isActive),
      imageUrl: imageUrlFromFile || form.imageUrl || "",
      catNo: form.catNo || "",
    };

    // Build ItemPlanning section
    const planning = tabsAny.planning || {};
    const itemPlanningPayload: any = {
      id: 0,
      userCreated: user?.userId || 0,
      dateCreated: new Date().toISOString(),
      userUpdated: user?.userId || 0,
      dateUpdated: new Date().toISOString(),
      itemId: finalEditItemId ? Number(finalEditItemId) : 0,
      safetyStockPrimaryUom: Number(planning.safetyStock) || 0,
      minimumOrderQtyPrimary: Number(planning.minOrderQty) || 0,
      maximumOrderQtyPrimaryUom: Number(planning.maxOrderQty) || 0,
      standardCostPrice: Number(planning.standardCostPrice) || 0,
      orderDays: Number(planning.orderDays) || 0,
      averageLeadTime: Number(planning.avgLeadTime) || 0,
      reorderQtyPrimary: Number(planning.reOrderQty) || 0,
      minimumStockPrimary: Number(planning.minimumStock) || 0,
      purchaseReceivedQty: 0,
      purchaseIssuedQty: 0,
    };

    // Build ItemUomPackingDetails section
    const uomTab = tabsAny.uom || {};
    const itemUomPackingPayload: any = {
      id: 0,
      userCreated: user?.userId || 0,
      dateCreated: new Date().toISOString(),
      userUpdated: user?.userId || 0,
      dateUpdated: new Date().toISOString(),
      itemId: finalEditItemId ? Number(finalEditItemId) : 0,
      primaryUom: uomTab.PrimaryUOM || form.uom || "",
      buyingUom: uomTab.buyingUOM || "",
      consumptionUom: uomTab.consumptionUOM || "",
      conversionToPrimary: Number(uomTab.conversiontoPrimaryUOM) || 0,
      conversionToSecondary: Number(uomTab.conversiontoPrimaryUOM2) || 0,
    };

    // Build ItemAccountingInfo
    const itemAccountingPayload: any = {
      id: 0,
      userCreated: user?.userId || 0,
      dateCreated: new Date().toISOString(),
      userUpdated: user?.userId || 0,
      dateUpdated: new Date().toISOString(),
      itemId: finalEditItemId ? Number(finalEditItemId) : 0,
      assetAccount: "",
      depreciationAccount: "",
      purchaseAccount: "",
      salesAccount: "",
    };

    // Build LocationStocks
    const locationRows = tabsAny.locationStock || [];
    const locationStocksPayload = Array.isArray(locationRows)
      ? locationRows.map((row: any) => {
          let resolvedSupplierId = Number(row.supplierId) || 0;

          if (!resolvedSupplierId && row.supplier) {
            if (!isNaN(Number(row.supplier))) {
              resolvedSupplierId = Number(row.supplier);
            } else {
              const byName = vendors.find(
                (v) =>
                  v.vendorName &&
                  String(v.vendorName).toLowerCase().trim() ===
                    String(row.supplier).toLowerCase().trim()
              );
              if (byName) resolvedSupplierId = byName.id;
              else {
                const byCode = vendors.find(
                  (v) =>
                    v.vendorCode &&
                    String(v.vendorCode).toLowerCase().trim() ===
                      String(row.supplier).toLowerCase().trim()
                );
                if (byCode) resolvedSupplierId = byCode.id;
              }
            }
          }

          return {
            id: 0,
            userCreated: user?.userId || 0,
            dateCreated: new Date().toISOString(),
            userUpdated: user?.userId || 0,
            dateUpdated: new Date().toISOString(),
            itemId: finalEditItemId ? Number(finalEditItemId) : 0,
            rack: row.rack || "",
            shelf: row.self || row.shelf || "",
            columnNo: row.column || "",
            inPlace: row.itemInPlace || "",
            openingStock: Number(row.opStk) || 0,
            openingStockValue: Number(row.opStkValue) || 0,
            openingCostRate: Number(row.opCostRate) || 0,
            reorderLevel: Number(row.reOrderLevel) || 0,
            minLevel: Number(row.minLevel) || 0,
            maxLevel: Number(row.maxLevel) || 0,
            sellingRate: Number(row.sellingRate) || 0,
            receivedQtyPrimary: Number(row.recQty) || 0,
            issuedQtyPrimary: Number(row.issQty) || 0,
            purchaseUnit: row.puUnit || "",
            euroPurchaseRate: Number(row.euroRatePurchase) || 0,
            inclusiveTaxPrice: Number(row.incTax) || 0,
          };
        })
      : [];

    // Build ItemQualityControl
    const qc = tabsAny.qc || {};
    const itemQualityPayload: any = {
      id: 0,
      userCreated: user?.userId || 0,
      dateCreated: new Date().toISOString(),
      userUpdated: user?.userId || 0,
      dateUpdated: new Date().toISOString(),
      itemId: finalEditItemId ? Number(finalEditItemId) : 0,
      qcFlag: qc.qcFlag === "yes" || qc.qcFlag === true || qc.qcFlag === "true",
      qcTemplateId: Number(qc.qcTemplateId) || 0,
      openingStockQty: Number(qc.opstQty) || 0,
    };

    // Post QC template if selected
    const selectedQcTemplateId = Number(qc.qcTemplateId) || 0;
    if (selectedQcTemplateId) {
      try {
        const qcOptions =
          tabsWithOptions["qc"]?.["qcTemplateId"] ||
          fieldsWithOptions["qcTemplateId"] ||
          [];
        const found = qcOptions.find(
          (o: any) => Number(o.value) === selectedQcTemplateId
        );
        const payload = {
          id: selectedQcTemplateId,
          templateName: found?.label || `Template ${selectedQcTemplateId}`,
          description: qc.description || qc.notes || "",
          dateCreated: new Date().toISOString(),
        };

        await api.post("${process.env.REACT_APP_API_BASE_URL}/QcTemplates", payload);
      } catch (err) {
        console.warn("Failed to post selected QC template:", err);
      }
    }

    // Build Suppliers
    const supplierRows = tabsAny.supplier || [];
    const suppliersPayload = Array.isArray(supplierRows)
      ? supplierRows.map((s: any) => {
          let vendorName = s.supplier || s.vendorName || "";
          if (vendorName && !isNaN(Number(vendorName))) {
            const vendor = findVendorById(Number(vendorName));
            if (vendor) vendorName = vendor.vendorName;
          }

          return {
            vendorName: vendorName,
            vendorCode: s.code || s.vendorCode || "",
            description: s.description || "",
            rate: Number(s.rate) || 0,
          };
        })
      : [];

    const aggregatePayload = {
      itemMaster: itemMasterPayload,
      itemPlanning: itemPlanningPayload,
      itemUomPackingDetails: itemUomPackingPayload,
      itemAccountingInfo: itemAccountingPayload,
      locationStocks: locationStocksPayload,
      itemQualityControl: itemQualityPayload,
      suppliers: suppliersPayload,
    };

    console.log(
      "Aggregated payload to send to ItemAggregate:",
      aggregatePayload
    );

    try {
      let res;
      if (finalEditItemId) {
        // Use PUT method for editing existing items
        res = await api.putItemAggregate(finalEditItemId, aggregatePayload);
        console.log("ItemAggregate PUT response:", res);
      } else {
        // Use POST method for creating new items
        res = await api.postItemAggregate(aggregatePayload);
        console.log("ItemAggregate POST response:", res);
      }
      
      toast.success(finalEditItemId ? "Product updated successfully." : "Product saved successfully.");

      let savedId: number | string | undefined = undefined;
      if (res && res.data) {
        const d: any = res.data;
        savedId = d.id ?? d.Id ?? d.itemId ?? d.ItemId;
        if (!savedId && d.ItemMaster) {
          savedId = d.ItemMaster.Id ?? d.ItemMaster.id ?? d.ItemMaster.itemId;
        }
        if (!savedId && d.itemMaster) {
          savedId = d.itemMaster.Id ?? d.itemMaster.id ?? d.itemMaster.itemId;
        }
      }
      if (!savedId && finalEditItemId != null) savedId = finalEditItemId;
      try {
        onSaved && onSaved(savedId);
      } catch (e) {
        console.warn("onSaved callback threw:", e);
      }
    } catch (err) {
      console.error("Error saving ItemAggregate:", err);
      toast.error("Failed to save product. Check console for details.");
    }
  };

  // Load item data by id from ItemMaster endpoint and autofill form
  useEffect(() => {
    if (!finalEditItemId) return;

    const loadItemMaster = async () => {
      setIsLoading(true);
      try {
        await fetchAllDropdownOptions();

        const res = await api.getById("ItemMaster", finalEditItemId);
        const im = res.data;
        if (!im) return;

        console.log("ItemMaster edit data:", im);

        const initialValues: { [k: string]: any } = {
          itemName:        im.itemName || im.ItemName || "",
          itemCode:        im.itemCode || im.ItemCode || "",
          brand:           im.brand || im.Brand || "",
          catNo:           im.catNo || im.CatNo || "",
          unitPrice:       im.unitPrice ?? im.UnitPrice ?? 0,
          hsnNo:           im.hsn || im.Hsn || im.hsnCode || "",
          taxPercentage:   im.taxPercentage ?? im.TaxPercentage ?? im.taxPercent ?? 0,
          isActive:        !!(im.isActive ?? im.IsActive),
          bomApplicable:   !!(im.bomApplicable ?? im.BomApplicable),
          // Additional fields from API response
          Critical:        im.criticality || im.Criticality || "",
          lpRate:          im.lpRate ?? im.LpRate ?? 0,
          relatedStockAccount: im.relatedStockAccount || im.RelatedStockAccount || "Stock In Trade",
          StockToBank:     im.stockToBank || im.StockToBank || "",
          item:            im.itemDescription || im.ItemDescription || "",
          description:     im.itemDescription || im.ItemDescription || "",
          // dropdowns â€” bind by numeric id as string, prefer IDs over names
          itemGroup:        im.groupId        ? String(im.groupId)        : "",
          category:         im.categoryId     ? String(im.categoryId)     : "",
          uom:              im.uomId          ? String(im.uomId)          : "",
          inventoryMethod:  im.inventoryMethodId ? String(im.inventoryMethodId) : "",
          valuationMethod:  im.valuationMethodId ? String(im.valuationMethodId) : "",
          make:             im.makeId         ? String(im.makeId)         : (im.make || ""),
          model:            im.modelId        ? String(im.modelId)        : (im.model || ""),
          product:          im.productId      ? String(im.productId)      : (im.product || ""),
          // name fallbacks for label resolution
          itemGroupName:       im.groupName            || "",
          categoryName:        im.categoryName         || "",
          uomName:             im.uomName              || "",
          inventoryMethodName: im.inventoryMethodName  || "",
          valuationMethodName: im.valuationMethodName  || "",
          makeName:            im.make                 || "",
          modelName:           im.model                || "",
          productName:         im.product              || "",
          // Store IDs for form submission
          makeId:              im.makeId               || 0,
          modelId:             im.modelId              || 0,
          productId:           im.productId            || 0,
        };

        setSelectedValues(initialValues);
      } catch (err) {
        console.error("Failed to load ItemMaster for edit:", err);
        toast.error("Failed to load product data for editing.");
      } finally {
        setIsLoading(false);
      }
    };

    loadItemMaster();
  }, [finalEditItemId]);

  // Vendor functions
  const findVendorByName = (vendorName: string): Vendor | undefined => {
    if (!vendorName || vendorName.trim() === "") return undefined;
    const vendor = vendors.find(
      (v) =>
        v.vendorName.toLowerCase().trim() === vendorName.toLowerCase().trim()
    );
    return vendor;
  };

  const findVendorByCode = (vendorCode: string): Vendor | undefined => {
    if (!vendorCode || vendorCode.trim() === "") return undefined;
    const vendor = vendors.find(
      (v) =>
        v.vendorCode &&
        v.vendorCode.toLowerCase().trim() === vendorCode.toLowerCase().trim()
    );
    return vendor;
  };

  const findVendorById = (id: number): Vendor | undefined => {
    if (!id) return undefined;
    const vendor = vendors.find((v) => v.id === id);
    return vendor;
  };

  // Enhanced table data change handler
  const handleTableDataChange = (tabId: string, data: any[]) => {
    console.log(`Table ${tabId} updated from child:`, data);

    if (tabId === "supplier" && vendors.length > 0) {
      const updatedData = data.map((row, rowIndex) => {
        const previousRow = currentFormData.tabsData?.[tabId]?.[rowIndex] || {};
        const newRow = { ...row };

        const supplierChanged = newRow.supplier !== previousRow.supplier;
        const codeChanged = newRow.code !== previousRow.code;

        if (
          supplierChanged &&
          newRow.supplier &&
          String(newRow.supplier).trim() !== ""
        ) {
          let vendor: Vendor | undefined;
          if (!isNaN(Number(newRow.supplier))) {
            vendor = findVendorById(Number(newRow.supplier));
          }
          if (!vendor) {
            vendor = findVendorByName(String(newRow.supplier));
          }

          if (vendor) {
            if (vendor.vendorCode && vendor.vendorCode.trim() !== "") {
              newRow.code = vendor.vendorCode;
            } else {
              newRow.code = "N/A";
            }
          }
        }

        if (codeChanged && newRow.code && newRow.code.trim() !== "") {
          const vendor = findVendorByCode(newRow.code);
          if (vendor) {
            newRow.supplier = String(vendor.id);
          }
        }

        return newRow;
      });

      setCurrentFormData((prev) => ({
        ...prev,
        tabsData: {
          ...prev.tabsData,
          [tabId]: updatedData,
        },
      }));

      return updatedData;
    }

    return data;
  };

  // Handle real-time form data changes from child component
  const handleFormDataChange = (formData: Record<string, any>) => {
    setCurrentFormData(formData);
  };

  // Handle field value changes from child component for filtering
  const handleFieldValueChange = (fieldId: string, value: string) => {
    const newSelectedValues = {
      ...selectedValues,
      ...currentFormData,
      [fieldId]: value,
    };

    if (value === "all") {
      const fieldOptions = filteredOptions[fieldId] || [];
      if (fieldOptions.length === 2) {
        const actualOption = fieldOptions.find((opt) => opt.value !== "all");
        if (actualOption) {
          newSelectedValues[fieldId] = actualOption.value;
        }
      } else {
        delete newSelectedValues[fieldId];
      }
    }

    setSelectedValues(newSelectedValues);

    if (fieldId === "itemCode" && value !== "all") {
      autoFillFormFields(value);
    } else {
      filterOptions(newSelectedValues);
    }
  };

  // Auto-fill form fields based on selected item code
  const autoFillFormFields = (itemCode: string) => {
    const selectedItem = itemList.find((item) => item.itemCode === itemCode);

    if (selectedItem) {
      const fillData: Record<string, any> = {
        make: selectedItem.make,
        model: selectedItem.model,
        category: selectedItem.categoryName,
        itemName: selectedItem.itemName,
        catNo: selectedItem.catNo || "",
        uom: selectedItem.uomName || "",
        purchaseRate: selectedItem.purchaseRate || "",
        saleRate: selectedItem.saleRate || "",
        quoteRate: selectedItem.quoteRate || "",
        hsnNo: selectedItem.hsn || "",
        taxPercentage: selectedItem.taxPercentage || "",
        description: `${selectedItem.product} - ${selectedItem.itemName}`,
      };

      setAutoFillData(fillData);

      filterOptions({
        ...selectedValues,
        supplier: "all",
        itemCode: itemCode,
      });
    }
  };

  // Sample vendor data
  const sampleVendors: Vendor[] = [
    {
      id: 1,
      vendorCode: "VEND001",
      vendorName: "HOSPIINZ INTERNATIONAL-S",
      phone: [],
      email: [],
      doorNo: null,
      street: null,
      area: null,
      city: "COIMBATORE",
      state: "Tamil Nadu",
      country: "India",
      pincode: null,
      address: "VOC COLONY , PEELAMEDU",
      gstNumber: "33AADFH3550P1Z9",
      panNumber: null,
      isRegistered: true,
      bankName: null,
      accountHolderName: null,
      bankAccountNumber: null,
      ifscCode: null,
      isActive: true,
      createdAt: "2025-09-04T10:15:29.151349",
      updatedAt: "2025-09-04T10:15:29.151349",
    },
    {
      id: 2,
      vendorCode: "VEND002",
      vendorName: "OPUS SOLUTIONS",
      phone: ["0422-4377978", "9364484464"],
      email: ["opussolutions@yahoo.com"],
      doorNo: null,
      street: null,
      area: null,
      city: "COIMBATORE",
      state: "Tamil Nadu",
      country: "India",
      pincode: null,
      address: "262, R.R Complex Iind Floor,Dr.Nanjappa Road",
      gstNumber: "33AABFO1039Q1Z6",
      panNumber: null,
      isRegistered: true,
      bankName: null,
      accountHolderName: null,
      bankAccountNumber: null,
      ifscCode: null,
      isActive: true,
      createdAt: "2025-09-04T10:15:29.151349",
      updatedAt: "2025-09-04T10:15:29.151349",
    },
    {
      id: 3,
      vendorCode: "VEND003",
      vendorName: "IT ZONE",
      phone: [],
      email: ["Itzonegr@gmail.Com", "itzonegr@gmail.com"],
      doorNo: null,
      street: null,
      area: null,
      city: "COIMBATORE",
      state: "Tamil Nadu",
      country: "India",
      pincode: null,
      address: "No.383, Jaya Complex,100 Feet Road,Gandhipuram",
      gstNumber: "33AACFI1077R1Z3",
      panNumber: null,
      isRegistered: true,
      bankName: null,
      accountHolderName: null,
      bankAccountNumber: null,
      ifscCode: null,
      isActive: true,
      createdAt: "2025-09-04T10:15:29.151349",
      updatedAt: "2025-09-04T10:15:29.151349",
    },
    {
      id: 4,
      vendorCode: null,
      vendorName: "S.M.ENTERPRISES",
      phone: [],
      email: [],
      doorNo: null,
      street: null,
      area: null,
      city: "COIMBATORE",
      state: "Tamil Nadu",
      country: "India",
      pincode: null,
      address: "60-H, Y.M.C.A. Building,Head Post Office Road",
      gstNumber: "33BXJPS8177H1ZV",
      panNumber: null,
      isRegistered: true,
      bankName: null,
      accountHolderName: null,
      bankAccountNumber: null,
      ifscCode: null,
      isActive: true,
      createdAt: "2025-09-04T10:15:29.151349",
      updatedAt: "2025-09-04T10:15:29.151349",
    },
  ];

  // Enhanced fetchVendors function
  const fetchVendors = async () => {
    try {
      const res = await api.get("Supplier");
      const vendorData = await res.data;
      setVendors(vendorData);

      const vendorOptions = vendorData.map((vendor: Vendor) => ({
        value: String(vendor.id),
        label: vendor.vendorName,
      }));

      const vendorCodeOptions = vendorData
        .filter(
          (vendor: Vendor) =>
            vendor.vendorCode && vendor.vendorCode.trim() !== ""
        )
        .map((vendor: Vendor) => ({
          value: vendor.vendorCode!,
          label: vendor.vendorCode!,
        }));

      setTabsWithOptions((prev) => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          supplier: vendorOptions,
          code:
            vendorCodeOptions.length > 0
              ? vendorCodeOptions
              : [
                  { value: "VEND001", label: "VEND001" },
                  { value: "VEND002", label: "VEND002" },
                  { value: "VEND003", label: "VEND003" },
                  { value: "VEND004", label: "VEND004" },
                ],
        },
      }));
    } catch (err) {
      console.error("Error fetching vendors:", err);
      setVendors(sampleVendors);

      const vendorOptions = sampleVendors.map((vendor) => ({
        value: String(vendor.id),
        label: vendor.vendorName,
      }));

      const vendorCodeOptions = sampleVendors
        .filter(
          (vendor) => vendor.vendorCode && vendor.vendorCode.trim() !== ""
        )
        .map((vendor) => ({
          value: vendor.vendorCode!,
          label: vendor.vendorCode!,
        }));

      setTabsWithOptions((prev) => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          supplier: vendorOptions,
          code: vendorCodeOptions,
        },
      }));
    }
  };

  // Fetch all dropdown options including tabs
  const fetchAllDropdownOptions = async () => {
    await fetchVendors();

    const updatedOptions: { [key: string]: DropdownOption[] } = {};
    const updatedTabsOptions: {
      [key: string]: { [key: string]: DropdownOption[] };
    } = {};

    // Fetch options for main form fields
    for (const field of productMasterConfig.formConfig.fields) {
      if (field.type === "select" && field.url && !updatedOptions[field.id]) {
        try {
          const res = await api.get(field.url);
          const data = await res.data;
          const lowerUrl = String(field.url).toLowerCase();
          if (
            lowerUrl === "category" ||
            lowerUrl === "inventorygroup" ||
            lowerUrl === "inventorymethod" ||
            lowerUrl === "uom" ||
            lowerUrl === "valuationmethod" ||
            lowerUrl === "make" ||
            lowerUrl === "model" ||
            lowerUrl === "product"
          ) {
            updatedOptions[field.id] = data.map((item: any) => ({
              value: String(item.id ?? item.value ?? ""),
              label: String(item.name ?? item.label ?? item.code ?? ""),
            }));
          } else {
            updatedOptions[field.id] = data.map((item: any) => ({
              value: String(
                item.value ||
                  item.code ||
                  item.name?.replace(/\s+/g, "") ||
                  item.id?.toString() ||
                  ""
              ),
              label: String(
                item.label ||
                  item.name ||
                  item.code ||
                  item.id?.toString() ||
                  ""
              ),
            }));
          }
        } catch (err) {
          console.error(`Error fetching ${field.id} options:`, err);
          updatedOptions[field.id] = [];
        }
      }
    }

    // Fetch options for other tab form fields and table columns
    for (const tab of productMasterConfig.tabsConfig) {
      if (tab.id === "supplier") continue;

      if (tab.type === "form") {
        for (const field of tab.fields) {
          if (field.type === "select" && field.url) {
            try {
              const res = await api.get(field.url);
              const data = await res.data;
              const lowerUrl = String(field.url).toLowerCase();
              if (!updatedTabsOptions[tab.id]) {
                updatedTabsOptions[tab.id] = {};
              }
              if (
                lowerUrl === "uom" ||
                lowerUrl === "valuationmethod" ||
                lowerUrl === "category" ||
                lowerUrl === "inventorygroup" ||
                lowerUrl === "inventorymethod" ||
                lowerUrl === "qctemplates" ||
                lowerUrl === "make" ||
                lowerUrl === "model" ||
                lowerUrl === "product"
              ) {
                updatedTabsOptions[tab.id][field.id] = data.map(
                  (item: any) => ({
                    value: String(item.id ?? item.value ?? ""),
                    label: String(
                      item.templateName ??
                        item.name ??
                        item.label ??
                        item.code ??
                        ""
                    ),
                  })
                );
              } else {
                updatedTabsOptions[tab.id][field.id] = data.map(
                  (item: any) => ({
                    value: String(
                      item.value ||
                        item.code ||
                        item.name?.replace(/\s+/g, "") ||
                        item.id?.toString() ||
                        ""
                    ),
                    label: String(
                      item.label ||
                        item.name ||
                        item.code ||
                        item.id?.toString() ||
                        ""
                    ),
                  })
                );
              }
            } catch (err) {
              console.error(
                `Error fetching ${tab.id}.${field.id} options:`,
                err
              );
              if (!updatedTabsOptions[tab.id]) {
                updatedTabsOptions[tab.id] = {};
              }
              updatedTabsOptions[tab.id][field.id] = [];
            }
          }
        }
      } else if (tab.type === "table") {
        for (const column of tab.tableConfig.columns) {
          if (
            column.type === "dropdown" &&
            column.url &&
            column.accessor !== "supplier"
          ) {
            try {
              const res = await api.get(column.url);
              const data = await res.data;
              if (!updatedTabsOptions[tab.id]) {
                updatedTabsOptions[tab.id] = {};
              }
              const lowerUrl = String(column.url).toLowerCase();
              if (
                lowerUrl === "uom" ||
                lowerUrl === "valuationmethod" ||
                lowerUrl === "category" ||
                lowerUrl === "inventorygroup" ||
                lowerUrl === "inventorymethod" ||
                lowerUrl === "make" ||
                lowerUrl === "model" ||
                lowerUrl === "product"
              ) {
                updatedTabsOptions[tab.id][column.accessor] = data.map(
                  (item: any) => ({
                    value: String(item.id ?? item.value ?? ""),
                    label: String(item.name ?? item.label ?? item.code ?? ""),
                  })
                );
              } else {
                updatedTabsOptions[tab.id][column.accessor] = data.map(
                  (item: any) => ({
                    value: String(
                      item.value ||
                        item.code ||
                        item.name?.replace(/\s+/g, "") ||
                        item.id?.toString() ||
                        ""
                    ),
                    label: String(
                      item.label ||
                        item.name ||
                        item.code ||
                        item.id?.toString() ||
                        ""
                    ),
                  })
                );
              }
            } catch (err) {
              console.error(
                `Error fetching ${tab.id}.${column.accessor} options:`,
                err
              );
              if (!updatedTabsOptions[tab.id]) {
                updatedTabsOptions[tab.id] = {};
              }
              updatedTabsOptions[tab.id][column.accessor] = [];
            }
          }
        }
      }
    }

    setFieldsWithOptions((prev) => ({ ...prev, ...updatedOptions }));
    setTabsWithOptions((prev) => ({ ...prev, ...updatedTabsOptions }));
  };

  // Fetch initial data
  useEffect(() => {
    const fetchItemList = async () => {
      try {
        const res = await api.get("Items");
        const data = await res.data;
        setItemList(data);
        initializeFilteredOptions(data);
      } catch (err) {
        console.error("Error fetching item list:", err);
        setItemList([]);
        initializeFilteredOptions([]);
      }
    };

    fetchItemList();
    fetchAllDropdownOptions();
  }, []);

  // Debug useEffect for dropdown binding
  useEffect(() => {
    console.log("Current dropdown binding state:", {
      selectedValues: {
        category: selectedValues["category"],
        itemGroup: selectedValues["itemGroup"],
        inventoryMethod: selectedValues["inventoryMethod"],
        valuationMethod: selectedValues["valuationMethod"],
      },
      fieldsWithOptions: {
        category: fieldsWithOptions["category"],
        itemGroup: fieldsWithOptions["itemGroup"],
        inventoryMethod: fieldsWithOptions["inventoryMethod"],
        valuationMethod: fieldsWithOptions["valuationMethod"],
      },
    });
  }, [selectedValues, fieldsWithOptions]);

  // Initialize filtered options
  const initializeFilteredOptions = (items: Item[]) => {
    const initialOptions: { [key: string]: DropdownOption[] } = {
      make: getUniqueOptions(items, "make"),
      model: getUniqueOptions(items, "model"),
      category: getUniqueOptions(items, "categoryName"),
      itemName: getUniqueOptions(items, "itemName"),
      itemCode: getUniqueOptions(items, "itemCode"),
    };

    setFilteredOptions(initialOptions);
  };

  // Helper function to get unique options
  const getUniqueOptions = (
    items: Item[],
    field: keyof Item
  ): DropdownOption[] => {
    const uniqueValues = [
      ...Array.from(
        new Set(
          items
            .map((item) => {
              const value = item[field];
              return value !== null && value !== undefined
                ? String(value)
                : null;
            })
            .filter(Boolean)
        )
      ),
    ] as string[];

    return uniqueValues.map((value) => ({
      value: value,
      label: value,
    }));
  };

  // Filter options based on current selections
  const filterOptions = (currentSelections: { [key: string]: string }) => {
    let filteredItems = [...itemList];

    Object.keys(currentSelections).forEach((field) => {
      const value = currentSelections[field];
      if (value && value !== "all") {
        const itemField = getItemFieldName(field);
        filteredItems = filteredItems.filter((item) => {
          const itemValue = item[itemField as keyof Item];
          const matches = itemValue !== null && String(itemValue) === value;
          return matches;
        });
      }
    });

    const newFilteredOptions: { [key: string]: DropdownOption[] } = {
      make: getUniqueOptions(filteredItems, "make"),
      model: getUniqueOptions(filteredItems, "model"),
      itemName: getUniqueOptions(filteredItems, "itemName"),
      itemCode: getUniqueOptions(filteredItems, "itemCode"),
    };

    setFilteredOptions(newFilteredOptions);
  };

  // Map form field names to item data field names
  const getItemFieldName = (formField: string): keyof Item => {
    const fieldMap: { [key: string]: keyof Item } = {
      make: "make",
      model: "model",
      category: "categoryName",
      itemName: "itemName",
      itemCode: "itemCode",
    };
    return fieldMap[formField] || (formField as keyof Item);
  };

  // Get final options for each field in main form - ENHANCED for proper string comparison
  const getFinalOptions = (fieldId: string): DropdownOption[] => {
    const apiOptions = fieldsWithOptions[fieldId];
    if (apiOptions && apiOptions.length > 0) {
      let options = apiOptions.map((option) => ({
        ...option,
        value: String(option.value), // Ensure all values are strings
      }));
      
      // For make, model, product - if we have a selected value that's not in options, add it
      if ((fieldId === "make" || fieldId === "model" || fieldId === "product") && selectedValues[fieldId]) {
        const currentValue = selectedValues[fieldId];
        const hasOption = options.some(opt => opt.value === currentValue || opt.label === currentValue);
        if (!hasOption && currentValue) {
          // Add the current value as an option
          options.unshift({
            value: currentValue,
            label: currentValue
          });
        }
      }
      
      return options;
    }

    const filtered = filteredOptions[fieldId];
    if (filtered && filtered.length > 0) {
      return filtered.map((option) => ({
        ...option,
        value: String(option.value), // Ensure all values are strings
      }));
    }

    return [];
  };

  // Get options for tab fields
  const getTabFieldOptions = (
    tabId: string,
    fieldId: string
  ): DropdownOption[] => {
    const options = tabsWithOptions[tabId]?.[fieldId] || [];
    return options.map((option) => ({
      ...option,
      value: String(option.value), // Ensure all values are strings
    }));
  };

  // Get options for table column in tabs
  const getTableColumnOptions = (
    tabId: string,
    accessor: string
  ): DropdownOption[] => {
    const options = tabsWithOptions[tabId]?.[accessor] || [];
    return options.map((option) => ({
      ...option,
      value: String(option.value), // Ensure all values are strings
    }));
  };

  // Determine whether to show QC template field.
  // Priority: real-time form data -> initial loaded tabs data -> default 'no'
  const qcFlagFromCurrent =
    (currentFormData?.tabsData && currentFormData.tabsData.qc?.[0]?.qcFlag) ||
    null;
  const qcFlagFromInitial = initialTabsData?.qc?.[0]?.qcFlag || null;
  const qcFlagValue =
    qcFlagFromCurrent ??
    qcFlagFromInitial ??
    (productMasterConfig?.tabsConfig?.find((t) => t.id === "qc") ? "no" : "no");
  const showQcTemplate =
    qcFlagValue === "yes" || qcFlagValue === true || qcFlagValue === "true";

  // Enhanced form config with dynamic options
  const formConfigWithOptions: FormConfig = {
    fields: productMasterConfig.formConfig.fields.map((field) => {
      if (field.type === "select") {
        const options = field.options || getFinalOptions(field.id);
        return {
          ...field,
          disabled: readOnly || field.disabled,
          options: options,
        };
      }
      return {
        ...field,
        disabled: readOnly || field.disabled,
      };
    }),
  };

  // Updated tabs config
  const tabsConfigWithOptions: TabConfig[] = productMasterConfig.tabsConfig.map(
    (tab) => {
      if (tab.type === "form") {
        // Special-case QC tab: hide qcTemplateId field unless QC flag is set to 'yes'
        if (tab.id === "qc") {
          return {
            ...tab,
            fields: tab.fields
              .filter((f) => {
                // keep all fields except qcTemplateId when template should be hidden
                if (
                  !showQcTemplate &&
                  (f.id === "qcTemplateId" || f.id === "qcTemplate")
                ) {
                  return false;
                }
                return true;
              })
              .map((field) => {
                if (field.type === "select") {
                  const options =
                    field.options || getTabFieldOptions(tab.id, field.id);
                  return {
                    ...field,
                    disabled: readOnly || field.disabled,
                    options: options || [],
                  };
                }
                return {
                  ...field,
                  disabled: readOnly || field.disabled,
                }
              }),
          };
        }
        if (tab.id === "uom") {
          return {
            ...tab,
            fields: tab.fields.map((field) => {
              if (
                field.id === "PrimaryUOM" ||
                field.id === "buyingUOM" ||
                field.id === "consumptionUOM"
              ) {
                const uomOptions = getTabFieldOptions(tab.id, field.id).length
                  ? getTabFieldOptions(tab.id, field.id)
                  : fieldsWithOptions["uom"] || [];
                return {
                  ...field,
                  type: "select",
                  disabled: readOnly || field.disabled,
                  options: uomOptions,
                };
              }

              if (
                field.id === "conversiontoPrimaryUOM" ||
                field.id === "conversiontoPrimaryUOM2"
              ) {
                return {
                  ...field,
                  placeholder: field.placeholder || "1.000000",
                };
              }

              if (field.type === "select") {
                const options =
                  field.options || getTabFieldOptions(tab.id, field.id);
                return {
                  ...field,
                  disabled: readOnly || field.disabled,
                  options: options || [],
                };
              }
              return {
                ...field,
                disabled: readOnly || field.disabled,
              };
            }),
          };
        }

        return {
          ...tab,
          fields: tab.fields.map((field) => {
            if (field.type === "select") {
              const options =
                field.options || getTabFieldOptions(tab.id, field.id);
              return {
                ...field,
                disabled: readOnly || field.disabled,
                options: options || [],
              };
            }
            return {
              ...field,
              disabled: readOnly || field.disabled,
            };
          }),
        };
      } else if (tab.type === "table") {
        if (tab.id === "supplier") {
          const supplierOptions = vendors.map((v) => ({
            value: String(v.id),
            label: v.vendorName,
          }));

          const codeOptions = vendors
            .filter((v) => v.vendorCode && v.vendorCode.trim() !== "")
            .map((v) => ({
              value: v.vendorCode!,
              label: v.vendorCode!,
            }));

          return {
            ...tab,
            tableConfig: {
              ...tab.tableConfig,
              columns: tab.tableConfig.columns.map((column) => {
                if (column.type === "dropdown") {
                  if (column.accessor === "supplier") {
                    return {
                      ...column,
                      options: supplierOptions,
                    };
                  } else if (column.accessor === "code") {
                    return {
                      ...column,
                      options: codeOptions.length > 0 ? codeOptions : [],
                    };
                  }

                  const options =
                    column.options ||
                    getTableColumnOptions(tab.id, column.accessor);
                  return {
                    ...column,
                    options: options || [],
                  };
                }
                return column;
              }),
              data: (initialTabsData[tab.id] || tab.tableConfig.data).map(
                (row) => ({
                  supplier: row.supplier || "",
                  code: row.code || "",
                  description: row.description || "",
                  remarks: row.remarks || "",
                  rate: row.rate || 0,
                  disabled: readOnly,
                })
              ),
            },
          };
        } else {
          return {
            ...tab,
            tableConfig: {
              ...tab.tableConfig,
              columns: tab.tableConfig.columns.map((column) => {
                if (column.type === "dropdown") {
                  const options =
                    column.options ||
                    getTableColumnOptions(tab.id, column.accessor);
                  return {
                    ...column,
                    options: options || [],
                  };
                }
                return column;
              }),
              data: (initialTabsData[tab.id] || tab.tableConfig.data).map(
                (row) => ({
                  ...row,
                  disabled: readOnly,
                }),
              ),
            },
          };
        }
      }
      return tab;
    }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading product data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {readOnly && (
          <div className="bg-blue-50 border border-blue-200 text-blue-600 text-sm px-4 py-2 rounded mb-4 flex items-center gap-2">
            <FaEye /> View Only — Editing is disabled
          </div>
        )}
        <DynamicFormWithTabs
          formConfig={formConfigWithOptions}
          tabsConfig={tabsConfigWithOptions}
          onFormSubmit={handleFormSubmit}
          onTableDataChange={handleTableDataChange}
          onFormDataChange={handleFormDataChange}
          onFieldValueChange={handleFieldValueChange}
          selectedValues={selectedValues}
          vendors={vendors}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}

export default ItemMaster;
