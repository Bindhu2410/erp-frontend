import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { FaPlus, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { useUser } from "../../../context/UserContext";
import Modal from "../../../components/common/Modal";

interface GRNFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
  initialData?: any;
}

interface LineItem {
  id?: number;
  item_id?: number;
  item_name?: string;
  unit: string;
  qc_passed: boolean;
  rate?: number | null;
  ordered_qty?: number | null;
  pending_qty?: number | null;
  billed_qty?: number | null;
  grn_qty?: number | null;
  purchase_value?: number | null;
  amount?: number | null;
  grnId?: number;
  goods_receipt_note_id?: number;
  status?: string;
}

interface ItemOption {
  label: string;
  value: number;
  tooltip?: string;
  unit?: string;
  rate?: number;
  stockQty?: number;
  hsn?: string;
  fullItemData?: any;
}

interface GRN {
  grnNo: string;
  grnDate: string;
  poId: string;
  supplierId: number;
  supplierName?: string;
  locationId?: number;
  locationName?: string;
  refNo?: string;
  refDate?: string;
  narration: string;
  status: string;
  items: LineItem[];
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
}

const GRNModal: React.FC<GRNFormProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
  initialData,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [poOptions, setPoOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [poData, setPoData] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [itemOptions, setItemOptions] = useState<ItemOption[]>([]);
  const [locationOptions, setLocationOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const [unitOptions, setUnitOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [formData, setFormData] = useState<GRN>({
    grnNo: "",
    grnDate: new Date().toISOString().split("T")[0],
    poId: "",
    supplierId: 0,
    narration: "",
    status: "Draft",
    items: [],
  });
  const [selectedPoItems, setSelectedPoItems] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isEdit, setIsEdit] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setIsEdit(true);
      const itemDetailsMap: { [key: number]: any } = {};
      if (initialData.itemDetails && Array.isArray(initialData.itemDetails)) {
        initialData.itemDetails.forEach((item: any) => {
          if (item.id) itemDetailsMap[item.id] = item;
        });
      }

      const editFormData: GRN = {
        id: initialData.grn?.id || initialData.id,
        grnNo: initialData.grn?.grnNo || "",
        grnDate: initialData.grn?.grnDate
          ? new Date(initialData.grn.grnDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        poId: initialData.grn?.poId || "",
        supplierId: initialData.grn?.supplierId || 0,
        locationId: initialData.locationId || 0,
        refNo: initialData.grn?.refNo || "",
        refDate: initialData.grn?.refDate
          ? new Date(initialData.grn.refDate).toISOString().split("T")[0]
          : undefined,
        narration: initialData.grn?.narration || "",
        status: initialData.grn?.status || "Draft",
        userCreated: initialData.grn?.userCreated,
        dateCreated: initialData.grn?.dateCreated,
        userUpdated: initialData.grn?.userUpdated,
        dateUpdated: initialData.grn?.dateUpdated,
        items:
          initialData.grn?.items && Array.isArray(initialData.grn.items)
            ? initialData.grn.items.map((item: any) => {
                const itemDetail = initialData.itemDetails?.find(
                  (detail: any) => detail.id === item.itemId
                );
                return {
                  id: item.id,
                  grnId: item.grnId,
                  goods_receipt_note_id: item.goodsReceiptNoteId,
                  item_id: item.itemId,
                  item_name: itemDetail?.itemName || `Item ${item.itemId}`,
                  unit: itemDetail?.uomName || "Nos.",
                  qc_passed: item.qcPassed || false,
                  rate: itemDetail?.unitPrice || 0,
                  pending_qty: item.pendingQty || 0,
                  billed_qty: item.billedQty || 0,
                  grn_qty: item.grnQty || 0,
                  ordered_qty: item.orderedQty || 0,
                  purchase_value:
                    (itemDetail?.unitPrice || 0) * (item.grnQty || 0),
                  amount: item.amount || 0,
                  status: "Active",
                };
              })
            : [],
      };
      setFormData(editFormData);
    } else {
      setIsEdit(false);
      setFormData({
        grnNo: "",
        grnDate: new Date().toISOString().split("T")[0],
        poId: "",
        supplierId: 0,
        narration: "",
        status: "Draft",
        items: [],
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (!isOpen) return;
      setLoading(true);
      try {
        const [supplierRes, itemRes, locationRes, unitRes, poOptionRes] =
          await Promise.all([
            api.get("Supplier"),
            api.get("ItemMaster"),
            api.get("ItemLocation"),
            api.get("uom"),
            api.get("PurchaseOrder"),
          ]);
        setPoData(poOptionRes.data);
        setPoOptions(
          poOptionRes.data.map((po: any) => ({
            label: po.purchaseOrder.poId,
            value: po.purchaseOrder.poId,
          }))
        );

        setSupplierOptions(
          supplierRes.data.map((s: any) => ({
            label: s.name || s.vendorName || s.companyName,
            value: s.id,
          }))
        );

        setItemOptions(
          itemRes.data.map((i: any) => ({
            label: i.itemName || i.itemDesc || i.description,
            value: i.id,
            tooltip: i.itemName || i.itemDesc || i.description,
            unit: i.uom || i.unit || "Nos.",
            rate: i.rate || i.salesPrice || i.purchasePrice || 0,
            stockQty: i.stockQty || i.availableQty || 0,
            hsn: i.hsnCode || i.hsn || "",
            fullItemData: i,
          }))
        );

        setLocationOptions(
          locationRes.data.map((l: any) => ({
            label: l.name || l.locationName,
            value: l.id,
          }))
        );

        setUnitOptions(
          unitRes.data.map((u: any) => ({
            label: u.code || u.uomDescription || u.unit,
            value: u.id || u.code || u.unit,
          }))
        );
      } catch (error) {
        console.error("Error fetching dropdown options:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDropdowns();
  }, [isOpen, initialData]);

  const handlePoChange = (poId: string) => {
    if (!poId) {
      setFormData((prev) => ({
        ...prev,
        poId: "",
        supplierId: 0,
        supplierName: "",
        items: [],
      }));
      setSelectedPoItems([]);
      return;
    }

    // Find selected PO from stored data
    const poDetails = poData.find((po: any) => po.purchaseOrder.poId === poId);

    if (!poDetails) {
      alert("Selected PO details not found");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      poId: poDetails.purchaseOrder.poId,
      supplierId: poDetails.purchaseOrder.supplierId,
      supplierName: poDetails.vendorName,
      items: [],
    }));

    if (poDetails.items && poDetails.items.length > 0) {
      const mappedItems = poDetails.items.map((item: any) => ({
        item_id: item.itemId,
        item_name: item.itemName,
        unit: item.uomName || "Nos.",
        qc_passed: false,
        rate: item.unitPrice,
        ordered_qty: item.qty,
        pending_qty: 0,
        billed_qty: 0,
        grn_qty: 0,
        purchase_value: 0,
        amount: 0,
        status: "Active",
        hsn: item.hsn,
        make: item.make,
        model: item.model,
        category: item.categoryName,
      }));
      // Directly set items in formData
      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, ...mappedItems],
      }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const numericFields = ["supplierId", "locationId"];
    const fieldValue = numericFields.includes(name)
      ? value
        ? Number(value)
        : ""
      : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "poId") handlePoChange(value);
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          unit: "",
          qc_passed: false,
          rate: undefined as unknown as number,
          pending_qty: undefined as unknown as number,
          billed_qty: undefined as unknown as number,
          grn_qty: undefined as unknown as number,
          purchase_value: undefined as unknown as number,
          amount: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (
    index: number,
    field: keyof LineItem,
    value: any
  ) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === "item_id") {
        const selectedItem = itemOptions.find(
          (item) => item.value === Number(value)
        );
        if (selectedItem) {
          updatedItems[index] = {
            ...updatedItems[index],
            item_name: selectedItem.label,
            unit: selectedItem.unit || "Nos.",
            rate: selectedItem.rate || 0,
            grn_qty: updatedItems[index].grn_qty || 0,
            pending_qty: updatedItems[index].pending_qty || 0,
            billed_qty: updatedItems[index].billed_qty || 0,
          };
          const qty = updatedItems[index].grn_qty;
          const rate = updatedItems[index].rate;
          updatedItems[index].purchase_value = Number(qty) * Number(rate);
          updatedItems[index].amount = Number(qty) * Number(rate);
        }
      }

      // Always recalculate amount when GRN qty or rate changes
      const qty = updatedItems[index].grn_qty || 0;
      const rate = updatedItems[index].rate || 0;
      updatedItems[index].amount = Number(qty) * Number(rate);

      return { ...prev, items: updatedItems };
    });
  };

  const handleQcChange = (index: number, checked: boolean) => {
    handleItemChange(index, "qc_passed", checked);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (isEdit && !formData.grnNo) newErrors.grnNo = "GRN No is required";
    if (!formData.grnDate) newErrors.grnDate = "GRN Date is required";
    if (!formData.supplierId) newErrors.supplierId = "Supplier is required";

    if (!formData.items.length) {
      newErrors.items = "At least one item is required";
    } else {
      formData.items.forEach((item, index) => {
        if (!item.item_id) newErrors[`item_${index}_id`] = "Item is required";
        if (!item.unit) newErrors[`item_${index}_unit`] = "Unit is required";
        if (!item.grn_qty)
          newErrors[`item_${index}_grn_qty`] = "Quantity is required";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + Number(item.amount), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        Id: isEdit ? formData.id || 0 : 0,
        UserCreated: isEdit
          ? formData.userCreated || user?.userId || 0
          : user?.userId || 0,
        DateCreated: isEdit ? formData.dateCreated : new Date().toISOString(),
        UserUpdated: user?.userId || 0,
        DateUpdated: new Date().toISOString(),
        GrnNo: formData.grnNo,
        GrnDate: new Date(formData.grnDate).toISOString(),
        PoId: formData.poId || null,
        SupplierId: formData.supplierId,
        Narration: formData.narration,
        Status: formData.status,
        Items: formData.items.map((item) => ({
          Id: isEdit ? item.id || 0 : 0,
          GrnId: isEdit ? item.grnId || formData.id || 0 : 0,
          QcPassed: item.qc_passed,
          ItemId: item.item_id,
          GrnQty: item.grn_qty,
          PendingQty: item.pending_qty,
          BilledQty: item.billed_qty,
          Amount: item.amount,
          OrderedQty: item.ordered_qty || 0,
        })),
      };

      const response = isEdit
        ? await api.put(`GoodsReceiptNote/${payload.Id}`, payload)
        : await api.post("GoodsReceiptNote", payload);

      if (response.data) {
        alert(
          isEdit ? "GRN updated successfully!" : "GRN created successfully!"
        );
        setFormData({
          grnNo: "",
          grnDate: new Date().toISOString().split("T")[0],
          poId: "",
          supplierId: 0,
          narration: "",
          status: "Draft",
          items: [],
        });
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error submitting GRN:", error);
      alert("Failed to create GRN. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => onClose();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit GRN" : "Create GRN"}
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleCancel}
        ></div>
        <div className="inline-block align-bottom bg-white text-left overflow-hidden transform transition-all w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {isEdit && (
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      GRN No *
                    </label>
                    <input
                      type="text"
                      name="grnNo"
                      value={formData.grnNo}
                      onChange={handleChange}
                      className={`w-full p-2 border rounded ${
                        errors.grnNo ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter GRN Number"
                      readOnly
                    />
                    {errors.grnNo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.grnNo}
                      </p>
                    )}
                  </div>
                )}

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GRN Date *
                  </label>
                  <input
                    type="date"
                    name="grnDate"
                    value={formData.grnDate}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${
                      errors.grnDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.grnDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.grnDate}
                    </p>
                  )}
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PO Number
                  </label>
                  <select
                    name="poId"
                    value={formData.poId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select PO</option>
                    {poOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier *
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId || ""}
                    onChange={handleChange}
                    className={`w-full p-2 border rounded ${
                      errors.supplierId ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Supplier</option>
                    {supplierOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.supplierId}
                    </p>
                  )}
                </div>

                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Narration
                  </label>
                  <textarea
                    name="narration"
                    value={formData.narration}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Enter any additional notes"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">GRN Items</h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    <FaPlus size={12} /> Add Item
                  </button>
                </div>

                {errors.items && (
                  <p className="text-red-500 text-sm mb-2">{errors.items}</p>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/4">
                          Item *
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          Unit *
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          QC Passed
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          Rate
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          Ordered Qty
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          Pending Qty
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          Billed Qty
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase w-1/12">
                          GRN Qty *
                        </th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Amount
                        </th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-gray-600 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {formData.items.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-4 text-center text-gray-500"
                          >
                            No items added. Click "Add Item" to add a new item.
                          </td>
                        </tr>
                      ) : (
                        formData.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-2 py-2 min-w-[250px]">
                              <div className="relative">
                                {item.item_name && isEdit ? (
                                  <div className="border p-2 bg-blue-50 border-blue-300 rounded flex items-center justify-between">
                                    <div
                                      className="truncate font-medium text-blue-700"
                                      title={item.item_name}
                                    >
                                      {item.item_name}
                                    </div>
                                    <button
                                      type="button"
                                      className="text-blue-600 hover:text-blue-800 ml-2"
                                      onClick={() => {
                                        const newItems = [...formData.items];
                                        newItems[index] = {
                                          ...newItems[index],
                                          item_name: undefined,
                                        };
                                        setFormData({
                                          ...formData,
                                          items: newItems,
                                        });
                                      }}
                                    >
                                      Change
                                    </button>
                                  </div>
                                ) : (
                                  <select
                                    value={item.item_id || ""}
                                    onChange={(e) =>
                                      handleItemChange(
                                        index,
                                        "item_id",
                                        Number(e.target.value)
                                      )
                                    }
                                    style={{
                                      minWidth: "250px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                    className={`w-full p-1.5 border rounded ${
                                      errors[`item_${index}_id`]
                                        ? "border-red-500"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    <option value="">Select Item</option>
                                    {itemOptions.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                        title={option.label}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {errors[`item_${index}_id`] && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {errors[`item_${index}_id`]}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              {item.item_id ? (
                                <input
                                  type="text"
                                  value={item.unit || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-1.5 border rounded ${
                                    errors[`item_${index}_unit`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Unit"
                                  readOnly={!!item.item_id}
                                />
                              ) : (
                                <select
                                  value={item.unit || ""}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full p-1.5 border rounded ${
                                    errors[`item_${index}_unit`]
                                      ? "border-red-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  <option value="">Select Unit</option>
                                  {unitOptions.map((option) => (
                                    <option
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {errors[`item_${index}_unit`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`item_${index}_unit`]}
                                </p>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={item.qc_passed}
                                onChange={(e) =>
                                  handleQcChange(index, e.target.checked)
                                }
                                className="w-4 h-4 accent-blue-600"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={
                                    item.rate === undefined ||
                                    item.rate === null
                                      ? ""
                                      : item.rate
                                  }
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "rate",
                                      e.target.value === ""
                                        ? null
                                        : Number(e.target.value)
                                    )
                                  }
                                  className={`w-full p-1.5 border rounded ${
                                    item.item_id ? "bg-blue-50" : ""
                                  }`}
                                  min="0"
                                  step="0.01"
                                  title={
                                    item.item_id
                                      ? "Rate from item master"
                                      : "Enter rate"
                                  }
                                />
                                {item.item_id && (
                                  <div className="absolute top-0 right-0 h-full flex items-center pr-2">
                                    <span
                                      className="text-xs text-blue-600"
                                      title="Auto-populated from Item Master"
                                    >
                                      ★
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={item.ordered_qty || ""}
                                className="w-full p-1.5 border border-gray-300 rounded bg-gray-50"
                                readOnly
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={
                                  item.pending_qty === undefined ||
                                  item.pending_qty === null
                                    ? ""
                                    : item.pending_qty
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "pending_qty",
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  )
                                }
                                className="w-full p-1.5 border border-gray-300 rounded"
                                min="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={
                                  item.billed_qty === undefined ||
                                  item.billed_qty === null
                                    ? ""
                                    : item.billed_qty
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "billed_qty",
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  )
                                }
                                className="w-full p-1.5 border border-gray-300 rounded"
                                min="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={
                                  item.grn_qty === undefined ||
                                  item.grn_qty === null
                                    ? ""
                                    : item.grn_qty
                                }
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "grn_qty",
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  )
                                }
                                className={`w-full p-1.5 border rounded ${
                                  errors[`item_${index}_grn_qty`]
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}
                                min="0"
                              />
                              {errors[`item_${index}_grn_qty`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors[`item_${index}_grn_qty`]}
                                </p>
                              )}
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={item.amount?.toFixed(2) || ""}
                                disabled
                                className="w-full p-1.5 bg-gray-50 border border-gray-300 rounded"
                                title={`Amount = GRN Qty (${
                                  item.grn_qty || 0
                                }) × Rate (${item.rate || 0})`}
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={7}
                          className="px-4 py-2 text-right font-medium"
                        >
                          Grand Total Amount:
                        </td>
                        <td
                          colSpan={2}
                          className="px-4 py-2 font-medium text-blue-700"
                        >
                          ₹ {getTotalAmount().toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <FaSave /> {loading ? "Saving..." : "Save GRN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GRNModal;
