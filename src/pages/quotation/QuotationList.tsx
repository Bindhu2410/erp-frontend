import React, { useState, useEffect, useCallback } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LeadFilters from "../../components/common/FilterPanel";
import QuotationForm from "./QuotationForm";
import cardData from "../configs/quotation/quotationCard.json";
import Cards from "../../components/common/Cards";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";

interface Option {
  value: string;
  label: string;
}

interface Lead {
  id: string;
  clinicHospitalIndividual: string;
  leadId: string;
  status: string;
  customerName: string;
  productName: string;
  amount: string;
  quotationId: string;
  contactPhone: string;
  expireDate: string;
  createdDate: string;
  modifiedDate: string;
  expectedDate: string;
  deliveryDate: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const QuotationList: React.FC = () => {
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
    { value: "Draft", label: "Draft" },
    { value: "Approved", label: "Approved" },
    { value: "Final Quotation", label: "Final Quotation" },
    { value: "Submitted", label: "Submitted" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const { user, role } = useUser();

  const navigate = useNavigate();
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [headerInfo, setHeaderInfo] = useState(cardData);
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showQuotationForm, setShowQuotationForm] = useState(false);

  const columns = [
    { key: "quotationId", title: "Quotation ID", dataIndex: "quotationId" },
    { key: "status", title: "Status", dataIndex: "status" },
    { key: "customerName", title: "Customer Name", dataIndex: "customerName" },
    {
      key: "quotationDate",
      title: "Quotation Date",
      dataIndex: "quotationDate",
    },

    { key: "validTill", title: "Valid Till", dataIndex: "validTill" },
    {
      key: "quotationType",
      title: "Quotation Type",
      dataIndex: "quotationType",
    },
    { key: "version", title: "Version", dataIndex: "version" },
  ];

  const fetchLeads = async (page: number, size: number) => {
    setLoading(true);
    try {
      // Extract dynamic filter values
      const customerNames = filters.customerName.map((c) => c.value);
      const statuses = filters.status.map((s) => s.value);
      // If you add QuotationId filter, extract here, else leave as []
      const quotationIds: string[] = [];
      const requestBody = {
        SearchText: searchQuery || searchInput || "",
        CustomerNames: customerNames.length > 0 ? customerNames : [],
        Statuses: statuses.length > 0 ? statuses : [],
        QuotationIds: quotationIds.length > 0 ? quotationIds : [],
        PageNumber: page,
        PageSize: size,
        OrderBy: "id",
        OrderDirection: sortOrder.toUpperCase(),
        userCreated: user?.userId,
      };

      const response = await api.post("SalesQuotationGrid/search", requestBody);

      const data = await response.data;
      const formateData = data.data.map((item: any) => ({
        ...item,
        quotationDate: new Date(item.quotationDate).toLocaleDateString("en-GB"),
        validTill: new Date(item.validTill).toLocaleDateString("en-GB"),
      }));
      setLeads(formateData || []);
      setTotal(data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchLeads(currentPage, pageSize);
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

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const response = await api.get(
          `sales-quotations/cards?userId=${user?.userId}`,
        );
        const apiData = response.data;
        // Map API response to cardData config by title/status
        const updatedCards = cardData.map((card) => ({
          // Try to find a matching card in API response by title (case-insensitive
          ...card,
          value: apiData[card.id] ?? card.value,
        }));
        setHeaderInfo(updatedCards);
      } catch (error) {
        // Fallback to static config if API fails
        setHeaderInfo(cardData);
      }
    };
    fetchCardInfo();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (
    key: keyof FilterState,
    value: MultiValue<Option>,
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

  const handleCreateQuotation = useCallback(() => {
    setShowQuotationForm(true);
  }, []);

  // Handler to close the QuotationForm and refresh the list
  const handleCloseQuotationForm = () => {
    setShowQuotationForm(false);
    fetchLeads(currentPage, pageSize);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Quotation List</h1>

      {showQuotationForm ? (
        <Modal
          isOpen={showQuotationForm}
          onClose={handleCloseQuotationForm}
          title="Create Quotation"
        >
          <QuotationForm onSaveSuccess={handleCloseQuotationForm} />
        </Modal>
      ) : (
        <>
          <div className="flex items-center justify-end gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                <option value="asc">Sort by: Oldest First</option>
                <option value="desc">Sort by: Latest First</option>
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
                onClick={handleCreateQuotation}
                className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                Create Quotation
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 mb-2 md:grid-cols-2 gap-4">
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
          />
        </>
      )}
    </div>
  );
};

export default QuotationList;
