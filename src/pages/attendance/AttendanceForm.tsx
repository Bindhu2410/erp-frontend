import React from "react";
import { toast } from "react-toastify";

type AttendanceRecord = {
  id?: string;
  date: string;
  employeeId: string;
  status: "Present" | "Absent" | "On Leave";
  checkIn?: string;
  checkOut?: string;
  notes?: string;
};

const defaultEmployees = [
  { id: "1", name: "Alice Johnson" },
  { id: "2", name: "Bob Smith" },
  { id: "3", name: "Charlie Brown" },
];

interface AttendanceFormProps {
  initialRecord?: Partial<AttendanceRecord>;
  onSave?: (record: AttendanceRecord) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  initialRecord,
  onSave,
  onCancel,
  submitLabel = "Save",
}) => {
  const [date, setDate] = React.useState<string>(
    initialRecord?.date || new Date().toISOString().slice(0, 10)
  );
  const [employeeId, setEmployeeId] = React.useState<string>(
    initialRecord?.employeeId || defaultEmployees[0].id
  );
  const [status, setStatus] = React.useState<AttendanceRecord["status"]>(
    initialRecord?.status || "Present"
  );
  const [checkIn, setCheckIn] = React.useState<string>(
    initialRecord?.checkIn || ""
  );
  const [checkOut, setCheckOut] = React.useState<string>(
    initialRecord?.checkOut || ""
  );
  const [notes, setNotes] = React.useState<string>(initialRecord?.notes || "");

  // Try to load employees list from localStorage (if the app stores it), otherwise use defaults
  const employees = React.useMemo(() => {
    try {
      const raw = localStorage.getItem("employees");
      if (!raw) return defaultEmployees;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      return defaultEmployees;
    } catch (e) {
      return defaultEmployees;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation: if both times provided ensure checkOut >= checkIn
    if (checkIn && checkOut && checkOut < checkIn) {
      toast.warn("Check-out time must be after check-in time");
      return;
    }

    const record: AttendanceRecord = {
      id: initialRecord?.id ? String(initialRecord.id) : `${Date.now()}`,
      date,
      employeeId,
      status,
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      notes,
    };

    // If onSave provided, delegate persistence to parent
    if (onSave) {
      try {
        await onSave(record);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Fallback: Save to localStorage under `attendanceRecords` (simple local persistence)
    try {
      const raw = localStorage.getItem("attendanceRecords");
      const arr = raw ? JSON.parse(raw) : [];
      // If editing an existing local record, replace it
      const existingIndex = arr.findIndex(
        (r: any) => String(r.id) === String(record.id)
      );
      if (existingIndex >= 0) {
        arr[existingIndex] = record;
      } else {
        arr.unshift(record);
      }
      localStorage.setItem("attendanceRecords", JSON.stringify(arr));
      toast.success("Attendance saved");
      // reset notes and times
      setNotes("");
      setCheckIn("");
      setCheckOut("");
      if (onCancel) onCancel();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save attendance");
    }
  };

  return (
    <form
      className="bg-white p-6 rounded shadow-md max-w-2xl"
      onSubmit={handleSubmit}
    >
      <h2 className="text-xl font-semibold mb-4">
        {initialRecord ? "Edit Attendance" : "Add Attendance"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Employee
          </label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          >
            {employees.map((emp: any) => (
              <option key={emp.id} value={emp.id}>
                {emp.name || emp.fullName || emp.employeeName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="mt-1 block w-full border rounded p-2"
          >
            <option>Present</option>
            <option>Absent</option>
            <option>On Leave</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Check In
          </label>
          <input
            type="time"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Check Out
          </label>
          <input
            type="time"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 block w-full border rounded p-2"
          rows={3}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            setDate(new Date().toISOString().slice(0, 10));
            setEmployeeId(employees[0]?.id || "");
            setStatus("Present");
            setNotes("");
            if (onCancel) onCancel();
          }}
          className="bg-gray-100 text-gray-800 px-3 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;
