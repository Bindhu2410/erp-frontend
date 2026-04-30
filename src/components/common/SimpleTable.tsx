import React, { useState } from "react";

interface TableColumn<T> {
  Header: string;
  accessor: keyof T;
  type?: "text" | "dropdown" | "display" | "number" | "date";
  options?:
    | { value: string; label: string }[]
    | ((row: T) => { value: string; label: string }[]);
  autoFillMap?: Record<string, Partial<T>>;
  minWidth?: number | string;
}

interface SimpleTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  onCellChange: (rowIndex: number, accessor: keyof T, value: any) => void;
  onDropdownChange: (rowIndex: number, accessor: keyof T, value: any) => void;
}

const SimpleTable = <T,>({
  columns,
  data,
  onDataChange,
  onCellChange,
  onDropdownChange,
}: SimpleTableProps<T>) => {
  // Common wide column identifiers that typically need more space
  const WIDE_COLUMN_KEYWORDS = [
    "remarks",
    "description",
    "itemdescription",
    "itemname",
    "note",
    "comment",
    "details",
    "explanation",
    "summary",
    "content",
  ];

  const getColumnMinWidth = (column: TableColumn<T>): string => {
    // Use explicitly defined minWidth first
    if (column.minWidth) {
      return typeof column.minWidth === "number"
        ? `${column.minWidth}px`
        : column.minWidth;
    }

    // Auto-detect wide columns based on common keywords
    const columnKey = String(column.accessor).toLowerCase();
    const isWideColumn = WIDE_COLUMN_KEYWORDS.some((keyword) =>
      columnKey.includes(keyword.toLowerCase())
    );

    if (isWideColumn) {
      return "200px"; // Default minimum for wide columns
    }

    // Default minimum width for other columns
    return "120px";
  };

  const handleInputChange = (
    rowIndex: number,
    accessor: keyof T,
    value: any
  ) => {
    onCellChange(rowIndex, accessor, value);
  };

  const handleDropdownChange = (
    rowIndex: number,
    accessor: keyof T,
    value: any
  ) => {
    onDropdownChange(rowIndex, accessor, value);
  };

  const renderCell = (row: T, rowIndex: number, column: TableColumn<T>) => {
    const value = row[column.accessor];

    // Row-level disabled flag (if a row has `disabled: true` we mute and disable inputs)
    const rowDisabled = Boolean((row as any).disabled);

    // Handle dynamic options function
    const options =
      typeof column.options === "function"
        ? column.options(row)
        : column.options;

    switch (column.type) {
      case "dropdown":
        return (
          <select
            value={String(value ?? "")}
            onChange={(e) =>
              handleDropdownChange(rowIndex, column.accessor, e.target.value)
            }
            disabled={rowDisabled}
            className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0 ${rowDisabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
          >
            <option value="">Select...</option>
            {options?.map((option: any) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "text":
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) =>
              handleInputChange(rowIndex, column.accessor, e.target.value)
            }
            disabled={rowDisabled}
            className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0 ${rowDisabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) =>
              handleInputChange(
                rowIndex,
                column.accessor,
                Number(e.target.value)
              )
            }
            disabled={rowDisabled}
            className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0 ${rowDisabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
          />
        );
      case "date":
        // Use today's date if no value is set
        const today = new Date().toISOString().split("T")[0];
        const dateValue = value
          ? new Date(value as any).toISOString().split("T")[0]
          : today;

        // If the value is empty, auto-fill with today's date (but skip for disabled rows)
        if (!value && !rowDisabled) {
          handleInputChange(rowIndex, column.accessor, today);
        }

        return (
          <input
            type="date"
            value={dateValue}
            onChange={(e) =>
              handleInputChange(rowIndex, column.accessor, e.target.value)
            }
            disabled={rowDisabled}
            className={`w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors min-w-0 ${rowDisabled ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
          />
        );
      default:
        return (
          <span
            className="text-gray-700 block truncate"
            title={value as string}
          >
            {value as React.ReactNode}
          </span>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
              {" "}
              S.No
            </th>
            {columns.map((column) => (
              <th
                key={column.accessor as string}
                className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200"
                style={{
                  minWidth: getColumnMinWidth(column),
                  width: column.minWidth ? "auto" : undefined,
                }}
              >
                <span className="truncate block">{column.Header}</span>
              </th>
            ))}
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 w-24">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50 transition-colors even:bg-gray-50/50"
            >
              <td className="py-3 px-4 text-sm">{rowIndex + 1}</td>
              {columns.map((column) => (
                <td
                  key={column.accessor as string}
                  className="py-3 px-4 text-sm"
                  style={{
                    minWidth: getColumnMinWidth(column),
                    width: column.minWidth ? "auto" : undefined,
                  }}
                >
                  {renderCell(row, rowIndex, column)}
                </td>
              ))}
              {
                // actions cell
              }
              <td className="py-3 px-4 w-24">
                {(() => {
                  const rowDisabled = Boolean((row as any).disabled);
                  return (
                    <button
                      onClick={() => {
                        if (rowDisabled) return;
                        const updatedData = data.filter(
                          (_, index) => index !== rowIndex
                        );
                        onDataChange?.(updatedData);
                      }}
                      disabled={rowDisabled}
                      className={`p-2 text-red-600 rounded-lg transition-colors ${rowDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-50"}`}
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
