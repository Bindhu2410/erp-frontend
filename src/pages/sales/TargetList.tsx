import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MultiValue } from "react-select";
import { FiPrinter, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";
import CommonTable from "../../components/CommonTable";
import TargetFilters from "../../components/target/TargetFilters";
import Cards from "../../components/common/Cards";
import ConfirmBox from "../../components/common/ConfirmBox";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import {
  TargetTableRow,
  TargetStatus,
  TargetFilterState,
  TargetGridResponse,
  Option,
} from "../../types/target";
import cardData from "../configs/sales/targetCard.json";
import mockTargets from "./mockTargets";

interface CardInfo {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  id: string;
}

const TargetList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [targets, setTargets] = useState<TargetTableRow[]>([]);
  const [allTargets, setAllTargets] = useState<TargetTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [headerInfo, setHeaderInfo] = useState<CardInfo[]>(cardData);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<TargetTableRow | null>(null);
  const [territoryOptions, setTerritoryOptions] = useState<Option[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<Option[]>([]);

  const statusOptions: Option[] = [
    { value: "Draft", label: "Draft" },
    { value: "Approved", label: "Approved" },
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const [filters, setFilters] = useState<TargetFilterState>({
    territory: [],
    employee: [],
    status: [],
    fromDate: undefined,
    toDate: undefined,
  });

  const getStatusBadgeClass = (status: TargetStatus): string => {
    const statusClasses: Record<TargetStatus, string> = {
      Draft: "bg-gray-100 text-gray-800",
      Approved: "bg-blue-100 text-blue-800",
      Active: "bg-green-100 text-green-800",
      Completed: "bg-purple-100 text-purple-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const parseDate = (value?: string) => {
    if (!value) return undefined;
    if (value.includes("/")) {
      const [day, month, year] = value.split("/");
      const parsed = new Date(`${year}-${month}-${day}`);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const handleViewTarget = useCallback(
    (record: TargetTableRow) => {
      const targetId = record.targetId || record.id;
      navigate(`/sales/targets/${targetId}`);
    },
    [navigate]
  );

  const handleEditTarget = useCallback(
    (record: TargetTableRow) => {
      const targetId = record.targetId || record.id;
      navigate(`/sales/targets/${targetId}/edit`);
    },
    [navigate]
  );

  const handleDeleteClick = useCallback((record: TargetTableRow) => {
    setTargetToDelete(record);
    setShowDeleteModal(true);
  }, []);

  const columns = [
    {
      key: "docId",
      title: "Doc ID",
      dataIndex: "docId",
      render: (record: TargetTableRow) => (
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => handleViewTarget(record)}
        >
          {record.docId}
        </span>
      ),
    },
    { key: "territory", title: "Territory", dataIndex: "territory" },
    { key: "employee", title: "Employee", dataIndex: "employeeName" },
    { key: "product", title: "Product", dataIndex: "productName" },
    { key: "model", title: "Model", dataIndex: "modelName" },
    { key: "qty", title: "Qty", dataIndex: "qty" },
    { key: "targetAmount", title: "Target Amt", dataIndex: "targetAmount" },
    { key: "achievedAmount", title: "Achieved", dataIndex: "achievedAmount" },
    {
      key: "percentage",
      title: "Achievement %",
      dataIndex: "achievementPercentage",
      render: (record: TargetTableRow) =>
        `${record.achievementPercentage.toFixed(2)}%`,
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (record: TargetTableRow) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(record.status)}`}>
          {record.status}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: <FiEye />,
      onClick: (record: TargetTableRow) => handleViewTarget(record),
      type: "view",
    },
    {
      label: <FiEdit2 />,
      onClick: (record: TargetTableRow) => handleEditTarget(record),
      type: "edit",
    },
    {
      label: <FiTrash2 />,
      onClick: (record: TargetTableRow) => handleDeleteClick(record),
      type: "delete",
    },
  ];

  const applyFiltersToData = useCallback(() => {
    const search = searchInput.trim().toLowerCase();
    const filtered = allTargets.filter((t) => {
      const matchesTerritory =
        !filters.territory.length ||
        filters.territory.some(
          (opt) =>
            t.territoryId === opt.value ||
            t.territory.toLowerCase().includes(opt.label.toLowerCase())
        );
      const matchesEmployee =
        !filters.employee.length ||
        filters.employee.some(
          (opt) =>
            t.employeeId === opt.value ||
            t.employeeName.toLowerCase().includes(opt.label.toLowerCase())
        );
      const matchesStatus =
        !filters.status.length ||
        filters.status.some((opt) => t.status === opt.value);
      const from = parseDate(filters.fromDate);
      const to = parseDate(filters.toDate);
      const recordFrom = parseDate(t.fromDate);
      const recordTo = parseDate(t.toDate);
      const matchesDate =
        (!from || (recordFrom && recordFrom >= from)) &&
        (!to || (recordTo && recordTo <= to));
      const matchesSearch =
        !search ||
        [t.docId, t.territory, t.employeeName, t.productName, t.modelName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search));
      return matchesTerritory && matchesEmployee && matchesStatus && matchesDate && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const aDate = parseDate(a.createdDate) || parseDate(a.fromDate) || new Date(0);
      const bDate = parseDate(b.createdDate) || parseDate(b.fromDate) || new Date(0);
      return sortOrder === "latest"
        ? bDate.getTime() - aDate.getTime()
        : aDate.getTime() - bDate.getTime();
    });

    setTargets(sorted);
    setTotal(sorted.length);
    setCurrentPage(1);
    setFiltersApplied(true);
  }, [allTargets, filters, searchInput, sortOrder]);

  const loadMockData = () => {
    setTargets(mockTargets);
    setAllTargets(mockTargets);
    setTotal(mockTargets.length);
  };

  const fetchTargets = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const response = await api.get(`Target/list?userId=${user?.userId}`);
        if (response.data && Array.isArray(response.data)) {
          processTargetData(response.data);
          setLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.warn("API call failed, using mock data");
      }
      loadMockData();
    } finally {
      setLoading(false);
    }
  }, [user?.userId]);

  const processTargetData = (results: TargetGridResponse[]) => {
    const tableData: TargetTableRow[] = results.flatMap((entry) => {
      const master = entry.target;
      const masterId = master.id ? String(master.id) : "";
      const details = entry.details || [];
      if (details.length === 0) {
        return {
          ...master,
          targetId: masterId,
          productName: "N/A",
          modelName: "N/A",
          qty: 0,
          targetAmount: 0,
          achievedAmount: 0,
          achievementPercentage: 0,
        };
      }
      return details.map((detail, idx) => ({
        ...master,
        id: `${masterId}-${idx}`,
        targetId: masterId,
        productName: detail.productName,
        modelName: detail.modelName || "N/A",
        qty: detail.qty,
        targetAmount: detail.targetAmount,
        achievedAmount: detail.achievedAmount,
        achievementPercentage: detail.targetAmount
          ? (detail.achievedAmount / detail.targetAmount) * 100
          : 0,
      }));
    });
    setTargets(tableData);
    setAllTargets(tableData);
    setTotal(tableData.length);
  };

  const handleCreateTarget = useCallback(() => {
    navigate("/sales/targets/new");
  }, [navigate]);

  const handleConfirmDelete = useCallback(async () => {
    if (!targetToDelete) return;
    const masterId = targetToDelete.targetId || targetToDelete.id;
    try {
      try {
        await api.delete(`Target/${masterId}`);
      } catch (apiError) {
        console.warn("API delete not available, removing from local state");
      }
      setTargets((prev) => prev.filter((t) => t.targetId !== masterId));
      setAllTargets((prev) => prev.filter((t) => t.targetId !== masterId));
      setShowDeleteModal(false);
      setTargetToDelete(null);
      setTotal((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Error deleting target:", error);
    }
  }, [targetToDelete]);

  const handlePageChange = useCallback((page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof TargetFilterState, value: MultiValue<Option>) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleDateChange = useCallback(
    (key: "fromDate" | "toDate", value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value || undefined }));
    },
    []
  );

  const handleApplyFilters = useCallback(() => {
    applyFiltersToData();
  }, [applyFiltersToData]);

  const handleResetFilters = useCallback(() => {
    setFilters({ territory: [], employee: [], status: [], fromDate: undefined, toDate: undefined });
    setSearchInput("");
    setFiltersApplied(false);
    setCurrentPage(1);
    setTargets(allTargets);
    setTotal(allTargets.length);
  }, [allTargets]);

  const handleExport = useCallback(
    (format: string) => {
      if (format === "CSV") {
        const headers = ["Doc ID", "Territory", "Employee", "Product", "Model", "Qty", "Target Amount", "Achieved Amount", "%", "Status"];
        const rows = targets.map((t) => [
          t.docId, t.territory, t.employeeName, t.productName, t.modelName,
          t.qty, t.targetAmount, t.achievedAmount, t.achievementPercentage.toFixed(1), t.status,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `targets_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        setShowExportMenu(false);
      }
    },
    [targets]
  );

  useEffect(() => {
    const fetchCardInfo = async () => {
      try {
        const response = await api.get(`Target/summary?userId=${user?.userId}`);
        const summary = response.data;
        const updatedCards = cardData.map((card: CardInfo) => ({
          ...card,
          value:
            card.id === "totalTargetAmount"
              ? `INR ${(summary?.totalTargetAmount || 0).toLocaleString("en-IN")}`
              : card.id === "totalAchievedAmount"
              ? `INR ${(summary?.totalAchievedAmount || 0).toLocaleString("en-IN")}`
              : card.id === "achievementPercentage"
              ? `${(summary?.achievementPercentage || 0).toFixed(1)}%`
              : `INR ${(summary?.remainingAmount || 0).toLocaleString("en-IN")}`,
        }));
        setHeaderInfo(updatedCards);
      } catch (error) {
        console.warn("Using static card data");
      }
    };
    if (user?.userId) fetchCardInfo();
  }, [user?.userId]);

  useEffect(() => {
    if (user?.userId) fetchTargets();
  }, [user?.userId, fetchTargets]);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const territories = await api.get("Territory/list");
        setTerritoryOptions(
          territories.data?.map((t: any) => ({ value: t.id, label: t.name })) || []
        );
      } catch (error) {
        console.warn("Could not fetch territories");
      }
      try {
        const employees = await api.get("Employee");
        setEmployeeOptions(
          employees.data?.map((e: any) => ({ value: e.id?.toString(), label: e.name || e.employeeName })) || []
        );
      } catch (error) {
        console.warn("Could not fetch employees");
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (allTargets.length) {
      const territorySet = Array.from(new Set(allTargets.map((t) => t.territory)));
      const employeeSet = Array.from(new Set(allTargets.map((t) => t.employeeName)));
      setTerritoryOptions((prev) =>
        prev.length ? prev : territorySet.map((name) => ({ value: name, label: name }))
      );
      setEmployeeOptions((prev) =>
        prev.length ? prev : employeeSet.map((name) => ({ value: name, label: name }))
      );
    }
  }, [allTargets]);

  useEffect(() => {
    if (filtersApplied) applyFiltersToData();
  }, [sortOrder, filtersApplied, applyFiltersToData]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Target Details</h1>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "latest" | "oldest")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#FF6B35]"
          >
            <option value="latest">Sort by: Latest First</option>
            <option value="oldest">Sort by: Oldest First</option>
          </select>
          <button
            onClick={() => window.print()}
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
                <button
                  onClick={() => handleExport("CSV")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  CSV
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleCreateTarget}
            className="bg-[#FF6B35] hover:bg-[#FF8355] text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaPlus size={16} />
            Create Target
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {headerInfo.map((card, idx) => (
          <Cards
            key={card.id}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
            color={idx}
          />
        ))}
      </div>

      {/* Table */}
      <CommonTable
        columns={columns}
        data={targets}
        loading={loading}
        total={total}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pagination={true}
        rowKey="id"
        actions={actions}
        showCheckboxes={false}
        showFilter={showFilters}
        onToggleFilter={() => setShowFilters((prev) => !prev)}
        pageSizeProp={pageSize}
        onPageSizeChange={(size: number) => setPageSize(size)}
        filterContent={
          <TargetFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onDateChange={handleDateChange}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            territoryOptions={territoryOptions}
            employeeOptions={employeeOptions}
            statusOptions={statusOptions}
          />
        }
      />

      {/* Delete Confirmation */}
      <ConfirmBox
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => handleConfirmDelete()}
        id={targetToDelete?.targetId || targetToDelete?.id || ""}
        title={targetToDelete?.docId || ""}
      />
    </div>
  );
};

export default TargetList;
