import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import purchaseRequisitionFormConfig from "./purchaseRequisitionFormConfig.json";
import DropDown from "../../components/common/DropDown";
import InputField from "../../components/common/InputField";
import ItemSelectionTable from "../../components/common/ItemSelectionTable";
import { useUser } from "../../context/UserContext";
import { Item, PurchaseRequisitionData } from "./types";

interface FormData {
  [key: string]: string | string[] | undefined;
  vendorId?: string;
  vendorName?: string;
}

interface Supplier {
  id: number;
  vendorName: string;
}

interface CreatePurchaseRequisitionProps {
  mode: "create" | "edit";
  data?: PurchaseRequisitionData;
  onSuccess?: () => void;
  onClose?: () => void;
}

const CreatePurchaseRequisition: React.FC<CreatePurchaseRequisitionProps> = ({
  mode,
  data,
  onSuccess,
  onClose,
}) => {
  // State for suppliers

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  console.log(data, "dataXxxx");
  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get("Suppliers");
        const suppliersData = response.data || [];
        console.log("Suppliers data:", suppliersData);
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);
  console.log("CreatePurchaseRequisition data:", data);
  const [formData, setFormData] = useState<FormData>(() => {
    const initialData: FormData = {};
    purchaseRequisitionFormConfig.headerFields.forEach((field) => {
      if (field.showOnlyInEdit && mode !== "edit") {
        return; // Skip fields that should only show in edit mode
      }
      if (field.name === "budgetAmount") {
        initialData[field.name] = "0"; // Initialize budget amount as 0
        return;
      }
      if (field.name === "status" && mode === "create") {
        initialData[field.name] = "Pending"; // Initialize status as Pending for new records
        return;
      }
      if (field.name === "vendorName") {
        if (data?.supplierId) {
          initialData.vendorId = data.supplierId.toString();
          initialData.vendorName = data.vendorName || "";
        }
        return;
      }
      // Map the fields correctly
      if (
        field.name === "purchase_requisition_id" &&
        data?.purchaseRequisitionId
      ) {
        initialData[field.name] = data.purchaseRequisitionId;
      } else if (field.name === "requesterName" && data?.requesterName) {
        initialData[field.name] = data.requesterName;
      } else if (field.name === "description" && data?.description) {
        initialData[field.name] = data.description;
      } else if (field.name === "deliveryDate" && data?.deliveryDate) {
        const date = new Date(data.deliveryDate);
        initialData[field.name] = date.toISOString().split("T")[0];
      } else if (field.name === "budgetAmount" && data?.budgetAmount) {
        initialData[field.name] = data.budgetAmount.toString();
      } else if (field.name === "status" && data?.status) {
        initialData[field.name] = data.status;
      } else {
        if (field.name === "deliveryDate") {
          initialData[field.name] = new Date().toISOString().split("T")[0]; // ✅ "2026-03-27"
        } else {
          initialData[field.name] = "";
        }
      }
    });
    return initialData;
  });
  const { user, role } = useUser();
  const [errors, setErrors] = useState<FormData>({});

  const [selectedItems, setSelectedItems] = useState<
    { ItemId: number; Quantity: number }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await api.get("Supplier");
        const suppliersData = response.data || [];
        setSuppliers(suppliersData);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownChange = (field: string, value: string) => {
    console.log("Dropdown change:", field, value);
    if (field === "vendorName") {
      const selectedSupplier = suppliers.find((s) => s.id.toString() === value);
      if (selectedSupplier) {
        setFormData((prev) => ({
          ...prev,
          vendorId: value,
          [field]: selectedSupplier.vendorName,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleItemsChange = (items: { ItemId: number; Quantity: number }[]) => {
    setSelectedItems(items);
    console.log("Selected items:", items);
  };

  const handleTotalChange = (total: number) => {
    // Update form data with the raw number
    setFormData((prev) => ({
      ...prev,
      budgetAmount: total.toString(),
    }));

    // If there's an input field, update its display value with formatted number
    const budgetInput = document.querySelector(
      'input[name="budgetAmount"]',
    ) as HTMLInputElement;
    if (budgetInput) {
      budgetInput.value = total.toLocaleString("en-IN");
    }
  };

  const validateForm = () => {
    const newErrors: FormData = {};
    purchaseRequisitionFormConfig.headerFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deliveryDateValue = formData.deliveryDate as string;
      let deliveryDate;

      if (deliveryDateValue) {
        deliveryDate = new Date(deliveryDateValue).toISOString();
      } else {
        deliveryDate = new Date().toISOString();
      }

      const payload = {
        PurchaseRequisitionId: formData.purchase_requisition_id || "", // string
        RequesterName: formData.requesterName || "",
        Description: formData.description || "",
        SupplierId: Number(formData.vendorId) || 0,
        Items: selectedItems.map((item) => ({
          ItemId: item.ItemId,
          Quantity: item.Quantity,
        })),
        DeliveryDate: deliveryDate,
        BudgetAmount: Number(formData.budgetAmount) || 0,
        Status: formData.status || "Pending",
        UserCreated: user?.userId || 0,
        UserUpdated: user?.userId || 0,
      };
      console.log(
        `${mode === "edit" ? "Updating" : "Submitting"} Purchase Requisition:`,
        payload,
      );

      // API call
      const response =
        mode === "edit"
          ? await api.put(`PurchaseRequisitions/${data?.id}`, payload)
          : await api.post("PurchaseRequisitions", payload);

      if (response.status >= 200 && response.status < 300) {
        toast.success(
          `Purchase Requisition ${
            mode === "edit" ? "updated" : "created"
          } successfully!`,
        );
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        throw new Error("Failed to save purchase requisition");
      }
    } catch (error) {
      console.error(
        `Error ${
          mode === "edit" ? "updating" : "submitting"
        } Purchase Requisition:`,
        error,
      );
      alert(
        `Failed to ${
          mode === "edit" ? "update" : "submit"
        } Purchase Requisition.`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Initialize selected items from existing data if in edit mode
  useEffect(() => {
    if (mode === "edit" && data?.items) {
      setSelectedItems(
        data.items.map((item) => ({
          ItemId: item.itemId,
          Quantity: item.quantity,
        })),
      );
    }
  }, [mode, data]);

  return (
    <div className="w-full mx-auto p-2">
      <div className="bg-white p-8">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="bg-white rounded-2xl shadow p-6 mb-8 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {purchaseRequisitionFormConfig.headerFields
                .filter((field) => !(field.showOnlyInEdit && mode !== "edit"))
                .map((field) => (
                  <div key={field.name}>
                    {field.showOnlyInEdit &&
                    mode !== "edit" ? null : field.type === "input" ? (
                      <InputField
                        FieldName={field.label}
                        IdName={field.name}
                        Name={field.name}
                        Type={field.inputType || "text"}
                        value={formData[field.name] as string}
                        handleInputChange={handleChange}
                        required={field.required}
                        Disabled={
                          field.name === "budgetAmount" ||
                          field.name === "requesterName"
                        }
                      />
                    ) : field.type === "dropdown" ? (
                      <DropDown
                        FieldName={field.label}
                        IdName={field.name}
                        handleOptionChange={handleDropdownChange}
                        values={
                          field.name === "vendorName"
                            ? formData.vendorId || ""
                            : (formData[field.name] as string)
                        }
                        Options={
                          field.name === "vendorName"
                            ? suppliers.map((supplier) => ({
                                label: supplier.vendorName,
                                value: supplier.id.toString(),
                              }))
                            : field.options?.map((option) => ({
                                label: option,
                                value: option,
                              })) || []
                        }
                        required={field.required}
                      />
                    ) : field.type === "textarea" ? (
                      <div>
                        <label>{field.label}</label>
                        <textarea
                          name={field.name}
                          value={formData[field.name] as string}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                        ></textarea>
                        {errors[field.name] && (
                          <span className="text-red-500 text-sm">
                            {errors[field.name]}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
            </div>
          </div>

          <ItemSelectionTable
            onItemsChange={handleItemsChange}
            onTotalChange={handleTotalChange}
            initialItems={data?.items}
          />

          <div className="flex justify-end mt-10">
            <button
              type="submit"
              className={`bg-blue-700 text-white px-10 py-3 rounded-2xl shadow font-bold text-lg transition-all duration-200 ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-800"
              }`}
              disabled={loading}
            >
              {loading
                ? `${mode === "edit" ? "Updating" : "Submitting"}...`
                : `${
                    mode === "edit" ? "Update" : "Submit"
                  } Purchase Requisition`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseRequisition;
