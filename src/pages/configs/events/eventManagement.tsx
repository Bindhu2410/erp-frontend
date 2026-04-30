import React, { useState } from "react";

const TABS = [
  { key: "eventList", label: "Event List" },
  { key: "eventCalendar", label: "Event Calendar" },
];

// Example event data for calendar
const events = [
  { date: "2025-08-25", name: "TechExpo 2025", status: "completed" },
  { date: "2025-08-20", name: "AI Summit", status: "cancelled" },
  { date: "2025-08-28", name: "CloudConf", status: "booked" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-500 text-white";
    case "cancelled":
      return "bg-red-500 text-white";
    case "booked":
      return "bg-blue-500 text-white";
    default:
      return "bg-gray-300 text-gray-700";
  }
}

function getMonthDays(year: number, month: number) {
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

const EventManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("eventList");
  // Add state for modals, form data, etc. as needed

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Event Details</h1>
          <div className="space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">
              Create Event
            </button>

            <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300 transition">
              Back to Hub
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="border-b mb-6 flex space-x-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`px-6 py-2 font-medium text-gray-600 border-b-4 transition-colors duration-200 focus:outline-none ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.key === "eventList" ? (
                <span className="inline-flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                  Event List
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Event Calendar
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Event List Tab */}
        <div className={activeTab === "eventList" ? "block" : "hidden"}>
          {/* ...existing code... (event cards, details, etc.) */}
          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">
              TechExpo 2025
            </h3>
            <div className="flex space-x-2 mb-2">
              <span className="px-3 py-1 rounded bg-blue-700 text-white font-bold">
                Exhibition
              </span>
              <span className="px-3 py-1 rounded bg-gray-500 text-white font-bold">
                Completed
              </span>
            </div>
            {/* <div className="flex space-x-2 mb-4">
              <button className="bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700">
                View Details
              </button>
              <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded shadow hover:bg-gray-300">
                Edit
              </button>
              <button className="border border-gray-400 px-3 py-1 rounded hover:bg-red-100">
                Delete
              </button>
            </div> */}
            <div className="mb-2 text-gray-700">
              <span className="inline-flex items-center mr-2">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87"
                  />
                </svg>
              </span>
              Convention Center, San Francisco
            </div>
            <div className="mb-2 text-gray-700">
              <span className="inline-flex items-center mr-2">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87"
                  />
                </svg>
              </span>
              3 team members
            </div>
            <div className="mb-2 text-gray-700">
              <span className="inline-flex items-center mr-2">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
                  />
                </svg>
              </span>
              $15,000 budget
            </div>
            <div className="mb-2 text-gray-700">
              Annual technology exhibition featuring latest innovations in AI,
              Cloud, and Software Solutions
            </div>
            <div className="mb-2 text-gray-700">
              <strong>Goals:</strong> Generate 50+ qualified pre-leads, increase
              brand awareness
            </div>
            <div className="mb-2 text-gray-700">
              <strong>ROI:</strong> Generated 47 pre-leads, $180,000 pipeline
              value
            </div>
          </section>
        </div>

        {/* Event Calendar Tab */}
        <div className={activeTab === "eventCalendar" ? "block" : "hidden"}>
          <section className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Event Calendar - August 2025
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-bold text-gray-600">
                  {d}
                </div>
              ))}
              {/* Calendar days */}
              {(() => {
                const year = 2025,
                  month = 7; // August (0-indexed)
                const days = getMonthDays(year, month);
                const firstDay = days[0].getDay();
                const blanks = Array(firstDay).fill(null);
                return [
                  ...blanks.map((_, i) => <div key={"blank-" + i}></div>),
                  ...days.map((date) => {
                    const dateStr = date.toISOString().slice(0, 10);
                    const event = events.find((e) => e.date === dateStr);
                    return (
                      <div
                        key={dateStr}
                        className="relative h-16 flex flex-col items-center justify-center border rounded"
                      >
                        <span className="font-semibold">{date.getDate()}</span>
                        {event && (
                          <span
                            className={`absolute bottom-1 left-1 right-1 px-2 py-1 text-xs rounded ${getStatusColor(
                              event.status
                            )}`}
                          >
                            {event.name}
                            <br />
                            {event.status.charAt(0).toUpperCase() +
                              event.status.slice(1)}
                          </span>
                        )}
                      </div>
                    );
                  }),
                ];
              })()}
            </div>
            <div className="mt-4 flex space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded bg-blue-500 text-white text-xs">
                Booked
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded bg-green-500 text-white text-xs">
                Completed
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded bg-red-500 text-white text-xs">
                Cancelled
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default EventManagement;
