import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RowAction {
  label: string;
  icon: string; // 'edit' | 'delete' | 'view' or custom icon
  color?: string;
  path?: string; // route path to navigate to with ?id=<idKey value>
  onClick: (row: any, rowIndex: number) => void;
}

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface GenericInventoryTableProps {
  title: string;
  columns: Column[];
  data: any[];
  onImport?: () => void;
  onExport?: () => void;
  onAddNew?: () => void;
  showImport?: boolean;
  showExport?: boolean;
  showAddNew?: boolean;
  itemsPerPage?: number;
  // Action props
  actions?: RowAction[];
  showActions?: boolean;
  idKey?: string; // key in row data to use as query param id
}

const GenericInventoryTable: React.FC<GenericInventoryTableProps> = ({
  title,
  columns,
  data,
  onImport,
  onExport,
  onAddNew,
  showImport = true,
  showExport = true,
  showAddNew = true,
  itemsPerPage = 10,
  actions = [],
  showActions = true,
  idKey = "id",
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data by search term
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some(
        (val) =>
          val !== null &&
          val !== undefined &&
          String(val).toLowerCase().includes(lower),
      ),
    );
  }, [data, searchTerm]);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig((current) => {
      if (current?.key === key) {
        return current.direction === "asc" ? { key, direction: "desc" } : null;
      }
      return { key, direction: "asc" };
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getActionIcon = (iconType: string) => {
    switch (iconType) {
      case "edit":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        );
      case "delete":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        );
      case "view":
        return (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderRowActions = (row: any, rowIndex: number) => {
    if (!showActions || actions.length === 0) return null;

    return (
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        <div className="flex gap-1 sm:gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (action.path) {
                  navigate(`${action.path}?id=${row[idKey]}`);
                }
                action.onClick(row, rowIndex);
              }}
              className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 transition ${
                action.color || "text-gray-600 hover:text-gray-900"
              }`}
              title={action.label}
            >
              {getActionIcon(action.icon)}
            </button>
          ))}
        </div>
      </td>
    );
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 py-1 rounded text-sm font-medium ${
            currentPage === i
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      );
    }

    return buttons;
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-44 pl-8 pr-7 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:w-56 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {showImport && (
            <button
              onClick={onImport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </button>
          )}
          {showExport && (
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="hidden sm:inline">Download Template</span>
              <span className="sm:hidden">Download</span>
            </button>
          )}
          {showAddNew && (
            <button
              onClick={onAddNew}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        {sortedData.length === 0 ? (
          <div className="min-h-96 flex flex-col items-center justify-center text-gray-500">
            <div className="w-16 h-16 mb-4 opacity-20">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>
            <p className="text-lg font-medium">
              {searchTerm ? "No matching records found" : "No data available"}
            </p>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-blue-600">
                  <tr>
                    {columns.map((column) => (
                      <th
                        key={column.key}
                        className={`px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${
                          column.sortable
                            ? "cursor-pointer hover:bg-blue-700"
                            : ""
                        }`}
                        onClick={() =>
                          column.sortable && handleSort(column.key)
                        }
                      >
                        <div className="flex items-center gap-1">
                          {column.label}
                          {column.sortable && (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          )}
                        </div>
                      </th>
                    ))}
                    {showActions && actions.length > 0 && (
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {columns.map((column) => {
                        const cellValue = row[column.key] || "-";
                        const isLongText = cellValue.length > 50;

                        return (
                          <td
                            key={column.key}
                            className="px-4 sm:px-6 py-4 text-sm text-gray-900"
                          >
                            {isLongText ? (
                              <div className="truncate max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                                {cellValue}
                              </div>
                            ) : (
                              <div className="whitespace-nowrap">
                                {cellValue}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {renderRowActions(row, index)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-600">
                      Page{" "}
                      <span className="font-semibold text-gray-900">
                        {currentPage}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900">
                        {totalPages}
                      </span>{" "}
                      |
                      <span className="ml-2">
                        Items{" "}
                        <span className="font-semibold text-gray-900">
                          {startIndex + 1}
                        </span>
                        -
                        <span className="font-semibold text-gray-900">
                          {Math.min(endIndex, sortedData.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-900">
                          {sortedData.length}
                        </span>
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="px-2 py-2 rounded-l-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {renderPaginationButtons()}
                    <button
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-2 py-2 rounded-r-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenericInventoryTable;
export type { RowAction, Column, GenericInventoryTableProps };
