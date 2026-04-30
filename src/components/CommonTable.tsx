import React, { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Modal from "./common/Modal";
import { FiFilter } from "react-icons/fi";
import { stringOrDate } from "react-big-calendar";

interface Column {
  key: string;
  title: string;
  dataIndex: string;
  hidden?: boolean;
  isAction?: boolean;
  render?: ((record: any) => React.ReactNode) | undefined;
}

interface Action {
  label: string | JSX.Element;
  onClick: (record: any, index: number) => void;
  type: string;
}

interface CommonTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  total: number;
  currentPage: number;
  onPageChange: (page: number, pageSize: number) => void;
  onColumnsChange?: (columns: Column[]) => void;
  pagination?: boolean;
  actions?: Action[];
  sort?: { field: string; order: "asc" | "desc" | "" };
  setSort?: (sort: { field: string; order: "asc" | "desc" | "" }) => void;
  showCheckboxes?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedRows: Set<string | number>) => void;
  rowKey?: string; // Field to use as unique identifier (default: 'id')
  onToggleFilter?: () => void;
  showFilter?: boolean;
  page?: string;
  onStatusChange?: (
    leadId: string,
    newStatus: string,
    reason: string,
  ) => Promise<void>;
  filterContent?: React.ReactNode;
  pageSizeProp?: number;
  onPageSizeChange?: (size: number) => void;
}

const CommonTable: React.FC<CommonTableProps> = ({
  columns,
  data = [],
  loading = false,
  total,
  currentPage,
  onPageChange,
  onColumnsChange,
  pagination = false,
  actions,
  sort,
  setSort,
  showCheckboxes = false,
  selectedRows = new Set(),
  onSelectionChange,
  onToggleFilter,
  showFilter,
  rowKey = "id",
  page,
  filterContent,
  pageSizeProp,
  onPageSizeChange,
}) => {
  const navigate = useNavigate();
  console.log("CommonTable rendered with data:", data);
  const [visibleColumns, setVisibleColumns] = useState(columns);

  // Always update visibleColumns when columns prop changes
  React.useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [pageSize, setPageSize] = useState(pageSizeProp || 10);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const totalPages = Math.ceil(total / pageSize);

  const handleColumnVisibilityChange = (columnKey: string) => {
    const updatedColumns = visibleColumns.map((col) =>
      col.key === columnKey ? { ...col, hidden: !col.hidden } : col,
    );
    setVisibleColumns(updatedColumns);
    onColumnsChange?.(updatedColumns.filter((col) => !col.hidden));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1, pageSize);
    }
  };
  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const handleSort = (field: string) => {
    if (!setSort) return;
    if (sort?.field === field) {
      const newOrder =
        sort.order === "asc" ? "desc" : sort.order === "desc" ? "" : "asc";
      setSort({ field, order: newOrder });
    } else {
      setSort({ field, order: "asc" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1, pageSize);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newPageSize = parseInt(event.target.value);
    setPageSize(newPageSize);
    onPageSizeChange?.(newPageSize);
    onPageChange(1, newPageSize);
  };

  // Checkbox handling functions
  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    // Only select/deselect visible (filtered) data rows
    const visibleRowIds = data.map((row) => row[rowKey]);
    const isAllSelected = visibleRowIds.every((id) => selectedRows.has(id));
    const newSelection = new Set(selectedRows);
    if (isAllSelected) {
      // Deselect all visible rows
      visibleRowIds.forEach((id) => newSelection.delete(id));
    } else {
      // Select all visible rows
      visibleRowIds.forEach((id) => newSelection.add(id));
    }
    onSelectionChange(newSelection);
  };

  const handleSelectRow = (rowId: string | number) => {
    if (!onSelectionChange) return;
    // Only toggle the selected state for this row
    const newSelection = new Set(selectedRows);
    if (newSelection.has(rowId)) {
      newSelection.delete(rowId);
    } else {
      newSelection.add(rowId);
    }
    onSelectionChange(newSelection);
  };

  // Filtered data for display: if showOnlySelected, only show selected rows
  const displayedData = showOnlySelected
    ? data.filter((row) => selectedRows.has(row[rowKey]))
    : data;

  const isAllCurrentPageSelected = () => {
    return (
      data.length > 0 && data.every((row) => selectedRows.has(row[rowKey]))
    );
  };

  const isSomeCurrentPageSelected = () => {
    return data.some((row) => selectedRows.has(row[rowKey]));
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      // Sales Order Statuses
      case "completed":
      case "approved":
      case "accepted":
      case "scheduled":
      case "final quotation":
        return "bg-green-500 text-white";
      case "confirmed":
        return "bg-blue-500 text-white";
      case "in progress":
      case "identified":
        return "bg-blue-500 text-white";
      case "demo requested":
        return "bg-yellow-500 text-black";
      case "partially fulfilled":
        return "bg-yellow-500 text-white";
      case "pending approval":
      case "pending":
      case "received":
        return "bg-yellow-500 text-black";
      case "goods received":
        return "bg-cyan-500 text-white";
      case "created":
        return "bg-indigo-500 text-white";
      case "draft":
        return "bg-gray-400 text-white";
      case "closed":
        return "bg-gray-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      // Lead Statuses
      case "converted":
        return "bg-green-500 text-white";
      case "qualified":
        return "bg-blue-500 text-white";
      case "new":
      case "open":
        return "bg-cyan-500 text-white";
      case "contacted":
        return "bg-purple-500 text-white";
      case "lost":
      case "cancelled": // Lead status
        return "bg-red-500 text-white";
      case "unqualified":
        return "bg-orange-500 text-white";
      // Opportunity Statuses
      case "won":
        return "bg-green-500 text-white";
      case "proposal":
        return "bg-blue-500 text-white";
      case "negotiation":
        return "bg-yellow-500 text-white";
      // Invoice Statuses
      case "paid":
        return "bg-green-500 text-white";
      case "unpaid":
      case "overdue":
        return "bg-red-500 text-white";
      case "partial":
        return "bg-yellow-500 text-white";
      // Delivery Statuses
      case "delivered":
        return "bg-green-500 text-white";
      case "shipped":
        return "bg-blue-500 text-white";
      case "processing":
        return "bg-yellow-500 text-white";
      // Default
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const handleCellClick = (column: Column, value: any) => {
    if (column.dataIndex === "leadId" && value) {
      navigate(`/sales/lead?id=${value}`);
    } else if (column.dataIndex === "opportunityId" && value) {
      navigate(`/sales/opportunity?id=${value}`);
    } else if (column.dataIndex === "quotationId" && value) {
      navigate(`/sales/quotation?id=${value}`);
    } else if (
      column.dataIndex === "customerName" &&
      page === "Demo" &&
      value
    ) {
      navigate(`/sales/demo?id=${value}`);
    } else if (column.dataIndex === "orderId" && value) {
      navigate(`/sales-orders?id=${value}`);
    } else if (column.dataIndex === "customerPONumber" && value) {
      navigate(`/po-view?id=${value}`);
    } else if (column.dataIndex === "invoiceId" && value) {
      navigate(`/invoice?id=${value}`);
    } else if (column.dataIndex === "deliveryId" && value) {
      navigate(`/delivery?id=${value}`);
    } else if (column.title === "Payment ID" && value) {
      navigate(`/payment?id=${value}`);
    }
  };

  // Render value based on column type
  const renderValue = (column: Column, row: any) => {
    if (column.render) {
      return column.render(row);
    }

    const value = row[column.dataIndex];

    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "string"
    ) {
      return <span>N/A</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return <span>N/A</span>;
      return (
        <ul className="list-disc pl-5">
          {value.map((item: any, itemIndex: number) => (
            <li key={itemIndex}>
              {typeof item === "object" ? JSON.stringify(item) : item}
            </li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      // Avoid rendering objects directly as React children
      return <span>{JSON.stringify(value)}</span>;
    }

    if (column.dataIndex === "status") {
      return (
        <span
          className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${getStatusColor(
            value,
          )}`}
        >
          {value}
        </span>
      );
    }
    return <span>{value}</span>;
  };

  const renderHeader = (column: Column) => {
    return (
      <div
        className="flex items-center cursor-pointer"
        onClick={() => handleSort(column.dataIndex)}
      >
        {column.title}
        {sort?.field === column.dataIndex && (
          <span className="ml-1">
            {sort.order === "asc" ? "▲" : sort.order === "desc" ? "▼" : ""}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="w-full p-2 sm:p-4 bg-white">
      {filterContent && showFilter && (
        <div className="mb-4">{filterContent}</div>
      )}
      {data.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="font-medium text-xs sm:text-sm flex items-center gap-2 sm:gap-4">
            <span className="text-gray-600">Total: </span>
            {total}
            {showCheckboxes && selectedRows.size > 0 && (
              <span className="text-blue-600 font-medium">
                ({selectedRows.size} selected)
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            {pagination && (
              <>
                <button
                  onClick={onToggleFilter}
                  className={`p-1.5 sm:p-2 transition ${
                    showFilter
                      ? "bg-[#FF6B35] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  title="Filter"
                >
                  <FiFilter size={16} />
                </button>
                <span className="hidden sm:inline font-medium text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-md p-1 text-xs sm:text-sm bg-white"
                  aria-label="Select number of items per page"
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>{`${size}/page`}</option>
                  ))}
                </select>
              </>
            )}
            <button
              className="p-1.5 sm:p-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-100"
              onClick={() => setShowColumnManager(true)}
              title="Manage Columns"
            >
              ⚙️
            </button>
          </div>
        </div>
      )}
      <Modal
        isOpen={showColumnManager}
        onClose={() => setShowColumnManager(false)}
        type="min"
      >
        <div className="p-4">
          <h4 className="text-lg font-semibold mb-4">Manage Columns</h4>
          <div className="space-y-3">
            {visibleColumns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!column.hidden}
                  onChange={() => handleColumnVisibilityChange(column.key)}
                  className="h-4 w-4"
                />
                <span>{column.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowColumnManager(false)}
              className="bg-blue-600 text-white rounded-md py-2 px-4 hover:bg-blue-700 transition duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <div className="relative overflow-x-auto">
        {selectedRows.size > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <button
              className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
              onClick={() => setShowOnlySelected((prev) => !prev)}
            >
              {showOnlySelected ? "Show All Rows" : "Show Only Selected"}
            </button>
            <span className="text-xs text-gray-500">
              ({selectedRows.size} selected)
            </span>
          </div>
        )}
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            Loading...
          </div>
        ) : !Array.isArray(data) ? (
          <div className="h-72 bg-gray-50 text-center flex items-center justify-center">
            <p className="text-lg text-gray-600">Invalid data format</p>
          </div>
        ) : data.length === 0 ? (
          <div className="h-72 bg-gray-50 text-center flex items-center justify-center">
            <div className="text-center py-8 flex flex-col items-center justify-center">
              <svg
                className="w-16 h-16 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-lg text-gray-600">No data available</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile card layout */}
            <div className="sm:hidden space-y-3">
              {displayedData.map((row, index) => (
                <div
                  key={row[rowKey] || index}
                  className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400 font-medium">
                      #{(currentPage - 1) * pageSize + index + 1}
                    </span>
                    {actions && actions.length > 0 && (
                      <div className="flex gap-1">
                        {actions.map((action, ai) => (
                          <button
                            key={ai}
                            onClick={() => action.onClick(row, index)}
                            className={`px-2 py-1 rounded transition-all text-xs font-medium ${
                              action.type.toLowerCase() === "edit"
                                ? "text-blue-600 hover:bg-blue-50"
                                : action.type.toLowerCase() === "delete"
                                  ? "text-red-600 hover:bg-red-50"
                                  : action.type.toLowerCase() === "demo"
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {visibleColumns
                    .filter((col) => !col.hidden)
                    .map((column) => (
                      <div
                        key={column.key}
                        className="flex justify-between items-start py-1 border-b border-gray-50 last:border-0"
                      >
                        <span className="text-xs text-gray-500 font-medium w-2/5 shrink-0">
                          {column.title}
                        </span>
                        <span
                          className={`text-xs text-right w-3/5 ${
                            column.dataIndex === "leadId" ||
                            column.dataIndex === "opportunityId" ||
                            column.dataIndex === "quotationId"
                              ? "text-blue-500 cursor-pointer"
                              : "text-gray-800"
                          }`}
                          onClick={() =>
                            handleCellClick(
                              column,
                              column.dataIndex === "quotationId"
                                ? row.quotationInternalId || row.id
                                : column.dataIndex === "orderId"
                                  ? row.salesOrderDbId || row.id
                                  : column.dataIndex === "invoiceId"
                                    ? row.invoiceId
                                    : row.id,
                            )
                          }
                        >
                          {renderValue(column, row)}
                        </span>
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Desktop table layout */}
            <table className="hidden sm:table w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr>
                  {showCheckboxes && (
                    <th className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300 w-12">
                      <input
                        type="checkbox"
                        checked={
                          displayedData.length > 0 &&
                          displayedData.every((row) =>
                            selectedRows.has(row[rowKey]),
                          )
                        }
                        ref={(input) => {
                          if (input)
                            input.indeterminate =
                              displayedData.some((row) =>
                                selectedRows.has(row[rowKey]),
                              ) &&
                              !displayedData.every((row) =>
                                selectedRows.has(row[rowKey]),
                              );
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300">
                    S.No
                  </th>
                  {visibleColumns
                    .filter((col) => !col.hidden)
                    .map((column) => (
                      <th
                        key={column.key}
                        className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300"
                      >
                        {renderHeader(column)}
                      </th>
                    ))}
                  {actions && actions.length > 0 && (
                    <th className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedData.map((row, index) => (
                  <tr key={row[rowKey] || index} className="hover:bg-gray-100">
                    {showCheckboxes && (
                      <td className="p-3 border-b border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row[rowKey])}
                          onChange={() => handleSelectRow(row[rowKey])}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td
                      className="p-3 border-b border-gray-300 cursor-pointer"
                      onClick={() => {
                        if (!showOnlySelected) {
                          if (selectedRows.has(row[rowKey])) {
                            setShowOnlySelected(true);
                          } else {
                            handleSelectRow(row[rowKey]);
                            setShowOnlySelected(true);
                          }
                        } else {
                          setShowOnlySelected(false);
                        }
                      }}
                    >
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>
                    {visibleColumns
                      .filter((col) => !col.hidden)
                      .map((column) => (
                        <td
                          key={column.key}
                          className={`p-3 border-b border-gray-300 ${
                            column.dataIndex === "leadId" ||
                            column.dataIndex === "invoiceId" ||
                            column.dataIndex === "id" ||
                            column.dataIndex === "opportunityId" ||
                            column.dataIndex === "quotationId" ||
                            column.dataIndex === "orderId" ||
                            (column.dataIndex === "customerName" &&
                              page === "Demo") ||
                            column.dataIndex === "deliveryId" ||
                            column.dataIndex === "customerPONumber"
                              ? "text-blue-500 cursor-pointer hover:underline"
                              : ""
                          }`}
                          onClick={() =>
                            handleCellClick(
                              column,
                              column.dataIndex === "quotationId"
                                ? row.quotationInternalId || row.id
                                : column.dataIndex === "orderId"
                                  ? row.salesOrderDbId || row.id
                                  : column.dataIndex === "invoiceId"
                                    ? row.invoiceId
                                    : row.id,
                            )
                          }
                        >
                          {renderValue(column, row)}
                        </td>
                      ))}
                    {actions && actions.length > 0 && (
                      <td className="p-3 border-b border-gray-300">
                        <div className="flex gap-2 justify-end">
                          {actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row, index)}
                              className={`px-3 py-1 rounded transition-all text-xs font-medium ${
                                action.type.toLowerCase() === "edit"
                                  ? "text-blue-600 hover:bg-blue-50"
                                  : action.type.toLowerCase() === "delete"
                                    ? "text-red-600 hover:bg-red-50"
                                    : action.type.toLowerCase() === "demo"
                                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                                      : "text-gray-600 hover:bg-gray-50"
                              }`}
                              title={action.type}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
      {data.length > 0 && pagination && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-100 disabled:opacity-50"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <span className="font-medium text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-100 disabled:opacity-50"
          >
            <FaChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommonTable;
