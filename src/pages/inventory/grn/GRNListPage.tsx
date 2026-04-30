import React, { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useUser } from "../../../context/UserContext";
import GRNModal from "./GRNModal";
import { toast } from "react-toastify";

const GRNListPage: React.FC = () => {
  const [grnList, setGrnList] = useState<any[]>([]);
  const [filteredList, setFilteredList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [suppliers, setSuppliers] = useState<{ [key: string]: string }>({});
  const [items, setItems] = useState<{ [key: string]: string }>({});
  const [showGRNModal, setShowGRNModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<any>(null);

  useEffect(() => {
    fetchGRNList();
    fetchSuppliers();
    fetchItems();
  }, []);

  const fetchGRNList = async () => {
    try {
      setLoading(true);
      const response = await api.get("GoodsReceiptNote");

      // Handle both possible API response formats
      let data;
      if (response.data && response.data.grn) {
        // Handle the specific response format you provided
        data = [response.data.grn]; // Put the single GRN in an array for consistency
      } else {
        // Handle the standard list response format
        data = response.data.items || response.data || [];
      }

      console.log("GRN Data:", data);

      setGrnList(data);
      setFilteredList(data);

      // If we have item details in the response, update our item map
      if (response.data && response.data.itemDetails) {
        const itemDetailsMap: { [key: string]: string } = {};
        response.data.itemDetails.forEach((item: any) => {
          if (item.id) {
            itemDetailsMap[item.id] = item.itemName || `Item ${item.id}`;
          }
        });

        // Merge with existing items
        setItems((prev) => ({ ...prev, ...itemDetailsMap }));
      }
    } catch (error) {
      console.error("Error fetching GRN list:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await api.get("Supplier");
      const data = response.data.items || response.data || [];
      const supplierMap: { [key: string]: string } = {};

      data.forEach((supplier: any) => {
        if (supplier.id) {
          const name =
            supplier.vendorName ||
            supplier.companyName ||
            `Supplier ${supplier.id}`;
          supplierMap[supplier.id] = name;
        }
      });

      setSuppliers(supplierMap);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("itemmaster");
      const data = response.data.items || response.data || [];
      const itemMap: { [key: string]: string } = {};

      data.forEach((item: any) => {
        if (item.id) {
          // Extract the descriptive part without the code
          const name = item.name || item.itemName || `Item ${item.id}`;
          itemMap[item.id] = name;
        }
      });

      setItems(itemMap);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = grnList.filter((grn) => {
        // Check if any of the GRN header fields match
        const headerMatches =
          (grn.grnNo && grn.grnNo.toLowerCase().includes(searchLower)) ||
          (grn.grnDate &&
            new Date(grn.grnDate).toLocaleDateString().includes(searchLower)) ||
          (grn.supplierId &&
            suppliers[grn.supplierId] &&
            suppliers[grn.supplierId].toLowerCase().includes(searchLower)) ||
          (grn.narration &&
            grn.narration.toLowerCase().includes(searchLower)) ||
          (grn.status && grn.status.toLowerCase().includes(searchLower));

        // Check if any items in this GRN match the search term
        const itemMatches = grn.items?.some(
          (item: any) =>
            (item.itemId &&
              items[item.itemId] &&
              items[item.itemId].toLowerCase().includes(searchLower)) ||
            (item.amount && item.amount.toString().includes(searchLower))
        );

        return headerMatches || itemMatches;
      });
      setFilteredList(filtered);
    } else {
      setFilteredList(grnList);
    }
  }, [searchTerm, grnList, suppliers, items]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCreateNew = () => {
    navigate("/goods-receipt-note/new");
  };

  const handleEdit = async (id: string | number) => {
    navigate(`/goods-receipt-note/${id}/edit`);
  };

  const handleView = (id: string | number) => {
    navigate(`/inventory/grn/view/${id}`);
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this GRN?")) {
      try {
        await api.delete(`GoodsReceiptNote/${id}`);
        fetchGRNList();
      } catch (error) {
        console.error("Error deleting GRN:", error);
        toast.error("Failed to delete GRN. Please try again later.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status: string) => {
    let bgColor = "bg-white text-gray-800";

    if (status?.toLowerCase() === "approved") {
      bgColor = "bg-green-100 text-green-800";
    } else if (status?.toLowerCase() === "pending") {
      bgColor = "bg-yellow-100 text-yellow-800";
    } else if (status?.toLowerCase() === "rejected") {
      bgColor = "bg-red-100 text-red-800";
    }

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}
      >
        {status || "N/A"}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 bg-white py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Goods Received Notes
        </h1>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Create New GRN
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search GRNs by number, supplier, item, status..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div>Loadind....</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-2">No GRNs found</p>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search criteria"
              : "Create your first GRN to get started"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-white bg-white">
            <thead className="bg-white">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  GRN No
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Supplier
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredList.map((grn) => {
                // Calculate total amount and quantities for GRN header row
                const totalAmount =
                  grn.items?.reduce(
                    (sum: number, item: any) => sum + (item.amount || 0),
                    0
                  ) || 0;
                const totalGrnQty =
                  grn.items?.reduce(
                    (sum: number, item: any) => sum + (item.grnQty || 0),
                    0
                  ) || 0;
                const totalPendingQty =
                  grn.items?.reduce(
                    (sum: number, item: any) => sum + (item.pendingQty || 0),
                    0
                  ) || 0;

                return (
                  <React.Fragment key={grn.id}>
                    {/* Main GRN row */}
                    <tr className="hover:bg-gray-100 bg-white">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grn.grn.grnNo || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(grn.grn.grnDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {suppliers[grn.grn.supplierId] || "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(grn.grn.id)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(grn.grn.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Item detail rows - one for each item in the GRN */}
                    {grn.items?.map((item: any, idx: number) => (
                      <tr
                        key={`${grn.id}-item-${item.id || idx}`}
                        className="hover:bg-gray-100 text-sm text-gray-500 border-t border-dashed"
                      >
                        <td className="px-6 py-2 pl-10">
                          <div className="text-xs text-gray-500">
                            Item {idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-2">-</td>
                        <td className="px-6 py-2">-</td>
                        <td className="px-6 py-2">
                          <div className="text-sm text-gray-700">
                            {items[item.itemId] || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-2">
                          <div className="text-sm">
                            {item.qcPassed ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                No
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-2">
                          {item.grnQty?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-2">
                          {item.pendingQty?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-2">-</td>
                        <td className="px-6 py-2">
                          ₹{item.amount?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-2">-</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRN Modal */}
      <GRNModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setSelectedGRN(null);
        }}
        onSubmitSuccess={fetchGRNList}
        initialData={selectedGRN}
      />
    </div>
  );
};

export default GRNListPage;
