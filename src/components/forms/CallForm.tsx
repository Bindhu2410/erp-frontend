import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Calendar from "../common/Calendar";
import api from "../../services/api";
import AuthService from "../../services/authService";
interface CallFormProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: (data?: { status: string }) => void;
  onStatusChange?: (status: string) => void;
  followUpDates?: { startDate: string; endDate: string } | null;
  stage?: string;
  stageItemId?: string;
  initialDate?: Date;
}

// Form field configuration
const FORM_FIELDS = {
  LeadID: { type: "select", label: "Lead ID", required: true, colSpan: 1 },

  callTitle: {
    type: "select",
    label: "Call Title",
    required: true,
    colSpan: 1,
    options: [
      { id: "AMC Call", name: "AMC Call" },
      { id: "AMC Follow up", name: "AMC Follow up" },
      { id: "Appointment", name: "Appointment" },
      { id: "CAMC Call", name: "CAMC Call" },
      { id: "CAMC Follow up", name: "CAMC Follow up" },
      { id: "Conference Call", name: "Conference Call" },
      { id: "Conference Follow up call", name: "Conference Follow up call" },
      { id: "Delivery call", name: "Delivery call" },
      { id: "Demo Call", name: "Demo Call" },
      { id: "Enquiry Follow up", name: "Enquiry Follow up" },
      { id: "General Call", name: "General Call" },
      { id: "Installation Call", name: "Installation Call" },
      { id: "Installation Case Call", name: "Installation Case Call" },
      { id: "Issue of Material", name: "Issue of Material" },
      { id: "New Call", name: "New Call" },
      { id: "New Enquiry", name: "New Enquiry" },
      { id: "Order follow up", name: "Order follow up" },
      { id: "Payment Call", name: "Payment Call" },
      { id: "Payment Follow up", name: "Payment Follow up" },
      { id: "PMR Paper work", name: "PMR Paper work" },
      { id: "Quotation", name: "Quotation" },
      { id: "Quotation Follow up", name: "Quotation Follow up" },
      { id: "Receipt of material", name: "Receipt of material" },
      { id: "Service call", name: "Service call" },
      { id: "Tender follow up", name: "Tender follow up" },
      { id: "Tender work", name: "Tender work" },
    ],
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
  callType: {
    type: "select",
    label: "Call Type",
    required: true,
    options: [
      { id: "direct", name: "Direct" },
      { id: "phone_call", name: "Phone Call" },
    ],
  },

  callDate: {
    type: "date",
    label: "Call Date",
    required: true,
  },
  callTime: {
    type: "time-picker",
    label: "Call Time",
    required: true,
  },
  duration: {
    type: "duration-picker",
    label: "Duration",
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
  callStatus: {
    type: "select",
    label: "Call Status",
    required: true,
    options: [
      { id: "planned", name: "Planned" },
      { id: "inprogress", name: "In Progress" },
      { id: "completed", name: "Completed" },
    ],
    apiField: "status",
  },

  assignedTo: {
    type: "select",
    label: "Assigned To",
    required: true,
    options: [],
  },
  outcome: {
    type: "select",
    label: "Outcome",
    required: false,
    options: [
      { id: "successful", name: "Successful" },
      { id: "followup_needed", name: "Follow-up Needed" },
      { id: "no_answer", name: "No Answer" },
      { id: "rescheduled", name: "Rescheduled" },
    ],
  },

  callAgenda: {
    type: "textarea",
    label: "Call Agenda",
    required: false,
    colSpan: 2,
  },
} as const;

const CallForm: React.FC<CallFormProps> = ({
  id,
  stage,
  stageItemId,
  onClose,
  onSuccess,
  onStatusChange,
  followUpDates,
  initialDate,
}) => {
  console.log("CallForm Props:", stage, stageItemId, id);
  // Define type for callData based on FORM_FIELDS
  type CallData = {
    [K in keyof typeof FORM_FIELDS]: (typeof FORM_FIELDS)[K]["type"] extends "multiSelect"
      ? string[]
      : string;
  };

  // Initialize state based on field config
  const [callData, setCallData] = useState<CallData>(
    Object.keys(FORM_FIELDS).reduce(
      (acc, key) => ({
        ...acc,
        [key]: "",
      }),
      {} as CallData,
    ),
  );

  useEffect(() => {
    if (!id) {
      const today = new Date().toLocaleDateString("en-CA");

      const defaultTime = convertTo24Hour("12", "00", "AM");
      const defaultDuration = convertHMToDuration("00", "00");

      setCallData((prev) => ({
        ...prev,
        callDate: today,
        callTime: defaultTime,
        duration: defaultDuration,
        callStatus: 'planned',
      }));

      setSelectedDate(new Date());
    }
  }, [id]);

  // fetch leads and presenters for selects
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
        console.log(
          "CallForm leads loaded:",
          data.length,
          data.map((l: any) => l.id),
        ); // ADD THIS
        setLeadOptions(data);
        console.log(
          "Leads in CallForm:",
          data.length,
          data.slice(0, 5).map((l: any) => ({ id: l.id, leadId: l.leadId })),
        );
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
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedToLoading, setAssignedToLoading] = useState(false);
  const [selfTask, setSelfTask] = useState(false);
  const [localStage, setLocalStage] = useState<string | undefined>(stage);
  const [localStageItemId, setLocalStageItemId] = useState<string | undefined>(
    stageItemId,
  );
  const [originalCallDate, setOriginalCallDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedLeadCity, setSelectedLeadCity] = useState<string>("");
  const [tasks] = useState<Array<{ date: Date; title: string; type: string }>>(
    [],
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Time components for Call Time (with AM/PM)
  const [timeComponents, setTimeComponents] = useState({
    hours: "12",
    minutes: "00",
    ampm: "AM",
  });

  // Duration components (without AM/PM)
  const [durationComponents, setDurationComponents] = useState({
    hours: "00",
    minutes: "00",
  });

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setCallData((prev) => ({ ...prev, callDate: localDate }));
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
      setCallData((prev) => ({ ...prev, callAgenda: (prev.callAgenda ? prev.callAgenda + ' ' : '') + transcript }));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

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

  const convertDurationToHM = (duration: string) => {
    const [hours, minutes] = duration.split(":");
    return {
      hours: hours.padStart(2, "0"),
      minutes: minutes,
    };
  };

  const convertHMToDuration = (hours: string, minutes: string): string => {
    return `${hours}:${minutes}:00`;
  };

  const handleTimeComponentChange = (
    component: "hours" | "minutes" | "ampm",
    value: string,
  ) => {
    const newComponents = { ...timeComponents, [component]: value };
    setTimeComponents(newComponents);

    const time24 = convertTo24Hour(
      newComponents.hours,
      newComponents.minutes,
      newComponents.ampm,
    );
    setCallData((prev) => ({ ...prev, callTime: time24 }));
  };

  const handleDurationComponentChange = (
    component: "hours" | "minutes",
    value: string,
  ) => {
    const newComponents = { ...durationComponents, [component]: value };
    setDurationComponents(newComponents);

    const durationTime = convertHMToDuration(
      newComponents.hours,
      newComponents.minutes,
    );
    setCallData((prev) => ({ ...prev, duration: durationTime }));
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    return dateString.split("T")[0];
  };

  const formatTimeFromDateTime = (dateString: string) => {
    if (!dateString) return "00:00:00";
    const date = new Date(dateString);
    return date.toTimeString().split(" ")[0];
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    Object.entries(FORM_FIELDS).forEach(([fieldName, config]) => {
      if (fieldName === "LeadID" && stage) return;
      const value = callData[fieldName as keyof CallData];
      if (config.required) {
        if (Array.isArray(value) && value.length === 0) {
          errors[fieldName] = "This field is required";
        } else if (
          !value ||
          (typeof value === "string" && value.trim() === "")
        ) {
          errors[fieldName] = "This field is required";
        }
      }
    });
    setFieldErrors(errors);
    // If more than one required field is missing, set a top error message
    const requiredFieldErrors = Object.values(errors).filter(
      (msg) => msg === "This field is required",
    );
    if (requiredFieldErrors.length > 1) {
      setError("Please fill all required fields");
    } else {
      setError(null);
    }
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
      const getApiData = (isFollowUp = false) => {
        const callDate = isFollowUp
          ? followUpDates?.startDate
          : callData.callDate;
        const callTime = isFollowUp ? "09:00:00" : callData.callTime;

        const dateTime = new Date(callDate || "");
        const [hours, minutes, seconds] = callTime.split(":");
        dateTime.setHours(Number(hours), Number(minutes), Number(seconds));

        const currentUserId = AuthService.getCurrentUser()?.userId;

        return {
          ...callData,
          status: isFollowUp ? "planned" : callData.callStatus,
          callDateTime: dateTime.toISOString(),
          // customerName: callData.customerName,
          assignedTo: callData.assignedTo,
          assignedToUserId: callData.assignedTo
            ? isNaN(Number(callData.assignedTo))
              ? undefined
              : Number(callData.assignedTo)
            : undefined,
          stage: localStage || "Lead",
          stageItemId: localStageItemId
            ? Number(localStageItemId)
            : Number(callData.LeadID),
          duration: callData.duration,
          isActive: true,
          ...(id ? { userUpdated: currentUserId } : { userCreated: currentUserId }),
        };
      };

      if (id && followUpDates) {
        // 1. Update original call
        const originalDateTime = new Date(originalCallDate);
        const [h, m, s] = callData.callTime.split(":");
        originalDateTime.setHours(Number(h), Number(m), Number(s));

        const originalData = {
          ...getApiData(false),
          id: id,
          callDateTime: originalDateTime.toISOString(),
        };

        const updateRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(originalData),
          },
        );
        if (!updateRes.ok) throw new Error("Failed to update original call");

        // 2. Create follow-up call
        const followUpPayload = getApiData(true);
        delete (followUpPayload as any).id;

        const createRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(followUpPayload),
          },
        );
        if (!createRes.ok) throw new Error("Failed to create follow-up call");

        if (typeof window !== "undefined" && (window as any).toast) {
          (window as any).toast.success(
            "Call completed and follow-up scheduled!",
          );
        }
      } else {
        // Normal Create or Update
        const url = id
          ? `${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall/${id}`
          : `${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall`;

        const apiData = getApiData(false);
        if (id) {
          (apiData as any).id = id;
        }

        const response = await fetch(url, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) throw new Error("Failed to save call");

        if (typeof window !== "undefined" && (window as any).toast) {
          (window as any).toast.success(
            id ? "Call updated successfully!" : "Call created successfully!",
          );
        }
      }

      onSuccess && onSuccess({ status: callData.callStatus });
      onClose && onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save call");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCall = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall/${id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch call");

        const data = await response.json();
        console.log("Fetched data:", data);

        const toLocalDate = (dateStr: string | null | undefined): Date => {
          if (!dateStr) return new Date();
          const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
          return new Date(y, m - 1, d);
        };
        const callDate = toLocalDate(data.callDateTime);
        setSelectedDate(callDate);

        setCallData({
          ...data,
          LeadID:
            data.stage === "Lead" && data.stageItemId
              ? String(data.stageItemId)
              : "",

          callStatus: data.status?.toLowerCase() || "",
          callDate: formatDateForInput(data.callDateTime),
          callTime: formatTimeFromDateTime(data.callDateTime),
          customerName: data.customerName || "",
          city: data.city || "",

          assignedTo: data.assignedtouserid
            ? String(data.assignedtouserid)
            : data.assignedTo
              ? String(data.assignedTo)
              : "",
          duration: data.duration || "00:00:00",
        }); // ADD THESE 2 LINES RIGHT HERE:
        console.log(
          "stageItemId from API:",
          data.stageItemId,
          "| stage:",
          data.stage,
        );
        console.log(
          "LeadID set to:",
          data.stage === "Lead" && data.stageItemId
            ? String(data.stageItemId)
            : "EMPTY",
        );

        setOriginalCallDate(formatDateForInput(data.callDateTime));

        // Initialize time components
        const callTime = formatTimeFromDateTime(data.callDateTime);
        const timeComponents12 = convertTo12Hour(callTime);
        setTimeComponents(timeComponents12);

        // Initialize duration components
        const duration = data.duration || "00:00:00";
        const durationComponents24 = convertDurationToHM(duration);
        setDurationComponents(durationComponents24);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load call");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCall();
  }, [id]);

  // Update dates when follow-up dates are provided
  useEffect(() => {
    if (followUpDates) {
      setCallData((prev) => ({
        ...prev,
        callDate: followUpDates.startDate,
      }));
    }
  }, [followUpDates]);

  // Auto-fill assignedTo when selfTask is checked and options become available
  useEffect(() => {
    if (!selfTask || assignedToOptions.length === 0) return;
    const currentUser = AuthService.getCurrentUser();
    const me = assignedToOptions.find(
      (o) =>
        o.name === currentUser?.username ||
        o.name === `${currentUser?.firstName} ${currentUser?.lastName}`.trim(),
    );
    if (me) setCallData((prev) => ({ ...prev, assignedTo: me.id }));
  }, [selfTask, assignedToOptions]);

  const buildCallPayload = (
    overrides: { callStatus?: string; callDate?: string } = {},
  ) => {
    const data = { ...callData, ...overrides };
    const dateTime = new Date(data.callDate);
    const [h, m, s] = (data.callTime || "00:00:00").split(":");
    dateTime.setHours(Number(h), Number(m), Number(s || 0));
    const currentUserId = AuthService.getCurrentUser()?.userId;
    return {
      ...data,
      status: data.callStatus,
      callDateTime: dateTime.toISOString(),
      assignedTo: data.assignedTo,
      assignedToUserId: data.assignedTo ? Number(data.assignedTo) : undefined,
      stage: localStage || "Lead",
      stageItemId: localStageItemId
        ? Number(localStageItemId)
        : Number(data.LeadID),
      duration: data.duration,
      ...(id ? { userUpdated: currentUserId } : { userCreated: currentUserId }),
    };
  };

  const handleCallStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    if (callData.callStatus?.toLowerCase() === "planned" && newStatus === "completed") {
      const { value: newCallDate } = await Swal.fire({
        title: "Next Follow Up",
        html: `
          <div style="text-align:left;padding:0 8px">
            <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px">Call Date <span style="color:#ef4444">*</span></label>
            <input id="swal-call-date" type="date" style="width:100%;padding:10px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;color:#111827;outline:none;box-sizing:border-box;transition:border-color 0.2s" onfocus="this.style.borderColor='#f97316'" onblur="this.style.borderColor='#d1d5db'">
          </div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Schedule",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#6b7280",
        customClass: { popup: "swal-followup-popup" },
        didOpen: () => {
          const style = document.createElement("style");
          style.textContent =
            ".swal-followup-popup { border-radius: 16px !important; padding: 28px !important; } .swal-followup-popup .swal2-title { font-size: 20px !important; font-weight: 700 !important; color: #111827 !important; margin-bottom: 20px !important; } .swal-followup-popup .swal2-actions { margin-top: 24px !important; gap: 10px !important; } .swal-followup-popup .swal2-confirm, .swal-followup-popup .swal2-cancel { border-radius: 8px !important; padding: 10px 24px !important; font-size: 14px !important; font-weight: 600 !important; }";
          document.head.appendChild(style);
        },
        preConfirm: () => {
          const date = (
            document.getElementById("swal-call-date") as HTMLInputElement
          ).value;
          if (!date) {
            Swal.showValidationMessage("Call date is required");
            return;
          }
          return date;
        },
      });
      if (newCallDate) {
        try {
          // 1. PUT existing call as completed
          if (id) {
            const completedPayload = {
              ...buildCallPayload({ callStatus: "completed" }),
              id: Number(id),
            };
            await fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(completedPayload),
            });
          }
          // 2. POST new call as planned with the new date
          const newPayload = buildCallPayload({
            callStatus: "planned",
            callDate: newCallDate,
          });
          delete (newPayload as any).id;
          const createRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/SalesActivityCall`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPayload),
          });
          if (!createRes.ok) throw new Error("Failed to create follow-up call");
          await Swal.fire("Success", "Next follow-up scheduled!", "success");
          onSuccess?.();
          onClose?.();
          return;
        } catch (err) {
          Swal.fire("Error", "Failed to schedule next follow-up", "error");
          return;
        }
      }
      // User cancelled — don't change status
      return;
    }
    setCallData((prev) => ({ ...prev, callStatus: newStatus }));
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    const commonProps = {
      value: callData[fieldName as keyof CallData],
      onChange: (e: any) => {
        const newValue =
          fieldConfig.type === "multiSelect"
            ? e
            : e.target.type === "select-multiple"
              ? e.target.selectedOptions
              : e.target.value;
        setCallData((prev) => ({
          ...prev,
          [fieldName]: newValue,
        }));
        if (fieldName === "callStatus") {
          onStatusChange?.(typeof newValue === "string" ? newValue : "");
        }
      },
      className:
        "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2",
      required: fieldConfig.required,
    };

    switch (fieldConfig.type) {
      case "text":
        // Special handling for customerName and city when lead is selected
        if (
          (fieldName === "customerName" || fieldName === "city") &&
          callData.LeadID
        ) {
          return (
            <input
              type="text"
              step={fieldConfig.type === "time" ? "1" : undefined}
              {...commonProps}
              className={`${commonProps.className} bg-gray-100 cursor-not-allowed opacity-75`}
              readOnly
            />
          );
        }
        return (
          <input
            type={fieldConfig.type}
            step={fieldConfig.type === "time" ? "1" : undefined}
            {...commonProps}
            className={commonProps.className}
          />
        );
      case "date":
        return (
          <input
            type={fieldConfig.type}
            step={fieldConfig.type === "time" ? "1" : undefined}
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
              value={callData.LeadID || ""}
              className={`${commonProps.className} ${id ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}`}
              onChange={(e) => {
                const val = e.target.value;
                setCallData((prev) => ({ ...prev, LeadID: val }));
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
                  setCallData((prev) => ({
                    ...prev,
                    customerName: customerName,
                    city: city,
                    HospitalClinicIndividual: customerName,
                  }));

                  setLocalStage("Lead");
                  setLocalStageItemId(
                    sel.id ? String(sel.id) : String(sel.leadId),
                  );
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
              if (me) setCallData((prev) => ({ ...prev, assignedTo: me.id }));
            }
          };
          return (
            <div>
              <select
                value={callData.assignedTo || ""}
                onChange={(e) => {
                  setSelfTask(false);
                  setCallData((prev) => ({
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

        if (fieldName === "callStatus") {
          return (
            <select
              value={callData.callStatus || ""}
              onChange={handleCallStatusChange}
              className={commonProps.className}
              required={fieldConfig.required}
            >
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

      case "time-picker":
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
                  {Array.from({ length: 12 }, (_, i) => {
                    const hour = i + 1;
                    const hourStr = hour.toString().padStart(2, "0");
                    return (
                      <option key={hour} value={hourStr}>
                        {hourStr}
                      </option>
                    );
                  })}
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
                  {Array.from({ length: 60 }, (_, i) => {
                    const minute = i.toString().padStart(2, "0");
                    return (
                      <option key={i} value={minute}>
                        {minute}
                      </option>
                    );
                  })}
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

            {fieldErrors[fieldName] && (
              <p className="text-red-600 text-xs mt-1">
                {fieldErrors[fieldName]}
              </p>
            )}
          </div>
        );
      case "duration-picker":
        return (
          <div className="space-y-2">
            <div className="flex gap-2 mt-1">
              {/* Hours */}
              <div className="flex-1">
                <select
                  value={durationComponents.hours}
                  onChange={(e) =>
                    handleDurationComponentChange("hours", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, "0");
                    return (
                      <option key={i} value={hour}>
                        {hour}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Minutes */}
              <div className="flex-1">
                <select
                  value={durationComponents.minutes}
                  onChange={(e) =>
                    handleDurationComponentChange("minutes", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 60 }, (_, i) => {
                    const minute = i.toString().padStart(2, "0");
                    return (
                      <option key={i} value={minute}>
                        {minute}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {fieldErrors[fieldName] && (
              <p className="text-red-600 text-xs mt-1">
                {fieldErrors[fieldName]}
              </p>
            )}
          </div>
        );
      case "textarea":
        return <textarea {...commonProps} rows={3} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="w-full lg:w-2/3 p-4 sm:p-6 border-r">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
          )}
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(FORM_FIELDS)
              .filter(([fieldName]) => {
                if (!id && fieldName === "outcome") return false;
                if (fieldName === "LeadID" && stage) return false;
                return true;
              })
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
                  {/* Only show individual error if not in the multi-error state */}
                  {(!error || error !== "Please fill all required fields") &&
                    fieldErrors[fieldName] && (
                      <p className="text-red-600 text-xs mt-1">
                        {fieldErrors[fieldName]}
                      </p>
                    )}
                </div>
              ))}
          </div>

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
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {id ? "Updating..." : "Creating..."}
                  </span>
                ) : id ? "Update Call" : "Create Call"}
              </button>
            </div>
          </div>
        </form>
      </div>

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
            setCallData((prev) => ({ ...prev, callDate: localDate }));
          }}
          tasks={tasks}
        />
      </div>
    </div>
  );
};

export default CallForm;
