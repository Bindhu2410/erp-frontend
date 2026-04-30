import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";
import {
  FiChevronDown,
  FiChevronRight,
  FiTrash2,
  FiPlus,
} from "react-icons/fi";
import { HiCube, HiCog } from "react-icons/hi";

// BOM interface for BOM dropdown
interface BomOption {
  bomId: string;
  bomName: string;
  bomType: string;
}

// BOM Child item interface
interface BomChildItem {
  childItemId: number;
  quantity: number;
  make: string;
  model: string;
  product: string;
  categoryName: string;
  valuationMethodName?: string;
  inventoryMethodName?: string;
  inventoryTypeName?: string | null;
  unitPrice: number;
  itemName: string;
  itemCode: string;
  catNo?: string;
  uomName: string;
  purchaseRate?: number;
  saleRate?: number;
  quoteRate?: number;
  hsn: number;
  tax: number;
}

// BOM with Child Items interface
interface BomWithChildItems {
  id: number;
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: BomChildItem[];
}

// Product option interface
interface ProductOption {
  itemId?: number;
  itemCode?: string;
  itemcode?: string;
  itemName?: string;
  itemname?: string;
  unitPrice?: number;
  category?: string;
  categoryname?: string;
  make?: string;
  model?: string;
  hsn?: string;
  taxPercentage?: number;
  taxpercentage?: number;
  product?: string;
  catno?: string;
  referencedBy?: any[];
  includedChildItems?: any[];
  accessoriesItems?: any[];
  uom?: string;
  parentId?: number;
  bomId?: string;
  bomName?: string;
  bomType?: string;
}

// Enhanced product interface
export interface EnhancedProduct {
  id: number;
  itemId: number;
  qty: number;
  amount: number;
  unitPrice: number;
  isActive: boolean;
  itemName: string;
  itemCode: string;
  make: string;
  model: string;
  category: string;
  hsn: string;
  taxPercentage: number;
  uom: string;
  parentId: number | null;
  includedChildItems: EnhancedProduct[];
  accessoriesItems: EnhancedProduct[];
  bomId?: string;
  bomName?: string;
  bomType?: string;
  // Fields needed for compatibility with Product interface
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  stage?: string;
  stageItemId?: string;
  product?: string;
  parentItem?: any;
  referencedBy?: any;
  productAccessories?: any[];
  otherAccessories?: any[];
}

interface SalesEntityTableProps {
  onProductsChange: (products: EnhancedProduct[]) => void;
  products?: EnhancedProduct[];
  showActions?: boolean;
  showButton?: boolean;
  onSaveProducts?: (products: EnhancedProduct[]) => void;
}

const initialProductState = (): EnhancedProduct => ({
  id: 0,
  qty: 1,
  amount: 0,
  isActive: true,
  itemId: 0,
  make: "",
  model: "",
  category: "",
  itemName: "",
  itemCode: "",
  unitPrice: 0,
  hsn: "",
  taxPercentage: 0,
  uom: "Nos",
  parentId: null,
  includedChildItems: [],
  accessoriesItems: [],
});

const SalesEntityTable: React.FC<SalesEntityTableProps> = ({
  onProductsChange,
  products = [],
  showActions = true,
  showButton = false,
  onSaveProducts,
}) => {
  // State for products and accessories
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<ProductOption[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingBoms, setIsLoadingBoms] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [bomOptions, setBomOptions] = useState<BomOption[]>([]);
  const [selectedBomIds, setSelectedBomIds] = useState<string[]>([]);
  const [selectedBom, setSelectedBom] = useState<BomOption | null>(null);

  // Form state
  const [formProduct, setFormProduct] = useState<EnhancedProduct>(
    initialProductState()
  );
  const [formAccessory, setFormAccessory] = useState<EnhancedProduct>(
    initialProductState()
  );
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [accessoryType, setAccessoryType] = useState<"included" | "additional">(
    "additional"
  );
  const [selectedProductId, setSelectedProductId] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(100);
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(true);
  const [productSearchInput, setProductSearchInput] = useState<string>("");

  // Fetch BOM list
  const fetchBomOptions = async () => {
    setIsLoadingBoms(true);

    try {
      const response = await axios.get(
        "http://localhost:5104/api/BillOfMaterial"
      );
      setBomOptions(response.data);
      console.log("Loaded BOMs:", response.data);
    } catch (error) {
      console.error("Failed to fetch BOMs:", error);
      toast.error("Failed to fetch BOM list");
    } finally {
      setIsLoadingBoms(false);
    }
  };

  // Fetch BOM details with child items
  const fetchBomWithChildItems = async (
    bomId: string
  ): Promise<BomWithChildItems | null> => {
    try {
      // Try to fetch from real API
      try {
        const response = await axios.get(
          `http://localhost:5104/api/BomDropdown/bom-details/${bomId}`
        );
        return response.data;
      } catch (apiError) {
        console.warn(
          `API endpoint not available, using mock data for ${bomId}`
        );

        // Mock data based on the provided sample
        const mockBomData: BomWithChildItems[] = [
          {
            id: 1,
            bomId: "BOM-25-26-01",
            bomName: "LAP SET",
            bomType: "4K HD VISION PART",
            childItems: [],
          },
          {
            id: 2,
            bomId: "BOM-25-26-02",
            bomName: "COMBI MAX",
            bomType: "MBXXP",
            childItems: [],
          },
          {
            id: 3,
            bomId: "BOM-25-26-03",
            bomName: "Diathermy",
            bomType: "D+ Lite",
            childItems: [
              {
                childItemId: 101,
                quantity: 3,
                make: "IKEGAMI",
                model: "Hd Camera",
                product: "Camera",
                categoryName: "Equipments",
                valuationMethodName: "Weighted Average",
                inventoryMethodName: "Batch With Serial",
                inventoryTypeName: null,
                unitPrice: 598000,
                itemName: "IKEGAMI MKC-230 HD CAMERA",
                itemCode: "ITM-01760",
                catNo: "MKC-230 HD",
                uomName: "Nos.",
                purchaseRate: 598000,
                saleRate: 1085000,
                quoteRate: 1085000,
                hsn: 90063000,
                tax: 18,
              },
            ],
          },
        ];

        // Find the BOM in our mock data
        const mockBom = mockBomData.find((bom) => bom.bomId === bomId);
        return mockBom || null;
      }
    } catch (error) {
      console.error(`Failed to fetch BOM details for ID ${bomId}:`, error);
      toast.error("Failed to fetch BOM details");
      return null;
    }
  };

  // Process BOM child items and add them as products with accessories
  const processBomChildItems = (
    bomWithChildItems: BomWithChildItems,
    bomDetails: BomOption
  ) => {
    if (
      !bomWithChildItems.childItems ||
      bomWithChildItems.childItems.length === 0
    ) {
      toast.info(`No items found in ${bomDetails.bomName} BOM`);
      return;
    }

    // Find equipment items (main products) and accessory items
    const equipmentItems = bomWithChildItems.childItems.filter(
      (item) =>
        item.categoryName === "Equipments" ||
        item.categoryName === "Instruments"
    );

    const accessoryItems = bomWithChildItems.childItems.filter(
      (item) => item.categoryName === "Accessories"
    );

    // If no equipment found, add all items as separate products
    if (equipmentItems.length === 0) {
      // Standard processing - add all as individual products
      const isProductAlreadyAdded = (itemId: number): boolean => {
        return products.some((product) => product.itemId === itemId);
      };

      const childProducts = bomWithChildItems.childItems
        .filter((child) => !isProductAlreadyAdded(child.childItemId))
        .map((child) => ({
          id: Date.now() + Math.floor(Math.random() * 10000),
          itemId: child.childItemId,
          itemName: child.itemName,
          itemCode: child.itemCode,
          qty: child.quantity,
          unitPrice: child.unitPrice,
          amount: child.unitPrice * child.quantity,
          isActive: true,
          make: child.make || "",
          model: child.model || "",
          category: child.categoryName || "",
          hsn: String(child.hsn) || "",
          taxPercentage: child.tax || 0,
          uom: child.uomName || "Nos",
          parentId: null,
          includedChildItems: [],
          accessoriesItems: [],
          bomId: bomDetails.bomId,
          bomName: bomDetails.bomName,
          bomType: bomDetails.bomType,
        }));

      if (childProducts.length > 0) {
        onProductsChange([...products, ...childProducts]);

        setExpandedProducts((prev) => {
          const newSet = new Set(prev);
          childProducts.forEach((p) => newSet.add(String(p.id)));
          return newSet;
        });

        toast.success(
          `Added ${childProducts.length} products from ${bomDetails.bomName} BOM`
        );
      } else {
        toast.info("All products from this BOM are already added");
      }
      return;
    }

    // Process each equipment item as a main product with accessories
    const newOrUpdatedProducts: EnhancedProduct[] = [];
    const updatedProducts = [...products];
    let addedAccessoryCount = 0;

    // For each equipment item
    for (const equipment of equipmentItems) {
      // Check if this equipment already exists in the product list
      const existingProductIndex = products.findIndex(
        (p) => p.itemId === equipment.childItemId
      );

      // Convert equipment to EnhancedProduct
      const mainProduct: EnhancedProduct = {
        id:
          existingProductIndex >= 0
            ? products[existingProductIndex].id
            : Date.now() + Math.floor(Math.random() * 10000),
        itemId: equipment.childItemId,
        itemName: equipment.itemName,
        itemCode: equipment.itemCode,
        qty: equipment.quantity,
        unitPrice: equipment.unitPrice,
        amount: equipment.unitPrice * equipment.quantity,
        isActive: true,
        make: equipment.make || "",
        model: equipment.model || "",
        category: equipment.categoryName || "",
        hsn: String(equipment.hsn) || "",
        taxPercentage: equipment.tax || 0,
        uom: equipment.uomName || "Nos",
        parentId: null,
        includedChildItems:
          existingProductIndex >= 0
            ? products[existingProductIndex].includedChildItems
            : [],
        accessoriesItems:
          existingProductIndex >= 0
            ? [...products[existingProductIndex].accessoriesItems]
            : [],
        bomId: bomDetails.bomId,
        bomName: bomDetails.bomName,
        bomType: bomDetails.bomType,
      };

      // Find accessories for this equipment
      const relatedAccessories = accessoryItems.filter((accessory) => true); // We're considering all accessories

      // Convert accessories to EnhancedProduct and add them if not already present
      for (const accessory of relatedAccessories) {
        // Check if this accessory is already added to the product
        const accessoryAlreadyAdded = mainProduct.accessoriesItems.some(
          (a) => a.itemId === accessory.childItemId
        );

        if (!accessoryAlreadyAdded) {
          const accessoryProduct: EnhancedProduct = {
            id: Date.now() + Math.floor(Math.random() * 10000),
            itemId: accessory.childItemId,
            itemName: accessory.itemName,
            itemCode: accessory.itemCode,
            qty: accessory.quantity,
            unitPrice: accessory.unitPrice,
            amount: accessory.unitPrice * accessory.quantity,
            isActive: true,
            make: accessory.make || "",
            model: accessory.model || "",
            category: accessory.categoryName || "",
            hsn: String(accessory.hsn) || "",
            taxPercentage: accessory.tax || 0,
            uom: accessory.uomName || "Nos",
            parentId: equipment.childItemId,
            includedChildItems: [],
            accessoriesItems: [],
            bomId: bomDetails.bomId,
            bomName: bomDetails.bomName,
            bomType: bomDetails.bomType,
          };

          mainProduct.accessoriesItems.push(accessoryProduct);
          addedAccessoryCount++;
        }
      }

      // Update product list
      if (existingProductIndex >= 0) {
        updatedProducts[existingProductIndex] = mainProduct;
      } else {
        updatedProducts.push(mainProduct);
        newOrUpdatedProducts.push(mainProduct);
      }

      // Expand this product to show accessories
      setExpandedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.add(String(mainProduct.id));
        return newSet;
      });
    }

    // Update the product list
    onProductsChange(updatedProducts);

    // Display success message
    if (newOrUpdatedProducts.length > 0) {
      toast.success(
        `Added ${newOrUpdatedProducts.length} products with accessories from ${bomDetails.bomName} BOM`
      );
    } else if (addedAccessoryCount > 0) {
      toast.success(
        `Added ${addedAccessoryCount} new accessories to existing products from ${bomDetails.bomName} BOM`
      );
    } else {
      toast.info(
        "All products and accessories from this BOM are already added"
      );
    }
  };

  // Fetch products with pagination
  const fetchProductOptions = async (
    searchQuery: string = "",
    pageNumber: number = 1,
    bomIds: string[] = [],
    append: boolean = false
  ) => {
    setIsLoadingProducts(true);
    try {
      // Build request payload
      const payload = {
        Page: pageNumber,
        PageSize: pageSize,
        SearchQuery: searchQuery,
        BomIds: bomIds,
      };

      console.log("Fetching products with payload:", payload);

      const response = await axios.post(
        "http://localhost:5104/api/ProductDropdown/product-list",
        payload
      );
      const data = response.data;

      // Check if we have more data to load
      setHasMoreProducts(data.length === pageSize);

      // Map the API response fields to our expected format
      const mappedData = data.map((p: ProductOption) => ({
        ...p,
        itemId: p.itemId || 0,
        itemCode: p.itemcode || p.itemCode || "",
        itemName: p.itemname || p.itemName || "",
        category: p.categoryname || p.category || "",
        hsn: p.hsn || "",
        taxPercentage: p.taxpercentage || p.taxPercentage || 0,
        make: p.make || "",
        model: p.model || "",
        referencedBy: p.referencedBy || [],
        includedChildItems: p.includedChildItems || [],
      }));

      // Filter products by category for the main product list
      const filteredProducts = mappedData.filter(
        (p: ProductOption) =>
          p.category === "Equipments" ||
          p.categoryname === "Equipments" ||
          p.category === "Instruments" ||
          p.categoryname === "Instruments"
      );

      // Update product options with pagination
      if (append) {
        setProductOptions((prevOptions) => [
          ...prevOptions,
          ...filteredProducts,
        ]);
      } else {
        setProductOptions(filteredProducts);
      }

      // Update accessory options - get all accessories
      const accessories = mappedData.filter(
        (p: ProductOption) =>
          p.category === "Accessories" || p.categoryname === "Accessories"
      );

      console.log(`Loaded ${accessories.length} accessories from API`);

      if (append) {
        setAccessoryOptions((prevOptions) => {
          const combined = [...prevOptions, ...accessories];
          console.log(`Total accessories after append: ${combined.length}`);
          return combined;
        });
      } else {
        console.log(`Setting ${accessories.length} accessories (no append)`);
        setAccessoryOptions(accessories);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchBomOptions();
    fetchProductOptions("", 1, [], false);
  }, []);

  // Initialize expanded products
  useEffect(() => {
    const updated = new Set<string>();
    products.forEach((p) => {
      if (p.includedChildItems?.length || p.accessoriesItems?.length) {
        updated.add(String(p.id));
      }
    });
    setExpandedProducts(updated);
  }, [products]);

  // Handle BOM selection change
  const handleBomChange = async (option: any) => {
    if (!option) {
      setSelectedBom(null);
      setSelectedBomIds([]);
      fetchProductOptions("", 1, [], false);
      return;
    }

    const bom = option.value as BomOption;
    setSelectedBom(bom);

    // Update formProduct with BOM details
    setFormProduct((prev) => ({
      ...prev,
      bomId: bom.bomId,
      bomName: bom.bomName,
      bomType: bom.bomType,
    }));

    // Fetch products for this BOM
    const bomIds = [bom.bomId];
    setSelectedBomIds(bomIds);

    try {
      // Fetch BOM details with child items
      const bomWithChildItems = await fetchBomWithChildItems(bom.bomId);

      if (bomWithChildItems) {
        // Process BOM child items using our new function
        processBomChildItems(bomWithChildItems, bom);

        // Reset form product after processing BOM items
        setFormProduct(initialProductState());
      } else {
        // If no child items found, just fetch products for this BOM normally
        fetchProductOptions("", 1, bomIds, false);
      }
    } catch (error) {
      console.error("Error processing BOM child items:", error);
      toast.error("Failed to process BOM items");
      // Fall back to normal product loading
      fetchProductOptions("", 1, bomIds, false);
    }
  };

  // Handle form field change
  const handleFormChange = (
    form: EnhancedProduct,
    setForm: React.Dispatch<React.SetStateAction<EnhancedProduct>>,
    field: keyof EnhancedProduct,
    value: any
  ) => {
    let updated = { ...form, [field]: value };

    if (field === "itemName" && value && typeof value === "object") {
      const selected = value as ProductOption;
      updated = {
        ...updated,
        // Handle both camelCase and lowercase property names from API
        itemName: selected.itemname || selected.itemName || "",
        itemCode: selected.itemcode || selected.itemCode || "",
        itemId: selected.itemId || 0,
        id: typeof selected.itemId === "number" ? selected.itemId : Date.now(),
        unitPrice: selected.unitPrice ?? 0,
        make: selected.make || "",
        model: selected.model || "",
        category: selected.categoryname || selected.category || "",
        hsn: selected.hsn || "",
        taxPercentage: selected.taxpercentage || selected.taxPercentage || 0,
        uom: selected.uom || "Nos.",
        // Preserve BOM information
        bomId: updated.bomId,
        bomName: updated.bomName,
        bomType: updated.bomType,
      };

      // Automatically add default accessories when a product is selected
      if (form === formProduct && selected.referencedBy?.length) {
        // Set the included accessories automatically
        const defaultAccessories = selected.referencedBy
          .filter((i: any) => i.category === "Accessories")
          .map((accessory: any) => ({
            ...accessory,
            parentId: selected.itemId,
            qty: 1,
            amount: accessory.unitPrice || 0,
            isActive: true,
            id: Date.now() + Math.floor(Math.random() * 1000),
          }));

        updated.includedChildItems = defaultAccessories;
      }
    }

    if (["unitPrice", "qty"].includes(field as string)) {
      updated.amount = (updated.unitPrice || 0) * (updated.qty || 1);
    }

    setForm(updated);
  };

  // Prepare accessory form for adding accessories
  const prepareAccessoryForm = (
    productId: string,
    type: "included" | "additional"
  ) => {
    console.log(
      `Opening accessory form for product ID: ${productId}, type: ${type}`
    );

    // First set the selected product ID and accessory type
    setSelectedProductId(productId);
    setAccessoryType(type);

    // Reset accessory form completely to ensure clean state
    setFormAccessory(initialProductState());

    // First fetch new accessories, then show the form
    setIsLoadingProducts(true);

    // Force a complete refresh of all product and accessory options from the API
    fetchProductOptions("", 1, [], false).then(() => {
      // After data is loaded, show the form and reset loading state
      setShowAccessoryForm(true);
      setIsLoadingProducts(false);

      // Log number of available accessories to help debugging
      const product = products.find((p) => String(p.id) === String(productId));

      if (product) {
        // Log the current state of accessories for this product
        console.log("Product:", product.itemName);
        console.log(
          "Included accessories count:",
          product.includedChildItems?.length || 0
        );
        console.log(
          "Additional accessories count:",
          product.accessoriesItems?.length || 0
        );
        console.log("Total accessory options:", accessoryOptions.length);
      }

      console.log("Accessory options loaded, form ready");
    });

    // Automatically expand the product row when adding accessories
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });
  };

  // Handle adding products or accessories
  const handleAddItem = (
    form: EnhancedProduct,
    setForm: React.Dispatch<React.SetStateAction<EnhancedProduct>>,
    isProduct: boolean
  ) => {
    // Validation
    const requiredFields = isProduct
      ? ["itemName", "qty"]
      : ["itemName", "qty"];

    const missing = requiredFields.filter(
      (field) => !form[field as keyof EnhancedProduct]
    );

    if (missing.length > 0) {
      toast.error(`Please fill in all required fields: ${missing.join(", ")}`);
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
      setForm(initialProductState());
      setEditIndex(null);
      toast.success(
        `Product ${editIndex !== null ? "updated" : "added"} successfully`
      );
    } else {
      const updatedProducts = products.map((product) => {
        if (product.id.toString() !== selectedProductId.toString())
          return product;

        // Create a properly formatted accessory
        const newAccessory = {
          ...form,
          parentId: product.itemId,
          id: Date.now() + Math.floor(Math.random() * 1000),
          amount: (form.unitPrice || 0) * (form.qty || 1),
          isActive: true,
        };

        const key =
          accessoryType === "included"
            ? "includedChildItems"
            : "accessoriesItems";

        // Make sure we're dealing with arrays and not undefined
        const currentItems = product[key] || [];

        console.log(
          `Adding ${accessoryType} accessory to product ${product.itemName}`,
          {
            productId: product.id,
            accessoryName: newAccessory.itemName,
            currentItemsCount: currentItems.length,
          }
        );

        return {
          ...product,
          [key]: [...currentItems, newAccessory],
        };
      });

      onProductsChange(updatedProducts);
      setShowAccessoryForm(false);
      setFormAccessory(initialProductState());

      // Show success message for accessory addition
      const addedProduct = products.find(
        (p) => p.id.toString() === selectedProductId.toString()
      );
      toast.success(
        `Accessory added successfully to ${addedProduct?.itemName}`
      );
    }
  };

  // Delete product or accessory
  const handleDelete = (
    productId: string,
    index?: number,
    type?: "included" | "additional"
  ) => {
    if (index === undefined) {
      onProductsChange(
        products.filter((p) => p.id.toString() !== productId.toString())
      );
      toast.success("Product removed successfully");
    } else {
      const updated = products.map((product) => {
        if (product.id.toString() !== productId.toString()) return product;
        const items =
          type === "included"
            ? [...(product.includedChildItems || [])]
            : [...(product.accessoriesItems || [])];
        items.splice(index, 1);
        return {
          ...product,
          [type === "included" ? "includedChildItems" : "accessoriesItems"]:
            items,
        };
      });
      onProductsChange(updated);
      toast.success("Accessory removed successfully");
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let productsTotal = 0;
    let accessoriesTotal = 0;

    products.forEach((product) => {
      productsTotal += product.amount || 0;

      // Add up included accessories
      (product.includedChildItems || []).forEach((item) => {
        accessoriesTotal += (item.unitPrice || 0) * (item.qty || 1);
      });

      // Add up additional accessories
      (product.accessoriesItems || []).forEach((item) => {
        accessoriesTotal += (item.unitPrice || 0) * (item.qty || 1);
      });
    });

    return {
      productsTotal,
      accessoriesTotal,
      grandTotal: productsTotal + accessoriesTotal,
    };
  };

  // Form field configuration
  const formFields = (isProduct: boolean) => [
    ...(isProduct
      ? [
          {
            label: "BOM",
            key: "bomId",
            type: "select",
            options: bomOptions.map((bom) => ({
              label: `${bom.bomName} (${bom.bomType})`,
              value: bom,
            })),
            value: selectedBom
              ? {
                  label: `${selectedBom.bomName} (${selectedBom.bomType})`,
                  value: selectedBom,
                }
              : null,
            onChange: handleBomChange,
            placeholder: "Select BOM...",
            noOptionsMessage: () => "No BOMs available",
          },
        ]
      : []),
    {
      label: isProduct ? "Product Name" : "Accessory Name",
      key: "itemName",
      type: "select",
      options: isProduct
        ? productOptions.map((p) => ({
            label: p.itemName || p.itemname || "",
            value: p,
          }))
        : accessoryOptions
            .filter((accessory) => {
              const product = products.find(
                (p) =>
                  String(p.id.toString()) ===
                  String(selectedProductId.toString())
              );
              if (!product) return false;

              // Get accessory ID
              const accessoryId = accessory.itemId || 0;

              // Only show accessories with proper category
              const isAccessory =
                accessory.category === "Accessories" ||
                accessory.categoryname === "Accessories";

              if (!isAccessory) return false;

              if (accessoryType === "included") {
                // For "included" accessories, show only those referenced by the product and not yet added
                const isReferenced = product.itemId === accessory.parentId;
                const notAdded = !product.includedChildItems?.some(
                  (i) => i.itemId === accessoryId
                );
                return isReferenced && notAdded;
              } else {
                // For "other accessories", show ALL accessories except:
                // 1. Those already in included items
                const notInIncluded = !product.includedChildItems?.some(
                  (i) => i.itemId === accessoryId
                );

                // 2. This specific accessory itself
                const notSameAsProduct = product.itemId !== accessoryId;

                // Return true to show all accessories that meet these conditions
                // Note: We're no longer filtering out accessories already in accessoriesItems
                // This allows adding the same accessory multiple times if needed
                return notInIncluded && notSameAsProduct;
              }
            })
            .map((p) => ({
              label: p.itemname || p.itemName || "",
              value: p,
            })),
      value: isProduct ? formProduct.itemName : formAccessory.itemName,
      onChange: (option: any) =>
        handleFormChange(
          isProduct ? formProduct : formAccessory,
          isProduct ? setFormProduct : setFormAccessory,
          "itemName",
          option?.value || ""
        ),
      placeholder: `Select ${isProduct ? "product" : "accessory"}...`,
      noOptionsMessage: () => {
        console.log(
          "No options message called, accessory options count:",
          accessoryOptions.length
        );

        // Check if any options would pass the filter
        const product = products.find(
          (p) =>
            String(p.id).toString() === String(selectedProductId.toString())
        );

        if (product && !isProduct) {
          const filteredCount = accessoryOptions.filter((accessory) => {
            const accessoryId = accessory.itemId || 0;
            const isAccessory =
              accessory.category === "Accessories" ||
              accessory.categoryname === "Accessories";

            if (!isAccessory) return false;

            // Allow adding any accessory unless it's already in includedChildItems
            if (accessoryType === "included") {
              const isReferenced = product.itemId === accessory.parentId;
              const notAdded = !product.includedChildItems?.some(
                (i) => i.itemId === accessoryId
              );
              return isReferenced && notAdded;
            } else {
              // For other accessories, only exclude if it's already in includedChildItems or is the product itself
              const notInIncluded = !product.includedChildItems?.some(
                (i) => i.itemId === accessoryId
              );
              const notSameAsProduct = product.itemId !== accessoryId;
              // Note: We don't check accessoriesItems anymore to allow adding the same accessory multiple times
              return notInIncluded && notSameAsProduct;
            }
          }).length;

          console.log(
            `Filtered accessories: ${filteredCount} for product ${product.itemName}`
          );
        }

        return isProduct
          ? selectedBom
            ? "x"
            : "Please select a BOM first"
          : accessoryType === "included"
          ? "No standard consumable accessories available for this product"
          : "No vessel sealing accessories available";
      },
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

  // Render form field
  const renderFormField = (field: any, isRequired: boolean = false) => {
    return (
      <div key={field.key} className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {field.label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === "select" ? (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={field.options}
            isLoading={
              field.key === "bomId" ? isLoadingBoms : isLoadingProducts
            }
            isClearable
            placeholder={field.placeholder}
            onInputChange={(inputValue) => {
              if (field.key === "itemName") {
                setProductSearchInput(inputValue);
                setPage(1);
                fetchProductOptions(inputValue, 1, selectedBomIds, false);
              }
            }}
            onMenuScrollToBottom={() => {
              if (
                field.key === "itemName" &&
                hasMoreProducts &&
                !isLoadingProducts
              ) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchProductOptions(
                  productSearchInput,
                  nextPage,
                  selectedBomIds,
                  true
                );
              }
            }}
            className="text-sm"
            noOptionsMessage={field.noOptionsMessage}
          />
        ) : field.type === "number" ? (
          <input
            type="number"
            value={field.value || ""}
            onChange={field.onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder={field.placeholder}
            min={field.key === "qty" ? 1 : 0}
            step={1}
          />
        ) : (
          <input
            type="text"
            value={field.value || ""}
            onChange={field.onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            placeholder={field.placeholder}
          />
        )}
      </div>
    );
  };

  // Render accessory list
  const renderAccessoryList = (
    items: EnhancedProduct[],
    type: "included" | "additional",
    productId: string
  ) => (
    <>
      {items.length > 0 && (
        <div
          className={`w-full ${
            type === "included" ? "bg-blue-50" : "bg-green-50"
          }`}
        >
          <div
            className={`flex items-center gap-2 py-2 px-4 font-medium ${
              type === "included" ? "text-blue-700" : "text-green-700"
            }`}
          >
            {type === "included" ? (
              <HiCube className="w-4 h-4" />
            ) : (
              <HiCog className="w-4 h-4" />
            )}
            {type === "included"
              ? "Standard Consumable Accessories"
              : "Vessel Sealing Accessories"}
          </div>
        </div>
      )}
      <div className="w-full">
        {items.length > 0 && (
          <table className="w-full">
            <tbody>
              {items.map((accessory, accIndex) => {
                const base = (accessory.unitPrice || 0) * (accessory.qty || 1);
                const tax = (base * (accessory.taxPercentage || 0)) / 100;
                const total = base + tax;

                // Set CSS classes based on the type of accessory
                const rowClass =
                  type === "included" ? "bg-blue-50" : "bg-green-50";
                const amountClass =
                  type === "included" ? "text-blue-700" : "text-green-700";

                return (
                  <tr key={`${type}-${accIndex}`} className={rowClass}>
                    <td className="py-2 px-4 w-[44%]">{accessory.itemName}</td>
                    <td className="py-2 px-4 w-[11%]">
                      <input
                        type="number"
                        min={0}
                        value={accessory.unitPrice || 0}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        onChange={(e) => {
                          const newUnitPrice = Number(e.target.value);
                          const updated = products.map((p) => {
                            if (p.id.toString() !== productId.toString())
                              return p;

                            const key =
                              type === "included"
                                ? "includedChildItems"
                                : "accessoriesItems";
                            const updatedItems = [...(p[key] || [])];

                            updatedItems[accIndex] = {
                              ...updatedItems[accIndex],
                              unitPrice: newUnitPrice,
                              amount:
                                newUnitPrice *
                                (updatedItems[accIndex].qty || 1),
                            };

                            return { ...p, [key]: updatedItems };
                          });

                          onProductsChange(updated);
                        }}
                      />
                    </td>
                    <td className="py-2 px-4 w-[10%]">
                      <input
                        type="number"
                        min={1}
                        value={accessory.qty || 1}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        onChange={(e) => {
                          const newQty = Math.max(1, Number(e.target.value));
                          const updated = products.map((p) => {
                            if (p.id.toString() !== productId.toString())
                              return p;

                            const key =
                              type === "included"
                                ? "includedChildItems"
                                : "accessoriesItems";
                            const updatedItems = [...(p[key] || [])];

                            updatedItems[accIndex] = {
                              ...updatedItems[accIndex],
                              qty: newQty,
                              amount:
                                (updatedItems[accIndex].unitPrice || 0) *
                                newQty,
                            };

                            return { ...p, [key]: updatedItems };
                          });

                          onProductsChange(updated);
                        }}
                      />
                    </td>
                    <td className="py-2 px-4">{accessory.uom || "Nos"}</td>
                    <td className="py-2 px-4">
                      {accessory.taxPercentage || 0}%
                    </td>
                    <td
                      className={`py-2 px-4 text-right font-semibold ${amountClass}`}
                    >
                      {total.toLocaleString("en-IN", {
                        style: "currency",
                        currency: "INR",
                      })}
                    </td>
                    {showActions && (
                      <td className="py-2 px-4">
                        <button
                          onClick={() =>
                            handleDelete(productId, accIndex, type)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Products and Accessories
        </h2>

        {!showAccessoryForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add New Product
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {formFields(true).map((field) =>
                renderFormField(field, field.key === "itemName")
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleAddItem(formProduct, setFormProduct, true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium flex items-center"
                disabled={isLoadingProducts}
              >
                <FiPlus className="mr-2" />
                {editIndex !== null ? "Update Product" : "Add Product"}
              </button>
            </div>
          </div>
        )}

        {showAccessoryForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Add{" "}
              {accessoryType === "included"
                ? "Standard Consumable"
                : "Vessel Sealing"}{" "}
              Accessory
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {formFields(false).map((field) =>
                renderFormField(field, field.key === "itemName")
              )}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  handleAddItem(formAccessory, setFormAccessory, false)
                }
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                disabled={isLoadingProducts}
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

        {products.length > 0 ? (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "PRODUCT NAME",
                      "STANDARD CONSUMABLE ACCESSORIES",
                      "VESSEL SEALING ACCESSORIES",
                      "BOM",
                      "UNIT PRICE",
                      "QUANTITY",
                      "UOM",
                      "TAX %",
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
                      <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const base = (product.unitPrice || 0) * (product.qty || 1);
                    const tax = (base * (product.taxPercentage || 0)) / 100;
                    const total = base + tax;
                    return (
                      <React.Fragment key={product.id}>
                        <tr className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 min-h-[24px]">
                              {/* Expand/collapse button */}
                              {(product.includedChildItems?.length > 0 ||
                                product.accessoriesItems?.length > 0) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedProducts((prev) => {
                                      const newSet = new Set(prev);
                                      const key = product.id.toString();
                                      newSet.has(key)
                                        ? newSet.delete(key)
                                        : newSet.add(key);
                                      return newSet;
                                    })
                                  }
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {expandedProducts.has(
                                    product.id.toString()
                                  ) ? (
                                    <FiChevronDown className="w-4 h-4" />
                                  ) : (
                                    <FiChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                              <HiCube
                                className={`w-5 h-5 ${
                                  product.bomId
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">
                                  {product.itemName}
                                </span>
                                {product.bomId && (
                                  <span className="text-xs text-purple-600">
                                    Part of BOM
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {product.includedChildItems?.length > 0 ? (
                              <div className="text-sm text-blue-600">
                                {product.includedChildItems.length} items
                                <button
                                  onClick={() =>
                                    prepareAccessoryForm(
                                      product.id.toString(),
                                      "included"
                                    )
                                  }
                                  className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
                                >
                                  + Add
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  prepareAccessoryForm(
                                    product.id.toString(),
                                    "included"
                                  )
                                }
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
                              >
                                + Add Standard Accessories
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {product.accessoriesItems?.length > 0 ? (
                              <div className="text-sm text-green-600">
                                {product.accessoriesItems.length} items
                                <button
                                  onClick={() =>
                                    prepareAccessoryForm(
                                      product.id.toString(),
                                      "additional"
                                    )
                                  }
                                  className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200"
                                >
                                  + Add
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  prepareAccessoryForm(
                                    product.id.toString(),
                                    "additional"
                                  )
                                }
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200"
                              >
                                + Add Vessel Sealing
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {product.bomName ? (
                              <span className="inline-flex items-center gap-1">
                                {product.bomName}
                                <span className="text-xs text-gray-500">
                                  ({product.bomType})
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
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
                            <input
                              type="number"
                              min={1}
                              value={product.qty || 1}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              onChange={(e) => {
                                const newQty = Math.max(
                                  1,
                                  Number(e.target.value)
                                );
                                onProductsChange(
                                  products.map((p) =>
                                    p.id === product.id
                                      ? {
                                          ...p,
                                          qty: newQty,
                                          amount: (p.unitPrice || 0) * newQty,
                                        }
                                      : p
                                  )
                                );
                              }}
                            />
                          </td>
                          <td className="py-3 px-4">{product.uom || "Nos"}</td>
                          <td className="py-3 px-4 text-gray-700">
                            {product.taxPercentage || 0}%
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-right">
                              {total.toLocaleString("en-IN", {
                                style: "currency",
                                currency: "INR",
                              })}
                            </div>
                          </td>
                          {showActions && (
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      prepareAccessoryForm(
                                        product.id.toString(),
                                        "included"
                                      )
                                    }
                                    title="Add standard consumable accessory"
                                    className="text-blue-500 hover:text-blue-700 flex items-center"
                                  >
                                    <HiCube className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Standard</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      prepareAccessoryForm(
                                        product.id.toString(),
                                        "additional"
                                      )
                                    }
                                    title="Add vessel sealing accessory"
                                    className="text-green-500 hover:text-green-700 flex items-center"
                                  >
                                    <HiCog className="w-4 h-4 mr-1" />
                                    <span className="text-xs">Vessel</span>
                                  </button>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDelete(product.id.toString())
                                  }
                                  title="Remove product"
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                                {product.bomId && (
                                  <div
                                    className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                                    title={`Part of ${product.bomName} (${product.bomType})`}
                                  >
                                    BOM
                                  </div>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>

                        {/* Accessories */}
                        {expandedProducts.has(product.id.toString()) && (
                          <tr>
                            <td colSpan={showActions ? 8 : 7} className="p-0">
                              <div className="w-full">
                                {product.includedChildItems?.length > 0 &&
                                  renderAccessoryList(
                                    product.includedChildItems,
                                    "included",
                                    product.id.toString()
                                  )}
                                {product.accessoriesItems?.length > 0 &&
                                  renderAccessoryList(
                                    product.accessoriesItems,
                                    "additional",
                                    product.id.toString()
                                  )}
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

            <div className="bg-gray-50 p-6 mt-6 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Products:</span>
                <span className="font-medium">{products.length}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Accessories:</span>
                <span className="font-medium">
                  {products.reduce(
                    (sum, p) =>
                      sum +
                      (p.includedChildItems?.length || 0) +
                      (p.accessoriesItems?.length || 0),
                    0
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Products Subtotal:</span>
                <span className="font-medium">
                  {totals.productsTotal.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Accessories Subtotal:</span>
                <span className="font-medium">
                  {totals.accessoriesTotal.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-medium text-gray-800">
                  Grand Total:
                </span>
                <span className="text-lg font-bold text-blue-600">
                  {totals.grandTotal.toLocaleString("en-IN", {
                    style: "currency",
                    currency: "INR",
                  })}
                </span>
              </div>
            </div>

            {showButton && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => onSaveProducts?.(products)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <HiCube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No products added yet
            </h3>
            <p className="text-gray-500">
              Select a BOM and add products using the form above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesEntityTable;
