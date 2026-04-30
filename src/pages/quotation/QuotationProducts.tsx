import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { EnhancedProduct, Product } from "../../types/product";
import {
  FiChevronDown,
  FiChevronRight,
  FiDatabase,
  FiTrash2,
} from "react-icons/fi";
import { HiCube, HiCog } from "react-icons/hi";
import axios from "axios";
import Select from "react-select";
import quotationProductsConfig from "../configs/quotation/quotationProduct.json";
import QuotationTotal from "./QuotationTotal";
import TermsAndConditions from "./TermsandConditon";
import terms from "../configs/quotation/terms.json";
import EditableProductRow from "../opportunity/EditableProductRow";

// Update ProductWithDiscount to include all missing properties
interface ProductWithDiscount extends Product {
  id: number;
  productAccessories: any[];
  includedChildItems: any[];
  qty: number;
  discount?: number;
  amount: number;
  referencedBy?: any[];
  parentId: number;
  stage: string;
  stageItemId: string;
  hsn: string;
  product: string;
  parentItem: undefined;
  accessoriesItems: [];
  // Add other missing properties that are used in the component
  unitPrice?: number;
  taxPercentage?: number;
  uom?: string;
  itemId?: number;
  itemName?: string;
  itemCode?: string;
}

interface ProductOption {
  itemId: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
  inventoryItemId?: number;
  referencedBy?: any[];
  category?: string;
  parentId?: number;
  taxPercentage?: number;
  uom?: string;
}

interface SalesProductsProps {
  onProductsChange: (products: any[]) => void;
  products: any[];
  showButton?: boolean;
  onSaveProducts?: (products: any[]) => void;
  showTerms?: boolean;
  onTermsChange?: (terms: any) => void;
  options?: any[];
  showProducts?: boolean;
  showActions?: boolean;
}

const QuotationProducts: React.FC<SalesProductsProps> = ({
  onProductsChange,
  products = [],
  showButton = false,
  onSaveProducts,
  options = [],
  showTerms = true,
  onTermsChange,
  showProducts = true,
  showActions = true,
}) => {
  // State
  // Error state for product select
  console.log(options, "aaaa::::");
  const [showProductError, setShowProductError] = useState(false);
  const [productOptions, setProductOptions] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  // accessoryType removed
  const [selectedProductId, setSelectedProductId] = useState("");
  const [formAccessory, setFormAccessory] = useState<any>(
    initialProductState()
  );
  const [formProduct, setFormProduct] = useState<any>({
    ...initialProductState(),
    discount: 0,
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedTerms, setSelectedTerms] = useState<any>({});
  console.log(products, "dddd");

  // Normalize includedChildItems: if string, find matching product in options by name and replace with full object (with id)
  function normalizeIncludedChildItems(
    product: ProductWithDiscount
  ): ProductWithDiscount {
    if (Array.isArray(product.includedChildItems)) {
      const normalized = product.includedChildItems.map((item) => {
        if (typeof item === "string") {
          // Try to find matching product in options by itemName
          const found = options.find(
            (opt) => opt.itemName === item || opt.product === item
          );
          if (found) return found;
          // If not found, return as string (fallback)
          return item;
        }
        return item;
      });
      return { ...product, includedChildItems: normalized };
    }
    return product;
  }

  function initialProductState(): ProductWithDiscount {
    return {
      id: Date.now(),
      itemId: 0,
      itemName: "",
      itemCode: "",
      unitPrice: 0,
      qty: 1,
      amount: 0,
      productAccessories: [],
      taxPercentage: 0,
      uom: "pcs",
      includedChildItems: [],
      discount: 0,
      make: "",
      model: "",
      category: "",
      parentId: 0,
      userCreated: 0,
      userUpdated: 0,
      dateCreated: "",
      dateUpdated: "",
      isActive: true,
      referencedBy: [],
      stage: "",
      stageItemId: "",
      hsn: "",
      product: "",
      parentItem: undefined,
      accessoriesItems: [],
      bomId: 0,
      bomName: "",
      bomType: "",
      bomChildItems: [],
      // ✅ Newly required fields
      accessoryItemIds: [],
      accessoryItems: [],
      quantity: 0,
    };
  }

  // Initialize expanded products: always expand products with accessories until user collapses
  useEffect(() => {
    setExpandedProducts((prev) => {
      const updated = new Set(prev);
      products.forEach((p: ProductWithDiscount) => {
        const hasAccessories =
          (p.productAccessories && p.productAccessories.length > 0) ||
          (p.includedChildItems && p.includedChildItems.length > 0);

        if (hasAccessories && !updated.has(String(p.id))) {
          updated.add(String(p.id));
        }
      });
      // Do not auto-collapse if user has already collapsed
      return updated;
    });
  }, [products]);

  // Fetch products
  const fetchProductOptions = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get(
        "${process.env.REACT_APP_API_BASE_URL}/ProductDropdown/product-list"
      );
      setProductOptions(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load product options");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Whenever products or options change, normalize includedChildItems and pass to parent
  useEffect(() => {
    const normalizedProducts = products.map(normalizeIncludedChildItems);
    if (JSON.stringify(normalizedProducts) !== JSON.stringify(products)) {
      onProductsChange(normalizedProducts);
    }
    // eslint-disable-next-line
  }, [products, options]);

  useEffect(() => {
    fetchProductOptions();
  }, []);

  const calculateAmount = (price: number, quantity: number) => {
    return Number((price * quantity).toFixed(2));
  };

  // Handlers
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleDelete = (productId: string) => {
    const updatedProducts = products.filter((p) => String(p.id) !== productId);
    onProductsChange(updatedProducts);
    // toast.success("Product removed successfully");
    if (editIndex !== null && String(products[editIndex].id) === productId) {
      setFormProduct(initialProductState());
      setEditIndex(null);
    }
  };

  const prepareAccessoryForm = (productId: string) => {
    setSelectedProductId(productId);
    setShowAccessoryForm(true);
    setFormAccessory(initialProductState());
  };

  // Update the field type to include all possible fields
  type FormField = keyof ProductWithDiscount | "discount";

  const handleFormChange = (
    form: any,
    setForm: any,
    field: FormField,
    value: any
  ) => {
    let updated = { ...form, [field]: value };

    if (field === "itemName" && value && typeof value === "object") {
      // Only update product fields, do NOT auto-fill accessories
      updated = {
        ...updated,
        itemName: value.itemName,
        itemCode: value.itemCode,
        itemId: value.itemId,
        categoryId: value.categoryId || undefined,
        unitPrice: value.unitPrice ?? 0,
        inventoryItemsId: value.inventoryItemId,
        productAccessories:
          value.productAccessories || value.includedChildItems || [],
        taxPercentage: value.taxPercentage || 0,
        uom: value.uom || "pcs",
      };
    }

    if (["unitPrice", "qty", "discount"].includes(field)) {
      // discount is a percentage (0-100)
      const price = updated.unitPrice || 0;
      const qty = updated.qty || 1;
      const discount = updated.discount || 0;
      const subtotal = price * qty;
      const discountAmount = subtotal * (discount / 100);
      updated.amount = calculateAmount(subtotal - discountAmount, 1);
    }

    setForm(updated);
  };

  const handleAddItem = (
    form: ProductWithDiscount,
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

    if (
      requiredFields.some((field) => !form[field as keyof ProductWithDiscount])
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (isProduct) {
      const newProduct = {
        ...form,
        id: editIndex !== null ? products[editIndex].id : Date.now(),
      };
      const updatedProducts =
        editIndex !== null
          ? products.map((p, idx) => (idx === editIndex ? newProduct : p))
          : [...products, newProduct];

      onProductsChange(updatedProducts);
      setForm({ ...initialProductState(), discount: 0 });
      setShowAccessoryForm(false);
      setEditIndex(null);
      // toast.success(
      //   `Product ${editIndex !== null ? "updated" : "added"} successfully`
      // );
    } else {
      // Only allow adding productAccessories
      const updatedProducts = products.map((product: ProductWithDiscount) => {
        if (String(product.id) !== selectedProductId) return product;
        return {
          ...product,
          productAccessories: [
            ...(product.productAccessories || product.includedChildItems || []),
            form,
          ],
        };
      });
      onProductsChange(updatedProducts);
      setShowAccessoryForm(false);
      setFormAccessory(initialProductState());
      // toast.success("Product accessory added successfully");
    }
  };

  const calculateTotals = () => {
    let productsTotal = 0;
    products.forEach((product: ProductWithDiscount) => {
      // Calculate total for each product (unitPrice * qty + tax)
      const base = (product.unitPrice || 0) * (product.qty || 1);
      const tax = (base * (product.taxPercentage || 0)) / 100;
      productsTotal += base + tax;
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
      key: "itemName" as FormField,
      type: "select",
      options: isProduct
        ? (() => {
            // Filter out already added products
            const addedIds = products.map((p: ProductWithDiscount) => p.itemId);
            return (
              options && options.length > 0
                ? options.filter((p) => !addedIds.includes(p.itemId))
                : []
            ).map((p: any) => ({ label: p.itemName, value: p }));
          })()
        : (() => {
            const product = products.find(
              (p: ProductWithDiscount) => String(p.id) === selectedProductId
            );
            if (!product) return [];
            // Only show includedChildItems as Product Related Accessories
            return (product.includedChildItems || []).map((item: any) => ({
              label: item.itemName,
              value: item,
            }));
          })(),
      value: isProduct ? formProduct.itemName : formAccessory.itemName,
      onChange: (option: { label: string; value: any }) => {
        setShowProductError(false);
        handleFormChange(
          isProduct ? formProduct : formAccessory,
          isProduct ? setFormProduct : setFormAccessory,
          "itemName",
          option?.value || ""
        );
      },
      noOptionsMessage: () =>
        "No product accessories available for this product",
      isError: isProduct && showProductError,
    },
    // Only show unit price, discount, and quantity fields after a product is selected (for main product form)
    ...(isProduct && formProduct.itemName
      ? [
          {
            label: "Unit Price",
            key: "unitPrice" as FormField,
            type: "number",
            value: formProduct.unitPrice,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleFormChange(
                formProduct,
                setFormProduct,
                "unitPrice",
                Number(e.target.value)
              ),
          },
          {
            label: "Discount (%)",
            key: "discount" as FormField,
            type: "number",
            value: formProduct.discount || 0,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              let val = e.target.value.replace(/[^\d]/g, "");
              let num = Number(val);
              if (isNaN(num) || num < 0) num = 0;
              if (num > 100) num = 100;
              handleFormChange(formProduct, setFormProduct, "discount", num);
            },
          },
          {
            label: "Quantity",
            key: "qty" as FormField,
            type: "number",
            value: formProduct.qty,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              // Only allow positive integers, no signs or non-numeric input
              const val = e.target.value.replace(/[^\d]/g, "");
              const num = Number(val);
              handleFormChange(
                formProduct,
                setFormProduct,
                "qty",
                isNaN(num) || num < 1 ? 1 : num
              );
            },
          },
        ]
      : []),
    // For accessory form, always show unit price and quantity
    ...(!isProduct
      ? [
          {
            label: "Unit Price",
            key: "unitPrice" as FormField,
            type: "number",
            value: formAccessory.unitPrice,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              handleFormChange(
                formAccessory,
                setFormAccessory,
                "unitPrice",
                Number(e.target.value)
              ),
          },
          {
            label: "Quantity",
            key: "qty" as FormField,
            type: "number",
            value: formAccessory.qty,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              // Only allow positive integers, no signs or non-numeric input
              const val = e.target.value.replace(/[^\d]/g, "");
              const num = Number(val);
              handleFormChange(
                formAccessory,
                setFormAccessory,
                "qty",
                isNaN(num) || num < 1 ? 1 : num
              );
            },
          },
        ]
      : []),
  ];

  // Render helpers
  const renderFormField = (field: any, form: any, isProduct: boolean) => (
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
        <Select
          value={
            field.value
              ? {
                  label: field.value,
                  value: (isProduct ? productOptions : productOptions).find(
                    (p) => p.itemName === field.value
                  ),
                }
              : null
          }
          onChange={field.onChange}
          options={field.options.filter(
            (opt: any) => opt.label === field.value || !field.value
          )}
          isLoading={isLoadingProducts}
          isClearable
          placeholder={
            field.placeholder ||
            `Select ${isProduct ? "product" : "accessory"}...`
          }
          className={`text-sm${
            field.isError ? " border border-red-500 rounded" : ""
          }`}
          styles={
            field.isError
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
      ) : (
        <input
          type="number"
          value={field.value || ""}
          onChange={field.onChange}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm ${
            field.key === "unitPrice"
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : ""
          }`}
          placeholder={field.key === "unitPrice" ? "0.00" : "1"}
          min={field.key === "qty" ? 1 : 0}
          step={field.key === "unitPrice" ? 0.01 : 1}
          readOnly={field.key === "unitPrice"}
        />
      )}
      {field.isError && (
        <span className="text-xs text-red-600 mt-1 block">
          Please select the product
        </span>
      )}
    </div>
  );

  const renderAccessoryList = (items: any[], productId: string) => (
    <>
      {items.length > 0 && (
        <div className="w-full bg-blue-50">
          <div className="flex items-center gap-2 py-2 px-[62px] font-medium text-blue-700">
            <HiCube className="w-4 h-4" />
            Product Related Accessories
          </div>
        </div>
      )}
      <div className="w-full">
        {items.map((accessory, accIndex) => {
          return (
            <EditableProductRow
              key={`included-${accIndex}`}
              name={accessory.itemName || accessory}
              icon={<HiCube className="w-4 h-4 text-blue-500" />}
              unitPrice={accessory.unitPrice}
              qty={accessory.qty || 1}
              uom={
                typeof accessory.uom === "string"
                  ? accessory.uom
                  : Array.isArray(accessory.uom) && accessory.uom.length > 0
                  ? accessory.uom[0]
                  : "Nos"
              }
              taxPercentage={accessory.taxPercentage || 0}
              onQtyChange={(newQty) => {
                const updated = products.map((p: ProductWithDiscount) => {
                  if (String(p.id) !== productId) return p;
                  const updatedItems = [...(p.productAccessories || [])];
                  updatedItems[accIndex] = {
                    ...(updatedItems[accIndex] &&
                    typeof updatedItems[accIndex] === "object"
                      ? updatedItems[accIndex]
                      : {
                          id: Date.now().toString(),
                          itemId: undefined,
                          itemName: "",
                          itemCode: "",
                          unitPrice: 0,
                          qty: 1,
                          amount: 0,
                          inventoryItemsId: undefined,
                          productAccessories: [],
                          taxPercentage: 0,
                          uom: "Nos",
                        }),
                    qty: newQty,
                    amount: (updatedItems[accIndex]?.unitPrice || 0) * newQty,
                  };
                  return { ...p, productAccessories: updatedItems };
                });
                onProductsChange(updated);
              }}
              showUnitPrice={false}
              showUom={false}
              showTax={false}
              showTotal={false}
              onDelete={() => {}}
              rowClass={"bg-blue-25"}
              showQty={false}
              showDeleteOption={false}
            />
          );
        })}
      </div>
    </>
  );

  // Terms and Conditions selection handler
  const handleTermsChange = (terms: any) => {
    setSelectedTerms(terms);
    if (typeof onTermsChange === "function") onTermsChange(terms);
  };

  return (
    <div className="bg-white">
      {showProducts && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FiDatabase className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Quotation Products
          </h2>
        </div>
      )}

      {!showAccessoryForm &&
        showProducts &&
        (() => {
          // Filter out already added products
          const addedIds = products.map((p: ProductWithDiscount) => p.itemId);
          const availableOptions =
            options && options.length > 0
              ? options.filter((p) => !addedIds.includes(p.itemId))
              : [];
          if (availableOptions.length === 0) {
            return (
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
            );
          }
          return (
            <div className="p-6 border-b bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Product
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {formFields(true).map((field) =>
                  renderFormField(field, formProduct, true)
                )}
              </div>
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
          );
        })()}
      {showAccessoryForm && (
        <div className="p-6 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Add Product Related Accessory
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
      {products.length === 0 ? (
        <div className="p-8 text-center">
          <HiCube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products added yet
          </h3>
          <p className="text-gray-500">
            Add your first product with accessories using the form above
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 px-4 pb-4">
              {products.map((product: ProductWithDiscount) => (
                <div key={`mobile-${product.id}`} className="bg-white border text-sm rounded-lg shadow-sm p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                       {(product.includedChildItems && product.includedChildItems.length > 0) ||
                        (product.productAccessories && product.productAccessories.length > 0) ? (
                          <button
                            onClick={() => toggleProductExpansion(String(product.id))}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {expandedProducts.has(String(product.id)) ? <FiChevronDown className="w-4 h-4" /> : <FiChevronRight className="w-4 h-4" />}
                          </button>
                        ) : null}
                      <HiCube className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{product.itemName}</span>
                    </div>
                    {showActions && (
                      <button
                        onClick={() => handleDelete(String(product.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 block text-xs">Unit Price</span>
                      <span>{product.unitPrice}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Quantity</span>
                      <input
                        type="number"
                        min={1}
                        value={product.qty || 1}
                        disabled={!showActions}
                        className="w-16 px-1 py-0.5 border border-gray-300 rounded text-sm mt-1"
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^\d]/g, "");
                          const newQty = Math.max(1, Number(val));
                          onProductsChange(
                            products.map((p: ProductWithDiscount) =>
                              p.id === product.id ? { ...p, qty: newQty } : p
                            )
                          );
                        }}
                      />
                    </div>
                    <div>
                      <span className="text-gray-500 block text-xs">Discount</span>
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={product.discount ?? 0}
                          disabled={!showActions}
                          className="w-16 px-1 py-0.5 border border-gray-300 rounded text-sm"
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^\d]/g, "");
                            let num = Number(val);
                            if (isNaN(num) || num < 0) num = 0;
                            if (num > 100) num = 100;
                            onProductsChange(
                              products.map((p: ProductWithDiscount) =>
                                p.id === product.id ? { ...p, discount: num } : p
                              )
                            );
                          }}
                        />
                        <span>%</span>
                      </div>
                    </div>
                     <div>
                      <span className="text-gray-500 block text-xs">Tax %</span>
                      <span>{product.taxPercentage || 0}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t mt-2 flex justify-between items-center">
                     <span className="text-gray-500 block text-xs font-medium">Total Amount</span>
                     <span className="font-semibold text-blue-600">
                        {(() => {
                          const base = (product.unitPrice || 0) * (product.qty || 1);
                          const discount = product.discount || 0;
                          const discountAmount = base * (discount / 100);
                          const afterDiscount = base - discountAmount;
                          const tax = (afterDiscount * (product.taxPercentage || 0)) / 100;
                          const finalAmount = afterDiscount + tax;
                          return finalAmount > 0
                            ? finalAmount.toLocaleString("en-IN", { style: "currency", currency: "INR" })
                            : "₹0.00";
                        })()}
                     </span>
                  </div>

                  {((product.includedChildItems && product.includedChildItems.length > 0) ||
                    (product.productAccessories && product.productAccessories.length > 0)) &&
                    expandedProducts.has(String(product.id)) && (
                      <div className="mt-2 border-t pt-2">
                        {renderAccessoryList(
                          product.productAccessories || product.includedChildItems || [],
                          String(product.id)
                        )}
                      </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "PRODUCT NAME",
                    "UNIT PRICE",
                    "QUANTITY",
                    "DISCOUNT",
                    "UOM",
                    "TAX PERCENTAGE",
                    "TOTAL AMOUNT",
                  ].map((label) => (
                    <th
                      key={label}
                      className="text-left py-3 px-4 font-medium text-gray-700 text-sm"
                    >
                      {label}
                    </th>
                  ))}
                  {showActions && (
                    <th className="w-16 text-left py-3 px-4 font-medium text-gray-700 text-sm">
                      ACTIONS
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {products.map((product: ProductWithDiscount) => (
                  <React.Fragment key={String(product.id)}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Only show collapse/expand icon if product has accessories */}
                          {(product.includedChildItems &&
                            product.includedChildItems.length > 0) ||
                          (product.productAccessories &&
                            product.productAccessories.length > 0) ? (
                            <button
                              onClick={() =>
                                toggleProductExpansion(String(product.id))
                              }
                              className="text-gray-400 hover:text-gray-600"
                              style={{ minWidth: 24, minHeight: 24 }}
                            >
                              {expandedProducts.has(String(product.id)) ? (
                                <FiChevronDown className="w-4 h-4" />
                              ) : (
                                <FiChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            // Keep alignment: empty space for icon
                            <span
                              style={{
                                display: "inline-block",
                                minWidth: 24,
                                minHeight: 24,
                              }}
                            ></span>
                          )}
                          <HiCube className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {product.itemName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {product.unitPrice}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        <input
                          type="number"
                          min={1}
                          value={product.qty || 1}
                          disabled={!showActions}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) => {
                            // Only allow positive integers, no signs or non-numeric input
                            const val = e.target.value.replace(/[^\d]/g, "");
                            const newQty = Math.max(1, Number(val));
                            onProductsChange(
                              products.map((p: ProductWithDiscount) =>
                                p.id === product.id ? { ...p, qty: newQty } : p
                              )
                            );
                          }}
                        />
                      </td>
                      {/* Discount column display */}
                      <td className="py-3 px-4 text-gray-700 ">
                        <div className="flex gap-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={product.discount ?? 0}
                            disabled={!showActions}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                            onChange={(e) => {
                              let val = e.target.value.replace(/[^\d]/g, "");
                              let num = Number(val);
                              if (isNaN(num) || num < 0) num = 0;
                              if (num > 100) num = 100;
                              onProductsChange(
                                products.map((p: ProductWithDiscount) =>
                                  p.id === product.id
                                    ? { ...p, discount: num }
                                    : p
                                )
                              );
                            }}
                          />
                          %
                        </div>
                      </td>
                      <td className="py-3 px-4">{"Nos"}</td>
                      <td className="py-3 px-4 text-gray-700">
                        {product.taxPercentage || 0}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(() => {
                          const base =
                            (product.unitPrice || 0) * (product.qty || 1);
                          const discount = product.discount || 0;
                          const discountAmount = base * (discount / 100);
                          const afterDiscount = base - discountAmount;
                          const tax =
                            (afterDiscount * (product.taxPercentage || 0)) /
                            100;
                          const finalAmount = afterDiscount + tax;
                          return finalAmount > 0
                            ? finalAmount.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })
                            : "₹0.00";
                        })()}
                      </td>
                      {showActions && (
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(String(product.id))}
                              className="text-red-500 hover:text-red-700 ml-2"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>

                    {((product.includedChildItems &&
                      product.includedChildItems.length > 0) ||
                      (product.productAccessories &&
                        product.productAccessories.length > 0)) &&
                      expandedProducts.has(String(product.id)) && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-transparent">
                            <div style={{ width: "100%" }}>
                              {renderAccessoryList(
                                product.productAccessories ||
                                  product.includedChildItems ||
                                  [],
                                String(product.id)
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 p-6 space-y-2">
            <div className="flex flex-col items-end text-sm">
              <span className="text-gray-600 text-right">
                Total Products: {products.length}
              </span>
              {/* Accessories removed */}
            </div>

            <div className="border-t pt-4 space-y-2 flex flex-col items-end">
              <div className="flex text-sm gap-2">
                <span className="text-gray-700 text-right">
                  Products Total:
                </span>
                <span className="text-blue-600 font-medium text-right">
                  ${totals.productsTotal.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-2 w-full flex flex-col items-end">
                <div className="flex text-lg font-bold gap-2">
                  <span className="text-gray-900 text-right">Grand Total:</span>
                  <span className="text-green-600 text-right">
                    ${totals.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {products.length > 0 && showTerms && (
        <div className="p-6 bg-white">
          <TermsAndConditions
            data={selectedTerms}
            onChange={handleTermsChange}
            applyChanges
          />
        </div>
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
  );
};

export default QuotationProducts;
