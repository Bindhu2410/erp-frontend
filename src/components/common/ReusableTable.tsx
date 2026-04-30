import React, { useState } from "react";

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: string;
  hidden?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  sorter?: boolean;
  sortOrder?: "asc" | "desc" | null;
}

export interface TableAction<T = any> {
  label: string | React.ReactNode;
  onClick: (record: T, index: number) => void;
  icon?: React.ReactNode;
  className?: string;
}

export interface TableEmptyState {
  icon?: React.ReactNode;
  message?: string;
  subMessage?: string;
}

export interface ReusableTableProps<
  T = any,
  K extends string | number = string | number
> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  rowKey?: keyof T;

  // Pagination
  pagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Actions
  actions?: TableAction<T>[];
  stickyActions?: boolean;

  // Selection
  showSelection?: boolean;
  selectedRowKeys?: K[];
  onSelectionChange?: (selectedKeys: K[]) => void;

  // Empty state
  emptyState?: TableEmptyState;

  // Table style
  className?: string;
  tableClassName?: string;

  // Status rendering
  getStatusBadgeClass?: (status: string) => string;

  // Sorting
  onSort?: (field: string, order: "asc" | "desc" | null) => void;
}

const defaultEmptyState: TableEmptyState = {
  icon: (
    <svg
      className="w-12 h-12 text-gray-300 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  message: "No data found",
  subMessage: "Try adjusting your search filters",
};

const defaultGetStatusBadgeClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "active":
    case "approved":
      return "bg-green-100 text-green-600";
    case "draft":
      return "bg-blue-100 text-blue-600";
    case "inactive":
      return "bg-red-100 text-red-600";
    case "completed":
      return "bg-green-100 text-green-700";
    case "partially fulfilled":
    case "in progress":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const ReusableTable = <
  T extends Record<string, any>,
  K extends string | number = string | number
>(
  props: ReusableTableProps<T, K>
) => {
  const {
    columns,
    data = [],
    loading = false,
    rowKey = "id",
    pagination = false,
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    onPageSizeChange,
    actions = [],
    stickyActions = false,
    showSelection = false,
    selectedRowKeys = [],
    onSelectionChange,
    emptyState = defaultEmptyState,
    className = "bg-white rounded-lg shadow-sm overflow-hidden",
    tableClassName = "min-w-full divide-y divide-gray-200",
    getStatusBadgeClass = defaultGetStatusBadgeClass,
    onSort,
  } = props;

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const visibleColumns = columns.filter((col) => !col.hidden);

  const handleSelectionChange = (recordId: K) => {
    if (!onSelectionChange) return;

    const isSelected = selectedRowKeys.includes(recordId);
    if (isSelected) {
      onSelectionChange(selectedRowKeys.filter((id) => id !== recordId));
    } else {
      onSelectionChange([...selectedRowKeys, recordId]);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRowKeys.length === data.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all
      onSelectionChange(data.map((record) => record[rowKey] as K));
    }
  };

  const handleSort = (fieldName: string) => {
    if (!onSort) return;

    let newOrder: "asc" | "desc" | null = "asc";

    if (sortField === fieldName) {
      if (sortOrder === "asc") newOrder = "desc";
      else if (sortOrder === "desc") newOrder = null;
    }

    setSortField(fieldName);
    setSortOrder(newOrder);
    onSort(fieldName, newOrder);
  };

  const renderPaginationButton = (
    page: number,
    label?: React.ReactNode,
    disabled = false
  ) => (
    <button
      onClick={() => onPageChange && onPageChange(page)}
      disabled={disabled}
      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
        currentPage === page
          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
          : disabled
          ? "bg-gray-100 text-gray-400"
          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
      }`}
    >
      {label || page}
    </button>
  );

  const getPaginationRange = () => {
    const delta = 2; // Pages to show before and after current page
    let range = [];

    // Always show first page
    range.push(1);

    // Calculate visible page range
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Add ellipses where needed
    let result: (number | string)[] = [];
    let last: number | string = 0;

    range.forEach((page) => {
      if ((last as number) + 1 < page) {
        result.push("...");
      }
      result.push(page);
      last = page;
    });

    return result;
  };

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className={tableClassName}>
          <thead className="bg-blue-500">
            <tr>
              {showSelection && (
                <th className="px-4 py-3 w-10 text-white">
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && selectedRowKeys.length === data.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                  style={column.width ? { width: column.width } : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sorter && (
                      <button
                        onClick={() => handleSort(column.dataIndex)}
                        className="ml-1 focus:outline-none text-white"
                      >
                        {sortField === column.dataIndex
                          ? sortOrder === "asc"
                            ? "▲"
                            : sortOrder === "desc"
                            ? "▼"
                            : "◆"
                          : "◆"}
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${stickyActions ? "sticky right-0 bg-blue-600 z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]" : ""}`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (showSelection ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="px-6 py-4 text-center"
                >
                  <div className="flex justify-center items-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((record, index) => (
                <tr key={String(record[rowKey])} className="hover:bg-gray-50">
                  {showSelection && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRowKeys.includes(record[rowKey] as K)}
                        onChange={() =>
                          handleSelectionChange(record[rowKey] as K)
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                    </td>
                  )}
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render ? (
                        column.render(record[column.dataIndex], record, index)
                      ) : column.dataIndex === "status" ? (
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getStatusBadgeClass(
                            record[column.dataIndex]
                          )}`}
                        >
                          {record[column.dataIndex]}
                        </span>
                      ) : (
                        record[column.dataIndex]
                      )}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className={`px-6 py-4 whitespace-nowrap text-sm flex font-medium space-x-2 ${stickyActions ? "sticky right-0 bg-inherit z-10 shadow-[-2px_0_5px_rgba(0,0,0,0.1)]" : ""}`}>
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={() => action.onClick(record, index)}
                          className={
                            action.className ||
                            "text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-md px-3 py-1 transition hover:bg-gray-50"
                          }
                        >
                          {action.icon && (
                            <span className="mr-1">{action.icon}</span>
                          )}
                          {action.label}
                        </button>
                      ))}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    visibleColumns.length +
                    (showSelection ? 1 : 0) +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="px-6 py-10 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    {emptyState.icon}
                    <p className="text-lg font-medium">{emptyState.message}</p>
                    <p className="text-sm">{emptyState.subMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 0 && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                of <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {/* Previous button */}
                <button
                  onClick={() => onPageChange && onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {getPaginationRange().map((item, index) =>
                  typeof item === "number" ? (
                    <button
                      key={index}
                      onClick={() => onPageChange && onPageChange(item)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === item
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {item}
                    </button>
                  ) : (
                    <span
                      key={index}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700"
                    >
                      {item}
                    </span>
                  )
                )}

                {/* Next button */}
                <button
                  onClick={() => onPageChange && onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReusableTable;
