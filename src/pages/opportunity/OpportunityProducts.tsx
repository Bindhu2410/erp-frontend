import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus as Plus,
  FaMinus as Minus,
  FaShoppingCart as ShoppingCart,
} from "react-icons/fa";
import api from "../../services/api";
import TermsAndConditions from "../quotation/TermsandConditon";

interface BomChildItem {
  id: number;
  itemId?: number;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  quoteRate?: number;
  hsn: string;
  taxPercentage: number;
  categoryName: string;
}

interface AccessoryItem {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  make: string;
  model: string;
  unitPrice: number;
  categoryName: string;
  groupName: string;
  hsn: string;
  uomName: string;
  taxPercentage: number;
  quantity: number;
  saleRate: number | null;
  valuationMethodName: string;
  inventoryMethodName: string | null;
  inventoryTypeName: string | null;
  parentChildItemId?: number | null; // null = legacy (show under all), number = specific child item
}

interface AccessoryDetail {
  id: number;
  headerId: number;
  accessoriesName: string;
  qty: number;
  itemType: string;
}

interface BomItem {
  bomId: string;
  bomName: string;
  bomType: string;
  bomChildItems: BomChildItem[];
  accessoryItemIds: number[];
  accessoryItems: AccessoryItem[];
  quantity: number;
  quoteRate?: number;
}

export interface Product {
  items: BomItem[];
}

interface OpportunityProductsProps {
  onProductChange?: (product: Product) => void;
  isEdit?: boolean;
  product?: Product;
  bomOptions?: {
    bomId: string;
    bomName: string;
    bomType: string;
    bomChildItems?: BomChildItem[];
  accessoryItems?: AccessoryItem[];
  }[];
}

const OpportunityProducts: React.FC<OpportunityProductsProps> = ({
  onProductChange,
  isEdit = true,
  product,
  bomOptions,
}) => {
  // Helper to normalize BOM items coming from different shapes
  const normalizeBomItem = (bom: any): BomItem => {
    const normalizeAccessory = (acc: any): AccessoryItem => ({
      id: acc.id || acc.itemId || 0,
      itemId: acc.itemId || acc.id || 0,
      itemCode: acc.itemCode || "",
      itemName: acc.itemName || acc.accessoriesName || "",
      make: acc.make || "",
      model: acc.model || "",
      unitPrice: acc.unitPrice || 0,
      categoryName: acc.categoryName || acc.itemType || "",
      groupName: acc.groupName || "",
      hsn: acc.hsn || "",
      uomName: acc.uomName || "",
      taxPercentage: acc.taxPercentage || 0,
      quantity: acc.quantity || acc.qty || 1,
      saleRate: acc.saleRate ?? null,
      valuationMethodName: acc.valuationMethodName || "",
      inventoryMethodName: acc.inventoryMethodName || null,
      inventoryTypeName: acc.inventoryTypeName || null,
      parentChildItemId: acc.parentChildItemId != null ? Number(acc.parentChildItemId) : null,
    });

    return {
      bomId: String(bom.bomId),
      bomName: String(bom.bomName),
      bomType: String(bom.bomType),
      bomChildItems: (bom.bomChildItems || bom.childItems || bom.ChildItems || []).map((child: any) => ({
        ...child,
        id: child.id || child.childItemId || 0,
        itemId: child.itemId || child.childItemId || child.id || 0,
        unitPrice: child.unitPrice || child.price || 0,
        quoteRate: child.quoteRate || child.quotationRate || child.saleRate || child.unitPrice || child.price || 0,
      })),
      accessoryItemIds: bom.accessoryItemIds || [],
      accessoryItems: Array.isArray(bom.accessoryItems)
        ? bom.accessoryItems.map(normalizeAccessory)
        : Array.isArray(bom.accessoriesItems)
        ? bom.accessoriesItems.map(normalizeAccessory)
        : [],
      quantity: bom.quantity || 1,
      quoteRate: bom.quoteRate || bom.saleRate || bom.unitPrice || 0,
    };
  };

  // Sample data
  const [availableBOMs, setAvailableBOMs] = useState<BomItem[]>([]);

  useEffect(() => {
    const initializeBOMs = async () => {
      if (bomOptions !== undefined && bomOptions.length > 0) {
        // Mark that we're using parent-provided options
        setIsOptionsFromParent(true);

        // Filter out any BOMs with empty or invalid data
        const validBomOptions = bomOptions.filter(
          (bom) =>
            bom.bomId &&
            bom.bomName &&
            bom.bomType &&
            typeof bom.bomId === "string" &&
            typeof bom.bomName === "string" &&
            typeof bom.bomType === "string" &&
            bom.bomId.trim() !== "" &&
            bom.bomName.trim() !== "" &&
            bom.bomType.trim() !== ""
        );

        // If bomOptions are provided, use them
        const formattedData = validBomOptions.map((bom) => ({
          bomId: String(bom.bomId).trim(),
          bomName: String(bom.bomName).trim(),
          bomType: String(bom.bomType).trim(),
          bomChildItems:
            (bom as any).bomChildItems ||
            (bom as any).childItems ||
            (bom as any).ChildItems ||
            [],
          accessoryItemIds: [],
          accessoryItems: bom.accessoryItems || [],
          quantity: 1,
        }));
        setAvailableBOMs(formattedData);

        // Auto-select if only one option is available
        if (bomOptions.length === 1) {
          setSelectedBomType(String(bomOptions[0].bomType));
          setSelectedBomId(String(bomOptions[0].bomId));
        }
      } else if (bomOptions === undefined) {
        // Using API fallback
        setIsOptionsFromParent(false);

        // Fallback to API call if no bomOptions provided
        try {
          const response = await api.post("BomDropdown/bom-list", {
            Page: 1,
            PageSize: 10,
          });
          const formattedData = response.data.map((bom: any) => ({
            bomId: String(bom.bomId),
            bomName: String(bom.bomName || ""),
            bomType: String(bom.bomType || ""),
            bomChildItems: bom.bomChildItems || bom.childItems || [],
            accessoryItemIds: bom.accessoryItemIds || [],
            accessoryItems: [],
            quantity: 1,
          }));
          setAvailableBOMs(formattedData);
        } catch (error) {
          // handle error
        }
      }
    };
    initializeBOMs();
  }, [bomOptions]);

  const [availableAccessories] = useState<AccessoryItem[]>([]);

  const [selectedBomId, setSelectedBomId] = useState<string>("");
  const [selectedBomType, setSelectedBomType] = useState<string>("");
  const [selectedBom, setSelectedBom] = useState<BomItem | null>(null);
  const [productItems, setProductItems] = useState<BomItem[]>(
    (product && Array.isArray(product.items)) ? product.items.map((it: any) => normalizeBomItem(it)) : []
  );
  const [showAccessoryModal, setShowAccessoryModal] = useState(false);
  const [currentBomId, setCurrentBomId] = useState<string>("");
  const [currentChildItemId, setCurrentChildItemId] = useState<number | null>(null);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<number | null>(null);
  const [childAccessoryDetails, setChildAccessoryDetails] = useState<AccessoryDetail[]>([]);
  const [accessoryLoading, setAccessoryLoading] = useState(false);
  const [isOptionsFromParent, setIsOptionsFromParent] = useState(false);
  const [disabledBomIds, setDisabledBomIds] = useState<string[]>([]);

  // Update productItems when product prop changes
  useEffect(() => {
    if (!product?.items || !Array.isArray(product.items)) return;

    const newItems = product.items.map((it: any) => normalizeBomItem(it));

    setProductItems((prev) => {
      const isSame = JSON.stringify(prev) === JSON.stringify(newItems);

      return isSame ? prev : newItems;
    });
  }, [product?.items]);

  const isFirstRender = useRef(true);

  // Notify parent only after initial mount, when user actually changes productItems
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Only notify parent if editing is enabled
    if (isEdit) {
      onProductChange?.({ items: productItems });
    }
  }, [productItems, isEdit]);

  // Filter BOMs by type and exclude already added ones
  const filteredBOMs = availableBOMs.filter((bom) => {
    // First check if BOM has valid data
    const isValidBom =
      bom.bomId &&
      bom.bomName &&
      bom.bomType &&
      bom.bomId.trim() !== "" &&
      bom.bomName.trim() !== "" &&
      bom.bomType.trim() !== "";

    const isMatchingType = !selectedBomType || bom.bomType === selectedBomType;

    // Check if the BOM is not currently added to productItems
    const isNotInCurrentItems = !productItems.some(
      (item) => item.bomId === bom.bomId
    );

    return isValidBom && isMatchingType && isNotInCurrentItems;
  });
  console.log(filteredBOMs, "filteredBOMs");
  // Get unique BOM types from filtered BOMs
  const bomTypes = Array.from(new Set(filteredBOMs.map((bom) => bom.bomType)));

  // Auto-select BOM type and BomId if there's exactly one BOM available
  useEffect(() => {
    if (filteredBOMs.length === 1 && !selectedBomId) {
      const single = filteredBOMs[0];
      setSelectedBomType(String(single.bomType));
      setSelectedBomId(String(single.bomId));
      setSelectedBom(single);
    } else {
      // Reset selections if more than one option or no options available
      if (
        selectedBomId &&
        !filteredBOMs.some((bom) => bom.bomId === selectedBomId)
      ) {
        setSelectedBomId("");
        setSelectedBomType("");
        setSelectedBom(null);
      }
    }
  }, [filteredBOMs, selectedBomId]);

  // Filter BOMs by type and exclude already added ones and items from parent product
  // const filteredBOMs = availableBOMs.filter((bom) => {
  //   const isMatchingType = !selectedBomType || bom.bomType === selectedBomType;
  //   const isNotAdded = !productItems.some((item) => item.bomId === bom.bomId);
  //   const isNotInParentProduct = !product?.items?.some(
  //     (item) => item.bomId === bom.bomId
  //   );
  //   return isMatchingType && isNotAdded && isNotInParentProduct;
  // });

  // Handle BOM selection based on filtered results
  useEffect(() => {
    if (availableBOMs.length === 1) {
      const singleBOM = availableBOMs[0];
      // Check if this single BOM is not already in the product items
      if (!productItems.some((item) => item.bomId === singleBOM.bomId)) {
        // Auto-select the single BOM
        setSelectedBomType(String(singleBOM.bomType));
        setSelectedBomId(String(singleBOM.bomId));
        setSelectedBom(singleBOM);

        // Automatically add it to the table
        const timer = setTimeout(() => {
          setProductItems((prevItems) => {
            // Check if BOM is already added
            if (prevItems.some((item) => item.bomId === singleBOM.bomId)) {
              return prevItems;
            }
            const normalized = normalizeBomItem(singleBOM as any);
            normalized.accessoryItems =
              singleBOM.accessoryItems || normalized.accessoryItems || [];
            normalized.accessoryItemIds =
              singleBOM.accessoryItemIds || normalized.accessoryItemIds || [];
            return [...prevItems, normalized];
          });
        }, 0);
        return () => clearTimeout(timer);
      }
    } else if (availableBOMs.length > 1) {
      // If there are multiple BOMs available, just reset selection
      // but only if the current selection is not in product items
      if (
        selectedBomId &&
        !productItems.some((item) => item.bomId === selectedBomId)
      ) {
        //  setSelectedBomId("");
        //  setSelectedBomType("");
        // setSelectedBom(null);
      }
    }
  }, [availableBOMs.length, selectedBomId]);

  const calculateItemTotal = (item: BomChildItem, quantity: number) => {
    // Priority: quoteRate > unitPrice > 0
    const price = item.quoteRate || item.unitPrice || 0;
    const subtotal = price * (quantity || 0);
    const taxAmount = (subtotal * (item.taxPercentage || 0)) / 100;
    return subtotal + taxAmount;
  };

  const calculateAccessoryTotal = (accessory: AccessoryItem) => {
    const subtotal = (accessory.unitPrice || 0) * (accessory.quantity || 0);
    return subtotal + (subtotal * (accessory.taxPercentage || 0)) / 100;
  };
  const calculateBOMTotal = (bomItem: BomItem) => {
    const childItems = bomItem.bomChildItems || [];

    if (bomItem.quoteRate && childItems.length === 0) {
      return bomItem.quoteRate * (bomItem.quantity || 1);
    }

    const childItemsTotal = childItems.reduce(
      (total, item) => total + (calculateItemTotal(item, bomItem.quantity) || 0),
      0
    );

    if (childItemsTotal === 0 && bomItem.quoteRate) {
      return bomItem.quoteRate * (bomItem.quantity || 1);
    }

    return childItemsTotal;
  };

  const addBOMToTable = () => {
    if (!selectedBomId) return;

    const selectedBOM = availableBOMs.find(
      (bom) => bom.bomId === selectedBomId
    );
    if (!selectedBOM) return;

    const existingIndex = productItems.findIndex(
      (item) => item.bomId === selectedBomId
    );

    if (existingIndex >= 0) {
      const updatedItems = [...productItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1,
      };
      setProductItems(updatedItems);
    } else {
      // ensure the BOM we add is normalized so child items are preserved
      const normalized = normalizeBomItem(selectedBOM as any);
      // also preserve any accessory arrays if present on the selectedBOM
      normalized.accessoryItems =
        (selectedBOM as any).accessoryItems || normalized.accessoryItems || [];
      normalized.accessoryItemIds =
        (selectedBOM as any).accessoryItemIds ||
        normalized.accessoryItemIds ||
        [];
      setProductItems([...productItems, normalized]);
    }

    // Reset selection fields after adding
    setSelectedBomId("");
    setSelectedBomType("");
    setSelectedBom(null);
  };

  const updateBOMQuantity = (bomId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setProductItems(
      productItems.map((item) =>
        item.bomId === bomId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeBOMFromTable = (bomId: string) => {
    setProductItems(productItems.filter((item) => item.bomId !== bomId));
    // Reset selection if this was the only item
    if (availableBOMs.length === 1) {
      setSelectedBomId("");
      setSelectedBomType("");
      // The useEffect will handle re-adding if needed since filteredBOMs will update
    }
  };

  const openAccessoryModal = async (bomId: string, childItemId: number) => {
    setCurrentBomId(bomId);
    setCurrentChildItemId(childItemId);
    setSelectedAccessoryId(null);
    setChildAccessoryDetails([]);
    setShowAccessoryModal(true);
    setAccessoryLoading(true);
    
    console.log('Opening accessory modal for childItemId:', childItemId);
    
    try {
      const response = await api.get("AccessoriesHeader");
      const headers: any[] = response.data || [];
      
      console.log('All AccessoriesHeaders:', headers);
      console.log('Looking for itemId:', childItemId);
      
      const matched = headers.find((h: any) => Number(h.itemId) === Number(childItemId));
      
      console.log('Matched header:', matched);
      
      if (matched) {
        const detailRes = await api.get(`AccessoriesHeader/${matched.id}`);
        console.log('Accessory details response:', detailRes.data);
        setChildAccessoryDetails(detailRes.data?.accessoriesDetails || []);
      } else {
        console.log('No matching header found for itemId:', childItemId);
        setChildAccessoryDetails([]);
      }
    } catch (error) {
      console.error('Error fetching accessories:', error);
      setChildAccessoryDetails([]);
    } finally {
      setAccessoryLoading(false);
    }
  };

  const closeAccessoryModal = () => {
    setShowAccessoryModal(false);
    setCurrentBomId("");
    setCurrentChildItemId(null);
    setSelectedAccessoryId(null);
    setChildAccessoryDetails([]);
  };

  const addAccessoryToBOM = (bomId: string, accessoryDetailId: number) => {
    const detail = childAccessoryDetails.find((d) => d.id === accessoryDetailId);
    if (!detail) return;

    const syntheticAccessory: AccessoryItem = {
      id: detail.id,
      itemId: detail.id,
      itemCode: "",
      itemName: detail.accessoriesName,
      make: "",
      model: "",
      unitPrice: 0,
      categoryName: detail.itemType,
      groupName: "",
      hsn: "",
      uomName: "",
      taxPercentage: 0,
      quantity: detail.qty,
      saleRate: null,
      valuationMethodName: "",
      inventoryMethodName: null,
      inventoryTypeName: null,
      parentChildItemId: currentChildItemId ?? undefined,
    };

    setProductItems(
      productItems.map((item) => {
        if (item.bomId !== bomId) return item;
        const exists = item.accessoryItems.find((acc) => acc.itemId === detail.id);
        if (exists) {
          return {
            ...item,
            accessoryItems: item.accessoryItems.map((acc) =>
              acc.itemId === detail.id ? { ...acc, quantity: acc.quantity + 1 } : acc
            ),
          };
        }
        return {
          ...item,
          accessoryItemIds: [...item.accessoryItemIds, detail.id],
          accessoryItems: [...item.accessoryItems, syntheticAccessory],
        };
      })
    );
    closeAccessoryModal();
  };

  const updateAccessoryQuantity = (
    bomId: string,
    accessoryId: number,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      removeAccessoryFromBOM(bomId, accessoryId);
      return;
    }

    setProductItems(
      productItems.map((item) => {
        if (item.bomId !== bomId) return item;

        return {
          ...item,
          accessoryItems: item.accessoryItems.map((acc) =>
            acc.itemId === accessoryId ? { ...acc, quantity: newQuantity } : acc
          ),
        };
      })
    );
  };

  const removeAccessoryFromBOM = (bomId: string, accessoryId: number) => {
    setProductItems(
      productItems.map((item) => {
        if (item.bomId !== bomId) return item;

        return {
          ...item,
          accessoryItemIds: item.accessoryItemIds.filter(
            (id) => id !== accessoryId
          ),
          accessoryItems: item.accessoryItems.filter(
            (acc) => acc.itemId !== accessoryId
          ),
        };
      })
    );
  };

  const grandTotal = productItems.reduce((total, item) => {
    const isDisabled = disabledBomIds.includes(item.bomId);
    return isDisabled ? total : total + calculateBOMTotal(item);
  }, 0);

  return (
    <div className="p-6 w-full mx-auto">
      {/* BOM Selection Section (hide if not edit) */}
      {isEdit && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border">
          {isOptionsFromParent && bomOptions?.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No Products Available
            </div>
          ) : (
            (!isOptionsFromParent || (bomOptions && bomOptions.length > 0)) && (
              <div className="flex items-center gap-4 w-full">
                {(() => {
                  // Filter available BOMs that haven't been added yet
                  const availableOptions = availableBOMs.filter(
                    (bom) =>
                      !productItems.some((item) => item.bomId === bom.bomId)
                  );

                  if (availableBOMs.length === 0) {
                    return (
                      <div className="text-sm text-gray-500 italic">
                        No BOMs available to add
                      </div>
                    );
                  } else if (availableOptions.length === 0) {
                    return (
                      <div className="text-sm text-gray-500 italic">
                        All available BOMs have been added
                      </div>
                    );
                  }

                  return (
                    <div className="flex items-center gap-4 w-full">
                      <div className="flex-grow max-w-md">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name
                        </label>
                        <select
                          value={selectedBomId}
                          onChange={(e) => {
                            const bomId = e.target.value;
                            console.log("Dropdown value:", bomId);
                            console.log(
                              "selectedBomId before set:",
                              selectedBomId
                            );

                            setSelectedBomId(bomId);

                            console.log(
                              "selectedBomId type:",
                              typeof bomId,
                              bomId
                            );
                          }}
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>
                            Select BOM
                          </option>

                          {availableOptions.map((bom) => (
                            <option key={bom.bomId} value={bom.bomId}>
                              {bom.bomName} ({bom.bomType})
                            </option>
                          ))}
                        </select>

                        {selectedBom && (
                          <div className="mt-2 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Selected:</span>{" "}
                              {selectedBom.bomName} ({selectedBom.bomType})
                            </div>
                            <div>
                              Child items:{" "}
                              {selectedBom.bomChildItems?.length || 0}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={addBOMToTable}
                        disabled={!selectedBomId}
                        className="h-10 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 self-end"
                      >
                        <Plus size={16} />
                        Add BOM
                      </button>
                    </div>
                  );
                })()}
              </div>
            )
          )}
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <div className="overflow-x-auto">
          {/* Mobile Cards (Vertical Layout) */}
          <div className="md:hidden space-y-6 bg-gray-50 p-4">
            {productItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8 bg-white border rounded">
                <ShoppingCart className="mx-auto mb-2" size={48} />
                <p>No BOMs added to the product yet</p>
              </div>
            ) : (
              productItems.map((bomItem) => (
                <div key={`mob-${bomItem.bomId}`} className="bg-white border rounded-lg shadow-sm overflow-hidden mb-6">
                  {/* BOM Header Card */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 relative">
                     <h3 className="font-semibold text-blue-900 text-lg">{bomItem.bomName}</h3>
                     <p className="text-sm text-blue-700 font-medium mb-2">{bomItem.bomType} • <span className="text-gray-500 text-xs">{bomItem.bomId}</span></p>
                     
                     <div className="grid grid-cols-2 gap-2 text-sm mt-3 mb-3 border-t border-blue-200 pt-3">
                        <div>
                          <p className="text-gray-500 text-xs">Total Items</p>
                          <p className="font-medium text-gray-800">{(bomItem.bomChildItems?.length || 0) + (bomItem.accessoryItems?.length || 0)} Units</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Amount</p>
                          <p className="font-bold text-blue-900">₹{calculateBOMTotal(bomItem).toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between border-t border-blue-200 pt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600 text-xs font-semibold mr-1">Qty:</span>
                          {isEdit ? (
                             <>
                               <button onClick={() => updateBOMQuantity(bomItem.bomId, bomItem.quantity - 1)} className="p-1 text-red-600 bg-white rounded border" title="Decrease Quantity"><Minus size={14}/></button>
                               <span className="font-medium text-sm w-6 text-center">{bomItem.quantity}</span>
                               <button onClick={() => updateBOMQuantity(bomItem.bomId, bomItem.quantity + 1)} className="p-1 text-green-600 bg-white rounded border" title="Increase Quantity"><Plus size={14}/></button>
                             </>
                          ) : (
                            <span className="px-2 py-1 bg-white rounded border shadow-sm text-center font-medium">{bomItem.quantity}</span>
                          )}
                        </div>
                        {isEdit && (
                          <div className="flex gap-2">
                             <button onClick={() => openAccessoryModal(bomItem.bomId, bomItem.bomChildItems?.[0]?.id ?? 0)} className="bg-green-600 text-white p-1.5 rounded-full shadow hover:bg-green-700" title="Add Accessory"><Plus size={14} /></button>
                             <button onClick={() => removeBOMFromTable(bomItem.bomId)} className="bg-red-100 text-red-600 border border-red-300 p-1.5 rounded-full hover:bg-red-200" title="Remove BOM"><Minus size={14} /></button>
                          </div>
                        )}
                     </div>
                  </div>

                  {/* Child Items with accessories nested */}
                  {(bomItem.bomChildItems || []).length > 0 && (
                    <div className="px-3 border-b pb-2 pt-2 bg-gray-50">
                       <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-2">Child Items</h4>
                       <div className="space-y-2">
                         {(bomItem.bomChildItems || []).map((childItem, childIdx) => (
                            <div key={`mc-${childItem.id ?? childItem.itemCode ?? childIdx}`}>
                              <div className="bg-white border rounded p-3 text-sm flex flex-col gap-2">
                                 <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">{childItem.itemName || "—"}</p>
                                      <p className="text-xs text-gray-500">{childItem.itemCode || ""}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-gray-900">₹{calculateItemTotal(childItem, bomItem.quantity).toLocaleString()}</p>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                    <div><span className="font-semibold">Make:</span> {childItem.make || "—"}</div>
                                    <div><span className="font-semibold">Model:</span> {childItem.model || "—"}</div>
                                    <div className="col-span-2"><span className="font-semibold">Category:</span> {childItem.categoryName || "—"}</div>
                                 </div>
                                 {isEdit && (
                                   <button onClick={() => openAccessoryModal(bomItem.bomId, childItem.itemId || childItem.id)} className="self-start text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center gap-1">
                                     <Plus size={10} /> Add Accessory
                                   </button>
                                 )}
                              </div>
                              {/* Accessories nested under this child only */}
                              {(bomItem.accessoryItems || [])
                                .filter((acc) =>
                                  acc.parentChildItemId == null
                                    ? true // legacy: show under every child
                                    : acc.parentChildItemId === (childItem.itemId || childItem.id)
                                )
                                .length > 0 && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {(bomItem.accessoryItems || [])
                                    .filter((acc) =>
                                      acc.parentChildItemId == null
                                        ? true // legacy: show under every child
                                        : acc.parentChildItemId === (childItem.itemId || childItem.id)
                                    )
                                    .map((accessory) => (
                                    <div key={`ma-${accessory.itemId}`} className="bg-amber-50 border border-amber-200 rounded p-2 text-xs flex justify-between items-center">
                                      <div className="flex items-center gap-1">
                                        <span className="text-amber-400">└─</span>
                                        <div>
                                          <p className="font-medium text-gray-800">{accessory.itemName}</p>
                                          <p className="text-amber-700">Accessory • {accessory.categoryName} • Qty: {accessory.quantity}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isEdit && (
                                          <>
                                            <button onClick={() => updateAccessoryQuantity(bomItem.bomId, accessory.itemId, accessory.quantity - 1)} className="p-0.5 text-red-500 bg-white border rounded"><Minus size={10}/></button>
                                            <span className="font-medium">{accessory.quantity}</span>
                                            <button onClick={() => updateAccessoryQuantity(bomItem.bomId, accessory.itemId, accessory.quantity + 1)} className="p-0.5 text-green-500 bg-white border rounded"><Plus size={10}/></button>
                                            <button onClick={() => removeAccessoryFromBOM(bomItem.bomId, accessory.itemId)} className="text-red-600 border border-red-200 px-1.5 py-0.5 rounded">✕</button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <table className="w-full border-collapse hidden md:table">
            <thead className="bg-gray-50 sticky top-0">
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/5 min-w-[150px]">
                  Product Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4 min-w-[180px]">
                  Specifications
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/8 min-w-[100px]">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/8 min-w-[100px]">
                  Amount
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/5 min-w-[150px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <ShoppingCart className="mx-auto mb-2" size={48} />
                    <p>No BOMs added to the product yet</p>
                  </td>
                </tr>
              ) : (
                productItems.map((bomItem) => (
                  <React.Fragment key={bomItem.bomId}>
                    {/* BOM Header Row */}
                    <tr className="bg-blue-50 border-l-4 border-blue-500 hover:bg-blue-100">
                      <td className="px-4 py-4 w-1/5 min-w-[150px]">
                        <div className="font-semibold text-blue-900">
                          {bomItem.bomName}
                        </div>
                        <div className="text-sm text-blue-700">
                          {bomItem.bomType}
                        </div>
                        <div className="text-xs text-gray-600">
                          {bomItem.bomId}
                        </div>
                      </td>
                      <td className="px-4 py-4 w-1/4 min-w-[180px]">
                        <div className="text-sm text-gray-700 font-medium">
                          <div>
                            {bomItem.bomChildItems
                              ? bomItem.bomChildItems.length
                              : 0}{" "}
                            Child Items
                          </div>
                          <div>
                            {bomItem.accessoryItems
                              ? bomItem.accessoryItems.length
                              : 0}{" "}
                            Accessories
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 w-1/8 min-w-[100px]">
                        <div className="flex items-center justify-center gap-2">
                          {isEdit ? (
                            <>
                              <button
                                onClick={() =>
                                  updateBOMQuantity(
                                    bomItem.bomId,
                                    bomItem.quantity - 1
                                  )
                                }
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Decrease Quantity"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 py-1 bg-white border border-gray-300 rounded min-w-[40px] text-center font-medium">
                                {bomItem.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateBOMQuantity(
                                    bomItem.bomId,
                                    bomItem.quantity + 1
                                  )
                                }
                                className="p-1 text-green-600 hover:bg-green-100 rounded"
                                title="Increase Quantity"
                              >
                                <Plus size={14} />
                              </button>
                            </>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 rounded min-w-[40px] text-center font-medium">
                              {bomItem.quantity}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 w-1/8 min-w-[100px]">
                        <div className="text-lg font-bold text-blue-900 text-right">
                          ₹{calculateBOMTotal(bomItem).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 w-1/5 min-w-[150px]">
                        {isEdit && (
                          <button
                            onClick={() => removeBOMFromTable(bomItem.bomId)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded border border-red-300 whitespace-nowrap mx-auto block"
                            title="Remove BOM"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Child Items with accessories nested under each */}
                    {(bomItem.bomChildItems || []).map((childItem, childIdx) => (
                      <React.Fragment key={`${bomItem.bomId}-child-${childItem.id ?? childItem.itemCode ?? childIdx}`}>
                        {/* Child Item Row */}
                        <tr className="bg-gray-50 hover:bg-gray-100">
                          <td className="px-4 py-3 w-1/5 min-w-[150px]">
                            <div className="flex items-start gap-2 pl-6">
                              <span className="text-gray-400 mt-1 text-xs select-none">├─</span>
                              <div>
                                <div className="font-medium text-gray-900">{childItem.itemName || "—"}</div>
                                <div className="text-sm text-gray-600">{childItem.itemCode || ""}</div>
                                <div className="text-xs text-gray-500">{childItem.product || ""}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-1/4 min-w-[180px]">
                            <div className="text-sm space-y-1">
                              <div className="text-gray-800"><span className="font-semibold">Make:</span> {childItem.make || "—"}</div>
                              <div className="text-gray-800"><span className="font-semibold">Model:</span> {childItem.model || "—"}</div>
                              <div className="text-gray-700"><span className="font-semibold">HSN:</span> {childItem.hsn || "—"}</div>
                              <div className="text-gray-700"><span className="font-semibold">Category:</span> {childItem.categoryName || "—"}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-1/8 min-w-[100px] text-center">
                            <span className="text-sm font-medium text-gray-900">{bomItem.quantity}</span>
                          </td>
                          <td className="px-4 py-3 w-1/8 min-w-[100px] text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              ₹{calculateItemTotal(childItem, bomItem.quantity).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 w-1/5 min-w-[150px] text-center">
                            {isEdit ? (
                              <button
                                onClick={() => openAccessoryModal(bomItem.bomId, childItem.itemId || childItem.id)}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 whitespace-nowrap mx-auto"
                                title="Add Accessory"
                              >
                                <Plus size={12} />
                                Add
                              </button>
                            ) : (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Child Item</span>
                            )}
                          </td>
                        </tr>

                        {/* Accessories nested under this child item only */}
                        {(bomItem.accessoryItems || [])
                          .filter((acc) =>
                            acc.parentChildItemId == null
                              ? true // legacy: show under every child
                              : acc.parentChildItemId === (childItem.itemId || childItem.id)
                          )
                          .map((accessory) => (
                          <tr
                            key={`${bomItem.bomId}-child-${childItem.id}-acc-${accessory.itemId}`}
                            className="bg-amber-50 hover:bg-amber-100"
                          >
                            <td className="px-4 py-2 w-1/5 min-w-[150px]">
                              <div className="flex items-start gap-2 pl-12">
                                <span className="text-amber-400 mt-1 text-xs select-none">└─</span>
                                <div>
                                  <div className="font-medium text-gray-800 text-sm">{accessory.itemName}</div>
                                  <div className="text-xs text-amber-700 font-medium">Accessory</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 w-1/4 min-w-[180px]">
                              <div className="text-xs space-y-0.5 text-gray-600">
                                <div><span className="font-semibold">Type:</span> {accessory.categoryName || "—"}</div>
                                {accessory.hsn && <div><span className="font-semibold">HSN:</span> {accessory.hsn}</div>}
                              </div>
                            </td>
                            <td className="px-4 py-2 w-1/8 min-w-[100px]">
                              <div className="flex items-center justify-center gap-1">
                                {isEdit ? (
                                  <>
                                    <button onClick={() => updateAccessoryQuantity(bomItem.bomId, accessory.itemId, accessory.quantity - 1)} className="p-1 text-red-500 hover:bg-red-100 rounded" title="Decrease"><Minus size={11} /></button>
                                    <span className="px-1 text-sm min-w-[28px] text-center font-medium">{accessory.quantity}</span>
                                    <button onClick={() => updateAccessoryQuantity(bomItem.bomId, accessory.itemId, accessory.quantity + 1)} className="p-1 text-green-500 hover:bg-green-100 rounded" title="Increase"><Plus size={11} /></button>
                                  </>
                                ) : (
                                  <span className="text-sm font-medium">{accessory.quantity}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 w-1/8 min-w-[100px] text-right">
                            </td>
                            <td className="px-4 py-2 w-1/5 min-w-[150px] text-center">
                              {isEdit && (
                                <button
                                  onClick={() => removeAccessoryFromBOM(bomItem.bomId, accessory.itemId)}
                                  className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        {productItems.length > 0 && (
          <div className="border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">
                Grand Total:
              </span>
              <span className="text-3xl font-bold text-blue-800">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Accessory Modal */}
      {showAccessoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Add Accessory
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Adding accessory to:{" "}
                <span className="font-medium text-blue-600">
                  {
                    productItems.find((item) => item.bomId === currentBomId)
                      ?.bomName
                  }
                </span>
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Accessory
              </label>
              {accessoryLoading ? (
                <div className="text-sm text-gray-500 py-2">Loading accessories...</div>
              ) : childAccessoryDetails.length === 0 ? (
                <div className="text-sm text-gray-500 py-2 italic">No accessories found for this item.</div>
              ) : (
                <select
                  value={selectedAccessoryId || ""}
                  onChange={(e) =>
                    setSelectedAccessoryId(e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an accessory...</option>
                  {childAccessoryDetails.map((detail) => {
                    const currentBom = productItems.find((item) => item.bomId === currentBomId);
                    const isAlreadyAdded = currentBom?.accessoryItems.some((acc) => acc.itemId === detail.id);
                    return (
                      <option key={detail.id} value={detail.id} disabled={isAlreadyAdded}>
                        {detail.accessoriesName} — {detail.itemType} (Qty: {detail.qty})
                        {isAlreadyAdded ? " (Already Added)" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {selectedAccessoryId && (() => {
              const detail = childAccessoryDetails.find((d) => d.id === selectedAccessoryId);
              return detail ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Selected Accessory Details:</h4>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Name:</span> {detail.accessoriesName}</div>
                    <div><span className="font-medium">Type:</span> {detail.itemType}</div>
                    <div><span className="font-medium">Qty:</span> {detail.qty}</div>
                  </div>
                </div>
              ) : null;
            })()}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeAccessoryModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedAccessoryId &&
                  addAccessoryToBOM(currentBomId, selectedAccessoryId)
                }
                disabled={!selectedAccessoryId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={16} />
                Add Accessory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityProducts;
