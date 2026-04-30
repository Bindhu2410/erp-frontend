import React, { useState } from "react";
import {
  Search, Filter, Plus, Edit2, Eye, Trash2, X, Check,
  User, Mail, Phone, Building2, Briefcase, Calendar, Badge, Users
} from "lucide-react";
import { Employee } from "../types";
import { employees as initialEmployees } from "../dummyData";

const statusColors: Record<Employee["status"], string> = {
  Active: "bg-green-100 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  "On Leave": "bg-yellow-100 text-yellow-700",
};

const departments = ["All", "Engineering", "HR", "Sales", "Finance", "Marketing", "Operations"];

const emptyForm: Omit<Employee, "id"> = {
  name: "", department: "Engineering", role: "", email: "", phone: "", status: "Active", joinDate: "", salary: 0
};

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Omit<Employee, "id">>(emptyForm);

  const filtered = employees.filter((e) => {
    const matchSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === "All" || e.department === selectedDept;
    const matchStatus = selectedStatus === "All" || e.status === selectedStatus;
    return matchSearch && matchDept && matchStatus;
  });

  const openAddModal = () => {
    setEditEmployee(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (emp: Employee) => {
    setEditEmployee(emp);
    const { id, ...rest } = emp;
    setFormData(rest);
    setShowModal(true);
  };

  const handleSave = () => {
    if (editEmployee) {
      setEmployees((prev) => prev.map((e) => e.id === editEmployee.id ? { ...formData, id: editEmployee.id } : e));
    } else {
      const newId = `EMP${String(employees.length + 1).padStart(3, "0")}`;
      setEmployees((prev) => [...prev, { ...formData, id: newId }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-sm text-gray-500">{employees.length} employees · {employees.filter(e => e.status === "Active").length} active</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-56">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-blue-500 bg-white"
            >
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:border-blue-500 bg-white"
            >
              {["All", "Active", "Inactive", "On Leave"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Employee", "ID", "Department", "Role", "Email", "Phone", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {emp.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{emp.id}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setViewEmployee(emp)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(emp)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No employees found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
          Showing {filtered.length} of {employees.length} employees
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">{editEmployee ? "Edit Employee" : "Add New Employee"}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name", field: "name", type: "text", placeholder: "Enter full name" },
                { label: "Email Address", field: "email", type: "email", placeholder: "email@company.com" },
                { label: "Phone Number", field: "phone", type: "text", placeholder: "+91 XXXXX XXXXX" },
                { label: "Role / Designation", field: "role", type: "text", placeholder: "e.g. Senior Developer" },
                { label: "Join Date", field: "joinDate", type: "date", placeholder: "" },
                { label: "Salary (₹)", field: "salary", type: "number", placeholder: "Monthly CTC" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(formData as any)[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: type === "number" ? Number(e.target.value) : e.target.value })}
                    placeholder={placeholder}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {departments.slice(1).map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee["status"] })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {["Active", "Inactive", "On Leave"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> {editEmployee ? "Update" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">Employee Profile</h2>
              <button onClick={() => setViewEmployee(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                  {viewEmployee.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{viewEmployee.name}</h3>
                  <p className="text-gray-500 text-sm">{viewEmployee.role}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[viewEmployee.status]}`}>{viewEmployee.status}</span>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Badge, label: "Employee ID", value: viewEmployee.id },
                  { icon: Building2, label: "Department", value: viewEmployee.department },
                  { icon: Mail, label: "Email", value: viewEmployee.email },
                  { icon: Phone, label: "Phone", value: viewEmployee.phone },
                  { icon: Calendar, label: "Join Date", value: viewEmployee.joinDate },
                  { icon: Briefcase, label: "Salary", value: `₹${viewEmployee.salary.toLocaleString("en-IN")}/month` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 py-2 border-b border-gray-50">
                    <Icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-500 w-28">{label}</span>
                    <span className="text-sm font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
