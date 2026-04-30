import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import api from "../../services/api";
import PurchaseItemsTable from "../../components/purchase/PurchaseItemsTable";

interface RequestItem {
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

interface PurchaseRequest {
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
  items: RequestItem[];
}

const ViewPurchaseRequisition: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [comments, setComments] = useState("");

  useEffect(() => {
    checkUserRole();
    fetchRequestDetails();
  }, [id]);

  const checkUserRole = () => {
    // Replace with your actual role check logic
    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "ADMIN" || userRole === "MANAGING_DIRECTOR");
  };

  const fetchRequestDetails = async () => {
    try {
      const response = await api.get(`PurchaseRequisitions/${id}`);
      setRequest(response.data);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching request details");
      setLoading(false);
    }
  };

  const handleApproval = async (status: "APPROVED" | "REJECTED") => {
    if (status === "REJECTED" && !comments.trim()) {
      toast.error("Please provide comments for rejection");
      return;
    }

    try {
      await api.patch(`PurchaseRequisitions/${id}`, {
        id: request?.id,
        status,
        Description: comments.trim() || undefined,
      });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      navigate("/Purchase-Requisition");
    } catch (error) {
      toast.error(`Error ${status.toLowerCase()}ing request`);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!request) return <div className="p-4">Request not found</div>;

  return (
    <div className="flex flex-col lg:flex-row max-w-full overflow-x-hidden px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 flex-1 overflow-x-auto min-w-0">
        {/* Header Section */}
        {/* Header Section with improved UI */}
        <div className="mb-8">
          {/* Title and Status Bar */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">
                Purchase Request{" "}
                <span className="text-blue-600">
                  #{request.purchaseRequisitionId}
                </span>
              </h1>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <i className="far fa-clock text-blue-500 mr-2"></i>
                  <span>
                    Submitted:{" "}
                    {new Date(request.deliveryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <i className="far fa-user text-blue-500 mr-2"></i>
                  <span>{request.requesterName}</span>
                </div>
                <div className="flex items-center">
                  <i className="far fa-building text-blue-500 mr-2"></i>
                  <span>Production Department</span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <div
                className={`px-4 py-2 rounded-lg ${
                  request.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : request.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <span className="font-semibold">{request.status}</span>
              </div>
            </div>
          </div>

          {/* Key Information Cards */}
          <div className="grid grid-cols-3 gap-6 my-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">
                Required Delivery
              </div>
              <div className="font-semibold text-lg">
                {new Date(request.deliveryDate).toLocaleDateString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Total Value</div>
              <div className="font-semibold text-lg text-green-600">
                ₹{request.budgetAmount.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="text-sm text-gray-500 mb-1">Items Count</div>
              <div className="font-semibold text-lg">
                {request.items.length} items
              </div>
            </div>
          </div>

          {/* Justification Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Description
            </h2>
            <div className="text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
              {request.description}
            </div>
          </div>
        </div>

        {/* Requested Items Table */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Requested Items
            </h2>
            <div className="text-sm text-gray-500">
              Total {request.items.length} items
            </div>
          </div>
          <div className="overflow-x-auto">
            <PurchaseItemsTable
              items={request.items.map((item, idx) => ({
                Id: item.itemId ?? idx,
                PurchaseOrderId: 0,
                ItemId: item.itemId,
                SupplierId: request.supplierId ?? 0,
                Quantity: item.quantity,
                // Spread the rest of the item fields if needed
                ...item,
              }))}
              className="rounded-lg shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="lg:w-96 lg:ml-6 mt-6 lg:mt-0 flex-shrink-0">
        {request.status === "Pending" && (
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-4 py-2 m-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-800 font-semibold">
                Pending Your Approval
              </span>
            </div>
            <div className="text-left px-4 text-sm text-gray-600 mt-2">
              This request requires your review as the Department Head
            </div>
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Request Changes</h2>
            </div>

            {/* Approval Actions */}
            <div className="p-4">
              {/* Comments */}
              <div className="mb-4">
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Add your comments here..."
                />
              </div>
              {request.status === "Pending" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleApproval("APPROVED")}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">✓</span>
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval("REJECTED")}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">✕</span>
                    Reject
                  </button>
                </div>
              )}

              {/* Action Buttons */}
            </div>
          </div>
        )}

        {/* Approval History */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Approval History</h2>
          {request.status === "Approved" && (
            <div className="text-green-600  bg-white p-4 border-l-4 border-green-500 font-semibold">
              This request has already been approved.
            </div>
          )}
          {request.status === "Rejected" && (
            <div className="lg:w-96 lg:ml-6 mt-6 lg:mt-0 flex-shrink-0">
              <div className="text-red-600 bg-white p-4 border-l-4 border-red-500 font-semibold">
                This request has already been rejected.
              </div>
            </div>
          )}
          <div className="space-y-4 mt-2">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold">{request.requesterName}</p>
              <p className="text-sm text-gray-600">
                {new Date(request.deliveryDate).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">Submitted the request</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPurchaseRequisition;
