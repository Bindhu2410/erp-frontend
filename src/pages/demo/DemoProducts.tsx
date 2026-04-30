import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  FiChevronDown,
  FiChevronRight,
  FiDatabase,
  FiTrash2,
} from "react-icons/fi";
import { HiCube } from "react-icons/hi";
import Select from "react-select";
import { Product } from "../../types/product";
import api from "../../services/api";

// Checklist document options
const DOCUMENT_OPTIONS = [
  "User manuals",
  "Quick-start guides",
  "Brochures",
  "Compliance certificates (CE, FDA)",
];

interface DemoProductsProps {
  onProductsChange: (products: any[]) => void;
  products: any[];
  showButton?: boolean;
  onSaveProducts?: (products: any[]) => void;
  hideProduct?: boolean;
  options?: any[];
  editableQtyInTable?: boolean;
  checklistNamesByItemId?: Record<string, string[]>;
  onChecklistChange?: (
    selected: { checklist_name: string; is_active: boolean }[]
  ) => void;
  mode?: "new" | "edit" | "view";
  visible?: boolean;
}

type EnhancedProduct = any & {
  includedChildItems?: any[];
  accessoriesItems: any[];
  parentId?: number | null;
  referencedBy?: any;
  anyAccessories?: any[];
  otherAccessories?: any[];
};

type ProductOption = Product & {
  referencedBy?: any;
  uom?: string;
  qty?: number;
  parentId?: number | null;
};

const initialProductState = (): any => ({
  id: 0,
  userCreated: 0,
  dateCreated: "",
  userUpdated: 0,
  dateUpdated: "",
  qty: 1,
  amount: 0,
  isActive: true,
  itemId: 0,
  stage: "Demo",
  stageItemId: "",
  make: "",
  model: "",
  product: "",
  category: "",
  itemName: "",
  itemCode: "",
  unitPrice: 0,
  hsn: "",
  taxPercentage: 0,
  uom: "pcs",
  parentId: null,
  parentItem: null,
  referencedBy: null,
  includedChildItems: [],
  accessoriesItems: [],
  productAccessories: [],
  otherAccessories: [],
});

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Something went wrong
          </h3>
          <p className="text-red-600">
            There was an error loading the products section. Please try
            refreshing the page.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const DemoProducts: React.FC<
  DemoProductsProps & { checklistsFromApi?: any[] }
> = ({
  onProductsChange,
  products = [],
  showButton = false,
  hideProduct = false,
  onSaveProducts,
  options = [],
  editableQtyInTable = true,
  checklistNamesByItemId = {},
  onChecklistChange,
  checklistsFromApi,

  mode = "new",
  visible = false,
}) => {
  const addedProductIds = products.map((p) => String(p.itemId));
  const addedProductNames = products.map((p) => p.itemName);
  const productOptions: ProductOption[] = (options || []).filter(
    (p) =>
      !addedProductIds.includes(String(p.itemId)) &&
      !addedProductNames.includes(p.itemName)
  );
  const accessoryOptions: ProductOption[] = (options || []).filter(
    (p) => p.category === "Accessories"
  );
  const [isLoadingProducts] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [accessoryType] = useState<"included">("included");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [formAccessory, setFormAccessory] = useState<EnhancedProduct>(
    initialProductState()
  );
  const [formProduct, setFormProduct] = useState<EnhancedProduct>(
    initialProductState()
  );
  const [showProductError, setShowProductError] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Checklist state
  const [checklistApiData, setChecklistApiData] = useState<
    { checklist_name: string; is_active: boolean }[]
  >([]);
  const [isChecklistLoading, setIsChecklistLoading] = useState(false);

  // Consolidated useEffect for checklist data
  useEffect(() => {
    let isMounted = true;

    const fetchChecklist = async () => {
      try {
        setIsChecklistLoading(true);
        const response = await api.get("DemoChecklist/all-names");

        const apiData = await response.data;

        if (!isMounted) return;

        let mergedChecklist: {
          checklist_name: string;
          is_active: boolean;
        }[] = [];

        if (Array.isArray(apiData)) {
          if (typeof apiData[0] === "object") {
            mergedChecklist = apiData.map((c) => {
              const name = c.checklistName || c.checklist_name || c.name;
              let isActive = false;

              // Only check against checklistsFromApi if we're in edit mode and it has data
              if (
                Array.isArray(checklistsFromApi) &&
                checklistsFromApi.length > 0
              ) {
                const found = checklistsFromApi.find((item) => {
                  const n =
                    item.checklistName || item.checklist_name || item.name;
                  return n === name;
                });
                isActive = !!(found && (found.isActive || found.is_active));
              }

              return { checklist_name: name, is_active: isActive };
            });
          } else {
            mergedChecklist = apiData.map((name) => {
              let isActive = false;

              if (
                Array.isArray(checklistsFromApi) &&
                checklistsFromApi.length > 0
              ) {
                const found = checklistsFromApi.find((item) => {
                  const n =
                    item.checklistName || item.checklist_name || item.name;
                  return n === name;
                });
                isActive = !!(found && (found.isActive || found.is_active));
              }

              return { checklist_name: name, is_active: isActive };
            });
          }

          if (isMounted) {
            setChecklistApiData(mergedChecklist);
          }
        }
      } catch (error) {
        console.error("Checklist fetch failed:", error);
        if (isMounted) {
          setChecklistApiData([]);
          toast.error("Failed to load checklist data");
        }
      } finally {
        if (isMounted) {
          setIsChecklistLoading(false);
        }
      }
    };

    fetchChecklist();

    return () => {
      isMounted = false;
    };
  }, [checklistsFromApi]);

  const [isChecklistOpen, setIsChecklistOpen] = useState(mode !== "new");

  useEffect(() => {
    if (mode !== "new") {
      setIsChecklistOpen(true);
    }
  }, [mode]);

  // Handler for toggling checklist item
  const handleChecklistToggleApi = (name: string) => {
    setChecklistApiData((prev) => {
      const idx = prev.findIndex((item) => item.checklist_name === name);
      if (idx === -1) return prev;

      const updated = prev.map((i) =>
        i.checklist_name === name ? { ...i, is_active: !i.is_active } : i
      );

      if (onChecklistChange && Array.isArray(checklistsFromApi)) {
        onChecklistChange(updated.filter((item) => item.is_active));
      }

      return updated;
    });
  };

  const handleChecklistToggle = (productId?: string | number) => {
    if (mode === "view") return;

    if (productId) {
      setExpandedProducts((prev) => {
        const newSet = new Set(prev);
        const key = String(productId);
        newSet.has(key) ? newSet.delete(key) : newSet.add(key);
        return newSet;
      });
    }
    setIsChecklistOpen((prev) => !prev);
  };

  const didAutoAdd = useRef(false);

  // Handlers
  const toggleProductExpansion = (
    productId: string | number,
    hasAccessories: boolean
  ) => {
    if (!hasAccessories) return;
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      const key = String(productId);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const handleDelete = (
    productId: string | number,
    index?: number,
    type?: "included" | "additional"
  ) => {
    const pid = productId.toString();
    if (index === undefined) {
      const updatedProducts = products.filter((p) => p.id?.toString() !== pid);
      if (typeof onProductsChange === "function") {
        onProductsChange(updatedProducts);
      }
      toast.success("Product removed successfully");
    } else {
      const updated = products.map((product) => {
        if (product.id?.toString() !== pid) return product;
        const items = Array.isArray(product.includedChildItems)
          ? product.includedChildItems.filter(
              (_: any, i: number) => i !== index
            )
          : [];
        return {
          ...product,
          includedChildItems: items,
        };
      });
      if (typeof onProductsChange === "function") {
        onProductsChange(updated);
      }
      toast.success("Accessory removed successfully");
    }
  };

  const handleFormChange = (
    form: any,
    setForm: any,
    field: keyof any,
    value: any
  ) => {
    let updated = { ...form, [field]: value };

    if (field === "itemName" && value && typeof value === "object") {
      const selected = value as ProductOption;

      if (form === formProduct && !editIndex) {
        const isDuplicate = products.some(
          (p) =>
            (selected.itemId && String(p.itemId) === String(selected.itemId)) ||
            (selected.itemName && p.itemName === selected.itemName)
        );

        if (isDuplicate) {
          toast.error("This product is already added");
          setForm(initialProductState());
          return;
        }
      }

      updated = {
        ...updated,
        itemName: selected.itemName,
        itemCode: selected.itemId,
        itemId: selected.itemId,
        id: typeof selected.itemId === "number" ? selected.itemId : Date.now(),
        categoryId: selected.category ? Number(selected.category) : undefined,
        unitPrice: selected.unitPrice ?? 0,
        make: selected.make || "",
        model: selected.model || "",
        category: selected.category || "",
        hsn: selected.hsn || "",
        taxPercentage: selected.taxPercentage || 0,
        uom: selected.uom || "pcs",
        ...(form === formProduct
          ? {
              includedChildItems:
                selected.referencedBy?.filter(
                  (i: any) => i.category === "Accessories"
                ) || [],
            }
          : {}),
      };
    }

    if (["unitPrice", "qty"].includes(field as string)) {
      updated.amount = (updated.unitPrice || 0) * (updated.qty || 1);
    }

    setForm(updated);
  };

  const handleAddItem = (
    form: EnhancedProduct,
    setForm: any,
    isProduct: boolean
  ) => {
    const requiredFields = isProduct
      ? ["itemName", "unitPrice", "qty"]
      : ["itemName", "qty"];

    if (isProduct && !form.itemName) {
      setShowProductError(true);
      toast.error("Please select the product");
      return;
    } else {
      setShowProductError(false);
    }

    if (requiredFields.some((field) => !form[field as keyof EnhancedProduct])) {
      toast.error("Please fill all required fields");
      return;
    }

    if (isProduct) {
      let selectedOption = null;
      if (form.itemId) {
        selectedOption = options.find(
          (opt) => String(opt.itemId) === String(form.itemId)
        );
      } else if (form.itemName) {
        selectedOption = options.find((opt) => opt.itemName === form.itemName);
      }

      const isDuplicate = products.some(
        (p) =>
          (form.itemId && String(p.itemId) === String(form.itemId)) ||
          (form.itemName && p.itemName === form.itemName)
      );

      if (isDuplicate && editIndex === null) {
        toast.error("This product is already added");
        return;
      }

      let includedChildItems = [];
      if (selectedOption && Array.isArray(selectedOption.includedChildItems)) {
        includedChildItems = selectedOption.includedChildItems.map(
          (child: any) => ({
            ...child,
          })
        );
      }
      const newProduct = {
        ...form,
        id: editIndex !== null ? products[editIndex].id : Date.now(),
        productAccessories: form.productAccessories || [],
        otherAccessories: form.otherAccessories || [],
        includedChildItems,
      };
      const updatedProducts =
        editIndex !== null
          ? products.map((p, idx) => (idx === editIndex ? newProduct : p))
          : [...products, newProduct];

      onProductsChange(updatedProducts as any[]);
      setForm(initialProductState());
      setShowAccessoryForm(false);
      setEditIndex(null);
      toast.success(
        `Product ${editIndex !== null ? "updated" : "added"} successfully`
      );
    } else {
      const updatedProducts = products.map((product) => {
        if (String(product.id) !== String(selectedProductId)) return product;
        const newAccessory = {
          ...form,
          parentId: product.itemId,
          productAccessories: form.productAccessories || [],
          otherAccessories: form.otherAccessories || [],
        };
        return {
          ...product,
          includedChildItems: [
            ...(product.includedChildItems || []),
            newAccessory,
          ],
        };
      });

      onProductsChange(updatedProducts as Product[]);
      setShowAccessoryForm(false);
      setFormAccessory(initialProductState());
      toast.success(
        `${
          accessoryType === "included" ? "Product accessory" : "Other accessory"
        } added successfully`
      );
    }
  };

  // Calculations
  const calculateTotals = () => {
    let productsTotal = 0;
    products.forEach((product) => {
      productsTotal += (product.unitPrice || 0) * (product.qty || 1);
    });
    return {
      productsTotal,
      grandTotal: productsTotal,
    };
  };

  const totals = calculateTotals();

  // Form field configuration
  const formFields = (isProduct: boolean) => [
    {
      label: isProduct ? "Product Name" : "Accessory Name",
      key: "itemName",
      type: "select",
      options: isProduct
        ? productOptions.map((p) => ({ label: p.itemName, value: p }))
        : accessoryOptions
            .filter((accessory) => {
              const product = products.find(
                (p) => String(p.id) === String(selectedProductId)
              );
              if (!product) return false;

              if (accessoryType === "included") {
                const isReferenced = product.itemId === accessory.parentId;
                const notAdded = !product.includedChildItems?.some(
                  (i: any) => i.itemId === accessory.itemId
                );
                return isReferenced && notAdded;
              } else {
                const notInIncluded = !product.includedChildItems?.some(
                  (i: any) => i.itemId === accessory.itemId
                );
                return notInIncluded;
              }
            })
            .map((p) => ({ label: p.itemName, value: p })),
      value: isProduct ? formProduct.itemName : formAccessory.itemName,
      onChange: (option: any) =>
        handleFormChange(
          isProduct ? formProduct : formAccessory,
          isProduct ? setFormProduct : setFormAccessory,
          "itemName",
          option?.value || ""
        ),
      noOptionsMessage: () =>
        accessoryType === "included"
          ? "No product accessories available for this product"
          : "No other accessories available",
    },
    {
      label: "Unit Price",
      key: "unitPrice",
      type: "number",
      value: isProduct ? formProduct.unitPrice : formAccessory.unitPrice,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFormChange(
          isProduct ? formProduct : formAccessory,
          isProduct ? setFormProduct : setFormAccessory,
          "unitPrice",
          Number(e.target.value)
        ),
    },
    {
      label: "Quantity",
      key: "qty",
      type: "number",
      value: isProduct ? formProduct.qty : formAccessory.qty,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFormChange(
          isProduct ? formProduct : formAccessory,
          isProduct ? setFormProduct : setFormAccessory,
          "qty",
          Number(e.target.value)
        ),
    },
  ];

  // Render helpers
  const renderFormField = (field: any, form: any, isProduct: boolean) => {
    const productSelected = !!form.itemName;

    if (
      !productSelected &&
      (field.key === "unitPrice" || field.key === "qty")
    ) {
      return null;
    }
    return (
      <div key={field.key}>
        {field.key === "itemName" && isProduct ? (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
            <span className="text-red-500 p-2">*</span>
          </label>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
        )}
        {field.type === "select" ? (
          <>
            <Select
              value={
                field.value
                  ? {
                      label: field.value,
                      value: (isProduct
                        ? productOptions
                        : accessoryOptions
                      ).find((p) => p.itemName === field.value),
                    }
                  : null
              }
              onChange={(option: any) => {
                setShowProductError(false);
                field.onChange(option);
              }}
              options={field.options}
              isLoading={isLoadingProducts}
              isClearable
              placeholder={
                field.placeholder ||
                `Select ${isProduct ? "product" : "accessory"}...`
              }
              className={`text-sm${
                isProduct && field.key === "itemName" && showProductError
                  ? " border border-red-500 rounded"
                  : ""
              }`}
              styles={
                isProduct && field.key === "itemName" && showProductError
                  ? {
                      control: (base: any) => ({
                        ...base,
                        borderColor: "#ef4444",
                        boxShadow: "0 0 0 1px #ef4444",
                      }),
                    }
                  : undefined
              }
              noOptionsMessage={field.noOptionsMessage}
            />
            {isProduct && field.key === "itemName" && showProductError && (
              <span className="text-xs text-red-600 mt-1 block">
                Please select the product
              </span>
            )}
          </>
        ) : field.key === "unitPrice" ? (
          <div className="px-3 py-2  rounded-md text-sm">
            ₹ {parseFloat(field.value || 0).toFixed(2)}
          </div>
        ) : (
          <input
            type="number"
            value={field.value || ""}
            onChange={field.onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder={field.key === "qty" ? "1" : ""}
            min={field.key === "qty" ? 1 : 0}
            step={1}
            onKeyDown={
              field.key === "qty"
                ? (e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }
                : undefined
            }
            onInput={
              field.key === "qty"
                ? (e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^\d]/g, "");
                  }
                : undefined
            }
          />
        )}
      </div>
    );
  };
  if (!visible) return null;

  return (
    <ErrorBoundary>
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FiDatabase className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Demo Products</h2>
        </div>

        {/* Checklist Section - Only show in edit/view modes */}
        {mode !== "new" && (
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg p-0 border border-gray-200 w-full">
              <button
                type="button"
                className={`w-full flex items-center mb-0 px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-t-lg transition ${
                  mode === "view" ? "cursor-default" : "hover:bg-blue-50"
                }`}
                onClick={() =>
                  mode === "view" ? undefined : handleChecklistToggle()
                }
                aria-expanded={isChecklistOpen}
                aria-controls="checklist-content"
                disabled={mode === "view"}
                style={{
                  borderBottom: isChecklistOpen
                    ? "1px solid #e5e7eb"
                    : undefined,
                }}
              >
                <svg
                  className="w-6 h-6 text-blue-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 flex-1 text-left">
                  Required Documents Checklist
                </h3>
                <span className="ml-2">
                  {isChecklistOpen ? (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  )}
                </span>
              </button>
              {isChecklistOpen && (
                <div id="checklist-content" className="p-6 pt-4">
                  {isChecklistLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-500 text-sm mt-2">
                        Loading checklist...
                      </p>
                    </div>
                  ) : checklistApiData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {checklistApiData.map((item, idx) => (
                        <label
                          key={item.checklist_name}
                          className={`flex items-center gap-2 bg-gray-50 rounded px-3 py-2 ${
                            mode === "view"
                              ? "cursor-default"
                              : "cursor-pointer"
                          } select-none`}
                          htmlFor={
                            mode === "view" ? undefined : `checklist-${idx}`
                          }
                        >
                          <input
                            id={`checklist-${idx}`}
                            type="checkbox"
                            checked={!!item.is_active}
                            onChange={() =>
                              mode === "edit"
                                ? handleChecklistToggleApi(item.checklist_name)
                                : undefined
                            }
                            disabled={mode === "view"}
                            className={`${
                              mode === "view"
                                ? "cursor-not-allowed opacity-60"
                                : "cursor-pointer"
                            } accent-blue-600 w-4 h-4`}
                          />
                          <span className="text-gray-700 text-sm">
                            {item.checklist_name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No checklist data available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!hideProduct &&
          (productOptions.length === 0 ? (
            <div className="p-8 border-b bg-gray-50 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-orange-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                  />
                </svg>
                <span className="text-orange-600 font-semibold text-base">
                  All products have been added!
                </span>
              </div>
            </div>
          ) : (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Product
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {formFields(true).map((field) =>
                  field.key === "itemName"
                    ? renderFormField(
                        {
                          ...field,
                          className:
                            productOptions.length === 0
                              ? "border border-orange-500"
                              : undefined,
                        },
                        formProduct,
                        true
                      )
                    : renderFormField(field, formProduct, true)
                )}
              </div>
              {(formProduct.includedChildItems?.length ?? 0) > 0 && (
                <div className="mb-4">
                  <div className="font-semibold text-blue-700 mb-2">
                    Product Accessories (auto-filled):
                  </div>
                  <ul className="space-y-1">
                    {(formProduct.includedChildItems ?? []).map(
                      (acc: any, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 bg-blue-50 rounded px-3 py-1"
                        >
                          <HiCube className="w-4 h-4 text-blue-500" />
                          <span className="text-gray-800">{acc.itemName}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    handleAddItem(formProduct, setFormProduct, true)
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  {editIndex !== null ? "Update Product" : "Add Product"}
                </button>
              </div>
            </div>
          ))}

        {products.length === 0 && (
          <div className="p-8 text-center">
            <HiCube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products added yet
            </h3>
            <p className="text-gray-500">
              Add your first product with accessories using the form above
            </p>
          </div>
        )}

        {showAccessoryForm && (
          <div className="p-6 border-b bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add {accessoryType === "included" ? "Product Related" : "Other"}{" "}
              Accessory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {formFields(false).map((field) =>
                renderFormField(field, formAccessory, false)
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleAddItem(formAccessory, setFormAccessory, false)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Add Accessory
              </button>
              <button
                onClick={() => {
                  setShowAccessoryForm(false);
                  setFormAccessory(initialProductState());
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {products.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      PRODUCT NAME
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      UNIT PRICE
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      QUANTITY
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      UOM
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const base = (product.unitPrice || 0) * (product.qty || 1);
                    const tax = (base * (product.taxPercentage || 0)) / 100;
                    const total = base + tax;
                    const hasAccessories =
                      Array.isArray(product.includedChildItems) &&
                      product.includedChildItems.length > 0;
                    const checklist =
                      checklistNamesByItemId && product.itemId
                        ? checklistNamesByItemId[String(product.itemId)]
                        : undefined;
                    return (
                      <React.Fragment key={product.id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {hasAccessories ? (
                                <>
                                  <button
                                    onClick={() =>
                                      toggleProductExpansion(
                                        product.id,
                                        hasAccessories
                                      )
                                    }
                                    className={`flex items-center justify-center mr-2 text-gray-400 hover:text-gray-600 focus:outline-none`}
                                    style={{ width: 24, height: 24 }}
                                    tabIndex={0}
                                    aria-label={
                                      expandedProducts.has(String(product.id))
                                        ? "Collapse accessories"
                                        : "Expand accessories"
                                    }
                                  >
                                    {expandedProducts.has(
                                      String(product.id)
                                    ) ? (
                                      <FiChevronDown className="w-4 h-4" />
                                    ) : (
                                      <FiChevronRight className="w-4 h-4" />
                                    )}
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <HiCube className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-gray-900">
                                      {product.itemName}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 ml-[26px]">
                                  <HiCube className="w-5 h-5 text-blue-600" />
                                  <span className="font-medium text-gray-900">
                                    {product.itemName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <span>
                              {product.unitPrice?.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <span>{product.qty || 1}</span>
                          </td>
                          <td className="py-3 px-4">{product.uom || "Nos"}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-500 hover:text-red-700 ml-2"
                              type="button"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                        {hasAccessories &&
                          expandedProducts.has(String(product.id)) && (
                            <tr>
                              <td colSpan={5} className="p-0 bg-transparent">
                                <div className="bg-blue-50 px-8 py-2">
                                  <div className="font-semibold text-blue-700 mb-2 px-6 flex items-center gap-2">
                                    <HiCube className="w-4 h-4" />
                                    Product Accessories
                                  </div>
                                  <ul className="space-y-1">
                                    {(product.includedChildItems ?? []).map(
                                      (acc: any, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-center gap-2 bg-blue-25 rounded px-7 py-1"
                                        >
                                          <HiCube className="w-4 h-4 text-blue-500" />
                                          <span className="text-gray-800">
                                            {acc.itemName}
                                          </span>
                                          {acc.unitPrice !== undefined &&
                                            acc.unitPrice !== null && (
                                              <span className="ml-4 text-xs text-gray-500"></span>
                                            )}
                                          {acc.taxPercentage !== undefined &&
                                            acc.taxPercentage !== null && (
                                              <span className="ml-2 text-xs text-gray-500"></span>
                                            )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 p-6 space-y-2 flex flex-col items-end">
              <div className="text-sm text-right">
                <span className="text-gray-600">
                  Total Products: {products.length}
                </span>
              </div>
              <div className="text-sm text-right">
                <span className="text-gray-600">
                  Total Accessories:{" "}
                  {products.reduce(
                    (sum, p) => sum + (p.includedChildItems?.length || 0),
                    0
                  )}
                </span>
              </div>
            </div>
          </>
        )}

        {showButton && (
          <div className="p-6 border-t">
            <div className="flex justify-end">
              <button
                onClick={() => onSaveProducts?.(products)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DemoProducts;
