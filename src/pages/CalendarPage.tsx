import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Calendar, momentLocalizer, Views, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "react-toastify";
import {
  FaCalendar,
  FaPhone,
  FaUsers,
  FaTasks,
  FaSearch,
  FaEdit,
  FaUser,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { TiGroup } from "react-icons/ti";
import { MdEvent, MdMeetingRoom } from "react-icons/md";
import Modal from "../components/common/Modal";
import EventForm from "../components/forms/EventForm";
import MeetingForm from "../components/forms/MeetingForm";
import CallForm from "../components/forms/CallForm";
import TaskForm from "../components/forms/TaskForm";
import api from "../services/api";
import AuthService from "../services/authService";
import teamHierarchyService from "../services/teamHierarchyService";
const localizer = momentLocalizer(moment);

// Define event types
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "event" | "meeting" | "call" | "task";
  status?: string;
  description?: string;
  participants?: string;
  assignedTo?: string;
  priority?: "high" | "medium" | "low";
  allDay?: boolean;
}

// Custom event style getter
const eventStyleGetter = (event: CalendarEvent) => {
  let backgroundColor = "#3174ad";
  const isPast =
    new Date(event.start) < new Date(new Date().setHours(0, 0, 0, 0));

  switch (event.type) {
    case "event":
      backgroundColor = "#10b981";
      break;
    case "meeting":
      backgroundColor = "#3b82f6";
      break;
    case "call":
      backgroundColor = "#f59e0b";
      break;
    case "task":
      backgroundColor = "#ef4444";
      break;
    default:
      backgroundColor = "#6b7280";
  }

  const isCompleted =
    String(event.status).toLowerCase() === "completed" ||
    String(event.status).toLowerCase() === "cancelled";

  if (isCompleted) {
    backgroundColor = backgroundColor + "80";
  }

  return {
    style: {
      backgroundColor,
      color: "white",
      border: "none",
      borderRadius: "4px",
      fontSize: "12px",
      padding: "2px 4px",
      opacity: isCompleted ? 0.45 : 1,
      filter: isCompleted ? "grayscale(40%)" : "none",
    },
  };
};

// Custom event component
const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  const getIcon = () => {
    switch (event.type) {
      case "event":
        return <MdEvent className="w-3 h-3 inline mr-1" />;
      case "meeting":
        return <MdMeetingRoom className="w-3 h-3 inline mr-1" />;
      case "call":
        return <FaPhone className="w-3 h-3 inline mr-1" />;
      case "task":
        return <FaTasks className="w-3 h-3 inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      <span className="truncate">{event.title}</span>
    </div>
  );
};

interface ToolbarContextValue {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  filterType: string;
  setFilterType: React.Dispatch<React.SetStateAction<string>>;
  filterStatus: string;
  setFilterStatus: React.Dispatch<React.SetStateAction<string>>;
  showCreateDropdown: boolean;
  setShowCreateDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  handleCreateNew: (type: "event" | "meeting" | "call" | "task") => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

const ToolbarContext = createContext<ToolbarContextValue | null>(null);

const CustomToolbar = ({
  onNavigate,
  label,
  onView,
  view: currentView,
}: any) => {
  const toolbarContext = useContext(ToolbarContext);

  if (!toolbarContext) return null;

  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    showCreateDropdown,
    setShowCreateDropdown,
    handleCreateNew,
    dropdownRef,
  } = toolbarContext;

  return (
    <div className="flex flex-col mb-6 gap-3">
      {/* Row 1: Navigation + Month label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("PREV")}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            &larr;
          </button>
          <button
            onClick={() => onNavigate("TODAY")}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => onNavigate("NEXT")}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            &rarr;
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">{label}</h2>
      </div>

      {/* Row 2: Filters + Views + Create */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <FaSearch className="absolute left-1.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-28"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="event">Events</option>
          <option value="meeting">Meetings</option>
          <option value="call">Calls</option>
          <option value="task">Tasks</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="planned">Planned</option>
          <option value="completed">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <div className="flex items-center gap-1 bg-gray-100 rounded p-0.5">
          {["month", "week", "day", "agenda"].map((viewName) => (
            <button
              key={viewName}
              onClick={() => onView(viewName)}
              className={`px-2 py-0.5 rounded text-xs capitalize transition-colors ${
                currentView === viewName
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {viewName}
            </button>
          ))}
        </div>

        <div
          className="relative flex-shrink-0 ml-auto"
          ref={dropdownRef as React.RefObject<HTMLDivElement>}
        >
          <button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create
            <svg
              className={`w-3 h-3 transition-transform ${showCreateDropdown ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => handleCreateNew("event")}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MdEvent className="w-4 h-4 text-green-600" />
                <span>Event</span>
              </button>
              <button
                onClick={() => handleCreateNew("meeting")}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FaUsers className="w-4 h-4 text-blue-600" />
                <span>Meeting</span>
              </button>
              <button
                onClick={() => handleCreateNew("call")}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FaPhone className="w-4 h-4 text-yellow-600" />
                <span>Call</span>
              </button>
              <button
                onClick={() => handleCreateNew("task")}
                className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FaTasks className="w-4 h-4 text-red-600" />
                <span>Task</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomDateHeader = ({ date, label }: { date: Date; label: string }) => {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  return (
    <div style={{ textAlign: "right", padding: "2px 4px" }}>
      <span
        style={
          isToday
            ? {
                backgroundColor: "#1a73e8",
                color: "white",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "700",
              }
            : { fontSize: "12px", fontWeight: "500", color: "#1e293b" }
        }
      >
        {label}
      </span>
    </div>
  );
};

const CalendarPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [allHierarchy, setAllHierarchy] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  // "me" = only myself | number = that user + their direct reports | "all" = everyone
  const [selectedUserId, setSelectedUserId] = useState<number | "all" | "me">(
    "me",
  );
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<number>>(
    new Set(),
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [formType, setFormType] = useState<
    "event" | "meeting" | "call" | "task"
  >("event");
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [showSlotDropdown, setShowSlotDropdown] = useState(false);
  const [selectedSlotStart, setSelectedSlotStart] = useState<Date | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const slotDropdownRef = useRef<HTMLDivElement>(null);
  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex justify-between gap-4 border-b pb-2">
      <span className="text-xs font-medium text-gray-500 uppercase">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-800 text-right break-words">
        {value || "-"}
      </span>
    </div>
  );
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "${process.env.REACT_APP_API_BASE_URL}PresenterDropdown/presenterDropdown",
        );
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch team hierarchy — get users who report to the current user
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const currentUserId = AuthService.getCurrentUser()?.userId;
        if (!currentUserId) return;
        const res = await teamHierarchyService.getHierarchy();
        const hierarchy: any[] = res.data?.data || res.data || [];
        setAllHierarchy(hierarchy);
        // Direct reports of current user
        const subordinates = hierarchy.filter(
          (h: any) => Number(h.parentUserId) === Number(currentUserId),
        );
        const currentUserEntry = {
          userId: currentUserId,
          username: AuthService.getCurrentUser()?.username || "Me",
          firstName: AuthService.getCurrentUser()?.firstName || "",
          lastName: AuthService.getCurrentUser()?.lastName || "",
          roleName:
            hierarchy.find(
              (h: any) => Number(h.userId) === Number(currentUserId),
            )?.roleName || null,
          isCurrentUser: true,
        };
        setTeamMembers([currentUserEntry, ...subordinates]);
      } catch (err) {
        console.error("Failed to fetch team hierarchy", err);
      }
    };
    fetchTeamMembers();
  }, []);
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Get current user ID from localStorage (same as leads page uses)
        const getUserId = () => {
          try {
            const userStr =
              localStorage.getItem("user") ||
              localStorage.getItem("userData") ||
              localStorage.getItem("currentUser");

            if (!userStr) return null;

            const userData = JSON.parse(userStr);

            return (
              userData?.id || userData?.userId || userData?.user?.id || null
            );
          } catch (err) {
            console.error("Invalid user data in localStorage");
            return null;
          }
        };
        const userId = getUserId();

        if (!userId) {
          console.error("User not found. Please login again.");
          return;
        }
        const res = await api.post("SalesLead/grid", {
          searchText: "",
          pageNumber: 1,
          pageSize: 1000, // ← fetch all
          orderBy: "id",
          orderDirection: "DESC",
          customerNames: [],
          statuses: [],
          scores: [],
          leadTypes: [],
          selectedLeadIds: [],
          territories: [],
          zones: [],
          // Fetch all leads regardless of creator to ensure activity details can find the corresponding lead
        });
        const raw = res.data || {};
        const leadsArray = Array.isArray(raw)
          ? raw
          : raw.results || raw.data || [];
        console.log("Leads fetched:", leadsArray.length);
        setLeads(leadsArray);
      } catch (err) {
        console.error("Failed to fetch leads", err);
        setLeads([]);
      }
    };
    fetchLeads();
  }, []);
  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowCreateDropdown(false);
      }
      if (
        slotDropdownRef.current &&
        !slotDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSlotDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUserId = AuthService.getCurrentUser()?.userId;

      const [eventsRes, meetingsRes, callsRes, tasksRes] =
        await Promise.allSettled([
          fetch("${process.env.REACT_APP_API_BASE_URL}SalesActivityEvent"),
          fetch("${process.env.REACT_APP_API_BASE_URL}SalesActivityMeeting"),
          fetch("${process.env.REACT_APP_API_BASE_URL}SalesActivityCall"),
          fetch("${process.env.REACT_APP_API_BASE_URL}SalesActivityTask"),
        ]);

      // Build allowed user IDs based on selection
      const allowedIds: Set<number> = new Set();

      if (selectedUserId === "me") {
        if (currentUserId) allowedIds.add(currentUserId);
      } else if (selectedUserId === "all") {
        if (currentUserId) allowedIds.add(currentUserId);
        const addAll = (parentId: number) => {
          allHierarchy
            .filter((h: any) => Number(h.parentUserId) === parentId)
            .forEach((h: any) => {
              const uid = Number(h.userId);
              if (!allowedIds.has(uid)) {
                allowedIds.add(uid);
                addAll(uid);
              }
            });
        };
        if (currentUserId) addAll(currentUserId);
      } else {
        // Specific user selected: show that user + ALL subordinates recursively
        const addRecursive = (parentId: number) => {
          allowedIds.add(parentId);
          allHierarchy
            .filter((h: any) => Number(h.parentUserId) === parentId)
            .forEach((h: any) => {
              const uid = Number(h.userId);
              if (!allowedIds.has(uid)) addRecursive(uid);
            });
        };
        addRecursive(Number(selectedUserId));
      }

      const belongsToUser = (record: any): boolean => {
        if (!currentUserId) return true;
        const createdBy = Number(
          record.userCreated ?? record.createdBy ?? record.createdByUserId ?? 0,
        );
        const assignedTo = Number(
          record.assignedtouserid ??
            record.assignedToUserId ??
            record.assignedTo ??
            0,
        );
        return allowedIds.has(createdBy) || allowedIds.has(assignedTo);
      };

      const allEvents: CalendarEvent[] = [];

      // Process events
      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const eventsData = await eventsRes.value.json();
        const processedEvents = eventsData
          .filter(belongsToUser)
          .map((event: any) => ({
            id: `event-${event.id}`,
            title: event.eventTitle || event.title || "Event",
            start: new Date(
              event.startDateTime ||
                event.startDate ||
                event.eventDate ||
                event.start,
            ),
            end: new Date(
              event.endDateTime ||
                event.endDate ||
                event.eventDate ||
                event.end,
            ),
            type: "event" as const,
            status: event.status,
            description: event.description,
            participants: event.participants,
            raw: event,
            allDay: event.allDay || false,
          }));
        allEvents.push(...processedEvents);
      }

      // Process meetings
      if (meetingsRes.status === "fulfilled" && meetingsRes.value.ok) {
        const meetingsData = await meetingsRes.value.json();
        const processedMeetings = meetingsData
          .filter(belongsToUser)
          .map((meeting: any) => {
            let startDate: Date | null = null;
            const endDate: Date | null = null;

            if (meeting.meetingDate && meeting.meetingTime) {
              const [year, month, day] = meeting.meetingDate
                .split("-")
                .map((n: string) => parseInt(n, 10));
              const [hh, mm, ss] = meeting.meetingTime
                .split(":")
                .map((n: string) => parseInt(n, 10));
              startDate = new Date(
                year,
                (month || 1) - 1,
                day,
                hh || 0,
                mm || 0,
                ss || 0,
              );
            } else if (meeting.meetingDate) {
              const [year, month, day] = meeting.meetingDate
                .split("-")
                .map((n: string) => parseInt(n, 10));
              startDate = new Date(year, (month || 1) - 1, day);
            } else if (meeting.meetingDateTime) {
              startDate = new Date(meeting.meetingDateTime);
            } else if (meeting.startDateTime) {
              startDate = new Date(meeting.startDateTime);
            } else if (meeting.start) {
              startDate = new Date(meeting.start);
            }

            // Prefer explicit date+time fields from the API (meetingDate + meetingTime)
            // so we can construct a local Date deterministically and avoid timezone shifts
            if (meeting.meetingDate && meeting.meetingTime) {
              const [year, month, day] = meeting.meetingDate
                .split("-")
                .map((n: string) => parseInt(n, 10));
              const [hh, mm, ss] = meeting.meetingTime
                .split(":")
                .map((n: string) => parseInt(n, 10));
              startDate = new Date(
                year,
                (month || 1) - 1,
                day,
                hh || 0,
                mm || 0,
                ss || 0,
              );
            } else if (meeting.meetingDate) {
              const [year, month, day] = meeting.meetingDate
                .split("-")
                .map((n: string) => parseInt(n, 10));
              startDate = new Date(year, (month || 1) - 1, day);
            } else if (meeting.meetingDateTime) {
              startDate = new Date(meeting.meetingDateTime);
            } else if (meeting.startDateTime) {
              startDate = new Date(meeting.startDateTime);
            } else if (meeting.start) {
              startDate = new Date(meeting.start);
            }

            return {
              id: `meeting-${meeting.id}`,
              title:
                meeting.meetingType ||
                meeting.title ||
                meeting.meetingTitle ||
                "Meeting",
              start: startDate || new Date(),
              end: endDate || (startDate ? new Date(startDate) : new Date()),
              type: "meeting" as const,
              status: meeting.status,
              description: meeting.description,
              participants: meeting.participants,
              raw: meeting,
              allDay: false,
            };
          });
        allEvents.push(...processedMeetings);
      }

      // Process calls
      if (callsRes.status === "fulfilled" && callsRes.value.ok) {
        const callsData = await callsRes.value.json();
        const processedCalls = callsData
          .filter(belongsToUser)
          .map((call: any) => ({
            id: `call-${call.id}`,
            title: call.callTitle || call.title || "Call",
            start: new Date(call.callDateTime || call.callDate),
            end: new Date(
              new Date(call.callDateTime || call.callDate).getTime() +
                (call.duration ? parseDuration(call.duration) : 30 * 60000),
            ),
            type: "call" as const,
            status: call.status,
            description: call.description,
            participants: call.participants,
            raw: call,
            allDay: false,
          }));
        allEvents.push(...processedCalls);
      }

      // Process tasks
      if (tasksRes.status === "fulfilled" && tasksRes.value.ok) {
        const tasksData = await tasksRes.value.json();
        const processedTasks = tasksData
          .filter(belongsToUser)
          .map((task: any) => ({
            id: `task-${task.id}`,
            title: task.taskName || "Task",
            start: new Date(task.dueDate),
            end: new Date(task.dueDate),
            type: "task" as const,
            status: task.status?.toLowerCase(),
            description: task.description,
            assignedTo: task.assignedtouserid?.toString(),
            priority: task.priority?.toLowerCase(),
            raw: task,
            allDay: true,
          }));
        allEvents.push(...processedTasks);
      }

      setEvents(allEvents);
    } catch (error) {
      console.error("Failed to fetch calendar events:", error);
      toast.error("Failed to load calendar events");
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId, allHierarchy]);

  // Parse duration string (HH:mm:ss) to milliseconds
  const parseDuration = (duration: string): number => {
    const parts = duration.split(":");
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents, selectedUserId]);

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "all" || event.type === filterType;
    const matchesStatus =
      filterStatus === "all" ||
      String(event.status).toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleEditFromDetails = () => {
    if (!selectedEvent) return;
    const type = selectedEvent.id.split("-")[0] as
      | "event"
      | "meeting"
      | "call"
      | "task";
    setFormType(type);
    setShowDetails(false);
    setShowForm(true);
  };

  // Handle slot selection (creating new event) - Show dropdown instead of direct form
  // AFTER (fixed)
  const handleSelectSlot = ({
    start,
    box,
  }: {
    start: Date;
    end: Date;
    box?: { clientX: number; clientY: number; x: number; y: number };
  }) => {
    // Block creating on past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) return; // ← just exit, no dropdown

    setSelectedEvent(null);
    setSelectedSlotStart(start);
    setDropdownPosition({
      x: box?.clientX ?? window.innerWidth / 2,
      y: box?.clientY ?? window.innerHeight / 2,
    });
    setShowSlotDropdown(true);
  };
  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEvent(null);
    setShowSlotDropdown(false);
    setSelectedSlotStart(null);
  };

  // Handle form success
  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedEvent(null);
    setShowSlotDropdown(false);
    fetchEvents(); // Refresh events
    toast.success("Calendar updated successfully!");
  };

  // Handle create new item from toolbar dropdown
  const handleCreateNew = (type: "event" | "meeting" | "call" | "task") => {
    setSelectedEvent(null);
    setFormType(type);
    setShowForm(true);
    setShowCreateDropdown(false);
    setShowSlotDropdown(false);
    setSelectedSlotStart(null);
  };

  // Handle create new item from slot dropdown
  const handleCreateFromSlot = (
    type: "event" | "meeting" | "call" | "task",
  ) => {
    setSelectedEvent(null);
    setFormType(type);
    setShowForm(true);
    setShowSlotDropdown(false);
  };

  const dayPropGetter = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return {
        className: "past-day-cell",
        style: { backgroundColor: "#f1f5f9" },
      };
    }
    return {};
  };

  const isFiltered =
    searchTerm !== "" || filterType !== "all" || filterStatus !== "all";

  // Get initials for avatar
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // Get direct reports of a given userId from allHierarchy
  const getDirectReports = (parentId: number) =>
    allHierarchy.filter((h: any) => Number(h.parentUserId) === parentId);

  const currentUserId = AuthService.getCurrentUser()?.userId;

  // Sidebar user node renderer
  const renderUserNode = (member: any, depth = 0) => {
    const uid = Number(member.userId ?? member.userid);
    const name =
      member.username ||
      `${member.firstName || ""} ${member.lastName || ""}`.trim() ||
      `User ${uid}`;
    const role = member.roleName || member.RoleName || null;
    const directReports = getDirectReports(uid);
    const hasReports = directReports.length > 0;
    const isExpanded = expandedNodeIds.has(uid);
    const isSelected =
      selectedUserId === uid ||
      (selectedUserId === "me" && uid === currentUserId);
    const isMe = uid === currentUserId;

    return (
      <div key={uid}>
        {/* Row: expand toggle (separate) + select row */}
        <div className="flex items-start gap-1">
          {/* Expand/collapse button — only for non-me users with reports */}
          {hasReports && !isMe ? (
            <button
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 flex-shrink-0 transition-colors mt-1.5"
              style={{ marginLeft: `${depth * 16}px` }}
              onClick={(e) => {
                e.stopPropagation();
                setExpandedNodeIds((prev) => {
                  const next = new Set(prev);
                  next.has(uid) ? next.delete(uid) : next.add(uid);
                  return next;
                });
              }}
              title={isExpanded ? "Collapse" : "Expand team"}
            >
              {isExpanded ? (
                <FaChevronDown className="w-2 h-2 text-gray-500" />
              ) : (
                <FaChevronRight className="w-2 h-2 text-gray-400" />
              )}
            </button>
          ) : (
            <div
              className="w-5 flex-shrink-0"
              style={{ marginLeft: `${depth * 16}px` }}
            />
          )}

          {/* Selectable row */}
          <div
            className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
              isSelected ? "bg-blue-600 shadow-sm" : "hover:bg-gray-100"
            }`}
            onClick={() => {
              if (isMe) {
                setSelectedUserId("me");
              } else {
                setSelectedUserId(uid);
              }
            }}
          >
            {/* Avatar */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                isSelected
                  ? "bg-white/20 text-white"
                  : isMe
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
              }`}
            >
              {isMe ? <FaUser className="w-2.5 h-2.5" /> : getInitials(name)}
            </div>

            {/* Name + Role */}
            <div className="flex-1 min-w-0">
              {isMe ? (
                <p
                  className={`text-xs font-semibold break-words ${
                    isSelected ? "text-white" : "text-blue-700"
                  }`}
                >
                  Me{role ? ` · ${role}` : ""}
                </p>
              ) : (
                <>
                  <p
                    className={`text-xs font-semibold break-words leading-tight ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {name}
                  </p>
                  {role && (
                    <p
                      className={`text-[10px] break-words leading-tight mt-0.5 ${
                        isSelected ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {role}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Reports count badge */}
            {hasReports && !isMe && (
              <span
                className={`text-[9px] font-bold px-1 py-0.5 rounded-full flex-shrink-0 self-start mt-0.5 ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {directReports.length}
              </span>
            )}
          </div>
        </div>

        {/* Sub-reports — stays open until manually collapsed */}
        {isExpanded && hasReports && (
          <div className="mt-0.5 border-l-2 border-blue-100 ml-4">
            {directReports.map((sub: any) => renderUserNode(sub, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <FaCalendar className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Calendar</h1>
          <p className="text-xs text-gray-500">
            Manage your events, meetings, calls, and tasks
          </p>
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* LEFT SIDEBAR */}
        <div className="w-56 flex-shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
              <FaUsers className="w-3 h-3" /> Team View
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* All option */}
            <div
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                selectedUserId === "all"
                  ? "bg-blue-600 shadow-sm"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => {
                setSelectedUserId("all");
                setExpandedNodeIds(new Set());
              }}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  selectedUserId === "all" ? "bg-white/20" : "bg-indigo-100"
                }`}
              >
                <FaUsers
                  className={`w-2.5 h-2.5 ${
                    selectedUserId === "all" ? "text-white" : "text-indigo-600"
                  }`}
                />
              </div>
              <p
                className={`text-xs font-semibold ${
                  selectedUserId === "all" ? "text-white" : "text-gray-700"
                }`}
              >
                All
              </p>
              <span
                className={`ml-auto text-[9px] font-bold px-1 py-0.5 rounded-full ${
                  selectedUserId === "all"
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {teamMembers.length}
              </span>
            </div>

            {/* Divider */}
            {teamMembers.length > 1 && (
              <div className="border-t border-gray-100 my-1" />
            )}

            {/* Current user (Me) always first */}
            {teamMembers
              .filter((m) => m.isCurrentUser)
              .map((member) => renderUserNode(member))}

            {/* Divider between me and team */}
            {teamMembers.filter((m) => !m.isCurrentUser).length > 0 && (
              <div className="border-t border-gray-100 my-1" />
            )}

            {/* Direct reports — each can expand their own sub-tree */}
            {teamMembers
              .filter((m) => !m.isCurrentUser)
              .map((member) => renderUserNode(member))}
          </div>
        </div>

        {/* RIGHT: Calendar area */}
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 flex-1 overflow-auto">
            {/* Summary Bar - Sales module card style */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  title: "Events",
                  value: events.filter((e) => e.type === "event").length,
                  icon: <MdEvent className="text-2xl" />,
                  bg: "bg-green-100 text-green-800",
                  sub: `Completed: ${events.filter((e) => e.type === "event" && String(e.status).toLowerCase() === "completed").length}`,
                },
                {
                  title: "Meetings",
                  value: events.filter((e) => e.type === "meeting").length,
                  icon: <TiGroup className="text-2xl" />,
                  bg: "bg-blue-100 text-blue-800",
                  sub: `Scheduled: ${events.filter((e) => e.type === "meeting" && String(e.status).toLowerCase() === "scheduled").length}`,
                },
                {
                  title: "Calls",
                  value: events.filter((e) => e.type === "call").length,
                  icon: <FaPhone className="text-2xl" />,
                  bg: "bg-yellow-100 text-yellow-800",
                  sub: `Completed: ${events.filter((e) => e.type === "call" && String(e.status).toLowerCase() === "completed").length}`,
                },
                {
                  title: "Tasks",
                  value: events.filter((e) => e.type === "task").length,
                  icon: <FaTasks className="text-2xl" />,
                  bg: "bg-red-100 text-red-800",
                  sub: `Pending: ${events.filter((e) => e.type === "task" && String(e.status).toLowerCase() === "pending").length}`,
                },
              ].map(({ title, value, icon, bg, sub }) => (
                <div key={title} className={`p-4 rounded-lg ${bg}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-sm">{title}</h3>
                      <p className="text-2xl font-bold mt-2">{value}</p>
                      <p className="text-xs mt-1 opacity-80">{sub}</p>
                    </div>
                    <div>{icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}

            <ToolbarContext.Provider
              value={{
                searchTerm,
                setSearchTerm,
                filterType,
                setFilterType,
                filterStatus,
                setFilterStatus,
                showCreateDropdown,
                setShowCreateDropdown,
                handleCreateNew,
                dropdownRef,
              }}
            >
              <div className={`flex gap-4 ${isFiltered ? "items-start" : ""}`}>
                <div
                  style={{ height: "620px" }}
                  className={`relative calendar-container ${
                    isFiltered ? "flex-1 min-w-0" : "w-full"
                  }`}
                >
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
                  .calendar-container .rbc-calendar {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                  }

                  .calendar-container .rbc-header {
                    background: #f8fafc;
                    border-bottom: 1px solid #e2e8f0;
                    padding: 12px 8px;
                    font-weight: 600;
                    color: #475569;
                    text-align: center;
                  }

                  .calendar-container .rbc-month-view {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                  }

                  .calendar-container .rbc-date-cell {
                    padding: 8px;
                    border-right: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-date-cell:last-child {
                    border-right: none;
                  }

                  .calendar-container .rbc-today {
                    background-color: #ffffff !important;
                    border: none !important;
                    box-shadow: none !important;
                  }
                  .calendar-container .rbc-day-bg.rbc-today {
                    background-color: #ffffff !important;
                  }

                  .calendar-container .rbc-off-range-bg {
                    background-color: #f8fafc;
                  }

                  .calendar-container .rbc-current-time-indicator {
                    background-color: #ef4444;
                    height: 2px;
                    z-index: 3;
                  }

                  .calendar-container .rbc-time-view {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                  }

                  .calendar-container .rbc-time-header {
                    border-bottom: 1px solid #e2e8f0;
                  }

                  .calendar-container .rbc-time-content {
                    border-top: none;
                  }

                  .calendar-container .rbc-timeslot-group {
                    border-bottom: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-time-slot {
                    border-top: 1px solid #f8fafc;
                  }

                  .calendar-container .rbc-day-slot .rbc-time-slot {
                    border-top: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-agenda-view {
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    overflow: hidden;
                  }

                  .calendar-container .rbc-agenda-view table {
                    width: 100%;
                  }

                  .calendar-container .rbc-agenda-view .rbc-header {
                    background: #f1f5f9;
                    border-bottom: 1px solid #e2e8f0;
                  }

                  .calendar-container .rbc-agenda-date-cell {
                    padding: 12px;
                    border-right: 1px solid #e2e8f0;
                    background: #f8fafc;
                    font-weight: 600;
                    color: #475569;
                  }

                  .calendar-container .rbc-agenda-time-cell {
                    padding: 12px;
                    border-right: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 0.875rem;
                  }

                  .calendar-container .rbc-agenda-event-cell {
                    padding: 12px;
                    color: #1e293b;
                  }

                  .calendar-container .rbc-event {
                    border: none !important;
                    border-radius: 4px;
                    color: white;
                    font-size: 11px;
                    padding: 2px 4px;
                    margin: 1px 0;
                    outline: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }

                  .calendar-container .rbc-event:hover {
                    opacity: 0.8;
                    transform: translateY(-1px);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }

                  .calendar-container .rbc-event:focus {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                  }

                  .calendar-container .rbc-event.rbc-selected {
                    box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #3b82f6;
                  }

                  .calendar-container .rbc-show-more {
                    color: #3b82f6;
                    font-weight: 500;
                    cursor: pointer;
                    font-size: 11px;
                    padding: 2px 4px;
                    border-radius: 4px;
                    background: #eff6ff;
                  }

                  .calendar-container .rbc-show-more:hover {
                    background: #dbeafe;
                  }

                  .calendar-container .rbc-overlay {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                    padding: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                  }

                  .calendar-container .rbc-overlay .rbc-event {
                    margin: 2px 0;
                  }

                  .calendar-container .rbc-time-gutter {
                    border-right: 1px solid #e2e8f0;
                    background: #f8fafc;
                  }

                  .calendar-container .rbc-time-header .rbc-header {
                    border-bottom: 1px solid #e2e8f0;
                    border-right: 1px solid #e2e8f0;
                  }

                  .calendar-container .rbc-time-header .rbc-header:last-child {
                    border-right: none;
                  }

                  .calendar-container .rbc-day-bg {
                    border-right: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-day-bg:last-child {
                    border-right: none;
                  }

                  .calendar-container .rbc-week-view .rbc-header {
                    border-right: 1px solid #e2e8f0;
                  }

                  .calendar-container .rbc-week-view .rbc-header:last-child {
                    border-right: none;
                  }

                  .calendar-container .rbc-month-view .rbc-row {
                    border-bottom: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-month-view .rbc-row:last-child {
                    border-bottom: none;
                  }

                  .calendar-container .rbc-month-view .rbc-date-cell {
                    padding: 4px 8px;
                     min-height: 50px;
                    border-right: 1px solid #f1f5f9;
                  }

                  .calendar-container .rbc-month-view .rbc-date-cell:last-child {
                    border-right: none;
                  }

                  .calendar-container .rbc-month-view .rbc-date-cell.rbc-off-range {
                    color: #94a3b8;
                  }

                  .calendar-container .rbc-month-view .rbc-date-cell button {
                    color: #1e293b;
                    font-weight: 500;
                    padding: 4px 8px;
                    border-radius: 4px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                  }

                  .calendar-container .rbc-month-view .rbc-date-cell button:hover {
                    background: #f1f5f9;
                  }

                  .calendar-container .rbc-event.event-type-event {
                    background-color: #10b981;
                  }

                  .calendar-container .rbc-event.event-type-meeting {
                    background-color: #3b82f6;
                  }

                  .calendar-container .rbc-event.event-type-call {
                    background-color: #f59e0b;
                  }

                  .calendar-container .rbc-event.event-type-task {
                    background-color: #ef4444;
                  }

                  @media (max-width: 768px) {
                    .calendar-container .rbc-calendar {
                      font-size: 12px;
                    }
                    
                    .calendar-container .rbc-month-view .rbc-date-cell {
                      min-height: 80px;
                      padding: 2px 4px;
                    }
                    
                    .calendar-container .rbc-event {
                      font-size: 10px;
                      padding: 1px 2px;
                    }
                    
                    .calendar-container .rbc-header {
                      padding: 8px 4px;
                      font-size: 12px;
                    }
                  }

                  .calendar-container .rbc-overlay::-webkit-scrollbar {
                    width: 4px;
                  }

                  .calendar-container .rbc-overlay::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                  }

                  .calendar-container .rbc-overlay::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                  }

                  .calendar-container .rbc-overlay::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                  }

                  .calendar-container .past-day-cell {
                    background-color: #f1f5f9 !important;
                  }
                  .calendar-container .rbc-month-view .rbc-date-cell.past-day-cell button,
                  .calendar-container .past-day-cell button {
                    color: #94a3b8 !important;
                    font-weight: 400 !important;
                  }
                `,
                    }}
                  />
                  <Calendar
                    localizer={localizer}
                    events={filteredEvents}
                    startAccessor="start"
                    endAccessor="end"
                    views={["month", "week", "day", "agenda"]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    popup
                    eventPropGetter={eventStyleGetter}
                    dayPropGetter={dayPropGetter}
                    components={{
                      toolbar: CustomToolbar,
                      event: CustomEvent,
                      month: {
                        dateHeader: CustomDateHeader,
                      },
                    }}
                    formats={{
                      timeGutterFormat: "HH:mm",
                      eventTimeRangeFormat: ({
                        start,
                        end,
                      }: {
                        start: Date;
                        end: Date;
                      }) =>
                        `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
                      agendaTimeRangeFormat: ({
                        start,
                        end,
                      }: {
                        start: Date;
                        end: Date;
                      }) =>
                        `${moment(start).format("HH:mm")} - ${moment(end).format("HH:mm")}`,
                    }}
                    step={30}
                    timeslots={2}
                  />
                </div>

                {/* Filtered List Panel */}
                {isFiltered && (
                  <div
                    className="w-72 flex-shrink-0"
                    style={{ height: "620px" }}
                  >
                    <div className="h-full flex flex-col bg-white border border-gray-200 rounded-xl shadow overflow-hidden">
                      <div className="px-3 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-bold text-gray-700">
                            {moment(date).format("MMMM YYYY")}
                          </h3>
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            {
                              filteredEvents.filter(
                                (ev) =>
                                  ev.start.getMonth() === date.getMonth() &&
                                  ev.start.getFullYear() === date.getFullYear(),
                              ).length
                            }
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Filtered results this month
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {filteredEvents
                          .filter(
                            (ev) =>
                              ev.start.getMonth() === date.getMonth() &&
                              ev.start.getFullYear() === date.getFullYear(),
                          )
                          .sort((a, b) => a.start.getTime() - b.start.getTime())
                          .map((ev) => (
                            <div
                              key={ev.id}
                              onClick={() => handleSelectEvent(ev)}
                              className="bg-white rounded-lg p-2.5 cursor-pointer border border-gray-100 hover:border-blue-300 hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                                    ev.type === "event"
                                      ? "bg-green-500"
                                      : ev.type === "meeting"
                                        ? "bg-blue-500"
                                        : ev.type === "call"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                  }`}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-800 truncate">
                                    {ev.title}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {moment(ev.start).format("MMM D")}
                                    {!ev.allDay &&
                                      ` • ${moment(ev.start).format("HH:mm")}`}
                                  </p>
                                  <span
                                    className={`text-[10px] px-1 py-0.5 rounded capitalize font-semibold ${
                                      ev.type === "event"
                                        ? "bg-green-100 text-green-700"
                                        : ev.type === "meeting"
                                          ? "bg-blue-100 text-blue-700"
                                          : ev.type === "call"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {ev.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ToolbarContext.Provider>
          </div>
        </div>
      </div>

      {/* Slot Selection Dropdown */}
      {showSlotDropdown && (
        <div
          ref={slotDropdownRef}
          className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
          style={{
            left: `${Math.min(dropdownPosition.x, window.innerWidth - 200)}px`,
            top: `${Math.min(dropdownPosition.y, window.innerHeight - 200)}px`,
            width: "192px",
          }}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-700 border-b border-gray-100">
            Create New
          </div>
          <button
            onClick={() => handleCreateFromSlot("event")}
            className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <MdEvent className="w-4 h-4 text-green-600" />
            <span>Event</span>
          </button>
          <button
            onClick={() => handleCreateFromSlot("meeting")}
            className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaUsers className="w-4 h-4 text-blue-600" />
            <span>Meeting</span>
          </button>
          <button
            onClick={() => handleCreateFromSlot("call")}
            className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaPhone className="w-4 h-4 text-yellow-600" />
            <span>Call</span>
          </button>
          <button
            onClick={() => handleCreateFromSlot("task")}
            className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FaTasks className="w-4 h-4 text-red-600" />
            <span>Task</span>
          </button>
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title={selectedEvent ? selectedEvent.title : ""}
        type="sm"
      >
        <div className="p-6 w-full flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="text-center w-full">
              <p className="text-sm text-gray-500">
                {moment(selectedEvent?.start).format("LLL")}
              </p>
            </div>

            <button
              onClick={handleEditFromDetails}
              className="p-2 rounded-full hover:bg-gray-200"
              title="Edit"
            >
              <FaEdit />
            </button>
          </div>

          {/* Content Card */}
          <div
            className="rounded-xl p-5 shadow-sm w-full space-y-3"
            style={{
              backgroundColor:
                selectedEvent?.type === "event"
                  ? "#dff6ec"
                  : selectedEvent?.type === "meeting"
                    ? "#eaf3ff"
                    : selectedEvent?.type === "call"
                      ? "#fff6db"
                      : "#fff0f0",
            }}
          >
            {(() => {
              const raw = (selectedEvent as any)?.raw || {};
              const data = { ...(selectedEvent as any), ...raw };
              const get = (...keys: string[]) =>
                keys
                  .map((k) => data[k])
                  .find((v) => v !== undefined && v !== null && v !== "") || "";
              const formatDate = (d: any) =>
                d ? moment(d).format("YYYY-MM-DD") : "";
              const formatTime = (t: any) =>
                t
                  ? moment(t, ["HH:mm", "HH:mm:ss", "hh:mm A"]).format("HH:mm")
                  : "";
              const assignedId =
                raw?.assignedtouserid ??
                raw?.assignedToUserId ??
                selectedEvent?.assignedTo ??
                null;
              const assignedUser = users.find(
                (u) => Number(u.id) === Number(assignedId),
              );

              const assigned =
                assignedUser?.username || assignedUser?.name || "-";

              /* ---------- TASK ---------- */

              const stageItemId = raw?.stageItemId ?? "";
              const leadObj =
                stageItemId !== ""
                  ? leads.find((l) => String(l.id) === String(stageItemId))
                  : null;

              const lead = leadObj
                ? `${leadObj.leadId || ""} - ${leadObj.customerName || ""}`
                : stageItemId !== ""
                  ? `ID: ${stageItemId} (not found)`
                  : "-";
              if (selectedEvent?.type === "task") {
                return (
                  <>
                    <InfoRow label="Lead ID" value={lead} />
                    <InfoRow
                      label="Due Date"
                      value={formatDate(get("dueDate"))}
                    />
                    <InfoRow label="Status" value={get("status")} />
                    <InfoRow label="Assigned To" value={assigned} />

                    {/* <div className="pt-2">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Checklist
              </p>
              {checklist.length === 0 ? (
                <p className="text-sm text-gray-700">NaN</p>
              ) : (
                <ul className="list-disc list-inside text-sm text-gray-800">
                  {checklist.map((c: any, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </div> */}
                  </>
                );
              }
              if (selectedEvent?.type === "event") {
                return (
                  <>
                    <InfoRow label="Lead ID" value={lead} />

                    <InfoRow
                      label="Start Date"
                      value={formatDate(get("startDate"))}
                    />
                    <InfoRow
                      label="Start Time"
                      value={formatTime(
                        get("startTime") || selectedEvent.start,
                      )}
                    />
                    <InfoRow label="Status" value={get("status")} />
                    <InfoRow label="Assigned To" value={assigned} />
                  </>
                );
              }

              /* ---------- MEETING ---------- */
              if (selectedEvent?.type === "meeting") {
                return (
                  <>
                    <InfoRow label="Lead ID" value={lead} />
                    <InfoRow label="Customer" value={get("customerName")} />
                    <InfoRow label="Meeting Type" value={get("meetingType")} />
                    <InfoRow label="Status" value={get("status")} />
                    <InfoRow label="Assigned To" value={assigned} />
                  </>
                );
              }

              /* ---------- CALL (DEFAULT) ---------- */
              return (
                <>
                  <InfoRow label="Lead ID" value={lead} />
                  <InfoRow label="Call Type" value={get("callType")} />
                  <InfoRow label="Priority" value={get("priority")} />
                  <InfoRow label="Call Status" value={get("status")} />
                  <InfoRow label="Assigned To" value={assigned} />
                </>
              );
            })()}
          </div>
        </div>
      </Modal>

      {/* Forms Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleFormClose}
        type="max"
        title={
          formType === "event"
            ? "Schedule Event"
            : formType === "meeting"
              ? "Schedule Meeting"
              : formType === "call"
                ? "Schedule Call"
                : formType === "task"
                  ? "Schedule Task"
                  : ""
        }
      >
        {formType === "event" && (
          <EventForm
            id={selectedEvent?.id.replace("event-", "")}
            initialDate={selectedSlotStart || undefined}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormSuccess();
              setSelectedSlotStart(null);
            }}
          />
        )}
        {formType === "meeting" && (
          <MeetingForm
            id={selectedEvent?.id.replace("meeting-", "")}
            initialDate={selectedSlotStart || undefined}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormSuccess();
              setSelectedSlotStart(null);
            }}
          />
        )}
        {formType === "call" && (
          <CallForm
            id={selectedEvent?.id.replace("call-", "")}
            initialDate={selectedSlotStart || undefined}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormSuccess();
              setSelectedSlotStart(null);
            }}
          />
        )}
        {formType === "task" && (
          <TaskForm
            id={selectedEvent?.id.replace("task-", "")}
            initialDate={selectedSlotStart || undefined}
            onClose={handleFormClose}
            onSuccess={() => {
              handleFormSuccess();
              setSelectedSlotStart(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
