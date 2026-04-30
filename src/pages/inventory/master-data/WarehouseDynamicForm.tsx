import React from "react";
import DynamicJsonForm from "../../../components/common/DynamicJsonForm";
import { warehouseTypeOptions } from "../../../types/warehouse";

const WarehouseDynamicForm: React.FC = () => {
  // Schema definition for the warehouse form and table
  const warehouseSchema = [
    {
      key: "warehouseName",
      label: "Warehouse Name",
      type: "text",
      required: true,
      sortable: true,
      searchable: true,
    },
    {
      key: "warehouseType",
      label: "Warehouse Type",
      type: "select",
      required: true,
      options: warehouseTypeOptions,
      sortable: true,
      searchable: true,
    },
    {
      key: "address",
      label: "Address",
      type: "text",
      required: true,
      searchable: true,
    },
    {
      key: "city",
      label: "City",
      type: "text",
      required: true,
      sortable: true,
      searchable: true,
    },
    {
      key: "state",
      label: "State",
      type: "text",
      required: true,
      sortable: true,
    },
    {
      key: "country",
      label: "Country",
      type: "text",
      required: true,
      sortable: true,
    },
    {
      key: "pincode",
      label: "Pincode",
      type: "text",
      required: true,
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      type: "text",
      required: true,
      searchable: true,
    },
    {
      key: "phone",
      label: "Phone",
      type: "text",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      required: true,
      searchable: true,
    },
    {
      key: "isActive",
      label: "Active",
      type: "boolean",
      required: true,
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      required: false,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Warehouse Management</h1>
      <DynamicJsonForm
        schema={warehouseSchema}
        endpoint="Warehouse"
        title="Warehouse"
        pageSize={10}
      />
    </div>
  );
};

export default WarehouseDynamicForm;
