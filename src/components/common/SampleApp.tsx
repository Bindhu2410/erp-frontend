import React, { useState, useRef } from "react";
import SimpleTable from "../common/SimpleTable";
import SearchDropdown from "../common/SearchDropdown";

// Types
interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "number"
    | "select"
    | "textarea"
    | "file"
    | "checkbox"
    | "date";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
  url?: string;
  disabled?: boolean;
  searchable?: boolean;
}

interface TableColumn<T> {
  Header: string;
  accessor: keyof T;
  type?: "text" | "dropdown" | "display" | "number" | "date";
  options?:
    | { value: string; label: string }[]
    | ((row: T) => { value: string; label: string }[]);
  autoFillMap?: Record<string, Partial<T>>;
  required?: boolean;
}

interface TabConfig {
  id: string;
  label: string;
  type: "form" | "table";
  fields?: FormField[];
  tableConfig?: {
    columns: TableColumn<any>[];
    data: any[];
  };
}

interface DynamicFormTabsProps {
  formConfig: {
    fields: FormField[];
  };
  tabsConfig: TabConfig[];
  onFormSubmit: (formData: any) => void;
  onTableDataChange?: (tabId: string, data: any[]) => void;
  onFormDataChange?: (formData: Record<string, any>) => void;
  onFieldValueChange?: (fieldId: string, value: string) => void;
  selectedValues?: { [key: string]: string };
  vendors?: any[];
  readOnly?: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const DynamicFormWithTabs: React.FC<DynamicFormTabsProps> = ({
  formConfig,
  tabsConfig,
  onFormSubmit,
  onTableDataChange,
  onFormDataChange,
  onFieldValueChange,
  selectedValues = {},
  vendors = [],
  readOnly = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<string>(tabsConfig[0]?.id || "");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  console.log("DynamicFormWithTabs: Initializing component", selectedValues);
  // State to manage table data for each tab
  const [tableData, setTableData] = useState<Record<string, any[]>>(() => {
    const initialData: Record<string, any[]> = {};
    tabsConfig.forEach((tab) => {
      if (tab.type === "table" && tab.tableConfig) {
        const data = tab.tableConfig.data || [];
        if (!data || data.length === 0) {
          // create one empty row based on columns
          const emptyRow: Record<string, any> = {};
          tab.tableConfig.columns.forEach((col) => {
            if (col.type === "number") emptyRow[String(col.accessor)] = 0;
            else emptyRow[String(col.accessor)] = "";
          });
          initialData[tab.id] = [emptyRow];
        } else {
          initialData[tab.id] = data;
        }
      }
    });
    return initialData;
  });

  // When parent provides selectedValues (edit mode), merge them into internal formData
  React.useEffect(() => {
    console.log(
      "DynamicFormWithTabs: selectedValues prop changed:",
      selectedValues
    );
    if (!selectedValues || Object.keys(selectedValues).length === 0) return;
    // Normalize simple scalar values to strings where appropriate to help selects bind
    const normalized: Record<string, any> = {};
    // First copy raw keys (stringified)
    Object.keys(selectedValues).forEach((k) => {
      const v = selectedValues[k];
      normalized[k] = v === null || v === undefined ? v : String(v);
    });

    // Also try to map incoming keys to known form field ids (case-insensitive)
    const stripId = (s: string) => s.replace(/id$/i, "").toLowerCase();
    formConfig.fields.forEach((field) => {
      const fid = field.id;
      // If already provided, prefer existing normalized value
      if (normalized[fid] !== undefined) return;

      // Try to find a matching key in selectedValues ignoring case or differing 'Id' suffix
      const keys = Object.keys(selectedValues || {});
      const matchKey = keys.find((k) => {
        if (k.toLowerCase() === fid.toLowerCase()) return true;
        if (k.toLowerCase() === (fid + "Id").toLowerCase()) return true;
        if (k.toLowerCase() === (fid + "Name").toLowerCase()) return true;
        if (stripId(k) === stripId(fid)) return true;
        return false;
      });

      if (matchKey) {
        const v = (selectedValues as any)[matchKey];
        normalized[fid] = v === null || v === undefined ? v : String(v);
      }
    });

    // Merge into formData so inputs/selects bind
    setFormData((prev) => ({ ...prev, ...normalized }));
  }, [selectedValues]);

  // When formConfig (which includes select options) changes, ensure select values map to option values.
  // This handles the case where selectedValues arrive before options are loaded: try to map by id or by label.
  React.useEffect(() => {
    if (!formConfig || !formConfig.fields) return;

    const keys = Object.keys(selectedValues || {});
    const stripId = (s: string) => s.replace(/id$/i, "").toLowerCase();

    let updated = false;
    const newFormData = { ...formData };

    formConfig.fields.forEach((field) => {
      if (field.type !== "select") return;

      // Try to find matching selectedValues key (exact, Id-suffix, or stripped)
      const matchKey = keys.find((k) => {
        if (k.toLowerCase() === field.id.toLowerCase()) return true;
        if (k.toLowerCase() === (field.id + "Id").toLowerCase()) return true;
        if (k.toLowerCase() === (field.id + "Name").toLowerCase()) return true;
        if (stripId(k) === stripId(field.id)) return true;
        return false;
      });

      if (!matchKey) return;

      const candidate = (selectedValues as any)[matchKey];
      if (candidate === undefined || candidate === null || candidate === "") return;

      const opts = (field.options || []).map((o) => ({
        label: String(o.label || ""),
        value: String(o.value || ""),
      }));

      // If no options loaded yet, store the candidate value directly
      if (opts.length === 0) {
        newFormData[field.id] = String(candidate);
        updated = true;
        return;
      }

      // If candidate matches an option.value directly (as number or string), pick that value
      const candidateValue = String(candidate);
      const direct = opts.find((o) => o.value === candidateValue);
      if (direct) {
        newFormData[field.id] = direct.value;
        updated = true;
        return;
      }

      // Otherwise, try to match by label (case-insensitive)
      const byLabel = opts.find(
        (o) => o.label.toLowerCase() === String(candidate).toLowerCase()
      );
      if (byLabel) {
        newFormData[field.id] = byLabel.value;
        updated = true;
        return;
      }
      
      // If no match found but we have a value, store it directly
      // This handles cases where the API returns values not in the dropdown
      if (candidateValue) {
        newFormData[field.id] = candidateValue;
        updated = true;
      }
    });

    if (updated) {
      console.log(
        "DynamicFormWithTabs: syncing select values with loaded options:",
        newFormData
      );
      setFormData(newFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formConfig, selectedValues]);

  // When tabsConfig changes (for example, parent loaded initial tab data for edit),
  // ensure tableData is synchronized for any tabs that provide explicit data.
  React.useEffect(() => {
    console.log(
      "DynamicFormWithTabs: tabsConfig prop changed. tabsConfig:",
      tabsConfig
    );
    console.log(
      "DynamicFormWithTabs: current tableData before sync:",
      tableData
    );
    const newTableData: Record<string, any[]> = { ...tableData };
    let changed = false;

    tabsConfig.forEach((tab) => {
      if (tab.type === "table" && tab.tableConfig) {
        const incoming = tab.tableConfig.data || [];
        // If incoming has data and current stored data is empty or different, adopt it
        if (incoming && incoming.length > 0) {
          const current = newTableData[tab.id] || [];
          // Simple length-based sync: if current is empty or was the default empty row, replace it
          const currentEmpty =
            current.length === 0 ||
            (current.length === 1 &&
              Object.values(current[0]).every((v) => v === "" || v === 0));
          if (currentEmpty || current.length !== incoming.length) {
            // Normalize incoming rows: dropdown/select cells should be strings so selects bind correctly
            const cols = tab.tableConfig!.columns || [];
            newTableData[tab.id] = incoming.map((r: any) => {
              const out: Record<string, any> = { ...r };
              cols.forEach((c: any) => {
                const key = String(c.accessor);
                if (c.type === "dropdown") {
                  out[key] =
                    out[key] === null || out[key] === undefined
                      ? ""
                      : String(out[key]);
                } else if (c.type === "number") {
                  out[key] =
                    out[key] === null || out[key] === undefined
                      ? 0
                      : Number(out[key]);
                }
              });
              return out;
            });
            changed = true;
          }
        }
      }
    });

    if (changed) {
      console.log(
        "DynamicFormWithTabs: adopting incoming table data for edit:",
        newTableData
      );
      setTableData(newTableData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabsConfig]);

  const fieldRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced vendor auto-fill in supplier tab - BIDIRECTIONAL with force update
  const handleVendorAutoFill = (
    tabId: string,
    rowIndex: number,
    accessor: string,
    value: any
  ) => {
    if (tabId !== "supplier" || vendors.length === 0) return;

    // Value can be vendor id (string/number), vendorName or vendorCode.
    let vendor: any = undefined;

    if (accessor === "supplier") {
      // If supplier dropdown stores id strings (common), try by id first
      if (value !== undefined && value !== null && value !== "") {
        const numericId = Number(value);
        if (!isNaN(numericId) && numericId !== 0) {
          vendor = vendors.find((v) => Number(v.id) === numericId);
        }
      }

      // If not found by id, try by name or code
      if (!vendor) {
        vendor = vendors.find(
          (v) => v.vendorName === value || v.vendorCode === value
        );
      }

      if (vendor) {
        const updates: Record<string, any> = {};
        // Ensure supplier cell stores vendor id (string) so dropdown syncs
        updates.supplier = String(vendor.id);
        // Fill code column with vendorCode (or N/A if missing)
        updates.code =
          vendor.vendorCode && vendor.vendorCode.trim() !== ""
            ? vendor.vendorCode
            : "N/A";

        if (vendor.address || vendor.city || vendor.state) {
          updates.description = `Vendor: ${vendor.vendorName}${
            vendor.address ? ` - ${vendor.address}` : ""
          }${vendor.city ? `, ${vendor.city}` : ""}${
            vendor.state ? `, ${vendor.state}` : ""
          }`;
        }

        const newData = [...tableData[tabId]];
        newData[rowIndex] = {
          ...newData[rowIndex],
          ...updates,
        };

        setTableData((prev) => ({ ...prev, [tabId]: newData }));
        onTableDataChange?.(tabId, newData);
        console.log("Auto-filled vendor data from supplier selection:", {
          vendor,
          updates,
        });
      }
    } else if (accessor === "code") {
      // When code selected, value is vendorCode (string)
      vendor = vendors.find((v) => v.vendorCode === value);

      if (vendor) {
        const updates: Record<string, any> = {};
        // Supplier cell should store vendor id string so the supplier dropdown shows the correct label
        updates.supplier = String(vendor.id);
        updates.code = vendor.vendorCode;

        if (vendor.address || vendor.city || vendor.state) {
          updates.description = `Vendor: ${vendor.vendorName}${
            vendor.address ? ` - ${vendor.address}` : ""
          }${vendor.city ? `, ${vendor.city}` : ""}${
            vendor.state ? `, ${vendor.state}` : ""
          }`;
        }

        const newData = [...tableData[tabId]];
        newData[rowIndex] = {
          ...newData[rowIndex],
          ...updates,
        };

        setTableData((prev) => ({ ...prev, [tabId]: newData }));
        onTableDataChange?.(tabId, newData);
        console.log("Auto-filled vendor data from code selection:", {
          vendor,
          updates,
        });
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (fieldId: string, value: any) => {
    const newFormData = {
      ...formData,
      [fieldId]: value,
    };

    setFormData(newFormData);

    // Send real-time update to parent
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    // Send field value change to parent for filtering (only for string values)
    if (
      onFieldValueChange &&
      (typeof value === "string" || typeof value === "number")
    ) {
      onFieldValueChange(fieldId, String(value));
    }

    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Enhanced table data change handler
  const handleTableDataChange = (tabId: string, newData: any[]) => {
    console.log(`Table ${tabId} data changed:`, newData);

    // Ensure at least one empty row is present when a tab's table becomes empty
    let adjustedData = newData;
    if ((!adjustedData || adjustedData.length === 0) && tabsConfig) {
      const tab = tabsConfig.find((t) => t.id === tabId && t.tableConfig);
      if (tab && tab.tableConfig) {
        const emptyRow: Record<string, any> = {};
        tab.tableConfig.columns.forEach((col) => {
          if (col.type === "number") emptyRow[String(col.accessor)] = 0;
          else emptyRow[String(col.accessor)] = "";
        });
        adjustedData = [emptyRow];
      }
    }

    setTableData((prev) => ({ ...prev, [tabId]: adjustedData }));

    // Always notify parent component of table data changes
    onTableDataChange?.(tabId, adjustedData);
  };

  // Enhanced table handlers with immediate auto-fill
  const createTableHandlers = (tabId: string) => {
    const handleCellChangeForTab = (
      rowIndex: number,
      accessor: any,
      value: any
    ) => {
      const newData = [...tableData[tabId]];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [accessor]: value,
      };

      // If editing locationStock and rack/self/column changed, update itemInPlace
      if (tabId === "locationStock") {
        const tmp = { ...newData[rowIndex] };
        const rackVal = tmp["rack"] || "";
        const selfVal = tmp["self"] || tmp["shelf"] || "";
        const colVal = tmp["column"] || "";
        const parts: string[] = [];
        if (rackVal !== undefined && String(rackVal).trim() !== "")
          parts.push(String(rackVal).trim());
        if (selfVal !== undefined && String(selfVal).trim() !== "")
          parts.push(String(selfVal).trim());
        if (colVal !== undefined && String(colVal).trim() !== "")
          parts.push(String(colVal).trim());
        if (parts.length > 0) {
          newData[rowIndex] = {
            ...newData[rowIndex],
            itemInPlace: parts.join(":"),
          };
        }
      }

      // Update table data first
      handleTableDataChange(tabId, newData);

      // Check if this change should trigger vendor auto-fill
      if (
        (accessor === "supplier" || accessor === "code") &&
        value &&
        tabId === "supplier"
      ) {
        // Immediate auto-fill
        handleVendorAutoFill(tabId, rowIndex, accessor, value);
      }
    };

    const handleDropdownChangeForTab = (
      rowIndex: number,
      accessor: any,
      value: any
    ) => {
      handleCellChangeForTab(rowIndex, accessor, value);
    };

    return {
      handleCellChange: handleCellChangeForTab,
      handleDropdownChange: handleDropdownChangeForTab,
    };
  };

  // Function to add new row to specific tab
  const handleAddNewRow = (tabId: string) => {
    const tab = tabsConfig.find((t) => t.id === tabId);
    if (tab?.type === "table" && tab.tableConfig) {
      const newRow: any = {};
      tab.tableConfig.columns.forEach((column) => {
        switch (column.type) {
          case "number":
            newRow[column.accessor] = 0;
            break;
          case "dropdown":
            newRow[column.accessor] = "";
            break;
          default:
            newRow[column.accessor] = "";
        }
      });

      const currentData = tableData[tabId] || [];
      const newData = [...currentData, newRow];
      handleTableDataChange(tabId, newData);
    }
  };

  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      setProductImage(files[0]);
    }
    setIsDragOver(false);
  };

  // Handle file input change
  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleFileUpload(event.target.files);
    if (event.target) {
      event.target.value = "";
    }
  };

  // Handle click on image area to upload
  const handleImageAreaClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  // Remove uploaded image
  const removeImage = () => {
    setProductImage(null);
  };

  // Validate all form fields and tables
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate main form fields (treat whitespace-only as empty)
    formConfig.fields.forEach((field) => {
      // Check both formData and selectedValues for the field value
      const val =
        formData[field.id] !== undefined
          ? formData[field.id]
          : selectedValues && selectedValues[field.id] !== undefined
          ? selectedValues[field.id]
          : undefined;
      
      const isEmpty =
        val === undefined ||
        val === null ||
        (typeof val === "string" && val.trim() === "") ||
        (typeof val !== "string" && String(val) === "");

      if (field.required && isEmpty) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });

    // Validate tab form fields
    tabsConfig.forEach((tab) => {
      if (tab.type === "form" && tab.fields) {
        tab.fields.forEach((field) => {
          // Check both formData and selectedValues for the field value
          const val =
            formData[field.id] !== undefined
              ? formData[field.id]
              : selectedValues && selectedValues[field.id] !== undefined
              ? selectedValues[field.id]
              : undefined;
          
          const isEmpty =
            val === undefined ||
            val === null ||
            (typeof val === "string" && val.trim() === "") ||
            (typeof val !== "string" && String(val) === "");

          if (field.required && isEmpty) {
            newErrors[field.id] = `${field.label} is required`;
          }
        });
      }

      // Validate table fields
      if (tab.type === "table" && tab.tableConfig) {
        const tabData = tableData[tab.id] || [];
        tabData.forEach((row, rowIndex) => {
          tab.tableConfig!.columns.forEach((column) => {
            if (column.required) {
              const fieldId = `table-${rowIndex}-${String(column.accessor)}`;
              const value = row[column.accessor];
              const isEmpty =
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "") ||
                (typeof value !== "string" && String(value) === "");

              if (isEmpty) {
                newErrors[fieldId] = `${column.Header} is required`;
              }
            }
          });
        });
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Lightweight validity check without setting errors (used to enable/disable Save button)
  const checkValidity = (): boolean => {
    // Check main form required fields
    for (const field of formConfig.fields) {
      if (field.required) {
        const val =
          selectedValues && selectedValues[field.id] !== undefined
            ? selectedValues[field.id]
            : formData[field.id];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "") ||
          (typeof val !== "string" && String(val) === "");
        if (isEmpty) {
          return false;
        }
      }
    }

    // Check tab form required fields
    for (const tab of tabsConfig) {
      if (tab.type === "form" && tab.fields) {
        for (const field of tab.fields) {
          if (field.required) {
            const val =
              selectedValues && selectedValues[field.id] !== undefined
                ? selectedValues[field.id]
                : formData[field.id];
            const isEmpty =
              val === undefined ||
              val === null ||
              (typeof val === "string" && val.trim() === "") ||
              (typeof val !== "string" && String(val) === "");
            if (isEmpty) {
              return false;
            }
          }
        }
      }

      // Check table required columns
      if (tab.type === "table" && tab.tableConfig) {
        const tabRows = tableData[tab.id] || [];
        for (const row of tabRows) {
          for (const column of tab.tableConfig.columns) {
            if (column.required) {
              const val = row[String(column.accessor)];
              const isEmpty =
                val === undefined ||
                val === null ||
                (typeof val === "string" && val.trim() === "") ||
                (typeof val !== "string" && String(val) === "");
              if (isEmpty) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  // Keep live validity in sync with form/table data
  React.useEffect(() => {
    setIsFormValid(checkValidity());
  }, [formData, tableData, formConfig, tabsConfig, selectedValues]);

  // Snapshot binding values for debugging: map each form field to its effective value
  React.useEffect(() => {
    const snapshot: Record<string, any> = {};
    formConfig.fields.forEach((f) => {
      const val =
        formData[f.id] !== undefined
          ? formData[f.id]
          : selectedValues && selectedValues[f.id] !== undefined
          ? selectedValues[f.id]
          : "";
      snapshot[f.id] = val;
    });
    console.log(
      "DynamicFormWithTabs: binding snapshot (field -> value):",
      snapshot
    );
  }, [formConfig, formData, selectedValues]);

  // Focus to next field with error
  const focusToNextError = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const element = fieldRefs.current[firstErrorField];

      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Handle field focus for error management
  const handleFieldFocus = (fieldId: string) => {
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Render form fields
  const renderFormField = (field: FormField) => {
    const error = errors[field.id];

    // Use value from parent's selectedValues to keep dropdowns in sync
    // Prefer the renderer's merged formData (which we populate from selectedValues)
    // falling back to the selectedValues prop when needed.
    const fieldValue =
      formData[field.id] !== undefined
        ? formData[field.id]
        : selectedValues && selectedValues[field.id] !== undefined
        ? selectedValues[field.id]
        : "";

    const inputClass = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
      error
        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 hover:border-gray-400 focus:border-blue-500"
    } ${field.className || ""}`;

    const commonProps = {
      id: field.id,
      name: field.id,
      required: field.required,
      placeholder: field.placeholder,
      value: fieldValue,
      disabled: Boolean(field.disabled),
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => handleInputChange(field.id, e.target.value),
      onFocus: () => handleFieldFocus(field.id),
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        // Show required error when focus leaves field
        if (field.required) {
          const currentVal = e.target.value;
          const isEmpty = currentVal === undefined || currentVal === null || currentVal.trim() === "";
          if (isEmpty) {
            setErrors((prev) => ({
              ...prev,
              [field.id]: `${field.label} is required`,
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[field.id];
              return newErrors;
            });
          }
        }
      },
      className: inputClass,
      ref: (el: HTMLElement | null) => {
        fieldRefs.current[field.id] = el;
      },
    };

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <div className="relative">
            {field.type === "number" ? (
              <input {...commonProps} type="number" step="any" />
            ) : (
              <input {...commonProps} type={field.type} />
            )}
            {error && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="relative">
            <textarea
              {...commonProps}
              rows={3}
              className={`${inputClass} resize-vertical min-h-[80px]`}
            />
            {error && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        );

      case "select": {
        // Ensure the current value is included in options if not already present
        let selectOptions = field.options || [];
        if (fieldValue && fieldValue !== "") {
          const hasOption = selectOptions.some(opt => opt.value === fieldValue || opt.label === fieldValue);
          if (!hasOption) {
            selectOptions = [
              { value: fieldValue, label: fieldValue },
              ...selectOptions
            ];
          }
        }

        // Use SearchDropdown when field is marked as searchable
        if (field.searchable) {
          return (
            <SearchDropdown
              id={field.id}
              options={selectOptions}
              value={fieldValue || ""}
              onChange={(val) => handleInputChange(field.id, val)}
              placeholder="Select an option"
              disabled={Boolean(field.disabled)}
              error={error}
            />
          );
        }

        return (
          <div className="relative">
            <select
              {...commonProps}
              className={`${inputClass} appearance-none bg-white`}
            >
              <option value="" className="hidden">
                Select an option
              </option>
              {selectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            {error && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                <svg
                  className="w-3 h-3 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>
        );
      }

      case "checkbox":
        return (
          <div className="relative flex items-start gap-2">
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                checked={
                  formData[field.id] !== undefined
                    ? Boolean(formData[field.id])
                    : selectedValues && selectedValues[field.id] !== undefined
                    ? Boolean(selectedValues[field.id])
                    : false
                }
                onChange={(e) => handleInputChange(field.id, e.target.checked)}
                onFocus={() => handleFieldFocus(field.id)}
                disabled={Boolean(field.disabled)}
                className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 ${field.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
                ref={(el: HTMLInputElement | null) => {
                  fieldRefs.current[field.id] = el;
                }}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor={field.id}
                className="text-sm font-medium text-gray-800"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {error && (
                <div className="text-red-600 text-xs mt-1 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
                  <svg
                    className="w-3 h-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render tab content
  const renderTabContent = (tab: TabConfig) => {
    switch (tab.type) {
      case "form":
        // Special layout for UOM tab: show Primary UOM separately, then Buying/Consumption and conversions
        if (tab.id === "uom") {
          const primary = tab.fields?.find((f) => f.id === "PrimaryUOM");
          const buying = tab.fields?.find((f) => f.id === "buyingUOM");

          const conv1 = tab.fields?.find(
            (f) => f.id === "conversiontoPrimaryUOM"
          );
          const consumption = tab.fields?.find(
            (f) => f.id === "consumptionUOM"
          );
          const conv2 = tab.fields?.find(
            (f) => f.id === "conversiontoPrimaryUOM2"
          );

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {primary && (
                <div className="md:col-span-2 space-y-2">
                  <label
                    htmlFor={primary.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {primary.label}
                    {primary.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFormField(primary)}
                </div>
              )}

              {buying && (
                <div className="space-y-2">
                  <label
                    htmlFor={buying.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {buying.label}
                    {buying.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFormField(buying)}
                </div>
              )}

              {conv1 && (
                <div className="space-y-2">
                  <label
                    htmlFor={conv1.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {conv1.label}
                    {conv1.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFormField(conv1)}
                </div>
              )}

              {consumption && (
                <div className="space-y-2">
                  <label
                    htmlFor={consumption.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {consumption.label}
                    {consumption.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFormField(consumption)}
                </div>
              )}

              {conv2 && (
                <div className="space-y-2">
                  <label
                    htmlFor={conv2.id}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {conv2.label}
                    {conv2.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderFormField(conv2)}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tab.fields?.map((field) => (
              <div
                key={field.id}
                className={`space-y-2 ${
                  field.type === "textarea" ? "md:col-span-2" : ""
                }`}
              >
                <label
                  htmlFor={field.id}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {renderFormField(field)}
              </div>
            ))}
          </div>
        );

      case "table":
        if (tab.tableConfig) {
          const { handleCellChange, handleDropdownChange } =
            createTableHandlers(tab.id);

          return (
            <div className="space-y-4">
              <div className="flex justify-end">
                {!readOnly && (
                  <button
                    onClick={() => handleAddNewRow(tab.id)}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Row
                  </button>
                )}
              </div>

              <SimpleTable
                columns={tab.tableConfig.columns}
                data={tableData[tab.id] || []}
                onDataChange={(newData) =>
                  handleTableDataChange(tab.id, newData)
                }
                onCellChange={handleCellChange}
                onDropdownChange={handleDropdownChange}
              />
            </div>
          );
        }
        return null;

      default:
        return null;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm();

    if (!isValid) {
      setTimeout(() => {
        focusToNextError();
      }, 100);
      setIsSubmitting(false);
      return;
    }

    try {
      const submissionData = {
        formData: formData,
        productImage: productImage,
        tabsData: tableData,
      };

      await onFormSubmit(submissionData);

      // Reset form on success
      setFormData({});
      setProductImage(null);
      setErrors({});
      const resetTableData: Record<string, any[]> = {};
      tabsConfig.forEach((tab) => {
        if (tab.type === "table" && tab.tableConfig) {
          resetTableData[tab.id] = tab.tableConfig.data || [];
        }
      });
      setTableData(resetTableData);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get fields for the right side (horizontal, vertical, and checkbox)
  const rightSideFields = formConfig.fields.filter(
    (field) =>
      field.id.includes("horizontal") ||
      field.id.includes("vertical") ||
      field.type === "checkbox"
  );

  // Get remaining fields for the main grid
  const gridFields = formConfig.fields.filter(
    (field) => !rightSideFields.includes(field)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} noValidate>
          {/* Main Form Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <h1 className="text-2xl font-bold text-white">Product Master</h1>
              <p className="text-blue-100 mt-1">
                Create and manage your product information
              </p>
            </div>

            <div className="p-8">
              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                ref={fileInputRef}
                className="hidden"
              />

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Left Side - Main Grid Fields (3/4 width) */}
                <div className="xl:col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {gridFields.map((field) => (
                      <div
                        key={field.id}
                        className={`space-y-2 ${
                          field.type === "textarea" || field.type === "checkbox"
                            ? "md:col-span-2 lg:col-span-3"
                            : ""
                        }`}
                      >
                        {field.type !== "checkbox" && (
                          <label
                            htmlFor={field.id}
                            className="block text-sm font-semibold text-gray-700"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                        )}
                        {renderFormField(field)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Product Image with 3 Fields (1/4 width) */}
                <div className="xl:col-span-1">
                  <div className="space-y-6">
                    {/* Product Image Section */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        Product Image
                      </h3>

                      {/* Image Upload Area */}
                      <div
                        className={`relative rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group ${
                          isDragOver
                            ? "border-blue-500 bg-blue-50 scale-105"
                            : productImage
                            ? "border-gray-300 bg-white"
                            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                        }`}
                        onClick={handleImageAreaClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {productImage ? (
                          <div className="relative">
                            <img
                              src={URL.createObjectURL(productImage)}
                              alt="Product"
                              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <div className="bg-white rounded-full p-2 shadow-lg transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <svg
                                  className="w-4 h-4 text-gray-700"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage();
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md transform scale-0 group-hover:scale-100 transition-transform duration-200"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-6 cursor-pointer">
                            <div className="mx-auto w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2 group-hover:bg-gray-300 transition-colors">
                              <svg
                                className="w-5 h-5 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Upload Image
                            </p>
                            <p className="text-xs text-gray-500">
                              Click or drag & drop
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Image Info */}
                      {productImage && (
                        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-xs font-medium text-blue-800">
                                Image uploaded
                              </span>
                            </div>
                            <span className="text-xs text-blue-600">
                              {(productImage.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Three Input Boxes in a Row */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-800">
                        Dimensions & Options
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        {rightSideFields.map((field) => (
                          <div key={field.id} className="space-y-2">
                            {field.type !== "checkbox" && (
                              <label
                                htmlFor={field.id}
                                className="block text-sm font-medium text-gray-700"
                              >
                                {field.label}
                                {field.required && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                            )}
                            {renderFormField(field)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200 bg-gray-50">
              <nav className="flex space-x-8 px-8">
                {tabsConfig.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {tabsConfig.map((tab) => (
                <div
                  key={tab.id}
                  className={activeTab === tab.id ? "block" : "hidden"}
                >
                  {renderTabContent(tab)}
                </div>
              ))}
            </div>
          </div>

          {/* Save Product Button - After Tabs */}
          {!readOnly && (
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Product...
                  </div>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          )}

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-semibold">
                    Please fix {Object.keys(errors).length} error(s) before
                    submitting
                  </h3>
                  <p className="text-red-600 text-sm mt-1">
                    Check all required fields and try again
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DynamicFormWithTabs;
