import React, { useState } from "react";
import axios from "axios";
import {
  LuCalendar as Calendar,
  LuClock as Clock,
  LuPackage as Package,
  LuAlertCircle as AlertCircle,
  LuCheckCircle as CheckCircle,
  LuXCircle as XCircle,
  LuUser as User,
  LuMail as Mail,
  LuPhone as Phone,
  LuMapPin as MapPin,
  LuMessageSquare as MessageSquare,
  LuInfo as Info,
  LuUpload as Upload,
  LuFileText as FileText,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
} from "react-icons/lu";
import api from "../../services/api";

// Type Definitions
type DemoStatus = "scheduled" | "completed" | null;
type RequestStatus = "pending" | "approved" | "rejected";
type ScheduleStatus = "available" | "booked" | "maintenance";

interface ScheduleSlot {
  date: string;
  status: ScheduleStatus;
  bookedBy: string | null;
  contact?: string;
}

interface ProductSchedule {
  id: string;
  name: string;
  totalUnits: number;
  availableUnits: number;
  schedule: ScheduleSlot[];
}

interface DemoRequest {
  id: number;
  productName: string;
  productId: string;
  requestedBy: string;
  salesPerson: string;
  email: string;
  phone: string;
  company: string;
  requestDate: string;
  preferredDate: string;
  approvedDate?: string;
  quantity: number;
  purpose: string;
  status: RequestStatus;
  demoStatus: DemoStatus;
  approvalComments?: string;
  rejectionReason?: string;
  reportFile: string | null;
  reportUploadDate: string | null;
}

type CalendarView = "weekly" | "monthly" | "yearly";

// Mock Data
const initialDemoRequests: DemoRequest[] = [
  {
    id: 1,
    productName: "Diathermy",
    productId: "PRD-001",
    requestedBy: "John Smith",
    salesPerson: "Sarah Johnson",
    email: "john.smith@company.com",
    phone: "+1 234-567-8900",
    company: "Tech Industries Ltd",
    requestDate: "2025-10-01",
    preferredDate: "2025-10-12",
    quantity: 2,
    purpose: "Product evaluation for manufacturing line upgrade",
    status: "pending",
    demoStatus: null,
    reportFile: null,
    reportUploadDate: null,
  },
  {
    id: 2,
    productName: "ComBi MAx",
    productId: "PRD-002",
    requestedBy: "Emily Davis",
    salesPerson: "Mike Chen",
    email: "emily.davis@logistics.com",
    phone: "+1 234-567-8901",
    company: "Global Logistics Inc",
    requestDate: "2025-10-02",
    preferredDate: "2025-10-20",
    quantity: 1,
    purpose: "Client demonstration for new warehouse facility",
    status: "pending",
    demoStatus: null,
    reportFile: null,
    reportUploadDate: null,
  },
  {
    id: 3,
    productName: "Diathermy",
    productId: "PRD-001",
    requestedBy: "James Wilson",
    salesPerson: "Sarah Johnson",
    email: "james.wilson@abccorp.com",
    phone: "+1 234-567-8902",
    company: "ABC Corp",
    requestDate: "2025-09-28",
    preferredDate: "2025-10-12",
    approvedDate: "2025-10-12",
    quantity: 1,
    purpose: "Testing for production line automation",
    status: "approved",
    demoStatus: "scheduled",
    approvalComments:
      "Approved for Oct 12. Please ensure technical team is available.",
    reportFile: null,
    reportUploadDate: null,
  },
  {
    id: 4,
    productName: "Combi Maxx",
    productId: "PRD-002",
    requestedBy: "Michael Brown",
    salesPerson: "Lisa Wang",
    email: "michael.brown@storageco.com",
    phone: "+1 234-567-8903",
    company: "Storage Solutions Inc",
    requestDate: "2025-10-03",
    preferredDate: "2025-10-25",
    quantity: 1,
    purpose: "Evaluation for new distribution center",
    status: "pending",
    demoStatus: null,
    reportFile: null,
    reportUploadDate: null,
  },
];

const productSchedule: ProductSchedule[] = [
  {
    id: "PRD-001",
    name: "Diathermy",
    totalUnits: 5,
    availableUnits: 2,
    schedule: [
      { date: "2025-10-06", status: "available", bookedBy: null },
      { date: "2025-10-07", status: "available", bookedBy: null },
      {
        date: "2025-10-08",
        status: "booked",
        bookedBy: "Demo - Tech Corp",
        contact: "Alice Brown",
      },
      { date: "2025-10-09", status: "available", bookedBy: null },
      { date: "2025-10-10", status: "available", bookedBy: null },
      {
        date: "2025-10-11",
        status: "maintenance",
        bookedBy: "Scheduled Maintenance",
      },
      {
        date: "2025-10-12",
        status: "booked",
        bookedBy: "Demo - ABC Corp",
        contact: "James Wilson",
      },
      { date: "2025-10-13", status: "available", bookedBy: null },
      { date: "2025-10-14", status: "available", bookedBy: null },
      { date: "2025-10-15", status: "available", bookedBy: null },
      {
        date: "2025-10-16",
        status: "booked",
        bookedBy: "Demo - Innovation Ltd",
        contact: "David Lee",
      },
      { date: "2025-10-17", status: "available", bookedBy: null },
      {
        date: "2025-10-18",
        status: "maintenance",
        bookedBy: "Scheduled Maintenance",
      },
      { date: "2025-10-19", status: "available", bookedBy: null },
      { date: "2025-10-20", status: "available", bookedBy: null },
      { date: "2025-10-21", status: "available", bookedBy: null },
      {
        date: "2025-10-22",
        status: "booked",
        bookedBy: "Demo - XYZ Ltd",
        contact: "Maria Garcia",
      },
      { date: "2025-10-23", status: "available", bookedBy: null },
      { date: "2025-10-24", status: "available", bookedBy: null },
      { date: "2025-10-25", status: "available", bookedBy: null },
      { date: "2025-10-26", status: "available", bookedBy: null },
      {
        date: "2025-10-27",
        status: "booked",
        bookedBy: "Demo - Future Systems",
        contact: "Tom Harris",
      },
      { date: "2025-10-28", status: "available", bookedBy: null },
      { date: "2025-10-29", status: "available", bookedBy: null },
      { date: "2025-10-30", status: "available", bookedBy: null },
      { date: "2025-10-31", status: "available", bookedBy: null },
    ],
  },
  {
    id: "PRD-002",
    name: "Combi Maxx",
    totalUnits: 3,
    availableUnits: 1,
    schedule: [
      { date: "2025-10-06", status: "available", bookedBy: null },
      {
        date: "2025-10-07",
        status: "booked",
        bookedBy: "Demo - Supply Chain Inc",
        contact: "Emma Stone",
      },
      { date: "2025-10-08", status: "available", bookedBy: null },
      { date: "2025-10-09", status: "available", bookedBy: null },
      { date: "2025-10-10", status: "available", bookedBy: null },
      { date: "2025-10-11", status: "available", bookedBy: null },
      { date: "2025-10-12", status: "available", bookedBy: null },
      { date: "2025-10-13", status: "available", bookedBy: null },
      {
        date: "2025-10-14",
        status: "booked",
        bookedBy: "Demo - Logistics Pro",
        contact: "Robert Chen",
      },
      { date: "2025-10-15", status: "available", bookedBy: null },
      { date: "2025-10-16", status: "available", bookedBy: null },
      { date: "2025-10-17", status: "available", bookedBy: null },
      { date: "2025-10-18", status: "available", bookedBy: null },
      { date: "2025-10-19", status: "available", bookedBy: null },
      { date: "2025-10-20", status: "available", bookedBy: null },
      { date: "2025-10-21", status: "maintenance", bookedBy: "System Upgrade" },
      { date: "2025-10-22", status: "available", bookedBy: null },
      { date: "2025-10-23", status: "available", bookedBy: null },
      {
        date: "2025-10-24",
        status: "booked",
        bookedBy: "Demo - Warehouse Solutions",
        contact: "Lisa Kumar",
      },
      { date: "2025-10-25", status: "available", bookedBy: null },
      { date: "2025-10-26", status: "available", bookedBy: null },
      { date: "2025-10-27", status: "available", bookedBy: null },
      { date: "2025-10-28", status: "available", bookedBy: null },
      {
        date: "2025-10-29",
        status: "booked",
        bookedBy: "Demo - Smart Storage Co",
        contact: "Kevin Park",
      },
      { date: "2025-10-30", status: "available", bookedBy: null },
      { date: "2025-10-31", status: "available", bookedBy: null },
    ],
  },
];

// Components
const StatusBadge: React.FC<{
  status: RequestStatus | DemoStatus;
  type: "request" | "demo";
}> = ({ status, type }) => {
  const getColor = () => {
    if (type === "request") {
      switch (status) {
        case "pending":
          return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "approved":
          return "bg-green-100 text-green-800 border-green-300";
        case "rejected":
          return "bg-red-100 text-red-800 border-red-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    } else {
      switch (status) {
        case "scheduled":
          return "bg-blue-100 text-blue-800 border-blue-300";
        case "completed":
          return "bg-green-100 text-green-800 border-green-300";
        default:
          return "bg-gray-100 text-gray-800 border-gray-300";
      }
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${getColor()}`}
    >
      {status?.toUpperCase() || "N/A"}
    </span>
  );
};

const ScheduleBadge: React.FC<{ status: ScheduleStatus }> = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-300 text-green-800";
      case "booked":
        return "bg-blue-50 border-blue-300 text-blue-800";
      case "maintenance":
        return "bg-orange-50 border-orange-300 text-orange-800";
      default:
        return "bg-gray-50 border-gray-300 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border ${getColor()}`}
    >
      {status}
    </span>
  );
};

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded-lg font-medium ${
            currentPage === page
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

const RequestCard: React.FC<{
  request: DemoRequest;
  onViewRequest: (request: DemoRequest) => void;
  onUploadReport: (request: DemoRequest) => void;
}> = ({ request, onViewRequest, onUploadReport }) => (
  <div className="border border-slate-200 rounded-lg p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-semibold text-slate-800">
            {request.productName}
          </h3>
          <StatusBadge status={request.status} type="request" />
        </div>

        <p className="text-sm text-slate-500 mb-3">
          Product ID: {request.productId}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <User className="w-4 h-4" />
            <span>
              {request.requestedBy} ({request.company})
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>Preferred: {request.preferredDate}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4" />
            <span>{request.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Package className="w-4 h-4" />
            <span>Quantity: {request.quantity} units</span>
          </div>
        </div>

        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs font-medium text-slate-700 mb-1">
            Purpose:
          </div>
          <div className="text-sm text-slate-600">{request.purpose}</div>
        </div>

        {request.demoStatus && (
          <div className="mt-3">
            <StatusBadge status={request.demoStatus} type="demo" />
            {request.demoStatus === "completed" && request.reportFile && (
              <div className="ml-3 inline-flex items-center gap-2 text-xs text-green-700">
                <FileText className="w-3 h-3" />
                Report: {request.reportFile} (Uploaded:{" "}
                {request.reportUploadDate})
              </div>
            )}
          </div>
        )}

        {request.status === "approved" && request.approvalComments && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs font-medium text-green-800 mb-1">
              Approval Comments:
            </div>
            <div className="text-sm text-green-700">
              {request.approvalComments}
            </div>
            <div className="text-xs text-green-600 mt-1">
              Approved Date: {request.approvedDate}
            </div>
          </div>
        )}

        {request.status === "rejected" && request.rejectionReason && (
          <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-xs font-medium text-red-800 mb-1">
              Rejection Reason:
            </div>
            <div className="text-sm text-red-700">
              {request.rejectionReason}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 ml-4">
        {request.status === "pending" && (
          <button
            onClick={() => onViewRequest(request)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Review Request
          </button>
        )}
        {request.status === "approved" &&
          request.demoStatus === "scheduled" && (
            <button
              onClick={() => onUploadReport(request)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Demo Report
            </button>
          )}
        {request.status === "approved" &&
          request.demoStatus === "completed" && (
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-center">
              Demo Completed
            </span>
          )}
        {request.status === "rejected" && (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium text-center">
            Request Rejected
          </span>
        )}
      </div>
    </div>
  </div>
);

const CalendarView: React.FC<{
  product: ProductSchedule;
  calendarView: CalendarView;
  currentWeekStart: Date;
}> = ({ product, calendarView, currentWeekStart }) => {
  const getWeekDates = (startDate: Date): string[] => {
    const dates: string[] = [];
    const start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const getMonthDates = (year: number, month: number): string[] => {
    const dates: string[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  };

  const getYearMonths = (
    year: number
  ): Array<{ month: number; name: string }> => {
    const months: Array<{ month: number; name: string }> = [];
    for (let month = 0; month < 12; month++) {
      months.push({
        month,
        name: new Date(year, month).toLocaleString("default", {
          month: "long",
        }),
      });
    }
    return months;
  };

  const getAvailabilityForDate = (date: string): ScheduleSlot => {
    const slot = product.schedule.find((s) => s.date === date);
    return slot || { date, status: "available", bookedBy: null };
  };

  const weekDates =
    calendarView === "weekly" ? getWeekDates(currentWeekStart) : [];
  const monthDates =
    calendarView === "monthly"
      ? getMonthDates(
          currentWeekStart.getFullYear(),
          currentWeekStart.getMonth()
        )
      : [];
  const yearMonths =
    calendarView === "yearly"
      ? getYearMonths(currentWeekStart.getFullYear())
      : [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            {product.name}
          </h2>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Total Units: {product.totalUnits}</span>
            <span className="text-green-600 font-medium">
              Available: {product.availableUnits}
            </span>
          </div>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
          {product.id}
        </span>
      </div>

      {calendarView === "weekly" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, idx) => {
            const slot = getAvailabilityForDate(date);
            return (
              <div
                key={idx}
                className={`border-2 rounded-lg p-3 ${getScheduleStatusColor(
                  slot.status
                )}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                  {slot.status === "available" && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {slot.status === "booked" && (
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  )}
                  {slot.status === "maintenance" && (
                    <XCircle className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="text-sm font-bold mb-1">
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <ScheduleBadge status={slot.status} />
                {slot.bookedBy && (
                  <div className="text-xs opacity-80 truncate mt-1">
                    {slot.bookedBy}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {calendarView === "monthly" && (
        <div className="grid grid-cols-7 gap-2">
          {monthDates.map((date, idx) => {
            const slot = getAvailabilityForDate(date);
            return (
              <div
                key={idx}
                className={`border rounded-lg p-1 ${getScheduleStatusColor(
                  slot.status
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {new Date(date).getDate()}
                  </span>
                  {slot.status === "available" && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}
                  {slot.status === "booked" && (
                    <AlertCircle className="w-3 h-3 text-blue-600" />
                  )}
                  {slot.status === "maintenance" && (
                    <XCircle className="w-3 h-3 text-orange-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {calendarView === "yearly" && (
        <div className="grid grid-cols-4 gap-4">
          {yearMonths.map(({ month, name }) => {
            const monthDates = getMonthDates(
              currentWeekStart.getFullYear(),
              month
            );
            const availableDays = monthDates.filter((date) => {
              const slot = getAvailabilityForDate(date);
              return slot.status === "available";
            }).length;

            return (
              <div key={month} className="border rounded-lg p-4 bg-slate-50">
                <h4 className="font-semibold text-slate-800 mb-2">{name}</h4>
                <div className="text-sm text-slate-600">
                  Available days: {availableDays}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ReviewModal: React.FC<{
  request: DemoRequest;
  showDateConflict: boolean;
  selectedDate: string | null;
  comments: string;
  onClose: () => void;
  onApprove: (requestId: number, scheduleDate: string) => void;
  onReject: (requestId: number) => void;
  onDateChange: (date: string) => void;
  onCommentsChange: (comments: string) => void;
}> = ({
  request,
  showDateConflict,
  selectedDate,
  comments,
  onClose,
  onApprove,
  onReject,
  onDateChange,
  onCommentsChange,
}) => {
  const getAvailableDatesForProduct = (productId: string): string[] => {
    const product = productSchedule.find((p) => p.id === productId);
    if (!product) return [];
    return product.schedule
      .filter((slot) => slot.status === "available")
      .map((slot) => slot.date)
      .slice(0, 10);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Review Demo Request
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Product
              </label>
              <p className="text-lg font-semibold text-slate-800">
                {request.productName}
              </p>
              <p className="text-sm text-slate-500">ID: {request.productId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Requested By
              </label>
              <p className="text-lg font-semibold text-slate-800">
                {request.requestedBy}
              </p>
              <p className="text-sm text-slate-500">{request.company}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Contact Information
              </label>
              <p className="text-sm text-slate-600">{request.email}</p>
              <p className="text-sm text-slate-600">{request.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Request Details
              </label>
              <p className="text-sm text-slate-600">
                Quantity: {request.quantity} units
              </p>
              <p className="text-sm text-slate-600">
                Preferred Date: {request.preferredDate}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Purpose
            </label>
            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              {request.purpose}
            </p>
          </div>

          {showDateConflict && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Date Conflict</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                The preferred date {request.preferredDate} is not available.
                Please select an alternative date.
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Schedule Date
            </label>
            <select
              value={selectedDate || ""}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a date</option>
              {getAvailableDatesForProduct(request.productId).map((date) => (
                <option key={date} value={date}>
                  {date} (Available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Comments {request.status === "pending" && "(Required)"}
            </label>
            <textarea
              value={comments}
              onChange={(e) => onCommentsChange(e.target.value)}
              placeholder={
                request.status === "pending"
                  ? "Add approval comments or rejection reason..."
                  : "Add comments..."
              }
              rows={4}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Reject Request
          </button>
          <button
            onClick={() =>
              onApprove(request.id, selectedDate || request.preferredDate)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Approve Request
          </button>
        </div>
      </div>
    </div>
  );
};

const UploadReportModal: React.FC<{
  request: DemoRequest;
  onClose: () => void;
  onSubmit: () => void;
  onFileChange: (file: File | null) => void;
  uploadProgress: number;
}> = ({ request, onClose, onSubmit, onFileChange, uploadProgress }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-800">
          Upload Demo Report
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Product
          </label>
          <p className="text-lg font-semibold text-slate-800">
            {request.productName}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Client
          </label>
          <p className="text-sm text-slate-600">
            {request.requestedBy} - {request.company}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Demo Report File
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Supported formats: PDF, DOC, DOCX, TXT
          </p>
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-3">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-1 text-center">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Report
        </button>
      </div>
    </div>
  </div>
);

// Helper functions
const getScheduleStatusColor = (status: ScheduleStatus): string => {
  switch (status) {
    case "available":
      return "bg-green-50 border-green-300 text-green-800";
    case "booked":
      return "bg-blue-50 border-blue-300 text-blue-800";
    case "maintenance":
      return "bg-orange-50 border-orange-300 text-orange-800";
    default:
      return "bg-gray-50 border-gray-300 text-gray-800";
  }
};

const getCommonAvailableDates = (productIds: string[]): string[] => {
  if (productIds.length === 0) return [];

  const allDates = productSchedule
    .filter((p) => productIds.includes(p.id))
    .flatMap((p) =>
      p.schedule.filter((s) => s.status === "available").map((s) => s.date)
    );

  const dateCount = allDates.reduce((acc, date) => {
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(dateCount)
    .filter(([_, count]) => count === productIds.length)
    .map(([date]) => date)
    .slice(0, 10);
};

// Main Component
const DemoApprovalPage: React.FC = () => {
  const [demoRequests, setDemoRequests] =
    useState<DemoRequest[]>(initialDemoRequests);
  const [selectedRequest, setSelectedRequest] = useState<DemoRequest | null>(
    null
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"inventory" | "approval">(
    "inventory"
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [comments, setComments] = useState<string>("");
  const [showDateConflict, setShowDateConflict] = useState<boolean>(false);
  const [calendarView, setCalendarView] = useState<CalendarView>("weekly");
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    new Date("2025-10-06")
  );
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportRequest, setReportRequest] = useState<DemoRequest | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const itemsPerPage = 5;

  // Pagination
  const totalPages = Math.ceil(demoRequests.length / itemsPerPage);
  const currentRequests = demoRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewRequest = (request: DemoRequest): void => {
    setSelectedRequest(request);
    setShowModal(true);
    setComments("");
    setSelectedDate(null);

    const product = productSchedule.find((p) => p.id === request.productId);
    if (product) {
      const preferredSlot = product.schedule.find(
        (s) => s.date === request.preferredDate
      );
      if (preferredSlot && preferredSlot.status !== "available") {
        setShowDateConflict(true);
      } else {
        setShowDateConflict(false);
      }
    }
  };

  const handleApprove = (requestId: number, scheduleDate: string): void => {
    if (!comments.trim()) {
      alert("Please add comments before approving");
      return;
    }

    if (!scheduleDate) {
      alert("Please select a schedule date");
      return;
    }

    setDemoRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "approved",
              approvedDate: scheduleDate,
              approvalComments: comments,
              demoStatus: "scheduled",
            }
          : req
      )
    );
    setShowModal(false);
    setComments("");
    setSelectedDate(null);
  };

  const handleReject = (requestId: number): void => {
    if (!comments.trim()) {
      alert("Please add rejection reason in comments");
      return;
    }

    setDemoRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: "rejected",
              rejectionReason: comments,
            }
          : req
      )
    );
    setShowModal(false);
    setComments("");
  };

  const handleUploadReport = (request: DemoRequest): void => {
    setReportRequest(request);
    setShowReportModal(true);
    setReportFile(null);
    setUploadProgress(0);
  };

  const handleReportSubmit = async (): Promise<void> => {
    if (!reportFile) {
      alert("Please select a file to upload");
      return;
    }

    if (!reportRequest) return;

    try {
      // Create FormData object to send the file
      const formData = new FormData();
      formData.append("file", reportFile);
      formData.append("requestId", reportRequest.id.toString());
      formData.append("fileName", reportFile.name);
      formData.append("productId", reportRequest.productId);
      formData.append("clientName", reportRequest.requestedBy);

      // Configure the request headers
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourAuthToken}`
        },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      };

      // Replace with your actual API endpoint
      const response = await api.post("GoogleDrive/upload", formData, config);

      // Only update state if API call is successful
      setDemoRequests((prev) =>
        prev.map((req) =>
          req.id === reportRequest.id
            ? {
                ...req,
                demoStatus: "completed",
                reportFile: reportFile.name,
                reportUploadDate: new Date().toISOString().split("T")[0],
              }
            : req
        )
      );

      setShowReportModal(false);
      setReportFile(null);
      setReportRequest(null);
      setUploadProgress(0);

      alert(
        "Demo report uploaded successfully! Demo status changed to Completed."
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload demo report. Please try again.");
      setUploadProgress(0);
    }
  };

  const handleFileChange = (file: File | null): void => {
    setReportFile(file);
    setUploadProgress(0);
  };

  const navigateWeek = (direction: number): void => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const navigateMonth = (direction: number): void => {
    const newDate = new Date(currentWeekStart);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentWeekStart(newDate);
  };

  const navigateYear = (direction: number): void => {
    const newDate = new Date(currentWeekStart);
    newDate.setFullYear(newDate.getFullYear() + direction);
    setCurrentWeekStart(newDate);
  };

  const handleProductSelection = (productId: string): void => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const commonAvailableDates = getCommonAvailableDates(selectedProducts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Inventory Management
          </h1>
          <p className="text-slate-600">
            Manage demo requests and product availability
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === "inventory"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Package className="inline-block w-5 h-5 mr-2" />
              Inventory & Demo Requests
            </button>
            <button
              onClick={() => setActiveTab("approval")}
              className={`px-6 py-4 font-medium transition-all ${
                activeTab === "approval"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Calendar className="inline-block w-5 h-5 mr-2" />
              Product Approval Schedule
            </button>
          </div>
        </div>

        {activeTab === "inventory" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Demo Requests
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {demoRequests.filter((r) => r.status === "pending").length}{" "}
                  Pending
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {demoRequests.filter((r) => r.status === "approved").length}{" "}
                  Approved
                </span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {demoRequests.filter((r) => r.status === "rejected").length}{" "}
                  Rejected
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {currentRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewRequest={handleViewRequest}
                  onUploadReport={handleUploadReport}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {activeTab === "approval" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Calendar View
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCalendarView("weekly")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarView === "weekly"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setCalendarView("monthly")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarView === "monthly"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setCalendarView("yearly")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      calendarView === "yearly"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    if (calendarView === "weekly") navigateWeek(-1);
                    else if (calendarView === "monthly") navigateMonth(-1);
                    else navigateYear(-1);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-lg font-semibold text-slate-800">
                  {calendarView === "weekly" &&
                    `Week of ${currentWeekStart.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}`}
                  {calendarView === "monthly" &&
                    currentWeekStart.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  {calendarView === "yearly" && currentWeekStart.getFullYear()}
                </div>

                <button
                  onClick={() => {
                    if (calendarView === "weekly") navigateWeek(1);
                    else if (calendarView === "monthly") navigateMonth(1);
                    else navigateYear(1);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Product Selection for Common Dates */}
            {selectedProducts.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Common Available Dates
                </h3>
                <div className="flex flex-wrap gap-2">
                  {commonAvailableDates.map((date) => (
                    <span
                      key={date}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {date}
                    </span>
                  ))}
                  {commonAvailableDates.length === 0 && (
                    <p className="text-slate-600">
                      No common available dates for selected products
                    </p>
                  )}
                </div>
              </div>
            )}

            {productSchedule.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <h3 className="text-lg font-semibold text-slate-800">
                      {product.name}
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                    {product.availableUnits}/{product.totalUnits} available
                  </span>
                </div>
                <CalendarView
                  product={product}
                  calendarView={calendarView}
                  currentWeekStart={currentWeekStart}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showModal && selectedRequest && (
          <ReviewModal
            request={selectedRequest}
            showDateConflict={showDateConflict}
            selectedDate={selectedDate}
            comments={comments}
            onClose={() => setShowModal(false)}
            onApprove={handleApprove}
            onReject={handleReject}
            onDateChange={setSelectedDate}
            onCommentsChange={setComments}
          />
        )}

        {showReportModal && reportRequest && (
          <UploadReportModal
            request={reportRequest}
            onClose={() => setShowReportModal(false)}
            onSubmit={handleReportSubmit}
            onFileChange={handleFileChange}
            uploadProgress={uploadProgress}
          />
        )}
      </div>
    </div>
  );
};

export default DemoApprovalPage;
