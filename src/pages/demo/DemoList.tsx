import React, { useState, useEffect, useCallback } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiPrinter } from "react-icons/fi";
import LeadFilters from "../../components/common/FilterPanel";
import DemoForm from "./DemoForm";
import cardData from "../configs/demo/demoCard.json";
import Cards from "../../components/common/Cards";
import DemoBookingCalender from "./DemoBookingCalender";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";

interface Option {
  value: string;
  label: string;
}

interface Lead {
  id: string;
  contactName: string;
  email: string;
  customerName: string;
  status: string;
  createdAt: string;
  clinicHospitalIndividual: string;
  leadId: string;
  demoName: string;
  productName: string;
  productType: string;
  demoDate: string;
  demoId: string;
  contactPhone: string;
  territory: string;
  duration: string;
  demoPurpose: string;
  demoOutcome: string;
  createdDate: string;
  modifiedDate: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const DemoList: React.FC = () => {
  const territoryOptions: Option[] = [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
  ];

  const statusOptions: Option[] = [
    { value: "Demo Requested", label: "Demo Requested" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];
  const { user, role } = useUser();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [headerInfo, setHeaderInfo] = useState(cardData);
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [showDemoForm, setShowDemoForm] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);

  const columns = [
    {
      key: "customerName",
      title: "Customer/Lead Name",
      dataIndex: "customerName",
    },
    { key: "status", title: "Status", dataIndex: "status" },
    { key: "demoContact", title: "Demo Contact", dataIndex: "demoContact" },
    { key: "demoApproach", title: "Demo Approach", dataIndex: "demoApproach" },
    { key: "demoDate", title: "Demo Date", dataIndex: "demoDateTime" },
    { key: "demoOutcome", title: "Demo Outcome", dataIndex: "demoOutcome" },
    { key: "demoFeedback", title: "Demo Feedback", dataIndex: "demoFeedback" },
    { key: "comments", title: "Comments", dataIndex: "comments" },
  ];

  const fetchLeads = async (page: number, size: number) => {
    setLoading(true);
    try {
      const requestBody = {
        SearchText: searchQuery || searchInput || null,
        CustomerNames: filtersApplied
          ? filters.customerName.map((c) => c.value)
          : null,
        Statuses: filtersApplied ? filters.status.map((s) => s.value) : null,
        DemoApproaches: null, // Add logic if you have demoApproach filter
        DemoOutcomes: null, // Add logic if you have demoOutcome filter
        SelectedDemoIds: null,
        UserCreated: user?.userId,
        PageNumber: page,

        PageSize: size,
        OrderBy: "date_created",
        OrderDirection: sortOrder,
      };

      const response = await api.post(
        `SalesDemoGrid/search`,

        requestBody
      );

      const data = await response.data;
      const formattedData = data.data.map((item: any) => ({
        ...item,
        demoDateTime: new Date(item.demoDate).toLocaleDateString("en-GB"),
        demoTime: item.demoTime || "N/A",
      }));
      setLeads(formattedData);
      setTotal(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
      setLeads([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchLeads(currentPage, pageSize);
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

  const handleSearchClick = () => {
    setSearchQuery(searchInput); // Set searchQuery to trigger fetch with debouncing
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const handleFilterChange = (
    key: keyof FilterState,
    value: MultiValue<Option>
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    fetchLeads(1, pageSize);
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
    fetchLeads(1, pageSize);
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const response = await api.get(
          `SalesDemo/cards?userId=${user?.userId}`
        );
        const apiData = response.data;
        const updatedData = cardData.map((item) => ({
          ...item,
          value: apiData[item.id] ?? item.value,
        }));

        console.log(updatedData, "update cares");
        setHeaderInfo(updatedData);
      } catch (error) {
        setHeaderInfo(cardData);
      }
    };
    fetchCardInfo();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Demo List</h1>

      {showDemoForm ? (
        <Modal
          isOpen={showDemoForm}
          onClose={() => setShowDemoForm(false)}
          title="Demo"
        >
          <DemoForm />
        </Modal>
      ) : (
        <>
          <div className="flex items-center justify-end gap-4 mb-6">
            {" "}
            {/* Changed to justify-end */}
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter, View Mode */}
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                {/* <button
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
                </button> */}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "ASC" | "DESC")}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                <option value="DESC">Sort by: Latest First</option>
                <option value="ASC">Sort by: Oldest First</option>
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
              {/* <button
                onClick={handleCreateDemo}
                className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                Create Demo
              </button> */}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 mb-2 md:grid-cols-2 gap-4">
            {headerInfo.map((card: any, index: number) => (
              <Cards
                key={index}
                title={card.title}
                value={card.value}
                description={card.description}
                icon={card.icon}
                color={index}
              />
            ))}
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
              }}
            />
          )}

          <CommonTable
            columns={columns}
            data={leads}
            loading={loading}
            total={total}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pagination={true}
            onToggleFilter={() => setShowFilters((prev) => !prev)}
            showFilter={showFilters}
            page="Demo"
          />

          <DemoBookingCalender />
        </>
      )}
    </div>
  );
};

export default DemoList;
