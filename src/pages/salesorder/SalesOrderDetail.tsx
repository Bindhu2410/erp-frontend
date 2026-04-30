import React, { useState } from "react";
import {
  LuCalendar as Calendar,
  LuTruck as Truck,
  LuPackage as Package,
  LuFileText as FileText,
  LuClock as Clock,
  LuChevronDown as ChevronDown,
  LuChevronUp as ChevronUp,
  LuCircle as Circle,
  LuAlertCircle as AlertCircle,
  LuCheckCircle as CheckCircle,
  LuBarChart2 as BarChart2,
  LuUpload as Upload,
} from "react-icons/lu";
import DispatchReadyItemsModal from "./DispatchReadyItem";
import SOVsPOComparison from "../sales-order/ComparePOandSO";
interface FulfillmentItem {
  product: string;
  unitPrice: number;
  ordered: number;
  ready: number;
  manufacturing: number;
  vendor: number;
  vendorDetails: {
    name: string;
    phone: string;
    email: string;
    orderRef: string;
    orderDate: string;
    expectedDate: string;
  };
  status: string;
  totalPrice: number;
}

const SalesOrderDetail = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [expandedSection, setExpandedSection] = useState("all");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showPOComparison, setShowPOComparison] = useState(false);
  const [uploadedPOData, setUploadedPOData] = useState<any>(null);
  const [isUploadingPO, setIsUploadingPO] = useState(false);
  // Update the state initialization
  const order = {
    id: "SO-2025-00123",
    customer: "ABC Industries",
    customerDetails: {
      contactPerson: "John Smith",
      email: "john@abcindustries.com",
      phone: "555-123-4567",
    },
    orderDate: "May 10, 2025",
    expectedDelivery: "June 5, 2025",
    status: "Partially Fulfilled",
    totalAmount: 28500,
    paidAmount: 14250,
    balance: 14250,
    fulfillment: [
      {
        product: "Product A",
        unitPrice: 75,
        ordered: 100,
        ready: 30,
        manufacturing: 50,
        vendor: 20,
        vendorDetails: {
          name: "VendorX",
          phone: "123-456-7890",
          email: "orders@vendorx.com",
          orderRef: "VX-8721",
          orderDate: "May 12, 2025",
          expectedDate: "May 28, 2025",
        },
        status: "Partially",
        totalPrice: 7500,
      },
      {
        product: "Product B",
        unitPrice: 85,
        ordered: 200,
        ready: 150,
        manufacturing: 0,
        vendor: 50,
        vendorDetails: {
          name: "VendorY",
          phone: "555-000-1111",
          email: "supply@vendory.com",
          orderRef: "VY-2209",
          orderDate: "May 11, 2025",
          expectedDate: "May 25, 2025",
        },
        status: "Ready +",
        totalPrice: 17000,
      },
      {
        product: "Product C",
        unitPrice: 80,
        ordered: 50,
        ready: 20,
        manufacturing: 30,
        vendor: 0,
        vendorDetails: {
          name: "-",
          phone: "-",
          email: "-",
          orderRef: "-",
          orderDate: "-",
          expectedDate: "-",
        },
        status: "In Production",
        totalPrice: 4000,
      },
    ],
    manufacturingTracker: [
      {
        workOrder: "WO-1002",
        product: "Product A",
        qty: 50,
        startDate: "05/18/2025",
        eta: "05/25/2025",
        status: "In Progress",
        completedQty: 15,
        assignedTo: "Production Team A",
        priority: "High",
      },
      {
        workOrder: "WO-1003",
        product: "Product C",
        qty: 30,
        startDate: "05/15/2025",
        eta: "05/28/2025",
        status: "In Progress",
        completedQty: 10,
        assignedTo: "Production Team C",
        priority: "Medium",
      },
    ],
  };
  const [orders, setOrder] = useState<{
    // ... add proper type definitions for all order properties ...
    fulfillment: FulfillmentItem[];
  }>(order);

  const getStatusColor = (status: any) => {
    switch (status) {
      case "Ready +":
        return "bg-green-100 text-green-700";
      case "Partially":
        return "bg-yellow-100 text-yellow-700";
      case "In Production":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "Ready +":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Partially":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "In Production":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getManuStatusColor = (status: any) => {
    switch (status) {
      case "In Progress":
        return "bg-green-100 text-green-700";
      case "Not Created":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const toggleSection = (section: any) => {
    setExpandedSection(expandedSection === section ? "all" : section);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Update the order state handling
  const handleConfirmDispatch = (
    dispatchedItems: Array<{ product: string; quantity: number }>
  ) => {
    setOrder((prev) => ({
      ...prev,
      fulfillment: prev.fulfillment.map((fulfillmentItem) => {
        const dispatched = dispatchedItems.find(
          (d) => d.product === fulfillmentItem.product
        );
        if (dispatched) {
          return {
            ...fulfillmentItem,
            ready: fulfillmentItem.ready - dispatched.quantity,
          };
        }
        return fulfillmentItem;
      }),
    }));
  };

  // Handle PO file upload
  const handlePOUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingPO(true);
    try {
      // Here you would typically upload the file to your backend
      // For now, we'll simulate the upload and create mock PO data
      const mockPOData = {
        purchaseOrder: {
          reference: "PO-2025-001",
          date: "2025-07-11",
          to: {
            company: "ABC Industries",
            address: "123 Business St, City, State 12345",
          },
          items: [
            {
              description: "Product A",
              qty: 100,
              rate: 75,
              accessories: {
                consumables: ["Item 1", "Item 2"],
                vesselSealing: ["Seal A", "Seal B"],
              },
            },
          ],
          termsAndConditions: {
            payment: "Net 30 days",
            delivery: "FOB Destination",
            warranty: "1 year",
          },
        },
      };

      setUploadedPOData(mockPOData);
      setShowPOComparison(true);
    } catch (error) {
      console.error("Error uploading PO:", error);
      alert("Failed to upload PO file. Please try again.");
    } finally {
      setIsUploadingPO(false);
      // Reset the file input
      event.target.value = "";
    }
  };

  // Handle closing the PO comparison
  const handleClosePOComparison = () => {
    setShowPOComparison(false);
    setUploadedPOData(null);
  };

  // Convert current order to SO data format for comparison
  const getSalesOrderData = () => {
    return {
      salesOrder: {
        reference: order.id,
        date: order.orderDate,
        to: {
          company: order.customer,
          address: order.customerDetails.email, // Using email as placeholder for address
        },
        items: order.fulfillment.map((item) => ({
          description: item.product,
          qty: item.ordered,
          rate: item.unitPrice,
          accessories: {
            consumables: [],
            vesselSealing: [],
          },
        })),
        termsAndConditions: {
          payment: "Standard terms",
          delivery: order.expectedDelivery,
          warranty: "Standard warranty",
        },
      },
    };
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 rounded-xl shadow-md">
      {/* Header */}
      <div className="bg-white p-6 rounded-t-xl border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Sales Order #{order.id}
            </h2>
            <div className="flex items-center mt-1">
              <span className="font-medium text-gray-700">
                {order.customer}
              </span>
              <span
                className={`ml-3 text-sm px-3 py-1 rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end">
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Order Date: {order.orderDate}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Truck className="w-4 h-4 mr-1" />
              <span>Expected Delivery: {order.expectedDelivery}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
            <div className="text-xl font-bold text-gray-800">
              {formatCurrency(order.totalAmount)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Paid</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(order.paidAmount)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Balance</div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(order.balance)}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "all"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Items
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "manufacturing"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("manufacturing")}
          >
            Manufacturing
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "vendor"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("vendor")}
          >
            Vendor Sourced
          </button>
        </div>

        {/* Product Fulfillment Section */}
        {(activeTab === "all" ||
          activeTab === "manufacturing" ||
          activeTab === "vendor") && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection("fulfillment")}
            >
              <div className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="font-semibold text-gray-800">
                  Product Fulfillment
                </h3>
              </div>
              {expandedSection === "fulfillment" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "fulfillment" && (
              <div className="p-4 pt-0">
                <div className="w-full">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4">
                    {order.fulfillment.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Product</p>
                            <p className="font-bold text-gray-800">{item.product}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Total Price</p>
                            <p className="font-semibold text-gray-800">{formatCurrency(item.totalPrice)}</p>
                            <div className="flex items-center justify-end mt-1">
                              {getStatusIcon(item.status)}
                              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-2">
                          <div><span className="text-gray-500">Unit Price:</span> {formatCurrency(item.unitPrice)}</div>
                          <div><span className="text-gray-500">Ordered:</span> {item.ordered}</div>
                          <div><span className="text-gray-500">Ready:</span> {item.ready}</div>
                          <div><span className="text-gray-500">Manu.:</span> {item.manufacturing}</div>
                          <div><span className="text-gray-500">Vendor:</span> {item.vendor}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left font-medium text-gray-600">Product</th>
                          <th className="p-3 text-left font-medium text-gray-600">Unit Price</th>
                          <th className="p-3 text-left font-medium text-gray-600">Ordered</th>
                          <th className="p-3 text-left font-medium text-gray-600">Ready</th>
                          <th className="p-3 text-left font-medium text-gray-600">Manufacturing</th>
                          <th className="p-3 text-left font-medium text-gray-600">Vendor</th>
                          <th className="p-3 text-left font-medium text-gray-600">Total</th>
                          <th className="p-3 text-left font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.fulfillment.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 font-medium">{item.product}</td>
                            <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="p-3">{item.ordered}</td>
                            <td className="p-3">{item.ready}</td>
                            <td className="p-3">{item.manufacturing}</td>
                            <td className="p-3">{item.vendor}</td>
                            <td className="p-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                            <td className="p-3">
                              <div className="flex items-center">
                                {getStatusIcon(item.status)}
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manufacturing Tracker Section */}
        {(activeTab === "all" || activeTab === "manufacturing") && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection("manufacturing")}
            >
              <div className="flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="font-semibold text-gray-800">
                  Manufacturing Tracker
                </h3>
              </div>
              {expandedSection === "manufacturing" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "manufacturing" && (
              <div className="p-4 pt-0">
                <div className="w-full">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4">
                    {order.manufacturingTracker.map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">{item.workOrder}</p>
                            <p className="font-bold text-gray-800">{item.product}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getManuStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-100 pt-2">
                          <div><span className="text-gray-500">Qty:</span> {item.qty}</div>
                          <div><span className="text-gray-500">Completed:</span> {item.completedQty}</div>
                          <div><span className="text-gray-500">Start:</span> {item.startDate}</div>
                          <div><span className="text-gray-500">ETA:</span> {item.eta}</div>
                          <div className="col-span-2 flex items-center justify-between mt-1 pt-1 border-t border-gray-50">
                            <span className="text-gray-600 text-xs truncate max-w-[60%]">{item.assignedTo}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              item.priority === "High" ? "bg-red-100 text-red-700" : item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left font-medium text-gray-600">Work Order</th>
                          <th className="p-3 text-left font-medium text-gray-600">Product</th>
                          <th className="p-3 text-left font-medium text-gray-600">Quantity</th>
                          <th className="p-3 text-left font-medium text-gray-600">Completed</th>
                          <th className="p-3 text-left font-medium text-gray-600">Start Date</th>
                          <th className="p-3 text-left font-medium text-gray-600">ETA</th>
                          <th className="p-3 text-left font-medium text-gray-600">Assigned To</th>
                          <th className="p-3 text-left font-medium text-gray-600">Priority</th>
                          <th className="p-3 text-left font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.manufacturingTracker.map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 font-medium">{item.workOrder}</td>
                            <td className="p-3">{item.product}</td>
                            <td className="p-3">{item.qty}</td>
                            <td className="p-3">{item.completedQty}</td>
                            <td className="p-3">{item.startDate}</td>
                            <td className="p-3">{item.eta}</td>
                            <td className="p-3">{item.assignedTo}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.priority === "High" ? "bg-red-100 text-red-700" : item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                              }`}>
                                {item.priority}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getManuStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 flex items-center">
                  <div className="bg-gray-100 h-2 flex-grow rounded-full">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm text-gray-600">
                    40% Complete
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Vendor Details Section */}
        {(activeTab === "all" || activeTab === "vendor") && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div
              className="flex justify-between items-center p-4 cursor-pointer"
              onClick={() => toggleSection("vendor")}
            >
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="font-semibold text-gray-800">Vendor Details</h3>
              </div>
              {expandedSection === "vendor" ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </div>

            {expandedSection === "vendor" && (
              <div className="p-4 pt-0">
                <div className="w-full">
                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4">
                    {order.fulfillment.filter((item) => item.vendor > 0).map((item, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{item.product}</p>
                            <p className="text-xs text-blue-600">{item.vendorDetails.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 uppercase font-semibold">Qty</p>
                            <p className="text-sm font-semibold">{item.vendor}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
                          <div><span className="text-gray-500">Order Ref:</span> <br/>{item.vendorDetails.orderRef}</div>
                          <div><span className="text-gray-500">Dates:</span> <br/>{item.vendorDetails.orderDate} to {item.vendorDetails.expectedDate}</div>
                          <div className="col-span-2"><span className="text-gray-500">Contact:</span> {item.vendorDetails.phone} | {item.vendorDetails.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table Layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-3 text-left font-medium text-gray-600">Product</th>
                          <th className="p-3 text-left font-medium text-gray-600">Vendor</th>
                          <th className="p-3 text-left font-medium text-gray-600">Order Ref</th>
                          <th className="p-3 text-left font-medium text-gray-600">Contact</th>
                          <th className="p-3 text-left font-medium text-gray-600">Email</th>
                          <th className="p-3 text-left font-medium text-gray-600">Order Date</th>
                          <th className="p-3 text-left font-medium text-gray-600">Expected Date</th>
                          <th className="p-3 text-left font-medium text-gray-600">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.fulfillment.filter((item) => item.vendor > 0).map((item, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-3 font-medium">{item.product}</td>
                            <td className="p-3">{item.vendorDetails.name}</td>
                            <td className="p-3">{item.vendorDetails.orderRef}</td>
                            <td className="p-3">{item.vendorDetails.phone}</td>
                            <td className="p-3">{item.vendorDetails.email}</td>
                            <td className="p-3">{item.vendorDetails.orderDate}</td>
                            <td className="p-3">{item.vendorDetails.expectedDate}</td>
                            <td className="p-3">{item.vendor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-b-xl border-t">
        <div className="flex flex-wrap gap-3">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setShowDispatchModal(true)}
          >
            <Truck className="w-4 h-4 mr-2" />
            Dispatch Ready Items
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            <a href="/invoicedetail">Generate Invoice</a>
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Update Manufacturing
          </button>
          <div className="relative">
            <input
              type="file"
              id="po-upload"
              accept=".pdf,.doc,.docx"
              onChange={handlePOUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploadingPO}
            />
            <button
              className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center ${
                isUploadingPO ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUploadingPO}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploadingPO ? "Uploading..." : "Upload PO & Compare"}
            </button>
          </div>
        </div>
      </div>
      <DispatchReadyItemsModal
        isOpen={showDispatchModal}
        onClose={() => setShowDispatchModal(false)}
        fulfillment={order.fulfillment}
        onConfirm={handleConfirmDispatch}
      />

      {/* PO Comparison Modal */}
      {/* {showPOComparison && uploadedPOData && ( */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              Sales Order vs Purchase Order Comparison
            </h3>
            <button
              onClick={handleClosePOComparison}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
            >
              OK
            </button>
          </div>
          <div className="overflow-auto h-full">
            <SOVsPOComparison
              soData={getSalesOrderData()}
              poData={getSalesOrderData()}
              loading={false}
            />
          </div>
        </div>
      </div>
      {/* )} */}
    </div>
  );
};

export default SalesOrderDetail;
