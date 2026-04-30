import React from "react";
import {
  Users, Clock, DollarSign, TrendingUp, AlertCircle,
  CheckCircle, UserCheck, Calendar, ArrowUpRight,
  Briefcase, Award, Activity
} from "lucide-react";
import { employees, attendanceRecords, timesheetEntries, payrollRecords } from "../dummyData";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: string;
}> = ({ title, value, subtitle, icon: Icon, color, bg, trend }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
      <div className={`${bg} rounded-xl p-3`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
        <ArrowUpRight className="w-3 h-3" />
        {trend}
      </div>
    )}
  </div>
);

const attendanceToday = attendanceRecords.filter(r => r.date === "2026-03-31");
const presentCount = attendanceToday.filter(r => r.status === "Present").length;
const absentCount = attendanceToday.filter(r => r.status === "Absent").length;
const leaveCount = attendanceToday.filter(r => r.status === "Leave").length;
const lateCount = attendanceToday.filter(r => r.status === "Late").length;

const HRMSDashboard: React.FC = () => {
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const pendingTimesheets = timesheetEntries.filter(t => t.status === "Pending").length;
  const processedPayroll = payrollRecords.filter(p => p.status === "Processed").length;

  const departmentData: Record<string, number> = employees.reduce((acc: Record<string, number>, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const deptColors: Record<string, string> = {
    Engineering: "bg-blue-500",
    HR: "bg-purple-500",
    Sales: "bg-green-500",
    Finance: "bg-yellow-500",
    Marketing: "bg-pink-500",
    Operations: "bg-orange-500",
  };

  const recentActivities = [
    { action: "Leave approved", person: "Sneha Patel", time: "10 min ago", icon: CheckCircle, color: "text-green-500" },
    { action: "Timesheet rejected", person: "Kiran Reddy", time: "25 min ago", icon: AlertCircle, color: "text-red-500" },
    { action: "New employee onboarded", person: "Kavya Bhat", time: "2 hrs ago", icon: UserCheck, color: "text-blue-500" },
    { action: "Payroll processed", person: "March 2026", time: "1 day ago", icon: DollarSign, color: "text-green-500" },
    { action: "Performance review due", person: "Q1 2026 Reviews", time: "2 days ago", icon: Award, color: "text-orange-500" },
  ];

  const upcomingEvents = [
    { event: "Q1 Performance Review", date: "Apr 10, 2026", tag: "Performance", tagColor: "bg-purple-100 text-purple-700" },
    { event: "Payroll Processing", date: "Apr 28, 2026", tag: "Payroll", tagColor: "bg-green-100 text-green-700" },
    { event: "Team Building Event", date: "Apr 15, 2026", tag: "HR", tagColor: "bg-blue-100 text-blue-700" },
    { event: "HR Policy Review", date: "Apr 20, 2026", tag: "Admin", tagColor: "bg-gray-100 text-gray-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">HR Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back, Priya. Here's your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={employees.length} subtitle={`${activeEmployees} Active`} icon={Users} color="text-blue-600" bg="bg-blue-50" trend="+2 this month" />
        <StatCard title="Present Today" value={presentCount} subtitle={`${absentCount} Absent · ${leaveCount} On Leave`} icon={UserCheck} color="text-green-600" bg="bg-green-50" />
        <StatCard title="Pending Timesheets" value={pendingTimesheets} subtitle="Awaiting approval" icon={Clock} color="text-orange-600" bg="bg-orange-50" />
        <StatCard title="Payroll Processed" value={processedPayroll} subtitle={`of ${payrollRecords.length} employees`} icon={DollarSign} color="text-purple-600" bg="bg-purple-50" trend="March 2026 done" />
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Today's Attendance
            </h2>
            <span className="text-xs text-gray-400">March 31, 2026</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Present", count: presentCount, total: employees.length, color: "bg-green-500" },
              { label: "Absent", count: absentCount, total: employees.length, color: "bg-red-500" },
              { label: "On Leave", count: leaveCount, total: employees.length, color: "bg-yellow-500" },
              { label: "Late", count: lateCount, total: employees.length, color: "bg-orange-500" },
            ].map(({ label, count, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-800">{count}/{total}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full transition-all`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-blue-600" /> Department Distribution
          </h2>
          <div className="space-y-3">
            {Object.entries(departmentData).map(([dept, count]) => (
              <div key={dept} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${deptColors[dept] || "bg-gray-400"}`} />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">{dept}</span>
                    <span className="font-medium text-gray-800">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div
                      className={`${deptColors[dept] || "bg-gray-400"} h-1.5 rounded-full`}
                      style={{ width: `${(count / employees.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-600" /> Recent Activity
          </h2>
          <ul className="space-y-4">
            {recentActivities.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <a.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${a.color}`} />
                <div>
                  <p className="text-sm text-gray-700 font-medium">{a.action}</p>
                  <p className="text-xs text-gray-400">{a.person} · {a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Add Employee", icon: Users, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Approve Leaves", icon: CheckCircle, color: "bg-green-50 text-green-700 hover:bg-green-100" },
              { label: "Run Payroll", icon: DollarSign, color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
              { label: "View Reports", icon: TrendingUp, color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            ].map(({ label, icon: Icon, color }) => (
              <button key={label} className={`flex items-center gap-3 p-3 rounded-lg font-medium text-sm transition-colors ${color}`}>
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-blue-600" /> Upcoming Events
          </h2>
          <ul className="space-y-3">
            {upcomingEvents.map((ev, i) => (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{ev.event}</p>
                  <p className="text-xs text-gray-400">{ev.date}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ev.tagColor}`}>{ev.tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HRMSDashboard;
