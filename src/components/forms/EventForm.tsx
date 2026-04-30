import React, { useState, useEffect } from "react";
import Calendar from "../common/Calendar";
import api from "../../services/api";
import AuthService from "../../services/authService";

interface EventFormProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: () => void;
  stage?: string;
  stageItemId?: string;
  initialDate?: Date;
}

type EventData = {
  [K in keyof typeof FORM_FIELDS]: (typeof FORM_FIELDS)[K]["type"] extends "multiSelect"
    ? string[]
    : string;
};
const FORM_FIELDS = {
  LeadID: { type: "select", label: "Lead ID", required: true, colSpan: 1 },

  eventTitle: {
    type: "text",
    label: "Event Title",
    required: true,
    colSpan: 1,
  },
  // customerName: {
  //   type: "text",
  //   label: "Customer Name",
  //   required: false,
  // },
  city: {
    type: "text",
    label: "City",
    required: false,
  },
  startDate: { type: "date", label: "Start Date", required: true },
  endDate: { type: "date", label: "End Date", required: true },
  startTime: { type: "time-picker", label: "Start Time", required: true },
  endTime: { type: "time-picker", label: "End Time", required: true },

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
    label: "Assign To",
    required: true,
    options: [],
  },
  eventLocation: {
    type: "textarea",
    label: "Event Location",
    required: true,
    colSpan: 2,
  },
  comments: {
    type: "textarea",
    label: "Comments",
    colSpan: 2,
    required: false,
  },
} as const;
const EventForm: React.FC<EventFormProps> = ({
  id,
  stage,
  stageItemId,
  onClose,
  onSuccess,
  initialDate,
}) => {
  const _initialEventData = Object.keys(FORM_FIELDS).reduce((acc, key) => {
    return {
      ...acc,
      [key]: key === "startTime" || key === "endTime" ? "00:00:00" : "",
    };
  }, {} as EventData);
  // Default start date to today's date when creating a new event
  const initialEventData = !id
    ? {
        ..._initialEventData,
        startDate: initialDate
          ? new Date(initialDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      }
    : _initialEventData;

  const [eventData, setEventData] = useState<EventData>({
    ...initialEventData,
    status: !id ? 'planned' : initialEventData.status,
  });
  const [originalStartDate, setOriginalStartDate] = useState(
    initialEventData.startDate || "",
  );
  const [originalEndDate, setOriginalEndDate] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedToLoading, setAssignedToLoading] = useState(false);
  const [selfTask, setSelfTask] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    initialDate || new Date(),
  );
  const [localStage, setLocalStage] = useState<string | undefined>(stage);
  const [localStageItemId, setLocalStageItemId] = useState<string | undefined>(
    stageItemId,
  );
  const [error, setError] = useState<string | null>(null);

  // If assignedTo was returned as a username, reconcile to presenter id once options load
  useEffect(() => {
    if (!assignedToOptions || assignedToOptions.length === 0) return;
    const cur = eventData.assignedTo;
    if (!cur) return;
    // if current value matches an id, nothing to do
    if (assignedToOptions.some((o) => o.id === cur)) return;
    // try matching by name
    const found = assignedToOptions.find(
      (o) => o.name === cur || String(o.name) === String(cur),
    );
    if (found) {
      setEventData((prev) => ({ ...prev, assignedTo: found.id }));
    }
  }, [assignedToOptions, eventData.assignedTo]);

  // Time components for Start Time (with AM/PM)
  const [startTimeComponents, setStartTimeComponents] = useState({
    hours: "12",
    minutes: "00",
    ampm: "AM",
  });

  // Time components for End Time (with AM/PM)
  const [endTimeComponents, setEndTimeComponents] = useState({
    hours: "12",
    minutes: "00",
    ampm: "AM",
  });

  // Utility functions for time conversion
  const convertTo24Hour = (
    hours: string,
    minutes: string,
    ampm: string,
  ): string => {
    let hour24 = parseInt(hours);
    if (ampm === "AM" && hour24 === 12) hour24 = 0;
    if (ampm === "PM" && hour24 !== 12) hour24 += 12;
    return `${hour24.toString().padStart(2, "0")}:${minutes}:00`;
  };

  const convertTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    let hour12 = parseInt(hours);
    const ampm = hour12 >= 12 ? "PM" : "AM";
    if (hour12 === 0) hour12 = 12;
    if (hour12 > 12) hour12 -= 12;
    return {
      hours: hour12.toString().padStart(2, "0"),
      minutes: minutes,
      ampm: ampm,
    };
  };

  const handleStartTimeComponentChange = (
    component: "hours" | "minutes" | "ampm",
    value: string,
  ) => {
    const newComponents = { ...startTimeComponents, [component]: value };
    setStartTimeComponents(newComponents);

    const time24 = convertTo24Hour(
      newComponents.hours,
      newComponents.minutes,
      newComponents.ampm,
    );
    setEventData((prev) => ({ ...prev, startTime: time24 }));
  };

  const handleEndTimeComponentChange = (
    component: "hours" | "minutes" | "ampm",
    value: string,
  ) => {
    const newComponents = { ...endTimeComponents, [component]: value };
    setEndTimeComponents(newComponents);

    const time24 = convertTo24Hour(
      newComponents.hours,
      newComponents.minutes,
      newComponents.ampm,
    );
    setEventData((prev) => ({ ...prev, endTime: time24 }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const resolvedStart = convertTo24Hour(
      startTimeComponents.hours,
      startTimeComponents.minutes,
      startTimeComponents.ampm,
    );
    const resolvedEnd = convertTo24Hour(
      endTimeComponents.hours,
      endTimeComponents.minutes,
      endTimeComponents.ampm,
    );
    Object.entries(FORM_FIELDS).forEach(([fieldName, config]) => {
      if (fieldName === "LeadID" && stage) return;
      let value: string | string[] = eventData[fieldName as keyof EventData];
      if (fieldName === "startTime") value = resolvedStart;
      if (fieldName === "endTime") value = resolvedEnd;
      if (
        config.required &&
        (!value || (typeof value === "string" && value.trim() === ""))
      ) {
        errors[fieldName] = "This field is required";
      }
    });
    // Date validation
    if (
      eventData.startDate &&
      eventData.endDate &&
      eventData.endDate < eventData.startDate
    ) {
      errors.endDate = "End Date cannot be before Start Date";
    }
    // Time validation
    if (
      eventData.startTime &&
      eventData.endTime &&
      eventData.startDate &&
      eventData.endDate &&
      eventData.startDate === eventData.endDate &&
      eventData.startTime > eventData.endTime
    ) {
      errors.endTime = "End Time cannot be before Start Time on the same day";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const url = id
        ? `${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent/${id}`
        : "${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent";

      const { LeadID, startTime: _st, endTime: _et, ...rest } = eventData;
      const resolvedStartTime = convertTo24Hour(
        startTimeComponents.hours,
        startTimeComponents.minutes,
        startTimeComponents.ampm,
      );
      const resolvedEndTime = convertTo24Hour(
        endTimeComponents.hours,
        endTimeComponents.minutes,
        endTimeComponents.ampm,
      );
      const currentUserId = AuthService.getCurrentUser()?.userId;
      const apiData = {
        ...rest,
        // customerName: eventData.customerName,
        startTime: resolvedStartTime || null,
        endTime: resolvedEndTime || null,
        assignedToUserId: eventData.assignedTo
          ? Number(eventData.assignedTo)
          : null,
        stage: localStage || "Lead",
        stageItemId: localStageItemId
          ? Number(localStageItemId)
          : LeadID
            ? Number(LeadID)
            : null,
        id: id ? Number(id) : undefined,
        isActive: true,
        ...(id ? { userUpdated: currentUserId } : { userCreated: currentUserId }),
      };

      const response = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) throw new Error("Failed to save event");
      // Show toast on success
      if (typeof window !== "undefined" && (window as any).toast) {
        (window as any).toast.success(
          id ? "Event updated successfully!" : "Event created successfully!",
        );
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!leadOptions.length) return;

    console.log(
      "LEAD OPTION SAMPLE:",
      leadOptions.find((l) => l.id === 6),
    );
    console.log(
      "LEAD OPTION SAMPLE BY LEADID:",
      leadOptions.find((l) => l.leadId === 6),
    );
  }, [leadOptions]);
  useEffect(() => {
    // fetch lead options for LeadID select

    // fetch lead options for LeadID select
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
    fetchLeads();
    // fetch presenters for assignedTo dropdown
    const fetchPresenters = async () => {
      try {
        setAssignedToLoading(true);
        const res = await api.get("PresenterDropdown/presenterDropdown");
        const data = res.data || [];
        // normalize to { id, username }
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
    fetchPresenters();

    if (!id) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesActivityEvent/${id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch event");

        const data = await response.json();
        console.log("Fetched event data:", data); // Debug log

        const parseLocalDate = (dateStr: string | null | undefined): string => {
          if (!dateStr) return "";
          return dateStr.split("T")[0];
        };
        const toLocalDate = (dateStr: string | null | undefined): Date => {
          if (!dateStr) return new Date();
          const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
          return new Date(y, m - 1, d);
        };
        setLocalStage(data.stage);
        setLocalStageItemId(data.stageItemId);

        setEventData({
          ...data,
          LeadID: data.stage === "Lead" ? String(data.stageItemId) : "",
          startDate: parseLocalDate(data.startDate),
          endDate: parseLocalDate(data.endDate),
          startTime: data.startTime || "00:00:00",
          endTime: data.endTime || "00:00:00",
          customerName: data.customerName || "",
          city: data.city || "",
          assignedTo: data.assignedtouserid
            ? String(data.assignedtouserid)
            : "",
          eventLocation: data.eventLocation || "",
          status: data.status || "",
          priority: data.priority || "",
          comments: data.comments || "",
        });
        setOriginalStartDate(parseLocalDate(data.startDate));
        setOriginalEndDate(parseLocalDate(data.endDate));

        if (data.startDate) {
          setSelectedDate(toLocalDate(data.startDate));
        }

        // Initialize time components — treat 00:00:00 as no time set, default to 01:00 AM
        const startTime =
          data.startTime && data.startTime !== "00:00:00"
            ? data.startTime
            : "01:00:00";
        const endTime =
          data.endTime && data.endTime !== "00:00:00"
            ? data.endTime
            : "01:00:00";

        const startTimeComponents12 = convertTo12Hour(startTime);
        const endTimeComponents12 = convertTo12Hour(endTime);

        setStartTimeComponents(startTimeComponents12);
        setEndTimeComponents(endTimeComponents12);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // keep local stage values in sync when props change
  useEffect(() => {
    setLocalStage(stage);
    setLocalStageItemId(stageItemId);
  }, [stage, stageItemId]);

  // Auto-fill assignedTo when selfTask is checked and options become available
  useEffect(() => {
    if (!selfTask || assignedToOptions.length === 0) return;
    const currentUser = AuthService.getCurrentUser();
    const me = assignedToOptions.find(
      (o) =>
        o.name === currentUser?.username ||
        o.name === `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
    );
    if (me) setEventData((prev) => ({ ...prev, assignedTo: me.id }));
  }, [selfTask, assignedToOptions]);

  const renderField = (fieldName: string, fieldConfig: any) => {
    console.log(fieldName, "event");
    const commonProps = {
      value: eventData[fieldName as keyof EventData] || "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) => setEventData((prev) => ({ ...prev, [fieldName]: e.target.value })),
      className:
        "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2",
      required: fieldConfig.required,
    };

    switch (fieldConfig.type) {
      case "text":
        // Special handling for customerName and city when lead is selected
        if (
          (fieldName === "customerName" || fieldName === "city") &&
          eventData.LeadID
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
        const minDate =
          fieldName === "endDate" && eventData.startDate
            ? eventData.startDate
            : undefined;
        return (
          <input
            type="date"
            {...commonProps}
            className={commonProps.className}
            min={minDate}
          />
        );

      case "time-picker":
        const isStartTime = fieldName === "startTime";
        const timeComponents = isStartTime
          ? startTimeComponents
          : endTimeComponents;
        const handleTimeComponentChange = isStartTime
          ? handleStartTimeComponentChange
          : handleEndTimeComponentChange;

        return (
          <div className="space-y-2">
            <div className="flex gap-2 mt-1">
              {/* Hours */}
              <div className="flex-1">
                <select
                  value={timeComponents.hours}
                  onChange={(e) =>
                    handleTimeComponentChange("hours", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <option key={hour} value={hour.toString().padStart(2, "0")}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <select
                  value={timeComponents.minutes}
                  onChange={(e) =>
                    handleTimeComponentChange("minutes", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                    <option
                      key={minute}
                      value={minute.toString().padStart(2, "0")}
                    >
                      {minute.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM/PM */}
              <div className="flex-1">
                <select
                  value={timeComponents.ampm}
                  onChange={(e) =>
                    handleTimeComponentChange("ampm", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>
        );
      case "select":
        // Special handling for LeadID -> show leads fetched from API and auto-fill hospital and stage
        if (fieldName === "LeadID") {
          const leadSelectOptions = leadOptions;
          return (
            <select
              {...commonProps}
              value={eventData.LeadID || ""}
              className={`${commonProps.className} ${id ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}`}
              onChange={(e) => {
                const val = e.target.value;
                setEventData((prev) => ({ ...prev, LeadID: val }));
                // find selected lead
                const sel = leadOptions.find(
                  (l) =>
                    String(l.id ?? l.salesLeadsId ?? l.leadId ?? l.LeadID) ===
                    String(val),
                );

                if (sel) {
                  // populate Hospital/Clinic/Individual
                  const hosp =
                    sel.customerName ||
                    sel.CustomerName ||
                    sel.customer_name ||
                    sel.hospitalName ||
                    "";
                  // Set city
                  const city = sel.city || sel.City || "";
                  setEventData((prev) => ({
                    ...prev,
                    customerName: hosp,
                    city: city,
                    HospitalClinicIndividual: hosp,
                  }));

                  // set local stage values
                  setLocalStage("Lead");
                  setLocalStageItemId(
                    String(
                      sel.id ?? sel.salesLeadsId ?? sel.leadId ?? sel.LeadID,
                    ),
                  );
                }
              }}
              disabled={leadsLoading || !!id}
            >
              <option value="">
                {leadsLoading
                  ? "Loading leads..."
                  : leadSelectOptions.length
                    ? `Select ${fieldConfig.label}`
                    : "No leads available"}
              </option>
              {leadSelectOptions.map((opt) => (
                <option
                  key={String(
                    opt.id ?? opt.salesLeadsId ?? opt.leadId ?? opt.LeadID,
                  )}
                  value={String(
                    opt.id ?? opt.salesLeadsId ?? opt.leadId ?? opt.LeadID,
                  )}
                >
                  {String(opt.leadId ?? opt.LeadID ?? opt.id ?? "")}
                  {` - ${String(
                    opt.customerName ??
                      opt.CustomerName ??
                      opt.customer_name ??
                      "",
                  )}`}
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
              if (me) setEventData((prev) => ({ ...prev, assignedTo: me.id }));
            }
          };
          return (
            <div>
              <select
                value={eventData.assignedTo || ""}
                onChange={(e) => {
                  setSelfTask(false);
                  setEventData((prev) => ({
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

        // If no options are provided, render a free-text input (useful for Hospital/Clinic/Individual)
        if (!fieldConfig.options || fieldConfig.options.length === 0) {
          return <input type="text" {...commonProps} />;
        }

        return (
          <select {...commonProps}>
            <option value="" className="hidden">
              Select {fieldConfig.label}
            </option>
            {fieldConfig.options.map((opt: any) => (
              <option key={opt.id} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        );
      case "textarea":
        return <textarea rows={3} {...commonProps} />;

      default:
        return null;
    }
  };

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
      setEventData((prev) => ({ ...prev, comments: (prev.comments ? prev.comments + ' ' : '') + transcript }));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  const userChangedDate = React.useRef(false);

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Form Section */}
      <div className="w-full lg:w-2/3 p-4 sm:p-6 border-r">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* {eventData.city && (
              <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  City:{" "}
                  <span className="font-semibold">{eventData.city}</span>
                </p>
              </div>
            )} */}
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
                    {config.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderField(fieldName, config)}
                  {fieldErrors[fieldName] && (
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
                {isLoading ? "Saving..." : id ? "Update Event" : "Create Event"}
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
            setEventData((prev) => ({ ...prev, startDate: localDate }));
          }}
          tasks={[]}
        />
      </div>
    </div>
  );
};

export default EventForm;
