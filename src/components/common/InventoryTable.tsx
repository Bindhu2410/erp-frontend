import React, { useState, useEffect } from "react";
import {
  FaChevronDown as ChevronDown,
  FaPlus as Plus,
  FaTrash as Trash2,
} from "react-icons/fa";
import { LuPackage as Package } from "react-icons/lu";
import api from "../../services/api";

type ChildItem = {
  itemId: number;
  quantity: number;
  categoryName: string;
  groupName: string | null;
  valuationMethodName: string;
  inventoryMethodName: string;
  inventoryTypeName: string | null;
  unitPrice: number;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  catNo: string;
  uomName: string;
  purchaseRate: number;
  saleRate: number;
  quoteRate: number;
  hsn: string;
  taxPercentage: number;
};

type BOM = {
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: ChildItem[];
  supplierId?: string;
  supplierName?: string;
  quantity?: number;
};

interface BOMSelectorProps {
  onSelectedBOMsChange?: (selectedBOMIds: string[]) => void;
  initialBomDetails?: {
    id: number;
    bomId: string;
    bomName: string;
    bomType: string;
    childItems: ChildItem[];
  }[];
  isReceipt?: boolean;
  onItemsChange?: (items: any[]) => void;
  ShowSupplierDropdown: boolean;
}

const InventoryTable = ({
  onSelectedBOMsChange,
  initialBomDetails,
  isReceipt,
  onItemsChange,
  ShowSupplierDropdown = false,
}: BOMSelectorProps) => {
  console.log("Initial BOM Details:", initialBomDetails);
  const [selectedBOMs, setSelectedBOMs] = useState<BOM[]>([]);
  const [selectedBomName, setSelectedBomName] = useState<string>("");
  const [selectedBomType, setSelectedBomType] = useState<string>("");
  const [isNameDropdownOpen, setIsNameDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  // Removed supplier-related state variables

  // Reset type selection when name changes
  useEffect(() => {
    setSelectedBomType("");
  }, [selectedBomName]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bomData, setBomData] = useState<BOM[]>([]);

  // Initialize selected BOMs from initialBomDetails
  useEffect(() => {
    if (Array.isArray(initialBomDetails) && initialBomDetails.length > 0) {
      console.log("Setting initial BOM details:", initialBomDetails);
      const boms = initialBomDetails.map((bom) => ({
        bomId: bom.bomId,
        bomName: bom.bomName,
        bomType: bom.bomType,
        childItems: bom.childItems || [],
      }));

      // Only update state if the new BOMs differ from the current state
      if (JSON.stringify(boms) !== JSON.stringify(selectedBOMs)) {
        setSelectedBOMs(boms);
        onSelectedBOMsChange?.(boms.map((b) => b.bomId));

        if (isReceipt && onItemsChange) {
          const allItems = boms.flatMap((bom) => bom.childItems);
          onItemsChange(allItems);
        }
      }
    }
  }, [initialBomDetails]);

  // Fetch BOM data from API only if no initial details provided
  useEffect(() => {
    const fetchBOMData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.post("BomDropdown/bom-list", {
          Search: "",
          Page: 0,
          PageSize: 0,
        });
        setBomData(response.data || []);
      } catch (err) {
        setError("Failed to fetch BOM data. Please try again later.");
        console.error("Error fetching BOM data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBOMData();
  }, []);

  const removeBOM = (bomId: string) => {
    const newSelectedBOMs = selectedBOMs.filter((bom) => bom.bomId !== bomId);
    setSelectedBOMs(newSelectedBOMs);

    // Trigger `onSelectedBOMsChange` only if explicitly required
    if (onSelectedBOMsChange) {
      onSelectedBOMsChange(newSelectedBOMs.map((b) => b.bomId));
    }
  };

  const availableBOMs = bomData.filter(
    (bom) => !selectedBOMs.find((selected) => selected.bomId === bom.bomId)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDropdownClick = (event: React.MouseEvent) => {
    // Prevent event propagation to parent components
    event.stopPropagation();
  };

  // Removed supplier-related useEffects and handlers

  const handleAddBOM = () => {
    const selectedBom = availableBOMs.find(
      (bom) =>
        bom.bomName === selectedBomName && bom.bomType === selectedBomType
    );
    if (selectedBom) {
      const newSelectedBOMs = [
        ...selectedBOMs,
        {
          ...selectedBom,
          quantity: parseFloat(quantity) || 0,
        },
      ];
      setSelectedBOMs(newSelectedBOMs);

      // Trigger `onSelectedBOMsChange` only if explicitly required
      if (onSelectedBOMsChange) {
        onSelectedBOMsChange(newSelectedBOMs.map((b) => b.bomId));
      }

      // Reset selections
      setSelectedBomName("");
      setSelectedBomType("");
      setQuantity("");
    }
  };

  // Add a useEffect to pass selected BOMs to the parent component
  useEffect(() => {
    if (onItemsChange) {
      const updatedItems = selectedBOMs.map((bom) => ({
        bomId: bom.bomId,
        quantity: bom.quantity || 0,
      }));
      onItemsChange(updatedItems);
    }
  }, [selectedBOMs, onItemsChange]);

  // Define state variables for quantity
  const [quantity, setQuantity] = useState<string>("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Product Management System
              </h1>
              <p className="text-gray-600">
                Select products from dropdown to add to the table
              </p>
            </div>
          </div>

          {/* Dropdowns Container */}
          <div className="flex gap-4 items-start">
            {/* Product Name Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsNameDropdownOpen(!isNameDropdownOpen);
                  setIsTypeDropdownOpen(false);
                }}
                className="w-full border-2 rounded-lg px-4 py-3 text-left transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {selectedBomName || "Select Product Name"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isNameDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Name Dropdown Menu */}
              {isNameDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                  {Array.from(
                    new Set(availableBOMs.map((bom) => bom.bomName))
                  ).map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => {
                        setSelectedBomName(name);
                        setIsNameDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Type Dropdown */}
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => {
                  setIsTypeDropdownOpen(!isTypeDropdownOpen);
                  setIsNameDropdownOpen(false);
                }}
                className="w-full border-2 rounded-lg px-4 py-3 text-left transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">
                    {selectedBomType || "Select Product Type"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      isTypeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Type Dropdown Menu */}
              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto">
                  {Array.from(
                    new Set(
                      availableBOMs
                        .filter(
                          (bom) =>
                            !selectedBomName || bom.bomName === selectedBomName
                        )
                        .map((bom) => bom.bomType)
                    )
                  ).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setSelectedBomType(type);
                        setIsTypeDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{type}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity input field near Product Type dropdown */}
            <div className="relative flex-1">
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  setQuantity(value);
                  setSelectedBOMs((prevBOMs) => {
                    const updatedBOMs = prevBOMs.map((bom) => {
                      if (
                        bom.bomName === selectedBomName &&
                        bom.bomType === selectedBomType
                      ) {
                        return {
                          ...bom,
                          quantity: value ? parseFloat(value) : 0,
                        };
                      }
                      return bom;
                    });
                    return updatedBOMs;
                  });
                }}
                placeholder="Enter Quantity"
                className="w-full border-2 rounded-lg px-4 py-3 text-left transition-all duration-200 bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {/* Add Button */}
            <button
              type="button"
              onClick={() => {
                handleAddBOM();
              }}
              disabled={!selectedBomName || !selectedBomType}
              className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                selectedBomName && selectedBomType
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </div>
            </button>
          </div>
        </div>

        {/* Product Table */}
        {selectedBOMs.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Product Details & Items
              </h2>
              <p className="text-gray-600 mt-1">
                Selected Products: {selectedBOMs.length} | Total Items:{" "}
                {selectedBOMs.reduce(
                  (sum, bom) => sum + bom.childItems.length,
                  0
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {selectedBOMs.map((bom, bomIndex) => (
                    <React.Fragment key={bom.bomId}>
                      {/* Product Header Row */}
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td className="px-6 py-4 text-lg font-semibold text-blue-800 border-r border-gray-200">
                          {bom.bomName}
                        </td>
                        <td className="px-6 py-4 text-lg font-semibold text-blue-800 border-r border-gray-200">
                          {bom.bomType}
                        </td>
                        <td className="px-6 py-4 text-lg font-semibold text-blue-800 border-r border-gray-200">
                          {bom.quantity || 0}
                        </td>
                        <td className="px-6 py-4 bg-blue-50 text-center">
                          <button
                            type="button"
                            onClick={() => removeBOM(bom.bomId)}
                            className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </button>
                        </td>
                      </tr>

                      {/* Child Items Section Headers */}
                      {bom.childItems.length > 0 && (
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td className="px-12 py-3 text-xs font-semibold text-gray-700 border-r border-gray-200">
                            ITEM NAME
                          </td>
                          <td className="px-6 py-3 text-xs font-semibold text-gray-700 border-r border-gray-200">
                            MAKE
                          </td>
                          <td className="px-6 py-3 text-xs font-semibold text-gray-700 border-r border-gray-200">
                            MODEL
                          </td>
                          <td className="px-6 py-3 text-xs font-semibold text-gray-700">
                            ITEM CODE / CAT NO
                          </td>
                        </tr>
                      )}

                      {/* Child Items Data Rows */}
                      {bom.childItems.length > 0 ? (
                        bom.childItems.map((item, itemIndex) => (
                          <tr
                            key={`${bom.bomId}-${item.itemId}`}
                            className="hover:bg-gray-50 border-b border-gray-100"
                          >
                            <td className="px-12 py-3 text-sm text-gray-800 border-r border-gray-200">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                <span className="font-medium">
                                  {item.itemName}
                                </span>
                              </div>
                              <div className="ml-4 text-xs text-gray-600 mt-1">
                                <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                                  {item.categoryName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {item.make}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700 border-r border-gray-200">
                              {item.model}
                            </td>
                            <td className="px-6 py-3 text-sm text-gray-700">
                              <div className="space-y-1">
                                <div>
                                  <span className="text-xs text-gray-500">
                                    Code:
                                  </span>{" "}
                                  {item.itemCode}
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500">
                                    Cat No:
                                  </span>{" "}
                                  {item.catNo}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="border-b border-gray-100">
                          <td
                            colSpan={4}
                            className="px-12 py-3 text-sm text-gray-500 italic"
                          >
                            No items found for this product
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Products Selected
            </h3>
            <p className="text-gray-500">
              Use the dropdown above to select and add products to the table.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
