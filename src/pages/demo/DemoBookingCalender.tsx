import React, { useEffect, useState } from "react";
import api from "../../services/api";
interface Equipment {
  id: string;
  name: string;
  type: string;
  status: "Available" | "In Use" | "In Transit" | "Reserved";
  location: string;
}
interface BookingEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  equipmentId: string;
  customer: string;
  status: "Pending" | "Confirmed" | "Completed";
}

interface Assignment {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
  demoItemId: number;
  assignedToType: string;
  assignedToId: number;
  assignmentStartDate: string;
  expectedReturnDate: string;
  actualReturnDate: string;
  status: string;
}
const DemoBookingCalender = () => {
  const [calendarView, setCalendarView] = useState<
    "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "resourceTimeGridDay"
  >("dayGridMonth");
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<BookingEvent[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(
    null
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewType, setViewType] = useState<
    "day" | "week" | "month" | "equipment"
  >("week");
  const [showViewSelector, setShowViewSelector] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const mockEquipment: Equipment[] = [
      {
        id: "US-001",
        name: "Ultrasound Machine X100",
        type: "Ultrasound",
        status: "Available",
        location: "Central Inventory",
      },
      {
        id: "US-002",
        name: "Ultrasound Machine X100",
        type: "Ultrasound",
        status: "In Use",
        location: "With Jane",
      },
      {
        id: "DEF-001",
        name: "Defibrillator D200",
        type: "Defibrillator",
        status: "In Transit",
        location: "To Inventory",
      },
      {
        id: "DEF-002",
        name: "Defibrillator D200",
        type: "Defibrillator",
        status: "Reserved",
        location: "Central Inventory",
      },
    ];

    const mockBookings: BookingEvent[] = [
      {
        id: "1",
        title: "Demo at Acme Corp",
        start: "2025-06-08T10:00:00",
        end: "2025-06-08T12:00:00",
        equipmentId: "US-001",
        customer: "Acme Corp",
        status: "Confirmed",
      },
      {
        id: "2",
        title: "Demo at Beta Health",
        start: "2025-06-09T14:00:00",
        end: "2025-06-09T16:00:00",
        equipmentId: "DEF-001",
        customer: "Beta Health",
        status: "Pending",
      },
    ];

    setEquipment(mockEquipment);
    setBookings(mockBookings);

    // Fetch assignments for booking calendar
    api
      .get("SalesDemoAssignment")
      .then((res) => {
        setAssignments(Array.isArray(res.data) ? res.data : [res.data]);
      })
      .catch(() => setAssignments([]));
  }, []);

  // Use assignments for booking events in calendar
  const getAssignmentTimeline = () => {
    // Map assignments to a timeline structure for the calendar
    // You can further enhance this logic as needed
    return assignments.map((a) => ({
      id: a.id,
      demoItemId: a.demoItemId,
      assignedToType: a.assignedToType,
      assignedToId: a.assignedToId,
      start: a.assignmentStartDate,
      end: a.expectedReturnDate,
      status: a.status,
    }));
  };

  const getEquipmentTimeline = () => {
    const timeline: any[] = [];
    equipment.forEach((eq) => {
      // Create blocks for each day
      const startDate = new Date("2025-06-07");
      const days = 7;

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Find booking for this equipment on this day
        const booking = bookings.find(
          (b) =>
            b.equipmentId === eq.id &&
            new Date(b.start).toDateString() === currentDate.toDateString()
        );

        timeline.push({
          equipment: eq,
          date: currentDate,
          status: booking ? "In Use" : eq.status,
          booking,
        });
      }
    });
    return timeline;
  };

  const renderEquipmentView = () => {
    const timeline = getEquipmentTimeline();
    const dateHeaders = Array.from({ length: 7 }, (_, i) => {
      const date = new Date("2025-06-07");
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 bg-gray-50 border border-gray-200">
                  Equipment
                </th>
                {dateHeaders.map((date) => (
                  <th
                    key={date.toISOString()}
                    className="p-3 bg-gray-50 border border-gray-200 min-w-[150px]"
                  >
                    <div>
                      {date.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div>
                      {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {equipment.map((eq) => (
                <tr key={eq.id}>
                  <td className="p-3 border border-gray-200 bg-white">
                    <div className="font-medium">{eq.name}</div>
                    <div className="text-sm text-gray-500">{eq.id}</div>
                  </td>
                  {dateHeaders.map((date) => {
                    const cell = timeline.find(
                      (t) =>
                        t.equipment.id === eq.id &&
                        t.date.toDateString() === date.toDateString()
                    );
                    const statusColor =
                      cell?.status === "Available"
                        ? "bg-green-100"
                        : cell?.status === "In Use"
                        ? "bg-blue-100"
                        : cell?.status === "Reserved"
                        ? "bg-purple-100"
                        : "bg-yellow-100";

                    return (
                      <td
                        key={date.toISOString()}
                        className={`p-3 border border-gray-200 ${statusColor}`}
                      >
                        {cell?.booking ? (
                          <div>
                            <div className="font-medium">
                              {cell.booking.title}
                            </div>
                            <div className="text-sm">
                              {new Date(cell.booking.start).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                              {" - "}
                              {new Date(cell.booking.end).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm">{cell?.status}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const handleViewChange = (newView: "day" | "week" | "month") => {
    setViewType(newView);
    setShowViewSelector(false);
  };

  const renderDayView = () => {
    const today = new Date();
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Morning</h4>
            <div className="space-y-2">
              {equipment.map((eq) => (
                <div key={eq.id} className="bg-emerald-200 p-2 rounded">
                  {eq.id} - {eq.name}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Afternoon</h4>
            <div className="space-y-2">
              {equipment.map((eq) => (
                <div key={eq.id} className="bg-emerald-200 p-2 rounded">
                  {eq.id} - {eq.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const timeline = getEquipmentTimeline();
    const dateHeaders = Array.from({ length: 7 }, (_, i) => {
      const date = new Date("2025-06-07");
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-3 text-left font-medium text-sm w-48">
                Equipment
              </th>
              {dateHeaders.map((date, index) => (
                <th
                  key={index}
                  className="py-2 px-3 text-center font-medium text-sm"
                >
                  <div>
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div>
                    {String(date.getDate()).padStart(2, "0")}/
                    {String(date.getMonth() + 1).padStart(2, "0")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq) => (
              <tr key={eq.id} className="border-b">
                <td className="py-2 px-3">
                  <div className="text-sm font-medium">{eq.id}</div>
                </td>
                {Array.from({ length: 7 }).map((_, index) => (
                  <td key={index} className="py-2 px-0 relative">
                    <div className="h-8 bg-emerald-200"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="text-xl mb-4">Resource utilization this month</div>
        <div className="space-y-2">
          {equipment.map((eq) => {
            const utilization = eq.id === "DEF-002" ? 7 : 0;
            return (
              <div key={eq.id} className="flex items-center py-2 bg-gray-50">
                <div className="flex-1 px-4">
                  <div>
                    {eq.id} - {eq.name}
                  </div>
                  <div className="relative h-2 w-full bg-gray-200 mt-1">
                    <div
                      className="absolute h-full bg-green-600 rounded-full"
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                </div>
                <div className="px-4 text-right">
                  {utilization}% Utilization
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>In Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>
    );
  };
  const viewOptions = [
    { label: "Day View", value: "day" },
    { label: "Week View", value: "week" },
    { label: "Month View", value: "month" },
  ];

  const renderCalendarContent = () => {
    switch (viewType) {
      case "day":
        return renderDayView();
      case "week":
        return renderWeekView();
      case "month":
        return renderMonthView();
      default:
        return renderWeekView();
    }
  };
  return (
    <div className="mt-8">
      {/* <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Equipment Booking Calendar</h2>
        <div className="flex items-center gap-3">
          {" "}
          <div className="relative inline-block">
            <button
              onClick={() => setShowViewSelector(!showViewSelector)}
              className="bg-white border border-gray-300 rounded px-3 py-1.5 inline-flex items-center"
            >
              <span className="mr-1">
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)} View
              </span>
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
            {showViewSelector && (
              <div className="absolute right-0 mt-1 py-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                {viewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleViewChange(option.value as "day" | "week" | "month")
                    }
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <select
              className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 pr-8"
              defaultValue="all"
            >
              <option value="all">All Products</option>
              <option value="US">Ultrasound</option>
              <option value="DEF">Defibrillator</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="bg-white rounded-lg border border-gray-200 p-4"> */}
      {/* <div className="overflow-x-auto">{renderCalendarContent()}</div> */}

      {/* <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">In Use</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-400"></div>
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div> */}


    </div>
  );
};

export default DemoBookingCalender;
