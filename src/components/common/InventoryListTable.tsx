import React, { useState, useEffect, useRef } from "react";
import {
  FaPlus as Plus,
  FaEdit as Edit2,
  FaTrash as Trash2,
  FaFileImport as Import,
  FaFileExport as Export,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
  FaSortUp,
  FaSortDown,
  FaSort,
} from "react-icons/fa";

// Interfaces
export interface TableColumn {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: "ascending" | "descending" | null;
}

interface ReusableTableProps {
  data: any[];
  columns: TableColumn[];
  onEdit: (item: any) => void;
  onDelete: (id: string | number, title?: string) => void;
  onAdd: () => void;
  onImport: () => void;
  onExport: () => void;
  title: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  columnSettings: Record<string, boolean>;
  onToggleColumn: (columnId: string) => void;
  onToggleAllColumns: (visible: boolean) => void;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
  resolveValue?: (column: TableColumn, item: any) => any;
  showColumnManager: boolean;
  onToggleColumnManager: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const InventoryListTable: React.FC<ReusableTableProps> = ({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onImport,
  onExport,
  title,
  searchTerm,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  currentPage,
  onPageChange,
  columnSettings,
  onToggleColumn,
  onToggleAllColumns,
  sortConfig,
  onSort,
  resolveValue,
  showColumnManager,
  onToggleColumnManager,
  isLoading = false,
  emptyMessage = "No data available",
}) => {
  const columnManagerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close column manager
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnManagerRef.current &&
        !columnManagerRef.current.contains(event.target as Node)
      ) {
        onToggleColumnManager();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onToggleColumnManager]);

  // Filter items based on search term
  const filteredItems = searchTerm
    ? data.filter((item) => {
        return Object.values(item).some(
          (value) =>
            value !== null &&
            value !== undefined &&
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      })
    : data;

  // Apply sorting if configured
  const sortedItems = [...filteredItems];
  if (sortConfig.key && sortConfig.direction) {
    sortedItems.sort((a, b) => {
      // Handle serial number column specially
      if (sortConfig.key === "serialNumber") {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }

      // For other columns
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (bValue === null || bValue === undefined)
        return sortConfig.direction === "ascending" ? 1 : -1;

      // Compare based on type
      if (typeof aValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === "ascending"
          ? aValue > bValue
            ? 1
            : -1
          : aValue < bValue
          ? 1
          : -1;
      }
    });
  }

  // Calculate pagination values
  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  // Generate page numbers for pagination controls
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

  // Function to get sorting indicator icons
  const getSortIcon = (columnId: string) => {
    if (sortConfig.key !== columnId) {
      return (
        <span className="text-gray-300 ml-1">
          <FaSort />
        </span>
      );
    }

    return sortConfig.direction === "ascending" ? (
      <span className="text-white ml-1">
        <FaSortUp />
      </span>
    ) : (
      <span className="text-white ml-1">
        <FaSortDown />
      </span>
    );
  };

  // Default value resolver
  const defaultResolveValue = (column: TableColumn, item: any) => {
    const value = item[column.id];

    // Handle special cases
    if (column.id === "isActive") {
      return value ? (
        <span
          className="inline-block w-3 h-3 rounded-full bg-green-500"
          title="Active"
        ></span>
      ) : (
        <span
          className="inline-block w-3 h-3 rounded-full bg-red-400"
          title="Inactive"
        ></span>
      );
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value;
  };

  const valueResolver = resolveValue || defaultResolveValue;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <span className="text-gray-500">Loading data...</span>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] w-full max-w-3xl mx-auto bg-white rounded-lg border border-gray-100 shadow-sm">
        <svg
          className="w-14 h-14 mb-3 text-gray-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M7 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2M5 17v-2a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v2"
          />
        </svg>
        <span className="text-gray-400 text-lg font-semibold mb-4">
          {emptyMessage}
        </span>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex justify-between items-center p-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={onImport}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Import className="w-4 h-4" />
                  Import CSV
                </button>
                <button
                  onClick={onExport}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Export className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
              <button
                onClick={onAdd}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-auto">
          <div className="flex flex-col">
            {/* Search and Column Management */}
            <div className="mb-4 flex gap-2 items-center">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    onPageChange(1); // Reset to first page when searching
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => onSearchChange("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Column Manager Button */}
              <div className="relative" ref={columnManagerRef}>
                <button
                  onClick={onToggleColumnManager}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
                  title="Manage Columns"
                >
                  <FaCog size={16} /> Columns
                </button>

                {/* Column Manager Dropdown */}
                {showColumnManager && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-30">
                    <div className="p-3 border-b border-gray-200">
                      <div className="font-semibold text-gray-700 mb-2">
                        Manage Columns
                      </div>
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => onToggleAllColumns(true)}
                          className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <FaCheck size={10} /> Show All
                        </button>
                        <button
                          onClick={() => onToggleAllColumns(false)}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                        >
                          <FaTimes size={10} /> Hide All
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      <div className="space-y-1">
                        {columns.map((column) => (
                          <div
                            key={column.id}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex items-center justify-center w-5 h-5 border rounded cursor-pointer transition-colors ${
                                  columnSettings[column.id]
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-300 bg-white hover:bg-gray-100"
                                }`}
                                onClick={() => onToggleColumn(column.id)}
                              >
                                {columnSettings[column.id] && (
                                  <FaCheck
                                    size={12}
                                    className="text-blue-500"
                                  />
                                )}
                              </div>
                              <span
                                className="text-sm text-gray-700 cursor-pointer"
                                onClick={() => onToggleColumn(column.id)}
                              >
                                {column.name}
                              </span>
                            </div>
                            <div
                              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                              onClick={() => onToggleColumn(column.id)}
                            >
                              {columnSettings[column.id] ? (
                                <FaEye className="text-blue-500" size={16} />
                              ) : (
                                <FaEyeSlash
                                  className="text-gray-400"
                                  size={16}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="sticky top-0 bg-blue-600">
                  <tr className="text-xs">
                    <th
                      className="px-3 py-2 text-center text-white w-12 cursor-pointer"
                      onClick={() => onSort("serialNumber")}
                    >
                      S.No{" "}
                      {sortConfig.key === "serialNumber" &&
                        getSortIcon("serialNumber")}
                    </th>
                    {columns
                      .filter((column) => columnSettings[column.id])
                      .map((column) => (
                        <th
                          key={column.id}
                          className="px-3 py-2 text-white cursor-pointer"
                          onClick={() => onSort(column.id)}
                          style={{ width: column.width || "auto" }}
                        >
                          <div className="flex items-center justify-between">
                            <span>{column.name}</span>
                            {getSortIcon(column.id)}
                          </div>
                        </th>
                      ))}
                    <th className="px-3 py-2 text-center bg-blue-600 text-white sticky right-0 z-10">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-3 py-2 border text-center">
                        {startIndex + index + 1}
                      </td>
                      {columns
                        .filter((column) => columnSettings[column.id])
                        .map((column) => (
                          <td key={column.id} className="px-3 py-2 border">
                            {valueResolver(column, item)}
                          </td>
                        ))}
                      <td className="px-3 py-2 border sticky right-0 z-10 bg-white">
                        <div className="flex justify-center items-center gap-2 min-h-[32px]">
                          <button
                            onClick={() => onEdit(item)}
                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              onDelete(item.id, item.name || item.itemName)
                            }
                            className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)}{" "}
                  of {totalItems} entries
                </div>

                <div className="flex items-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>

                {/* Items per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newPageSize = Number(e.target.value);
                      onItemsPerPageChange(newPageSize);
                      onPageChange(1); // Reset to first page when changing items per page
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
      </div>
    </div>
  );
};

export default InventoryListTable;
