import React from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaBuilding,
  FaComments,
  FaRegCalendarAlt,
  FaTasks,
  FaClipboardList,
  FaShieldAlt,
  FaWhatsapp,
} from "react-icons/fa";
import { FaUsersCog, FaUserTie } from "react-icons/fa";
import { BsBuildingFillGear } from "react-icons/bs";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { FaCarBurst, FaCartShopping } from "react-icons/fa6";
import { BsCalculator } from "react-icons/bs";

const Dashboard = () => {
  const navigate = useNavigate();

  // Get roleDto from localStorage
  let roleName = "";
  try {
    const roleDtoStr = localStorage.getItem("roleDto");
    if (roleDtoStr) {
      const roleDto = JSON.parse(roleDtoStr);
      roleName = roleDto.roleName;
    }
  } catch (e) {
    roleName = "";
  }

  const isAdmin = roleName === "Administrator" || roleName === "Admin" || roleName === "Manager";
  const isSalesTeamNoClaims =
    roleName === "Marketing Coordinator" ||
    roleName === "Sales Coordinator";
  const isSalesTeamWithClaims =
    roleName === "Sales Manager" ||
    roleName === "Territory Manager" ||
    roleName === "Area Manager" ||
    roleName === "Field Service Technician" ||
    roleName === "Sales Representative";
  const isSalesTeam = isSalesTeamNoClaims || isSalesTeamWithClaims;
  const isMD = roleName === "Managing Director";
  const isFinance = roleName === "Finance" || roleName === "Finance Department";
  const isInventoryDept = roleName === "Inventory Department";

  // Reusable Dashboard Card Component
  const DashboardCard = ({
    icon: Icon,
    title,
    description,
    bgColor,
    iconColor,
    buttonColor,
    onClick,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    bgColor: string;
    iconColor: string;
    buttonColor: string;
    onClick: () => void;
  }) => (
    <div
      className={`${bgColor} rounded-2xl shadow-lg p-8 flex flex-col items-center min-w-[280px] max-w-[320px] transition hover:shadow-xl hover:-translate-y-1`}
    >
      <div className="mb-4">
        <Icon size={64} className={iconColor} />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center">{title}</h3>
      <p className="text-gray-600 text-center mb-6 text-sm">{description}</p>
      <button
        onClick={onClick}
        className={`${buttonColor} text-white font-semibold px-8 py-2.5 rounded-lg transition hover:opacity-90 hover:scale-105`}
      >
        View
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-gray-800">
            Welcome to JBS Mediitec India Pvt. Ltd.
          </h2>
          <p className="text-lg text-gray-600">
            Access tools to manage operations, monitor sales, and drive
            innovation in healthcare solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center max-w-7xl mx-auto">
          {/* Task Management - accessible to all */}
          <DashboardCard
            icon={FaClipboardList}
            title="Task Management"
            description="Organize and track tasks"
            bgColor="bg-cyan-50"
            iconColor="text-cyan-500"
            buttonColor="bg-cyan-500"
            onClick={() => navigate("/task-management")}
          />

          {/* Sales - Admin/SalesTeam/MD */}
          {(isAdmin || isSalesTeam || isMD) && (
            <DashboardCard
              icon={FaChartLine}
              title="Sales"
              description="Track sales and revenue"
              bgColor="bg-green-50"
              iconColor="text-green-500"
              buttonColor="bg-green-500"
              onClick={() => navigate("/sales/leads")}
            />
          )}

          {/* Claims Card - not for isSalesTeamNoClaims, Inventory Department, or Finance */}
          {!isSalesTeamNoClaims && !isInventoryDept && !isFinance && (
            <DashboardCard
              icon={FaCarBurst}
              title="Claims"
              description="Manage insurance claims"
              bgColor="bg-orange-50"
              iconColor="text-orange-500"
              buttonColor="bg-orange-500"
              onClick={() => navigate("/claims")}
            />
          )}

          {/* Chat - accessible to all */}
          <DashboardCard
            icon={FaComments}
            title="Chat"
            description="Communicate with team"
            bgColor="bg-pink-50"
            iconColor="text-pink-500"
            buttonColor="bg-pink-500"
            onClick={() => navigate("/chat")}
          />

          {/* WhatsApp - accessible to all */}
          <DashboardCard
            icon={FaWhatsapp}
            title="WhatsApp"
            description="Manage WhatsApp messages"
            bgColor="bg-emerald-50"
            iconColor="text-emerald-500"
            buttonColor="bg-emerald-500"
            onClick={() => navigate("/whatsapp")}
          />

          {/* Calendar - accessible to all */}
          <DashboardCard
            icon={FaRegCalendarAlt}
            title="Calendar"
            description="View and schedule events"
            bgColor="bg-purple-50"
            iconColor="text-purple-500"
            buttonColor="bg-purple-500"
            onClick={() => navigate("/calendar")}
          />

          {/* Company Setup - Admin/MD only */}
          {(isAdmin || isMD) && (
            <DashboardCard
              icon={FaBuilding}
              title="Company Setup"
              description="Configure company settings"
              bgColor="bg-yellow-50"
              iconColor="text-yellow-500"
              buttonColor="bg-yellow-500"
              onClick={() => navigate("/erp-setup")}
            />
          )}

          {/* Accounts - Admin/MD/Finance */}
          {(isAdmin || isMD || isFinance) && (
            <DashboardCard
              icon={BsCalculator}
              title="Accounts"
              description="Manage financial accounts"
              bgColor="bg-red-50"
              iconColor="text-red-500"
              buttonColor="bg-red-500"
              onClick={() => navigate("/accounts")}
            />
          )}

          {/* Inventory - Admin/MD/Inventory Department/Finance */}
          {(isAdmin || isMD || isInventoryDept || isFinance) && (
            <DashboardCard
              icon={BsBuildingFillGear}
              title="Inventory"
              description="Monitor stock levels"
              bgColor="bg-blue-50"
              iconColor="text-blue-500"
              buttonColor="bg-blue-500"
              onClick={() => navigate("/inventory/dashboard")}
            />
          )}

          {/* Procurement - Admin/MD/Inventory Department/Finance */}
          {(isAdmin || isMD || isInventoryDept || isFinance) && (
            <DashboardCard
              icon={FaCartShopping}
              title="Procurement"
              description="Streamline purchasing"
              bgColor="bg-purple-50"
              iconColor="text-purple-500"
              buttonColor="bg-purple-500"
              onClick={() => navigate("/procurement/dashboard")}
            />
          )}

          {/* Task - Finance only */}
          {isFinance && (
            <DashboardCard
              icon={FaTasks}
              title="Task"
              description="Manage assigned tasks"
              bgColor="bg-teal-50"
              iconColor="text-teal-500"
              buttonColor="bg-teal-500"
              onClick={() => navigate("/claims/tasks")}
            />
          )}

          {/* QA Module - Admin/MD/Inventory Department */}
          {(isAdmin || isMD || isInventoryDept) && (
            <DashboardCard
              icon={FaShieldAlt}
              title="Quality Assurance"
              description="Inspect & validate GRN products"
              bgColor="bg-teal-50"
              iconColor="text-teal-600"
              buttonColor="bg-teal-600"
              onClick={() => navigate("/qa/sessions")}
            />
          )}

          {/* User Management - Admin/MD only */}
          {(isAdmin || isMD) && (
            <DashboardCard
              icon={FaUsers}
              title="User Management"
              description="Manage system users"
              bgColor="bg-blue-50"
              iconColor="text-blue-500"
              buttonColor="bg-blue-500"
              onClick={() => navigate("/user-management")}
            />
          )}

          {/* Employee Management - not for Sales team, Inventory Department, or Finance */}
          {!isSalesTeam && !isInventoryDept && !isFinance && (
            <DashboardCard
              icon={FaUsersCog}
              title="Employee Management"
              description="Manage employee records"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-500"
              buttonColor="bg-indigo-500"
              onClick={() => navigate("/employees")}
            />
          )}

          {/* HR Module - Admin/MD only */}
          {(isAdmin || isMD) && (
            <DashboardCard
              icon={FaUserTie}
              title="HR Module"
              description="Attendance, Payroll, Performance & more"
              bgColor="bg-sky-50"
              iconColor="text-sky-600"
              buttonColor="bg-sky-600"
              onClick={() => navigate("/hrms")}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
