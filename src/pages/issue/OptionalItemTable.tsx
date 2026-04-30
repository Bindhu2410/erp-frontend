
import React from "react";
import InputField from "../../components/common/InputField";

export interface OptionalItem {
  id?: number;
  sNo: number;
  optMake: string;
  optCategory: string;
  optProduct: string;
  optModel: string;
  optItem: string;
  optItemDesc: string;
  optQty: number;
  optRate: number;
  optAmount: number;
}

interface OptionalItemTableProps {
  items: OptionalItem[];
  onChange: (items: OptionalItem[]) => void;
}

const OptionalItemTable: React.FC<OptionalItemTableProps> = ({ items, onChange }) => {
  const handleAddRow = () => {
    const newItem: OptionalItem = {
      sNo: items.length + 1,
      optMake: "",
      optCategory: "",
      optProduct: "",
      optModel: "",
      optItem: "",
      optItemDesc: "",
      optQty: 1,
      optRate: 0,
      optAmount: 0,
    };
    onChange([...items, newItem]);
  };

  const handleRemoveRow = (index: number) => {
    const newItems = items.filter((_, i) => i !== index).map((item, i) => ({ ...item, sNo: i + 1 }));
    onChange(newItems);
  };

  const handleInputChange = (index: number, field: keyof OptionalItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount
    if (field === "optQty" || field === "optRate") {
      newItems[index].optAmount = (newItems[index].optQty || 0) * (newItems[index].optRate || 0);
    }
    
    onChange(newItems);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">S No</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Make</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Category</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Product</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Model</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Item</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Item Desc</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Qty</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Rate</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider border-r">Opt Amount</th>
            <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-2 py-2 border-r text-center font-medium">{item.sNo}</td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optMake}
                  onChange={(e) => handleInputChange(index, "optMake", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optCategory}
                  onChange={(e) => handleInputChange(index, "optCategory", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optProduct}
                  onChange={(e) => handleInputChange(index, "optProduct", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optModel}
                  onChange={(e) => handleInputChange(index, "optModel", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optItem}
                  onChange={(e) => handleInputChange(index, "optItem", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="text"
                  value={item.optItemDesc}
                  onChange={(e) => handleInputChange(index, "optItemDesc", e.target.value)}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="number"
                  value={item.optQty}
                  onChange={(e) => handleInputChange(index, "optQty", parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-right"
                />
              </td>
              <td className="px-2 py-2 border-r">
                <input
                  type="number"
                  value={item.optRate}
                  onChange={(e) => handleInputChange(index, "optRate", parseFloat(e.target.value))}
                  className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 outline-none text-right"
                />
              </td>
              <td className="px-2 py-2 border-r text-right font-semibold text-blue-700">
                {item.optAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </td>
              <td className="px-2 py-2 text-center">
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="text-red-500 hover:text-red-700 p-1 transition-colors"
                  title="Remove Row"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 bg-gray-50/50 flex justify-end">
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>
    </div>
  );
};

export default OptionalItemTable;
