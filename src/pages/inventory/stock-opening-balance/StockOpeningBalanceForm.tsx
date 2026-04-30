import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../services/api";
import {
  StockOpeningBalance,
  StockOpeningBalanceItem,
} from "../../../types/stockOpeningBalance";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";

interface LocationOption {
  id: number;
  name: string;
}

interface ItemOption {
  id: number;
  itemCode: string;
  itemName: string;
  category: string;
  make: string;
  model: string;
}

interface UOMOption {
  id: number;
  name: string;
}

const StockOpeningBalanceForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isView = location.state?.isView === true;

  const [formData, setFormData] = useState<StockOpeningBalance>({
    documentNo: "",
    location: "",
    items: [],
    remarks: "",
  });

  const [items, setItems] = useState<ItemOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [uoms, setUoms] = useState<UOMOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchMasterData();
    if (id && id !== "new") {
      fetchStockOpeningBalance(id);
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      setLoading(true);
      
      // Set hardcoded location options first
      const locationOptions = [
        { id: 1, name: "Sales" },
        { id: 2, name: "Service" },
        { id: 3, name: "Non Moving" },
        { id: 4, name: "Store" },
      ];
      setLocations(locationOptions);
      console.log("Locations set:", locationOptions);
      
      const [itemsRes, uomsRes] = await Promise.all([
        api.get("/ItemMaster"),
        api.get("/UOM"),
      ]);

      setItems(itemsRes.data);
      setUoms(uomsRes.data);
      console.log("Master data loaded successfully");
    } catch (error) {
      console.error("Error fetching master data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockOpeningBalance = async (docId: string) => {
    try {
      const response = await api.get(`/StockOpeningBalance/${docId}`);
      setFormData(response.data);
    } catch (error) {
      console.error("Error fetching stock opening balance:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    const item = updatedItems[index];

    if (field === "itemId") {
      const selectedItem = items.find((i) => i.id === parseInt(value));
      if (selectedItem) {
        updatedItems[index] = {
          ...item,
          itemId: selectedItem.id,
          product: selectedItem.itemName,
          category: selectedItem.category,
          make: selectedItem.make,
          model: selectedItem.model,
        };
      }
    } else if (field === "quantity" || field === "rate") {
      updatedItems[index] = {
        ...item,
        [field]: parseFloat(value) || 0,
      };
      // Calculate stock value
      const qty = field === "quantity" ? parseFloat(value) : item.quantity;
      const rate = field === "rate" ? parseFloat(value) : item.rate;
      updatedItems[index].stockValue = qty * rate;
    } else {
      updatedItems[index] = {
        ...item,
        [field]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addRow = () => {
    const newItem: StockOpeningBalanceItem = {
      sNo: formData.items.length + 1,
      make: "",
      category: "",
      product: "",
      model: "",
      itemId: 0,
      uom: "",
      batch: "",
      quantity: 0,
      rate: 0,
      stockValue: 0,
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const removeRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.stockValue, 0);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData.documentNo || !formData.location || formData.items.length === 0) {
        alert("Please fill all required fields and add at least one item");
        return;
      }

      const payload = {
        ...formData,
        total: calculateTotal(),
      };

      if (id && id !== "new") {
        await api.put(`/StockOpeningBalance/${id}`, payload);
      } else {
        await api.post("/StockOpeningBalance", payload);
      }

      alert(
        id && id !== "new"
          ? "Stock Opening Balance updated successfully"
          : "Stock Opening Balance created successfully"
      );
      navigate("/inventory/stock-opening-balance");
    } catch (error) {
      console.error("Error saving stock opening balance:", error);
      alert("Error saving stock opening balance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {id && id !== "new" ? "Edit Stock Opening Balance" : "Create Stock Opening Balance"}
          </h1>
        </div>
        <button
          onClick={() => navigate("/inventory/stock-opening-balance")}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Document No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document No<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documentNo"
                value={formData.documentNo}
                onChange={handleInputChange}
                disabled={isView || (!!id && id !== "new")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="SOB-001"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location<span className="text-red-500">*</span>
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                disabled={isView}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Stock Opening Details</h2>
              {!isView && (
                <button
                  onClick={addRow}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <FaPlus /> Add Row
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Item ID
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Category
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Make
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Model
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Product
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      UOM
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Batch
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Rate
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">
                      Stock Value
                    </th>
                    {!isView && (
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {formData.items.length > 0 ? (
                    formData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {isView ? (
                            <span>{item.itemId}</span>
                          ) : (
                            <select
                              value={item.itemId || ""}
                              onChange={(e) =>
                                handleItemChange(index, "itemId", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select Item</option>
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.itemCode} - {i.itemName}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.category}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.make}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.model}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{item.product}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {isView ? (
                            <span>{item.uom}</span>
                          ) : (
                            <select
                              value={item.uom || ""}
                              onChange={(e) =>
                                handleItemChange(index, "uom", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="">Select UOM</option>
                              {uoms.map((u) => (
                                <option key={u.id} value={u.name}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {isView ? (
                            <span>{item.batch}</span>
                          ) : (
                            <input
                              type="text"
                              value={item.batch}
                              onChange={(e) =>
                                handleItemChange(index, "batch", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Batch"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {isView ? (
                            <span>{item.quantity}</span>
                          ) : (
                            <input
                              type="number"
                              value={item.quantity || ""}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="0"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {isView ? (
                            <span>{item.rate.toFixed(2)}</span>
                          ) : (
                            <input
                              type="number"
                              value={item.rate || ""}
                              onChange={(e) =>
                                handleItemChange(index, "rate", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="0"
                              step="0.01"
                            />
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm font-semibold">
                          {item.stockValue.toFixed(2)}
                        </td>
                        {!isView && (
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <button
                              onClick={() => removeRow(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isView ? 11 : 12} className="border border-gray-300 px-4 py-4 text-center text-gray-500">
                        No items added yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-gray-200 px-6 py-3 rounded-lg">
                <p className="text-lg font-semibold text-gray-800">
                  Total: <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={handleInputChange}
              disabled={isView}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              rows={4}
              placeholder="Add any remarks..."
            />
          </div>

          {/* Action Buttons */}
          {!isView && (
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate("/inventory/stock-opening-balance")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                <FaSave /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {isView && (
            <div className="flex justify-end gap-4">
              <button
                onClick={() => navigate(`/inventory/stock-opening-balance/${id}`)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => navigate("/inventory/stock-opening-balance")}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockOpeningBalanceForm;
