import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import DynamicForm, {
  DynamicFormField,
} from "../../../components/common/DynamicForm";
import {
  FaPlus as Plus,
  FaEdit as Edit2,
  FaTrash as Trash2,
  FaFileImport as Import,
  FaFileExport as Export,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { useUser } from "../../../context/UserContext";
import Modal from "../../../components/common/Modal";
import ConfirmBox from "../../../components/common/ConfirmBox";
import ItemMasterForm from "../bom/components/ItemMaster";

// Interfaces
interface MasterDataItem {
  id: string | number;
  name: string;
  description?: string;
  [key: string]: any;
}

interface TabConfig {
  key: string;
  label: string;
  color: string;
  endpoint: string;
  fields: DynamicFormField[];
  columns: number;
  tableColumns?: DynamicFormField[];
}

// Main component
interface ItemMasterProps {
  tab?: string;
}

export default function ItemMaster({ tab = "ItemMaster" }: ItemMasterProps) {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(tab);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editItemId, setEditItemId] = useState<string | number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItemId, setViewItemId] = useState<string | number | null>(null);
  const [viewItem, setViewItem] = useState<MasterDataItem | null>(null);
  const [viewTab, setViewTab] = useState<string>("");

  // Monitor changes to itemsPerPage
  useEffect(() => {
    console.log("Items per page updated:", itemsPerPage);
  }, [itemsPerPage]);

  // Update activeTab when tab prop changes
  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  // Initialize column visibility settings
  useEffect(() => {
    const currentTab = tabConfig.find((t) => t.key === activeTab);
    if (currentTab) {
      const sourceColumns =
        activeTab === "itemMaster"
          ? currentTab.tableColumns
          : activeTab === "Product"
            ? currentTab.fields
            : currentTab.fields;

      if (sourceColumns) {
        const initialColumnSettings: Record<string, boolean> = {};
        // Show first 10 columns by default
        sourceColumns.forEach((column: any, index: number) => {
          initialColumnSettings[column.id] = index < 10;
          console.log(
            `Column ${column.id}: ${index < 10 ? "visible" : "hidden"}`,
          );
        });
        console.log("Initial column settings:", initialColumnSettings);
        setColumnSettings(initialColumnSettings);
      }
    }
  }, [activeTab]);

  // Handle click outside to close column manager
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnManagerRef.current &&
        !columnManagerRef.current.contains(event.target as Node)
      ) {
        setShowColumnManager(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const [data, setData] = useState<Record<string, MasterDataItem[]>>({
    products: [],
    categories: [],
    valuation: [],
    uoms: [],
    boms: [],
    Product: [],
  });
  const [editItem, setEditItem] = useState<MasterDataItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [columnSettings, setColumnSettings] = useState<Record<string, boolean>>(
    () => {
      console.log("Initializing column settings state");
      return {};
    },
  );
  const [showColumnManager, setShowColumnManager] = useState<boolean>(false);
  const columnManagerRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending" | null;
  }>({ key: "", direction: null });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a CSV file
    if (file.type !== "text/csv") {
      setUploadError("Please upload a CSV file");
      return;
    }

    try {
      // Define expected headers and their mappings to API fields
      const headerMappings = {
        Group_id: "groupId",
        Category_id: "categoryId",
        Brand: "brand",
        "Item Name": "itemName",
        "Item Code": "itemCode",
        "Unit Price": "unitPrice",
        uom_id: "uomId",
        "Cat No": "catNo",
        "Inventory Method_id": "inventoryMethodId",
        HSN: "hsn",
        TaxPercentage: "taxPercentage",
        "Valution Method_id": "valuationMethodId",
      };

      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n");

        // Parse headers properly
        const headers = parseCSVLine(lines[0]).map((header) => header.trim());

        // Validate required headers
        const missingHeaders = Object.keys(headerMappings).filter(
          (required) => !headers.includes(required),
        );

        if (missingHeaders.length > 0) {
          setUploadError(
            `Missing required columns: ${missingHeaders.join(", ")}`,
          );
          return;
        }

        const itemsArray = [];
        const validationErrors: string[] = [];

        // Enhanced numeric validation functions
        const validateNumeric12_2 = (
          value: number,
          fieldName: string,
          lineNumber: number,
        ): boolean => {
          // Check if value exceeds numeric(12,2) maximum (9999999999.99)
          if (value > 9999999999.99) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} exceeds maximum allowed value of 9999999999.99`,
            );
            return false;
          }

          // Check if value is below minimum
          if (value < -9999999999.99) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} is below minimum value of -9999999999.99`,
            );
            return false;
          }

          // Check if value has more than 10 integer digits
          const integerPart = Math.abs(Math.floor(value)).toString();
          if (integerPart.length > 10) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} has too many integer digits (max 10)`,
            );
            return false;
          }

          return true;
        };

        const validateTaxPercentage = (
          value: number,
          lineNumber: number,
        ): boolean => {
          // TaxPercentage is typically between 0-100 with 2 decimal places
          if (value < 0) {
            validationErrors.push(
              `Line ${lineNumber}: TaxPercentage ${value} cannot be negative`,
            );
            return false;
          }
          if (value > 100) {
            validationErrors.push(
              `Line ${lineNumber}: TaxPercentage ${value} cannot exceed 100%`,
            );
            return false;
          }

          // Check decimal places
          const decimalPart = value.toString().split(".")[1];
          if (decimalPart && decimalPart.length > 2) {
            validationErrors.push(
              `Line ${lineNumber}: TaxPercentage ${value} has more than 2 decimal places`,
            );
            return false;
          }

          return true;
        };

        const validateInteger = (
          value: number,
          fieldName: string,
          lineNumber: number,
        ): boolean => {
          // Check for maximum integer value (PostgreSQL integer max: 2147483647)
          if (value > 2147483647) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} exceeds maximum integer value (2147483647)`,
            );
            return false;
          }
          if (value < -2147483648) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} is below minimum integer value (-2147483648)`,
            );
            return false;
          }
          if (!Number.isInteger(value)) {
            validationErrors.push(
              `Line ${lineNumber}: ${fieldName} ${value} is not a valid integer`,
            );
            return false;
          }
          return true;
        };

        const parseNumericValue = (value: string): number => {
          if (!value || value.trim() === "") return 0;

          // Remove commas, currency symbols, spaces, and any other non-numeric characters except decimal point and minus sign
          const cleanedValue = value.replace(/[^\d.-]/g, "");

          // Handle empty string after cleaning
          if (cleanedValue === "" || cleanedValue === "-") return 0;

          // Parse as float
          const numericValue = parseFloat(cleanedValue);

          // Handle NaN cases
          return isNaN(numericValue) ? 0 : numericValue;
        };

        // Function to ensure number always has exactly 2 decimal places
        const formatWithTwoDecimals = (num: number): number => {
          return parseFloat(num.toFixed(2));
        };

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines

          try {
            const values = parseCSVLine(lines[i]).map((value) => value.trim());
            const newItem = {
              userCreated: user?.userId || 0,
              dateCreated: new Date().toISOString(),
              userUpdated: user?.userId || 0,
              dateUpdated: new Date().toISOString(),
              isActive: true,
              groupId: 0,
              categoryId: 0,
              brand: "",
              itemName: "",
              itemCode: "",
              unitPrice: 0,
              uomId: 0,
              catNo: "",
              inventoryMethodId: 0,
              hsn: "",
              taxPercentage: 0,
              valuationMethodId: 0,
            };

            // Map CSV values to API fields with validation
            headers.forEach((header, index) => {
              const value = values[index] || "";
              const apiField =
                headerMappings[header as keyof typeof headerMappings];

              if (apiField) {
                switch (apiField) {
                  case "groupId":
                  case "categoryId":
                  case "uomId":
                  case "inventoryMethodId":
                  case "valuationMethodId":
                    const intValue = parseInt(value) || 0;
                    (newItem as any)[apiField] = intValue;
                    validateInteger(intValue, apiField, i + 1);
                    break;

                  case "unitPrice":
                    const unitPriceValue = parseNumericValue(value);
                    const formattedUnitPrice =
                      formatWithTwoDecimals(unitPriceValue);
                    (newItem as any)[apiField] = formattedUnitPrice;
                    validateNumeric12_2(formattedUnitPrice, apiField, i + 1);
                    break;

                  case "taxPercentage":
                    const taxPercentageValue = parseNumericValue(value);
                    const formattedTaxPercentage =
                      formatWithTwoDecimals(taxPercentageValue);
                    (newItem as any)[apiField] = formattedTaxPercentage;
                    validateTaxPercentage(formattedTaxPercentage, i + 1);
                    break;

                  case "hsn":
                    newItem.hsn = value;
                    break;

                  default:
                    (newItem as any)[apiField] = value;
                }
              }
            });

            itemsArray.push(newItem);
          } catch (error: any) {
            validationErrors.push(
              `Error processing line ${i + 1}: ${error.message}`,
            );
          }
        }

        // Check if there were any validation errors
        if (validationErrors.length > 0) {
          setUploadError(
            `Validation errors: ${validationErrors.slice(0, 5).join("; ")}${
              validationErrors.length > 5
                ? `... and ${validationErrors.length - 5} more errors`
                : ""
            }`,
          );
          return;
        }

        if (itemsArray.length === 0) {
          setUploadError("No valid items found in the CSV file");
          return;
        }

        // Log the first item to verify formatting
        console.log(
          "Sample item being sent:",
          JSON.stringify(itemsArray[0], null, 2),
        );

        try {
          // Process all items in a single API call
          let successCount = 0;
          let errorCount = 0;
          const errors: string[] = [];

          try {
            const response = await api.postItemMasterArray(itemsArray);

            if (response.data) {
              if (Array.isArray(response.data)) {
                response.data.forEach((result: any, index: number) => {
                  if (result.success) {
                    successCount++;
                  } else {
                    errorCount++;
                    errors.push(
                      `Item ${index + 1}: ${result.message || "Unknown error"}`,
                    );
                  }
                });
              } else if (response.data.success) {
                successCount = itemsArray.length;
              } else {
                errorCount = itemsArray.length;
                errors.push(response.data.message || "Failed to add items");
              }
            } else {
              errorCount = itemsArray.length;
              errors.push("No response data received from server");
            }
          } catch (error: any) {
            errorCount = itemsArray.length;
            // Enhanced error handling for PostgreSQL numeric overflow
            if (
              error.response?.data?.message?.includes(
                "numeric field overflow",
              ) ||
              error.response?.data?.message?.includes("22003")
            ) {
              errors.push(
                "Numeric field overflow error: Please check that all numeric values are within valid ranges and have proper decimal formatting",
              );
            } else {
              errors.push(
                error.response?.data?.message || "Error uploading items",
              );
            }
          }

          // Show summary after processing all items
          if (errors.length > 0) {
            setUploadError(
              `Upload completed with ${successCount} successes and ${errorCount} failures. Errors: ${errors
                .slice(0, 3)
                .join("; ")}${
                errors.length > 3 ? `... and ${errors.length - 3} more` : ""
              }`,
            );
          } else {
            setUploadError(`Successfully added ${successCount} items`);
          }

          // Refresh data if any items were added
          if (successCount > 0) {
            fetchData();
          }
        } catch (error: any) {
          setUploadError(
            error.response?.data?.message || "Error uploading items",
          );
        }
      };

      reader.readAsText(file);
    } catch (error: any) {
      setUploadError("Error reading CSV file");
    }
  };

  // Helper function to properly parse CSV lines with quoted values
  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    let escapeNext = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escapeNext) {
        current += char;
        escapeNext = false;
        continue;
      }

      if (char === "\\") {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }

    result.push(current);

    // Remove quotes from quoted fields
    return result.map((field) => {
      if (field.startsWith('"') && field.endsWith('"') && field.length > 1) {
        return field.substring(1, field.length - 1).replace(/""/g, '"');
      }
      return field;
    });
  }
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>("");
  const [productVarianceUoms, setProductVarianceUoms] = useState<any[]>([]);

  // Fetch UOMs for Product Variance on initial load and when boms tab is activated
  useEffect(() => {
    api.get("Uom").then((res) => {
      setProductVarianceUoms(res.data || []);
    });
  }, []);
  useEffect(() => {
    if (activeTab === "ItemMaster" && productVarianceUoms.length === 0) {
      api.get("Uom").then((res) => {
        setProductVarianceUoms(res.data || []);
      });
    }
  }, [activeTab]);

  // Fetch related data for Products tab when activated
  useEffect(() => {
    if (activeTab === "ItemMaster") {
      api
        .get("Category")
        .then((res) =>
          setData((prev) => ({ ...prev, categories: res.data || [] })),
        );
      api
        .get("Uom")
        .then((res) => setData((prev) => ({ ...prev, uoms: res.data || [] })));
      api
        .get("ValuationMethod")
        .then((res) =>
          setData((prev) => ({ ...prev, valuation: res.data || [] })),
        );
      api
        .get("InventoryMethod")
        .then((res) =>
          setData((prev) => ({ ...prev, inventoryMethod: res.data || [] })),
        );
      api
        .get("InventoryGroup")
        .then((res) =>
          setData((prev) => ({ ...prev, inventoryGroup: res.data || [] })),
        );
    }
    if (activeTab === "ItemMaster") {
      api
        .get("ItemMaster")
        .then((res) =>
          setData((prev) => ({ ...prev, ItemMaster: res.data || [] })),
        );
    }
    if (activeTab === "Product") {
      api
        .get("Product")
        .then((res) =>
          setData((prev) => ({ ...prev, Product: res.data || [] })),
        );
    }
  }, [activeTab]);

  // Tab configuration
  const tabConfig: TabConfig[] = [
    {
      key: "Product",
      label: "Product Master",
      color: "green",
      endpoint: "Product",
      columns: 1,
      fields: [
        { name: "Name", id: "name", type: "text", required: true },
        { name: "Is Active", id: "isActive", type: "checkbox" },
      ],
    },
    {
      key: "ItemMaster",
      label: "Item Master",
      color: "blue",
      // Bind to the aggregate endpoint as requested
      endpoint: "ItemAggregate",
      columns: 3,
      fields: [
        { name: "Item Name", id: "itemName", type: "text", required: true },
        { name: "Item Code", id: "itemCode", type: "text", required: true },
        { name: "Product", id: "product", type: "text" },
        { name: "Brand", id: "brand", type: "text" },
        {
          name: "Category",
          id: "categoryId",
          type: "select",
          required: true,
          options: data.categories.map((c) => ({ label: c.name, value: c.id })),
        },

        {
          name: "Main Group",
          id: "groupName",
          type: "select",
          options:
            data.inventoryGroup?.map((i) => ({
              label: i.name,
              value: i.id,
            })) || [],
        },
        {
          name: "UOM",
          id: "uomId",
          type: "select",
          required: true,
          options: data.uoms.map((u) => ({ label: u.code, value: u.id })),
        },

        { name: "Unit Price", id: "unitPrice", type: "number" },
        { name: "Cat No", id: "catNo", type: "text" },
        { name: "HSN Code", id: "HSN", type: "text" },
        { name: "Tax Percentage", id: "taxPercentage", type: "number" },
        {
          name: "Inventory Method",
          id: "inventoryMethodId",
          type: "select",
          options:
            data.inventoryMethod?.map((i) => ({
              label: i.name,
              value: i.id,
            })) || [],
        },
        {
          name: "Valuation Method",
          id: "valuationMethodId",
          type: "select",
          options:
            data.valuation?.map((v) => ({ label: v.name, value: v.id })) || [],
        },
        { name: "Image URL", id: "imageUrl", type: "text" },
        { name: "Is Active", id: "isActive", type: "checkbox" },
      ],
      tableColumns: [
        { name: "Item Name", id: "itemName", type: "text", required: true },
        { name: "Item Code", id: "itemCode", type: "text", required: true },
        { name: "Product", id: "product", type: "text" },
        { name: "Brand", id: "brand", type: "text" },
        { name: "Make", id: "make", type: "text" },
        { name: "Model", id: "model", type: "text" },
        {
          name: "Category",
          id: "categoryId",
          type: "select",
          required: true,
          options: data.categories.map((c) => ({ label: c.name, value: c.id })),
        },

        {
          name: "Main Group",
          id: "groupName",
          type: "select",
          options:
            data.inventoryGroup?.map((i) => ({
              label: i.name,
              value: i.id,
            })) || [],
        },
        {
          name: "UOM",
          id: "uomId",
          type: "select",
          required: true,
          options: data.uoms.map((u) => ({ label: u.code, value: u.id })),
        },

        { name: "Unit Price", id: "unitPrice", type: "number" },
        { name: "Cat No", id: "catNo", type: "text" },
        { name: "HSN Code", id: "hsn", type: "text" },
        { name: "Tax Percentage", id: "taxPercentage", type: "number" },
        {
          name: "Inventory Method",
          id: "inventoryMethodId",
          type: "select",
          options:
            data.inventoryMethod?.map((i) => ({
              label: i.name,
              value: i.id,
            })) || [],
        },
        {
          name: "Valuation Method",
          id: "valuationMethodId",
          type: "select",
          options:
            data.valuation?.map((v) => ({ label: v.name, value: v.id })) || [],
        },
      ],
    },
    {
      key: "categories",
      label: "Categories",
      color: "orange",
      endpoint: "Category",
      columns: 1,
      fields: [{ name: "Name", id: "name", type: "text", required: true }],
    },
    {
      key: "valuation",
      label: "Valuation",
      color: "purple",
      endpoint: "ValuationMethod",
      columns: 1,
      fields: [
        { name: "Name", id: "name", type: "text", required: true },
        { name: "Description", id: "description", type: "textarea" },
      ],
    },
    {
      key: "inventoryGroup",
      label: "Inventory Group",
      color: "purple",
      endpoint: "InventoryGroup",
      columns: 1,
      fields: [{ name: "Name", id: "name", type: "text", required: true }],
    },
    {
      key: "inventoryMethod",
      label: "Inventory Method",
      color: "purple",
      endpoint: "InventoryMethod",
      columns: 1,
      fields: [{ name: "Name", id: "name", type: "text", required: true }],
    },
    {
      key: "inventoryType",
      label: "Inventory Type",
      color: "purple",
      endpoint: "InventoryType",
      columns: 1,
      fields: [
        { name: "Name", id: "name", type: "text", required: true },
        {
          name: "Inventory Flag",
          id: "inventoryFlag",
          type: "checkbox",
          required: true,
        },
        {
          name: "Account Flag",
          id: "accountFlag",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      key: "uoms",
      label: "UOMs",
      color: "pink",
      endpoint: "Uom",
      columns: 1,
      fields: [
        { name: "Code", id: "code", type: "text", required: true },
        { name: "Description", id: "description", type: "textarea" },
      ],
    },
    {
      key: "boms",
      label: "Product Variants",
      color: "red",
      endpoint: "BomName",
      columns: 1,
      fields: [
        { name: "Name", id: "name", type: "text", required: true },

        {
          name: "Type",
          id: "type",
          type: "tags",
        },
      ],
    },
  ];

  // Fetch data for active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Reset form data when modal opens or editItem changes
  useEffect(() => {
    if (isModalOpen) {
      setFormData(editItem || {});
    }
  }, [isModalOpen, editItem]);

  const fetchData = async () => {
    try {
      const currentTab = tabConfig.find((tab) => tab.key === activeTab);
      if (!currentTab) return;

      const response = await api.get(currentTab.endpoint);
      setData((prev) => ({ ...prev, [activeTab]: response.data }));
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    }
  };

  // Handle form field changes
  const handleFormChange = (id: string, value: any) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      const currentTab = tabConfig.find((tab) => tab.key === modalType);
      if (!currentTab) return;

      // Ensure isActive is always boolean, default false if not set
      let submitData = { ...formData };
      if (currentTab.fields.some((f) => f.id === "isActive")) {
        submitData.isActive =
          typeof submitData.isActive === "boolean"
            ? submitData.isActive
            : false;
      }

      // Special handling for ItemAggregate endpoint (Item Master tab)
      const isItemAggregate = currentTab.endpoint === "ItemAggregate";

      // Prepare the payload based on the endpoint type
      let payload: any;
      if (isItemAggregate) {
        payload = {
          ItemMaster: {
            ...submitData,
            groupId: submitData.groupName || submitData.groupId,
            userUpdated: user?.userId,
            dateUpdated: new Date().toISOString(),
            // Carry forward or set creation details
            userCreated: editItem
              ? submitData.userCreated || user?.userId
              : user?.userId,
            dateCreated: editItem
              ? submitData.dateCreated || new Date().toISOString()
              : new Date().toISOString(),
          },
        };
      } else {
        // Default payload for other simpler tabs (Category, Valuation, etc.)
        payload = {
          ...submitData,
          groupId: submitData.groupName || submitData.groupId,
          userUpdated: user?.userId,
          dateUpdated: new Date().toISOString(),
          userCreated: user?.userId,
          dateCreated: new Date().toISOString(),
        };
      }

      if (editItem) {
        // Update existing item
        await api.put(`${currentTab.endpoint}/${editItem.id}`, payload);
        toast.success(`${currentTab.label} updated successfully!`);
      } else {
        // Create new item
        await api.post(currentTab.endpoint, payload);
        toast.success(`${currentTab.label} created successfully!`);
      }

      setIsModalOpen(false);
      setEditItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Failed to save data. Please try again.");
    }
  };

  // Handle delete
  const handleDelete = async (id: string | number, title?: string) => {
    setDeleteId(id);
    setDeleteTitle(title || "");
    setConfirmOpen(true);
  };

  const confirmDelete = async (id: string | number) => {
    try {
      const currentTab = tabConfig.find((tab) => tab.key === activeTab);
      if (!currentTab) return;
      await api.delete(`${currentTab.endpoint}/${id}`);
      toast.success(`${currentTab.label} deleted successfully!`);
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
      toast.error("Failed to delete item.");
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
      setDeleteTitle("");
    }
  };

  // Handle CSV import/export
  const handleCSV = (action: "import" | "export") => {
    if (action === "export") {
      // Export logic would go here
      console.log("Exporting", activeTab, "data");
    } else {
      fileInputRef.current?.click();
    }
  };

  // On mount, open edit modal if ?id= is present in URL
  useEffect(() => {
    const idParam = searchParams.get("id");
    const modeParam = searchParams.get("mode");

    if (idParam && modeParam === "edit") {
      setModalType("ItemMaster");
      setEditItemId(idParam);
      setEditItem({ id: idParam, name: "" } as MasterDataItem);
      setIsModalOpen(true);
    }

    if (idParam && modeParam === "view") {
      setViewItemId(idParam);
      setIsViewModalOpen(true);
    }
  }, []);

  // Open modal for adding/editing
  const openModal = (type: string, item: MasterDataItem | null = null) => {
    setModalType(type);
    // If editing an item, fetch fresh data by id to populate form
    if (item) {
      // Update query param with the item id
      if (type === "ItemMaster") {
        setSearchParams({ id: String(item.id), mode: "edit" });
      }
      (async () => {
        try {
          const currentTab = tabConfig.find((tab) => tab.key === type);
          if (currentTab) {
            const res = await api.getById(currentTab.endpoint, item.id);
            // Item Master tab returns an aggregate; extract the itemMaster property for the form
            const payload =
              type === "ItemMaster" && res.data?.itemMaster
                ? res.data.itemMaster
                : res.data || item;

            console.log("Fetched item for editing:", payload);
            setEditItemId(item.id);
            setEditItem(payload as MasterDataItem);
            setFormData(payload as Record<string, any>);
          } else {
            setEditItem(item);
            setFormData(item || {});
          }
        } catch (err) {
          console.warn(
            "Failed to fetch item by id, falling back to provided item",
            err,
          );
          setEditItem(item);
          setFormData(item || {});
        } finally {
          setIsModalOpen(true);
        }
      })();
    } else {
      // Clear query param when opening add modal
      setSearchParams({});
      setEditItem(null);
      setFormData({});
      setIsModalOpen(true);
    }
  };

  const openViewModal = (item: MasterDataItem) => {
    setSearchParams({ id: String(item.id), mode: "view" });
    setViewItemId(item.id);
    setViewItem(item);
    setViewTab(activeTab);
    setIsViewModalOpen(true);
  };

  // Generic card component
  const GenericCard = ({
    item,
    onEdit,
    onDelete,
    children,
  }: {
    item: MasterDataItem;
    onEdit?: () => void;
    onDelete?: () => void;
    children?: React.ReactNode;
  }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg">{item.name || item.code}</h3>
        <div className="flex gap-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );

  // Handle toggling column visibility
  const toggleColumn = (columnId: string) => {
    setColumnSettings((prev) => {
      const newSettings = {
        ...prev,
        [columnId]: !prev[columnId],
      };
      console.log("Column toggled:", columnId, "New value:", !prev[columnId]);
      return newSettings;
    });
  };

  // Handle toggling all columns
  const toggleAllColumns = (visible: boolean) => {
    console.log(`Toggling all columns to: ${visible}`);
    const currentTab = tabConfig.find((t) => t.key === activeTab);
    if (currentTab) {
      const sourceColumns =
        currentTab.key === "ItemMaster"
          ? currentTab.tableColumns
          : currentTab.fields;

      if (sourceColumns) {
        const updatedSettings: Record<string, boolean> = {};
        sourceColumns.forEach((column) => {
          updatedSettings[column.id] = visible;
          console.log(`Setting column ${column.id} to ${visible}`);
        });
        console.log("Updated column settings:", updatedSettings);
        setColumnSettings(updatedSettings);
      }
    }
  };

  // Function to handle column sorting
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" | null = "ascending";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "ascending") {
        direction = "descending";
      } else if (sortConfig.direction === "descending") {
        direction = null;
      }
    }

    setSortConfig({ key, direction });
  };

  // Function to get sorting indicator icons
  const getSortIcon = (columnId: string) => {
    if (sortConfig.key !== columnId) {
      return (
        <span className="text-gray-300 ml-1">
          <FaSort />
        </span>
      );
    }

    return sortConfig.direction === "ascending" ? (
      <span className="text-white ml-1">
        <FaSortUp />
      </span>
    ) : (
      <span className="text-white ml-1">
        <FaSortDown />
      </span>
    );
  };

  // Render a single table for both Item Master and Product Variance
  const renderMasterTable = () => {
    // Merge ItemMaster, boms, and Product data for table rendering
    const items =
      activeTab === "ItemMaster"
        ? data.ItemMaster || []
        : activeTab === "boms"
          ? data.boms || []
          : activeTab === "Product"
            ? data.Product || []
            : [];

    const currentTab = tabConfig.find((t) => t.key === activeTab);

    // Filter items based on search term
    const filteredItems = searchTerm
      ? items.filter((item: any) => {
          // Convert item to string and check if it contains the search term
          return Object.values(item).some(
            (value) =>
              value !== null &&
              value !== undefined &&
              value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
          );
        })
      : items;

    // Apply sorting if configured
    const sortedItems = [...filteredItems];
    if (sortConfig.key && sortConfig.direction) {
      sortedItems.sort((a, b) => {
        // Handle serial number column specially
        if (sortConfig.key === "serialNumber") {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }

        // For other columns
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === bValue) return 0;

        // Handle null/undefined values
        if (aValue === null || aValue === undefined)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (bValue === null || bValue === undefined)
          return sortConfig.direction === "ascending" ? 1 : -1;

        // Compare based on type
        if (typeof aValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortConfig.direction === "ascending"
            ? aValue > bValue
              ? 1
              : -1
            : aValue < bValue
              ? 1
              : -1;
        }
      });
    }

    // Pagination state is managed at the component level with useState

    // Calculate pagination values
    const totalItems = sortedItems.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = sortedItems.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    // Generate page numbers for pagination controls
    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;

      let startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2),
      );
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    if (!items.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm">
          <svg
            className="w-14 h-14 mb-3 text-gray-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M7 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M5 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"
            />
          </svg>
          <span className="text-gray-400 text-lg font-semibold">
            No data available
          </span>
        </div>
      );
    }

    // Lookup maps for display
    const uomMap = Object.fromEntries(
      [...productVarianceUoms, ...(data.uoms || [])].map((u) => [u.id, u.code]),
    );
    const categoryMap = Object.fromEntries(
      (data.categories || []).map((c) => [c.id, c.name]),
    );
    const inventoryMethodMap = Object.fromEntries(
      (data.inventoryMethod || []).map((i) => [i.id, i.name]),
    );
    const valuationMap = Object.fromEntries(
      (data.valuation || []).map((v) => [v.id, v.name]),
    );

    const resolveValue = (field: any, item: any) => {
      const value = item[field.id];
      switch (field.id) {
        case "categoryId":
          return categoryMap[value] || value;
        case "uomId":
          return uomMap[value] || value;
        case "inventoryMethodId":
          return inventoryMethodMap[value] || value;
        case "valuationMethodId":
          return valuationMap[value] || value;
        case "isActive":
          return value ? (
            <span
              className="inline-block w-3 h-3 rounded-full bg-green-500"
              title="Active"
            ></span>
          ) : (
            <span
              className="inline-block w-3 h-3 rounded-full bg-red-400"
              title="Inactive"
            ></span>
          );
        case "dateCreated":
          return value ? new Date(value).toLocaleDateString() : "";
        case "name":
          return value || "";
        case "type":
          return Array.isArray(value) ? value.join(", ") : value;
        default:
          return Array.isArray(value) ? value.join(", ") : value;
      }
    };

    return (
      <div className="flex flex-col">
        {/* Search and Column Management */}
        <div className="mb-4 flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Column Manager Button */}
          <div className="relative" ref={columnManagerRef}>
            <button
              onClick={() => setShowColumnManager(!showColumnManager)}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
              title="Manage Columns"
            >
              <FaCog size={16} /> Columns
            </button>

            {/* Column Manager Dropdown */}
            {showColumnManager && currentTab?.fields && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-30">
                <div className="p-3 border-b border-gray-200">
                  <div className="font-semibold text-gray-700 mb-2">
                    Manage Columns
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => toggleAllColumns(true)}
                      className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <FaCheck size={10} /> Show All
                    </button>
                    <button
                      onClick={() => toggleAllColumns(false)}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <FaTimes size={10} /> Hide All
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {(currentTab?.key === "ItemMaster"
                      ? currentTab?.tableColumns
                      : currentTab?.fields
                    )?.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex items-center justify-center w-5 h-5 border rounded cursor-pointer transition-colors ${
                              columnSettings[field.id]
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-white hover:bg-gray-100"
                            }`}
                            onClick={() => toggleColumn(field.id)}
                          >
                            {columnSettings[field.id] && (
                              <FaCheck size={12} className="text-blue-500" />
                            )}
                          </div>
                          <span
                            className="text-sm text-gray-700 cursor-pointer"
                            onClick={() => toggleColumn(field.id)}
                          >
                            {field.name}
                          </span>
                        </div>
                        <div
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={() => toggleColumn(field.id)}
                        >
                          {columnSettings[field.id] ? (
                            <FaEye className="text-blue-500" size={16} />
                          ) : (
                            <FaEyeSlash className="text-gray-400" size={16} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="sticky top-0 bg-blue-600">
              <tr className="text-xs">
                <th
                  className="px-3 py-2  text-center text-white w-12 cursor-pointer"
                  onClick={() => requestSort("serialNumber")}
                >
                  S.No{" "}
                  {sortConfig.key === "serialNumber" &&
                    getSortIcon("serialNumber")}
                </th>
                {(currentTab?.key === "ItemMaster"
                  ? currentTab?.tableColumns
                  : currentTab?.key === "Product"
                    ? currentTab?.fields
                    : currentTab?.fields
                )
                  ?.filter((field: any) => {
                    const isVisible = columnSettings[field.id];
                    console.log(`Column ${field.id} visibility:`, isVisible);
                    return isVisible;
                  })
                  .map((field: any) => (
                    <th
                      key={field.id}
                      className="px-3 py-2  text-white cursor-pointer"
                      onClick={() => requestSort(field.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{field.name}</span>
                        {getSortIcon(field.id)}
                      </div>
                    </th>
                  ))}
                <th className="px-3 py-2  text-center bg-blue-600 text-white sticky right-0 z-10 ">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentItems.map((item: any, index: number) => (
                <tr key={item.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-3 py-2 border text-center">
                    {startIndex + index + 1}
                  </td>
                  {(currentTab?.key === "ItemMaster"
                    ? currentTab?.tableColumns
                    : currentTab?.key === "Product"
                      ? currentTab?.fields
                      : currentTab?.fields
                  )
                    ?.filter((field: any) => {
                      const isVisible = columnSettings[field.id];
                      console.log(
                        `Body column ${field.id} visibility:`,
                        isVisible,
                      );
                      return isVisible;
                    })
                    .map((field: any) => (
                      <td key={field.id} className="px-3 py-2 border">
                        {resolveValue(field, item)}
                      </td>
                    ))}
                  <td className="px-3 py-2 border sticky right-0 z-10 bg-white">
                    <div className="flex justify-center items-center gap-2 min-h-[32px] ">
                      <button
                        onClick={() => openViewModal(item)}
                        className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="View"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal(activeTab, item)}
                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(item.id, item.itemName || item.name)
                        }
                        className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} entries
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>

            {/* Items per page selector (optional) */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newPageSize = Number(e.target.value);
                  console.log("Changing items per page to:", newPageSize);
                  setItemsPerPage(newPageSize);
                  setCurrentPage(1); // Reset to first page when changing items per page
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render content based on active tab
  const renderTabContent = () => {
    if (
      activeTab === "boms" ||
      activeTab === "ItemMaster" ||
      activeTab === "Product"
    ) {
      return renderMasterTable();
    }
    const currentData = data[activeTab] || [];
    if (!currentData.length) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm">
          <svg
            className="w-14 h-14 mb-3 text-gray-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M7 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M5 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"
            />
          </svg>
          <span className="text-gray-400 text-lg font-semibold">
            No data available
          </span>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentData.map((item) => (
          <GenericCard
            key={item.id}
            item={item}
            onEdit={() => openModal(activeTab, item)}
            onDelete={() => handleDelete(item.id, item.name || item.code)}
          >
            {item.description && (
              <p className="text-gray-600 text-sm mt-2">{item.description}</p>
            )}
          </GenericCard>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".csv"
        onChange={handleFileUpload}
      />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {tabConfig.find((tab) => tab.key === activeTab)?.label ||
                "Item Master Data"}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={triggerFileUpload}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Import className="w-4 h-4" />
                  Import CSV
                </button>
                {uploadError && (
                  <div className="text-red-500 text-sm mt-1">{uploadError}</div>
                )}
                <a
                  href="/item_master_template.csv"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Export className="w-4 h-4" />
                  Download Template
                </a>
                {/* <button
                  onClick={() => handleCSV("export")}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Export className="w-4 h-4" />
                  Export CSV
                </button> */}
              </div>
              <button
                onClick={() => openModal(activeTab)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
          </div>

          {/* Tab navigation removed - each tab will be shown on a separate page */}
        </div>

        <div className="p-6 overflow-auto">{renderTabContent()}</div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditItem(null);
            setFormData({});
            setSearchParams({});
          }}
          title={`${editItem ? "Edit" : "Add"} ${
            tabConfig.find((tab) => tab.key === modalType)?.label
          }`}
        >
          <div className="m-2 p-4">
            {modalType === "ItemMaster" ? (
              // Render the full ItemMaster component inside the modal
              <ItemMasterForm
                editItemId={editItem ? (editItemId ?? editItem.id) : null}
                onSaved={(savedId) => {
                  // Close modal and refresh data when ItemMaster saves
                  console.log("ItemMaster saved id:", savedId);
                  setIsModalOpen(false);
                  setEditItem(null);
                  setFormData({});
                  fetchData();
                }}
              />
            ) : (
              <div className="flex">
                <DynamicForm
                  fields={
                    tabConfig.find((tab) => tab.key === modalType)?.fields || []
                  }
                  data={formData}
                  columns={
                    (tabConfig.find((tab) => tab.key === modalType)?.columns as
                      | 1
                      | 2
                      | 3
                      | undefined) || 1
                  }
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                  submitLabel={editItem ? "Update" : "Create"}
                  onCancel={() => {
                    setIsModalOpen(false);
                    setEditItem(null);
                    setFormData({});
                  }}
                  cancelLabel="Cancel"
                />
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {isViewModalOpen && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewItemId(null);
            setViewItem(null);
            setViewTab("");
            setSearchParams({});
          }}
          title={
            viewTab === "boms" ? "VIEW PRODUCT VARIANT" : "VIEW ITEM MASTER"
          }
        >
          <div className="m-2 p-4">
            {viewTab === "boms" && viewItem ? (
              <div className="space-y-5 min-w-[340px]">
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Name
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 font-medium">
                      {viewItem.name || (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Type
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg min-h-[40px] flex flex-wrap gap-1.5 items-center">
                      {Array.isArray(viewItem.type) &&
                      viewItem.type.length > 0 ? (
                        viewItem.type.map((t: string, i: number) => (
                          <span
                            key={i}
                            className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {t}
                          </span>
                        ))
                      ) : typeof viewItem.type === "string" && viewItem.type ? (
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          {viewItem.type}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">&mdash;</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Date Created
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                      {viewItem.dateCreated ? (
                        new Date(viewItem.dateCreated).toLocaleDateString(
                          undefined,
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      ) : (
                        <span className="text-gray-400">&mdash;</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-1 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      setViewItemId(null);
                      setViewItem(null);
                      setViewTab("");
                      setSearchParams({});
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <ItemMasterForm
                editItemId={viewItemId}
                readOnly={true}
                onSaved={() => {
                  setIsViewModalOpen(false);
                  setViewItemId(null);
                  setViewItem(null);
                  setViewTab("");
                  setSearchParams({});
                }}
              />
            )}
          </div>
        </Modal>
      )}

      {/* ConfirmBox for delete confirmation */}
      <ConfirmBox
        title={deleteTitle}
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onDelete={confirmDelete}
        id={deleteId || ""}
      />
    </div>
  );
}
