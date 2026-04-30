import React, { useState } from "react";
import {
  Clock, Check, X, MessageSquare, ChevronDown, Plus
} from "lucide-react";
import { timesheetEntries as initialEntries } from "../dummyData";
import { TimesheetEntry } from "../types";

const DAYS: (keyof TimesheetEntry["hours"])[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

const statusConfig = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
  Approved: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  Rejected: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const TimesheetManagement: React.FC = () => {
  const [entries, setEntries] = useState<TimesheetEntry[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<"list" | "entry">("list");
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [approvalComment, setApprovalComment] = useState("");

  const [newEntry, setNewEntry] = useState<Partial<TimesheetEntry>>({
    project: "", task: "",
    hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 }
  });

  const filtered = filterStatus === "All" ? entries : entries.filter(e => e.status === filterStatus);

  const handleApprove = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: "Approved", managerComment: approvalComment || "Approved." } : e));
    setSelectedEntry(null);
  };
  const handleReject = (id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: "Rejected", managerComment: approvalComment || "Needs revision." } : e));
    setSelectedEntry(null);
  };

  const totalNewHours = newEntry.hours ? Object.values(newEntry.hours).reduce((a, b) => a + b, 0) : 0;

  const submitNewEntry = () => {
    if (!newEntry.project || !newEntry.task) return;
    const entry: TimesheetEntry = {
      id: `TS${String(entries.length + 1).padStart(3, "0")}`,
      employeeId: "EMP001",
      employeeName: "Arjun Sharma",
      weekStart: "2026-04-01",
      project: newEntry.project!,
      task: newEntry.task!,
      hours: newEntry.hours!,
      status: "Pending",
      totalHours: totalNewHours,
    };
    setEntries(prev => [entry, ...prev]);
    setActiveTab("list");
    setNewEntry({ project: "", task: "", hours: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 } });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Timesheets</h1>
          <p className="text-sm text-gray-500">Weekly time tracking and approval management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button onClick={() => setActiveTab("list")} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "list" ? "bg-white shadow text-blue-700" : "text-gray-600"}`}>
              All Timesheets
            </button>
            <button onClick={() => setActiveTab("entry")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "entry" ? "bg-white shadow text-blue-700" : "text-gray-600"}`}>
              <Plus className="w-3.5 h-3.5" /> New Entry
            </button>
          </div>
        </div>
      </div>

      {activeTab === "entry" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-800 mb-5">Weekly Timesheet Entry</h2>
          <p className="text-sm text-gray-500 mb-6">Week of April 1 – April 7, 2026</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <input
                value={newEntry.project}
                onChange={e => setNewEntry(p => ({ ...p, project: e.target.value }))}
                placeholder="Project name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
              <input
                value={newEntry.task}
                onChange={e => setNewEntry(p => ({ ...p, task: e.target.value }))}
                placeholder="Task description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Hour Entry Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 rounded-lg">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Task</th>
                  {DAYS.map(d => (
                    <th key={d} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{DAY_LABELS[d]}</th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-semibold text-blue-700 uppercase">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-medium text-gray-700">{newEntry.task || "Task Name"}</td>
                  {DAYS.map(d => (
                    <td key={d} className="px-3 py-2 text-center">
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={(newEntry.hours as any)[d]}
                        onChange={e => setNewEntry(p => ({ ...p, hours: { ...p.hours!, [d]: Number(e.target.value) } as any }))}
                        className="w-14 text-center border border-gray-200 rounded-lg py-1.5 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-blue-700">{totalNewHours}h</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-xs font-semibold text-gray-500">DAY TOTAL</td>
                  {DAYS.map(d => (
                    <td key={d} className="px-3 py-2 text-center text-xs font-semibold text-gray-700">
                      {(newEntry.hours as any)[d]}h
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center text-xs font-bold text-blue-700">{totalNewHours}h</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setActiveTab("list")} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={submitNewEntry} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Submit Timesheet
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex items-center gap-3">
            {["All", "Pending", "Approved", "Rejected"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Timesheet Cards */}
          <div className="space-y-4">
            {filtered.map((entry) => {
              const cfg = statusConfig[entry.status];
              return (
                <div key={entry.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-gray-800">{entry.employeeName}</h3>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {entry.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{entry.project} · <span className="italic">{entry.task}</span></p>
                        <p className="text-xs text-gray-400 mt-1">Week of {entry.weekStart}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-700">{entry.totalHours}h</p>
                        <p className="text-xs text-gray-400">Total Hours</p>
                      </div>
                    </div>

                    {/* Hours Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {DAYS.map(d => (
                        <div key={d} className="text-center">
                          <p className="text-xs text-gray-400 mb-1">{DAY_LABELS[d]}</p>
                          <div className={`rounded-lg py-2 text-sm font-bold ${entry.hours[d] > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-300"}`}>
                            {entry.hours[d]}h
                          </div>
                        </div>
                      ))}
                    </div>

                    {entry.managerComment && (
                      <div className="mt-3 flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>{entry.managerComment}</span>
                      </div>
                    )}
                  </div>

                  {/* Approval Actions */}
                  {entry.status === "Pending" && (
                    <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
                      {selectedEntry?.id === entry.id ? (
                        <div className="flex flex-col gap-3">
                          <input
                            value={approvalComment}
                            onChange={e => setApprovalComment(e.target.value)}
                            placeholder="Add a comment (optional)..."
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleApprove(entry.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                              <Check className="w-4 h-4" /> Approve
                            </button>
                            <button onClick={() => handleReject(entry.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                              <X className="w-4 h-4" /> Reject
                            </button>
                            <button onClick={() => setSelectedEntry(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setSelectedEntry(entry); setApprovalComment(""); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                          <ChevronDown className="w-4 h-4" /> Review & Approve
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TimesheetManagement;
