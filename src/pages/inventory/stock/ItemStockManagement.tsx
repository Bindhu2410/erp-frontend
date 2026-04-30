import React, { useState, useEffect } from "react";
import DynamicJsonForm from "../../../components/common/DynamicJsonForm";
import api from "../../../services/api";

interface ItemOption {
  label: string;
  value: number;
}

interface WarehouseOption {
  label: string;
  value: number;
}

interface LocationOption {
  label: string;
  value: number;
}

const ItemStockManagement: React.FC = () => {
  const [items, setItems] = useState<ItemOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch items, warehouses, and locations for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch items for dropdown
        const itemsResponse = await api.get("ItemMaster");
        const itemOptions = itemsResponse.data.map((item: any) => ({
          label: `${item.itemCode} - ${item.itemName}`,
          value: item.id,
        }));
        setItems(itemOptions);

        // Fetch warehouses for dropdown
        const warehousesResponse = await api.get("Warehouse");
        const warehouseOptions = warehousesResponse.data.map(
          (warehouse: any) => ({
            label: warehouse.warehouseName,
            value: warehouse.id,
          })
        );
        setWarehouses(warehouseOptions);

        // Fetch locations for dropdown
        const locationsResponse = await api.get("ItemLocation");
        const locationOptions = locationsResponse.data.map((location: any) => ({
          label:
            location.locationName ||
            `${location.rack}-${location.shelf}-${location.columnNo}`,
          value: location.id,
        }));
        setLocations(locationOptions);
      } catch (error) {
        console.error("Error fetching data for dropdowns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define schema for ItemStock form
  const schema = [
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
      key: "quantityOnHand",
      label: "Quantity On Hand",
      type: "number",
      required: true,
      sortable: true,
    },
    {
      key: "allocatedQty",
      label: "Allocated Quantity",
      type: "number",
      required: true,
      sortable: true,
    },
    {
      key: "stockValue",
      label: "Stock Value",
      type: "number",
      required: true,
      sortable: true,
    },
    {
      key: "reorderQty",
      label: "Reorder Quantity",
      type: "number",
      required: true,
      sortable: true,
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      type: "date",
      required: true,
      sortable: true,
      // Setting initial value as current date in UTC format
      initialValue: new Date().toISOString(),
    },
  ];

  return (
    <div className="p-4">
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading dropdown data...</p>
        </div>
      ) : (
        <DynamicJsonForm
          schema={schema}
          endpoint="ItemStock" // Replace with your actual endpoint
          title="Item Stock"
          pageSize={10}
        />
      )}
    </div>
  );
};

export default ItemStockManagement;
