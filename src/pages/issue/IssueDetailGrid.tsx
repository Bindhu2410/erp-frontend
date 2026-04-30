
import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import api from "../../services/api";

export interface IssueItem {
  id: number;
  sNo: number;
  make: string;
  category: string;
  product: string;
  model: string;
  item: string;
  equIns: string;
  batchNo: string;
  receiptNo: string;
  unit: string;
  qtyAvl: number;
  qty: number;
  rate: number;
  amount: number;
  remarks: string;
  readonly?: boolean;
}

interface IssueDetailGridProps {
  items: IssueItem[];
  onChange: (items: IssueItem[]) => void;
}

const IssueDetailGrid: React.FC<IssueDetailGridProps> = ({ items, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const response = await api.get("ItemDropdown/item-list");
      const data = response.data || [];
      setAllItems(data);

      // API returns camelCase (JsonNamingPolicy.CamelCase on backend)
      setMakes(Array.from(new Set(data.map((i: any) => i.make).filter(Boolean))) as string[]);
      setCategories(Array.from(new Set(data.map((i: any) => i.categoryName).filter(Boolean))) as string[]);
      setProducts(Array.from(new Set(data.map((i: any) => i.product).filter(Boolean))) as string[]);
      setModels(Array.from(new Set(data.map((i: any) => i.model).filter(Boolean))) as string[]);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItemRow = () => {
    const newItem: IssueItem = {
      id: 0,
      sNo: items.length + 1,
      make: "",
      category: "",
      product: "",
      model: "",
      item: "",
      equIns: "",
      batchNo: "",
      receiptNo: "",
      unit: "",
      qtyAvl: 0,
      qty: 0,
      rate: 0,
      amount: 0,
      remarks: ""
    };
    onChange([...items, newItem]);
  };

  const removeItemRow = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    // Update SNo
    const updatedItems = newItems.map((item, i) => ({ ...item, sNo: i + 1 }));
    onChange(updatedItems);
  };

  const handleInputChange = (index: number, field: keyof IssueItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    // Auto-calculate amount
    if (field === "qty" || field === "rate") {
      const qty = field === "qty" ? parseFloat(value) || 0 : item.qty;
      const rate = field === "rate" ? parseFloat(value) || 0 : item.rate;
      item.amount = qty * rate;
    }

      // Auto-populate based on item selection
    if (field === "item") {
      const selectedItem = allItems.find(i => i.itemName === value);
      if (selectedItem) {
        item.unit = selectedItem.uomName || "";
        item.rate = selectedItem.saleRate || selectedItem.unitPrice || 0;
        item.make = selectedItem.make || item.make;
        item.category = selectedItem.categoryName || item.category;
        item.product = selectedItem.product || item.product;
        item.model = selectedItem.model || item.model;
        item.amount = item.qty * item.rate;
      }
    }

    newItems[index] = item;
    onChange(newItems);
  };

  // Helper to filter items based on current row selections (camelCase API response)


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 flex justify-between items-center text-white">
        <h3 className="font-bold text-lg">Detailed Issue Items</h3>
        <button
          type="button"
          onClick={addItemRow}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all"
        >
          <FaPlus size={14} /> Add Row
        </button>
      </div>

      <div className="overflow-x-auto flex-grow overflow-y-auto" style={{ maxHeight: "500px" }}>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase w-12">S No</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[150px]">Make*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[150px]">Category*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[150px]">Product*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[150px]">Model*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[200px]">Item*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[120px]">Equ/Ins</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[120px]">Batch No</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[120px]">Receipt No.</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[80px]">Unit</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[80px]">Qty Avl.</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[100px]">Qty*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[100px]">Rate</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[120px]">Amount*</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase min-w-[150px]">Remarks</th>
              <th className="px-3 py-3 border text-xs font-bold text-gray-700 uppercase w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => {
              // Hierarchical filtering for dropdown options (Case-Insensitive)
              const uniqueMakes = Array.from(new Set(allItems.map(i => i.make).filter(Boolean)));
              
              const filteredForCats = allItems.filter(i => 
                !item.make || (i.make?.toLowerCase() === item.make?.toLowerCase())
              );
              let uniqueCats = Array.from(new Set(filteredForCats.map(i => i.categoryName).filter(Boolean)));
              // If the current category is not in the filtered list (e.g. from auto-fill), add it so it displays
              if (item.category && !uniqueCats.includes(item.category)) {
                uniqueCats = [item.category, ...uniqueCats];
              }
              
              const filteredForProds = filteredForCats.filter(i => 
                !item.category || (i.categoryName?.toLowerCase() === item.category?.toLowerCase())
              );
              let uniqueProds = Array.from(new Set(filteredForProds.map(i => i.product).filter(Boolean)));
              if (item.product && !uniqueProds.includes(item.product)) {
                uniqueProds = [item.product, ...uniqueProds];
              }
              
              const filteredForMods = filteredForProds.filter(i => 
                !item.product || (i.product?.toLowerCase() === item.product?.toLowerCase())
              );
              let uniqueMods = Array.from(new Set(filteredForMods.map(i => i.model).filter(Boolean)));
              if (item.model && !uniqueMods.includes(item.model)) {
                uniqueMods = [item.model, ...uniqueMods];
              }
              
              const filteredItems = filteredForMods.filter(i => 
                !item.model || (i.model?.toLowerCase() === item.model?.toLowerCase())
              );

              return (
                <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-2 py-2 border text-sm text-center font-medium bg-gray-50">{item.sNo}</td>
                  <td className="px-2 py-2 border text-sm">
                    <select
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      value={item.make}
                      onChange={(e) => handleInputChange(index, "make", e.target.value)}
                      disabled={item.readonly}
                    >
                      <option value="">Select Make</option>
                      {uniqueMakes.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <select
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      value={item.category}
                      onChange={(e) => handleInputChange(index, "category", e.target.value)}
                      disabled={item.readonly}
                    >
                      <option value="">Select Category</option>
                      {uniqueCats.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <select
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      value={item.product}
                      onChange={(e) => handleInputChange(index, "product", e.target.value)}
                      disabled={item.readonly}
                    >
                      <option value="">Select Product</option>
                      {uniqueProds.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <select
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent disabled:opacity-75 disabled:cursor-not-allowed"
                      value={item.model}
                      onChange={(e) => handleInputChange(index, "model", e.target.value)}
                      disabled={item.readonly}
                    >
                      <option value="">Select Model</option>
                      {uniqueMods.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <select
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent font-medium disabled:opacity-75 disabled:cursor-not-allowed"
                      value={item.item}
                      onChange={(e) => handleInputChange(index, "item", e.target.value)}
                      disabled={item.readonly}
                    >
                      <option value="">Select Item</option>
                      {filteredItems.map(i => <option key={i.itemId} value={i.itemName}>{i.itemName}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="text"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      value={item.equIns}
                      onChange={(e) => handleInputChange(index, "equIns", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="text"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      value={item.batchNo}
                      onChange={(e) => handleInputChange(index, "batchNo", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="text"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      value={item.receiptNo}
                      onChange={(e) => handleInputChange(index, "receiptNo", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-sm text-center bg-gray-50">{item.unit}</td>
                  <td className="px-2 py-2 border text-sm text-center bg-gray-50 font-bold text-blue-600">{item.qtyAvl}</td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="number"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent font-bold"
                      value={item.qty || ""}
                      onChange={(e) => handleInputChange(index, "qty", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="number"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      value={item.rate || ""}
                      onChange={(e) => handleInputChange(index, "rate", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-sm text-right font-bold bg-blue-50/50">
                    {item.amount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-2 border text-sm">
                    <input
                      type="text"
                      className="w-full border-0 focus:ring-1 focus:ring-blue-400 rounded bg-transparent"
                      value={item.remarks}
                      onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
                    />
                  </td>
                  <td className="px-2 py-2 border text-center">
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center p-12 text-gray-400 bg-gray-50/50">
          <div className="mb-4 text-6xl">📦</div>
          <p className="text-xl font-medium">No items added yet</p>
          <button
            type="button"
            onClick={addItemRow}
            className="mt-4 text-blue-600 hover:underline font-bold"
          >
            Click here to add your first row
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="p-4 bg-gray-100 border-t flex justify-end gap-8">
          <div className="text-sm font-bold text-gray-600">
            Total Items: <span className="text-blue-600 ml-1">{items.length}</span>
          </div>
          <div className="text-sm font-bold text-gray-600">
            Total Qty: <span className="text-blue-600 ml-1">{items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0)}</span>
          </div>
          <div className="text-sm font-bold text-gray-600">
            Gross Total: <span className="text-indigo-700 ml-1">₹{items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueDetailGrid;
