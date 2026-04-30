import React, { useState, useEffect, useCallback } from "react";
import { FiFilter, FiPrinter, FiEdit, FiTrash2 } from "react-icons/fi";
import EmployeeInfoForm from "./EmployeeInfoForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import employeeService from "../../services/employeeService";
import Cards from "../../components/common/Cards";
import cardData from "../configs/employee/employeeCard.json";

interface Option {
  value: string;
  label: string;
}

interface Employee {
  id?: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  department?: string;
  departmentName?: string;
  position?: string;
  designation?: string;
  designationName?: string;
  status?: string;
  dateOfJoining?: string;
  salary?: number;
  reportingManager?: string;
  location?: string;
  active?: boolean;
  departmentId?: number;
  typeOfEmployment?: string;
  dateOfBirth?: string;
  basicSalary?: number;
  esiApp?: boolean;
  pfApp?: boolean;
  bankName?: string;
  bankAcNo?: string;
  fathersName?: string;
  imageUrl?: string;
}

interface FilterState {
  department: Option[];
  position: Option[];
  status: Option[];
  location: Option[];
}

interface CardInfo {
  title: string;
  value: string | number;
  description: string;
  icon: string;
}

// Mock Modal Component
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Mock Employee Form Component
const EmployeeForm: React.FC<{
  employee?: Employee | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ employee, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    department: employee?.department || "",
    position: employee?.position || "",
    status: employee?.status || "Active",
    dateOfJoining: employee?.dateOfJoining || "",
    location: employee?.location || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting employee data:", formData);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          >
            <option value="">Select Department</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Date of Joining
          </label>
          <input
            type="date"
            value={formData.dateOfJoining}
            onChange={(e) =>
              setFormData({ ...formData, dateOfJoining: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {employee ? "Update" : "Create"} Employee
        </button>
      </div>
    </form>
  );
};

// Mock CommonTable Component
const CommonTable: React.FC<{
  columns: any[];
  data: any[];
  loading: boolean;
  total: number;
  currentPage: number;
  onPageChange: (page: number, size: number) => void;
  pagination: boolean;
  onToggleFilter: () => void;
  showFilter: boolean;
  actions?: any[];
}> = ({
  columns,
  data,
  loading,
  total,
  currentPage,
  onPageChange,
  actions,
  onToggleFilter,
  showFilter,
}) => {
  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Total Records: {total}</h3>
        <button
          onClick={onToggleFilter}
          className="flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-gray-50"
        >
          <FiFilter />
          {showFilter ? "Hide" : "Show"} Filters
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {col.title}
                    </th>
                  ))}
                  {actions && actions.length > 0 && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {row[col.dataIndex]}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {actions.map((action, actionIdx) => (
                            <button
                              key={actionIdx}
                              onClick={() => action.onClick(row, idx)}
                              className="text-blue-600 hover:text-blue-800"
                              title={action.label}
                            >
                              {action.icon || action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, total)} of {total} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1, pageSize)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1, pageSize)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const EmployeeList: React.FC = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [filters, setFilters] = useState<FilterState>({
    department: [],
    position: [],
    status: [],
    location: [],
  });
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [headerInfo, setHeaderInfo] = useState<CardInfo[]>([
    {
      title: "Total Employees",
      value: "0",
      description: "Total number of employees.",
      icon: "FaUsers",
    },
    {
      title: "New This Month",
      value: "0",
      description: "New employees added this month.",
      icon: "FaCalendarAlt",
    },
    {
      title: "On Leave",
      value: "0",
      description: "Employees currently on leave.",
      icon: "FaUmbrellaBeach",
    },
    {
      title: "Active Departments",
      value: "0",
      description: "Total active departments.",
      icon: "FaBuilding",
    },
  ]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const columns = [
    { key: "employeeId", title: "Employee ID", dataIndex: "employeeId" },
    { key: "firstName", title: "First Name", dataIndex: "firstName" },
    { key: "lastName", title: "Last Name", dataIndex: "lastName" },
    { key: "departmentName", title: "Department", dataIndex: "departmentName" },
    {
      key: "designationName",
      title: "Designation",
      dataIndex: "designationName",
    },
    {
      key: "dateOfJoining",
      title: "Date of Joining",
      dataIndex: "dateOfJoining",
    },
    {
      key: "active",
      title: "Status",
      dataIndex: "active",
      render: (value: boolean) => (value ? "Active" : "Inactive"),
    },
  ];

  const fetchEmployeeCards = async () => {
    setCardsLoading(true);
    try {
      const res = await employeeService.getEmployeeCards();
      if (!res.success) {
        throw new Error(res.message || "Failed to fetch cards");
      }
      const summaryData = res.data || {};

      // Merge config with API data
      const mergedData = cardData.map((card: any) => ({
        ...card,
        value: summaryData[card.field] ?? 0,
        growth: summaryData[card.growthField ?? ""] ?? 0,
        rate: summaryData[card.rateField ?? ""] ?? 0,
      }));
      setHeaderInfo(mergedData);
    } catch (error: any) {
      console.error("Error fetching employee cards:", error);
      toast.error(error?.message || "Failed to load employee card data");
    } finally {
      setCardsLoading(false);
    }
  };

  const fetchEmployees = async (page: number, size: number) => {
    setLoading(true);
    try {
      // Fetch employees from API
      const result = await employeeService.getEmployees(page, size);

      // Map API response to Employee interface
      const apiData = Array.isArray(result.data)
        ? result.data
        : result.data?.items || [];
      const mappedEmployees: Employee[] = apiData.map((emp: any) => ({
        id: emp.id,
        employeeId: emp.employeeId || "",
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.permEmail || emp.commEmail || "",
        phone: emp.permMobile || emp.permTelephone || "",
        department: emp.departmentId?.toString() || "",
        departmentName: emp.departmentName || "",
        position: emp.designation || "",
        designation: emp.designation,
        designationName: emp.designationName || "",
        status: emp.active ? "Active" : "Inactive",
        dateOfJoining: emp.dateOfJoining
          ? new Date(emp.dateOfJoining).toLocaleDateString()
          : "",
        salary: emp.basicSalary || 0,
        reportingManager: emp.reportManager || "",
        location: emp.permCity || "",
        active: emp.active || false,
        departmentId: emp.departmentId,
        typeOfEmployment: emp.typeOfEmployment,
        dateOfBirth: emp.dateOfBirth
          ? new Date(emp.dateOfBirth).toLocaleDateString()
          : "",
        basicSalary: emp.basicSalary,
        esiApp: emp.esiApp,
        pfApp: emp.pfApp,
        bankName: emp.bankName,
        bankAcNo: emp.bankAcNo,
        fathersName: emp.fathersName,
        imageUrl: emp.imageUrl,
      }));

      let filteredData = mappedEmployees;

      // Apply search filter
      if (searchQuery) {
        filteredData = filteredData.filter(
          (emp) =>
            emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Apply filters
      if (filtersApplied) {
        if (filters.department.length > 0) {
          filteredData = filteredData.filter((emp) =>
            filters.department.some((d) => d.value === emp.department),
          );
        }
        if (filters.status.length > 0) {
          filteredData = filteredData.filter((emp) =>
            filters.status.some((s) => s.value === emp.status),
          );
        }
      }

      setEmployees(filteredData);
      setTotal(filteredData.length);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast.error(error.message || "Failed to fetch employees");
      setEmployees([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeCards();
  }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchEmployees(currentPage, pageSize);
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
  };

  const handleSearchClick = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setFiltersApplied(true);
    setCurrentPage(1);
    fetchEmployees(1, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({
      department: [],
      position: [],
      status: [],
      location: [],
    });
    setSearchInput("");
    setSearchQuery("");
    setFiltersApplied(false);
    setCurrentPage(1);
    fetchEmployees(1, pageSize);
  };

  const handleExport = (format: string) => {
    console.log("Exporting in format:", format);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const OpenEmployeeForm = () => {
    navigate("/employeeform");
  };

  const handleCreateEmployee = useCallback(() => {
    setSelectedEmployee(null);
    setShowEmployeeForm(true);
  }, []);

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`,
      )
    ) {
      try {
        if (employee.id) {
          await employeeService.deleteEmployee(employee.id);
          toast.success("Employee deleted successfully");
          fetchEmployees(currentPage, pageSize);
        }
      } catch (error: any) {
        console.error("Error deleting employee:", error);
        toast.error(error.message || "Failed to delete employee");
      }
    }
  };

  const handleFormSuccess = () => {
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
    fetchEmployees(currentPage, pageSize);
  };

  const handleFormCancel = () => {
    setShowEmployeeForm(false);
    setSelectedEmployee(null);
  };

  const actions = [
    {
      label: "Edit",
      icon: <FiEdit size={16} />,
      onClick: (record: Employee) => handleEditEmployee(record),
    },
    {
      label: "Delete",
      icon: <FiTrash2 size={16} />,
      onClick: (record: Employee) => handleDeleteEmployee(record),
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Employee List</h1>

      {/* Header with Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div></div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
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
            onClick={OpenEmployeeForm}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            + Create Employee
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cardsLoading
          ? [0, 1, 2, 3].map((i) => (
              <div
                key={`loading-${i}`}
                className="bg-gray-100 rounded-lg p-4 animate-pulse h-32"
              ></div>
            ))
          : headerInfo.map((card: any, index: number) => (
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

      {/* Tabs */}
      <div className="flex gap-0 mb-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium transition ${
            true
              ? "text-orange-500 border-b-2 border-orange-500"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Employees
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search employees..."
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset Filters
            </button>
            <button
              onClick={handleSearchClick}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Search
            </button>
          </div>
        </div>
      )}

      <CommonTable
        columns={columns}
        data={employees}
        loading={loading}
        total={total}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pagination={true}
        onToggleFilter={() => setShowFilters((prev) => !prev)}
        showFilter={showFilters}
        actions={actions}
      />

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <Modal
          isOpen={showEmployeeForm}
          onClose={handleFormCancel}
          title={selectedEmployee ? "Edit Employee" : "Create New Employee"}
        >
          <EmployeeInfoForm
            employee={selectedEmployee || undefined}
            isEditMode={!!selectedEmployee}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            showHeader={false}
          />
        </Modal>
      )}
    </div>
  );
};

export default EmployeeList;
