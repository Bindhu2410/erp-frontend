import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import Modal from "../../components/common/Modal";
import LeadFilters from "../../components/common/FilterPanel";
import PreleadForm from "./PreleadForm";

interface Option {
  value: string;
  label: string;
}

interface Column {
  key: string;
  title: string;
  dataIndex: string;
  render?: (record: any) => React.ReactNode;
}

interface PreLead {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  source: string;
  interestLevel: string;
  status: string;
  dateCaptured: string;
  capturedBy: string;
  assignedTo: string;
}

interface FilterState {
  status: Option[];
  source: Option[];
  interestLevel: Option[];
  assignedTo: Option[];
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  score: Option[];
  leadType: Option[];
}

interface PreLeadFormData {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  phone: string;
  source: string;
  interestLevel: string;
  status: string;
  assignedTo: string;
  [key: string]: any;
}

const PreLeadList: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
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
  const [preLeads, setPreLeads] = useState<PreLead[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Define your filter options
  const statusOptions: Option[] = [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In Progress" },
    { value: "qualified", label: "Qualified" },
    { value: "disqualified", label: "Disqualified" },
  ];

  const sourceOptions: Option[] = [
    { value: "website", label: "Website" },
    { value: "referral", label: "Referral" },
    { value: "event", label: "Event" },
    { value: "social_media", label: "Social Media" },
  ];

  const interestLevelOptions: Option[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const assignedToOptions: Option[] = [
    { value: "john_doe", label: "John Doe" },
    { value: "jane_smith", label: "Jane Smith" },
    { value: "mike_johnson", label: "Mike Johnson" },
  ];

  const [filters, setFilters] = useState<FilterState>({
    status: [],
    source: [],
    interestLevel: [],
    assignedTo: [],
    territory: [],
    zone: [],
    customerName: [],
    score: [],
    leadType: [],
  });

  const columns: Column[] = [
    {
      key: "name",
      title: "Name",
      dataIndex: "name",
      render: (record: PreLead) => `${record.firstName} ${record.lastName}`,
    },
    { key: "company", title: "Company", dataIndex: "company" },
    { key: "jobTitle", title: "Job Title", dataIndex: "jobTitle" },
    { key: "email", title: "Email", dataIndex: "email" },
    { key: "phone", title: "Phone", dataIndex: "phone" },
    { key: "source", title: "Source", dataIndex: "source" },
    {
      key: "interestLevel",
      title: "Interest Level",
      dataIndex: "interestLevel",
    },
    { key: "status", title: "Status", dataIndex: "status" },
    { key: "dateCaptured", title: "Date Captured", dataIndex: "dateCaptured" },
    { key: "capturedBy", title: "Captured By", dataIndex: "capturedBy" },
    { key: "assignedTo", title: "Assigned To", dataIndex: "assignedTo" },
    {
      key: "actions",
      title: "Actions",
      dataIndex: "actions",
      render: (record: PreLead) => (
        <div>
          <button className="text-blue-600 hover:text-blue-800 mr-2">
            Edit
          </button>
          <button className="text-red-600 hover:text-red-800">Delete</button>
        </div>
      ),
    },
  ];

  const fetchPreLeads = async (page: number, size: number) => {
    setLoading(true);
    try {
      const requestBody = {
        searchText: searchQuery || searchInput || "",
        status: filtersApplied ? filters.status.map((s) => s.value) : [],
        source: filtersApplied ? filters.source.map((s) => s.value) : [],
        interestLevel: filtersApplied
          ? filters.interestLevel.map((i) => i.value)
          : [],
        assignedTo: filtersApplied
          ? filters.assignedTo.map((a) => a.value)
          : [],
        pageNumber: page,
        pageSize: size,
        orderDirection: sortOrder,
      };

      const response = await fetch("your-api-endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      setPreLeads(data.results || []);
      setTotal(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching pre-leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchPreLeads(currentPage, pageSize);
      },
      searchQuery || searchInput ? 500 : 0
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
    key: keyof FilterState,
    value: MultiValue<Option>
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    fetchPreLeads(1, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      status: [],
      source: [],
      interestLevel: [],
      assignedTo: [],
      territory: [],
      zone: [],
      customerName: [],
      score: [],
      leadType: [],
    });
    setSearchInput("");
    setSearchQuery("");
    setFiltersApplied(false);
    setCurrentPage(1);
    fetchPreLeads(1, pageSize);
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
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
    <div className="p-6 max-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">All Pre-Leads</h1>
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
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition ${
                  viewMode === "list"
                    ? "bg-gray-200 text-black"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="List View"
              >
                <FiList size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 transition border-l border-gray-300 ${
                  viewMode === "grid"
                    ? "bg-gray-200 text-black"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
                title="Grid View"
              >
                <FiGrid size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
            >
              <option value="asc">Sort: Ascending</option>
              <option value="desc">Sort: Descending</option>
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

            {/* Create */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              Add Ad-hoc Pre-Lead
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
              customerNameOptions: [],
              statusOptions,

              leadTypeOptions: [],
              sourceOptions,
              interestLevelOptions,
              assignedToOptions,
            }}
          />
        )}

        <CommonTable
          columns={columns}
          data={preLeads}
          loading={loading}
          total={total}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pagination={true}
        />
      </div>

      {/* Add Pre-Lead Form Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <div className="bg-white p-6 rounded-lg w-full">
          <h2 className="text-xl font-semibold mb-4">
            Add New Ad-hoc Pre-Lead
          </h2>
          <PreleadForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              fetchPreLeads(currentPage, pageSize);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default PreLeadList;
