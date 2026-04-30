import React, { useState } from "react";
import {
  TrendingUp, Star, Target, MessageSquare, Plus,
  ChevronDown, BarChart2, Award, CheckCircle, AlertTriangle, Minus
} from "lucide-react";
import { performanceGoals } from "../dummyData";
import { PerformanceGoal } from "../types";

const starCount = 5;

const statusConfig = {
  "On Track": { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  "At Risk": { bg: "bg-red-100", text: "text-red-700", icon: AlertTriangle },
  Completed: { bg: "bg-blue-100", text: "text-blue-700", icon: Award },
  "Not Started": { bg: "bg-gray-100", text: "text-gray-600", icon: Minus },
};

const RatingStars: React.FC<{ rating: number; max?: number; editable?: boolean; onChange?: (r: number) => void }> = ({
  rating, max = 5, editable = false, onChange
}) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-100"} ${editable ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
        onClick={() => editable && onChange && onChange(i + 1)}
      />
    ))}
    <span className="ml-1.5 text-xs text-gray-500">({rating}/{max})</span>
  </div>
);

const PerformanceManagement: React.FC = () => {
  const [goals, setGoals] = useState<PerformanceGoal[]>(performanceGoals);
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedbackGoalId, setFeedbackGoalId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const employees = Array.from(new Set(goals.map(g => g.employeeName)));
  const filteredGoals = selectedEmployee === "All" ? goals : goals.filter(g => g.employeeName === selectedEmployee);

  const avgRating = (empName: string) => {
    const empGoals = goals.filter(g => g.employeeName === empName && g.managerRating > 0);
    if (empGoals.length === 0) return 0;
    return +(empGoals.reduce((a, g) => a + g.managerRating, 0) / empGoals.length).toFixed(1);
  };

  const saveFeedback = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, managerFeedback: feedbackText } : g));
    setFeedbackGoalId(null);
  };

  const updateManagerRating = (id: string, rating: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, managerRating: rating } : g));
  };

  const completionRate = Math.round((goals.filter(g => g.status === "Completed").length / goals.length) * 100);
  const onTrackRate = Math.round((goals.filter(g => g.status === "On Track").length / goals.length) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Management</h1>
          <p className="text-sm text-gray-500">Goal tracking, KPIs, and performance reviews</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Goals", value: goals.length, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Completed", value: goals.filter(g => g.status === "Completed").length, color: "text-green-700", bg: "bg-green-50" },
          { label: "On Track", value: goals.filter(g => g.status === "On Track").length, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "At Risk", value: goals.filter(g => g.status === "At Risk").length, color: "text-red-600", bg: "bg-red-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5`}>
            <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-blue-600" /> Team Performance Overview
          </h2>
          <div className="space-y-4">
            {employees.map(emp => {
              const rating = avgRating(emp);
              const pct = (rating / 5) * 100;
              return (
                <div key={emp}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{emp}</span>
                    <RatingStars rating={Math.round(rating)} />
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : "bg-orange-500"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-blue-600" /> Goal Completion Status
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-bold text-blue-700">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600">On Track</span>
                <span className="font-bold text-green-700">{onTrackRate}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${onTrackRate}%` }} />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {(goals.reduce((a, g) => a + g.managerRating, 0) / goals.length).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Avg Manager Rating</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(goals.reduce((a, g) => a + g.selfRating, 0) / goals.length).toFixed(1)}
                </p>
                <p className="text-xs text-gray-500">Avg Self Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        {["All", ...employees].map(emp => (
          <button
            key={emp}
            onClick={() => setSelectedEmployee(emp)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedEmployee === emp ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {emp}
          </button>
        ))}
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map((goal) => {
          const cfg = statusConfig[goal.status];
          const Icon = cfg.icon;
          return (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-800">{goal.goal}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                      <Icon className="w-3 h-3" /> {goal.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{goal.employeeName} · KPI: {goal.kpi} · Due {goal.targetDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">Weightage</p>
                  <p className="font-bold text-blue-700 text-lg">{goal.weightage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1.5">Self Rating</p>
                  <RatingStars rating={goal.selfRating} />
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1.5">Manager Rating</p>
                  <RatingStars rating={goal.managerRating} editable onChange={(r) => updateManagerRating(goal.id, r)} />
                </div>
              </div>

              {/* KPI Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">{goal.status === "Completed" ? "100" : goal.status === "On Track" ? "65" : goal.status === "At Risk" ? "30" : "0"}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${goal.status === "Completed" ? "bg-blue-500" : goal.status === "On Track" ? "bg-green-500" : goal.status === "At Risk" ? "bg-red-500" : "bg-gray-300"}`}
                    style={{ width: `${goal.status === "Completed" ? 100 : goal.status === "On Track" ? 65 : goal.status === "At Risk" ? 30 : 0}%` }}
                  />
                </div>
              </div>

              {/* Manager Feedback */}
              {feedbackGoalId === goal.id ? (
                <div className="space-y-2 mt-3">
                  <textarea
                    value={feedbackText}
                    onChange={e => setFeedbackText(e.target.value)}
                    placeholder="Write manager feedback..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => saveFeedback(goal.id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save Feedback</button>
                    <button onClick={() => setFeedbackGoalId(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  {goal.managerFeedback ? (
                    <div className="flex items-start gap-2 text-sm text-gray-600 bg-yellow-50 rounded-lg px-3 py-2 flex-1">
                      <MessageSquare className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{goal.managerFeedback}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No manager feedback yet.</p>
                  )}
                  <button
                    onClick={() => { setFeedbackGoalId(goal.id); setFeedbackText(goal.managerFeedback || ""); }}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {goal.managerFeedback ? "Edit" : "Add Feedback"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">Add Performance Goal</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">Goal creation form — employee, goal, KPI, and target date fields</p>
              <div className="bg-blue-50 rounded-lg p-4 text-center text-blue-700 font-medium text-sm">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                Goal form ready for implementation
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm">Cancel</button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Save Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceManagement;
