import React, { useState, useEffect } from "react";
import {
  ItemLocation,
  ItemReference,
  WarehouseReference,
} from "../../../../types/itemLocation";
import api from "../../../../services/api";
import LocationForm from "../components/LocationForm";
import CommonTable from "../../../../components/CommonTable";
import Modal from "../../../../components/common/Modal";
import ConfirmBox from "../../../../components/common/ConfirmBox";
import { FaEdit, FaTrash } from "react-icons/fa";

export const LocationManagement = () => {
  const [itemLocations, setItemLocations] = useState<ItemLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<ItemLocation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Data for dropdowns
  const [warehouses, setWarehouses] = useState<WarehouseReference[]>([]);
  const [items, setItems] = useState<ItemReference[]>([]);

  useEffect(() => {
    fetchLocations();
    fetchWarehouses();
    fetchItems();
  }, [currentPage, pageSize, searchTerm]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`ItemLocation`);
      setItemLocations(response.data || []);
      setTotalCount(response.data.totalCount || 0);
    } catch (error) {
      console.error("Error fetching item locations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await api.get("Warehouse");
      setWarehouses(
        response.data.map((w: any) => ({
          id: w.id,
          name: w.warehouseName,
        }))
      );
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await api.get("ItemMaster");
      setItems(
        response.data.map((item: any) => ({
          id: item.id,
          name: item.itemName,
          code: item.itemCode,
        }))
      );
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleAddNew = () => {
    setSelectedLocation(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (location: ItemLocation) => {
    setSelectedLocation(location);
    setIsFormModalOpen(true);
  };

  const handleDelete = (location: ItemLocation) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async (id: string | number) => {
    try {
      setIsLoading(true);
      await api.delete(`ItemLocation/${id}`);

      // Refresh the list after successful delete
      await fetchLocations();
      setIsDeleteModalOpen(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error deleting item location:", error);
      alert("Failed to delete item location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (location: ItemLocation) => {
    await fetchLocations(); // Refresh the list
    setIsFormModalOpen(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Function to get the warehouse name from its ID
  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find((w) => w.id === warehouseId);
    return warehouse ? warehouse.name : "Unknown";
  };

  // Function to get the item name from its ID
  const getItemName = (itemId: number) => {
    const item = items.find((i) => i.id === itemId);
    return item
      ? item.code
        ? `${item.code} - ${item.name}`
        : item.name
      : "Unknown";
  };

  const columns = [
    {
      key: "itemId",
      title: "Item",
      dataIndex: "itemId",
      render: (record: any) => getItemName(record.itemId),
    },
    {
      key: "warehouseId",
      title: "Warehouse",
      dataIndex: "warehouseId",
      render: (record: any) => getWarehouseName(record.warehouseId),
    },
    { key: "rack", title: "Rack", dataIndex: "rack" },
    { key: "shelf", title: "Shelf", dataIndex: "shelf" },
    { key: "columnNo", title: "Column", dataIndex: "columnNo" },
    { key: "inPlace", title: "In Place", dataIndex: "inPlace" },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Item Locations</h1>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add New Location
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search locations..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {isLoading && itemLocations.length === 0 ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <CommonTable
          data={itemLocations}
          columns={columns}
          currentPage={currentPage}
          total={totalCount}
          loading={isLoading}
          pagination={true}
          onPageChange={handlePageChange}
          actions={[
            {
              label: <FaEdit size={16} />,
              onClick: (record) => handleEdit(record),
              type: "edit",
            },
            {
              label: <FaTrash size={16} />,
              onClick: (record) => handleDelete(record),
              type: "delete",
            },
          ]}
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={
          selectedLocation ? "Edit Item Location" : "Add New Item Location"
        }
      >
        <LocationForm
          itemLocation={selectedLocation}
          onSave={handleSave}
          onCancel={() => setIsFormModalOpen(false)}
          warehouses={warehouses}
          items={items}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmBox
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={confirmDelete}
        title="Item Location"
        id={selectedLocation?.id || 0}
      />
    </div>
  );
};
