import React from "react";
import { Link } from "react-router-dom";

const routeMap: Record<string, string> = {
  dealId: "/sales/deal/view/",
  oppid: "/sales/opportunity/view/",
  opportunityId: "/sales/opportunity?id=",
  quotationId: "/sales/quotation?id=",
  customerName: "/sales/demo?id=",
  version: "/sales/quotation?id=",
};

const DataTable: React.FC<{
  columns: Array<string | { label: string; key: string }>;
  data: string[];
  noDataMessage?: string;
}> = ({ columns, data = [], noDataMessage = "No record found" }) => (
  <div className="w-full">
    {/* Mobile Card Layout */}
    <div className="md:hidden space-y-4">
      {data.length > 0 ? (
        data.map((row: any, rowIndex: number) => (
          <div key={rowIndex} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
            {columns.map((col: any, colIndex: number) => {
              const label = typeof col === "object" && "label" in col ? col.label : col;
              const columnKey = typeof col === "object" && "key" in col ? col.key : col;
              const value = row[columnKey];
              const path = routeMap[columnKey];
              let displayValue = value;
              if (displayValue === null || displayValue === undefined || displayValue === "") {
                displayValue = "N/A";
              }

              const getStatusColor = (status: string) => {
                const statusColors: Record<string, string> = {
                  Active: "bg-green-100 text-green-800",
                  "Final Quotation": "bg-green-100 text-green-800 ",
                  Inactive: "bg-red-100 text-red-800",
                  Pending: "bg-yellow-100 text-yellow-800",
                  Completed: "bg-blue-100 text-blue-800",
                  Approved: "bg-green-100 text-green-800",
                  Identified: "bg-yellow-100 text-yellow-800",
                  "Solution Presentation": "bg-blue-100 text-blue-800",
                  Rejected: "bg-red-100 text-red-800",
                  Draft: "bg-gray-100 text-gray-800",
                  "In Progress": "bg-blue-100 text-blue-800",
                  Cancelled: "bg-red-100 text-red-800",
                  "On Hold": "bg-yellow-100 text-yellow-800",
                  "Demo Requested": "bg-yellow-100 text-yellow-800",
                  Delivered: "bg-green-100 text-green-800",
                };
                return statusColors[status] || "";
              };

              return (
                <div key={colIndex} className="flex justify-between items-start py-1 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500">{label}</span>
                  <span className="text-sm text-right font-medium text-gray-800">
                    {path ? (
                      columnKey === "customerName" ? (
                        row.demoType ? (
                          <Link to={`${path}${row.id}`} className="text-blue-600 hover:text-blue-800">{displayValue}</Link>
                        ) : (
                          displayValue
                        )
                      ) : (
                        <Link to={`${path}${row.id}`} className="text-blue-600 hover:text-blue-800">{displayValue}</Link>
                      )
                    ) : columnKey.toLowerCase().includes("status") ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(displayValue)}`}>{displayValue}</span>
                    ) : (
                      displayValue
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-gray-500 text-sm">{noDataMessage}</div>
      )}
    </div>

    {/* Desktop Table Layout */}
    <div className="hidden md:block overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            {columns.map((col, i) => (
              <th key={i} className="pb-4 font-medium">
                {typeof col === "object" && "label" in col ? col.label : col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row: any, rowIndex: number) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {columns.map((col: any, colIndex: number) => {
                  const columnKey =
                    typeof col === "object" && "key" in col ? col.key : col;
                  const value = row[columnKey];
                  const path = routeMap[columnKey];
                  let displayValue = value;
                  if (
                    displayValue === null ||
                    displayValue === undefined ||
                    displayValue === ""
                  ) {
                    displayValue = "N/A";
                  }

                  // Handle status colors
                  const getStatusColor = (status: string) => {
                    const statusColors: Record<string, string> = {
                      Active: "bg-green-100 text-green-800",
                      "Final Quotation": "bg-green-100 text-green-800 ",
                      Inactive: "bg-red-100 text-red-800",
                      Pending: "bg-yellow-100 text-yellow-800",
                      Completed: "bg-blue-100 text-blue-800",
                      Approved: "bg-green-100 text-green-800",
                      Identified: "bg-yellow-100 text-yellow-800",
                      "Solution Presentation": "bg-blue-100 text-blue-800",
                      Rejected: "bg-red-100 text-red-800",
                      Draft: "bg-gray-100 text-gray-800",
                      "In Progress": "bg-blue-100 text-blue-800",
                      Cancelled: "bg-red-100 text-red-800",
                      "On Hold": "bg-yellow-100 text-yellow-800",
                      "Demo Requested": "bg-yellow-100 text-yellow-800",
                      Delivered: "bg-green-100 text-green-800",
                    };
                    return statusColors[status] || "";
                  };

                  return (
                    <td key={colIndex} className="py-4 text-sm text-gray-700">
                      {path ? (
                        columnKey === "customerName" ? (
                          row.demoType ? (
                            <Link
                              to={`${path}${row.id}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {displayValue}
                            </Link>
                          ) : (
                            displayValue
                          )
                        ) : (
                          <Link
                            to={`${path}${row.id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {displayValue}
                          </Link>
                        )
                      ) : columnKey.toLowerCase().includes("status") ? (
                        <span
                          className={`px-3 py-1 rounded-full ${getStatusColor(
                            displayValue
                          )}`}
                        >
                          {displayValue}
                        </span>
                      ) : (
                        displayValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-8 text-gray-500"
              >
                {noDataMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default DataTable;
