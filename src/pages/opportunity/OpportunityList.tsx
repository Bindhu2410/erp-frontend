import React, { useState, useEffect, useCallback } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiPrinter } from "react-icons/fi";
import OpportunityFilters from "../../components/common/OpportunityFilters";
import OpportunityForm from "./OpportunityForm";
import Cards from "../../components/common/Cards";
import cardData from "../configs/lead/opportunityCard.json";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../components/common/FormateDate";
import api from "../../services/api";
import DemoForm from "../demo/DemoForm";
import { useUser } from "../../context/UserContext";

interface Option {
  value: string;
  label: string;
}

interface Opportunity {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number | null;
  dateUpdated?: string | null;
  opportunityId: string;
  opportunityFor: string;
  leadId?: string;
  opportunityName: string;
  opportunityType: string;
  status: string;
  stage: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  expectedClosingDate: string;
  territory: string;
  territoryName?: string | null;
  salesRep: string;
  salesRepresentative?: string | null;
  estimatedValue: number;
  actualValue: number;
  businessChallenge?: string | null;
  isActive?: boolean;
  comments?: string | null;
  customerName: string;
  cityName?: string | null;
  stateName?: string | null;
  probabilityOfWinning?: number | null;
  competitorName?: string | null;
}
interface FilterState {
  territory: Option[];
  customerName: Option[];
  status: Option[];
  stage: Option[];
  opportunityType: Option[];
}
interface CardInfo {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}

const OpportunityList: React.FC = () => {
  // State to store all items from the grid API
  const [products, setProducts] = useState<any[]>([]);
  const statusOptions: Option[] = [
    { value: "Identified", label: "Identified" },
    { value: "Solution Presentation", label: "Solution Presentation" },
    { value: "Proposal", label: "Proposal" },
    { value: "Negotiation", label: "Negotiation" },
    { value: "Closed Won", label: "Closed Won" },
  ];

  const stageOptions: Option[] = [
    { value: "qualification", label: "Qualification" },
    { value: "proposal", label: "Proposal" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closure", label: "Closure" },
  ];

  const opportunityTypeOptions: Option[] = [
    { value: "sales", label: "Sales" },
    { value: "maintenance", label: "Maintenance" },
    { value: "support", label: "Support" },
  ];

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  console.log(opportunities, "con");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid" | "kanban">("list");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [headerInfo, setHeaderInfo] = useState<CardInfo[]>(cardData);
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    customerName: [],
    status: [],
    stage: [],
    opportunityType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const { user, role } = useUser();
  const [showOppForm, setShowOppForm] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<Opportunity | null>(null);

  // Columns for the table: only opportunity fields (no item/product columns)
  const columns = [
    { key: "opportunityId", title: "Opp ID", dataIndex: "opportunityId" },
    { key: "customerName", title: "Customer Name", dataIndex: "customerName" },
    { key: "status", title: "Status", dataIndex: "status" },

    { key: "contactName", title: "Contact Name", dataIndex: "contactName" },
    {
      key: "contactMobileNo",
      title: "Contact Phone",
      dataIndex: "contactMobileNo",
    },
    {
      key: "expectedClosingDate",
      title: "Expected Closing",
      dataIndex: "expectedClosingDate",
    },
    // { key: "estimatedValue", title: "Est. Value", dataIndex: "estimatedValue" },
    // { key: "actualValue", title: "Actual Value", dataIndex: "actualValue" },
  ];

  const fetchOpportunities = async (page: number, size: number) => {
    setLoading(true);
    try {
      const requestBody = {
        SearchText: searchQuery || searchInput || null,
        CustomerNames: filtersApplied
          ? filters.customerName.map((c) => c.value)
          : null,
        Statuses: filtersApplied ? filters.status.map((s) => s.value) : null,
        OpportunityTypes: filtersApplied
          ? filters.opportunityType.map((t) => t.value)
          : null,
        LeadIds: null,
        PageNumber: page,
        PageSize: size,
        OrderBy: "date_created",
        OrderDirection: sortOrder.toUpperCase(),
        UserCreated: user?.userId ?? null,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/SalesOpportunity/grid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      );

      const data = await response.json();
      // Only show one row per opportunity (no items)
      const tableData: any[] = data.results.map((entry: any) => {
        const opp = entry.opportunity;
        return {
          ...opp,
          expectedClosingDate: formatDate(opp.expectedCompletion),
        };
      });
      setOpportunities(tableData);
      setTotal(data.totalRecords || tableData.length);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setOpportunities([]);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch card values from API and update headerInfo
  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const response = await api.get(
          `SalesOpportunity/cards-status?userId=${user?.userId}`,
        );
        const apiData = response.data || response; // Adjust based on your api service's response structure
        // Map API response to cardData config by title (case-insensitive
        const updatedCards = cardData.map((card) => ({
          // Try to find a matching card in API response by title (case-insensitive
          ...card,
          value: apiData[card.id] ?? card.value,
        }));
        setHeaderInfo(updatedCards);
      } catch (error) {
        // Fallback to static config if API fails
        console.error("Error fetching card info:", error);
      }
    };
    fetchCardInfo();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchOpportunities(currentPage, pageSize);
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

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    fetchOpportunities(1, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      territory: [],
      customerName: [],
      status: [],
      stage: [],
      opportunityType: [],
    });
    setSearchInput("");
    setSearchQuery("");
    setFiltersApplied(false);
    setCurrentPage(1);
    fetchOpportunities(1, pageSize);
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (
    opportunityId: string,
    newStatus: string,
    reason: string,
  ) => {
    try {
      // Call API to update opportunity status
      await api.put(`SalesOpportunity/${opportunityId}/status`, {
        status: newStatus,
        statusChangeReason: reason,
      });

      // Update the opportunity in the local state
      setOpportunities((prevOpportunities) =>
        prevOpportunities.map((opportunity) =>
          opportunity.opportunityId === opportunityId
            ? { ...opportunity, status: newStatus }
            : opportunity,
        ),
      );

      // Refetch opportunities to ensure all data is up-to-date
      fetchOpportunities(currentPage, pageSize);
    } catch (error) {
      console.error("Error updating opportunity status:", error);
      // You could add error notification here
    }
  };

  const handleCreateOpportunity = useCallback(() => {
    setShowOppForm(true);
  }, []);
  const actions = [
    {
      label: "Request Demo",
      onClick: (record: any, index: number) => {
        setSelectedOpportunity(record);
        console.log(record, "record");
        // Set products to the items of the selected opportunity (if available)
        if (record.items && Array.isArray(record.items)) {
          setProducts(record.items);
        } else {
          setProducts([]);
        }
        setModal(true);
      },
      type: "demo",
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Opportunity List</h1>{" "}
      {showOppForm ? (
        <Modal
          isOpen={showOppForm}
          onClose={() => setShowOppForm(false)}
          title="Opportunity Details"
        >
          <OpportunityForm
            onClose={() => setShowOppForm(false)}
            onSuccess={() => {
              setShowOppForm(false);
              fetchOpportunities(currentPage, pageSize);
            }}
          />
        </Modal>
      ) : (
        <>
          <div className="flex items-center justify-end gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
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
<<<<<<< Updated upstream
                </button> */}

                {/* </button> */}
                {/* <button
                  onClick={() => setViewMode("kanban")}
                  className={`p-2 transition border-l border-gray-300 ${
                    viewMode === "kanban"
                      ? "bg-gray-200 text-black"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Kanban Board"
                >
                  <FiGrid size={18} />
                </button> */}
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
              >
                {" "}
                <option value="desc">Sort by: Latest First</option>
                <option value="asc">Sort by: Oldest First</option>
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
                onClick={handleCreateOpportunity}
                className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                Create Opportunity
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 mb-2 md:grid-cols-2 gap-4">
            {headerInfo.map((card: CardInfo, index: number) => (
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
            <OpportunityFilters
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

          {viewMode === "list" && (
            <CommonTable
              columns={columns}
              data={opportunities}
              loading={loading}
              total={total}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              pagination={true}
              onToggleFilter={() => setShowFilters((prev) => !prev)}
              showFilter={showFilters}
              actions={actions}
            />
          )}
        </>
      )}
      <Modal
        isOpen={modal}
        onClose={() => setModal(false)}
        title="Request Demo"
      >
        <DemoForm
          onClose={() => setModal(false)}
          demoData={
            selectedOpportunity
              ? {
                  opportunityId: selectedOpportunity.opportunityId,
                  oppuserfrndID: selectedOpportunity.opportunityId,

                  customerName: selectedOpportunity.customerName,
                  demoContact: selectedOpportunity.contactName,
                  contactMobileNum: selectedOpportunity.contactPhone,
                }
              : { opportunityId: "", customerName: "", contactMobileNo: "" }
          }
          options={products}
          opportunityNumericId={selectedOpportunity?.id?.toString()}
        />
      </Modal>
    </div>
  );
};

export default OpportunityList;
