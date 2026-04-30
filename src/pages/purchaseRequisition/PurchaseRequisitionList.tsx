import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiEye } from "react-icons/fi";
import ReusableTable, {
  TableColumn,
} from "../../components/common/ReusableTable";
import Modal from "../../components/common/Modal";
import CreatePurchaseRequisition from "./CreatePurchaseRequisition";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import { PurchaseRequisitionData } from "./types";

interface Item {
  itemId: number;
  quantity: number;
  make: string;
  model: string;
  categoryName: string;
  product: string;
  brand: string;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  hsn: string;
  taxPercentage: number;
  uomName: string;
  catNo: string;
  valuationMethodName: string;
}

interface PurchaseRequisition {
  id: number;
  purchaseRequisitionId: string;
  requesterName: string;
  description: string;
  supplierId: number;
  vendorName: string;
  deliveryDate: string;
  budgetAmount: number;
  status: string;
  userCreated: number;
  userUpdated: number;
  items: Item[];
}

const PurchaseRequisitionList: React.FC = () => {
  const navigate = useNavigate();

  const { user, role } = useUser();
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Get role from localStorage
    try {
      const roleDtoStr = localStorage.getItem("roleDto");
      if (roleDtoStr) {
        const roleDto = JSON.parse(roleDtoStr);
        setUserRole(roleDto.roleName);
      }
    } catch (e) {
      setUserRole("");
    }
  }, []);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedRequisition, setSelectedRequisition] =
    useState<PurchaseRequisition | null>(null);
  const [initialFormData, setInitialFormData] =
    useState<PurchaseRequisitionData | null>(null);

  const getRequesterName = () => {
    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    return fullName || user?.username || "";
  };

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };
  const fetchRequisitions = async () => {
    setLoading(true);
    try {
      const response = await api.get("PurchaseRequisitions/all");
      setRequisitions(response.data);
    } catch (error) {
      console.error("Error fetching purchase requisitions:", error);
      toast.error("Failed to fetch purchase requisitions.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchRequisitions();
  }, []);

  const handleAddPR = () => {
    setSelectedRequisition(null);
    setFormMode("create");
    setInitialFormData({
      requesterName: getRequesterName(),
      description: "",
      supplierId: 0,
      vendorName: "",
      deliveryDate: getTodayDate(),
      budgetAmount: 0,
      status: "Pending",
      userCreated: user?.userId || 0,
      userUpdated: user?.userId || 0,
      items: [],
    });
    setIsModalOpen(true);
  };

  // Format deliveryDate in selectedRequisition
  const handleEditPR = (requisition: PurchaseRequisition) => {
    const formatted = {
      ...requisition,
      deliveryDate: requisition.deliveryDate,
    };
    setFormMode("edit");
    setSelectedRequisition(formatted);
    setInitialFormData(null);
    setIsModalOpen(true);
  };

  // Format delivery date to DD-MM-YYYY before passing to CreatePurchaseRequisition
  const formattedRequisitions = requisitions.map((req) => ({
    ...req,
  }));
  console.log(requisitions, "erere");
  const columns: TableColumn[] = [
    { key: "id", title: "ID", dataIndex: "purchaseRequisitionId" },
    {
      key: "requesterName",
      title: "Requester Name",
      dataIndex: "requesterName",
    },
    { key: "description", title: "Description", dataIndex: "description" },
    { key: "status", title: "Status", dataIndex: "status" },
    {
      key: "vendorName",
      title: "Vendor Name",
      dataIndex: "vendorName",
    },
    {
      key: "deliveryDate",
      title: "Delivery Date",
      dataIndex: "deliveryDate",
    },
    {
      key: "budgetAmount",
      title: "Budget Amount",
      dataIndex: "budgetAmount",
      render: (value) => `₹${Number(value).toLocaleString("en-IN")}`,
    },
    {
      key: "items",
      title: "Items",
      dataIndex: "items",
      render: (items) =>
        items
          ?.map(
            (item: any) =>
              `${item.itemName} (${item.quantity} ${item.uomName})`,
          )
          .join(", ") || "",
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "",
      render: (value, record) => (
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => handleEditPR(record)}
          >
            Edit
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => console.log("Delete", record.id)}
          >
            Delete
          </button>
          {(role?.roleName === "Managing Director" ||
            role?.roleName === "Administrator" ||
            role?.roleName === "Admin") && (
            <button
              className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
              onClick={() =>
                navigate(`/view-purchase-requisition/${record.id}`)
              }
            >
              <FiEye className="mr-2" /> View
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full mx-auto p-2">
      <div className="bg-white p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-blue-600">
            Purchase Requisitions
          </h3>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleAddPR}
          >
            Add PR
          </button>
        </div>
        <ReusableTable
          columns={columns}
          data={formattedRequisitions}
          loading={loading}
          rowKey="purchaseRequisitionId"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedRequisition
            ? "Edit Purchase Requisition"
            : "Add Purchase Requisition"
        }
      >
        <CreatePurchaseRequisition
          mode={formMode}
          data={
            formMode === "edit"
              ? selectedRequisition || undefined
              : initialFormData || undefined
          }
          onSuccess={fetchRequisitions}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PurchaseRequisitionList;
