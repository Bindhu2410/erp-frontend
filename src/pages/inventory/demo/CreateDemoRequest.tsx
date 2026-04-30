import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft as ArrowLeft,
  FaEye as Eye,
  FaTrashAlt as Trash2,
  FaExclamationCircle as AlertCircle,
  FaClock as Clock,
  FaUser as User,
  FaPhone as Phone,
  FaMapPin as MapPin,
  FaBox as Package,
  FaCalendar as Calendar,
} from "react-icons/fa";

import { LuBadge as Badge, LuMail as Mail } from "react-icons/lu";
import api from "../../../services/api";
import { useUser } from "../../../context/UserContext";

interface DemoRequestItem {
  id: number;
  itemId: number | null;
  qty: number;
  amount: number | null;
  unitPrice: number | null;
  itemCode: string | null;
  itemName: string | null;
  catNo: string | null;
  hsnCode: string | null;
  taxPercentage: number | null;
  brand: string | null;
  specification: string | null;
}

interface DemoRequest {
  id: number;
  status: string;
  customer_name: string;
  demo_date: string;
  demo_contact: string;
  demo_name: string;
  demo_approach: string;
  address: string;
  contact_mobile_num: string;
  lead_id: string;
  opportunity_id: string;
  comments: string;
  user_created: number;
  date_created: string;
  items: string; // JSON string of DemoRequestItem[]
}

const CreateDemoRequest: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(
    null
  );
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangeDateModal, setShowChangeDateModal] = useState(false);
  const [pendingActionRequestId, setPendingActionRequestId] = useState<
    number | null
  >(null);
  const [newStartDate, setNewStartDate] = useState<string>("");
  const [newEndDate, setNewEndDate] = useState<string>("");
  const [actionReason, setActionReason] = useState<string>("");
  const [opportunityProducts, setOpportunityProducts] = useState<any[]>([]);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  const parseItems = (itemsString: string): DemoRequestItem[] => {
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

  const getItemsCount = (itemsString: string): number => {
    const items = parseItems(itemsString);
    return items.reduce((sum, item) => sum + item.qty, 0);
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("SalesDemo/with-items");
        // If the API returns a list, set as is. If it returns a single object, map it to a list.
        if (Array.isArray(res.data)) {
          // If your API ever returns a list, map each item to the correct shape
          setDemoRequests(res.data.map((d: any) => ({
            id: d.demo?.id ?? d.id,
            status: d.demo?.status ?? d.status,
            customer_name: d.demo?.customerName ?? d.customerName ?? "",
            demo_date: d.demo?.demoDate ?? d.demoDate ?? "",
            demo_contact: d.demo?.demoContact ?? d.demoContact ?? "",
            demo_name: d.demo?.demoName ?? d.demoName ?? "",
            demo_approach: d.demo?.demoApproach ?? d.demoApproach ?? "",
            address: d.demo?.address ?? d.address ?? "",
            contact_mobile_num: d.demo?.contactMobileNum ?? d.contactMobileNum ?? "",
            lead_id: d.demo?.leadId ?? d.leadId ?? "",
            opportunity_id: d.demo?.opportunityId ?? d.opportunityId ?? "",
            comments: d.demo?.comments ?? d.comments ?? "",
            user_created: d.demo?.userCreated ?? d.userCreated ?? 0,
            date_created: d.demo?.dateCreated ?? d.dateCreated ?? "",
            items: JSON.stringify((d.items || []).map((item: any) => ({
              ...item,
              itemId: item.itemId ?? item.item_id ?? item.id ?? null,
            }))),
          })));
        } else if (res.data && res.data.demo) {
          const demo = res.data.demo;
          setDemoRequests([
            {
              id: demo.id,
              status: demo.status,
              customer_name: demo.customerName ?? "",
              demo_date: demo.demoDate ?? "",
              demo_contact: demo.demoContact ?? "",
              demo_name: demo.demoName ?? "",
              demo_approach: demo.demoApproach ?? "",
              address: demo.address ?? "",
              contact_mobile_num: demo.contactMobileNum ?? "",
              lead_id: demo.leadId ?? "",
              opportunity_id: demo.opportunityId ?? "",
              comments: demo.comments ?? "",
              user_created: demo.userCreated ?? 0,
              date_created: demo.dateCreated ?? "",
              items: JSON.stringify((res.data.items || []).map((item: any) => ({
                ...item,
                itemId: item.itemId ?? item.item_id ?? item.id ?? null,
              }))),
            },
          ]);
        } else {
          setDemoRequests([]);
        }
      } catch (err) {
        console.error("Error fetching demo requests:", err);
        setDemoRequests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = demoRequests.filter((req) => {
    const matchesStatus = filterStatus === "All" || req.status === filterStatus;
    const customerName = (req.customer_name || "").toLowerCase();
    const leadId = (req.lead_id || "").toLowerCase();
    const opportunityId = (req.opportunity_id || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      customerName.includes(search) ||
      leadId.includes(search) ||
      opportunityId.includes(search);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Demo Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600";
      case "Medium":
        return "text-orange-600";
      case "Low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const handleDeleteRequest = async (requestId: number) => {
    try {
      await api.delete(`DemoRequest/${requestId}`);
      setDemoRequests(demoRequests.filter((req) => req.id !== requestId));
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to delete request", err);
      alert("Failed to delete request");
    }
  };

  const handleCardClick = (request: DemoRequest) => {
    setSelectedRequest(request);
    setOpportunityProducts([]);
    if (request.opportunity_id) fetchOpportunityProducts(request.opportunity_id);
  };

  const fetchOpportunityProducts = async (opportunityStrId: string) => {
    setIsFetchingProducts(true);
    try {
      // Step 1: find numeric ID by matching opportunity_id string
      const listRes = await api.get("SalesOpportunity/with-items");
      const found = (listRes.data as any[]).find(
        (o) =>
          o.opportunity?.opportunity_id === opportunityStrId ||
          o.opportunity?.opportunityId === opportunityStrId
      );
      if (!found) return;
      const numericId = found.opportunity?.id;
      if (!numericId) return;

      // Step 2: fetch full opportunity with products by numeric ID
      const res = await api.get(`SalesOpportunity/with-items/by-id/${numericId}`);
      const items = res.data?.items || res.data?.salesItems || [];
      setOpportunityProducts(items);
    } catch (err) {
      console.error("Failed to fetch opportunity products", err);
    } finally {
      setIsFetchingProducts(false);
    }
  };

  // Navigate to check-availability first; approval happens from there
  const openApproveModal = (request: DemoRequest) => {
    const items = parseItems(request.items);
    const firstItem = items[0] as any;
    const itemId = firstItem?.itemId ?? firstItem?.item_id ?? firstItem?.id ?? '';
    navigate(`/inventory/demo/check-availability?itemId=${itemId}&demoId=${request.id}&action=approve`);
  };

  // Open reject modal (collect reason)
  const openRejectModal = (request: DemoRequest) => {
    setPendingActionRequestId(request.id);
    setActionReason("");
    setShowRejectModal(true);
  };

  // Open change-date modal (send change date request)
  const openChangeDateModal = (request: DemoRequest) => {
    setPendingActionRequestId(request.id);
    setNewStartDate(request.demo_date.split('T')[0]);
    setActionReason("");
    setShowChangeDateModal(true);
  };

  const handleApproveConfirmed = async () => {
    // This function is no longer needed as approval is handled directly in openApproveModal
    // Keeping for backward compatibility
    if (!pendingActionRequestId) return;
    try {
      await api.put(`DemoRequest/${pendingActionRequestId}/status`, {
        Status: "Approved",
        ApprovedDate: new Date(newStartDate).toISOString(),
        Notes: actionReason || "Demo request approved",
      });
      // Refresh the list
      const res = await api.get("DemoRequest");
      setDemoRequests(res.data);
      // Switch to Approved tab
      setFilterStatus("Approved");
    } catch (err) {
      console.error("Approve API failed", err);
    }
    setShowApproveModal(false);
    setPendingActionRequestId(null);
  };

  const handleRejectConfirmed = async () => {
    if (!pendingActionRequestId) return;
    try {
      await api.put(`DemoRequest/${pendingActionRequestId}/status`, {
        Status: "Rejected",
      });
      // Refresh the list
      const res = await api.get("DemoRequest");
      setDemoRequests(res.data);
      // Switch to Rejected tab
      setFilterStatus("Rejected");
    } catch (err) {
      console.error("Reject API failed", err);
    }
    setShowRejectModal(false);
    setPendingActionRequestId(null);
  };

  const handleSendChangeDateRequest = async () => {
    if (!pendingActionRequestId) return;
    try {
      await api.put(`DemoRequest/${pendingActionRequestId}/status`, {
        Status: "Reschedule",
        RescheduleDate: new Date(newStartDate).toISOString(),
        Notes: actionReason,
      });
      
      // Refresh the list
      const res = await api.get("DemoRequest");
      setDemoRequests(res.data);
      alert("Demo rescheduled successfully");
    } catch (err) {
      console.error("Failed to reschedule demo", err);
      alert("Failed to reschedule demo");
    }
    setShowChangeDateModal(false);
    setPendingActionRequestId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/inventory/demo/check-availability")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Availability
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Demo Requests
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage all demo requests ({filteredRequests.length})
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by customer, product, or request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {["All", "Demo Requested", "Approved", "Rejected", "Completed"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filterStatus === status
                          ? "bg-blue-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Request Cards */}
            {isLoading ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Loading demo requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No demo requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => handleCardClick(request)}
                    className={`bg-white rounded-lg shadow-md p-5 cursor-pointer transition hover:shadow-lg ${
                      selectedRequest?.id === request.id
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.customer_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.lead_id} | {request.opportunity_id}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Package size={16} />
                        <span>{getItemsCount(request.items)} items</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Badge size={16} />
                        <span>{request.demo_approach}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={16} />
                        <span>{new Date(request.demo_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} />
                        <span>{(request.address || "").substring(0, 30)}...</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-500">
                        Created: {new Date(request.date_created).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition"
                          title="View details"
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRequest(request.id);
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition"
                          title="Delete request"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Details Panel */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Request Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Request ID
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      #{selectedRequest.id}
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      Customer Information
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-600" />
                        <span>{selectedRequest.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-600" />
                        <span>Contact: {selectedRequest.demo_contact}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-600" />
                        <a
                          href={`tel:${selectedRequest.contact_mobile_num}`}
                          className="text-blue-600 hover:underline"
                        >
                          {selectedRequest.contact_mobile_num}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-600" />
                        <span>{selectedRequest.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      Demo Details
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Demo Type</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.demo_approach}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lead ID</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.lead_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Opportunity ID</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.opportunity_id}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      Demo Items
                    </p>
                    {selectedRequest.items && parseItems(selectedRequest.items).length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {parseItems(selectedRequest.items).map((item: any, index: number) => (
                          <div key={index} className="bg-gray-50 p-3 rounded text-sm border">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                              <div>
                                <div className="font-medium text-gray-900">{item.itemName || 'Unnamed'}</div>
                                <div className="text-xs text-gray-500">{item.itemCode && `Code: ${item.itemCode}`} {item.categoryName && `| Category: ${item.categoryName}`}</div>
                                <div className="text-xs text-gray-500">{item.make && `Make: ${item.make}`} {item.model && `| Model: ${item.model}`}</div>
                                <div className="text-xs text-gray-500">{item.uomName && `UOM: ${item.uomName}`}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium text-gray-900">Qty: {item.quantity ?? item.qty ?? 1}</div>
                                {typeof item.unitPrice !== 'undefined' && (
                                  <div className="text-xs text-gray-600">Unit Price: ₹{item.unitPrice}</div>
                                )}
                                {typeof item.taxPercentage !== 'undefined' && (
                                  <div className="text-xs text-gray-600">Tax: {item.taxPercentage}%</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No items found for this demo.</p>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      Schedule
                    </p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-gray-600">Demo Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedRequest.demo_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(selectedRequest.date_created).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedRequest.comments && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                        Comments
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedRequest.comments}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Status
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          selectedRequest.status
                        )}`}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>

                  {(selectedRequest.status === "Demo Requested" || selectedRequest.status === "Requested") && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                        Actions
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openApproveModal(selectedRequest)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openChangeDateModal(selectedRequest)}
                          className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium text-sm"
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedRequest.status === "Approved" || selectedRequest.status === "Rejected" || selectedRequest.status === "Completed") && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                        Request Status
                      </p>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          This request has been {selectedRequest.status.toLowerCase()} and no further actions are available.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
                <p>Select a request to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Reject Request</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this request.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-gray-600 mb-1">Reason</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                rows={4}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setPendingActionRequestId(null);
                }}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Date Request Modal */}
      {showChangeDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">
              Reschedule Demo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Reschedule the demo to a new date and provide a reason. A task will be created for follow-up.
            </p>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-gray-600">
                  New Demo Date
                </label>
                <input
                  type="date"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Reason</label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  rows={3}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowChangeDateModal(false);
                  setPendingActionRequestId(null);
                }}
                className="px-4 py-2 bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSendChangeDateRequest}
                className="px-4 py-2 bg-yellow-600 text-white rounded"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDemoRequest;
