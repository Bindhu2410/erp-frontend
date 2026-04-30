import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import ReceiptComponent from "./Receipt";
import ReusableTable from "../../components/common/ReusableTable";
import type { Receipt as IReceipt } from "../../types/receipt";
import { FaEdit, FaTrash } from "react-icons/fa";

interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: any) => React.ReactNode;
}

type ReceiptData = IReceipt;

export const ReceiptManagement: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [filteredItems, setFilteredItems] = useState<ReceiptData[]>([]);
  const [selectedReceiptData, setSelectedReceiptData] =
    useState<ReceiptData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const ITEMS_PER_PAGE = 5;
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("Receipts");

      // No renaming here, we keep PascalCase fields
      const formattedData = response.data.map((item: any) => ({
        ...item.receipt,
        locationName: item.locationName || item.LocationName || "",
        customerName: item.customerName || item.CustomerName || "",
        salesRepresentativeName: item.salesRepresentativeName || item.SalesRepresentativeName || "",
        ReceiptDate: item.receipt.receiptDate
          ? new Date(item.receipt.receiptDate).toLocaleDateString("en-GB")
          : "",
        RefDate: item.receipt.refDate
          ? new Date(item.receipt.refDate).toLocaleDateString("en-GB")
          : "",
        DateCreated: item.receipt.dateCreated
          ? new Date(item.receipt.dateCreated).toLocaleDateString("en-GB")
          : "",
        DateUpdated: item.receipt.dateUpdated
          ? new Date(item.receipt.dateUpdated).toLocaleDateString("en-GB")
          : "",
      }));

      setReceipts(formattedData);
      setFilteredItems(formattedData);
    } catch (error) {
      console.error("Error fetching receipts:", error);
      toast.error("Failed to fetch receipts");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleViewReceipt = (id: number) => {
    const receipt = receipts.find((r) => r.id === id);
    if (receipt) {
      setSelectedReceiptData(receipt);
      setIsViewModalOpen(true);
    }
  };

  const handleEditReceipt = async (record: ReceiptData) => {
    setSelectedReceiptData(record);
    setIsAddModalOpen(true);
  };

  const handleDeleteReceipt = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      try {
        await api.delete(`Receipts/${id}`);
        toast.success("Receipt deleted successfully");
        setFilteredItems((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Error deleting receipt:", error);
        toast.error("Failed to delete receipt");
      }
    }
  };

  const columns: TableColumn[] = [
    { key: "docId", title: "Receipt ID", dataIndex: "docId" },
    { key: "ReceiptDate", title: "Received Date", dataIndex: "ReceiptDate" },
    { key: "customerName", title: "Customer Name", dataIndex: "customerName" },
    { key: "hospitalName", title: "Hospital", dataIndex: "hospitalName" },
    {
      key: "salesRepresentativeName",
      title: "Sales Rep",
      dataIndex: "salesRepresentativeName",
    },
    { key: "locationName", title: "Location", dataIndex: "locationName" },
    { key: "totalQty", title: "Qty", dataIndex: "totalQty" },
    { key: "gross", title: "Gross", dataIndex: "gross" },
    { key: "status", title: "Status", dataIndex: "status" },
    { key: "comments", title: "Comments", dataIndex: "comments" },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const paginatedData = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const actions = [
    {
      label: <FaEdit />,
      onClick: (record: ReceiptData) => handleEditReceipt(record),
      className: "text-blue-600 hover:text-blue-800",
    },
    {
      label: <FaTrash />,
      onClick: (record: ReceiptData) => handleDeleteReceipt(record.id),
      className: "text-red-600 hover:text-red-800",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Receipt Management</h1>
        <button
          onClick={() => {
            setSelectedReceiptData(null);
            setIsAddModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
        >
          Add New
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={paginatedData}
        rowKey="id"
        actions={actions}
        stickyActions={true}
        emptyState={
          isLoading
            ? { message: "Loading...", subMessage: "Please wait" }
            : {
              message: "No receipts found",
              subMessage: "Add a new receipt to get started",
            }
        }
        pagination={true}
        currentPage={currentPage}
        totalPages={Math.ceil(filteredItems.length / ITEMS_PER_PAGE)}
        totalItems={filteredItems.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
        loading={isLoading}
      />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={selectedReceiptData ? "Edit Receipt" : "Add Receipt"}
      >
        <ReceiptComponent
          isEdit={!!selectedReceiptData}
          data={
            selectedReceiptData ? { receipt: selectedReceiptData } : undefined
          }
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchData();
          }}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Receipt"
      >
        <ReceiptComponent
          isEdit={false}
          data={{ receipt: selectedReceiptData! }}
          onSuccess={fetchData}
          onClose={() => setIsViewModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
