import React, { useEffect, useState } from "react";
import DeliveryChallanModal from "./DeliveryChallanModal";
import api from "../../services/api";
import { MdModeOfTravel } from "react-icons/md";
import { DeliveryForm } from "./DeliveryForm";
import { toast } from "react-toastify";

interface Delivery {
  Id: number;
  UserCreated: number;
  DateCreated: string;
  dateCreated?: string;
  UserUpdated: number;
  DateUpdated: string;
  InvoiceId: string;
  SalesOrderId: string;
  delivery: delivery;
  items?: any[]; // Assuming items is an array of delivery items
}

interface delivery {
  dateCreated: string;
  DateCreated: string;
  poId: string;
  deliveryId: string;
  deliveryDate: string;
  deliveryStatus: string;
  dispatchAddress: string;
  modeOfDelivery: string;
  deliveryNotes: string;
  priority: string;
  carrier: string;
}

interface DeliveryManagementProps {
  purchaseOrderId?: string;
  lineItems?: any[];
}

export const DeliveryManagement: React.FC<DeliveryManagementProps> = ({
  purchaseOrderId,
  lineItems,
}) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingInvoice, setGeneratingInvoice] = useState<string | null>(
    null
  );
  const [showChallanModal, setShowChallanModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<any | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshDeliveries = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Helper to map delivery to challanData for modal
  const getChallanData = (delivery: Delivery) => {
    return {
      challanNumber: delivery.delivery.deliveryId,
      deliveryNumber: delivery.delivery.deliveryId,
      consigneeAddress: delivery.delivery.dispatchAddress,
      modeOfDelivery: delivery.delivery.modeOfDelivery,
      challanDate: delivery.delivery.deliveryDate,
      poNumber: delivery.delivery.poId,
      purposeOfDelivery: delivery.delivery.deliveryNotes,
      itemDetails: lineItems || [],
    };
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      if (!purchaseOrderId) return;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/Delivery/by-purchaseorder/${purchaseOrderId}`
        );
        if (!response.ok) {
          // If status is 404, do not show error or toast, just treat as no deliveries
          if (response.status === 404) {
            setDeliveries([]);
            setError(null);
            return;
          }
          throw new Error("Failed to fetch deliveries");
        }
        const data = await response.json();
        setDeliveries(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch deliveries"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, [purchaseOrderId, refreshTrigger]);

  const getProgressWidth = (status?: string) => {
    if (!status) return "10%";
    switch (status.toLowerCase()) {
      case "delivered":
        return "100%";
      case "in transit":
        return "75%";
      case "ready to ship":
        return "50%";
      case "preparing":
        return "25%";
      default:
        return "10%";
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "from-gray-400 to-gray-500";
    switch (status.toLowerCase()) {
      case "delivered":
        return "from-green-400 to-green-600";
      case "in transit":
        return "from-blue-400 to-blue-600";
      case "ready to ship":
        return "from-yellow-400 to-yellow-600";
      case "preparing":
        return "from-orange-400 to-orange-600";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return "bg-gray-500";
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-500";
      case "in transit":
        return "bg-blue-500";
      case "ready to ship":
        return "bg-yellow-500";
      case "preparing":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority?: string) => {
    if (!priority) return "bg-gray-500";
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleGenerateInvoice = async (
    deliveryId: string,
    salesOrderId: string
  ) => {
    setGeneratingInvoice(deliveryId);
    try {
      const response = await api.post(
        `Invoice`,
        {
          DeliveryId: deliveryId,
        },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            deliveryId,
            salesOrderId,
            purchaseOrderId,
          }),
        }
      );

      if (response.status >= 400) {
        throw new Error("Failed to generate invoice");
      }

      const result = response.data || response;

      // Show success message or handle the response
      toast.success(
        `Invoice generated successfully! Invoice ID: ${result.invoiceId}`
      );

      // Refresh deliveries to get updated data
      refreshDeliveries();
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice. Please try again.");
    } finally {
      setGeneratingInvoice(null);
    }
  };
  console.log(deliveries, "ddsss:::");
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading deliveries...</p>
        </div>
      </div>
    );
  }
  // Delivery Form Modal for View Details
  // Place this at the top of the return so it's always rendered in the DOM tree
  const renderDeliveryFormModal = () =>
    showDeliveryForm &&
    selectedDelivery && (
      <DeliveryForm
        deliveryData={selectedDelivery}
        onClose={() => {
          setShowDeliveryForm(false);
          setSelectedDelivery(null);
        }}
        onSuccess={() => {
          setShowDeliveryForm(false);
          setSelectedDelivery(null);
          refreshDeliveries();
        }}
        poId={purchaseOrderId}
      />
    );

  console.log(selectedDelivery, "deliveries data");

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Delivery Challan Modal for Print */}
      {showChallanModal && selectedChallan && (
        <DeliveryChallanModal
          challanData={selectedChallan}
          onClose={() => {
            setShowChallanModal(false);
            setSelectedChallan(null);
          }}
          onSave={() => {
            setShowChallanModal(false);
            setSelectedChallan(null);
          }}
        />
      )}
      {/* Delivery Form Modal for View Details */}
      {renderDeliveryFormModal()}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Delivery Management
                </h1>
                <p className="text-gray-600">
                  Purchase Order:{" "}
                  <span className="font-semibold text-blue-600">
                    {purchaseOrderId}
                  </span>
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    {deliveries.length}{" "}
                    {deliveries.length === 1 ? "Delivery" : "Deliveries"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        {/* {lineItems && lineItems.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Order Items
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Item Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {lineItems.map((item, idx) => (
                      <React.Fragment key={idx}>
                        <tr className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 text-sm">
                              {item.itemCode || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 text-sm">
                              {item.itemName || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {item.qty || "N/A"}
                            </span>
                          </td>
                        </tr>
                        {item.includedChildItems &&
                          item.includedChildItems.length > 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 bg-blue-50">
                                <div className="border-l-4 border-blue-400 pl-4">
                                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                      />
                                    </svg>
                                    Product Accessories
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {item.includedChildItems.map(
                                      (acc: any, accIdx: number) => (
                                        <div
                                          key={accIdx}
                                          className="text-sm text-blue-700 bg-white rounded-lg px-3 py-2 border border-blue-200"
                                        >
                                          {acc.itemName}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}

        {/* Deliveries Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Delivery Tracking
            </h2>
            <p className="text-gray-600">
              Monitor and manage all delivery schedules
            </p>
          </div>

          {deliveries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Deliveries Found
              </h3>
              <p className="text-gray-600">
                There are no deliveries associated with this purchase order yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deliveries.map((delivery, index) => (
                <div
                  key={delivery.Id || index}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            Delivery #
                            {delivery?.delivery.deliveryId?.slice(-6) || "N/A"}
                          </h3>
                          <p className="text-slate-300 text-sm">
                            Order: {delivery?.delivery.poId || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {delivery?.delivery.priority && (
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${getPriorityColor(
                              delivery.delivery.priority
                            )}`}
                          >
                            {delivery.delivery.priority?.toUpperCase()}
                          </span>
                        )}
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${getStatusBadgeColor(
                            delivery?.delivery.deliveryStatus
                          )}`}
                        >
                          {delivery?.delivery.deliveryStatus || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Progress Section */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700">
                          Delivery Progress
                        </span>
                        <span className="text-sm font-medium text-gray-500">
                          {getProgressWidth(delivery?.delivery.deliveryStatus)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getStatusColor(
                            delivery?.delivery.deliveryStatus
                          )} transition-all duration-500 ease-out rounded-full`}
                          style={{
                            width: getProgressWidth(
                              delivery?.delivery.deliveryStatus
                            ),
                          }}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v1a2 2 0 002 2h4a2 2 0 002-2V7m-6 0H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              Delivery Date
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {delivery?.delivery.deliveryDate
                                ? new Date(
                                    delivery.delivery.deliveryDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "To Be Determined"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              Mode of delivery
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                              {delivery?.delivery.modeOfDelivery ||
                                "Not Assigned"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              Shipping Address
                            </p>
                            <p className="text-sm font-medium text-gray-900 break-words">
                              {delivery?.delivery.dispatchAddress ||
                                "Address not specified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {delivery?.delivery.deliveryNotes && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-amber-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                              Delivery Notes
                            </p>
                            <p className="text-sm text-amber-800">
                              {delivery.delivery.deliveryNotes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className=" grid grid-cols-3 pt-4 border-t border-gray-200 gap-2 sm:gap-4">
                      {/* Generate Invoice Button */}
                      <button
                        onClick={() =>
                          handleGenerateInvoice(
                            delivery.delivery.deliveryId,
                            delivery.SalesOrderId
                          )
                        }
                        disabled={
                          generatingInvoice === delivery.delivery.deliveryId ||
                          !!delivery.InvoiceId
                        }
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                        title={
                          delivery.InvoiceId ? "Invoice already generated" : ""
                        }
                      >
                        {delivery.InvoiceId ? (
                          <>Invoice Generated</>
                        ) : generatingInvoice ===
                          delivery.delivery.deliveryId ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>Generate Invoice</>
                        )}
                      </button>

                      {/* Print Challan Button */}
                      <button
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-1 border-2 border-green-500 text-sm font-bold rounded-xl text-green-700 bg-white hover:bg-green-50 hover:border-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                        onClick={() => {
                          setSelectedChallan(getChallanData(delivery));
                          setShowChallanModal(true);
                        }}
                        title="Print Delivery Challan"
                      >
                        Print Challan
                      </button>

                      {/* View Details Button */}
                      <button
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border-2 border-gray-300 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105"
                        onClick={() => {
                          setSelectedDelivery({
                            ...delivery.delivery,
                            Id: delivery.Id,
                            deliveryDate: delivery.delivery.deliveryDate,
                            UserCreated: delivery.UserCreated,
                            DateCreated: delivery.DateCreated,
                            UserUpdated: delivery.UserUpdated,
                            DateUpdated: delivery.DateUpdated,
                            InvoiceId: delivery.InvoiceId,
                            SalesOrderId: delivery.SalesOrderId,
                            Items: delivery.items || [],
                          });
                          setShowDeliveryForm(true);
                        }}
                      >
                        View Details
                      </button>
                    </div>

                    <div className="text-xs text-gray-500 text-right mt-3">
                      <span className="font-medium">Created:</span>{" "}
                      {new Date(
                        delivery.delivery.DateCreated ??
                          delivery.delivery.dateCreated ??
                          ""
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
