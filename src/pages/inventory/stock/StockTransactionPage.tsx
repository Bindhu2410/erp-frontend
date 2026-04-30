import React, { useState, useEffect } from "react";
import DynamicJsonForm from "../../../components/common/DynamicJsonForm";
import api from "../../../services/api";

const StockTransactionPage: React.FC = () => {
  const [transactionTypes, setTransactionTypes] = useState<
    { label: string; value: string }[]
  >([
    { label: "GRN", value: "GRN" },
    { label: "ISSUE", value: "ISSUE" },
    { label: "TRANSFER", value: "TRANSFER" },
    { label: "ADJUSTMENT", value: "ADJUSTMENT" },
  ]);
  const [items, setItems] = useState<{ label: string; value: number }[]>([]);
  const [warehouses, setWarehouses] = useState<
    { label: string; value: number }[]
  >([]);
  const [locations, setLocations] = useState<
    { label: string; value: number }[]
  >([]);
  const [users, setUsers] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        setLoading(true);
        const [itemsRes, warehousesRes, locationsRes] = await Promise.all([
          api.get("ItemMaster"),
          api.get("Warehouse"),
          api.get("ItemLocation"), // Changed from ItemLocation to Location
        ]);

        console.log(
          "Locations Response:",
          itemsRes,
          warehousesRes,
          locationsRes
        );

        // Format items for dropdown
        setItems(
          itemsRes.data.map((item: any) => ({
            label: ` ${item.itemName}`,
            value: item.id,
          }))
        );

        // Format warehouses for dropdown
        setWarehouses(
          warehousesRes.data.map((warehouse: any) => ({
            label: warehouse.warehouseName,
            value: warehouse.id,
          }))
        );

        // Format locations for dropdown
        setLocations(
          locationsRes.data.map((location: any) => ({
            label:
              location.locationName ||
              `${location.rack}-${location.shelf}-${location.columnNo}`,
            value: location.id,
          }))
        );

        // Set default users since the Users endpoint is not available
        setUsers([
          { label: "Current User", value: 1 },
          { label: "System Admin", value: 2 },
        ]);
      } catch (error) {
        console.error("Error fetching reference data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  const stockTransactionSchema = [
    {
      key: "transactionDate",
      label: "Transaction Date",
      type: "date",
      required: true,
      sortable: true,
      searchable: true,
      initialValue: new Date().toISOString(),
    },
    {
      key: "transactionType",
      label: "Transaction Type",
      type: "select",
      required: true,
      sortable: true,
      searchable: true,
      options: transactionTypes,
      //   description: "Type of transaction (GRN, ISSUE, TRANSFER, ADJUSTMENT)",
    },
    {
      key: "referenceNo",
      label: "Reference Number",
      type: "text",
      required: false,
      sortable: true,
      searchable: true,
      description: "GRN No, Invoice No, Transfer Note, etc.",
    },
    {
      key: "itemId",
      label: "Item",
      type: "select",
      required: true,
      sortable: true,
      searchable: true,
      options: items,
    },
    {
      key: "warehouseId",
      label: "Warehouse",
      type: "select",
      required: true,
      sortable: true,
      searchable: true,
      options: warehouses,
    },
    {
      key: "locationId",
      label: "Location",
      type: "select",
      required: false,
      sortable: true,
      searchable: true,
      options: locations,
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      required: true,
      sortable: true,
      searchable: true,
      description: "Positive for incoming stock, negative for outgoing stock",
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      type: "number",
      required: false,
      sortable: true,
      searchable: true,
    },
    {
      key: "totalValue",
      label: "Total Value",
      type: "number",
      required: false,
      sortable: true,
      searchable: true,
    },
    {
      key: "remarks",
      label: "Remarks",
      type: "textarea",
      required: false,
      sortable: false,
      searchable: true,
      fullWidth: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 m-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <DynamicJsonForm
          schema={stockTransactionSchema}
          endpoint="ItemStockTransaction"
          title="Stock Transaction"
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default StockTransactionPage;
