import React from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import {
  FaShieldAlt,
  FaClipboardCheck,
  FaPlus,
  FaCogs,
  FaHourglassHalf,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaBell,
  FaArchive,
} from "react-icons/fa";

interface QaSidebarProps {
  isOpen: boolean;
}

interface WorkflowLinkProps {
  to: string;
  search?: string;
  icon: React.ReactNode;
  label: string;
  dot?: string;
  isOpen: boolean;
  title: string;
}

const WorkflowLink: React.FC<WorkflowLinkProps> = ({
  to,
  search,
  icon,
  label,
  dot,
  isOpen,
  title,
}) => {
  const [searchParams] = useSearchParams();
  const currentStatus = searchParams.get("status") || "";
  const currentPath = window.location.pathname;
  const targetStatus = search
    ? new URLSearchParams(search).get("status") || ""
    : "";

  const isActive =
    currentPath === to &&
    currentStatus.toLowerCase() === targetStatus.toLowerCase();

  const href = search ? `${to}?${search}` : to;

  return (
    <NavLink
      to={href}
      end
      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-4 transition-colors ${
        isActive
          ? "bg-teal-50 text-teal-700 border-teal-600"
          : "text-gray-600 hover:bg-teal-50 hover:text-teal-600 border-transparent"
      }`}
      title={title}
    >
      <span className="flex-shrink-0 relative">
        {icon}
        {dot && (
          <span
            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${dot}`}
          />
        )}
      </span>
      {isOpen && <span>{label}</span>}
    </NavLink>
  );
};

const QaSidebar: React.FC<QaSidebarProps> = ({ isOpen }) => {
  const activeLinkClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium bg-teal-50 text-teal-700 border-l-4 border-teal-600";
  const inactiveLinkClass =
    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-teal-50 hover:text-teal-600 border-l-4 border-transparent transition-colors";

  const sectionLabel = (text: string) =>
    isOpen ? (
      <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {text}
      </p>
    ) : (
      <div className="mx-4 my-2 border-t border-gray-100" />
    );

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg overflow-y-auto transition-all duration-300 z-40 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Module label */}
      {isOpen && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 p-1.5 rounded-lg">
              <FaShieldAlt className="text-white" size={12} />
            </div>
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-widest">
              QA Module
            </span>
          </div>
        </div>
      )}

      <nav className="py-2">
        {/* ── Start ── */}
        {sectionLabel("Start")}

        <NavLink
          to="/qa/sessions/new"
          className={({ isActive }) =>
            isActive ? activeLinkClass : inactiveLinkClass
          }
          title="New QA Session"
        >
          <FaPlus size={isOpen ? 14 : 16} className="flex-shrink-0" />
          {isOpen && <span>New QA Session</span>}
        </NavLink>

        {/* ── QA Workflow ── */}
        {sectionLabel("Workflow")}

        {/* Step 1 — Awaiting Inspection */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=Pending"
          icon={<FaHourglassHalf size={isOpen ? 14 : 16} className="text-yellow-500" />}
          label="Awaiting Inspection"
          dot="bg-yellow-400"
          isOpen={isOpen}
          title="Awaiting Inspection"
        />

        {/* Step 2 — In Inspection */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=In-Progress"
          icon={<FaSpinner size={isOpen ? 14 : 16} className="text-blue-500" />}
          label="In Inspection"
          dot="bg-blue-400"
          isOpen={isOpen}
          title="In Inspection"
        />

        {/* Step 3 — All sessions overview */}
        <NavLink
          to="/qa/sessions"
          end
          className={({ isActive }) => {
            const noFilter = !window.location.search.includes("status=");
            return isActive && noFilter ? activeLinkClass : inactiveLinkClass;
          }}
          title="All Sessions"
        >
          <FaClipboardCheck size={isOpen ? 15 : 17} className="flex-shrink-0" />
          {isOpen && <span>All Sessions</span>}
        </NavLink>

        {/* ── Results ── */}
        {sectionLabel("Results")}

        {/* Approved */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=Completed&result=Approved"
          icon={<FaCheckCircle size={isOpen ? 14 : 16} className="text-green-500" />}
          label="Approved"
          isOpen={isOpen}
          title="Approved Sessions"
        />

        {/* Issues — Partial */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=Completed&result=Partial"
          icon={<FaBell size={isOpen ? 14 : 16} className="text-orange-500" />}
          label="Vendor to Notify"
          dot="bg-orange-400"
          isOpen={isOpen}
          title="Vendor Notification Pending"
        />

        {/* Failed */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=Completed&result=Failed"
          icon={<FaTimesCircle size={isOpen ? 14 : 16} className="text-red-500" />}
          label="Full Hold"
          isOpen={isOpen}
          title="Full Hold Sessions"
        />

        {/* Archived */}
        <WorkflowLink
          to="/qa/sessions"
          search="status=Completed"
          icon={<FaArchive size={isOpen ? 14 : 16} className="text-gray-400" />}
          label="All Completed"
          isOpen={isOpen}
          title="All Completed Sessions"
        />

        {/* ── Setup ── */}
        {sectionLabel("Setup")}

        <NavLink
          to="/qa/templates"
          className={({ isActive }) =>
            isActive ? activeLinkClass : inactiveLinkClass
          }
          title="QA Templates"
        >
          <FaCogs size={isOpen ? 16 : 18} className="flex-shrink-0" />
          {isOpen && <span>QA Checklist Templates</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default QaSidebar;
