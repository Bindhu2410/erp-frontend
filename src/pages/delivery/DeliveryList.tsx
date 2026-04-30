import React, { useState, useEffect, useCallback } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LeadFilters from "../../components/common/FilterPanel";
import Cards from "../../components/common/Cards";
import Modal from "../../components/common/Modal";
import { toast } from "react-toastify";
import { DeliveryForm } from "../purchase-order/DeliveryForm";

interface QuotationInfo {
  id: number;
  quotation_id: string;
  customer_name: string;
  // ... other fields as needed
}

interface InvoiceItem {
  id: number;
  qty: number;
  amount: number;
  itemId: number;
  unitPrice: number;
  make: string;
  model: string;
  product: string;
  category: string;
  itemName: string;
  itemCode: string;
}

interface Invoice {
  invoiceId: string;
  status: string;
  createdDate: string;
  po_id: string;
  sales_order_id: string;
  quotation_id: number;
  quotationInfo: QuotationInfo;
  items: InvoiceItem[];
}

interface QuotationInfo {
  id: number;
  quotation_id: string;
  customer_name: string;
  // ... other fields as needed
}

interface InvoiceItem {
  id: number;
  qty: number;
  amount: number;
  itemId: number;
  unitPrice: number;
  make: string;
  model: string;
  product: string;
  category: string;
  itemName: string;
  itemCode: string;
}

interface Invoice {
  invoiceId: string;
  status: string;
  createdDate: string;
  po_id: string;
  sales_order_id: string;
  quotation_id: number;
  quotationInfo: QuotationInfo;
  items: InvoiceItem[];
}

interface Option {
  value: string;
  label: string;
}

interface Delivery {
  id: string;
  deliveryNumber: string;
  orderNumber: string;
  customerName: string;
  deliveryDate: string;
  deliveryStatus: string;
  deliveryAddress: string;
  shippedBy: string;
  trackingNumber: string;
  createdAt: string;
  modifiedAt: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const DeliveryList: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  const filterOptions = {
    territoryOptions: [
      { value: "north", label: "North" },
      { value: "south", label: "South" },
    ],
    zoneOptions: [
      { value: "zone1", label: "Zone 1" },
      { value: "zone2", label: "Zone 2" },
    ],
    customerNameOptions: [
      { value: "abc", label: "ABC Industries" },
      { value: "xyz", label: "XYZ Co." },
    ],
    statusOptions: [
      { value: "Created", label: "Created" },
      { value: "Processing", label: "Processing" },
      { value: "Shipped", label: "Shipped" },
      { value: "InTransit", label: "In Transit" },
      { value: "Delivered", label: "Delivered" },
      { value: "Cancelled", label: "Cancelled" },
    ],
    scoreOptions: [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
    leadTypeOptions: [
      { value: "direct", label: "Direct" },
      { value: "referred", label: "Referred" },
    ],
  };

  const fetchDeliveries = async (page: number, size: number) => {
    setLoading(true);
    try {
      const requestBody = {
        SearchText: searchQuery || searchInput || "",
        Statuses: filtersApplied ? filters.status.map((s) => s.value) : [],
        DeliveryIds: [], // If you need to filter by specific delivery IDs
        PageNumber: page,
        PageSize: size,
        OrderBy: "date_created", // Adjust this based on your API's supported fields
        OrderDirection: sortOrder.toUpperCase() as "ASC" | "DESC",
      };

      const response = await fetch("${process.env.REACT_APP_API_BASE_URL}/Delivery/grid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Transform the API response to match your component's data structure
      const transformedData = data.data.map((item: any) => ({
        id: item.id.toString(),
        deliveryId: item.deliveryId,
        salesOrderId: item.salesOrderId,
        poId: item.poId,
        invoiceId: item.invoiceId,
        customerName: item.customerName,
        deliveryDate: new Date(item.deliveryDate).toLocaleDateString(),
        deliveryStatus: item.deliveryStatus,
        deliveryAddress: item.deliveryAddress,
        shippedBy: item.shippedBy,
        trackingNumber: item.trackingNumber || "N/A",
        createdAt: new Date(item.createdDate).toLocaleDateString(),
        modifiedAt: new Date(item.modifiedDate).toLocaleDateString(),
      }));

      setDeliveries(transformedData);
      setTotal(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast.error("Failed to fetch deliveries");
      setDeliveries([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchDeliveries(currentPage, pageSize);
      },
      searchQuery || searchInput ? 500 : 0,
    );
    return () => clearTimeout(timer);
  }, [
    currentPage,
    pageSize,
    filtersApplied,
    searchQuery,
    searchInput,
    sortOrder,
  ]);

  const handleFilterChange = (
    filterName: keyof FilterState,
    selectedOptions: MultiValue<Option>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: selectedOptions,
    }));
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    fetchDeliveries(1, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      territory: [],
      zone: [],
      customerName: [],
      status: [],
      score: [],
      leadType: [],
    });
    setSearchInput("");
    setFiltersApplied(false);
    setCurrentPage(1);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowForm(true);
  };

  const handleDelete = async (delivery: Delivery) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/Delivery/${delivery.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Delivery deleted successfully");
      fetchDeliveries(currentPage, pageSize);
    } catch (error) {
      console.error("Error deleting delivery:", error);
      toast.error("Failed to delete delivery");
    }
  };

  const columns = [
    {
      key: "deliveryId",
      title: "DeliveryID",
      dataIndex: "deliveryId",
      width: 150,
    },
    {
      key: "salesOrderId",
      title: "Sales Order ID",
      dataIndex: "salesOrderId",
      width: 150,
    },
    {
      key: "deliveryStatus",
      title: "Delivery Status",
      dataIndex: "deliveryStatus",
      width: 200,
    },
    {
      key: "poId",
      title: "PO ID",
      dataIndex: "poId",
      width: 150,
    },
  ];

  const cardData = [
    {
      title: "Total Deliveries",
      value: total.toString(),
      description: "All deliveries",
      icon: "truck",
      color: 0,
    },
    {
      title: "Delivered",
      value: deliveries
        .filter((d) => d.deliveryStatus === "Delivered")
        .length.toString(),
      description: "Successfully delivered",
      icon: "check",
      color: 1,
    },
    {
      title: "In Transit",
      value: deliveries
        .filter((d) => d.deliveryStatus === "InTransit")
        .length.toString(),
      description: "Currently in transit",
      icon: "clock",
      color: 2,
    },
    {
      title: "Processing",
      value: deliveries
        .filter((d) => ["Created", "Processing"].includes(d.deliveryStatus))
        .length.toString(),
      description: "Being processed",
      icon: "clock",
      color: 3,
    },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Delivery List</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiFilter />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiPrinter />
          </button>
          <button
            onClick={() => {
              setSelectedDelivery(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Create Delivery
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cardData.map((card, index) => (
          <Cards key={index} {...card} />
        ))}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <LeadFilters
            filters={filters}
            options={filterOptions}
            onFilterChange={handleFilterChange}
            handleApplyFilters={handleApplyFilters}
            handleResetFilters={handleResetFilters}
            handleSearchClick={handleSearchClick}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
          />
        </div>
      )}

      {/* Table/Grid View */}
      {viewMode === "list" ? (
        <CommonTable
          columns={columns}
          data={deliveries}
          total={total}
          currentPage={currentPage}
          loading={loading}
          onPageChange={(page) => setCurrentPage(page)}
          pagination={true}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold">{delivery.deliveryNumber}</h3>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    delivery.deliveryStatus === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : delivery.deliveryStatus === "InTransit"
                        ? "bg-blue-100 text-blue-800"
                        : delivery.deliveryStatus === "Processing"
                          ? "bg-yellow-100 text-yellow-800"
                          : delivery.deliveryStatus === "Created"
                            ? "bg-gray-100 text-gray-800"
                            : delivery.deliveryStatus === "Shipped"
                              ? "bg-purple-100 text-purple-800"
                              : delivery.deliveryStatus === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {delivery.deliveryStatus}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Order: {delivery.orderNumber}
                </p>
                <p className="text-sm text-gray-600">
                  Customer: {delivery.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {delivery.deliveryDate}
                </p>
                <p className="text-sm text-gray-600">
                  Address: {delivery.deliveryAddress}
                </p>
                <p className="text-sm text-gray-600">
                  Carrier: {delivery.shippedBy}
                </p>
                <p className="text-sm text-gray-600">
                  Tracking: {delivery.trackingNumber}
                </p>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => handleEdit(delivery)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(delivery)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Form Modal */}
      {showForm && (
        <DeliveryForm onClose={() => setShowForm(false)} poId={invoices} />
      )}
    </div>
  );
};

export default DeliveryList;
