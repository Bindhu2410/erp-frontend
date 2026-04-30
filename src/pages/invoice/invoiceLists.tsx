import React, { useState, useCallback, useEffect } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LeadFilters from "../../components/common/FilterPanel";
import DemoForm from "../demo/DemoForm";
import Modal from "../../components/common/Modal";
import InvoiceForm from "../purchase-order/InvoiceForm";
import { toast } from "react-toastify";

interface Option {
  value: string;
  label: string;
}

interface Invoice {
  invoiceId: string;
  status: string;
  createdDate: string;
  po_id: string;
  sales_order_id: string;
  quotation_id: number;
  quotationInfo: {
    customer_name: string;
    valid_till: string;
  };
  items: Array<{
    id: number;
    qty: number;
    amount: number;
    itemId: number;
    itemName: string;
    unitPrice: number;
  }>;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const InvoiceList: React.FC = () => {
  const territoryOptions: Option[] = [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
  ];

  const customerNameOptions: Option[] = [
    { value: "companyA", label: "Company A" },
    { value: "companyB", label: "Company B" },
    { value: "companyC", label: "Company C" },
  ];

  const zoneOptions: Option[] = [
    { value: "zone1", label: "Zone 1" },
    { value: "zone2", label: "Zone 2" },
    { value: "zone3", label: "Zone 3" },
  ];

  const statusOptions: Option[] = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "lost", label: "Lost" },
    { value: "Partially Fulfilled", label: "Partially Fulfilled" },
  ];

  const scoreOptions: Option[] = [
    { value: "hot", label: "Hot" },
    { value: "warm", label: "Warm" },
    { value: "cold", label: "Cold" },
  ];

  const leadTypeOptions: Option[] = [
    { value: "Online", label: "Online" },
    { value: "Referral", label: "Referral" },
    { value: "Social Media", label: "Social Media" },
    { value: "Event", label: "Event" },
    { value: "Direct", label: "Direct" },
  ];

  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [modal, setModal] = useState(false);

  const columns = [
    {
      key: "invoiceId",
      title: "Invoice ID",
      dataIndex: "invoiceId",
    },
    {
      key: "quotationInfo.customer_name",
      title: "Client Name",
      dataIndex: "quotationInfo.customer_name",
    },
    {
      key: "invoiceDate",
      title: "Invoice Date",
      dataIndex: "invoiceDate",
    },
    {
      key: "dueDate",
      title: "Due Date",
      dataIndex: "dueDate",
    },
    {
      key: "amount",
      title: "Amount",
      dataIndex: "amount",
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
    },
    {
      key: "paymentMethod",
      title: "Payment Method",
      dataIndex: "paymentMethod",
    },
    {
      key: "contactEmail",
      title: "Contact Email",
      dataIndex: "contactEmail",
    },
  ];

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
    const filtered = invoices.filter((invoice) =>
      Object.values(invoice).some((value) =>
        String(value).toLowerCase().includes(searchInput.toLowerCase()),
      ),
    );
    setInvoices(filtered);
    setTotal(filtered.length);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: MultiValue<Option>,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    const filtered = invoices.filter((invoice) => {
      return (
        (filters.territory.length === 0 || true) &&
        (filters.zone.length === 0 || true) &&
        (filters.customerName.length === 0 ||
          filters.customerName.some(
            (opt) => opt.value === invoice.quotationInfo.customer_name,
          )) &&
        (filters.status.length === 0 ||
          filters.status.some((opt) => opt.value === invoice.status))
      );
    });
    setInvoices(filtered);
    setTotal(filtered.length);
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
    setFiltersApplied(false);
    setCurrentPage(1);
    setInvoices([]);
    setTotal(0);
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCreateInvoice = useCallback(() => {
    setModal(true);
  }, [navigate]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const requestBody = {
        SearchText: searchQuery || searchInput || "",
        Statuses: filtersApplied ? filters.status.map((s) => s.value) : [],
        PageNumber: currentPage,
        PageSize: pageSize,
        OrderBy: "date_created",
        OrderDirection: sortOrder.toUpperCase() as "ASC" | "DESC",
      };

      const response = await fetch(
        "http://localhost:5104/api/InvoiceGrid/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInvoices(data.data || []);
      setTotal(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
      setInvoices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [
    currentPage,
    pageSize,
    sortOrder,
    filtersApplied,
    searchQuery,
    searchInput,
  ]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Invoice List</h1>

      {showInvoiceForm ? (
        <DemoForm />
      ) : (
        <>
          <div className="flex items-center justify-end gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
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

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                <option value="asc">Sort: Ascending</option>
                <option value="desc">Sort: Descending</option>
              </select>

              <button
                onClick={handlePrint}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                title="Print"
              >
                <FiPrinter size={18} />
              </button>

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

              <button
                onClick={handleCreateInvoice}
                className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                Create Invoice
              </button>
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
              options={{
                statusOptions,

                leadTypeOptions,
              }}
            />
          )}

          <CommonTable
            columns={columns}
            data={invoices}
            loading={loading}
            total={total}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pagination={true}
          />
        </>
      )}

      {modal && <InvoiceForm onClose={() => setModal(false)} />}
    </div>
  );
};

export default InvoiceList;
