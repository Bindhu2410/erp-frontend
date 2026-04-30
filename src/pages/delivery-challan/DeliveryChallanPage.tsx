import React, { useState, useEffect, useCallback } from "react";
import { FiPrinter, FiEdit2, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Cards from "../../components/common/Cards";
import CommonTable from "../../components/CommonTable";
import DeliveryNotePreviewModal from "./DeliveryNotePreviewModal";
import CreateDeliveryChallanModal from "./CreateDeliveryChallanModal";
import { DeliveryChallan } from "../../types/deliveryChallan";
import deliveryChallanService from "../../services/deliveryChallanService";

const cardConfig = [
  {
    title: "Total DCs",
    value: 0,
    description: "All delivery challans",
    icon: "FaTruck",
  },
  {
    title: "Draft",
    value: 0,
    description: "Not yet dispatched",
    icon: "FaFileAlt",
  },
  {
    title: "Dispatched",
    value: 0,
    description: "On the way",
    icon: "FaShippingFast",
  },
  {
    title: "Delivered",
    value: 0,
    description: "Completed deliveries",
    icon: "FaCheckCircle",
  },
];

const DeliveryChallanPage: React.FC = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "draft">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [data, setData] = useState<DeliveryChallan[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const isModalOpen = showCreate || showNote;

  const handleEdit = (id: number) => {
    setEditId(id);
    setShowCreate(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF6B35",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        await deliveryChallanService.delete(id);
        toast.success("Delivery Challan deleted successfully");
        fetchData();
      } catch (error) {
        toast.error("Failed to delete Delivery Challan");
        console.error(error);
      }
    }
  };

  const renderStatusBadge = (status: any) => {
    const s = typeof status === "string" ? status.toLowerCase() : String(status ?? "").toLowerCase();
    let colorCls = "bg-gray-100 text-gray-600";
    if (s === "dispatched") colorCls = "bg-orange-100 text-orange-600 border border-orange-200";
    if (s === "delivered") colorCls = "bg-green-100 text-green-600 border border-green-200";
    if (s === "draft") colorCls = "bg-blue-100 text-blue-600 border border-blue-200";
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colorCls}`}>
        {status ?? "N/A"}
      </span>
    );
  };

  const columns = [
    { key: "deliveryChallanId", title: "DC No", dataIndex: "deliveryChallanId" },
    { key: "salesOrderNo", title: "Sales Order No", dataIndex: "salesOrderNo" },
    { key: "partyName", title: "Customer", dataIndex: "partyName" },
    { key: "deliveryDate", title: "DC Date", dataIndex: "deliveryDate", render: (row: any) => <span className="text-gray-600 font-medium">{new Date(row.deliveryDate).toLocaleDateString()}</span> },
    { key: "modeOfDelivery", title: "Mode of Delivery", dataIndex: "modeOfDelivery" },
    { key: "deliveryStatus", title: "Status", dataIndex: "deliveryStatus", render: (row: any) => renderStatusBadge(row.deliveryStatus) },
    { key: "netAmount", title: "Amount", dataIndex: "netAmount", render: (row: any) => <span className="font-bold text-gray-800">₹{row.netAmount?.toLocaleString("en-IN")}</span> },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "id",
      render: (row: any) => (
        <div className="flex gap-1">
          <button 
            onClick={() => handleEdit(row.id)} 
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
            title="Edit"
          >
            <FiEdit2 size={15} />
          </button>
          <button 
            onClick={() => handleDelete(row.id)} 
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all" 
            title="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await deliveryChallanService.getGrid({
        page,
        pageSize,
        status: activeTab === "draft" ? "Draft" : undefined
      });
      setData(response.data);
      setTotal(response.totalRecords);
    } catch (error) {
      console.error("Failed to fetch delivery challans:", error);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab, pageSize, deliveryChallanService]);

  useEffect(() => {
    fetchData();
  }, [page, activeTab]);

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setEditId(null);
    fetchData();
  };

  return (
    <>
      <div
        className={`p-4 transition-opacity duration-150 ${
          isModalOpen ? "opacity-0 pointer-events-none select-none" : "opacity-100"
        }`}
        aria-hidden={isModalOpen}
      >
        <h1 className="text-2xl font-semibold mb-4">Delivery Challan</h1>

      {/* Top Controls */}
      <div className="flex items-center justify-end gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Delivery Note */}
          <button
            type="button"
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-sm text-gray-700 transition"
            onClick={() => setShowNote(true)}
          >
            Delivery Note
          </button>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value="DESC">Sort by: Latest First</option>
            <option value="ASC">Sort by: Oldest First</option>
          </select>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            title="Print"
          >
            <FiPrinter size={18} />
          </button>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center gap-2 transition"
            >
              Export as
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
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showExportMenu && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200"
                style={{ backgroundColor: "white" }}
              >
                {["PDF", "Excel", "CSV"].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setShowExportMenu(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create DC */}
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#ff8657] transition-colors"
          >
            + Create DC
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 mb-2 md:grid-cols-2 gap-4">
        {[
          { title: "Total DCs", value: total, description: "All delivery challans", icon: "FaTruck" },
          { title: "Draft", value: 0, description: "Not yet dispatched", icon: "FaFileAlt" },
          { title: "Dispatched", value: 0, description: "On the way", icon: "FaShippingFast" },
          { title: "Delivered", value: 0, description: "Completed deliveries", icon: "FaCheckCircle" },
        ].map((card, index) => (
          <Cards
            key={index}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            color={index}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex overflow-hidden mb-4 mt-4">
        <button
          className="px-4 py-2 transition-colors rounded-md bg-[#FF6B35] text-white"
        >
          All Challans
        </button>
      </div>

      {/* Table */}
      <CommonTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        currentPage={page}
        onPageChange={(p: number) => setPage(p)}
        pagination={true}
        showCheckboxes={false}
        onSelectionChange={() => {}}
        rowKey="id"
        onToggleFilter={() => setShowFilters((prev: boolean) => !prev)}
        showFilter={showFilters}
      />

      </div>

      {showCreate && (
        <CreateDeliveryChallanModal 
          editId={editId || undefined} 
          onClose={() => {
            setShowCreate(false);
            setEditId(null);
          }} 
          onSuccess={handleCreateSuccess} 
        />
      )}
      {showNote && (
        <DeliveryNotePreviewModal onClose={() => setShowNote(false)} />
      )}
    </>
  );
};

export default DeliveryChallanPage;
