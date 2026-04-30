import React, { useState } from "react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  tasks: Array<{
    date: Date;
    title: string;
    type: string;
  }>;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  tasks,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const getDayTasks = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    return tasks.filter(
      (task) =>
        task.date.getDate() === date.getDate() &&
        task.date.getMonth() === date.getMonth() &&
        task.date.getFullYear() === date.getFullYear(),
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatTaskDate = (date: Date) => {
    if (isNaN(date.getTime())) {
      console.warn("Invalid date passed to formatTaskDate:", date);
      return ""; // Return an empty string or fallback
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h2 className="text-lg font-semibold text-gray-800">
            {formatDate(currentDate)}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOfMonth)].map((_, i) => (
              <div key={`empty-${i}`} className="p-2"></div>
            ))}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isSelected =
                day === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear();
              const hasTasks = getDayTasks(day).length > 0;

              return (
                <div
                  key={day}
                  onClick={() =>
                    onDateSelect(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        day,
                      ),
                    )
                  }
                  className={`
                    p-2 cursor-pointer border rounded-md text-center
                    transition-all duration-200 ease-in-out
                    hover:bg-blue-50 hover:border-blue-300
                    ${
                      isSelected
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : ""
                    }
                    ${
                      hasTasks
                        ? "border-blue-500 font-semibold"
                        : "border-transparent"
                    }
                  `}
                >
                  {day}
                  {hasTasks && (
                    <div className="h-1 w-1 bg-blue-500 rounded-full mx-auto mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tasks Preview */}
      {/* <div className="mt-6 bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Tasks for {formatTaskDate(selectedDate)}
        </h3>
        <div className="space-y-3">
          {getDayTasks(
          selectedDate.getDate()).map((task, index) => (
            <div
              key={index}
              className="p-3 bg-white rounded-lg shadow-sm border border-gray-100 
                hover:border-blue-500 transition-colors duration-200
                hover:shadow-md transform hover:-translate-y-0.5"
            >
              <div className="font-medium text-gray-800">{task.title}</div>
              <div className="text-sm text-gray-500 mt-1">{task.type}</div>
            </div>
          ))}
          {getDayTasks(selectedDate.getDate()).length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No tasks scheduled for this day.
            </p>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Calendar;
