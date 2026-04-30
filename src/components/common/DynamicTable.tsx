import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PopUp from "./PopUp";
import Modal from "./Modal";

interface Lead {
  id: string;
  isSelected?: boolean;
  [key: string]: any;
}

interface TableHeading {
  id: string;
  fieldName: string;
}

interface Columns {
  tableHeading: TableHeading[];
  manageColumn: { [key: string]: boolean };
}

interface Action {
  label: string | React.ReactNode;
  onClick: (row: Record<string, string | number>) => void;
  type: string;
}

interface DynamicTableProps {
  leads: Lead[];
  columns: Columns;
  toggleLeadSelection?: (id: string) => void;
  toggleColumn: (column: string) => void;
  navigateTo?: string;
  totalCount: number | undefined;
  currentPage?: number | undefined;
  setCurrentPage?: React.Dispatch<React.SetStateAction<number>>;
  perPage?: number | undefined;
  setPerPage?: React.Dispatch<React.SetStateAction<number>>;
  loading?: boolean;
  onSort?: (fieldName: string, direction: "asc" | "desc") => void;
  listType: string;
  actions?: Action[];
  hideFields?: boolean;
  tableType?: string;
  checkbox?: boolean;
  onFileClick?: (fileUrl: string, fileType: string) => void;
  isFileTable?: boolean;
}

const DynamicTable: React.FC<DynamicTableProps> = ({
  leads,
  columns,
  toggleLeadSelection,
  toggleColumn,
  totalCount,
  navigateTo,
  currentPage,
  setCurrentPage,
  perPage,
  setPerPage,
  loading,
  onSort,
  listType,
  hideFields,
  actions,
  tableType,
  checkbox = true,
  onFileClick,
  isFileTable,
}) => {
  const [showManageColumns, setShowManageColumns] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState({ url: "", type: "" });
  const navigate = useNavigate();
  console.log(leads, "leadDAta");
  const totalPages = Math.ceil((totalCount ?? 0) / (perPage ?? 1));

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  };

  const handleSelectAll = () => {
    const allSelected = leads.every((lead) => lead.isSelected);
    leads.forEach((lead) => toggleLeadSelection?.(lead.id));
  };

  const handlePrevPage = () => {
    setCurrentPage?.((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage?.((prev) => Math.min(prev + 1, totalPages));
  };

  const formatCellContent = (content: any, columnId: string) => {
    if (
      content === null ||
      content === undefined ||
      content === "null" ||
      (typeof content === "string" && content.trim() === "")
    ) {
      return "N/A";
    }
    if (columnId === "date_created" || columnId === "date_updated") {
      const date = new Date(content);
      return isNaN(date.getTime())
        ? "N/A"
        : `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    return content;
  };

  const handleFileClick = (row: Lead) => {
    // Check if there's a local file, otherwise use the database file
    const fileUrl = row.localFile
      ? URL.createObjectURL(row.localFile)
      : row.fileUrl;
    const fileType = row.localFile ? row.localFile.type : row.fileType;

    if (onFileClick) {
      onFileClick(fileUrl, fileType);
    } else if (isFileTable) {
      setPreviewFile({ url: fileUrl, type: fileType });
      setShowPreview(true);
    }
  };

  const renderFilePreview = () => {
    const { url, type } = previewFile;
    if (type.includes("image")) {
      return <img src={url} alt="Preview" className="max-w-full h-auto" />;
    } else if (type.includes("pdf")) {
      return <iframe src={url} className="w-full h-[80vh]" />;
    } else {
      return (
        <div className="text-center py-8">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:text-orange-600"
          >
            Open file in new tab
          </a>
        </div>
      );
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl  overflow-hidden">
        {/* Table Header */}
        <div className="p-4 ">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Total Count:
              </span>

              <span className="text-sm font-medium text-gray-700">
                {leads.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {!hideFields && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">
                    Rows per page:
                  </label>
                  <select
                    className="form-select border border-gray-300 rounded-md text-sm py-1 px-2 pr-8 bg-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    onChange={(e) => setPerPage?.(Number(e.target.value))}
                    value={perPage}
                  >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowManageColumns(!showManageColumns)}
                className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                title="Manage Columns"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
        <Modal
          isOpen={showManageColumns}
          onClose={() => setShowManageColumns(false)}
          title="Manage Columns"
        >
          <div className="space-y-3">
            {showManageColumns && (
              <div className="space-y-3 p-4">
                {columns.tableHeading.map((column, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={columns.manageColumn[column.id]}
                      onChange={() => toggleColumn?.(column.id)}
                      className="h-4 w-4"
                    />

                    <span className="">{column.fieldName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {checkbox && (
                  <th className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300 w-12">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                      checked={
                        leads?.length > 0 &&
                        leads.every((lead) => lead.isSelected)
                      }
                      onChange={() => handleSelectAll()}
                    />
                  </th>
                )}
                {columns.tableHeading
                  .filter((column) => columns.manageColumn[column.id])
                  .map((column, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300"
                      onClick={() =>
                        onSort?.(
                          column.id,
                          sortConfig?.key === column.id &&
                            sortConfig?.direction === "asc"
                            ? "desc"
                            : "asc"
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        {column.fieldName}
                        {sortConfig?.key === column.id && (
                          <span className="text-orange-500">
                            {sortConfig.direction === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                {actions && (
                  <th
                    scope="col"
                    className="p-3 text-left bg-gray-100 font-semibold border-b border-gray-300"
                  >
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
                      columns.tableHeading.filter(
                        (column) => columns.manageColumn[column.id]
                      ).length + (checkbox ? 2 : 1)
                    }
                    className="px-6 py-4 whitespace-nowrap text-center"
                  >
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ) : leads?.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.tableHeading.filter(
                        (column) => columns.manageColumn[column.id]
                      ).length + (checkbox ? 2 : 1)
                    }
                    className="px-6 py-4 whitespace-nowrap text-center text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                leads?.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    {checkbox && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                          checked={row.isSelected}
                          onChange={() => toggleLeadSelection?.(row.id)}
                        />
                      </td>
                    )}
                    {columns.tableHeading
                      .filter((column) => columns.manageColumn[column.id])
                      .map((column, colIndex) => (
                        <td
                          key={column.id}
                          className={`p-3 border-b border-gray-300 ${
                            column.id === "email" ? "email-field" : ""
                          } ${
                            isFileTable
                              ? "cursor-pointer hover:text-orange-500"
                              : ""
                          }`}
                          onClick={() => {
                            if (
                              isFileTable &&
                              (column.id === "fileUrl" ||
                                column.id === "fileName")
                            ) {
                              handleFileClick(row);
                            }
                          }}
                        >
                          {formatCellContent(row[column.id], column.id)}
                        </td>
                      ))}
                    {actions && (
                      <td className="p-3 border-b border-gray-300">
                        <div className="flex gap-2 justify-end">
                          {actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={`p-2 rounded-full transition-all ${
                                action.type === "edit"
                                  ? "text-blue-600 hover:bg-blue-50"
                                  : action.type === "delete"
                                  ? "text-red-600 hover:bg-red-50"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!hideFields && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePrevPage()}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleNextPage()}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPreview && (
        <PopUp
          isModalOpen={showPreview}
          setModal={setShowPreview}
          heading="File Preview"
          content={renderFilePreview()}
        />
      )}
    </>
  );
};

export default DynamicTable;
