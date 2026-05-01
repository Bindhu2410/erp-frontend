import React, { useState, useEffect } from "react";
import { MultiValue } from "react-select";
import CommonTable from "../../components/CommonTable";
import { FiFilter, FiList, FiGrid, FiPrinter, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LeadFilters from "../../components/common/FilterPanel";
import Cards from "../../components/common/Cards";
import PaymentForm from "./PaymentForm";
import Modal from "../../components/common/Modal";

interface Option {
  value: string;
  label: string;
}

interface Payment {
  id: string;
  paymentNumber: string;
  orderNumber: string;
  customerName: string;
  paymentDate: string;
  paymentStatus: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  transactionId: string;
  remarks: string;
}

interface FilterState {
  territory: Option[];
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

const PaymentList: React.FC = () => {
  // Reset filters and search input
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
    setCurrentPage(1);
    fetchPayments(1);
  };
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    territory: [],
    zone: [],
    customerName: [],
    status: [],
    score: [],
    leadType: [],
  });
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper to get filter values for API
  const getCustomerNames = () => filters.customerName.map((opt) => opt.label);
  const getStatuses = () => filters.status.map((opt) => opt.label);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const body = {
        SearchText: searchInput,
        CustomerNames: getCustomerNames(),
        Statuses: getStatuses(),
        PageNumber: page,
        PageSize: 10,
        OrderBy: "date_created",
        OrderDirection: "DESC",
      };
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}Payments/payment-grid/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const result = await res.json();
      setData(result.data || []);
      setTotalRecords(result.totalRecords || 0);
    } catch (err) {
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
    // eslint-disable-next-line
  }, [currentPage]);

  // Refetch on search/filter apply
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

  const handleSearchClick = () => {
    setCurrentPage(1);
    fetchPayments(1);
  };

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
      { value: "completed", label: "Completed" },
      { value: "pending", label: "Pending" },
      { value: "failed", label: "Failed" },
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

  const handleFilterChange = (
    filterName: keyof FilterState,
    selectedOptions: MultiValue<Option>,
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: selectedOptions,
    }));
  };

  const columns = [
    {
      key: "id",
      title: "Payment ID",
      dataIndex: "id",
      width: 100,
    },
    {
      key: "invoiceId",
      title: "Invoice ID",
      dataIndex: "invoiceId",
      width: 150,
    },
    {
      key: "customerName",
      title: "Customer Name",
      dataIndex: "customerName",
      width: 180,
    },
    {
      key: "paymentDate",
      title: "Payment Date",
      dataIndex: "paymentDate",
      width: 130,
      render: (record: any) =>
        record.paymentDate
          ? new Date(record.paymentDate).toLocaleDateString()
          : "",
    },
    {
      key: "dueDate",
      title: "Due Date",
      dataIndex: "dueDate",
      width: 130,
      render: (record: any) =>
        record.dueDate ? new Date(record.dueDate).toLocaleDateString() : "",
    },
    {
      key: "paymentMethod",
      title: "Payment Method",
      dataIndex: "paymentMethod",
      width: 120,
    },
    {
      key: "amountPaid",
      title: "Amount Paid",
      dataIndex: "amountPaid",
      width: 120,
      render: (record: any) =>
        record.amountPaid?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      key: "outstandingAmount",
      title: "Outstanding Amount",
      dataIndex: "outstandingAmount",
      width: 140,
      render: (record: any) =>
        record.outstandingAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      key: "totalAmount",
      title: "Total Amount",
      dataIndex: "totalAmount",
      width: 130,
      render: (record: any) =>
        record.totalAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      key: "paymentStatus",
      title: "Status",
      dataIndex: "paymentStatus",
      width: 120,
      render: (record: any) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            record.paymentStatus === "Confirmed"
              ? "bg-green-100 text-green-800"
              : record.paymentStatus === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {record.paymentStatus}
        </span>
      ),
    },
  ];
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Payment List</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <FiPrinter />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Create Payment
          </button>
        </div>
      </div>

      {/* Single Filter Panel (toggleable) */}
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
          data={data}
          total={totalRecords}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          loading={loading}
          actions={[]}
          pagination={true}
          showFilter={showFilters}
          onToggleFilter={() => setShowFilters((prev) => !prev)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((payment) => (
            <div
              key={payment.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold">{payment.invoiceId}</h3>
                  <p className="text-xs text-gray-500">
                    Payment ID: {payment.id}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    payment.paymentStatus === "Confirmed"
                      ? "bg-green-100 text-green-800"
                      : payment.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {payment.paymentStatus}
                </span>
              </div>
              <div className="space-y-2">
                {/* Reference field can be removed if not needed */}
                <p className="text-sm text-gray-600">
                  Payment Date:{" "}
                  {payment.paymentDate
                    ? new Date(payment.paymentDate).toLocaleDateString()
                    : ""}
                </p>
                <p className="text-sm text-gray-600">
                  Due Date:{" "}
                  {payment.dueDate
                    ? new Date(payment.dueDate).toLocaleDateString()
                    : ""}
                </p>
                <p className="font-medium">
                  Amount: {payment.amountPaid?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Method: {payment.paymentMethod}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Form Modal */}
      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          isOpen={showForm}
          type="sm"
          title="Payment Information"
        >
          <PaymentForm
            onClose={() => setShowForm(false)}
            onSave={async () => {
              await fetchPayments(1);
              setCurrentPage(1);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default PaymentList;
