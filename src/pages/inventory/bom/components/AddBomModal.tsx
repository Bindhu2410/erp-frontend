import React, { useState, useEffect } from "react";
import {
  FaPlus as Plus,
  FaSave as Save,
  FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { LuHash as Hash } from "react-icons/lu";
import Modal from "../../../../components/common/Modal";
import { BomDetails } from "../types";
import { RateMaster } from "../../../../types/rateMaster";
import api from "../../../../services/api";

interface BomTemplate {
  id: number;
  userCreated: string | null;
  dateCreated: string;
  userUpdated: string | null;
  dateUpdated: string | null;
  name: string;
  type: string[];
}

interface QuotationTitle {
  id: number;
  userCreated: string | null;
  dateCreated: string | null;
  userUpdated: string | null;
  dateUpdated: string | null;
  title: string;
}

interface TcTemplate {
  id: number;
  userCreated: number | null;
  dateCreated: string | null;
  userUpdated: number | null;
  dateUpdated: string | null;
  moduleName?: string;
  templateName?: string;
  template_name?: string;
  templateDescription?: string;
  isActive: boolean;
  isDefault?: boolean | null;
}
interface Make {
  id: number;
  userCreated: number | null;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  name: string;
  isActive: boolean | null;
}

interface Model {
  id: number;
  userCreated: number | null;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  name: string;
  makeId: number;
  isActive: boolean | null;
}

interface Product {
  id: number;
  userCreated: number | null;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  name: string;
  isActive: boolean | null;
}

interface Category {
  id: number;
  userCreated: number | null;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  name: string;
  isActive: boolean | null;
}

interface Item {
  itemId: number;
  categoryName: string;
  groupName: string;
  valuationMethodName: string;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  catNo: string;
}

interface AddBomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newBom: BomDetails) => void;
  mode?: "add" | "edit" | "view";
  initialData?: BomDetails;
}

interface BomItem {
  id: number;
  childItemMake: string;
  category: string;
  product: string;
  model: string;
  itemId: string;
  qty: number;
  purchaseRate?: number;
  saleRate?: number;
  quoteRate?: number;
  amount?: number;
  hsn?: string;
  tax?: number;
  // Additional properties for reference
  unitPrice?: number;
  uomName?: string;
  catNo?: string;
  inventoryMethodName?: string;
  valuationMethodName?: string;
  childItemId?: number;
  inventoryTypeName?: string | null;
  [key: string]: string | number | undefined | null;
}

interface BomOptionalItem {
  id: number;
  make: string;
  model: string;
  product: string;
  category: string;
  itemId: string;
  catNo?: string;
  quantity: number;
  amount: number;
  remarks?: string;
  optionalItemId?: number;
}

const AddBomModal: React.FC<AddBomModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode = "add",
  initialData,
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bomTemplates, setBomTemplates] = useState<BomTemplate[]>([]);
  const [quotationTitles, setQuotationTitles] = useState<QuotationTitle[]>([]);
  const [tcTemplates, setTcTemplates] = useState<TcTemplate[]>([]);
  const [makes, setMakes] = useState<Make[]>([]);
  const [allMakes, setAllMakes] = useState<Make[]>([]);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [rateMasters, setRateMasters] = useState<RateMaster[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<BomTemplate | null>(
    null
  );

  const [bomData, setBomData] = useState({
    id: mode === "edit" || mode === "view" ? initialData?.id || "" : "",
    bomId: initialData?.bomId || "",
    name: initialData?.name || "",
    type: initialData?.type || "",
    effectiveFrom: initialData?.effectiveFrom ? new Date(initialData.effectiveFrom).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    effectiveTo: initialData?.effectiveTo ? new Date(initialData.effectiveTo).toISOString().split("T")[0] : "",
    quoteTitleId: initialData?.quoteTitleId?.toString() || "",
    tcTemplateId: initialData?.tcTemplateId?.toString() || "",
    make: initialData?.make || "",
  });

  // Fetch BOM templates
  useEffect(() => {
    const fetchBomTemplates = async () => {
      setLoading(true);
      try {
        const response = await api.get("BomName");
        const data = await response.data;
        setBomTemplates(data);

        // If in edit mode and we have an initialData, set the selected template
        if ((mode === "edit" || mode === "view") && initialData?.name) {
          const template = data.find(
            (t: BomTemplate) => t.name === initialData.name
          );
          if (template) {
            setSelectedTemplate(template);
          }
        }
      } catch (err) {
        setError("Failed to load BOM templates");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchBomTemplates();
    }
  }, [isOpen, mode, initialData]);

  // Fetch Quotation Titles
  useEffect(() => {
    const fetchQuotationTitles = async () => {
      try {
        const response = await api.get("QuotationTitle");
        const data = await response.data;
        setQuotationTitles(data);
      } catch (err) {
        console.error("Error fetching quotation titles:", err);
        setError("Failed to load quotation titles");
      }
    };

    if (isOpen) {
      fetchQuotationTitles();
    }
  }, [isOpen]);

  // Fetch TC Templates
  useEffect(() => {
    const fetchTcTemplates = async () => {
      try {
        const response = await api.get("TermsConditions");
        const data: TcTemplate[] = response.data || [];
        setTcTemplates(data);
      } catch (err) {
        console.error("Error fetching TC templates:", err);
        setError("Failed to load TC templates");
      }
    };

    if (isOpen) {
      fetchTcTemplates();
    }
  }, [isOpen]);

  // Fetch Makes
  useEffect(() => {

    const fetchMakes = async () => {
      try {
        const response = await api.get("Make");
        const data = await response.data;
        setMakes(data);
        setAllMakes(data);
      } catch (err) {
        console.error("Error fetching makes:", err);
        setError("Failed to load makes");
      }
    };

    if (isOpen) {
      fetchMakes();
    }
  }, [isOpen]);

  // Fetch Rate Masters for lookup of latest quotation rates
  useEffect(() => {
    const fetchRateMasters = async () => {
      try {
        const response = await api.get<RateMaster[]>("RateMaster");
        const data = response.data || [];
        setRateMasters(data);
      } catch (err) {
        console.error("Error fetching rate masters for BOM item amount lookup:", err);
      }
    };

    if (isOpen) {
      fetchRateMasters();
    }
  }, [isOpen]);

  const getLatestQuotationRateForItem = (itemId: number): number | null => {
    let latestRate: number | null = null;
    let latestDate = 0;

    rateMasters.forEach((rm) => {
      const effectiveTs = new Date(rm.effectiveDate || rm.docDate || "").getTime();
      if (Number.isNaN(effectiveTs)) return;

      const rateItems = (rm.items || (rm as any).rateMasterItems || []) as any[];
      rateItems.forEach((rateItem) => {
        if (Number(rateItem.itemId) === Number(itemId)) {
          const candidateRate =
            Number(rateItem.quotationRate) ||
            Number(rateItem.salesRate) ||
            Number(rateItem.purchaseRate) ||
            null;
          if (candidateRate !== null) {
            if (effectiveTs > latestDate || latestRate === null) {
              latestDate = effectiveTs;
              latestRate = candidateRate;
            }
          }
        }
      });
    });

    return latestRate;
  };

  // Fetch Models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api.get("Model");
        const data = await response.data;
        setAllModels(data);
      } catch (err) {
        console.error("Error fetching models:", err);
      }
    };

    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("Product");
        const data = await response.data;
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("Category");
        const data = await response.data;
        setAllCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const [bomItems, setBomItems] = useState<BomItem[]>([]);
  const [activeTab, setActiveTab] = useState<'bom' | 'optional'>('bom');
  const [bomOptionalItems, setBomOptionalItems] = useState<BomOptionalItem[]>(
    mode === "view" ? [] : [{ id: 1, make: "", model: "", product: "", category: "", itemId: "", quantity: 1, amount: 0, remarks: "" }]
  );

  // Fetch optional items when in view or edit mode
  useEffect(() => {
    if ((mode === "view" || mode === "edit") && isOpen && initialData?.id) {
      api.get(`BillOfMaterialOptionalItems?billOfMaterialId=${initialData.id}`)
        .then((res) => {
          const data = res.data || [];
          if (data.length === 0) return;
          setBomOptionalItems(
            data.map((item: any, index: number) => {
              const matchingItem = items.find((i) => i.itemId === item.optionalItemId);
              return {
                id: item.id || index + 1,
                make: matchingItem?.make || "",
                model: matchingItem?.model || "",
                product: matchingItem?.product || "",
                category: matchingItem?.categoryName || "",
                itemId: matchingItem?.itemCode || item.optionalItemId?.toString() || "",
                quantity: item.quantity,
                amount: item.amount,
                remarks: item.remarks || "",
                optionalItemId: item.optionalItemId,
                optionalItemName: item.optionalItemName,
              };
            })
          );
        })
        .catch((err) => console.error("Failed to fetch optional items:", err));
    }
  }, [mode, isOpen, initialData?.id, items]);

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const response = await api.get("ItemDropdown/item-list");
        const data = await response.data;
        setItems(data);
        console.log("Fetched item data:", data);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Failed to load items");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchItems();
    }
  }, [isOpen]);

  // Load child items when in edit/view mode — runs only when initialData changes
  useEffect(() => {
    if (
      (mode === "edit" || mode === "view") &&
      initialData &&
      initialData.childItems &&
      initialData.childItems.length > 0
    ) {
      try {
        const mappedItems = initialData.childItems.map((item, index) => ({
          id: index + 1,
          childItemMake: item.make || "",
          category: item.categoryName || "",
          product: item.product || item.itemName?.split(" (")[0] || "",
          model:
            item.model ||
            (item.itemName?.includes(" (")
              ? item.itemName.split(" (")[1].replace(")", "")
              : ""),
          itemId: item.itemCode || item.itemId || "",
          qty: item.quantity || 1,
          purchaseRate: item.purchaseRate || 0,
          saleRate: item.saleRate || 0,
          quoteRate: item.quoteRate || 0,
          amount: item.amount !== undefined ? item.amount : (item.quoteRate || 0),
          hsn: item.hsn || "",
          tax: item.tax || 0,
          unitPrice: item.unitPrice,
          uomName: item.uomName,
          catNo: item.catNo,
          inventoryMethodName: item.inventoryMethodName,
          valuationMethodName: item.valuationMethodName,
          childItemId: item.childItemId,
        }));
        setBomItems(mappedItems);
      } catch (err) {
        console.error("Error loading child items:", err);
        setError("Failed to load child items data");
      }
    }
  }, [initialData]);

  // Get unique values for dropdowns - all independent, no filtering
  const getAvailableMakes = () => {
    return allMakes.map((m) => m.name).filter((name) => name);
  };

  const getAvailableModels = () => {
    return allModels.map((m) => m.name).filter((name) => name);
  };

  const getAvailableProducts = () => {
    return allProducts.map((p) => p.name).filter((name) => name);
  };

  const getAvailableCategories = () => {
    return allCategories.map((c) => c.name).filter((name) => name);
  };

  const getAvailableItemIds = () => {
    return items.map((i) => ({
      value: i.itemCode,
      label: `${i.itemCode} - ${i.itemName}`,
    }));
  };

  const getAvailableCatNos = () => {
    return Array.from(new Set(items.map((i) => i.catNo))).filter(Boolean);
  };

  // Update item field - no clearing of dependent fields
  const updateItemField = (id: number, field: string, value: string) => {
    setBomItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== id) return item;

        const updatedItem = { ...item, [field]: value };

        // If selecting an item ID, auto-fill all other fields and fetch latest rate
        if (field === "itemId" && value) {
          const selectedItem = items.find((i) => i.itemCode === value);
          if (selectedItem) {
            const latestRate = getLatestQuotationRateForItem(selectedItem.itemId);
            console.log(`Auto-fill for item ${selectedItem.itemCode}: latestRate=${latestRate}`);
            return {
              ...updatedItem,
              childItemMake: selectedItem.make,
              category: selectedItem.categoryName,
              product: selectedItem.product,
              model: selectedItem.model,
              itemId: selectedItem.itemCode,
              catNo: selectedItem.catNo,
              purchaseRate: latestRate ?? updatedItem.purchaseRate,
              quoteRate: latestRate ?? updatedItem.quoteRate,
              amount: latestRate ?? updatedItem.amount,
            };
          }
        }

        // If selecting a Cat No, auto-fill all other fields and fetch latest rate
        if (field === "catNo" && value) {
          const selectedItem = items.find((i) => i.catNo === value);
          if (selectedItem) {
            const latestRate = getLatestQuotationRateForItem(selectedItem.itemId);
            console.log(`Auto-fill for catNo ${selectedItem.catNo}: latestRate=${latestRate}`);
            return {
              ...updatedItem,
              childItemMake: selectedItem.make,
              category: selectedItem.categoryName,
              product: selectedItem.product,
              model: selectedItem.model,
              itemId: selectedItem.itemCode,
              catNo: selectedItem.catNo,
              purchaseRate: latestRate ?? updatedItem.purchaseRate,
              quoteRate: latestRate ?? updatedItem.quoteRate,
              amount: latestRate ?? updatedItem.amount,
            };
          }
        }

        return updatedItem;
      })
    );
  };

  const addNewItem = () => {
    const newItem: BomItem = {
      id: bomItems.length > 0 ? Math.max(...bomItems.map((i) => i.id)) + 1 : 1,
      childItemMake: "",
      category: "",
      product: "",
      model: "",
      itemId: "",
      qty: 1,
      purchaseRate: 0,
      saleRate: 0,
      quoteRate: 0,
      amount: 0,
      hsn: "",
      tax: 0,
    };
    setBomItems([...bomItems, newItem]);
  };

  const addOptionalItem = () => {
    const newOptional: BomOptionalItem = {
      id:
        bomOptionalItems.length > 0
          ? Math.max(...bomOptionalItems.map((i) => i.id)) + 1
          : 1,
      make: "",
      model: "",
      product: "",
      category: "",
      itemId: "",
      quantity: 1,
      amount: 0,
      remarks: "",
    };
    setBomOptionalItems([...bomOptionalItems, newOptional]);
  };

  const updateOptionalItem = (
    id: number,
    field: keyof BomOptionalItem,
    value: string | number
  ) => {
    setBomOptionalItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "itemId") {
          const itemMatch = items.find((i) => i.itemCode === String(value));
          if (itemMatch) {
            const latestRate = getLatestQuotationRateForItem(itemMatch.itemId);
            return {
              ...item,
              itemId: String(value),
              catNo: itemMatch.catNo || "",
              make: itemMatch.make || "",
              model: itemMatch.model || "",
              product: itemMatch.product || "",
              category: itemMatch.categoryName || "",
              amount: latestRate ?? item.amount,
              optionalItemId: itemMatch.itemId,
            };
          }
          return { ...item, itemId: String(value) };
        }

        if (field === "catNo") {
          const itemMatch = items.find((i) => i.catNo === String(value));
          if (itemMatch) {
            const latestRate = getLatestQuotationRateForItem(itemMatch.itemId);
            return {
              ...item,
              catNo: String(value),
              itemId: itemMatch.itemCode || "",
              make: itemMatch.make || "",
              model: itemMatch.model || "",
              product: itemMatch.product || "",
              category: itemMatch.categoryName || "",
              amount: latestRate ?? item.amount,
              optionalItemId: itemMatch.itemId,
            };
          }
          return { ...item, catNo: String(value) };
        }

        return {
          ...item,
          [field]: field === "quantity" || field === "amount" ? Number(value) : String(value),
        };
      })
    );
  };

  const updateItemQty = (id: number, value: number) => {
    setBomItems(
      bomItems.map((item) => (item.id === id ? { ...item, qty: value } : item))
    );
  };

  const handleSave = async () => {
    try {
      // Validate BOM name and type are selected
      if (!bomData.name) {
        setError("Please select a BOM Name");
        return;
      }

      // Validate that there are child items and they are properly filled
      if (bomItems.length === 0) {
        setError("Please add at least one item to the BOM");
        return;
      }

      // Log current bomItems for debugging
      console.log("Current bomItems:", bomItems);

      // Check if all child items have complete information
      const incompleteItems = bomItems.filter(
        (item) =>
          !item.childItemMake ||
          !item.model ||
          !item.product ||
          !item.category ||
          !item.itemId ||
          !item.qty
      );

      if (incompleteItems.length > 0) {
        console.log("Incomplete items:", incompleteItems);
        setError("Please fill in all fields for each item in the table");
        return;
      }

      // Get the selected item details from bomData.name
      const parentItem = items.find((item) => item.itemName === bomData.name);

      // Get child items with proper IDs - find by itemCode directly
      const validChildItems = bomItems
        .map((bomItem) => {
          // Find item by itemCode since that's what we store in itemId field
          const matchingItem = items.find(
            (item) => item.itemCode === bomItem.itemId
          );

          if (!matchingItem) {
            console.error("No matching item found for:", bomItem);
            return null;
          }

          return {
            ChildItemId: matchingItem.itemId,
            Quantity: bomItem.qty,
          };
        })
        .filter((item) => item !== null);

      console.log("Valid child items:", validChildItems);

      const requestBody = {
        Id: mode === "edit" && initialData?.id ? initialData.id : 0,
        BomId: bomData.bomId || undefined,
        BomName: bomData.name,
        BomType: bomData.type,
        EffectiveFrom: bomData.effectiveFrom ? new Date(bomData.effectiveFrom).toISOString() : new Date().toISOString(),
        EffectiveTo: bomData.effectiveTo ? new Date(bomData.effectiveTo).toISOString() : new Date().toISOString(),
        QuoteTitleId: bomData.quoteTitleId ? parseInt(bomData.quoteTitleId) : 1,
        TcTemplateId: bomData.tcTemplateId ? parseInt(bomData.tcTemplateId) : 1,
        Make: bomData.make,
        ChildItems: bomItems.map((item) => {
          const matchingItem = items.find((i) => i.itemCode === item.itemId);
          const childItemIdToUse = matchingItem?.itemId || item.childItemId || 0;

          return {
            Id: item.childItemId || 0,
            ChildItemId: childItemIdToUse,
            Quantity: item.qty,
            PurchaseRate: item.purchaseRate || 0,
            SaleRate: item.saleRate || null,
            QuoteRate: item.quoteRate || null,
            Hsn: item.hsn || null,
            Tax: item.tax || null,
            Amount: item.amount || item.quoteRate || 0,
          };
        }),
      };

      let response;
      let savedBomId: number | string = initialData?.id || 0;

      if (mode === "edit" && initialData?.id) {
        // Update existing BOM
        response = await api.put(
          `BillOfMaterial/${initialData.id}`,
          requestBody
        );
        savedBomId = initialData.id;
        toast.success("BOM updated successfully!");
      } else {
        // Create new BOM
        response = await api.post("BillOfMaterial", requestBody);
        // Some APIs return created object id as response.data.id
        if (response.data && (response.data.id || response.data.Id)) {
          savedBomId = response.data.id || response.data.Id;
        }
        toast.success("BOM created successfully!");
      }

      if (response.status === 200 || response.status === 201) {
        // Save optional BOM items using API
        if (bomOptionalItems.length > 0 && savedBomId) {
          try {
            const createOptionalCalls = bomOptionalItems
              .filter((item) => item.itemId || item.optionalItemId) // skip empty rows
              .map((item) => {
                const matchingItem = items.find((i) => i.itemCode === item.itemId);
                const optionalItemIdToUse = matchingItem?.itemId || Number(item.optionalItemId) || 0;

                if (optionalItemIdToUse === 0) {
                  console.warn("Skipping optional item with 0 ID:", item);
                  return Promise.resolve();
                }

                const payload = {
                  billOfMaterialId: Number(savedBomId),
                  optionalItemId: optionalItemIdToUse,
                  quantity: item.quantity,
                  amount: item.amount,
                  remarks: item.remarks,
                };

                // Use PUT for existing optional items in edit mode, otherwise POST
                if (mode === "edit" && item.id && item.optionalItemId) {
                  return api.put(`BillOfMaterialOptionalItems/${item.id}`, payload);
                }
                return api.post("BillOfMaterialOptionalItems", payload);
              });
            await Promise.all(createOptionalCalls);
            console.log("Optional BOM items saved", bomOptionalItems);
          } catch (optionalError) {
            console.error("Failed to save optional BOM items", optionalError);
            setError("BOM saved but failed to save optional items.");
          }
        }

        // Call the original onSave for any UI updates
        onSave({
          id: bomData.id,
          bomId: initialData?.bomId || `BOM-${new Date().getTime()}`,
          bomName: bomData.name,
          bomType: bomData.type,
          name: bomData.name,
          type: bomData.type,
          effectiveFrom: bomData.effectiveFrom,
          effectiveTo: bomData.effectiveTo,
          quoteTitleId: bomData.quoteTitleId ? parseInt(bomData.quoteTitleId) : undefined,
          tcTemplateId: bomData.tcTemplateId ? parseInt(bomData.tcTemplateId) : undefined,
          make: bomData.make,
          childItems: bomItems.map((item) => ({
            itemName: item.product + (item.model ? ` (${item.model})` : ""),
            itemId: item.itemId,
            quantity: item.qty,
            // Include all additional properties
            childItemId: item.childItemId,
            make: item.childItemMake,
            categoryName: item.category,
            product: item.product,
            model: item.model,
            unitPrice: item.unitPrice,
            uomName: item.uomName,
            catNo: item.catNo,
            inventoryMethodName: item.inventoryMethodName,
            valuationMethodName: item.valuationMethodName,
            itemCode: item.itemId,
          })),
          // Include other required properties
          components: bomItems.map((item) => ({
            id: String(item.id),
            itemCode: item.itemId,
            description: item.product + (item.model ? ` (${item.model})` : ""),
            quantity: item.qty,
            uom: item.uomName || "",
            comments: "",
            // Additional properties
            make: item.childItemMake,
            category: item.category,
            model: item.model,
            product: item.product,
            unitPrice: item.unitPrice,
            childItemId: item.childItemId,
            catNo: item.catNo,
            inventoryMethodName: item.inventoryMethodName,
            valuationMethodName: item.valuationMethodName,
          })),
          productId: parentItem ? String(parentItem.itemId) : "",
          productName: parentItem ? parentItem.itemName : "",
          description: "",
          version: "",
          componentCount: bomItems.length,
          lastUpdated: "",
          status: "active",
        });
      }
    } catch (error) {
      console.error("Failed to save BOM:", error);
      setError("Failed to save BOM. Please try again.");
      toast.error("Failed to save BOM. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={mode === "add" ? "Add New BOM" : mode === "view" ? "View BOM" : "Edit BOM"}
      onClose={onClose}
    >
      <div className="p-6 bg-gray-50">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Bill of Materials</h2>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(mode === "edit" || mode === "view") && bomData.bomId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash size={14} className="inline mr-1" />
                  BOM ID
                </label>
                <input
                  type="text"
                  value={bomData.bomId}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BOM Name
              </label>
              <select
                value={bomData.name}
                onChange={(e) => {
                  const selected = bomTemplates.find(
                    (t) => t.name === e.target.value
                  );
                  setSelectedTemplate(selected || null);
                  setBomData({
                    ...bomData,
                    name: e.target.value,
                    type: "",
                  });
                }}
                disabled={mode === "view"}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-8 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select BOM Name</option>
                {bomTemplates.map((template) => (
                  <option key={template.id} value={template.name}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BOM Type
              </label>
              <select
                value={bomData.type}
                onChange={(e) =>
                  setBomData({ ...bomData, type: e.target.value })
                }
                disabled={!selectedTemplate || mode === "view"}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-8 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select BOM Type</option>
                {selectedTemplate?.type?.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Make
              </label>
              <select
                value={bomData.make}
                onChange={(e) => setBomData({ ...bomData, make: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Make</option>
                {makes.map((make) => (
                  <option key={make.id} value={make.name}>
                    {make.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={bomData.effectiveFrom}
                onChange={(e) => setBomData({ ...bomData, effectiveFrom: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective To
              </label>
              <input
                type="date"
                value={bomData.effectiveTo}
                onChange={(e) => setBomData({ ...bomData, effectiveTo: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote Title
              </label>
              <select
                value={bomData.quoteTitleId}
                onChange={(e) => setBomData({ ...bomData, quoteTitleId: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select Quote Title</option>
                {quotationTitles.map((qt) => (
                  <option key={qt.id} value={qt.id}>
                    {qt.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TC Template
              </label>
              <select
                value={bomData.tcTemplateId}
                onChange={(e) => setBomData({ ...bomData, tcTemplateId: e.target.value })}
                disabled={mode === "view"}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              >
                <option value="">Select TC Template</option>
                {tcTemplates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.templateName || template.template_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BOM Tabs */}
        <div className="mb-4">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("bom")}
              className={`px-3 py-2 text-sm font-medium ${activeTab === "bom"
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-gray-600"
                }`}
            >
              BOM Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("optional")}
              className={`px-3 py-2 text-sm font-medium ${activeTab === "optional"
                ? "border-b-2 border-blue-600 text-blue-700"
                : "text-gray-600"
                }`}
            >
              BOM Optional Detail
            </button>
          </div>
        </div>

        {activeTab === "bom" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-900">BOM Details</h3>
              {mode !== "view" && (
                <button
                  onClick={addNewItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Cat No
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Make
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Model
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Product
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Item ID
                    </th>

                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bomItems.map((item, index) => {
                    // Get available options for each dropdown - all independent
                    const makes = getAvailableMakes();
                    const models = getAvailableModels();
                    const products = getAvailableProducts();
                    const categories = getAvailableCategories();
                    const itemIds = getAvailableItemIds();

                    // Auto-select if only one option is available
                    if (makes.length === 1 && !item.childItemMake) {
                      setTimeout(
                        () => updateItemField(item.id, "childItemMake", makes[0]),
                        0
                      );
                    }
                    if (models.length === 1 && !item.model) {
                      setTimeout(
                        () => updateItemField(item.id, "model", models[0]),
                        0
                      );
                    }
                    if (products.length === 1 && !item.product) {
                      setTimeout(
                        () => updateItemField(item.id, "product", products[0]),
                        0
                      );
                    }
                    if (categories.length === 1 && !item.category) {
                      setTimeout(
                        () => updateItemField(item.id, "category", categories[0]),
                        0
                      );
                    }
                    if (itemIds.length === 1 && !item.itemId) {
                      setTimeout(
                        () =>
                          updateItemField(item.id, "itemId", itemIds[0].value),
                        0
                      );
                    }

                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.catNo || '-'}</div>
                          ) : (
                            <select
                              value={item.catNo || ""}
                              onChange={(e) =>
                                updateItemField(item.id, "catNo", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Cat No</option>
                              {getAvailableCatNos().map((catNo) => (
                                <option key={catNo} value={catNo}>
                                  {catNo}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.childItemMake || '-'}</div>
                          ) : (
                            <select
                              value={item.childItemMake}
                              onChange={(e) =>
                                updateItemField(
                                  item.id,
                                  "childItemMake",
                                  e.target.value
                                )
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Make</option>
                              {makes.map((make) => (
                                <option key={make} value={make}>
                                  {make}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.model || '-'}</div>
                          ) : (
                            <select
                              value={item.model}
                              onChange={(e) =>
                                updateItemField(item.id, "model", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Model</option>
                              {models.map((model) => (
                                <option key={model} value={model}>
                                  {model}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.product || '-'}</div>
                          ) : (
                            <select
                              value={item.product}
                              onChange={(e) =>
                                updateItemField(item.id, "product", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Product</option>
                              {products.map((product) => (
                                <option key={product} value={product}>
                                  {product}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.category || '-'}</div>
                          ) : (
                            <select
                              value={item.category}
                              onChange={(e) =>
                                updateItemField(item.id, "category", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Category</option>
                              {categories.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div
                              className="text-sm text-gray-900 max-w-xs truncate cursor-help"
                              title={(() => {
                                const matchingItem = items.find((i) => i.itemCode === item.itemId);
                                return matchingItem ? `${matchingItem.itemCode} - ${matchingItem.itemName}` : (item.itemId || '-');
                              })()}
                            >
                              {(() => {
                                const matchingItem = items.find((i) => i.itemCode === item.itemId);
                                return matchingItem ? `${matchingItem.itemCode} - ${matchingItem.itemName}` : (item.itemId || '-');
                              })()}
                            </div>
                          ) : (
                            <select
                              value={item.itemId}
                              onChange={(e) =>
                                updateItemField(item.id, "itemId", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Select Item ID</option>
                              {itemIds.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>

                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.qty}</div>
                          ) : (
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) =>
                                updateItemQty(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              min="1"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {mode === "view" ? (
                            <div className="text-sm text-gray-900">{item.amount || 0}</div>
                          ) : (
                            <input
                              type="number"
                              value={item.amount || 0}
                              onChange={(e) =>
                                setBomItems(
                                  bomItems.map((i) =>
                                    i.id === item.id
                                      ? { ...i, amount: parseFloat(e.target.value) || 0 }
                                      : i
                                  )
                                )
                              }
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {bomItems.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No items added yet. Click "Add Item" to get started.
              </div>
            )}
          </div>
        )}

        {activeTab === "optional" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-900">BOM Optional Detail</h3>
              {mode !== "view" && (
                <button
                  onClick={addOptionalItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Cat No</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Make</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Model</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Product</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Item ID</th>

                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Qty</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bomOptionalItems.map((optional, index) => (
                    <tr key={optional.id}>
                      <td className="px-3 py-2 text-sm">{index + 1}</td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.make || '-'}</div>
                        ) : (
                          <select
                            value={optional.make}
                            onChange={(e) => updateOptionalItem(optional.id, "make", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Make</option>
                            {getAvailableMakes().map((make) => (
                              <option key={`${optional.id}-${make}`} value={make}>{make}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.model || '-'}</div>
                        ) : (
                          <select
                            value={optional.model}
                            onChange={(e) => updateOptionalItem(optional.id, "model", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Model</option>
                            {getAvailableModels().map((model) => (
                              <option key={`${optional.id}-${model}`} value={model}>{model}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.product || '-'}</div>
                        ) : (
                          <select
                            value={optional.product}
                            onChange={(e) => updateOptionalItem(optional.id, "product", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Product</option>
                            {getAvailableProducts().map((prod) => (
                              <option key={`${optional.id}-${prod}`} value={prod}>{prod}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.category || '-'}</div>
                        ) : (
                          <select
                            value={optional.category}
                            onChange={(e) => updateOptionalItem(optional.id, "category", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Category</option>
                            {getAvailableCategories().map((cat) => (
                              <option key={`${optional.id}-${cat}`} value={cat}>{cat}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div
                            className="text-sm text-gray-900 max-w-xs truncate cursor-help"
                            title={(() => {
                              const matchingItem = items.find((i) => i.itemCode === optional.itemId);
                              return matchingItem ? `${matchingItem.itemCode} - ${matchingItem.itemName}` : (optional.itemId || '-');
                            })()}
                          >
                            {(() => {
                              const matchingItem = items.find((i) => i.itemCode === optional.itemId);
                              return matchingItem ? `${matchingItem.itemCode} - ${matchingItem.itemName}` : (optional.itemId || '-');
                            })()}
                          </div>
                        ) : (
                          <select
                            value={optional.itemId}
                            onChange={(e) => updateOptionalItem(optional.id, "itemId", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Item ID</option>
                            {getAvailableItemIds().map((opt) => (
                              <option key={`${optional.id}-${opt.value}`} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.catNo || '-'}</div>
                        ) : (
                          <select
                            value={optional.catNo || ""}
                            onChange={(e) => updateOptionalItem(optional.id, "catNo", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Select Cat No</option>
                            {getAvailableCatNos().map((catNo) => (
                              <option key={`${optional.id}-${catNo}`} value={catNo}>{catNo}</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.quantity}</div>
                        ) : (
                          <input
                            type="number"
                            value={optional.quantity}
                            onChange={(e) => updateOptionalItem(optional.id, "quantity", Number(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            min={1}
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {mode === "view" ? (
                          <div className="text-sm text-gray-900">{optional.amount}</div>
                        ) : (
                          <input
                            type="number"
                            value={optional.amount}
                            onChange={(e) => updateOptionalItem(optional.id, "amount", Number(e.target.value) || 0)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-sm"
                            min={0}
                            step="0.01"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <div className="flex gap-2">
            {mode !== "view" && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Save size={14} />
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
            >
              <FaTimes size={14} />
              {mode === "view" ? "Close" : "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddBomModal;
