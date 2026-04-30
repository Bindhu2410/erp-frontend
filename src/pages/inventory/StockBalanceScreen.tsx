import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrash } from "react-icons/fa";

// Sample data (simulate JSON/API)
const initialStock = [
  {
    itemCode: "P001",
    itemName: "Diathermy",
    warehouse: "Main",
    quantity: 70,
    reorderLevel: 20,
    reserved: 5,
    unitPrice: 10,
    stockValue: 700,
    lastUpdated: "2025-09-10",
    status: "OK",
  },
  {
    itemCode: "P002",
    itemName: "Lap set",
    warehouse: "Main",
    quantity: 15,
    reorderLevel: 10,
    reserved: 0,
    unitPrice: 10,
    stockValue: 150,
    lastUpdated: "2025-09-09",
    status: "Low",
  },
];

const warehouses = ["Main", "Secondary"];

const getStatusBadge = (status: string) => {
  if (status === "OK")
    return (
      <span className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded font-semibold">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="#22c55e" />
          <path
            d="M9 12l2 2 4-4"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        OK
      </span>
    );
  if (status === "Low")
    return (
      <span className="flex items-center gap-1 bg-yellow-400 text-white px-2 py-1 rounded font-semibold">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="#facc15" />
          <path
            d="M12 8v4l2 2"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Low
      </span>
    );
  if (status === "Out")
    return (
      <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 rounded font-semibold">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="#ef4444" />
          <path
            d="M8 8l8 8M16 8l-8 8"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Out
      </span>
    );
  return (
    <span className="bg-gray-300 text-white px-2 py-1 rounded">Unknown</span>
  );
};

const StockBalanceScreen = () => {
  const [stock, setStock] = useState(initialStock);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  // Filtered and searched data
  const filteredStock = stock.filter((item) => {
    const matchesSearch =
      item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      item.itemName.toLowerCase().includes(search.toLowerCase());
    const matchesWarehouse = warehouseFilter
      ? item.warehouse === warehouseFilter
      : true;
    const matchesLowStock = lowStockOnly
      ? item.quantity < item.reorderLevel
      : true;
    return matchesSearch && matchesWarehouse && matchesLowStock;
  });

  // Edit logic
  const handleEdit = (itemCode: string) => {
    setEditRow(itemCode);
    setEditData(stock.find((item) => item.itemCode === itemCode) || {});
  };
  const handleEditChange = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = () => {
    setStock((prev) =>
      prev.map((item) =>
        item.itemCode === editRow
          ? {
              ...item,
              ...editData,
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : item
      )
    );
    setEditRow(null);
    setEditData({});
  };
  const handleDelete = (itemCode: string) => {
    if (window.confirm("Are you sure you want to delete this stock entry?")) {
      setStock((prev) => prev.filter((item) => item.itemCode !== itemCode));
    }
  };

  // Add new stock entry
  const [showAdd, setShowAdd] = useState(false);
  const [newStock, setNewStock] = useState<any>({
    itemCode: "",
    itemName: "",
    warehouse: "",
    quantity: 0,
    reorderLevel: 0,
    reserved: 0,
    unitPrice: 0,
    stockValue: 0,
    lastUpdated: new Date().toISOString().slice(0, 10),
    status: "OK",
  });
  const handleAddChange = (field: string, value: any) => {
    setNewStock((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleAddSave = () => {
    if (!newStock.itemCode || !newStock.itemName || !newStock.warehouse)
      return alert("Fill all required fields.");
    if (
      stock.some(
        (s) =>
          s.itemCode === newStock.itemCode && s.warehouse === newStock.warehouse
      )
    ) {
      return alert("Item + Warehouse combination must be unique.");
    }
    setStock((prev) => [
      ...prev,
      { ...newStock, stockValue: newStock.quantity * newStock.unitPrice },
    ]);
    setShowAdd(false);
    setNewStock({
      itemCode: "",
      itemName: "",
      warehouse: "",
      quantity: 0,
      reorderLevel: 0,
      reserved: 0,
      unitPrice: 0,
      stockValue: 0,
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: "OK",
    });
  };

  // Export CSV
  const handleExport = () => {
    const csv = [
      [
        "Item Code",
        "Item Name",
        "Warehouse",
        "Qty",
        "Reorder Level",
        "Reserved",
        "Stock Value",
        "Last Updated",
        "Status",
      ].join(","),
      ...stock.map((item) =>
        [
          item.itemCode,
          item.itemName,
          item.warehouse,
          item.quantity,
          item.reorderLevel,
          item.reserved,
          item.stockValue,
          item.lastUpdated,
          item.status,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock_balance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-blue-700 tracking-tight">
        Stock Balance
      </h2>
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by item code or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-64"
          />
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="accent-blue-600"
            />
            Low Stock Only
          </label>
        </div>
        <div className="flex gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            onClick={handleExport}
          >
            <span className="font-semibold">Export CSV</span>
          </button>

          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
            onClick={() => setShowAdd(true)}
          >
            <span className="font-semibold">Add Stock</span>
          </button>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-700 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold text-left">Item Code</th>
              <th className="px-4 py-3 font-semibold text-left">Item Name</th>
              <th className="px-4 py-3 font-semibold text-left">Warehouse</th>
              <th className="px-4 py-3 font-semibold text-right">Qty</th>
              <th className="px-4 py-3 font-semibold text-right">
                Reorder Level
              </th>
              <th className="px-4 py-3 font-semibold text-right">Reserved</th>
              <th className="px-4 py-3 font-semibold text-right">
                Stock Value
              </th>
              <th className="px-4 py-3 font-semibold text-center">
                Last Updated
              </th>
              <th className="px-4 py-3 font-semibold text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-gray-400">
                  No stock entries found.
                </td>
              </tr>
            ) : (
              filteredStock.map((item, idx) => (
                <tr
                  key={item.itemCode}
                  className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} ${
                    item.quantity < item.reorderLevel ? "bg-yellow-100" : ""
                  } hover:bg-blue-50 transition`}
                >
                  {editRow === item.itemCode ? (
                    <>
                      <td className="border-t px-4 py-2">{item.itemCode}</td>
                      <td className="border-t px-4 py-2">{item.itemName}</td>
                      <td className="border-t px-4 py-2">
                        <select
                          value={editData.warehouse}
                          onChange={(e) =>
                            handleEditChange("warehouse", e.target.value)
                          }
                          className="border rounded px-2 py-1"
                        >
                          {warehouses.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        <input
                          type="number"
                          value={editData.quantity}
                          min={0}
                          onChange={(e) =>
                            handleEditChange("quantity", Number(e.target.value))
                          }
                          className="border rounded px-2 py-1 w-20 text-right"
                        />
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        <input
                          type="number"
                          value={editData.reorderLevel}
                          min={0}
                          onChange={(e) =>
                            handleEditChange(
                              "reorderLevel",
                              Number(e.target.value)
                            )
                          }
                          className="border rounded px-2 py-1 w-20 text-right"
                        />
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        <input
                          type="number"
                          value={editData.reserved}
                          min={0}
                          onChange={(e) =>
                            handleEditChange("reserved", Number(e.target.value))
                          }
                          className="border rounded px-2 py-1 w-20 text-right"
                        />
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        ${editData.quantity * editData.unitPrice}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        {item.lastUpdated}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        {getStatusBadge(
                          editData.quantity < editData.reorderLevel
                            ? "Low"
                            : "OK"
                        )}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        <button
                          className=" text-green-600 hover:text-green-700 px-3 py-1 "
                          onClick={handleEditSave}
                        >
                          <FaSave />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-700 px-3 py-1"
                          onClick={() => setEditRow(null)}
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border-t px-4 py-2">{item.itemCode}</td>
                      <td className="border-t px-4 py-2">{item.itemName}</td>
                      <td className="border-t px-4 py-2">{item.warehouse}</td>
                      <td className="border-t px-4 py-2 text-right">
                        {item.quantity}
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        {item.reorderLevel}
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        {item.reserved}
                      </td>
                      <td className="border-t px-4 py-2 text-right">
                        ${item.stockValue}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        {item.lastUpdated}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        {getStatusBadge(
                          item.quantity < item.reorderLevel ? "Low" : "OK"
                        )}
                      </td>
                      <td className="border-t px-4 py-2 text-center">
                        <button
                          className="text-blue-600 hover:text-blue-700 px-3 py-1"
                          onClick={() => handleEdit(item.itemCode)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 px-3 py-1"
                          onClick={() => handleDelete(item.itemCode)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Add Stock Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[400px] border border-gray-200 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowAdd(false)}
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">
              Add Stock Entry
            </h3>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">
                Item Code
              </label>
              <input
                type="text"
                value={newStock.itemCode}
                onChange={(e) => handleAddChange("itemCode", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">
                Item Name
              </label>
              <input
                type="text"
                value={newStock.itemName}
                onChange={(e) => handleAddChange("itemName", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">
                Warehouse
              </label>
              <select
                value={newStock.warehouse}
                onChange={(e) => handleAddChange("warehouse", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Warehouse</option>
                {warehouses.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">Quantity</label>
              <input
                type="number"
                min={0}
                value={newStock.quantity}
                onChange={(e) =>
                  handleAddChange("quantity", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">
                Reorder Level
              </label>
              <input
                type="number"
                min={0}
                value={newStock.reorderLevel}
                onChange={(e) =>
                  handleAddChange("reorderLevel", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">Reserved</label>
              <input
                type="number"
                min={0}
                value={newStock.reserved}
                onChange={(e) =>
                  handleAddChange("reserved", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1 font-medium">
                Unit Price
              </label>
              <input
                type="number"
                min={0}
                value={newStock.unitPrice}
                onChange={(e) =>
                  handleAddChange("unitPrice", Number(e.target.value))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2 mt-6 justify-end">
              <button
                className="text-green-600 hover:text-green-700  px-4 py-2 rounded-lg shadow font-semibold"
                onClick={handleAddSave}
              >
                Save
              </button>
              <button
                className="text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg shadow font-semibold"
                onClick={() => setShowAdd(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockBalanceScreen;
