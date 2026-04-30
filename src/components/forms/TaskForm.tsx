import React, { useState, useEffect } from "react";
import {} from "react-icons/io";
import Calendar from "../common/Calendar";
import api from "../../services/api";
import AuthService from "../../services/authService";
// Form field configuration - similar pattern to CallForm
const FORM_FIELDS = {
  LeadID: { type: "select", label: "Lead ID", required: true, colSpan: 1 },
  taskName: {
    type: "text",
    label: "Task Name",
    required: true,
    colSpan: 1,
  },
  customerName: {
    type: "text",
    label: "Customer Name",
    required: false,
  },
  city: {
    type: "text",
    label: "City",
    required: false,
  },
  dueDate: {
    type: "date",
    label: "Due Date",
    required: true,
  },
  priority: {
    type: "select",
    label: "Priority",
    required: true,
    options: [
      { id: "high", name: "High" },
      { id: "medium", name: "Medium" },
      { id: "low", name: "Low" },
    ],
  },
  status: {
    type: "select",
    label: "Status",
    required: true,
    options: [
      { id: "planned", name: "Planned" },
      { id: "inprogress", name: "In Progress" },
      { id: "completed", name: "Completed" },
    ],
  },
  assignedTo: {
    type: "select",
    label: "Assigned To",
    required: true,
    options: [],
  },

  comments: {
    type: "textarea",
    label: "Comments",
    colSpan: 2,
  },
} as const;

interface TaskFormProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
  stage?: string;
  stageItemId?: string;
  initialDate?: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({
  id,
  stage,
  stageItemId,
  onClose,
  onSuccess,
  initialDate,
}) => {
  // Update EventData type to handle arrays for multiselect fields
  type TaskData = {
    [K in keyof typeof FORM_FIELDS]: string;
  };
  const [taskData, setTaskData] = useState<TaskData>(
    Object.keys(FORM_FIELDS).reduce(
      (acc, key) => ({
        ...acc,
        [key]: "",
      }),
      {} as TaskData,
    ),
  );

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedToLoading, setAssignedToLoading] = useState(false);
  const [selfTask, setSelfTask] = useState(false);
  const [localStage, setLocalStage] = useState<string | undefined>(stage);
  const [localStageItemId, setLocalStageItemId] = useState<string | undefined>(
    stageItemId,
  );
  const [originalDueDate, setOriginalDueDate] = useState("");
  const [selectedLeadCity, setSelectedLeadCity] = useState<string>("");

  useEffect(() => {
    if (!id) {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      setTaskData((prev) => ({
        ...prev,
        dueDate: today,
        status: 'planned',
      }));
      setSelectedDate(new Date());
    }
  }, [id]);

  // fetch leads and presenters
  // fetch leads and presenters
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLeadsLoading(true);
        const res = await api.post("SalesLead/grid", {
          searchText: "",
          pageNumber: 1,
          pageSize: 1000,
          orderBy: "id",
          orderDirection: "DESC",
          customerNames: [],
          statuses: [],
          scores: [],
          leadTypes: [],
          selectedLeadIds: [],
          territories: [],
          zones: [],
        });
        const raw = res.data || {};
        const data = Array.isArray(raw) ? raw : raw.results || raw.data || [];
        setLeadOptions(data);
      } catch (err) {
        console.error("Failed to fetch leads", err);
        setLeadOptions([]);
      } finally {
        setLeadsLoading(false);
      }
    };

    const fetchPresenters = async () => {
      try {
        setAssignedToLoading(true);
        const res = await api.get("PresenterDropdown/presenterDropdown");
        const data = res.data || [];
        setAssignedToOptions(
          (Array.isArray(data) ? data : []).map((p: any) => ({
            id: String(p.id),
            name: p.username,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch presenters", err);
        setAssignedToOptions([]);
      } finally {
        setAssignedToLoading(false);
      }
    };

    fetchLeads();
    fetchPresenters();
  }, []);

  // reconcile assignedTo username to id when options load
  useEffect(() => {
    if (!assignedToOptions || assignedToOptions.length === 0) return;
    const cur = taskData.assignedTo;
    if (!cur) return;
    if (assignedToOptions.some((o) => o.id === cur)) return;
    const found = assignedToOptions.find(
      (o) => o.name === cur || String(o.name) === String(cur),
    );
    if (found) {
      setTaskData((prev) => ({ ...prev, assignedTo: found.id }));
    }
  }, [assignedToOptions, taskData.assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const url = id
        ? `http://localhost:5104/api/SalesActivityTask/${id}`
        : "http://localhost:5104/api/SalesActivityTask";

      const apiData = {
        ...(id ? { id: Number(id) } : {}),

        taskName: taskData.taskName,
        customerName: taskData.customerName,
        dueDate: taskData.dueDate,

        comments: taskData.comments,

        priority:
          taskData.priority.charAt(0).toUpperCase() +
          taskData.priority.slice(1),

        status:
          taskData.status.charAt(0).toUpperCase() + taskData.status.slice(1),

        assignedtouserid: Number(taskData.assignedTo),

        stage: localStage ?? "Lead",
        stageItemId: Number(localStageItemId ?? taskData.LeadID),

        isActive: true,
        ...(id
          ? { userUpdated: AuthService.getCurrentUser()?.userId }
          : { userCreated: AuthService.getCurrentUser()?.userId }),
      };

      console.log("localStage:", localStage);
      console.log("localStageItemId:", localStageItemId);

      console.log("Sending payload:", apiData);

      let response;

      if (id) {
        // 🔴 PUT → send as query params (NO body)
        const queryString = new URLSearchParams(
          Object.entries(apiData).reduce(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>,
          ),
        ).toString();

        response = await fetch(`${url}?${queryString}`, {
          method: "PUT",
        });
      } else {
        // 🟢 POST → send as body (keep as it is)
        response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
      }

      if (!response.ok) throw new Error("Failed to save task");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    Object.entries(FORM_FIELDS).forEach(([fieldName, config]) => {
      if (fieldName === "LeadID" && stage) return;
      const value = taskData[fieldName as keyof typeof taskData];
      if ("required" in config && config.required) {
        if (!value || value.trim() === "") {
          errors[fieldName] = "This field is required";
        }
      }
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 1)
      setError("Please fill all required fields");
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (!id) return;

    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5104/api/SalesActivityTask/${id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch task");

        const data = await response.json();
        console.log("Fetched task data:", data); // Debug log

        const parseLocalDate = (dateStr: string | null | undefined): string => {
          if (!dateStr) return "";
          return dateStr.split("T")[0];
        };
        const toLocalDate = (dateStr: string | null | undefined): Date => {
          if (!dateStr) return new Date();
          const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
          return new Date(y, m - 1, d);
        };

        setTaskData({
          LeadID:
            data.stage === "Lead" && data.stageItemId
              ? String(data.stageItemId)
              : "",
          taskName: data.taskName || "",
          customerName: data.customerName || "",
          city: data.city || "",
          dueDate: parseLocalDate(data.dueDate),
          priority: data.priority?.toLowerCase() || "",
          status: data.status?.toLowerCase() || "",
          assignedTo: data.assignedtouserid
            ? String(data.assignedtouserid)
            : "",
          comments: data.comments || "",
        });
        setOriginalDueDate(parseLocalDate(data.dueDate));

        setLocalStage(data.stage);
        setLocalStageItemId(String(data.stageItemId));

        if (data.dueDate) {
          setSelectedDate(toLocalDate(data.dueDate));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load task");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [id, stage, stageItemId]);

  // Auto-fill assignedTo when selfTask is checked and options become available
  useEffect(() => {
    if (!selfTask || assignedToOptions.length === 0) return;
    const currentUser = AuthService.getCurrentUser();
    const me = assignedToOptions.find(
      (o) =>
        o.name === currentUser?.username ||
        o.name === `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
    );
    if (me) setTaskData((prev) => ({ ...prev, assignedTo: me.id }));
  }, [selfTask, assignedToOptions]);

  const renderField = (fieldName: string, fieldConfig: any) => {
    console.log(fieldName, "task");
    const commonProps = {
      value: taskData[fieldName as keyof TaskData] || "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => setTaskData((prev) => ({ ...prev, [fieldName]: e.target.value })),
      className:
        "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2",
      required: fieldConfig.required,
    };

    switch (fieldConfig.type) {
      case "text":
        // Special handling for customerName and city when lead is selected
        if (
          (fieldName === "customerName" || fieldName === "city") &&
          taskData.LeadID
        ) {
          return (
            <input
              type="text"
              placeholder={fieldConfig.placeholder}
              {...commonProps}
              readOnly
              className={`${commonProps.className} bg-gray-100 cursor-not-allowed opacity-75`}
            />
          );
        }
        return (
          <input
            type="text"
            placeholder={fieldConfig.placeholder}
            {...commonProps}
          />
        );
      case "date":
        return (
          <input
            type="date"
            {...commonProps}
            className={commonProps.className}
          />
        );

      case "select":
        // Special handling for LeadID -> populate from API and auto-fill Hospital/Clinic/Individual
        if (fieldName === "LeadID") {
          const leadSelectOptions = leadOptions;
          return (
            <select
              {...commonProps}
              value={taskData.LeadID || ""}
              className={`${commonProps.className} ${id ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}`}
              onChange={(e) => {
                const val = e.target.value;
                setTaskData((prev) => ({ ...prev, LeadID: val }));

                const sel = leadOptions.find((l) => String(l.id) === val);
                if (sel) {
                  setLocalStage("Lead");
                  setLocalStageItemId(String(sel.id));

                  // Auto-fill customer name and city
                  const customerName =
                    sel.customerName ||
                    sel.CustomerName ||
                    sel.hospitalName ||
                    "";
                  const city = sel.city || sel.City || "";
                  setTaskData((prev) => ({
                    ...prev,
                    customerName: customerName,
                    city: city,
                  }));
                }
              }}
              disabled={leadsLoading || !!id}
            >
              <option value="" className="hidden">
                {leadsLoading
                  ? "Loading leads..."
                  : `Select ${fieldConfig.label}`}
              </option>
              {leadSelectOptions.map((opt) => (
                <option key={opt.id} value={String(opt.id)}>
                  {opt.leadId} - {opt.customerName}
                </option>
              ))}
            </select>
          );
        }

        if (fieldName === "assignedTo") {
          const handleSelfTask = (checked: boolean) => {
            setSelfTask(checked);
            if (checked) {
              const currentUser = AuthService.getCurrentUser();
              const me = assignedToOptions.find(
                (o) =>
                  o.name === currentUser?.username ||
                  o.name ===
                    `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
              );
              if (me) setTaskData((prev) => ({ ...prev, assignedTo: me.id }));
            }
          };
          return (
            <div>
              <select
                value={taskData.assignedTo || ""}
                onChange={(e) => {
                  setSelfTask(false);
                  setTaskData((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }));
                }}
                disabled={assignedToLoading}
                className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 ${selfTask ? "pointer-events-none bg-gray-50" : ""}`}
              >
                <option value="" className="hidden">
                  {assignedToLoading
                    ? "Loading..."
                    : `Select ${fieldConfig.label}`}
                </option>
                {assignedToOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={selfTask}
                  onChange={(e) => handleSelfTask(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Self Assign</span>
              </label>
            </div>
          );
        }

        // If no options provided, render free-text input (useful for Hospital/Clinic/Individual)
        if (!fieldConfig.options || fieldConfig.options.length === 0) {
          return <input type="text" {...commonProps} />;
        }

        return (
          <select {...commonProps}>
            <option value="" className="hidden">
              Select {fieldConfig.label}
            </option>
            {fieldConfig.options.map((opt: any) => (
              <option key={opt.id} value={opt.id}>
                {opt.name}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 resize-none"
          />
        );
      default:
        return null;
    }
  };

  const userChangedDate = React.useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = React.useRef<any>(null);

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('Speech recognition not supported in this browser.'); return; }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join(' ');
      setTaskData((prev) => ({ ...prev, comments: (prev.comments ? prev.comments + ' ' : '') + transcript }));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Form Section */}
      <div className="w-full lg:w-2/3 p-4 sm:p-6 border-r">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {Object.entries(FORM_FIELDS)
              .filter(([fieldName]) => !(fieldName === "LeadID" && stage))
              .map(([fieldName, config]) => (
                <div
                  key={fieldName}
                  className={`col-span-${
                    "colSpan" in config ? config.colSpan : 1
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {config.label}
                    {"required" in config && config.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderField(fieldName, config)}
                  {(!error || error !== "Please fill all required fields") &&
                    fieldErrors[fieldName] && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldErrors[fieldName]}
                      </p>
                    )}
                </div>
              ))}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-4 py-2 rounded-md border font-medium text-sm transition-colors ${
                isRecording
                  ? 'bg-red-50 border-red-400 text-red-600 animate-pulse'
                  : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-1 17.93V21H9v2h6v-2h-2v-2.07A8.001 8.001 0 0 0 20 11h-2a6 6 0 0 1-12 0H4a8.001 8.001 0 0 0 7 7.93z"/>
              </svg>
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : id ? "Update Task" : "Create Task"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Calendar Section */}
      <div className="w-full lg:w-1/3 p-4 sm:p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Schedule Overview
        </h3>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            userChangedDate.current = true;
            setSelectedDate(date);
            const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            setTaskData((prev) => ({ ...prev, dueDate: localDate }));
          }}
          tasks={[]}
        />
      </div>
    </div>
  );
};

export default TaskForm;
