import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { InterestedProduct } from "../types/interestedProduct";
import { FiDatabase } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import Select from "react-select";
import interestedProductsConfig from "../pages/configs/lead/interestedProducts.json";

interface ProductOption {
  itemId: number;
  itemCode: string;
  itemName: string;
}

interface InterestedProductFormProps {
  initialData?: InterestedProduct[];

  onClose: () => void;
  config?: Record<string, any>;
  stageid?: string;
  type?: string;
  options?: string[];
}

const InterestedProductForm: React.FC<InterestedProductFormProps> = ({
  initialData,

  onClose,
  config = {},
  stageid,
  type,
  options = [],
}) => {
  const [products, setProducts] = useState<InterestedProduct[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Local counter for temporary IDs
  const [tempIdCounter, setTempIdCounter] = useState(1);

  useEffect(() => {
    fetchProductOptions();
    fetchSalesItems();
  }, []);

  // Fetch product options for dropdown
  const fetchProductOptions = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}ItemDropdown/item-list`
      );

      setProductOptions(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load product options");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Fetch sales items from API
  const fetchSalesItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}SalesItems/by-stage/lead/${stageid}`
      );

      const mapped = response.data.map((item: any) => ({
        id: String(item.id),
        productName: item.itemName || "",
        productId: item.itemCode || "",
        categoryName: item.category || "",
        itemId: item.itemId || 0,
        quantity: item.qty || 0,
        makeName: item.make || "",
        modelName: item.model || "",
        uom: item.uom || "",
        unitPrice: item.unitPrice || 0,
        amount: item.amount || 0,
        notes: item.notes || "",
      }));
      setProducts(mapped || []);
    } catch (error) {
      toast.error("Failed to load sales items");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new product (UI only, not API)
  const addNewProduct = () => {
    const availableProducts = getAvailableProducts();
    if (availableProducts.length === 0) return;
    // Use a short temporary ID for new rows
    const newProduct: InterestedProduct = {
      id: `tmp-${tempIdCounter}`,
      productName: "",
      productId: "",
      itemId: 0,
      categoryName: "",
      quantity: 1,
      makeName: "",
      modelName: "",
      uom: "",
      unitPrice: 0,
      amount: 0,
      notes: "",
    };
    setProducts((prev) => [...prev, newProduct]);
    setTempIdCounter((prev) => prev + 1);
  };

  // Save a single product row (POST for new, PUT for existing)
  const saveProductRow = async (product: InterestedProduct) => {
    if (!product.productName || !product.itemId) {
      toast.error("Please select a product before saving.");
      return;
    }
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const reqBody = {
        Id: product.id.startsWith("tmp-") ? 0 : Number(product.id),
        UserCreated: 1,
        DateCreated: now,
        UserUpdated: 1,
        DateUpdated: now,
        Qty: product.quantity || 0,
        Amount: product.amount || 0,
        IsActive: true,
        ItemId: product.itemId || 0,
        Stage: "lead",
        UnitPrice: product.unitPrice || 0,
        StageItemId: stageid || "string",
      };
      if (product.id.startsWith("tmp-")) {
        // New: create
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}SalesItems`, reqBody);
        await fetchSalesItems();
        toast.success("Product saved successfully");
      } else {
        // Existing: update
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}SalesItems/${product.id}`,
          reqBody
        );
        await fetchSalesItems();
        toast.success("Product updated successfully");
      }
    } catch (error) {
      toast.error("Failed to save product");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product (Delete, works for both temp and saved)
  const deleteProduct = async (productId: string) => {
    if (productId.startsWith("tmp-")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return;
    }
    try {
      setIsLoading(true);
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}SalesItems/${productId}`);
      await fetchSalesItems();
      toast.success("Product removed successfully");
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // Update product (edit in UI only, not API)
  const updateProduct = (
    productId: string,
    field: keyof InterestedProduct,
    value: string | number
  ) => {
    const updatedProducts = products.map((product) => {
      if (product.id === productId) {
        const updatedProduct = { ...product, [field]: value };
        if (field === "productName") {
          const selectedProduct = productOptions.find(
            (p) => p.itemName === value
          );
          if (selectedProduct) {
            updatedProduct.productId = selectedProduct.itemCode;
            updatedProduct.itemId = selectedProduct.itemId;
          } else {
            updatedProduct.itemId = 0;
          }
        }
        return updatedProduct;
      }
      return product;
    });
    setProducts(updatedProducts);
  };

  const getAvailableProducts = () => {
    return productOptions.filter(
      (option) =>
        (options.length === 0 || options.includes(option.itemName)) &&
        !products.some((p) => p.productName === option.itemName)
    );
  };

  const renderField = (field: any, product: InterestedProduct) => {
    if (field.type === "dropdown" && field.id === "itemName") {
      // Filter productOptions to show only items that are in the options prop (or all if no options specified)
      // AND exclude items that are already selected in other product rows
      const filteredOptions = productOptions.filter(
        (option) =>
          (options.length === 0 || options.includes(option.itemName)) &&
          !products.some(
            (p) => p.productName === option.itemName && p.id !== product.id
          )
      );

      return (
        <Select
          value={
            product.productName
              ? { label: product.productName, value: product.productName }
              : null
          }
          onChange={(option) =>
            updateProduct(product.id, "productName", option?.value || "")
          }
          options={filteredOptions.map((p) => ({
            label: p.itemName,
            value: p.itemName,
          }))}
          isLoading={isLoadingProducts}
          isClearable
          placeholder={`Select ${field.fieldName.toLowerCase()}...`}
          className="text-sm"
          styles={{
            control: (base, state) => ({
              ...base,
              minHeight: "38px",
              height: "38px",
              borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
              "&:hover": { borderColor: "#3b82f6" },
              borderWidth: "1px",
            }),
            valueContainer: (base) => ({
              ...base,
              padding: "0 12px",
            }),
            input: (base) => ({
              ...base,
              margin: 0,
              padding: 0,
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
            }),
            menuPortal: (base) => ({
              ...base,
              zIndex: 9999,
            }),
          }}
          menuPortalTarget={document.body}
        />
      );
    }

    if (field.disabled) {
      return (
        <div className="h-[38px] px-3 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md flex items-center">
          {field.id === "itemCode"
            ? product.productId || ""
            : product[field.id as keyof InterestedProduct] || ""}
        </div>
      );
    }

    return (
      <input
        type={field.type}
        value={String(
          product[
            field.id === "qty"
              ? "quantity"
              : (field.id as keyof InterestedProduct)
          ] || ""
        )}
        onChange={(e) =>
          updateProduct(
            product.id,
            field.id === "qty"
              ? "quantity"
              : (field.id as keyof InterestedProduct),
            field.type === "number" ? Number(e.target.value) : e.target.value
          )
        }
        placeholder={field.type === "number" ? "0" : field.fieldName}
        min={field.type === "number" ? "0" : undefined}
        className="w-full h-[38px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FiDatabase className="w-5 h-5 text-blue-600" />
            Interested Products
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={addNewProduct}
              disabled={getAvailableProducts().length === 0}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                getAvailableProducts().length === 0
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              title={
                getAvailableProducts().length === 0
                  ? "All available products have been added"
                  : "Add a new product"
              }
            >
              <AiOutlinePlus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {getAvailableProducts().length === 0 &&
        (options.length > 0 || productOptions.length > 0) &&
        products.length > 0 && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700 text-sm font-medium">
                You've added all available products. No more products left to
                add.
              </p>
            </div>
          </div>
        )}

      {/* Products List */}
      <div className="p-4">
        {products.length === 0 ? (
          <div className="text-center py-6">
            <FiDatabase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No products added yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Add Product" to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Header Row */}
            <div
              className="grid gap-3 pb-2 border-b border-gray-200"
              style={{
                gridTemplateColumns: `repeat(${interestedProductsConfig.fields.length}, 1fr) auto`,
              }}
            >
              {interestedProductsConfig.fields.map((field) => (
                <div
                  key={field.id}
                  className="px-2 py-1 text-xs font-medium text-black uppercase tracking-wide"
                >
                  {field.fieldName}
                </div>
              ))}
              <div className="px-2 py-1"></div>
            </div>

            {/* Product Rows */}
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-3 items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                style={{
                  gridTemplateColumns: `repeat(${interestedProductsConfig.fields.length}, 1fr) auto`,
                }}
              >
                {interestedProductsConfig.fields.map((field) => (
                  <div key={field.id}>{renderField(field, product)}</div>
                ))}

                {/* Save & Delete Buttons */}
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => saveProductRow(product)}
                    className="h-[38px] px-3 flex items-center justify-center text-white bg-green-600 hover:bg-green-700 border border-green-700 rounded-lg transition-colors text-xs"
                    title="Save product"
                    disabled={isLoading}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="h-[38px] w-[38px] flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-300 rounded-lg transition-colors"
                    title="Delete product"
                    disabled={isLoading}
                  >
                    <RiDeleteBinLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterestedProductForm;
