import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import {
  RateMaster,
  CreateRateMasterRequest,
  RateMasterItem,
} from "../../../types/rateMaster";

interface FormData {
  rateMasterId: string;
  docDate: string;
  effectiveDate: string;
  inventoryGroupId: number;
  type: string;
  remarks: string;
}

interface ItemFormData {
  itemId: number;
  supplierId: number;
  currencyType: string;
  purchaseRate: number;
  hsnCode: string;
  tax: number;
  salesRate: number;
  klRate: number;
  quotationRate: number;
}

const ItemRateMaster: React.FC = () => {
  const [rateMasters, setRateMasters] = useState<RateMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create",
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    rateMasterId: "",
    docDate: new Date().toISOString().split("T")[0],
    effectiveDate: new Date().toISOString().split("T")[0],
    inventoryGroupId: 4, // Default value as shown in API response
    type: "Normal",
    remarks: "",
  });

  const [items, setItems] = useState<ItemFormData[]>([
    {
      itemId: 0,
      supplierId: 0,
      currencyType: "",
      purchaseRate: 0,
      hsnCode: "",
      tax: 0,
      salesRate: 0,
      klRate: 0,
      quotationRate: 0,
    },
  ]);

  useEffect(() => {
    fetchRateMasters();
  }, []);

  const fetchRateMasters = async () => {
    try {
      setLoading(true);
      const response = await api.get<RateMaster[]>("RateMaster");
      setRateMasters(response.data || []);
    } catch (error) {
      console.error("Error fetching rate masters:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const payload: CreateRateMasterRequest = {
        ...formData,
        items: items.map((item) => ({
          itemId: item.itemId,
          supplierId: item.supplierId,
          currencyType: item.currencyType,
          purchaseRate: item.purchaseRate,
          hsnCode: item.hsnCode,
          tax: item.tax,
          salesRate: item.salesRate,
          klRate: item.klRate,
          quotationRate: item.quotationRate,
        })),
      };

      if (modalMode === "create") {
        await api.post("RateMaster", payload);
      } else if (modalMode === "edit" && selectedId) {
        await api.put(`RateMaster/${selectedId}`, payload);
      }

      await fetchRateMasters();
      closeModal();
    } catch (error) {
      console.error("Error saving rate master:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await api.get<RateMaster>(`RateMaster/${id}`);
      const rateMaster = response.data;

      setFormData({
        rateMasterId: rateMaster.rateMasterId,
        docDate: rateMaster.docDate.split("T")[0],
        effectiveDate: rateMaster.effectiveDate.split("T")[0],
        inventoryGroupId: rateMaster.inventoryGroupId,
        type: rateMaster.type,
        remarks: rateMaster.remarks,
      });

      setItems(
        rateMaster.items.map((item) => ({
          itemId: item.itemId,
          supplierId: item.supplierId,
          currencyType: item.currencyType,
          purchaseRate: item.purchaseRate,
          hsnCode: item.hsnCode,
          tax: item.tax,
          salesRate: item.salesRate,
          klRate: item.klRate,
          quotationRate: item.quotationRate,
        })),
      );

      setSelectedId(id);
      setModalMode("edit");
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching rate master:", error);
    }
  };

  const handleView = async (id: number) => {
    await handleEdit(id);
    setModalMode("view");
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this rate master?"))
      return;

    try {
      await api.delete(`RateMaster/${id}`);
      await fetchRateMasters();
    } catch (error) {
      console.error("Error deleting rate master:", error);
    }
  };

  const openCreateModal = () => {
    setFormData({
      rateMasterId: "",
      docDate: new Date().toISOString().split("T")[0],
      effectiveDate: new Date().toISOString().split("T")[0],
      inventoryGroupId: 4, // Default value as shown in API response
      type: "Normal",
      remarks: "",
    });
    setItems([
      {
        itemId: 0,
        supplierId: 0,
        currencyType: "",
        purchaseRate: 0,
        hsnCode: "",
        tax: 0,
        salesRate: 0,
        klRate: 0,
        quotationRate: 0,
      },
    ]);
    setModalMode("create");
    setSelectedId(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedId(null);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemId: 0,
        supplierId: 0,
        currencyType: "",
        purchaseRate: 0,
        hsnCode: "",
        tax: 0,
        salesRate: 0,
        klRate: 0,
        quotationRate: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemFormData, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Item Rate Master</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Rate Master
        </button>
      </div>

      {loading && !showModal ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rate Master ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Doc Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Effective Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rateMasters.map((rateMaster) => (
                <tr key={rateMaster.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rateMaster.rateMasterId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rateMaster.docDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rateMaster.effectiveDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rateMaster.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rateMaster.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleView(rateMaster.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(rateMaster.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rateMaster.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {modalMode === "create"
                  ? "Create"
                  : modalMode === "edit"
                    ? "Edit"
                    : "View"}{" "}
                Rate Master
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Master ID{" "}
                    {modalMode !== "view" && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.rateMasterId}
                    onChange={(e) =>
                      setFormData({ ...formData, rateMasterId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly={modalMode === "view"}
                    required={modalMode !== "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={modalMode === "view"}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Special">Tender</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doc Date
                  </label>
                  <input
                    type="date"
                    value={formData.docDate}
                    onChange={(e) =>
                      setFormData({ ...formData, docDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly={modalMode === "view"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        effectiveDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly={modalMode === "view"}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarks
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) =>
                      setFormData({ ...formData, remarks: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly={modalMode === "view"}
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-800">Items</h4>
                  {modalMode !== "view" && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      + Add Item
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto border border-gray-300 rounded-md">
                  <table className="w-full">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Item ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Supplier ID
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Currency
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Purchase Rate
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          HSN Code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Tax
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Sales Rate
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          KL Rate
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium">
                          Quotation Rate
                        </th>
                        {modalMode !== "view" && (
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Action
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }
                        >
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.itemId}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "itemId",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.supplierId}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "supplierId",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="text"
                              value={item.currencyType}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "currencyType",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="string"
                              value={item.purchaseRate || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "purchaseRate",
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              // placeholder="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="text"
                              value={item.hsnCode}
                              onChange={(e) =>
                                updateItem(index, "hsnCode", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.tax || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "tax",
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.salesRate || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "salesRate",
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.klRate || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "klRate",
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={item.quotationRate || ""}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quotationRate",
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              readOnly={modalMode === "view"}
                            />
                          </td>
                          {modalMode !== "view" && (
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                                className="text-red-600 hover:text-red-800 disabled:text-gray-400"
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

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : modalMode === "create"
                        ? "Create"
                        : "Update"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemRateMaster;
