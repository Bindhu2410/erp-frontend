import React, { useState } from "react";
import {
  BarChart2, Users, Clock, DollarSign, TrendingUp,
  Download, Calendar, Filter, FileText
} from "lucide-react";
import { employees, attendanceRecords, payrollRecords, performanceGoals } from "../dummyData";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const headcountData = [18, 19, 20, 20, 21, 21, 23, 24, 24, 25, 26, employees.length];
const attritionData = [1, 0, 1, 0, 2, 0, 1, 0, 0, 1, 0, 0];
const salaryTrendData = [320000, 325000, 334000, 338000, 345000, 348000, 355000, 362000, 365000, 370000, 375000, payrollRecords.reduce((a, r) => a + r.netSalary, 0)];

const SimpleBarChart: React.FC<{ data: number[]; labels: string[]; color: string; height?: number }> = ({
  data, labels, color, height = 120
}) => {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full ${color} rounded-t-sm transition-all duration-700 relative group`}
            style={{ height: `${(v / max) * (height - 16)}px` }}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {v.toLocaleString("en-IN")}
            </span>
          </div>
          <span className="text-[9px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

const ReportsModule: React.FC = () => {
  const [activeReport, setActiveReport] = useState<"headcount" | "attendance" | "payroll" | "performance">("headcount");

  const deptDist = employees.reduce((acc, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgPerfRating = (performanceGoals.reduce((a, g) => a + g.managerRating, 0) / performanceGoals.length).toFixed(1);

  const reports = [
    { id: "headcount" as const, label: "Headcount", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "attendance" as const, label: "Attendance", icon: Clock, color: "text-green-600", bg: "bg-green-50" },
    { id: "payroll" as const, label: "Payroll", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-50" },
    { id: "performance" as const, label: "Performance", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-sm text-gray-500">Comprehensive HR data insights and dashboards</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium text-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {reports.map(({ id, label, icon: Icon, color, bg }) => (
          <button
            key={id}
            onClick={() => setActiveReport(id)}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              activeReport === id ? "border-blue-500 shadow-md bg-white" : "border-transparent bg-white hover:border-gray-200 shadow-sm"
            }`}
          >
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-semibold text-gray-800 text-sm">{label}</p>
            <p className="text-xs text-gray-500">Report</p>
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeReport === "headcount" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-800">Headcount Trend (2025)</h2>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Jan 2025 – Dec 2025</span>
              </div>
              <SimpleBarChart data={headcountData} labels={MONTHS} color="bg-blue-500" height={150} />
              <div className="mt-4 flex gap-6 pt-4 border-t border-gray-100">
                <div><p className="text-xs text-gray-400">Start of Year</p><p className="font-bold text-gray-800">18</p></div>
                <div><p className="text-xs text-gray-400">End of Year</p><p className="font-bold text-blue-700">{employees.length}</p></div>
                <div><p className="text-xs text-gray-400">Net Growth</p><p className="font-bold text-green-600">+{employees.length - 18}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Dept. Distribution</h2>
              <div className="space-y-3">
                {Object.entries(deptDist).map(([dept, count]) => (
                  <div key={dept}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{dept}</span>
                      <span className="font-semibold text-gray-800">{count} ({Math.round((count / employees.length) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(count / employees.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Attrition Trend</h2>
            <SimpleBarChart data={attritionData} labels={MONTHS} color="bg-red-400" height={100} />
            <p className="text-xs text-gray-400 mt-4">Total attrition in 2025: {attritionData.reduce((a, b) => a + b, 0)} employees</p>
          </div>
        </div>
      )}

      {activeReport === "attendance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Attendance by Status (March 2026)</h2>
            <div className="space-y-4">
              {[
                { label: "Present", count: 8, color: "bg-green-500" },
                { label: "Late", count: 1, color: "bg-orange-500" },
                { label: "Absent", count: 1, color: "bg-red-500" },
                { label: "On Leave", count: 1, color: "bg-yellow-500" },
                { label: "Half Day", count: 1, color: "bg-blue-400" },
              ].map(({ label, count, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{label}</span>
                    <span className="font-semibold">{count} ({Math.round((count / 10) * 100)}%)</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full">
                    <div className={`${color} h-3 rounded-full`} style={{ width: `${(count / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Top Attendance (March)</h2>
            <div className="space-y-3">
              {[
                { name: "Vikram Singh", days: 22, pct: 100 },
                { name: "Meera Iyer", days: 22, pct: 100 },
                { name: "Arjun Sharma", days: 21, pct: 95 },
                { name: "Deepak Menon", days: 21, pct: 95 },
                { name: "Ananya Kumar", days: 20, pct: 91 },
              ].map(({ name, days, pct }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="font-medium text-gray-800">{name}</span>
                      <span className="text-green-600 font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === "payroll" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Monthly Salary Expenditure Trend</h2>
              <span className="text-xs text-gray-400">Jan 2025 – Dec 2025</span>
            </div>
            <SimpleBarChart data={salaryTrendData} labels={MONTHS} color="bg-purple-500" height={160} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Salary (March)", value: `₹${payrollRecords.reduce((a, r) => a + r.netSalary, 0).toLocaleString("en-IN")}`, sub: "Net Take-Home" },
              { label: "Total PF Contribution", value: `₹${payrollRecords.reduce((a, r) => a + r.providentFund, 0).toLocaleString("en-IN")}`, sub: "Employee PF" },
              { label: "Total TDS", value: `₹${payrollRecords.reduce((a, r) => a + r.incomeTax, 0).toLocaleString("en-IN")}`, sub: "Income Tax (TDS)" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeReport === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Average Manager Rating</p>
              <p className="text-4xl font-extrabold text-yellow-500 mt-1">{avgPerfRating}/5</p>
              <p className="text-xs text-gray-400 mt-1">Across all goals</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Goals Completed</p>
              <p className="text-4xl font-extrabold text-green-600 mt-1">{performanceGoals.filter(g => g.status === "Completed").length}/{performanceGoals.length}</p>
              <p className="text-xs text-gray-400 mt-1">This cycle</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-sm text-gray-500">Top Performer</p>
              <p className="text-lg font-bold text-blue-700 mt-1">Vikram Singh</p>
              <p className="text-xs text-gray-400 mt-1">5.0 avg rating</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Rating Distribution</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = performanceGoals.filter(g => g.managerRating === rating).length;
                const pct = Math.round((count / performanceGoals.length) * 100);
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-8">★ {rating}</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full">
                      <div className="bg-yellow-400 h-3 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsModule;
