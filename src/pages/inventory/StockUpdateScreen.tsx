import React, { useState, useEffect } from "react";

const stockUpdateFilters = [
  {
    key: "warehouse",
    label: "Warehouse",
    type: "dropdown",
    options: [],
  },
  {
    key: "location",
    label: "Location",
    type: "dropdown",
    options: [],
  },
  {
    key: "itemCategory",
    label: "Item Category",
    type: "dropdown",
    options: [],
  },
  {
    key: "asOnDate",
    label: "As on Date",
    type: "date",
  },
];

const stockUpdateRow = [
  { key: "itemCode", label: "Item Code" },
  { key: "itemName", label: "Item Name" },
  { key: "currentStockQty", label: "Current Stock" },
  { key: "adjustmentQty", label: "Adjustment Qty" },
];

const reasonColumn = { key: "reason", label: "Reason" };

type StockItem = {
  itemCode: string;
  itemName: string;
  currentStockQty: number;
  adjustmentQty?: number;
  reason?: string;
  [key: string]: string | number | undefined;
};

type Adjustment = {
  adjustmentQty?: number;
  reason?: string;
};

const StockUpdateScreen = () => {
  // Load initial items from JSON (simulate API or local file)
  const initialItems: StockItem[] = [
    {
      itemCode: "ITEM001",
      itemName: "Diathermy",
      currentStockQty: 120,
      adjustmentQty: 0,
      reason: "",
    },
    {
      itemCode: "ITEM002",
      itemName: "Combi Maxx",
      currentStockQty: 80,
      adjustmentQty: 0,
      reason: "",
    },
    {
      itemCode: "ITEM003",
      itemName: "Lap Set",
      currentStockQty: 200,
      adjustmentQty: 0,
      reason: "",
    },
  ];

  const [items, setItems] = useState<StockItem[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter items based on search term
  const filteredItems = searchTerm
    ? items.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : items;

  // Pagination logic
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const [filters, setFilters] = useState({
    warehouse: "",
    location: "",
    itemCategory: "",
    asOnDate: new Date().toISOString().slice(0, 10),
  });
  const [adjustments, setAdjustments] = useState<Record<string, Adjustment>>(
    {}
  );

  useEffect(() => {
    // Fetch warehouse, location, category options here and update stockUpdateFilters
    // Fetch items based on filters and setItems
    // Example:
    // fetchItems();
  }, [filters]);

  type Filters = {
    warehouse: string;
    location: string;
    itemCategory: string;
    asOnDate: string;
  };

  const handleFilterChange = (data: Filters) => {
    setFilters(data);
  };

  const handleRowChange = (itemCode: string, data: Adjustment) => {
    setAdjustments((prev) => ({ ...prev, [itemCode]: data }));
  };

  // API call for single item adjustment
  const handleSingleAdjustment = async (itemCode: string) => {
    const adj = adjustments[itemCode];
    if (!adj || (!adj.adjustmentQty && !adj.reason)) {
      alert("Please enter adjustment quantity or remarks.");
      return;
    }
    // Example API call (replace with your actual endpoint)
    try {
      // Replace with your API logic
      // await api.post('/stock/update', { itemCode, ...adj });
      console.log("Updating stock for", itemCode, adj);
      alert(`Stock updated for ${itemCode}`);
    } catch (err) {
      alert("Failed to update stock.");
    }
  };

  const handleSubmit = () => {
    // Prepare payload with only adjusted items
    const payload = Object.entries(adjustments)
      .filter(([_, v]) => v.adjustmentQty)
      .map(([itemCode, v]) => ({ itemCode, ...v }));
    // Call API to submit adjustments
    console.log("Submitting adjustments:", payload);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Stock Update</h2>
      {/* Global Search */}
      <div className="flex items-center justify-start mb-4">
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search anything..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {/* Filter Section */}
      <div className="flex gap-4 mb-6">
        <div className="w-full bg-white rounded-xl shadow-md p-5 flex flex-wrap gap-6 items-end mb-6 border border-gray-100">
          <div className="flex flex-col w-56">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-1">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Warehouse
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.warehouse}
              onChange={(e) =>
                setFilters({ ...filters, warehouse: e.target.value })
              }
            >
              <option value="">All Warehouses</option>
              {/* TODO: Map warehouse options here */}
            </select>
          </div>
          <div className="flex flex-col w-56">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-1">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  d="M12 2v20M2 12h20"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Location
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            >
              <option value="">All Locations</option>
              {/* TODO: Map location options here */}
            </select>
          </div>
          <div className="flex flex-col w-56">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-1">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4l2 2"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Item Category
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.itemCategory}
              onChange={(e) =>
                setFilters({ ...filters, itemCategory: e.target.value })
              }
            >
              <option value="">All Categories</option>
              {/* TODO: Map category options here */}
            </select>
          </div>
          <div className="flex flex-col w-56">
            <label className="block text-sm font-semibold mb-2 text-blue-700 flex items-center gap-1">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="4"
                  stroke="#2563eb"
                  strokeWidth="2"
                />
                <path
                  d="M8 12h8"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              As on Date
            </label>
            <input
              type="date"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={filters.asOnDate}
              onChange={(e) =>
                setFilters({ ...filters, asOnDate: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="mt-6">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="sticky top-0 bg-blue-600">
            <tr className="text-xs">
              <th className="px-3 py-2 text-center text-white w-12">S.No</th>
              {stockUpdateRow.map((col) => (
                <th key={col.key} className="px-3 py-2 text-white">
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-2 text-white">Final Stock</th>
              <th key={reasonColumn.key} className="px-3 py-2 text-white">
                {reasonColumn.label}
              </th>
              <th className="px-3 py-2 text-center text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => {
              const adjustmentQty =
                adjustments[item.itemCode]?.adjustmentQty ?? 0;
              const finalStock = item.currentStockQty + Number(adjustmentQty);
              return (
                <tr key={item.itemCode} className="hover:bg-gray-50 text-sm">
                  <td className="px-3 py-2 border text-center">
                    {startIndex + idx + 1}
                  </td>
                  {stockUpdateRow.map((col) => (
                    <td key={col.key} className="border px-3 py-2">
                      {col.key === "adjustmentQty" ? (
                        <input
                          type="number"
                          className="border rounded px-2 py-1 w-24"
                          value={
                            adjustments[item.itemCode]?.adjustmentQty ?? ""
                          }
                          onChange={(e) =>
                            handleRowChange(item.itemCode, {
                              ...adjustments[item.itemCode],
                              adjustmentQty: Number(e.target.value),
                            })
                          }
                        />
                      ) : (
                        item[col.key]
                      )}
                    </td>
                  ))}
                  <td className="border px-3 py-2 text-center font-semibold">
                    {finalStock}
                  </td>
                  <td key={reasonColumn.key} className="border px-3 py-2">
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={adjustments[item.itemCode]?.reason ?? ""}
                      onChange={(e) =>
                        handleRowChange(item.itemCode, {
                          ...adjustments[item.itemCode],
                          reason: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td className="border px-3 py-2 text-center">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => handleSingleAdjustment(item.itemCode)}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
              {totalItems} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {getPageNumbers().map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === page
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 text-sm border border-gray-300 rounded-md"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockUpdateScreen;
