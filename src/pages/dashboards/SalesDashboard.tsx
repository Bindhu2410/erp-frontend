import React from "react";
import SalesRepDashboard from "./SalesRepDashboard";
import SalesManagerDashboard from "./SalesManagerDashboard";
import AdminDashboard from "./AdminDashboard";
import OwnerDashboard from "./OwnerDashboard";

const SalesDashboard: React.FC = () => {
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

  if (roleName === "Admin") return <AdminDashboard />;
  if (roleName === "Sales Representative") return <SalesRepDashboard />;
  if (roleName === "Sales Manager") return <SalesManagerDashboard />;
  if (roleName === "Managing Director") return <OwnerDashboard />;
  return (
    <div className="text-center text-gray-500 py-8">
      No dashboard available for your role.
    </div>
  );
};

export default SalesDashboard;
