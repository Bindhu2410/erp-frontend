import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaClock as Clock } from "react-icons/fa";
import Calendar from "../common/Calendar";
import MultiSelect from "../common/MultiSelect";
import api from "../../services/api";
import AuthService from "../../services/authService";
// Form field configuration
const FORM_FIELDS = {
  LeadID: { type: "select", label: "Lead ID", required: true, colSpan: 1 },
  // meetingTitle removed. Use meetingType as the event title.
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
  meetingType: {
    type: "select",
    label: "Meeting Type",
    required: true,
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
  meetingDate: {
    type: "date",
    label: "Meeting Date",
    required: true,
  },
  meetingTime: {
    type: "time-picker",
    label: "Meeting Time",
    required: true,
  },
  duration: {
    type: "duration-picker",
    label: "Duration",
    required: false,
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
  // Delegate: single-select populated from PresenterDropdown (same as Assigned To)
  delegate: { type: "select", label: "Delegate", required: false, options: [] },
  assignedTo: {
    type: "select",
    label: "Assigned To",
    required: true,
    colSpan: 1,
    options: [],
  },

  address: {
    type: "textarea",
    label: "Address",
    required: false,
    colSpan: 2,
  },
} as const;
type MeetingData = {
  [K in keyof typeof FORM_FIELDS]: string;
};

interface MeetingFormProps {
  id?: string;
  onClose?: () => void;
  onSuccess?: (data?: { status: string }) => void;
  onStatusChange?: (status: string) => void;
  followUpDates?: { startDate: string; endDate: string } | null;
  stage?: string;
  stageItemId?: string;
  initialDate?: Date;
}

const MeetingForm: React.FC<MeetingFormProps> = ({
  id,
  stageItemId,
  stage,
  onClose,
  onSuccess,
  onStatusChange,
  followUpDates,
  initialDate,
}) => {
  console.log(
    "MeetingForm rendered with id:",
    id,
    "stageItemId:",
    stageItemId,
    "stage:",
    stage,
  );
  // Initialize state based on field config
  const [meetingData, setMeetingData] = useState<MeetingData>(
    Object.keys(FORM_FIELDS).reduce(
      (acc, key) => ({
        ...acc,
        [key]: "",
      }),
      {} as MeetingData,
    ),
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadOptions, setLeadOptions] = useState<any[]>([]);
  const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
  const [assignedToLoading, setAssignedToLoading] = useState(false);
  const [selfTask, setSelfTask] = useState(false);
  const [fetchedDelegateNames, setFetchedDelegateNames] = useState<
    string | null
  >(null);
  const [localStage, setLocalStage] = useState<string | undefined>(stage);
  const [localStageItemId, setLocalStageItemId] = useState<string | undefined>(
    stageItemId,
  );
  const [originalMeetingDate, setOriginalMeetingDate] = useState("");
  const [selectedLeadCity, setSelectedLeadCity] = useState<string>("");

  // Time picker state
  const [timeComponents, setTimeComponents] = useState({
    hours: "12",
    minutes: "00",
    period: "AM",
  });

  // Duration picker state (hours and minutes only, no AM/PM)
  const [durationComponents, setDurationComponents] = useState({
    hours: "00",
    minutes: "00",
  });

  // Convert duration to HH:MM:SS format
  const convertDurationToTime = (hours: string, minutes: string): string => {
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
  };

  // Convert HH:MM:SS format to duration components
  const convertTimeToDuration = (
    timeString: string,
  ): { hours: string; minutes: string } => {
    const [hours, minutes] = timeString.split(":");
    return {
      hours: hours || "00",
      minutes: minutes || "00",
    };
  };

  // Handle duration component changes
  const handleDurationComponentChange = (
    component: "hours" | "minutes",
    value: string,
  ) => {
    const newDurationComponents = { ...durationComponents, [component]: value };
    setDurationComponents(newDurationComponents);

    // Update meetingData with HH:MM:SS format
    const durationTime = convertDurationToTime(
      newDurationComponents.hours,
      newDurationComponents.minutes,
    );
    setMeetingData((prev) => ({ ...prev, duration: durationTime }));
  };
  const convertTo24Hour = (
    hours: string,
    minutes: string,
    period: string,
  ): string => {
    let hour24 = parseInt(hours);
    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    } else if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }
    return `${hour24.toString().padStart(2, "0")}:${minutes}:00`;
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (
    time24: string,
  ): { hours: string; minutes: string; period: string } => {
    const [hours, minutes] = time24.split(":");
    let hour12 = parseInt(hours);
    const period = hour12 >= 12 ? "PM" : "AM";

    if (hour12 === 0) {
      hour12 = 12;
    } else if (hour12 > 12) {
      hour12 -= 12;
    }

    return {
      hours: hour12.toString(),
      minutes: minutes,
      period: period,
    };
  };

  // Handle time component changes
  const handleTimeComponentChange = (
    component: "hours" | "minutes" | "period",
    value: string,
  ) => {
    const newTimeComponents = { ...timeComponents, [component]: value };
    setTimeComponents(newTimeComponents);

    // Update meetingData with 24-hour format
    const time24 = convertTo24Hour(
      newTimeComponents.hours,
      newTimeComponents.minutes,
      newTimeComponents.period,
    );
    setMeetingData((prev) => ({ ...prev, meetingTime: time24 }));
  };

  // utility helpers removed: delegate is now single-select

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setMeetingData((prev) => ({ ...prev, meetingDate: localDate }));
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
      setMeetingData((prev) => ({ ...prev, address: (prev.address ? prev.address + ' ' : '') + transcript }));
    };
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
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
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!id) return;
      setIsLoading(true);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting/${id}`,
        );
        if (!response.ok) throw new Error("Failed to fetch meeting");
        const data = await response.json();

        const toLocalDate = (dateStr: string | null | undefined): Date => {
          if (!dateStr) return new Date();
          const [y, m, d] = dateStr.split("T")[0].split("-").map(Number);
          return new Date(y, m - 1, d);
        };

        const meetingDate = toLocalDate(data.meetingDateTime);
        setSelectedDate(meetingDate);

        const timeString = formatTimeFromDateTime(data.meetingDateTime);
        const time12Hour = convertTo12Hour(timeString);
        setTimeComponents(time12Hour);

        // Initialize duration components
        const durationTime = data.duration || "00:00:00";
        const duration12Hour = convertTimeToDuration(durationTime);
        setDurationComponents(duration12Hour);

        setMeetingData({
          ...data,
          LeadID:
            data.stage === "Lead" && data.stageItemId
              ? String(data.stageItemId)
              : "",
          meetingDate: formatDateForInput(data.meetingDateTime),
          meetingTime: timeString,
          // store delegate id later when presenters are fetched
          delegate: "",
          assignedTo: data.assignedtouserid
            ? String(data.assignedtouserid)
            : data.assignedTo
              ? String(data.assignedTo)
              : "",
          duration: data.duration || "00:00:00",
          status: data.status?.toLowerCase() || "",
          // meetingTitle removed, do not set
        });
        setOriginalMeetingDate(formatDateForInput(data.meetingDateTime));
        setFetchedDelegateNames(data.delegate || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load meeting");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeeting();
  }, [id, onSuccess]);

  // default meeting date to today for new meetings
  useEffect(() => {
    if (!id) {
      const today = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD
      setMeetingData((prev) => ({
        ...prev,
        meetingDate: today,
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
          pageSize: 10,
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
  useEffect(() => {
    if (!meetingData.meetingTime || meetingData.meetingTime.trim() === "") {
      const defaultTime = convertTo24Hour("12", "00", "AM");

      setMeetingData((prev) => ({
        ...prev,
        meetingTime: defaultTime,
      }));
    }
  }, []);
  // reconcile assignedTo username to id when options load; also reconcile delegate once presenters are available
  useEffect(() => {
    if (!assignedToOptions || assignedToOptions.length === 0) return;

    // reconcile assignedTo field if it's a username
    const cur = meetingData.assignedTo;
    if (cur && !assignedToOptions.some((o) => o.id === cur)) {
      const found = assignedToOptions.find(
        (o) => o.name === cur || String(o.name) === String(cur),
      );
      if (found) setMeetingData((prev) => ({ ...prev, assignedTo: found.id }));
    }

    // reconcile delegate: if we have fetched delegate names, map to first matching id
    if (fetchedDelegateNames) {
      const names = fetchedDelegateNames.split(",").map((n) => n.trim());
      const found = assignedToOptions.find((o) => names.includes(o.name));
      if (found) {
        setMeetingData((prev) => ({ ...prev, delegate: found.id }));
        setFetchedDelegateNames(null);
      }
    } else {
      const curDel = meetingData.delegate;
      if (curDel && !assignedToOptions.some((o) => o.id === curDel)) {
        const found = assignedToOptions.find(
          (o) => o.name === curDel || String(o.name) === String(curDel),
        );
        if (found) setMeetingData((prev) => ({ ...prev, delegate: found.id }));
      }
    }
  }, [
    assignedToOptions,
    meetingData.assignedTo,
    meetingData.delegate,
    fetchedDelegateNames,
  ]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    Object.entries(FORM_FIELDS).forEach(([fieldName, config]) => {
      if (fieldName === "LeadID" && stage) return;
      const value = meetingData[fieldName as keyof MeetingData];
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
        const meetingDate = isFollowUp
          ? followUpDates?.startDate
          : meetingData.meetingDate;
        const meetingTime = isFollowUp ? "09:00:00" : meetingData.meetingTime;

        const meetingDateTime = new Date(meetingDate || "");
        const [hours, minutes, seconds] = meetingTime.split(":");
        meetingDateTime.setHours(
          Number(hours),
          Number(minutes),
          Number(seconds),
        );

        const currentUserId = AuthService.getCurrentUser()?.userId;

        return {
          ...meetingData,
          title: meetingData.meetingType, // Use meetingType as the event title
          meetingDateTime: meetingDateTime.toISOString(),
          delegate: (() => {
            const delId = meetingData.delegate;
            const found = assignedToOptions.find((o) => o.id === delId);
            return found ? found.name : meetingData.delegate || "";
          })(),
          assignedTo: meetingData.assignedTo,
          assignedtouserid: meetingData.assignedTo
            ? isNaN(Number(meetingData.assignedTo))
              ? undefined
              : Number(meetingData.assignedTo)
            : undefined,
          duration: meetingData.duration || "00:00:00",
          status: isFollowUp ? "planned" : meetingData.status,
          customerId: "1",
          isActive: true,
          stage: localStage || stage || "Lead",
          stageItemId: localStageItemId || stageItemId || meetingData.LeadID,
          ...(id ? { userUpdated: currentUserId } : { userCreated: currentUserId }),
        };
      };

      if (id && followUpDates) {
        // 1. Update original meeting
        const originalMeetingDateTime = new Date(originalMeetingDate);
        const [h, m, s] = meetingData.meetingTime.split(":");
        originalMeetingDateTime.setHours(Number(h), Number(m), Number(s));

        const originalData = {
          ...getApiData(false),
          id: id,
          meetingDateTime: originalMeetingDateTime.toISOString(),
          title: meetingData.meetingType, // Use meetingType as the event title
        };

        const updateRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(originalData),
          },
        );
        if (!updateRes.ok) throw new Error("Failed to update original meeting");

        // 2. Create follow-up meeting
        const followUpData = getApiData(true);
        // Important: Remove ID from follow-up creation
        const followUpPayload = { ...followUpData, title: meetingData.meetingType };
        delete (followUpPayload as any).id;

        const createRes = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(followUpPayload),
          },
        );
        if (!createRes.ok)
          throw new Error("Failed to create follow-up meeting");

        if (typeof window !== "undefined" && (window as any).toast) {
          (window as any).toast.success(
            "Meeting completed and follow-up scheduled!",
          );
        }
      } else {
        // Normal Create or Update
        const url = id
          ? `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting/${id}`
          : `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting`;

        const apiData = { ...getApiData(false), title: meetingData.meetingType };
        if (id) {
          (apiData as any).id = id;
        } else {
          delete (apiData as any).id;
        }

        const response = await fetch(url, {
          method: id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });

        if (!response.ok) throw new Error("Failed to save meeting");

        if (typeof window !== "undefined" && (window as any).toast) {
          (window as any).toast.success(
            id
              ? "Meeting updated successfully!"
              : "Meeting created successfully!",
          );
        }
      }

      onSuccess && onSuccess({ status: meetingData.status });
      onClose && onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save meeting");
    } finally {
      setIsLoading(false);
    }
  };
  // Update dates when follow-up dates are provided
  useEffect(() => {
    if (followUpDates) {
      setMeetingData((prev) => ({
        ...prev,
        meetingDate: followUpDates.startDate,
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
    if (me) setMeetingData((prev) => ({ ...prev, assignedTo: me.id }));
  }, [selfTask, assignedToOptions]);

  // Helper to build the common meeting API payload
  const buildMeetingPayload = (
    overrides: Partial<
      MeetingData & { status: string; meetingDate: string }
    > = {},
  ) => {
    const data = { ...meetingData, ...overrides };
    const meetingDateTime = new Date(data.meetingDate);
    const [h, m, s] = (data.meetingTime || "00:00:00").split(":");
    meetingDateTime.setHours(Number(h), Number(m), Number(s || 0));
    const currentUserId = AuthService.getCurrentUser()?.userId;
    return {
      ...data,
      meetingDateTime: meetingDateTime.toISOString(),
      delegate: (() => {
        const found = assignedToOptions.find((o) => o.id === data.delegate);
        return found ? found.name : data.delegate || "";
      })(),
      assignedTo: data.assignedTo,
      assignedtouserid: data.assignedTo ? Number(data.assignedTo) : undefined,
      duration: data.duration || "00:00:00",
      customerId: "1",
      isActive: true,
      stage: localStage || stage || "Lead",
      stageItemId: localStageItemId || stageItemId || data.LeadID,
      ...(id ? { userUpdated: currentUserId } : { userCreated: currentUserId }),
    };
  };

  // Helper to handle status change
  const handleStatusChange = async (e: any) => {
    const newStatus = e.target.value;
    if (meetingData.status?.toLowerCase() === "planned" && newStatus === "completed") {
      const { value: newMeetingDate } = await Swal.fire({
        title: "Next Follow Up",
        html: `
          <div style="text-align:left;padding:0 8px">
            <label style="display:block;font-size:13px;font-weight:600;color:#374151;margin-bottom:6px">Meeting Date <span style="color:#ef4444">*</span></label>
            <input id="swal-meeting-date" type="date" style="width:100%;padding:10px 12px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;color:#111827;outline:none;box-sizing:border-box;transition:border-color 0.2s" onfocus="this.style.borderColor='#f97316'" onblur="this.style.borderColor='#d1d5db'">
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
            document.getElementById("swal-meeting-date") as HTMLInputElement
          ).value;
          if (!date) {
            Swal.showValidationMessage("Meeting date is required");
            return;
          }
          return date;
        },
      });

      if (newMeetingDate) {
        try {
          // 1. PUT existing meeting as completed
          if (id) {
            const completedPayload = {
              ...buildMeetingPayload({ status: "completed" }),
              id: Number(id),
            };
            await fetch(
              `${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting/${id}`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(completedPayload),
              },
            );
          }
          // 2. POST new meeting as planned with the new date
          const newPayload = buildMeetingPayload({
            status: "planned",
            meetingDate: newMeetingDate,
          });
          delete (newPayload as any).id;
          const createRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPayload),
          });
          if (!createRes.ok) throw new Error("Failed to create follow-up meeting");
          await Swal.fire("Success", "Next follow-up scheduled!", "success");
          onSuccess?.();
          onClose?.();
          return;
        } catch (err) {
          Swal.fire("Error", "Failed to schedule next follow-up", "error");
          return;
        }
      }
      // User cancelled the popup — don't change status
      return;
    }
    setMeetingData((prev) => ({ ...prev, status: newStatus }));
  };

  const renderField = (fieldName: string, fieldConfig: any) => {
    const commonProps = {
      value: meetingData[fieldName as keyof MeetingData],
      onChange: (e: any) => {
        const newValue =
          fieldConfig.type === "multiSelect"
            ? e
            : e.target.type === "select-multiple"
              ? e.target.selectedOptions
              : e.target.value;
        setMeetingData((prev) => ({
          ...prev,
          [fieldName]: newValue,
        }));
        if (fieldName === "status") {
          onStatusChange?.(typeof newValue === "string" ? newValue : "");
        }
      },
      className:
        "w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
      required: fieldConfig.required,
    };

    switch (fieldConfig.type) {
      case "text":
        // Special handling for customerName and city when lead is selected
        if (
          (fieldName === "customerName" || fieldName === "city") &&
          meetingData.LeadID
        ) {
          return (
            <>
              <input
                type="text"
                placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                {...commonProps}
                readOnly
                className={`${commonProps.className} bg-gray-100 cursor-not-allowed opacity-75`}
              />
            </>
          );
        }
        return (
          <>
            <input
              type="text"
              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
              {...commonProps}
            />
          </>
        );
      case "date":
        return (
          <>
            <input
              type="date"
              {...commonProps}
              className={commonProps.className}
            />
          </>
        );
      case "select":
        // Custom logic for status field
        if (fieldName === "status") {
          return (
            <select
              value={meetingData.status || ""}
              onChange={handleStatusChange}
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
        // LeadID special handling
        if (fieldName === "LeadID") {
          const leadSelectOptions = leadOptions;
          return (
            <select
              {...commonProps}
              value={meetingData.LeadID || ""}
              className={`${commonProps.className} ${id ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}`}
              onChange={(e) => {
                const val = e.target.value;
                setMeetingData((prev) => ({ ...prev, LeadID: val }));
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
                  setMeetingData((prev) => ({
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
              if (me)
                setMeetingData((prev) => ({ ...prev, assignedTo: me.id }));
            }
          };
          return (
            <div>
              <select
                value={meetingData.assignedTo || ""}
                onChange={(e) => {
                  setSelfTask(false);
                  setMeetingData((prev) => ({
                    ...prev,
                    assignedTo: e.target.value,
                  }));
                }}
                disabled={assignedToLoading}
                className={`w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${selfTask ? "pointer-events-none bg-gray-50" : ""}`}
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

        if (fieldName === "delegate") {
          return (
            <select
              {...commonProps}
              value={meetingData.delegate || ""}
              onChange={(e) =>
                setMeetingData((prev) => ({
                  ...prev,
                  delegate: e.target.value,
                }))
              }
              disabled={assignedToLoading}
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
          );
        }

        // If no options, render text input
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
      case "time":
        return (
          <div className="relative">
            <input
              type={fieldConfig.type}
              step={fieldConfig.type === "time" ? "1" : undefined}
              {...commonProps}
            />
            <Clock className="absolute right-3 top-3 text-gray-500" size={16} />
          </div>
        );
      case "time-picker":
        return (
          <div className="space-y-2">
            <div className="flex gap-2 mt-1">
              {/* Hours */}
              <div className="flex-1 ">
                <select
                  value={timeComponents.hours}
                  onChange={(e) =>
                    handleTimeComponentChange("hours", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <option key={hour} value={hour.toString()}>
                      {hour}
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
                  value={timeComponents.period}
                  onChange={(e) =>
                    handleTimeComponentChange("period", e.target.value)
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
      case "duration-picker":
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              {/* Hours */}
              <div className="flex-1">
                <select
                  value={durationComponents.hours}
                  onChange={(e) =>
                    handleDurationComponentChange("hours", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <option key={hour} value={hour.toString().padStart(2, "0")}>
                      {hour.toString().padStart(2, "0")}
                    </option>
                  ))}
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
            </div>
          </div>
        );

      case "multiSelect":
        return (
          <>
            <MultiSelect
              options={fieldConfig.options}
              selectedIds={
                Array.isArray((meetingData as any)[fieldName])
                  ? ((meetingData as any)[fieldName] as string[])
                  : []
              }
              onChange={(selected) =>
                setMeetingData((prev) => ({
                  ...prev,
                  [fieldName]: selected,
                }))
              }
              placeholder={`Select ${fieldConfig.label}`}
            />
          </>
        );
      case "textarea":
        return (
          <>
            <textarea
              {...commonProps}
              className={commonProps.className + " min-h-[120px] resize-none"}
              placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
              rows={3}
            />
          </>
        );
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
              .filter(([fieldName]) => fieldName !== "meetingTitle" && !(fieldName === "LeadID" && stage))
              .map(([fieldName, config]) => (
                <div
                  key={fieldName}
                  className={`col-span-${
                    (config as { colSpan?: number }).colSpan ?? 1
                  }`}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                type="submit"
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {id ? "Updating..." : "Creating..."}
                  </span>
                ) : id ? "Update Meeting" : "Create Meeting"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="w-full lg:w-2/6 p-4 sm:p-6 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Schedule Overview
        </h3>
        <Calendar
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            userChangedDate.current = true;
            setSelectedDate(date);
            const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            setMeetingData((prev) => ({ ...prev, meetingDate: localDate }));
          }}
          tasks={[]}
        />
      </div>
    </div>
  );
};

export default MeetingForm;
