import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import api from "../../../services/api";
import GenericInventoryTable, {
  type RowAction,
} from "../../../components/table/GenericInventoryTable";

const BASE = "AccessoriesHeader";

interface AccessoryDetail {
  id?: number;
  name: string;
  type: string;
  qty: number;
}

interface AccessoryHeader {
  id?: number;
  accesoryId?: string;
  date: string;
  itemId: number;
  itemDescription: string;
  accessoriesDetails: AccessoryDetail[];
}

interface FormattedRow {
  id: number;
  accesoryId: string;
  date: string;
  itemDescription: string;
  detailCount: string;
}

const emptyDetail = (): AccessoryDetail => ({
  name: "",
  type: "standard",
  qty: 1,
});

const emptyForm = (): AccessoryHeader => ({
  date: new Date().toISOString().split("T")[0],
  itemId: 0,
  itemDescription: "",
  accessoriesDetails: [emptyDetail()],
});

const AccessoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rows, setRows] = useState<FormattedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [itemMasters, setItemMasters] = useState<
    { label: string; value: number; description: string }[]
  >([]);
  const [formData, setFormData] = useState<AccessoryHeader>(emptyForm());

  const columns = [
    { key: "accesoryId", label: "Accessory ID", sortable: true },
    { key: "date", label: "Date", sortable: true },
    { key: "itemDescription", label: "Item Description", sortable: true },
    { key: "detailCount", label: "Details", sortable: false },
  ];

  const fetchList = async () => {
    try {
      const res = await api.get<AccessoryHeader[]>(BASE);
      setRows(
        (res.data || []).map((h) => ({
          id: h.id!,
          accesoryId: h.accesoryId || "-",
          date: h.date ? new Date(h.date).toLocaleDateString() : "-",
          itemDescription: h.itemDescription || "-",
          detailCount: Array.isArray(h.accessoriesDetails)
            ? h.accessoriesDetails.length.toString()
            : "0",
        })),
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch accessories",
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const itemsRes = await api.get("ItemMaster");
        setItemMasters(
          (itemsRes.data || []).map((i: any) => ({
            label: i.itemName || i.name || `Item ${i.id}`,
            value: i.id,
            description: i.itemName || i.name || "",
          })),
        );
        await fetchList();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const closeModal = () => {
    navigate(location.pathname);
    setShowModal(false);
    setSelectedId(null);
    setFormData(emptyForm());
    setFormError(null);
  };

  const handleAddNew = () => {
    setFormData(emptyForm());
    setFormError(null);
    setModalMode("create");
    setSelectedId(null);
    setShowModal(true);
  };

  const loadRecord = async (id: number) => {
    const res = await api.get<AccessoryHeader>(`${BASE}/${id}`);
    const h = res.data;
    setFormData({
      id: h.id,
      accesoryId: h.accesoryId,
      date: h.date
        ? h.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      itemId: h.itemId,
      itemDescription: h.itemDescription,
      accessoriesDetails:
        Array.isArray(h.accessoriesDetails) && h.accessoriesDetails.length > 0
          ? h.accessoriesDetails.map((d: any) => ({
              id: d.id,
              name: d.accessoriesName || d.name || "",
              type: d.itemType || d.type || "",
              qty: d.qty ?? 0,
            }))
          : [emptyDetail()],
    });
  };

  const handleView = async (row: FormattedRow) => {
    navigate(`${location.pathname}?id=${row.id}&mode=view`);
    try {
      await loadRecord(row.id);
      setSelectedId(row.id);
      setModalMode("view");
      setShowModal(true);
    } catch {
      toast.error("Failed to load record");
    }
  };

  const handleEdit = async (row: FormattedRow) => {
    navigate(`${location.pathname}?id=${row.id}&mode=edit`);
    try {
      await loadRecord(row.id);
      setSelectedId(row.id);
      setFormError(null);
      setModalMode("edit");
      setShowModal(true);
    } catch {
      toast.error("Failed to load record");
    }
  };

  const handleDelete = async (row: FormattedRow) => {
    const result = await Swal.fire({
      title: "Delete Accessory",
      html: `Are you sure you want to delete <strong>"${row.accesoryId}"</strong>? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Deleting...",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          await api.delete(`${BASE}/${row.id}`);
          await fetchList();
          Swal.fire({
            title: "Deleted!",
            text: `"${row.accesoryId}" deleted successfully.`,
            icon: "success",
            confirmButtonColor: "#3b82f6",
          });
          toast.success("✅ Accessory deleted successfully!");
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to delete";
          Swal.fire({
            title: "Error!",
            text: msg,
            icon: "error",
            confirmButtonColor: "#ef4444",
          });
          toast.error(`❌ ${msg}`);
        }
      },
    });
  };

  const addDetail = () =>
    setFormData((prev) => ({
      ...prev,
      accessoriesDetails: [...prev.accessoriesDetails, emptyDetail()],
    }));

  const removeDetail = (i: number) => {
    if (formData.accessoriesDetails.length > 1)
      setFormData((prev) => ({
        ...prev,
        accessoriesDetails: prev.accessoriesDetails.filter(
          (_, idx) => idx !== i,
        ),
      }));
  };

  const updateDetail = (i: number, field: keyof AccessoryDetail, value: any) =>
    setFormData((prev) => ({
      ...prev,
      accessoriesDetails: prev.accessoriesDetails.map((d, idx) =>
        idx === i ? { ...d, [field]: value } : d,
      ),
    }));

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    if (name === "itemId") {
      const selectedItem = itemMasters.find((i) => i.value === Number(value));
      setFormData((prev) => ({
        ...prev,
        itemId: Number(value),
        itemDescription: selectedItem
          ? selectedItem.description
          : prev.itemDescription,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemDescription.trim()) {
      setFormError("Item Description is required");
      return;
    }
    const validDetails = formData.accessoriesDetails.filter((d) =>
      d.name.trim(),
    );
    if (validDetails.length === 0) {
      setFormError("At least one accessory detail with a name is required");
      return;
    }

    try {
      setFormLoading(true);
      setFormError(null);

      const payload = {
        accessoriesHeader: {
          ...(modalMode === "edit" && selectedId ? { id: selectedId } : {}),
          accesoryId: formData.accesoryId || "",
          date: `${formData.date}T00:00:00.000Z`,
          itemId: Number(formData.itemId),
          itemDescription: formData.itemDescription.trim(),
          accessoriesDetails: validDetails.map((d) => ({
            ...(d.id ? { id: d.id } : {}),
            name: d.name.trim(),
            type: d.type.trim(),
            qty: Number(d.qty),
          })),
        },
      };

      if (modalMode === "create") {
        await api.post(BASE, payload);
        toast.success("✅ Accessory created successfully!");
      } else if (modalMode === "edit" && selectedId) {
        await api.put(`${BASE}/${selectedId}`, payload);
        toast.success("✅ Accessory updated successfully!");
      }

      await fetchList();
      closeModal();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setFormError(msg);
      toast.error(`❌ ${msg}`);
    } finally {
      setFormLoading(false);
    }
  };

  const rowActions: RowAction[] = [
    {
      label: "View",
      icon: "view",
      color: "text-blue-600 hover:text-blue-900",
      onClick: (row) => handleView(row as FormattedRow),
    },
    {
      label: "Edit",
      icon: "edit",
      color: "text-amber-600 hover:text-amber-900",
      onClick: (row) => handleEdit(row as FormattedRow),
    },
    {
      label: "Delete",
      icon: "delete",
      color: "text-red-600 hover:text-red-900",
      onClick: (row) => handleDelete(row as FormattedRow),
    },
  ];

  const isView = modalMode === "view";
  const inputCls = (extra = "") =>
    `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isView ? "bg-gray-100 text-gray-600" : ""} ${extra}`;

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading accessories...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );

  return (
    <>
      <GenericInventoryTable
        title="Accessories"
        columns={columns}
        data={rows}
        onImport={() => {}}
        onExport={() => {}}
        onAddNew={handleAddNew}
        showImport={true}
        showExport={true}
        showAddNew={true}
        itemsPerPage={10}
        actions={rowActions}
        showActions={true}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-4xl mx-4 my-8">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalMode === "create" && "Add Accessory"}
                {modalMode === "edit" && "Edit Accessory"}
                {modalMode === "view" && "View Accessory"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              {/* Header Fields */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                {/* <h3 className="text-base font-semibold text-gray-900 mb-4">
                  Accessory Details
                </h3> */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {modalMode !== "create" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Accessory ID
                      </label>
                      <input
                        type="text"
                        value={formData.accesoryId || "Auto-generated"}
                        readOnly
                        className={inputCls()}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleFormChange}
                      readOnly={isView}
                      disabled={isView || formLoading}
                      className={inputCls()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="itemId"
                      value={formData.itemId}
                      onChange={handleFormChange}
                      disabled={isView || formLoading}
                      className={inputCls()}
                    >
                      <option value={0}>Select Item</option>
                      {itemMasters.map((i) => (
                        <option key={i.value} value={i.value}>
                          {i.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Description <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="itemDescription"
                      value={formData.itemDescription}
                      onChange={handleFormChange}
                      placeholder="Enter item description"
                      readOnly={isView}
                      disabled={isView || formLoading}
                      className={inputCls()}
                    />
                  </div>
                </div>
              </div>

              {/* Details Table */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-900">
                    Accessories Details
                  </h3>
                  {!isView && (
                    <button
                      type="button"
                      onClick={addDetail}
                      disabled={formLoading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      + Add Detail
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium w-10">
                          S.No
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Accessories Name
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Item Type
                        </th>
                        <th className="px-3 py-2 text-left font-medium w-28">
                          Qty
                        </th>
                        {!isView && (
                          <th className="px-3 py-2 text-center font-medium w-16">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.accessoriesDetails.map((d, i) => (
                        <tr
                          key={i}
                          className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                        >
                          <td className="px-3 py-2 text-center text-gray-500">
                            {i + 1}
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              value={d.name}
                              onChange={(e) =>
                                updateDetail(i, "name", e.target.value)
                              }
                              placeholder="Accessory name"
                              readOnly={isView}
                              disabled={isView || formLoading}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${isView ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={d.type}
                              onChange={(e) =>
                                updateDetail(i, "type", e.target.value)
                              }
                              disabled={isView || formLoading}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${isView ? "bg-gray-100 text-gray-600" : ""}`}
                            >
                              <option value="standard">Standard</option>
                              <option value="optional">Optional</option>
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              type="number"
                              value={d.qty}
                              onChange={(e) =>
                                updateDetail(
                                  i,
                                  "qty",
                                  e.target.value === ""
                                    ? 1
                                    : Number(e.target.value),
                                )
                              }
                              min={1}
                              placeholder="1"
                              readOnly={isView}
                              disabled={isView || formLoading}
                              className={`w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${isView ? "bg-gray-100 text-gray-600" : ""}`}
                            />
                          </td>
                          {!isView && (
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeDetail(i)}
                                disabled={
                                  formData.accessoriesDetails.length === 1 ||
                                  formLoading
                                }
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                              >
                                ✕
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm"
                >
                  {isView ? "Close" : "Cancel"}
                </button>
                {!isView && (
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    {formLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        {modalMode === "create" ? "Creating..." : "Updating..."}
                      </>
                    ) : modalMode === "create" ? (
                      "Add Accessory"
                    ) : (
                      "Update Accessory"
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessoriesPage;
