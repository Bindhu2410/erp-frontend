import React, { useState, useEffect } from "react";
import { MultiValue } from "react-select";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import LeadFilters from "../../components/common/FilterPanel";
import api from "../../services/api";
import { formatDate } from "../../components/common/FormateDate";

interface Option {
  value: string;
  label: string;
}

interface SalesOrder {
  id: string;
  orderId: string;
  customerName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  poId: string;
  grandTotal: number;
  status: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const SalesOrderList: React.FC = () => {
  const navigate = useNavigate();

  // Filter options
  const territoryOptions: Option[] = [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
  ];

  const customerNameOptions: Option[] = [
    { value: "techsolutions", label: "TechSolutions Inc" },
    { value: "innovatecorp", label: "Innovate Corp" },
    { value: "globalenterprises", label: "Global Enterprises" },
    { value: "digitalsystems", label: "Digital Systems Ltd" },
    { value: "smarttech", label: "Smart Tech Solutions" },
  ];

  const zoneOptions: Option[] = [
    { value: "zone1", label: "Zone 1" },
    { value: "zone2", label: "Zone 2" },
    { value: "zone3", label: "Zone 3" },
  ];

  const statusOptions: Option[] = [
    { value: "Created", label: "Created" },
    { value: "Draft", label: "Draft" },
    { value: "Confirmed", label: "Confirmed" },
    { value: "In Progress", label: "In Progress" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const scoreOptions: Option[] = [
    { value: "hot", label: "Hot" },
    { value: "warm", label: "Warm" },
    { value: "cold", label: "Cold" },
  ];

  // State management
  const [soData, setSOData] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<string>("orderDate");
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Columns configuration
  const columns = [
    {
      key: "orderId",
      title: "Order ID",
      dataIndex: "orderId",
      render: (record: any) => (
        <button
          onClick={() => navigate(`/sales-order/detail?id=${record.id}`)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
        >
          {record.orderId}
        </button>
      ),
    },
    { key: "customerName", title: "Customer Name", dataIndex: "customerName" },
    { key: "orderDate", title: "Order Date", dataIndex: "orderDate" },

    { key: "quotationId", title: "Quotation ID", dataIndex: "quotationId" },
    { key: "poId", title: "PO ID", dataIndex: "poId" },
    {
      key: "totalAmount",
      title: "Total amount",
      dataIndex: "totalAmount",
      render: (record: any) => (
        <span>
          ₹
          {record.grandTotal
            ? record.grandTotal.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })
            : "0.00"}
        </span>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (record: any) => (
        <span
          className={`px-3 py-1 rounded text-xs font-semibold ${
            record.status === "Completed"
              ? "bg-green-500 text-white"
              : record.status === "Confirmed"
                ? "bg-blue-500 text-white"
                : record.status === "In Progress"
                  ? "bg-yellow-500 text-white"
                  : record.status === "Created"
                    ? "bg-indigo-500 text-white"
                    : record.status === "Draft"
                      ? "bg-gray-400 text-white"
                      : record.status === "Cancelled"
                        ? "bg-red-500 text-white"
                        : "bg-gray-300 text-gray-700"
          }`}
        >
          {record.status}
        </span>
      ),
    },
  ];

  const fetchSO = async (page: number, size: number) => {
    setLoading(true);
    try {
      // Build dynamic customer names from filters
      const customerNames =
        filters.customerName.length > 0
          ? filters.customerName.map((opt) => opt.label)
          : [];

      // Build dynamic statuses from filters
      const statuses =
        filters.status.length > 0 ? filters.status.map((opt) => opt.value) : [];

      // Build dynamic order IDs from filter input
      const orderId: string[] = orderIdFilter.trim()
        ? [orderIdFilter.trim()]
        : [];

      const requestBody = {
        SearchText: searchQuery || "",
        CustomerNames: customerNames,
        Statuses: statuses,
        OrderIds: orderId,
        PageNumber: page,
        PageSize: size,
        OrderBy: "date_created",
        OrderDirection: sortOrder.toUpperCase() as "ASC" | "DESC",
      };

      console.log("Request Body:", requestBody);
      const response = await api.post("SalesOrderGridApi", requestBody);
      console.log("Sales Order Data:", response.data);

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        const formattedData = response.data.data.map((order: any) => {
          // Step 1: Get the items array
          const items = order.items || [];

          // Step 2: Add `sales` for each item
          const itemsWithSales = items.map((item: any) => ({
            ...item,
            sales: item.unitPrice * item.qty,
          }));

          // Step 3: Calculate total sales amount
          const totalAmount = itemsWithSales.reduce(
            (sum: number, item: any) => sum + item.sales,
            0,
          );

          return {
            id: order.salesOrder.id,
            orderId: order.salesOrder.orderId || "N/A",
            customerName: order.quotation.customerName || "N/A",
            expectedDeliveryDate: order.salesOrder.expectedDeliveryDate
              ? formatDate(order.salesOrder.expectedDeliveryDate)
              : "N/A",
            orderDate: order.salesOrder.orderDate
              ? formatDate(order.salesOrder.orderDate)
              : "N/A",
            quotationId: order.quotation.quotationId,
            quotationInternalId: order.quotation.id,
            grandTotal: order.salesOrder.grandTotal || 0,
            poId: order.salesOrder.poId || "N/A",
            status: order.salesOrder.status || "N/A",

            // 👇 Added fields
            items: itemsWithSales,
            totalAmount: totalAmount,
          };
        });
        console.log("Formatted Sales Order Data:", formattedData);
        setSOData(formattedData);
        setTotal(response.data.totalRecords || 0);
      } else {
        setSOData([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error("Error fetching Sales Orders:", error);
      setSOData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchSO(currentPage, pageSize);
      },
      searchQuery || searchInput || orderIdFilter ? 500 : 0,
    );
    return () => clearTimeout(timer);
  }, [
    currentPage,
    pageSize,
    sortOrder,
    sortField,
    // Only trigger on search query change, not searchInput (to avoid too many API calls)
    searchQuery,
    // Trigger when Order ID filter changes
    orderIdFilter,
    // Trigger when filters are applied
    filtersApplied,
  ]);

  // Filter handlers
  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    // Trigger API call with new filters
    fetchSO(1, pageSize);
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
    setSearchQuery("");
    setOrderIdFilter("");
    setFiltersApplied(false);
    setCurrentPage(1);
    // Trigger API call with reset filters
    fetchSO(1, pageSize);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    // Trigger API call with search query
    fetchSO(1, pageSize);
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: MultiValue<Option>,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Sales Order List</h1>

      <>
        <div className="flex items-center justify-end gap-4 mb-6">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter, View Mode */}
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 transition ${
                  showFilters
                    ? "bg-[#FF6B35] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                title="Filter"
              >
                <FiFilter size={18} />
              </button>
            </div>

            {/* Sort Field Dropdown */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            >
              <option value="orderDate">Sort by: Order Date</option>
              <option value="orderId">Sort by: Order ID</option>
              <option value="customerName">Sort by: Customer Name</option>
              <option value="grandTotal">Sort by: Deal Value</option>
              <option value="status">Sort by: Status</option>
              <option value="expectedDeliveryDate">
                Sort by: Delivery Date
              </option>
            </select>

            {/* Sort Order Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
              title="Print"
            >
              <FiPrinter size={18} />
            </button>

            {/* Export */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center gap-2 transition"
              >
                Export as
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                  {["PDF", "Excel", "CSV"].map((format) => (
                    <button
                      key={format}
                      onClick={() => handleExport(format)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {format}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showFilters && (
          <LeadFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            handleApplyFilters={handleApplyFilters}
            handleResetFilters={handleResetFilters}
            handleSearchClick={handleSearchClick}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            orderIdFilter={orderIdFilter}
            setOrderIdFilter={setOrderIdFilter}
            showOrderIdFilter={true}
            options={{
              statusOptions,
            }}
          />
        )}

        <CommonTable
          columns={columns}
          data={soData}
          loading={loading}
          total={total}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pagination={true}
          onToggleFilter={() => setShowFilters((prev) => !prev)}
          showFilter={showFilters}
        />
      </>
    </div>
  );
};

export default SalesOrderList;
