import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, BarChart2,
  CheckCircle, XCircle, AlertCircle, MinusCircle, Users
} from "lucide-react";
import { attendanceRecords } from "../dummyData";

type AttendanceStatus = "Present" | "Absent" | "Leave" | "Late" | "Half Day";

const statusConfig: Record<AttendanceStatus, { color: string; icon: React.ElementType; bg: string }> = {
  Present: { color: "text-green-700", bg: "bg-green-100", icon: CheckCircle },
  Absent: { color: "text-red-700", bg: "bg-red-100", icon: XCircle },
  Leave: { color: "text-yellow-700", bg: "bg-yellow-100", icon: AlertCircle },
  Late: { color: "text-orange-700", bg: "bg-orange-100", icon: AlertCircle },
  "Half Day": { color: "text-blue-700", bg: "bg-blue-100", icon: MinusCircle },
};

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Generate a month of attendance (mock)
function generateMonthData(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const statuses: AttendanceStatus[] = ["Present", "Present", "Present", "Present", "Absent", "Leave", "Late"];
  const data: Record<number, AttendanceStatus> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // weekend
    data[d] = statuses[Math.floor(Math.random() * statuses.length)];
  }
  return data;
};

const AttendanceManagement: React.FC = () => {
  const [view, setView] = useState<"calendar" | "table">("calendar");
  const [currentMonth, setCurrentMonth] = useState(2); // March (0-indexed)
  const [currentYear] = useState(2026);

  const monthData = generateMonthData(currentYear, currentMonth);

  const prevMonth = () => setCurrentMonth((m) => (m === 0 ? 11 : m - 1));
  const nextMonth = () => setCurrentMonth((m) => (m === 11 ? 0 : m + 1));

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const summary = {
    Present: Object.values(monthData).filter(s => s === "Present").length,
    Absent: Object.values(monthData).filter(s => s === "Absent").length,
    Leave: Object.values(monthData).filter(s => s === "Leave").length,
    Late: Object.values(monthData).filter(s => s === "Late").length,
    "Half Day": Object.values(monthData).filter(s => s === "Half Day").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
          <p className="text-sm text-gray-500">Track and manage employee attendance records</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          <button
            onClick={() => setView("calendar")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === "calendar" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-gray-800"}`}
          >
            <Calendar className="w-4 h-4" /> Calendar
          </button>
          <button
            onClick={() => setView("table")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${view === "table" ? "bg-white shadow text-blue-700" : "text-gray-600 hover:text-gray-800"}`}
          >
            <Users className="w-4 h-4" /> Table
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(Object.entries(summary) as [AttendanceStatus, number][]).map(([status, count]) => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className={`${cfg.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${cfg.color}`}>{count}</p>
              <p className={`text-xs font-medium mt-1 ${cfg.color}`}>{status}</p>
            </div>
          );
        })}
      </div>

      {view === "calendar" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-gray-800 text-lg">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_SHORT.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const status = monthData[day];
              const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = day === 31 && currentMonth === 2;
              const cfg = status ? statusConfig[status] : null;

              return (
                <div
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-all cursor-pointer
                    ${isWeekend ? "bg-gray-50 text-gray-300" : cfg ? `${cfg.bg} ${cfg.color} hover:opacity-80` : "text-gray-400 hover:bg-gray-50"}
                    ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                  `}
                >
                  <span className="font-semibold">{day}</span>
                  {status && !isWeekend && (
                    <span className="text-[9px] mt-0.5 hidden sm:block truncate leading-tight">{status === "Half Day" ? "Half" : status}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100">
            {(Object.entries(statusConfig) as [AttendanceStatus, any][]).map(([status, cfg]) => (
              <div key={status} className="flex items-center gap-2 text-xs">
                <div className={`w-3 h-3 rounded-full ${cfg.bg.replace("bg-", "bg-")}`} />
                <span className="text-gray-600">{status}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-gray-100" />
              <span className="text-gray-600">Weekend</span>
            </div>
          </div>
        </div>
      ) : (
        // Table View
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">
            Attendance — March 31, 2026
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Employee", "ID", "Status", "Check In", "Check Out", "Hours"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attendanceRecords.map((rec) => {
                  const cfg = statusConfig[rec.status as AttendanceStatus];
                  const Icon = cfg.icon;
                  return (
                    <tr key={rec.employeeId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {rec.employeeName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-medium text-gray-800">{rec.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{rec.employeeId}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{rec.checkIn || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{rec.checkOut || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{rec.hours ? `${rec.hours}h` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Row */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-5">
          <BarChart2 className="w-4 h-4 text-blue-600" /> Monthly Analytics — {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="space-y-4">
          {(Object.entries(summary) as [AttendanceStatus, number][]).map(([status, count]) => {
            const total = Object.values(summary).reduce((a, b) => a + b, 0);
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const cfg = statusConfig[status];
            const barColor: Record<AttendanceStatus, string> = {
              Present: "bg-green-500", Absent: "bg-red-500", Leave: "bg-yellow-500", Late: "bg-orange-500", "Half Day": "bg-blue-500"
            };
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className={`font-medium ${cfg.color}`}>{status}</span>
                  <span className="text-gray-700 font-semibold">{count} days ({pct}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`${barColor[status]} h-3 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-green-700">{summary.Present} working days</span> attended out of{" "}
            <span className="font-semibold">{Object.values(summary).reduce((a, b) => a + b, 0)} working days</span> this month.
            Attendance rate:{" "}
            <span className="font-semibold text-blue-700">
              {Math.round((summary.Present / Object.values(summary).reduce((a, b) => a + b, 0)) * 100)}%
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;
