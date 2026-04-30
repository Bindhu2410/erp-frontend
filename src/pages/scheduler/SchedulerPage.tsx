import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaList, FaPlus, FaPhone, FaUsers, FaTasks, FaCalendarCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdEdit, MdDelete } from 'react-icons/md';

interface SchedulerEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'call' | 'task' | 'event';
  description?: string;
  participants?: string[];
  status: 'scheduled' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high';
}

const SchedulerPage: React.FC = () => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedType, setSelectedType] = useState<'all' | 'meeting' | 'call' | 'task' | 'event'>('all');
  const [events, setEvents] = useState<SchedulerEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      start: new Date(2024, 11, 20, 10, 0),
      end: new Date(2024, 11, 20, 11, 0),
      type: 'meeting',
      description: 'Weekly team sync',
      participants: ['John Doe', 'Jane Smith'],
      status: 'scheduled',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Client Call',
      start: new Date(2024, 11, 21, 14, 0),
      end: new Date(2024, 11, 21, 15, 0),
      type: 'call',
      description: 'Follow up with client',
      status: 'scheduled',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Complete Report',
      start: new Date(2024, 11, 22, 9, 0),
      end: new Date(2024, 11, 22, 17, 0),
      type: 'task',
      description: 'Quarterly sales report',
      status: 'scheduled',
      priority: 'high'
    }
  ]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchedulerEvent | null>(null);

  const filteredEvents = selectedType === 'all' 
    ? events 
    : events.filter(event => event.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <FaUsers className="text-blue-500" />;
      case 'call': return <FaPhone className="text-green-500" />;
      case 'task': return <FaTasks className="text-orange-500" />;
      case 'event': return <FaCalendarCheck className="text-purple-500" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-500';
      case 'medium': return 'bg-yellow-100 border-yellow-500';
      case 'low': return 'bg-green-100 border-green-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const CalendarView = ({ events, onSelectEvent, onNewEvent }: { 
    events: SchedulerEvent[], 
    onSelectEvent: (event: SchedulerEvent) => void,
    onNewEvent: () => void 
  }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startingDayOfWeek = firstDay.getDay();
      
      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
      
      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };

    const getEventsForDay = (date: Date | null) => {
      if (!date) return [];
      return events.filter(event => {
        const eventDate = new Date(event.start);
        return eventDate.toDateString() === date.toDateString();
      });
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      setCurrentDate(newDate);
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="p-4">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FaChevronLeft />
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <FaChevronRight />
            </button>
          </div>
          <button
            onClick={() => {
              const today = new Date();
              setCurrentDate(today);
              setSelectedDate(today);
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center font-medium text-gray-600 bg-gray-50">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayEvents = getEventsForDay(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isSelected = date && date.toDateString() === selectedDate.toDateString();
            const isPastDate = date && date < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border border-gray-200 ${
                  date && !isPastDate ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-100'
                } ${
                  isPastDate ? 'text-gray-400 cursor-not-allowed' : ''
                } ${
                  isToday ? 'bg-blue-50 border-blue-500 border-2' : ''
                } ${
                  isSelected && !isToday && !isPastDate ? 'bg-gray-100 border-gray-400 border-2' : ''
                }`}
                onClick={() => {
                  if (date && !isPastDate) {
                    setSelectedDate(date);
                    onNewEvent();
                  }
                }}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600 font-bold' : 
                      isPastDate ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectEvent(event);
                          }}
                          className={`text-xs p-1 rounded cursor-pointer truncate ${
                            event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                            event.type === 'call' ? 'bg-green-100 text-green-800' :
                            event.type === 'task' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSelectEvent = (event: SchedulerEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const EventModal = () => {
    const formatDateForInput = (date: Date) => {
      const d = new Date(date);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      return d.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState({
      title: selectedEvent?.title || '',
      type: selectedEvent?.type || 'meeting',
      start: selectedEvent?.start ? formatDateForInput(selectedEvent.start) : '',
      end: selectedEvent?.end ? formatDateForInput(selectedEvent.end) : '',
      description: selectedEvent?.description || '',
      priority: selectedEvent?.priority || 'medium',
      status: selectedEvent?.status || 'scheduled'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newEvent: SchedulerEvent = {
        id: selectedEvent?.id || Date.now().toString(),
        title: formData.title,
        type: formData.type as any,
        start: new Date(formData.start),
        end: new Date(formData.end),
        description: formData.description,
        priority: formData.priority as any,
        status: formData.status as any,
        participants: []
      };

      if (selectedEvent) {
        setEvents(events.map(e => e.id === selectedEvent.id ? newEvent : e));
      } else {
        setEvents([...events, newEvent]);
      }
      setShowModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">
            {selectedEvent ? 'Edit' : 'New'} {formData.type}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'meeting' | 'call' | 'task' | 'event'})}
                className="w-full p-2 border rounded"
              >
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="task">Task</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({...formData, start: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End</label>
                <input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({...formData, end: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as 'low' | 'medium' | 'high'})}
                className="w-full p-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as 'scheduled' | 'completed' | 'cancelled'})}
                className="w-full p-2 border rounded"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {selectedEvent ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Scheduler</h1>
          <button
            onClick={handleNewEvent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaPlus /> New Event
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded">
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  view === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
              >
                <FaCalendarAlt /> Calendar
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded ${
                  view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'
                }`}
              >
                <FaList /> List
              </button>
            </div>

            {/* Type Filter */}
            <div className="flex gap-2">
              {['all', 'meeting', 'call', 'task', 'event'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type as any)}
                  className={`flex items-center gap-2 px-3 py-1 rounded ${
                    selectedType === type
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {type !== 'all' && getTypeIcon(type)}
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {view === 'calendar' ? (
            <CalendarView 
              events={filteredEvents} 
              onSelectEvent={handleSelectEvent}
              onNewEvent={handleNewEvent}
            />
          ) : (
            <div className="p-4">
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`border-l-4 p-4 rounded ${getPriorityColor(event.priority)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeIcon(event.type)}
                          <h3 className="font-semibold">{event.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded ${
                            event.status === 'completed' ? 'bg-green-100 text-green-800' :
                            event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {event.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(event.start).toLocaleDateString('en-US', { 
                            month: 'short', day: '2-digit', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })} - 
                          {new Date(event.end).toLocaleTimeString('en-US', { 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-500">{event.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSelectEvent(event)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => setEvents(events.filter(e => e.id !== event.id))}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && <EventModal />}
      </div>
    </div>
  );
};

export default SchedulerPage;