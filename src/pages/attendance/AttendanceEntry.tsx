import React, { useState, useEffect } from "react";
import {
  LuPlus as Plus,
  LuPencil as Pencil,
  LuTrash2 as Trash2,
  LuX as X,
  LuSearch as Search,
} from "react-icons/lu";
import api from "../../services/api";
import { toast } from "react-toastify";
import { useUser } from "../../context/UserContext";

type AttendanceRecord = {
  id: string;
  date: string;
  employeeId: string;
  employeeName: string;
  status: "Present" | "Absent" | "On Leave";
  checkIn?: string;
  checkOut?: string;
  notes?: string;
};

const defaultEmployees = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Charlie Brown" },
  { id: "4", name: "Diana Prince" },
  { id: "5", name: "Ethan Hunt" },
];

export default function AttendanceManagement() {
  const { user } = useUser();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    employeeId: defaultEmployees[0].id,
    status: "Present" as AttendanceRecord["status"],
    checkIn: "",
    checkOut: "",
    notes: "",
  });

  // Load records on mount
  useEffect(() => {
    // Try to load from API first; fallback to localStorage
    const load = async () => {
      try {
        // Fetch only the current user's own attendance records
        const endpoint = "Attendance";
        const res = await api.get<any[]>(endpoint);
        if (res && res.data && Array.isArray(res.data)) {
          const mapped = res.data.map((item: any) => ({
            id: item.id
              ? String(item.id)
              : String(item.employeeId) +
                "_" +
                (item.attendanceDate || item.date),
            date: item.attendanceDate
              ? String(item.attendanceDate).split("T")[0]
              : item.date || "",
            employeeId: item.employeeId
              ? String(item.employeeId)
              : String(item.employeeId || ""),
            employeeName: item.employeeName || item.employee || "",
            status: (item.status as any) || "Present",
            checkIn: item.checkInTime
              ? String(item.checkInTime).slice(0, 5)
              : item.checkIn
              ? String(item.checkIn).slice(0, 5)
              : "",
            checkOut: item.checkOutTime
              ? String(item.checkOutTime).slice(0, 5)
              : item.checkOut
              ? String(item.checkOut).slice(0, 5)
              : "",
            notes: item.remarks || item.notes || "",
          }));
          setRecords(mapped);
          localStorage.setItem("attendanceRecords", JSON.stringify(mapped));
          return;
        }
      } catch (err: any) {
        console.warn(
          "Failed to fetch attendance from API, falling back to localStorage",
          err
        );
        toast.info("Failed to load attendance from server, using local data");
      }

      const stored = localStorage.getItem("attendanceRecords");
      if (stored) setRecords(JSON.parse(stored));
    };

    load();
  }, [user]);

  // Save to localStorage whenever records change
  useEffect(() => {
    localStorage.setItem("attendanceRecords", JSON.stringify(records));
  }, [records]);

  // CREATE
  const handleCreate = async () => {
    const employee = defaultEmployees.find((e) => e.id === formData.employeeId);
    // Validate times: check-out cannot be earlier than check-in
    if (
      formData.checkIn &&
      formData.checkOut &&
      formData.checkOut < formData.checkIn
    ) {
      toast.error("Check-out time cannot be earlier than check-in time");
      return;
    }
    // Build server payload with UTC ISO strings so PostgreSQL accepts them
    const attendanceDateUTC = new Date(
      `${formData.date}T00:00:00Z`
    ).toISOString();
    const checkInTime = formData.checkIn ? `${formData.checkIn}:00` : null;
    const checkOutTime = formData.checkOut ? `${formData.checkOut}:00` : null;
    const payload = {
      employeeId: Number(formData.employeeId),
      employeeName: employee?.name || "",
      attendanceDate: attendanceDateUTC,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      status: formData.status,
      remarks: formData.notes,
    } as any;

    try {
      const res = await api.post<any>("Attendance", payload);
      if (res && res.data) {
        const item = res.data;
        const mapped: AttendanceRecord = {
          id: item.id ? String(item.id) : Date.now().toString(),
          date: item.attendanceDate
            ? String(item.attendanceDate).split("T")[0]
            : formData.date,
          employeeId: item.employeeId
            ? String(item.employeeId)
            : formData.employeeId,
          employeeName: item.employeeName || employee?.name || "",
          status: item.status || formData.status,
          checkIn: item.checkInTime
            ? String(item.checkInTime).slice(0, 5)
            : formData.checkIn || "",
          checkOut: item.checkOutTime
            ? String(item.checkOutTime).slice(0, 5)
            : formData.checkOut || "",
          notes: item.remarks || formData.notes || "",
        };
        setRecords((prev) => [mapped, ...prev]);
        localStorage.setItem(
          "attendanceRecords",
          JSON.stringify([mapped, ...records])
        );
        toast.success("Record created on server");
      }
    } catch (err: any) {
      console.warn("Create failed, saving locally", err);
      // fallback to local create
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        ...formData,
        employeeName: employee?.name || "",
      };
      setRecords((prev) => [newRecord, ...prev]);
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify([newRecord, ...records])
      );
      toast.warn("Create failed on server — saved locally");
    }

    resetForm();
    setShowModal(false);
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingRecord) return;
    const employee = defaultEmployees.find((e) => e.id === formData.employeeId);
    // Validate times: check-out cannot be earlier than check-in
    if (
      formData.checkIn &&
      formData.checkOut &&
      formData.checkOut < formData.checkIn
    ) {
      toast.error("Check-out time cannot be earlier than check-in time");
      return;
    }
    // Build server payload with UTC ISO strings so PostgreSQL accepts them
    const attendanceDateUTC = new Date(
      `${formData.date}T00:00:00Z`
    ).toISOString();
    const checkInTime = formData.checkIn ? `${formData.checkIn}:00` : null;
    const checkOutTime = formData.checkOut ? `${formData.checkOut}:00` : null;
    const payload = {
      employeeId: Number(formData.employeeId),
      employeeName: employee?.name || "",
      attendanceDate: attendanceDateUTC,
      checkInTime: checkInTime,
      checkOutTime: checkOutTime,
      status: formData.status,
      remarks: formData.notes,
    } as any;

    try {
      const res = await api.put<any>(`Attendance/${editingRecord.id}`, payload);
      if (res && res.data) {
        const item = res.data;
        const updated: AttendanceRecord = {
          id: item.id ? String(item.id) : editingRecord.id,
          date: item.attendanceDate
            ? String(item.attendanceDate).split("T")[0]
            : formData.date,
          employeeId: item.employeeId
            ? String(item.employeeId)
            : formData.employeeId,
          employeeName: item.employeeName || employee?.name || "",
          status: item.status || formData.status,
          checkIn: item.checkInTime
            ? String(item.checkInTime).slice(0, 5)
            : formData.checkIn || "",
          checkOut: item.checkOutTime
            ? String(item.checkOutTime).slice(0, 5)
            : formData.checkOut || "",
          notes: item.remarks || formData.notes || "",
        };
        setRecords((prev) =>
          prev.map((r) => (r.id === editingRecord.id ? updated : r))
        );
        localStorage.setItem(
          "attendanceRecords",
          JSON.stringify(
            records.map((r) => (r.id === editingRecord.id ? updated : r))
          )
        );
        toast.success("Record updated on server");
      }
    } catch (err: any) {
      console.warn("Update failed, updating locally", err);
      // fallback: update locally
      const updatedRecord: AttendanceRecord = {
        ...editingRecord,
        ...formData,
        employeeName: employee?.name || "",
      };
      setRecords((prev) =>
        prev.map((r) => (r.id === editingRecord.id ? updatedRecord : r))
      );
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(
          records.map((r) => (r.id === editingRecord.id ? updatedRecord : r))
        )
      );
      toast.warn("Update failed on server — updated locally");
    }

    resetForm();
    setShowModal(false);
    setEditingRecord(null);
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`Attendance/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(records.filter((r) => r.id !== id))
      );
      toast.success("Record deleted on server");
    } catch (err: any) {
      console.warn("Delete on server failed, removing locally", err);
      // fallback: remove locally
      setRecords((prev) => prev.filter((r) => r.id !== id));
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(records.filter((r) => r.id !== id))
      );
      toast.warn("Delete failed on server — removed locally");
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().slice(0, 10),
      employeeId: defaultEmployees[0].id,
      status: "Present",
      checkIn: "",
      checkOut: "",
      notes: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingRecord(null);
    setShowModal(true);
  };

  const openEditModal = (record: AttendanceRecord) => {
    setFormData({
      date: record.date,
      employeeId: record.employeeId,
      status: record.status,
      checkIn: record.checkIn || "",
      checkOut: record.checkOut || "",
      notes: record.notes || "",
    });
    setEditingRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    resetForm();
  };

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.date.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || record.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Attendance Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track and manage employee attendance records
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Add Record
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by employee name or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No attendance records found
              </p>
              <p className="text-gray-400 mt-2">
                Create your first record to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.employeeName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.checkIn || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.checkOut || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {record.notes || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(record)}
                          className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? "Edit Attendance" : "Add Attendance"}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      // Date is auto-filled and not editable (prevent past/future selection)
                      disabled
                      title="Date is set automatically and cannot be changed"
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee *
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {defaultEmployees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Present</option>
                      <option>Absent</option>
                      <option>On Leave</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check In
                    </label>
                    <input
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) => {
                        const newCheckIn = e.target.value;
                        // If existing checkOut is earlier than new checkIn, clear checkOut
                        if (
                          formData.checkOut &&
                          formData.checkOut < newCheckIn
                        ) {
                          toast.warn(
                            "Check-out cleared because it's earlier than the new check-in"
                          );
                          setFormData({
                            ...formData,
                            checkIn: newCheckIn,
                            checkOut: "",
                          });
                        } else {
                          setFormData({ ...formData, checkIn: newCheckIn });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out
                    </label>
                    <input
                      type="time"
                      value={formData.checkOut}
                      // enforce that checkOut cannot be earlier than checkIn via min attribute
                      min={formData.checkIn || undefined}
                      onChange={(e) => {
                        const newCheckOut = e.target.value;
                        if (
                          formData.checkIn &&
                          newCheckOut < formData.checkIn
                        ) {
                          toast.error(
                            "Check-out time cannot be earlier than check-in time"
                          );
                          return;
                        }
                        setFormData({ ...formData, checkOut: newCheckOut });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingRecord ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingRecord ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
