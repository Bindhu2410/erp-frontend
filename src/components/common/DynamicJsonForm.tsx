import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCog,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Modal from "./Modal";
import { useUser } from "../../context/UserContext";

interface FieldSchema {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  sortable?: boolean;
  searchable?: boolean;
  description?: string;
  fullWidth?: boolean;
}

interface JsonFormProps {
  schema: FieldSchema[];
  endpoint: string;
  title?: string;
  pageSize?: number;
}

const DynamicJsonForm: React.FC<JsonFormProps> = ({
  schema,
  endpoint,
  title = "Dynamic Form",
  pageSize = 10,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columnSettings, setColumnSettings] = useState<Record<string, boolean>>(
    {}
  );
  const [showColumnManager, setShowColumnManager] = useState(false);
  const columnManagerRef = useRef<HTMLDivElement>(null);
  const [itemNameMap, setItemNameMap] = useState<Record<string, string>>({});
  const { user, role } = useUser();

  // Function to fetch item names from multiple potential sources
  const fetchItemNames = async () => {
    try {
      // Try to collect items from multiple potential endpoints
      const itemMap: Record<string, string> = {};

      // First try the standard items endpoint
      try {
        const response = await api.get("/items");
        const itemsData = response.data.items || response.data || [];

        itemsData.forEach((item: any) => {
          const itemId = item.id || item.item_id || item.itemId;
          const itemName =
            item.name ||
            item.itemName ||
            item.item_name ||
            item.title ||
            (item.itemCode && item.itemDescription
              ? `${item.itemCode} - ${item.itemDescription}`
              : null) ||
            `Item ${itemId}`;

          if (itemId) {
            itemMap[itemId] = itemName;
            itemMap[String(itemId)] = itemName;
          }
        });
      } catch (e) {
        console.log("Could not fetch items from /items endpoint");
      }

      // Then try the ItemMaster endpoint (which might be used in the system)
      try {
        const responseMaster = await api.get("/ItemMaster");
        const masterItems =
          responseMaster.data.items || responseMaster.data || [];

        masterItems.forEach((item: any) => {
          const itemId = item.id || item.item_id || item.itemId;
          const itemCode = item.itemCode || item.code;
          const itemName =
            item.itemName ||
            item.name ||
            item.description ||
            item.itemDescription;

          if (itemId) {
            // Use item code with name if available, otherwise just name
            const displayName =
              itemCode && itemName
                ? `${itemCode} - ${itemName}`
                : itemName || `Item ${itemId}`;

            itemMap[itemId] = displayName;
            itemMap[String(itemId)] = displayName;
          }
        });
      } catch (e) {
        console.log("Could not fetch items from /ItemMaster endpoint");
      }

      // Also check for select field options in the schema
      schema.forEach((field) => {
        if (
          (isItemIdField(field.key) ||
            field.key.toLowerCase().includes("item")) &&
          field.type === "select" &&
          field.options
        ) {
          field.options.forEach((option) => {
            if (option.value && option.label) {
              itemMap[option.value] = option.label;
              itemMap[String(option.value)] = option.label;
            }
          });
        }
      });

      return itemMap;
    } catch (error) {
      console.error("Error fetching items:", error);
      return {};
    }
  };

  useEffect(() => {
    fetchItems();

    // Check if we need to fetch item names
    const hasItemIdField = schema.some(
      (field) =>
        field.key === "item_id" ||
        field.key === "itemId" ||
        field.key.toLowerCase().includes("item")
    );

    if (hasItemIdField) {
      fetchItemNames().then((map) => setItemNameMap(map));
    }
  }, [schema]);

  // Helper function to check if a field is an item ID field
  const isItemIdField = (key: string): boolean => {
    return (
      key === "item_id" ||
      key === "itemId" ||
      key.toLowerCase().includes("item_id") ||
      key.toLowerCase().includes("itemid")
    );
  };

  // Initialize column settings when schema changes
  useEffect(() => {
    const initialColumnSettings: Record<string, boolean> = {};
    schema.forEach((field) => {
      initialColumnSettings[field.key] = true; // By default, all columns are visible
    });
    setColumnSettings(initialColumnSettings);
  }, [schema]);

  // Handle click outside to close column manager
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        columnManagerRef.current &&
        !columnManagerRef.current.contains(event.target as Node)
      ) {
        setShowColumnManager(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Apply filters, sorting, and pagination to the items
  useEffect(() => {
    let result = [...items];

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter((item) => {
        // First check if any field directly matches the search
        const directMatch = schema.some((field) => {
          if (!field.searchable) return false;

          const value = item[field.key];
          if (!value) return false;

          // For item ID fields, search by both ID and name
          if (isItemIdField(field.key) && itemNameMap[value]) {
            const itemName = itemNameMap[value].toLowerCase();
            return itemName.includes(search);
          }

          // For select fields, search by option label
          if (field.type === "select" && field.options) {
            const option = field.options.find((opt) => opt.value === value);
            if (option?.label) {
              return option.label.toLowerCase().includes(search);
            }
          }

          return String(value).toLowerCase().includes(search);
        });

        // If direct match found, return true
        if (directMatch) return true;

        // Special case: also search across all item names
        for (const key in item) {
          if (isItemIdField(key) && itemNameMap[item[key]]) {
            if (itemNameMap[item[key]].toLowerCase().includes(search)) {
              return true;
            }
          }
        }

        return false;
      });
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let valueA = a[sortField];
        let valueB = b[sortField];

        // For item ID fields, sort by name instead of ID
        if (
          (sortField === "item_id" || sortField === "itemId") &&
          itemNameMap[valueA] &&
          itemNameMap[valueB]
        ) {
          valueA = itemNameMap[valueA];
          valueB = itemNameMap[valueB];
        }

        if (valueA === valueB) return 0;

        const comparison = valueA > valueB ? 1 : -1;
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    // Calculate total pages
    setTotalPages(Math.ceil(result.length / pageSize));

    // Store filtered result before pagination
    setFilteredItems(result);
  }, [items, searchTerm, sortField, sortDirection, pageSize, itemNameMap]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);
      const data = res.data.items || res.data || [];
      setItems(data);
      setCurrentPage(1);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: any, fieldType?: string) => {
    if (fieldType === "date" && value) {
      setFormData((prev: any) => ({ ...prev, [key]: value }));
    } else if (fieldType === "boolean") {
      const boolValue = Boolean(value);
      setFormData((prev: any) => ({
        ...prev,
        [key]: boolValue,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [key]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalFormData = { ...formData };

      schema.forEach((field) => {
        if (field.type === "date" && finalFormData[field.key]) {
          const dateString = finalFormData[field.key];
          let date;
          if (typeof dateString === "string") {
            if (dateString.includes("T")) {
              date = new Date(dateString);
            } else {
              date = new Date(dateString + "T00:00:00Z");
            }
          } else if (dateString instanceof Date) {
            date = dateString;
          }

          if (date && !isNaN(date.getTime())) {
            finalFormData[field.key] = date.toISOString();
          }
        } else if (field.type === "boolean") {
          finalFormData[field.key] = Boolean(finalFormData[field.key]);
        }
      });

      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, finalFormData);
      } else {
        await api.post(endpoint, finalFormData);
      }

      setFormData({});
      setEditingId(null);
      setIsModalOpen(false);
      fetchItems();
    } catch (error: any) {
      console.error("Submit error", error);
      alert("Error submitting form: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (fieldKey: string) => {
    const field = schema.find((f) => f.key === fieldKey);
    if (!field || field.sortable === false) return;

    if (sortField === fieldKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(fieldKey);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle toggling column visibility
  const toggleColumn = (key: string) => {
    setColumnSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handle toggling all columns
  const toggleAllColumns = (visible: boolean) => {
    const updatedSettings: Record<string, boolean> = {};
    Object.keys(columnSettings).forEach((key) => {
      updatedSettings[key] = visible;
    });
    setColumnSettings(updatedSettings);
  };

  useEffect(() => {
    const booleanFields = schema.filter((field) => field.type === "boolean");
    const updatedData = { ...formData };

    booleanFields.forEach((field) => {
      if (updatedData[field.key] === undefined) {
        updatedData[field.key] = false;
      }
    });

    setFormData(updatedData);
  }, [schema, isModalOpen]);

  const handleEdit = (item: any) => {
    const processedItem = { ...item };

    schema.forEach((field) => {
      if (field.type === "boolean") {
        processedItem[field.key] = Boolean(
          processedItem[field.key] === true ||
            processedItem[field.key] === "true" ||
            processedItem[field.key] === 1
        );
      }
    });

    setFormData(processedItem);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const initialData: Record<string, any> = {};

    schema.forEach((field) => {
      if (field.type === "boolean") {
        initialData[field.key] = false;
      }
    });

    setFormData(initialData);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    setLoading(true);
    try {
      await api.delete(`${endpoint}/${id}`);
      fetchItems();
    } catch (err) {
      console.error("Delete error", err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredItems.slice(startIndex, endIndex);
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // This function was moved to the top of the component

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-black">{title}</h1>
            <div className="flex gap-2 relative">
              <button
                onClick={() => setShowColumnManager(!showColumnManager)}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-200 transition-all"
                title="Manage Columns"
              >
                <FaCog size={14} /> Columns
              </button>

              {/* Column Manager Dropdown */}
              {showColumnManager && (
                <div
                  ref={columnManagerRef}
                  className="absolute right-0 top-12 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-20"
                >
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-semibold text-gray-700 mb-2">
                      Manage Columns
                    </div>
                    <div className="flex justify-between gap-2">
                      <button
                        onClick={() => toggleAllColumns(true)}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1"
                      >
                        Show All
                      </button>
                      <button
                        onClick={() => toggleAllColumns(false)}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded flex items-center gap-1"
                      >
                        <FaTimes size={10} /> Hide All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    <div className="space-y-1">
                      {schema.map((field) => (
                        <div
                          key={field.key}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex items-center justify-center w-5 h-5 border rounded cursor-pointer transition-colors ${
                                columnSettings[field.key]
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-300 bg-white hover:bg-gray-100"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleColumn(field.key);
                              }}
                            >
                              {columnSettings[field.key] && (
                                <FaCheck size={12} className="text-blue-500" />
                              )}
                            </div>
                            <span
                              className="text-sm text-gray-700 cursor-pointer"
                              onClick={() => toggleColumn(field.key)}
                            >
                              {field.label}
                            </span>
                          </div>
                          <div
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                            onClick={() => toggleColumn(field.key)}
                          >
                            {columnSettings[field.key] ? (
                              <FaEye className="text-blue-500" size={16} />
                            ) : (
                              <FaEyeSlash className="text-gray-400" size={16} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
              >
                <FaPlus size={14} /> Add New
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 bg-white border-b">
          <div className="flex items-center justify-between">
            <div className="relative flex-grow max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item name, ID, or any field..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 pr-4 py-3 border-2 rounded-lg w-full shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 focus:outline-none text-base"
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredItems.length} of {items.length} items
              {searchTerm && (
                <span className="ml-1 font-medium">(filtered)</span>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading data...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FaSearch className="text-gray-400" size={24} />
              </div>
              <p className="text-lg text-gray-600">
                No items found {searchTerm ? "matching your search" : ""}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Add a new item to get started"}
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  {schema
                    .filter((field) => columnSettings[field.key] !== false)
                    .map((field) => (
                      <th
                        key={field.key}
                        className={`px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider ${
                          field.sortable !== false
                            ? "cursor-pointer hover:bg-blue-700"
                            : ""
                        }`}
                        onClick={() =>
                          field.sortable !== false && handleSort(field.key)
                        }
                      >
                        <div className="flex items-center">
                          {/* For item ID fields, show "Item Name" instead of field label */}
                          {isItemIdField(field.key) ? "Item Name" : field.label}
                          {field.sortable !== false && (
                            <span className="ml-1">
                              {sortField === field.key ? (
                                sortDirection === "asc" ? (
                                  <FaSortUp className="text-blue-600" />
                                ) : (
                                  <FaSortDown className="text-blue-600" />
                                )
                              ) : (
                                <FaSort className="text-gray-300" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider  bg-blue-600 hover: bg-blue-700 sticky right-0 z-10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getCurrentPageItems().map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {schema
                      .filter((field) => columnSettings[field.key] !== false)
                      .map((field) => (
                        <td
                          key={field.key}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {field.type === "date" ? (
                            item[field.key] &&
                            !isNaN(new Date(item[field.key]).getTime()) ? (
                              new Date(item[field.key]).toLocaleDateString()
                            ) : (
                              "N/A"
                            )
                          ) : field.type === "datetime-local" ? (
                            item[field.key] &&
                            !isNaN(new Date(item[field.key]).getTime()) ? (
                              new Date(item[field.key]).toLocaleString()
                            ) : (
                              "N/A"
                            )
                          ) : field.type === "boolean" ? (
                            item[field.key] ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <svg
                                  className="mr-1.5 h-2 w-2 text-green-400"
                                  fill="currentColor"
                                  viewBox="0 0 8 8"
                                >
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <svg
                                  className="mr-1.5 h-2 w-2 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 8 8"
                                >
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                No
                              </span>
                            )
                          ) : field.type === "select" ? (
                            <>
                              {field.options?.find(
                                (option) => option.value === item[field.key]
                              )?.label || "N/A"}
                            </>
                          ) : // Show item name instead of ID for item_id fields
                          isItemIdField(field.key) &&
                            itemNameMap[item[field.key]] ? (
                            <span title={`ID: ${item[field.key]}`}>
                              {itemNameMap[item[field.key]]}
                            </span>
                          ) : item[field.key] !== undefined &&
                            item[field.key] !== null ? (
                            item[field.key]
                          ) : (
                            "N/A"
                          )}
                        </td>
                      ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm sticky right-0 z-10 bg-white">
                      <div className="flex justify-end gap-3">
                        <button
                          className="flex items-center text-blue-600 hover:text-blue-800"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          className="flex items-center text-red-600 hover:text-red-800"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex-1 flex justify-center sm:justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal - Keep the form as is since we still want to edit by ID */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({});
          setEditingId(null);
        }}
        title={editingId ? `Edit ${title}` : `Add New ${title}`}
      >
        <form onSubmit={handleSubmit} className="p-4 shadow-lg rounded-lg m-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schema.map((field) => (
              <div
                key={field.key}
                className={`mb-4 flex flex-col ${
                  field.fullWidth ? "md:col-span-2" : ""
                }`}
                style={{
                  minHeight: field.type === "boolean" ? "auto" : "90px",
                }}
              >
                {field.type === "boolean" ? (
                  <div className="h-full flex items-center p-3 border border-gray-200 rounded-md bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center h-5">
                      <input
                        id={`checkbox-${field.key}`}
                        type="checkbox"
                        checked={formData[field.key] === true}
                        onChange={(e) =>
                          handleChange(field.key, e.target.checked, "boolean")
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 flex items-center">
                      <label
                        htmlFor={`checkbox-${field.key}`}
                        className="text-sm font-medium text-gray-700"
                      >
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {field.description && (
                        <div className="group relative ml-2">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-500 text-xs cursor-help">
                            ?
                          </div>
                          <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-md shadow-lg -left-20 top-5">
                            {field.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <label className="font-medium text-gray-700">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {field.description && (
                        <div className="group relative ml-2">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 text-gray-500 text-xs cursor-help">
                            ?
                          </div>
                          <div className="absolute z-10 hidden group-hover:block w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-md shadow-lg -left-20 top-5">
                            {field.description}
                          </div>
                        </div>
                      )}
                    </div>
                    {field.type === "select" ? (
                      <div className="relative">
                        <select
                          value={formData[field.key] || ""}
                          onChange={(e) =>
                            handleChange(field.key, e.target.value)
                          }
                          required={field.required}
                          className="block w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 h-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        required={field.required}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : field.type === "date" ? (
                      <input
                        type="datetime-local"
                        value={
                          formData[field.key]
                            ? typeof formData[field.key] === "string"
                              ? formData[field.key].includes("T")
                                ? formData[field.key].slice(0, 16)
                                : `${formData[field.key]}T00:00`
                              : new Date(formData[field.key])
                                  .toISOString()
                                  .slice(0, 16)
                            : ""
                        }
                        onChange={(e) =>
                          handleChange(field.key, e.target.value, "date")
                        }
                        required={field.required}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.key] || ""}
                        onChange={(e) =>
                          handleChange(field.key, e.target.value)
                        }
                        required={field.required}
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({});
                setEditingId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>{editingId ? "Update" : "Create"}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DynamicJsonForm;
