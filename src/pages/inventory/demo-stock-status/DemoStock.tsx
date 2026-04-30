import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../../components/CommonTable";
import Modal from "../../../components/common/Modal";
import DemoBookingCalender from "../../demo/DemoBookingCalender";
import Cards from "../../../components/common/Cards";

// Type definitions
type Status = "Normal" | "Overdue" | "No Return Date" | "Extended";

interface StockItem {
  id: string;
  description: string;
  quantity: number;
  uom: string;
  issueDate: string;
  returnDate: string;
  custodianType: string;
  custodian: string;
  status: Status;
  daysOverdue?: number;
}

interface CustodianSummary {
  name: string;
  totalItems: number;
  value: string;
  overdueItems: number;
}

const DemoStock: React.FC = () => {
  // State hooks
  const [activeTab, setActiveTab] = useState<string>("all-items");
  const [itemFilter, setItemFilter] = useState<string>("");
  const [custodianTypeFilter, setCustodianTypeFilter] = useState<string>("");
  const [custodianFilter, setCustodianFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showItemDetailsModal, setShowItemDetailsModal] =
    useState<boolean>(false);
  const [showExtendDateModal, setShowExtendDateModal] =
    useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<StockItem | null>(null);
  const [newReturnDate, setNewReturnDate] = useState<string>("2025-05-15");
  const [extensionReason, setExtensionReason] = useState<string>("");

  const navigate = useNavigate();

  // Sample data
  const stockItems: StockItem[] = [
    {
      id: "FG-001",
      description: "Finished Product A",
      quantity: 2,
      uom: "EA",
      issueDate: "Apr 10, 2025",
      returnDate: "May 10, 2025",
      custodianType: "Sales Rep",
      custodian: "John Smith",
      status: "Normal",
    },
    {
      id: "FG-002",
      description: "Finished Product B",
      quantity: 1,
      uom: "EA",
      issueDate: "Apr 15, 2025",
      returnDate: "May 15, 2025",
      custodianType: "Sales Rep",
      custodian: "Jane Doe",
      status: "Normal",
    },
    {
      id: "FG-003",
      description: "Finished Product C",
      quantity: 5,
      uom: "EA",
      issueDate: "Apr 01, 2025",
      returnDate: "May 01, 2025",
      custodianType: "Event",
      custodian: "Trade Show 2025",
      status: "Overdue",
    },
    {
      id: "FG-004",
      description: "Finished Product D",
      quantity: 2,
      uom: "EA",
      issueDate: "Mar 20, 2025",
      returnDate: "Apr 20, 2025",
      custodianType: "Customer",
      custodian: "Customer A",
      status: "Overdue",
    },
    {
      id: "FG-005",
      description: "Finished Product E",
      quantity: 10,
      uom: "EA",
      issueDate: "Apr 25, 2025",
      returnDate: "May 25, 2025",
      custodianType: "Demo Pool",
      custodian: "Demo Center",
      status: "Normal",
    },
  ];

  const overdueItems: StockItem[] = [
    {
      id: "FG-003",
      description: "Finished Product C",
      quantity: 5,
      uom: "EA",
      issueDate: "Apr 01, 2025",
      returnDate: "May 01, 2025",
      custodianType: "Event",
      custodian: "Trade Show 2025",
      status: "Overdue",
      daysOverdue: 3,
    },
    {
      id: "FG-004",
      description: "Finished Product D",
      quantity: 2,
      uom: "EA",
      issueDate: "Mar 20, 2025",
      returnDate: "Apr 20, 2025",
      custodianType: "Customer",
      custodian: "Customer A",
      status: "Overdue",
      daysOverdue: 14,
    },
    {
      id: "FG-006",
      description: "Finished Product F",
      quantity: 1,
      uom: "EA",
      issueDate: "Mar 15, 2025",
      returnDate: "Apr 15, 2025",
      custodianType: "Sales Rep",
      custodian: "Robert Johnson",
      status: "Overdue",
      daysOverdue: 19,
    },
  ];

  const salesReps: CustodianSummary[] = [
    { name: "John Smith", totalItems: 5, value: "$32,500", overdueItems: 0 },
    { name: "Jane Doe", totalItems: 3, value: "$18,750", overdueItems: 0 },
    {
      name: "Robert Johnson",
      totalItems: 2,
      value: "$15,000",
      overdueItems: 1,
    },
  ];

  const events: CustodianSummary[] = [
    {
      name: "Trade Show 2025",
      totalItems: 12,
      value: "$45,000",
      overdueItems: 5,
    },
    { name: "Industry Expo", totalItems: 6, value: "$22,500", overdueItems: 0 },
  ];

  const customers: CustodianSummary[] = [
    { name: "Customer A", totalItems: 2, value: "$15,000", overdueItems: 2 },
    { name: "Customer B", totalItems: 2, value: "$8,750", overdueItems: 0 },
  ];

  const demoPools: CustodianSummary[] = [
    { name: "Demo Center", totalItems: 10, value: "$43,500", overdueItems: 0 },
  ];

  // Event handlers
  const handleApplyFilters = () => {
    console.log("Applying filters");
  };

  const handleResetFilters = () => {
    setItemFilter("");
    setCustodianTypeFilter("");
    setCustodianFilter("");
    setStatusFilter("");
    console.log("Filters reset");
  };

  const handleExport = () => {
    console.log("Exporting data");
    alert("Data would be exported to Excel in a real implementation.");
  };

  const handlePrint = () => {
    console.log("Printing data");
    window.print();
  };

  const handleViewDetails = (item: StockItem) => {
    setCurrentItem(item);
    setShowItemDetailsModal(true);
  };

  const handleExtendDate = (item: StockItem) => {
    setCurrentItem(item);
    setShowExtendDateModal(true);
  };

  const handleProcessReturn = (id: string) => {
    navigate("/return-from-demo");
  };

  const handleExtendDateSubmit = () => {
    console.log(
      `Extended return date for ${currentItem?.id} to ${newReturnDate}`
    );
    console.log(`Reason: ${extensionReason}`);
    setShowExtendDateModal(false);
  };

  const handleSendReminder = (id: string) => {
    console.log(`Sending reminder for ${id}`);
    alert(`Reminder would be sent for item ${id} in a real implementation.`);
  };

  // CommonTable columns configuration
  const allItemsColumns = [
    {
      key: "id",
      title: "Item",
      dataIndex: "id",
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
    },
    {
      key: "quantity",
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      key: "uom",
      title: "UOM",
      dataIndex: "uom",
    },
    {
      key: "issueDate",
      title: "Issue Date",
      dataIndex: "issueDate",
    },
    {
      key: "returnDate",
      title: "Expected Return",
      dataIndex: "returnDate",
    },
    {
      key: "custodianType",
      title: "Custodian Type",
      dataIndex: "custodianType",
    },
    {
      key: "custodian",
      title: "Custodian",
      dataIndex: "custodian",
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (status: Status) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${
              status === "Normal"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
        >
          {status}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      render: (item: StockItem) => (
        <div className="space-x-1">
          <button
            onClick={() => handleViewDetails(item)}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </button>
          <button
            onClick={() => handleProcessReturn(item.id)}
            className="text-green-600 hover:text-green-900"
          >
            Return
          </button>
          <button
            onClick={() => handleExtendDate(item)}
            className="text-gray-600 hover:text-gray-900"
          >
            Extend
          </button>
        </div>
      ),
    },
  ];

  const overdueItemsColumns = [
    {
      key: "id",
      title: "Item",
      dataIndex: "id",
    },
    {
      key: "description",
      title: "Description",
      dataIndex: "description",
    },
    {
      key: "quantity",
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      key: "issueDate",
      title: "Issue Date",
      dataIndex: "issueDate",
    },
    {
      key: "returnDate",
      title: "Expected Return",
      dataIndex: "returnDate",
    },
    {
      key: "daysOverdue",
      title: "Days Overdue",
      dataIndex: "daysOverdue",
      render: (days: number) => (
        <span className="font-medium text-red-600">{days}</span>
      ),
    },
    {
      key: "custodianType",
      title: "Custodian Type",
      dataIndex: "custodianType",
    },
    {
      key: "custodian",
      title: "Custodian",
      dataIndex: "custodian",
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      render: (item: StockItem) => (
        <div className="space-x-1">
          <button
            onClick={() => handleViewDetails(item)}
            className="text-blue-600 hover:text-blue-900"
          >
            View
          </button>
          <button
            onClick={() => handleProcessReturn(item.id)}
            className="text-green-600 hover:text-green-900"
          >
            Return
          </button>
          <button
            onClick={() => handleExtendDate(item)}
            className="text-gray-600 hover:text-gray-900"
          >
            Extend
          </button>
          <button
            onClick={() => handleSendReminder(item.id)}
            className="text-yellow-600 hover:text-yellow-900"
          >
            Remind
          </button>
        </div>
      ),
    },
  ];

  const custodianColumns = [
    {
      key: "name",
      title: "Sales Rep",
      dataIndex: "name",
    },
    {
      key: "totalItems",
      title: "Total Items",
      dataIndex: "totalItems",
    },
    {
      key: "value",
      title: "Value",
      dataIndex: "value",
    },
    {
      key: "overdueItems",
      title: "Overdue Items",
      dataIndex: "overdueItems",
    },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      render: (item: CustodianSummary) => (
        <div className="space-x-1">
          <button className="text-blue-600 hover:text-blue-900">View</button>
          <button className="text-green-600 hover:text-green-900">
            Return
          </button>
        </div>
      ),
    },
  ];

  // Card data for dashboard
  const dashboardCards = [
    {
      title: "Total Items on Demo",
      value: "42",
      description: "Across 15 unique SKUs",
      icon: "📦",
      color: 0,
    },
    {
      title: "Overdue Returns",
      value: "5",
      description: "Expected return date passed",
      icon: "⚠️",
      color: 1,
    },
    {
      title: "Demo Value",
      value: "$98,750",
      description: "Total cost of demo inventory",
      icon: "💰",
      color: 2,
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-2">Demo Stock Status</h2>
        <p className="text-gray-600 mb-6">
          View and track items currently on demonstration
        </p>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <Cards
              key={index}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              color={card.color}
            />
          ))}
        </div>

        {/* Search filters */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <input
                type="text"
                value={itemFilter}
                onChange={(e) => setItemFilter(e.target.value)}
                placeholder="Search by SKU or Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custodian Type
              </label>
              <select
                value={custodianTypeFilter}
                onChange={(e) => setCustodianTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Custodian Types</option>
                <option value="sales-rep">Sales Representative</option>
                <option value="event">Event/Exhibition</option>
                <option value="customer">Customer Evaluation</option>
                <option value="demo-pool">Demo Pool Location</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custodian
              </label>
              <select
                value={custodianFilter}
                onChange={(e) => setCustodianFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Custodians</option>
                <option value="john-smith">John Smith</option>
                <option value="jane-doe">Jane Doe</option>
                <option value="trade-show-2025">Trade Show 2025</option>
                <option value="customer-a">Customer A</option>
                <option value="demo-center">Demo Center</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="normal">Normal</option>
                <option value="overdue">Overdue</option>
                <option value="no-return-date">No Return Date</option>
                <option value="extended">Return Date Extended</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap justify-between mt-4">
            <div className="space-x-2">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Reset Filters
              </button>
            </div>
            <div className="space-x-2 mt-2 sm:mt-0">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Export
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("all-items")}
              className={`py-2 px-1 ${
                activeTab === "all-items"
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab("by-custodian")}
              className={`py-2 px-1 ${
                activeTab === "by-custodian"
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              By Custodian
            </button>
            <button
              onClick={() => setActiveTab("overdue")}
              className={`py-2 px-1 ${
                activeTab === "overdue"
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overdue Items
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {/* All Items tab */}
          {activeTab === "all-items" && (
            <CommonTable
              columns={allItemsColumns}
              data={stockItems}
              pagination={true}
              total={0}
              currentPage={0}
              onPageChange={function (page: number, pageSize: number): void {
                throw new Error("Function not implemented.");
              }}
            />
          )}

          {/* By Custodian tab */}
          {activeTab === "by-custodian" && (
            <div className="space-y-6">
              {/* Sales Representatives */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Sales Representatives (10 items)
                  </h3>
                </div>
                <CommonTable
                  columns={custodianColumns}
                  data={salesReps}
                  pagination={false}
                  total={0}
                  currentPage={0}
                  onPageChange={function (
                    page: number,
                    pageSize: number
                  ): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>

              {/* Events/Exhibitions */}
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="bg-gray-50 px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Events/Exhibitions (18 items)
                  </h3>
                </div>
                <CommonTable
                  columns={custodianColumns}
                  data={events}
                  pagination={false}
                  total={0}
                  currentPage={0}
                  onPageChange={function (
                    page: number,
                    pageSize: number
                  ): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </div>
          )}

          {/* Overdue Items tab */}
          {activeTab === "overdue" && (
            <>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      The following items are overdue for return. Please contact
                      the custodians to arrange for immediate return or extend
                      the return date if needed.
                    </p>
                  </div>
                </div>
              </div>
              <CommonTable
                columns={overdueItemsColumns}
                data={overdueItems}
                pagination={true}
                total={0}
                currentPage={0}
                onPageChange={function (page: number, pageSize: number): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </>
          )}
        </div>

        {/* Equipment Booking Calendar Section */}
        <DemoBookingCalender />
      </div>

      {/* Extend Return Date Modal */}
      <Modal
        isOpen={showExtendDateModal}
        onClose={() => setShowExtendDateModal(false)}
      >
        {currentItem && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <input
                type="text"
                value={`${currentItem.id} - ${currentItem.description}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custodian
              </label>
              <input
                type="text"
                value={`${currentItem.custodian} (${currentItem.custodianType})`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Return Date
              </label>
              <input
                type="text"
                value={currentItem.returnDate}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-md focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Return Date
              </label>
              <input
                type="date"
                value={newReturnDate}
                onChange={(e) => setNewReturnDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Extension
              </label>
              <textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for extending the return date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowExtendDateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendDateSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Extend Return Date
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Item Details Modal */}
      <Modal
        isOpen={showItemDetailsModal}
        onClose={() => setShowItemDetailsModal(false)}
        type="max"
      >
        {currentItem && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Item Information
                </h4>
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <dt className="col-span-1 font-medium text-gray-500">SKU</dt>
                  <dd className="col-span-2">{currentItem.id}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Description
                  </dt>
                  <dd className="col-span-2">{currentItem.description}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Quantity
                  </dt>
                  <dd className="col-span-2">
                    {currentItem.quantity} {currentItem.uom}
                  </dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Value
                  </dt>
                  <dd className="col-span-2">$15,000</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Lot/Serial #
                  </dt>
                  <dd className="col-span-2">LOT-20250215-002</dd>
                </dl>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Demo Information
                </h4>
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  <dt className="col-span-1 font-medium text-gray-500">
                    Custodian Type
                  </dt>
                  <dd className="col-span-2">{currentItem.custodianType}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Custodian
                  </dt>
                  <dd className="col-span-2">{currentItem.custodian}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Issue Date
                  </dt>
                  <dd className="col-span-2">{currentItem.issueDate}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Return Date
                  </dt>
                  <dd className="col-span-2">{currentItem.returnDate}</dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Status
                  </dt>
                  <dd className="col-span-2">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          currentItem.status === "Normal"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {currentItem.status}{" "}
                      {currentItem.daysOverdue &&
                        `(${currentItem.daysOverdue} days)`}
                    </span>
                  </dd>

                  <dt className="col-span-1 font-medium text-gray-500">
                    Notes
                  </dt>
                  <dd className="col-span-2">
                    For demonstration at the annual trade show
                  </dd>
                </dl>
              </div>
            </div>

            <h4 className="text-sm font-medium text-gray-700 mt-6 mb-2">
              Item History
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Apr 01, 2025
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Issue for Demo
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Issued to {currentItem.custodian} (
                      {currentItem.custodianType})
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      admin
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      May 01, 2025
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Reminder Sent
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      Automatic reminder for return date
                    </td>
                    <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                      system
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => handleProcessReturn(currentItem.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Process Return
              </button>
              <button
                onClick={() => {
                  setShowItemDetailsModal(false);
                  handleExtendDate(currentItem);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Extend Return Date
              </button>
              <button
                onClick={() => handleSendReminder(currentItem.id)}
                className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50"
              >
                Send Reminder
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DemoStock;
