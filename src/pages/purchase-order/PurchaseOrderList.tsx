import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  PurchaseOrder,
  PurchaseOrderFormData,
} from "../../types/purchaseOrder";

import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import api from "../../services/api";
import PurchaseOrderForm from "./PurchaseOrderForm";
import ReusableTable, {
  TableColumn,
} from "../../components/common/ReusableTable";
import { useUser } from "../../context/UserContext";

const PurchaseOrderList: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<
    PurchaseOrder | undefined
  >();
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const { user, role } = useUser();
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      const response = await api.get("PurchaseOrder");
      const data = response.data;

      console.log("Raw API response:", data);
      console.log("API response type:", typeof data);
      console.log("Is array?", Array.isArray(data));
      console.log("Array length:", data?.length);

      if (Array.isArray(data)) {
        // Log each item to see what's in the array
        data.forEach((item, index) => {
          console.log(`Item ${index}:`, item);
          console.log(`Item ${index} type:`, typeof item);
          console.log(
            `Item ${index} has purchaseOrder:`,
            !!item?.purchaseOrder
          );
          console.log(`Item ${index} poId:`, item?.purchaseOrder?.poId);
        });

        // Filter out invalid/empty items
        const validOrders = data.filter((item) => {
          const isValid =
            item &&
            item.purchaseOrder &&
            item.purchaseOrder.poId &&
            item.purchaseOrder.poId.trim() !== "" &&
            item.purchaseOrder.purchaseRequisitionId &&
            item.purchaseOrder.purchaseRequisitionId.trim() !== "";

          console.log(`Item ${item?.purchaseOrder?.poId} is valid:`, isValid);
          return isValid;
        });

        console.log("Valid orders after filtering:", validOrders);
        console.log("Valid orders count:", validOrders.length);

        // Transform the valid data
        const transformedOrders: PurchaseOrder[] = validOrders.map((item) => ({
          Id: item.purchaseOrder.id,
          PoId: item.purchaseOrder.poId,
          PurchaseRequisitionId: item.purchaseOrder.purchaseRequisitionId,
          Status: item.purchaseOrder.status,
          SupplierId: item.purchaseOrder.supplierId,
          DeliveryDate: item.purchaseOrder.deliveryDate,
          Description: item.purchaseOrder.description,
          Items: item.items || [],
          VendorName: item.vendorName,
          QuotationId: item.purchaseOrder.quotationId,
          SalesOrderId: item.purchaseOrder.salesOrderId,
          UserCreated: user?.userId || 0,
          UserUpdated: user?.userId || 0,
        }));

        console.log("Final transformed orders:", transformedOrders);
        setPurchaseOrders(transformedOrders);
      } else {
        console.error("API response is not an array:", data);
        setPurchaseOrders([]);
      }
    } catch (error) {
      toast.error("Error fetching purchase orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedOrder(undefined);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      try {
        await api.delete(`PurchaseOrder/${id}`);
        toast.success("Purchase order deleted successfully");
        fetchPurchaseOrders();
      } catch (error) {
        toast.error("Error deleting purchase order");
        console.error(error);
      }
    }
  };

  const handleSubmit = async (formData: PurchaseOrderFormData) => {
    try {
      if (modalMode === "create") {
        await api.post("PurchaseOrder", formData);
      } else {
        await api.put(`PurchaseOrder/${selectedOrder!.PoId}`, formData);
      }
      fetchPurchaseOrders();
      setIsModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const columns: TableColumn<PurchaseOrder>[] = [
    {
      key: "PoId",
      title: "PO ID",
      dataIndex: "PoId",
    },
    {
      key: "PurchaseRequisitionId",
      title: "PR ID",
      dataIndex: "PurchaseRequisitionId",
    },
    {
      key: "Status",
      title: "Status",
      dataIndex: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === "Draft"
              ? "bg-yellow-100 text-yellow-800"
              : value === "Approved"
              ? "bg-green-100 text-green-800"
              : value === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "VendorName",
      title: "Vendor",
      dataIndex: "VendorName",
    },
    {
      key: "DeliveryDate",
      title: "Delivery Date",
      dataIndex: "DeliveryDate",
      render: (value: string) => {
        if (!value) return "-";
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      },
    },
    {
      key: "Items",
      title: "Items Count",
      dataIndex: "Items",
      render: (items: any[]) => (items && items.length > 0 ? items.length : 0),
    },
  ];

  const actions = [
    {
      label: <FiEdit2 className="h-5 w-5" />,
      onClick: (record: PurchaseOrder) => handleEdit(record),
      className: "text-blue-600 hover:text-blue-900",
    },
    {
      label: <FiTrash2 className="h-5 w-5" />,
      onClick: (record: PurchaseOrder) => handleDelete(record?.Id.toString()),
      className: "text-red-600 hover:text-red-900",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading purchase orders...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Purchase Orders
        </h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <FiPlus className="mr-2" />
          Create Purchase Order
        </button>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No purchase orders
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new purchase order.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <ReusableTable
            columns={columns}
            data={purchaseOrders}
            loading={loading}
            actions={actions}
            rowKey="PoId"
            pagination={true}
            currentPage={1}
            totalItems={purchaseOrders.length}
            itemsPerPage={10}
            onPageChange={(page) => {
              console.log("Page changed:", page);
            }}
          />
        </div>
      )}

      <PurchaseOrderForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedOrder}
        mode={modalMode}
      />
    </div>
  );
};

export default PurchaseOrderList;
