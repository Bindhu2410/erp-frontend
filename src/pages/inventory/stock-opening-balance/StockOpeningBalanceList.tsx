import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { StockOpeningBalanceListItem } from "../../../types/stockOpeningBalance";
import DynamicTable from "../../../components/common/DynamicTable";
import { FaPlus, FaEdit, FaEye, FaTrash } from "react-icons/fa";

const StockOpeningBalanceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StockOpeningBalanceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const [columns, setColumns] = useState({
    tableHeading: [
      { id: "documentNo", fieldName: "Document No" },
      { id: "location", fieldName: "Location" },
      { id: "itemCount", fieldName: "Items" },
      { id: "total", fieldName: "Total Value" },
      { id: "status", fieldName: "Status" },
      { id: "createdDate", fieldName: "Date" },
      { id: "createdBy", fieldName: "Created By" },
    ],
    manageColumn: {
      documentNo: true,
      location: true,
      itemCount: true,
      total: true,
      status: true,
      createdDate: true,
      createdBy: true,
    } as Record<string, boolean>,
  });

  useEffect(() => {
    fetchStockOpeningBalances();
  }, [currentPage, perPage, searchTerm]);

  const fetchStockOpeningBalances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('perPage', perPage.toString());
      if (searchTerm) params.append('search', searchTerm);
      const response = await api.get(`/StockOpeningBalance?${params.toString()}`);
      setData(response.data.items || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
    } catch (error) {
      console.error("Error fetching stock opening balances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleColumn = (column: string) => {
    setColumns((prev) => ({
      ...prev,
      manageColumn: {
        ...prev.manageColumn,
        [column]: !prev.manageColumn[column as keyof typeof prev.manageColumn],
      },
    }));
  };

  const handleView = (row: any) => {
    navigate(`/inventory/stock-opening-balance/${row.id}`, { state: { isView: true } });
  };

  const handleEdit = (row: any) => {
    navigate(`/inventory/stock-opening-balance/${row.id}`);
  };

  const handleDelete = async (row: any) => {
    if (window.confirm("Are you sure you want to delete this stock opening balance?")) {
      try {
        await api.delete(`/StockOpeningBalance/${row.id}`);
        fetchStockOpeningBalances();
      } catch (error) {
        console.error("Error deleting stock opening balance:", error);
      }
    }
  };

  const actions = [
    {
      label: <FaEye className="text-blue-500" />,
      onClick: handleView,
      type: "view",
    },
    {
      label: <FaEdit className="text-green-500" />,
      onClick: handleEdit,
      type: "edit",
    },
    {
      label: <FaTrash className="text-red-500" />,
      onClick: handleDelete,
      type: "delete",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Stock Opening Balance</h1>
          <p className="text-gray-600 mt-2">Manage stock opening balances for inventory</p>
        </div>
        <button
          onClick={() => navigate("/inventory/stock-opening-balance/new")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          <FaPlus /> New
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by document no or location..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <DynamicTable
          leads={data.map((item) => ({ ...item, id: item.id.toString() })) as any}
          columns={columns}
          toggleColumn={handleToggleColumn}
          totalCount={totalCount}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          perPage={perPage}
          setPerPage={setPerPage}
          loading={loading}
          listType="stockOpeningBalance"
          actions={actions}
          checkbox={true}
        />
      </div>
    </div>
  );
};

export default StockOpeningBalanceListPage;
