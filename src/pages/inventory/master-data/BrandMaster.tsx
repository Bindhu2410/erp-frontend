import React, { useEffect, useState } from "react";
import ReusableTable, {
  TableColumn,
  TableAction,
} from "../../../components/common/ReusableTable";
import CommonFilterSection, {
  FilterConfig,
  FilterValues,
} from "../../../components/common/CommonFilterSection";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

interface BrandItem {
  id: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  name: string;
  isActive: boolean;
}

const AddEditBrandModal: React.FC<{
  isOpen: boolean;
  initial?: Partial<BrandItem> | null;
  onClose: () => void;
  onSave: (saved: BrandItem) => void;
}> = ({ isOpen, initial, onClose, onSave }) => {
  const [name, setName] = useState(initial?.name || "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);

  useEffect(() => {
    setName(initial?.name || "");
    setIsActive(initial?.isActive ?? true);
  }, [initial]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim() === "") {
      toast.error("Name is required");
      return;
    }

    try {
      const payload = { name: name.trim(), isActive };
      if (initial && initial.id) {
        const res = await api.put(`Brand/${initial.id}`, payload);
        onSave(res.data);
      } else {
        const res = await api.post("Brand", payload);
        onSave(res.data);
      }
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-3">
          {initial?.id ? "Edit Brand" : "Add Brand"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 block w-full border p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="brand-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="brand-active" className="text-sm">
              Active
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BrandMaster: React.FC = () => {
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: "",
    status: "",
  });
  const [allItems, setAllItems] = useState<BrandItem[]>([]);
  const [displayItems, setDisplayItems] = useState<BrandItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Partial<BrandItem> | null>(
    null
  );

  const fetchData = async () => {
    try {
      const res = await api.get("Brand");
      const data = Array.isArray(res.data) ? res.data : [];
      setAllItems(data);
      setDisplayItems(data.slice(0, ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to fetch Brand list:", err);
      toast.error("Failed to load data");
      setAllItems([]);
      setDisplayItems([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let result = [...allItems];
    const search = (filters.searchTerm || "").trim().toLowerCase();
    if (search)
      result = result.filter((r) => r.name.toLowerCase().includes(search));
    if (filters.status && filters.status !== "") {
      if (filters.status === "active")
        result = result.filter((r) => r.isActive);
      else if (filters.status === "inactive")
        result = result.filter((r) => !r.isActive);
    }
    setDisplayItems(result.slice(0, ITEMS_PER_PAGE));
    setCurrentPage(1);
  };

  const handleReset = () => {
    setFilters({ searchTerm: "", status: "" });
    setDisplayItems(allItems.slice(0, ITEMS_PER_PAGE));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const start = (page - 1) * ITEMS_PER_PAGE;
    setDisplayItems(allItems.slice(start, start + ITEMS_PER_PAGE));
  };

  const handleAddClick = () => {
    setModalInitial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (rec: BrandItem) => {
    setModalInitial(rec);
    setIsModalOpen(true);
  };

  const handleDelete = async (rec: BrandItem) => {
    if (!window.confirm(`Delete Brand "${rec.name}"?`)) return;
    try {
      await api.delete(`Brand/${rec.id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const onSaveFromModal = (saved: BrandItem) => {
    fetchData();
  };

  const columns: TableColumn<BrandItem>[] = [
    { key: "id", title: "ID", dataIndex: "id" },
    { key: "name", title: "Name", dataIndex: "name" },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      render: (v: any) => (v ? "Yes" : "No"),
    },
    {
      key: "dateCreated",
      title: "Created",
      dataIndex: "dateCreated",
      render: (v: any) => (v ? new Date(v).toLocaleString() : "-"),
    },
  ];

  const actions: TableAction<BrandItem>[] = [
    {
      label: <FaEdit />,
      onClick: (r) => handleEdit(r as BrandItem),
      className: "text-gray-600 mr-2",
    },
    {
      label: <FaTrash />,
      onClick: (r) => handleDelete(r as BrandItem),
      className: "text-red-600",
    },
  ];

  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "searchTerm",
        label: "Search",
        type: "text",
        placeholder: "Search by name",
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "", label: "All" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      },
    ],
    columns: 3,
    showResetButton: true,
    showSearchButton: true,
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brand Master</h1>
        <button
          onClick={handleAddClick}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Brand
        </button>
      </div>

      <CommonFilterSection
        filters={filters}
        config={filterConfig}
        onFilterChange={handleFilterChange}
        onSearch={applyFilters}
        onResetFilters={handleReset}
      />

      <ReusableTable
        columns={columns}
        data={displayItems}
        rowKey="id"
        actions={actions}
        emptyState={{
          message: "No Brands found",
          subMessage: "Try changing filters",
        }}
        pagination={true}
        currentPage={currentPage}
        totalPages={Math.ceil(allItems.length / ITEMS_PER_PAGE)}
        totalItems={allItems.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
      />

      <AddEditBrandModal
        isOpen={isModalOpen}
        initial={modalInitial}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveFromModal}
      />
    </div>
  );
};

export default BrandMaster;
