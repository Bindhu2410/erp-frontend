import Papa from "papaparse";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiPrinter } from "react-icons/fi";
import LeadFilters from "../../components/common/FilterPanel";
import cardData from "../configs/lead/leadCard.json";
import Cards from "../../components/common/Cards";
import Modal from "../../components/common/Modal";
import api from "../../services/api";
import LeadForm from "./LeadForm";
import BulkLeadUpload from "../../components/lead/BulkLeadUpload";
import CardCapture, { CapturedImage } from "../../components/lead/CardCapture";
import VoiceInput from "../../components/lead/VoiceInput";
import FileUpload from "../../components/lead/FileUpload";
import { useUser } from "../../context/UserContext";
import { FaWpforms } from "react-icons/fa";

interface Option {
  value: string;
  label: string;
}

interface Lead {
  id?: number;
  leadId: string;
  contactName: string;
  email: string;
  customerName: string;
  territoryName?: string;
  leadType: string;
  score: string;
  status: string;
  createdAt?: string;
  dateCreated?: string;
  qualificationStatus?: string;
  areaName?: string;
  contactMobileNo?: string;
  landLineNo?: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

interface LeadGridRequest {
  searchText: string;
  zones: string[];
  customerNames: string[];
  territories: string[];
  statuses: string[];
  scores: string[];
  leadTypes: string[];
  pageNumber: number;
  pageSize: number;
  orderBy: string;
  orderDirection: string;
  selectedLeadIds: (string | number)[];
  userCreated: number;
  roleName?: string;
}

const LeadList: React.FC = () => {
  const statusOptions: Option[] = [
    { value: "new", label: "New" },
    { value: "qualified", label: "Qualified" },
    { value: "disqualified", label: "Disqualified" },
    { value: "converted", label: "Converted" },
  ];

  const leadTypeOptions: Option[] = [
    { value: "Clinic", label: "Clinic" },
    { value: "Hospital", label: "Hospital" },
    { value: "Individual", label: "Individual" },
  ];

  const [leads, setLeads] = useState<Lead[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [uploadError, setUploadError] = useState<string>("");
  const [tempLeads, setTempLeads] = useState<Lead[]>([]); // For temp leads tab
  const [activeTab, setActiveTab] = useState<"leads" | "tempLeads">("leads");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [headerInfo, setHeaderInfo] = useState<any>(cardData);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(),
  );

  const [leadStatus, setLeadStatus] = useState<string>("Lead");
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode] = useState<"list" | "grid" | "kanban">("list");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  // const [activeTab, setActiveTab] = useState<"my" | "all">("my");
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [selectedTempLead, setSelectedTempLead] = useState<any>(null);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showCardCapture, setShowCardCapture] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { user, role } = useUser();

  // Helper: get lead IDs linked to activities assigned to this user (Sales Rep visibility)
  const getActivityLinkedLeadIds = async (
    userId: number,
  ): Promise<string[]> => {
    try {
      const [tasks, calls, meetings, events] = await Promise.allSettled([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityTask`).then((r) =>
          r.json(),
        ),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall`).then((r) =>
          r.json(),
        ),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityMeeting`).then((r) =>
          r.json(),
        ),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent`).then((r) =>
          r.json(),
        ),
      ]);

      const leadIds = new Set<string>();

      const extractIds = (
        result: PromiseSettledResult<any[]>,
        assignedField: string,
      ) => {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
          result.value.forEach((item: any) => {
            const assignedTo =
              item[assignedField] ??
              item.assignedtouserid ??
              item.assignedToUserId;
            const stageItemId = item.stageItemId ?? item.stage_item_id;
            if (Number(assignedTo) === userId && stageItemId) {
              leadIds.add(String(stageItemId));
            }
          });
        }
      };

      extractIds(tasks, "assignedtouserid");
      extractIds(calls, "assignedtouserid");
      extractIds(meetings, "assignedtouserid");
      extractIds(events, "assignedtouserid");

      return Array.from(leadIds);
    } catch {
      return [];
    }
  };

  // Helper: get team member user IDs for Area Manager
  const getTeamMemberUserIds = async (userId: number): Promise<number[]> => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/UmTeamHierarchy`);
      const data = await res.json();
      const hierarchy: any[] = data?.data || data || [];
      const addRecursive = (parentId: number, ids: Set<number>) => {
        hierarchy
          .filter((h: any) => Number(h.parentUserId) === parentId)
          .forEach((h: any) => {
            const uid = Number(h.userId);
            if (!ids.has(uid)) {
              ids.add(uid);
              addRecursive(uid, ids);
            }
          });
      };
      const ids = new Set<number>();
      addRecursive(userId, ids);
      return Array.from(ids);
    } catch {
      return [];
    }
  };
  const columns = useMemo(() => {
    if (activeTab === "leads") {
      return [
        { key: "id", title: "LeadID", dataIndex: "leadId" },
        { key: "name", title: "Name", dataIndex: "contactName" },
        { key: "email", title: "Email", dataIndex: "email" },
        {
          key: "company",
          title: "Hospital/Clinic/Individual",
          dataIndex: "customerName",
        },
        ...(String(role?.roleName).toLowerCase() !== "sales rep"
          ? [
            {
              key: "userCreatedUsername",
              title: "Created By",
              dataIndex: "userCreatedUsername",
            },
            {
              key: "userCreatedRolename",
              title: "Role",
              dataIndex: "userCreatedRolename",
            },
          ]
          : []),
        { key: "leadType", title: "Lead Type", dataIndex: "leadType" },
        { key: "status", title: "Status", dataIndex: "status" },
      ];
    } else if (activeTab === "tempLeads") {
      return [
        {
          key: "customer_name",
          title: "Customer Name",
          dataIndex: "customer_name",
        },
        {
          key: "contact_name",
          title: "Contact Name",
          dataIndex: "contact_name",
        },
        { key: "email", title: "Email", dataIndex: "email" },
        {
          key: "contact_mobile_no",
          title: "Mobile No",
          dataIndex: "contact_mobile_no",
        },
        { key: "status", title: "Status", dataIndex: "status" },
      ];
    }
    return [];
  }, [role, activeTab]);

  // "Radhika@example.com"
  console.log(columns, "deredr");
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await api.get(
          `SalesLead/cards?userId=${user?.userId}`,
        );
        if (response.data) {
          const summaryData = response.data;
          const mergedData = cardData.map((card) => ({
            ...card,
            value: summaryData[card.field] ?? 0,
            growth: summaryData[card.growthField ?? ""] ?? 0,
            rate: summaryData[card.rateField ?? ""] ?? 0,
          }));
          setHeaderInfo(mergedData);
        }
      } catch (error) {
        console.error("Error fetching summary data:", error);
        setHeaderInfo([]);
      }
    };

    fetchSummaryData();
  }, []);

  const fetchLeads = useCallback(
    async (page: number, size: number) => {
      setLoading(true);
      try {
        if (activeTab === "tempLeads") {
          // Fetch temp leads from /api/SalesTempLead
          const response = await api.get("SalesTempLead");
          setTempLeads(response.data || []);
          setTotal(response.data.totalRecords || 0);
        } else {
          // Defensive: ensure all arrays are always valid
          const safeArr = (arr: any) => (Array.isArray(arr) ? arr : []);
          const mapFilterValues = (filterArray: any[]) =>
            safeArr(filterArray).map((item: any) => item.value);

          const finalSearchText = (searchQuery || searchInput || "").trim();

          const requestBody: LeadGridRequest = {
            searchText: finalSearchText,
            zones: filtersApplied ? mapFilterValues(filters.zone) : [],
            customerNames: filtersApplied
              ? mapFilterValues(filters.customerName)
              : [],
            territories: filtersApplied
              ? mapFilterValues(filters.territory)
              : [],
            statuses: filtersApplied ? mapFilterValues(filters.status) : [],
            scores: filtersApplied ? mapFilterValues(filters.score) : [],
            leadTypes: filtersApplied ? mapFilterValues(filters.leadType) : [],
            pageNumber: typeof page === "number" && !isNaN(page) ? page : 1,
            pageSize: typeof size === "number" && !isNaN(size) ? size : 10,
            orderBy: "id",
            orderDirection:
              sortOrder && typeof sortOrder === "string"
                ? sortOrder.toUpperCase()
                : "DESC",
            selectedLeadIds: Array.isArray(selectedRows)
              ? Array.from(selectedRows)
              : Array.from(selectedRows || []),
            userCreated: user?.userId || 1,
          };

          console.log(
            "[LeadList] API Request - SalesLead/grid:",
            { ...requestBody, searchText: `"${finalSearchText}"` },
            "(searchQuery: '",
            searchQuery,
            "' | searchInput: '",
            searchInput,
            "')",
          );

          const response = await api.post("SalesLead/grid", requestBody);

          console.log(
            "[LeadList] API Response - Results:",
            response.data.results,
            "Total Records:",
            response.data.totalRecords,
          );

          setLeads(response.data.results);
          setTotal(response.data.totalRecords);
        }
      } catch (error: any) {
        if (activeTab === "tempLeads") {
          setTempLeads([]);
        } else {
          setLeads([]);
        }
        setTotal(0);
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    },
    [
      filters,
      filtersApplied,
      searchQuery,
      searchInput,
      sortOrder,
      selectedRows,
      user,
      activeTab,
    ],
  );
  console.log(user, "ddd:::");
  // Defensive: Reset filters and search input on mount to avoid stale state on navigation
  useEffect(() => {
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
  }, []);

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
    fetchLeads,
  ]);

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
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

  // const handleTabChange = (tab: "my" | "all") => {
  //   setActiveTab(tab);
  //   setCurrentPage(1);
  // };

  const handleStatusChange = async (
    leadId: string,
    newStatus: string,
    reason: string,
  ) => {
    try {
      // Call API to update lead status
      await api.put(`SalesLead/${leadId}/status`, {
        status: newStatus,
        statusChangeReason: reason,
      });

      // Update the lead in t
      // he local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.leadId === leadId ? { ...lead, status: newStatus } : lead,
        ),
      );

      // Refetch leads to ensure all data is up-to-date
      fetchLeads(currentPage, pageSize);
    } catch (error) {
      console.error("Error updating lead status:", error);
      // You could add an error notification here
    }
  };

  const handleBulkUpload = async (file: File) => {
    setUploadMessage("");
    setUploadError("");
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        // Skip comment lines (e.g. lines starting with '#') so sample CSVs with a note line are ignored
        // Also strip a leading quoted comment line like "# Note: ..." which some CSVs contain
        comments: "#",
        // Remove a leading comment line even if it's quoted (e.g. '"# Note...')
        beforeFirstChunk: (chunk: string) =>
          chunk.replace(/^\s*"?\#.*(?:\r?\n)?/, ""),
        // Trim whitespace from each field value
        transform: (value: any) =>
          typeof value === "string" ? value.trim() : value,
        complete: async (results: any) => {
          // Normalize header keys to be case-insensitive and ignore spaces/underscores
          const normalizeKey = (k: string) =>
            k ? k.toString().trim().toLowerCase().replace(/\s+|_/g, "") : k;

          const mappedData = results.data
            .filter((r: any) => r && Object.keys(r).length > 0)
            .map((row: any) => {
              // build a normalized lookup for the row
              const normalizedRow: Record<string, any> = {};
              Object.keys(row || {}).forEach((k) => {
                const nk = normalizeKey(k);
                normalizedRow[nk] = row[k];
              });

              const get = (names: string[], fallback = "") => {
                for (const n of names) {
                  const v = normalizedRow[normalizeKey(n)];
                  if (v !== undefined && v !== null && v !== "") return v;
                }
                return fallback;
              };

              return {
                UserCreated: user?.userId,
                DateCreated: get(
                  ["DateCreated", "datecreated"],
                  new Date().toISOString(),
                ),
                UserUpdated: user?.userId,
                DateUpdated: get(
                  ["DateUpdated", "dateupdated"],
                  new Date().toISOString(),
                ),
                Id: 0,
                CustomerName: get(
                  ["CustomerName", "customername", "customer_name"],
                  "",
                ),
                LeadSource: get(["LeadSource", "leadsource"], "Direct"),
                ReferralSourceName: get(
                  ["ReferralSourceName", "referralsourcename"],
                  "",
                ),
                HospitalOfReferral: get(
                  ["HospitalOfReferral", "hospitalofreferral"],
                  "",
                ),
                DepartmentOfReferral: get(
                  ["DepartmentOfReferral", "departmentofreferral"],
                  "",
                ),
                SocialMedia: get(["SocialMedia", "socialmedia"], ""),
                EventDate: get(
                  ["EventDate", "eventdate"],
                  new Date().toISOString(),
                ),
                EventName: get(["EventName", "eventname"], ""),
                LeadId: get(["LeadId", "leadid"], ""),
                Status: get(["Status", "status"], ""),
                Score: get(["Score", "score"], ""),
                Comments: get(["Comments", "comments"], ""),
                LeadType: get(["LeadType", "leadtype"], ""),
                ContactName: get(["ContactName", "contactname"], ""),
                Salutation: get(["Salutation", "salutation"], ""),
                ContactMobileNo: get(
                  ["ContactMobileNo", "contactmobileno", "contact_mobile_no"],
                  "",
                ),
                LandLineNo: get(["LandLineNo", "landlineno"], ""),
                Email: get(["Email", "email"], ""),
                Fax: get(["Fax", "fax"], ""),
                DoorNo: get(["DoorNo", "doorno"], ""),
                Street: get(["Street", "street"], ""),
                Landmark: get(["Landmark", "landmark"], ""),
                Website: get(["Website", "website"], ""),
                Territory: get(["Territory", "territory"], ""),
                Area: get(["Area", "area"], ""),
                City: get(["City", "city"], ""),
                Pincode: get(["Pincode", "pincode"], ""),
                District: get(["District", "district"], ""),
                State: get(["State", "state"], ""),
              };
            });
          let allSuccess = true;
          let errorRows: number[] = [];

          try {
            await api.post("SalesLead/bulk", mappedData);
          } catch (err) {
            allSuccess = false;
            // +2 for header and 0-index
            console.error("Error uploading lead:", mappedData, err);
          }

          if (allSuccess) {
            setUploadMessage("Uploaded successfully");
            fetchLeads(currentPage, pageSize);
            setTimeout(() => {
              setShowBulkUpload(false);
              setUploadMessage("");
            }, 1500);
          } else {
            setUploadError(
              `Some rows failed to upload. Please check rows: ${errorRows.join(
                ", ",
              )}`,
            );
          }
        },
        error: (err: any) => {
          setUploadError("Error parsing CSV. Please check your file format.");
          console.error("Error parsing CSV:", err);
        },
      });
    } catch (error) {
      setUploadError("Unexpected error during upload.");
      console.error("Error uploading file:", error);
    }
  };

  const handleCardCapture = async (images: CapturedImage[][]) => {
    try {
      // Convert the captured images to form data
      const formData = new FormData();
      images.forEach((group, groupIndex) => {
        group.forEach((image, imageIndex) => {
          // Convert base64 to blob
          const imageBlob = dataURLtoBlob(image.src);
          formData.append(
            `lead${groupIndex + 1}_image${imageIndex + 1}`,
            imageBlob,
          );
        });
      });

      await api.post("SalesLead/card-capture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refresh the leads list
      fetchLeads(currentPage, pageSize);
      setShowCardCapture(false);
    } catch (error) {
      console.error("Error uploading images:", error);
    }
  };

  // Helper function to convert base64 to blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <div className="p-3 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-semibold mb-4">Lead List</h1>
      {showLeadForm && (
        <Modal
          isOpen={showLeadForm}
          onClose={() => {
            setShowLeadForm(false);
            setSelectedTempLead(null);
          }}
          title={leadStatus === "Lead" ? "Lead" : "Opportunity"}
          setLeadStatus={setLeadStatus}
        >
          <LeadForm
            onSuccess={() => fetchLeads(1, pageSize)}
            onClose={() => {
              setShowLeadForm(false);
              setSelectedTempLead(null);
            }}
            setLeadStatus={setLeadStatus}
            leadData={
              activeTab == "tempLeads"
                ? {
                  ...selectedTempLead,
                  customerName: selectedTempLead?.customer_name,
                  contactMobileNo: selectedTempLead?.contact_mobile_no,
                }
                : undefined
            }
          />
        </Modal>
      )}

      {showBulkUpload && (
        <>
          <BulkLeadUpload
            onUpload={handleBulkUpload}
            onClose={() => setShowBulkUpload(false)}
          />
          {(uploadMessage || uploadError) && (
            <div style={{ marginTop: 10, textAlign: "center" }}>
              {uploadMessage && (
                <div style={{ color: "green", fontWeight: "bold" }}>
                  {uploadMessage}
                </div>
              )}
              {uploadError && (
                <div style={{ color: "red", fontWeight: "bold" }}>
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showCardCapture && (
        <CardCapture
          onUpload={handleCardCapture}
          onClose={() => setShowCardCapture(false)}
        />
      )}

      {showVoiceInput && (
        <VoiceInput
          onSuccess={() => fetchLeads(1, pageSize)}
          onClose={() => setShowVoiceInput(false)}
        />
      )}

      {showFileUpload && (
        <FileUpload
          onSuccess={() => fetchLeads(1, pageSize)}
          onClose={() => setShowFileUpload(false)}
        />
      )}

      {!showLeadForm &&
        !showBulkUpload &&
        !showCardCapture &&
        !showVoiceInput &&
        !showFileUpload && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Sort Dropdown */}
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "ASC" | "DESC")
                  }
                  className="border border-gray-300 rounded-md px-2 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
                >
                  <option value="desc">Latest First</option>
                  <option value="asc">Oldest First</option>
                </select>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="p-1.5 sm:p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
                  title="Print"
                >
                  <FiPrinter size={16} />
                </button>

                {/* Export */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-100 flex items-center gap-1 transition"
                  >
                    Export
                    <svg
                      className="w-3 h-3"
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
                    <div className="absolute left-0 mt-2 w-36 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
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

              {/* Create Lead Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="bg-[#FF6B35] text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-lg flex items-center gap-1 hover:bg-[#ff8657] transition-colors"
                >
                  <span>+ Create Lead</span>
                  <svg
                    className="w-3 h-3"
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
                {showCreateMenu && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg z-50 py-1 border border-gray-200">
                    <button
                      onClick={() => {
                        setShowLeadForm(true);
                        setShowCreateMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Enter Details
                    </button>
                    <button
                      onClick={() => {
                        setShowBulkUpload(true);
                        setShowCreateMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Bulk Upload
                    </button>
                    {/* <button
                      onClick={() => {
                        setShowCardCapture(true);
                        setShowCreateMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Card Capture
                    </button> */}
                    <button
                      onClick={() => {
                        setShowVoiceInput(true);
                        setShowCreateMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Voice Input
                    </button>
                    <button
                      onClick={() => {
                        setShowFileUpload(true);
                        setShowCreateMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Card Upload
                    </button>
                  </div>
                )}
              </div>
            </div>
            {headerInfo.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-4 mb-2 md:grid-cols-2 gap-4">
                {headerInfo.map((card: any, index: number) => {
                  const value = card.value || 0;
                  const rateValue = card.rateField
                    ? card[card.rateField] || 0
                    : 0;
                  const growthValue = card.growthField
                    ? card[card.growthField] || 0
                    : 0;

                  let descriptionText = card.description;
                  if (card.growthField) {
                    descriptionText = descriptionText.replace(
                      "{growthField}",
                      growthValue,
                    );
                  }
                  if (card.rateField) {
                    descriptionText = descriptionText.replace(
                      "{rateField}",
                      rateValue,
                    );
                  }

                  return (
                    <Cards
                      key={index}
                      title={card.title}
                      value={value}
                      description={descriptionText}
                      icon={card.icon}
                      color={index}
                    />
                  );
                })}
              </div>
            )}
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
            {/* Tabs for Leads and Temp Leads */}
            <div className="flex overflow-hidden mb-4">
              <button
                onClick={() => setActiveTab("leads")}
                className={`px-4 py-2 transition-colors rounded-tl-md rounded-bl-md ${activeTab === "leads"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Leads
              </button>
              <button
                onClick={() => setActiveTab("tempLeads")}
                className={`px-4 py-2 rounded-tr-md rounded-br-md transition-colors border-l border-gray-300 ${activeTab === "tempLeads"
                    ? "bg-[#FF6B35] text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Temp Leads
              </button>
            </div>
            {viewMode === "list" && (
              <CommonTable
                columns={columns}
                data={activeTab === "leads" ? leads : tempLeads}
                loading={loading}
                total={activeTab === "leads" ? total : tempLeads.length}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                pagination={true}
                showCheckboxes={false}
                onSelectionChange={setSelectedRows}
                rowKey={activeTab === "leads" ? "leadId" : "id"}
                onToggleFilter={() => setShowFilters((prev) => !prev)}
                showFilter={showFilters}
                onStatusChange={handleStatusChange}
                actions={
                  activeTab === "tempLeads"
                    ? [
                      {
                        label: <FaWpforms />,
                        type: "openLeadForm",
                        onClick: (record: any) => {
                          setSelectedTempLead(record);
                          setShowLeadForm(true);
                        },
                      },
                    ]
                    : undefined
                }
              />
            )}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leads.map((lead) => (
                  <div
                    key={lead.leadId}
                    className="bg-white p-4 rounded-lg shadow"
                  >
                    <h3 className="font-medium">{lead.customerName}</h3>
                    <p className="text-sm text-gray-600">{lead.contactName}</p>
                    <div className="mt-2 flex justify-between">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {lead.status}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                        {lead.score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
    </div>
  );
};

export default LeadList;
