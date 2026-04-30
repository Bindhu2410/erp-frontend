import React, { useState, useEffect } from "react";
import {
  FaCheck as Check,
  FaTimes as X,
  FaExclamationCircle as AlertCircle,
  FaCheckCircle,
  FaClock as Clock,
  FaUser as User,
  FaPhone as Phone,
  FaCalendar as Calendar,
  FaMapPin as MapPin,
} from "react-icons/fa";

import { LuMail as Mail, LuPackage as Package } from "react-icons/lu";
import api from "../../../services/api";
import { useUser } from "../../../context/UserContext";

interface DemoRequestItem {
  id: string;
  requestId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  productCode: string;
  quantity: number;
  requestedDate: string;
  demoLocation: string;
  salesRepName: string;
  salesRepEmail: string;
  priority: string;
  requestStatus: string;
  submissionDate: string;
  notes: string;
  attachments?: string[];
}

interface DemoRequestState {
  verified: boolean;
  conditionChecked: boolean;
  maintenance: string;
  approved: boolean;
  assignedWarehouse: string;
  assignedRack: string;
  assignedShelf: string;
  notes: string;
  approvalDate: string;
  approvalBy: string;
}

const InventoryReceivesDemoRequest: React.FC = () => {
  const [requests, setRequests] = useState<DemoRequestItem[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<DemoRequestItem | null>(null);
  const [requestState, setRequestState] = useState<DemoRequestState>({
    verified: false,
    conditionChecked: false,
    maintenance: "none",
    approved: false,
    assignedWarehouse: "",
    assignedRack: "",
    assignedShelf: "",
    notes: "",
    approvalDate: new Date().toISOString().split("T")[0],
    approvalBy: "",
  });
  const [filterStatus, setFilterStatus] = useState("pending");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve"
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  // Sample data
  const sampleRequests: DemoRequestItem[] = [
    {
      id: "REQ-001",
      requestId: "REQ-001",
      customerName: "City Hospital",
      customerEmail: "contact@cityhospital.com",
      customerPhone: "+91-422-1234567",
      productName: "Ultrasound Machine Model A",
      productCode: "USM-A-2024",
      quantity: 1,
      requestedDate: "2025-11-28",
      demoLocation: "City Hospital, Coimbatore",
      salesRepName: "Rajesh Kumar",
      salesRepEmail: "rajesh@jbs.com",
      priority: "High",
      requestStatus: "Pending",
      submissionDate: "2025-11-20",
      notes:
        "Customer interested in bulk purchase of 5 units. Demo needed for evaluation.",
      attachments: ["quote-proposal.pdf"],
    },
    {
      id: "REQ-002",
      requestId: "REQ-002",
      customerName: "Health Clinic ABC",
      customerEmail: "admin@healthclinic.com",
      customerPhone: "+91-422-9876543",
      productName: "ECG Monitor Premium",
      productCode: "ECG-P-2024",
      quantity: 2,
      requestedDate: "2025-11-29",
      demoLocation: "Health Clinic, Coimbatore",
      salesRepName: "Priya Sharma",
      salesRepEmail: "priya@jbs.com",
      priority: "Medium",
      requestStatus: "Pending",
      submissionDate: "2025-11-21",
      notes: "Follow-up demo for previous inquiry",
      attachments: [],
    },
    {
      id: "REQ-003",
      requestId: "REQ-003",
      customerName: "Diagnostic Center XYZ",
      customerEmail: "info@diagcenter.com",
      customerPhone: "+91-422-5555555",
      productName: "Digital Thermometer",
      productCode: "DTH-001",
      quantity: 5,
      requestedDate: "2025-11-26",
      demoLocation: "Diagnostic Center, Coimbatore",
      salesRepName: "Amit Patel",
      salesRepEmail: "amit@jbs.com",
      priority: "High",
      requestStatus: "Approved",
      submissionDate: "2025-11-18",
      notes: "Urgent demo request for new clinic setup",
      attachments: [],
    },
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        // const res = await api.get("DemoRequests?status=pending");
        setRequests(sampleRequests);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setRequests(sampleRequests);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setRequestState({
        verified: false,
        conditionChecked: false,
        maintenance: "none",
        approved: false,
        assignedWarehouse: "",
        assignedRack: "",
        assignedShelf: "",
        notes: "",
        approvalDate: new Date().toISOString().split("T")[0],
        approvalBy: user?.userId?.toString() || "",
      });
    }
  }, [selectedRequest, user]);

  const filteredRequests = requests.filter((req) => {
    if (filterStatus === "all") return true;
    return req.requestStatus.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleVerifyProduct = () => {
    setRequestState((prev) => ({
      ...prev,
      verified: !prev.verified,
    }));
  };

  const handleCheckCondition = () => {
    setRequestState((prev) => ({
      ...prev,
      conditionChecked: !prev.conditionChecked,
    }));
  };

  const handleApproveRequest = () => {
    if (!requestState.verified || !requestState.conditionChecked) {
      alert("Please complete verification and condition check first");
      return;
    }
    if (!requestState.assignedWarehouse || !requestState.assignedRack) {
      alert("Please assign warehouse and rack location");
      return;
    }
    setApprovalAction("approve");
    setShowApprovalModal(true);
  };

  const handleRejectRequest = () => {
    setApprovalAction("reject");
    setShowApprovalModal(true);
  };

  const confirmApproval = async () => {
    try {
      const payload = {
        demoRequestId: selectedRequest?.id,
        status: approvalAction === "approve" ? "Approved" : "Rejected",
        verified: requestState.verified,
        conditionChecked: requestState.conditionChecked,
        maintenance: requestState.maintenance,
        assignedWarehouse: requestState.assignedWarehouse,
        assignedRack: requestState.assignedRack,
        assignedShelf: requestState.assignedShelf,
        notes: requestState.notes,
        rejectionReason:
          approvalAction === "reject" ? rejectionReason : undefined,
        approvalDate: requestState.approvalDate,
        approvalBy: requestState.approvalBy,
      };

      // TODO: Replace with actual API call
      // await api.post("DemoRequests/approve", payload);

      console.log("Approval payload:", payload);
      alert(
        `Demo request ${
          approvalAction === "approve" ? "approved" : "rejected"
        } successfully`
      );

      // Update local state
      if (selectedRequest) {
        setRequests(
          requests.map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  requestStatus:
                    approvalAction === "approve" ? "Approved" : "Rejected",
                }
              : req
          )
        );
        setSelectedRequest(null);
      }

      setShowApprovalModal(false);
      setRejectionReason("");
    } catch (err) {
      console.error("Error approving request:", err);
      alert("Failed to process approval");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "In Progress":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Department - Demo Request Processing
          </h1>
          <p className="text-gray-600 mt-2">
            Review, verify, and approve demo requests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Filter Tabs */}
              <div className="border-b p-4 flex gap-2 flex-wrap">
                {["pending", "approved", "all"].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilterStatus(
                        status === "all"
                          ? "all"
                          : status.charAt(0).toUpperCase() + status.slice(1)
                      )
                    }
                    className={`px-3 py-1 rounded text-sm font-medium transition ${
                      (status === "all" && filterStatus === "all") ||
                      (status !== "all" &&
                        filterStatus ===
                          status.charAt(0).toUpperCase() + status.slice(1))
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Request List */}
              <div className="divide-y max-h-[70vh] overflow-y-auto">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 cursor-pointer transition border-l-4 ${
                      selectedRequest?.id === request.id
                        ? "bg-blue-50 border-l-blue-600"
                        : "hover:bg-gray-50 border-l-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {request.customerName}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          request.requestStatus
                        )}`}
                      >
                        {request.requestStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {request.productCode}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {request.requestedDate}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                          request.priority
                        )}`}
                      >
                        {request.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="lg:col-span-2">
            {selectedRequest ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                {/* Request Header */}
                <div className="border-b pb-4 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedRequest.requestId}
                      </h2>
                      <p className="text-gray-600">
                        {selectedRequest.requestStatus}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-semibold ${getPriorityColor(
                        selectedRequest.priority
                      )}`}
                    >
                      {selectedRequest.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Priority Contact</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.salesRepName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone size={14} /> Phone
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.customerPhone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail size={14} /> Email
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.customerEmail}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="mb-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={20} />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Product Name</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.productName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Product Code</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.productCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quantity Required</p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.quantity} Units
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={14} /> Demo Date
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.requestedDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin size={14} /> Demo Location
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedRequest.demoLocation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FaCheckCircle size={20} className="text-blue-600" />
                    Verification & Approval
                  </h3>

                  {/* Verify Product Availability */}
                  <div className="mb-4 pb-4 border-b">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestState.verified}
                        onChange={handleVerifyProduct}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-gray-900 font-medium">
                        ✓ Verify Product Availability
                      </span>
                    </label>
                    <p className="text-xs text-gray-600 ml-8 mt-1">
                      Confirm that product quantity is available for demo
                    </p>
                  </div>

                  {/* Check Product Condition */}
                  <div className="mb-4 pb-4 border-b">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestState.conditionChecked}
                        onChange={handleCheckCondition}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                      <span className="text-gray-900 font-medium">
                        ✓ Check Product Condition / Maintenance
                      </span>
                    </label>
                    <p className="text-xs text-gray-600 ml-8 mt-1">
                      Inspect product for any maintenance issues
                    </p>
                  </div>

                  {/* Maintenance Status */}
                  {requestState.conditionChecked && (
                    <div className="mb-4 pb-4 border-b ml-8">
                      <label className="text-sm text-gray-600 mb-2 block">
                        Maintenance Status
                      </label>
                      <select
                        value={requestState.maintenance}
                        onChange={(e) =>
                          setRequestState((prev) => ({
                            ...prev,
                            maintenance: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="none">No Maintenance Needed</option>
                        <option value="minor">Minor Maintenance</option>
                        <option value="major">
                          Major Maintenance Required
                        </option>
                        <option value="repair">Repair Required</option>
                      </select>
                    </div>
                  )}

                  {/* Assign Product Location */}
                  {requestState.verified && requestState.conditionChecked && (
                    <div className="mb-4 pb-4 border-b">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Assign Product for Demo
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Warehouse
                          </label>
                          <input
                            type="text"
                            value={requestState.assignedWarehouse}
                            onChange={(e) =>
                              setRequestState((prev) => ({
                                ...prev,
                                assignedWarehouse: e.target.value,
                              }))
                            }
                            placeholder="Enter warehouse"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Rack
                          </label>
                          <input
                            type="text"
                            value={requestState.assignedRack}
                            onChange={(e) =>
                              setRequestState((prev) => ({
                                ...prev,
                                assignedRack: e.target.value,
                              }))
                            }
                            placeholder="Enter rack"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600 block mb-1">
                            Shelf
                          </label>
                          <input
                            type="text"
                            value={requestState.assignedShelf}
                            onChange={(e) =>
                              setRequestState((prev) => ({
                                ...prev,
                                assignedShelf: e.target.value,
                              }))
                            }
                            placeholder="Enter shelf (optional)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="text-sm text-gray-600 block mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={requestState.notes}
                      onChange={(e) =>
                        setRequestState((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                      placeholder="Add any special notes or conditions..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Customer Notes */}
                {selectedRequest.notes && (
                  <div className="mb-6 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle size={18} className="text-yellow-600" />
                      Customer Notes
                    </h4>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedRequest.requestStatus === "Pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleApproveRequest}
                      disabled={
                        !requestState.verified || !requestState.conditionChecked
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                    >
                      <Check size={20} />
                      Approve Request
                    </button>
                    <button
                      onClick={handleRejectRequest}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      <X size={20} />
                      Reject Request
                    </button>
                  </div>
                )}

                {selectedRequest.requestStatus !== "Pending" && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center text-gray-600">
                    This request has already been{" "}
                    <span className="font-semibold">
                      {selectedRequest.requestStatus}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Request
                </h3>
                <p className="text-gray-600">
                  Choose a demo request from the list to view details and
                  process approval
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {approvalAction === "approve"
                  ? "Confirm Approval"
                  : "Confirm Rejection"}
              </h3>

              {approvalAction === "reject" && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 block mb-2">
                    Reason for Rejection
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              )}

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Request ID:</strong> {selectedRequest?.requestId}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Customer:</strong> {selectedRequest?.customerName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Product:</strong> {selectedRequest?.productCode}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium ${
                    approvalAction === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {approvalAction === "approve" ? "Approve" : "Reject"} Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReceivesDemoRequest;
