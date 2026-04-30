import React, { useState, useEffect } from "react";
import {
  PurchaseOrder,
  PurchaseOrderFormData,
  PurchaseOrderItem,
} from "../../types/purchaseOrder";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import PurchaseItemsTable from "../../components/purchase/PurchaseItemsTable";
import InputField from "../../components/common/InputField";
import DropDown from "../../components/common/DropDown";
import formConfig from "./purchaseOrderFormConfig.json";
import api from "../../services/api";

interface PurchaseOrderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PurchaseOrderFormData) => Promise<void>;
  initialData?: PurchaseOrder;
  mode: "create" | "edit";
}

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: "edit" | "create" | boolean;
  rows?: number;
  options?: Array<{ label: string; value: string }>;
}

interface FormConfig {
  formFields: FormField[];
}

type FormFieldValue = string | number | PurchaseOrderItem[] | undefined;

const getFieldStringValue = (
  value: FormFieldValue,
  fieldId?: string
): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    if (fieldId === "SupplierId" && value === 0) return "";
    return value.toString();
  }
  return "";
};

const hasFormFields = (config: any): config is FormConfig => {
  return config && Array.isArray(config.formFields);
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState<PurchaseOrderFormData>(() => {
    if (mode === "create") {
      return {
        PoId: "",
        PurchaseRequisitionId: "",
        SupplierId: 0,
        Status: "Draft",
        DeliveryDate: "",
        Description: "",
        Items: [],
      };
    }

    return {
      PoId: initialData?.PoId || "",
      PurchaseRequisitionId: initialData?.PurchaseRequisitionId || "",
      SupplierId: initialData?.SupplierId || 0,
      Status: initialData?.Status || "",
      DeliveryDate: initialData?.DeliveryDate
        ? initialData.DeliveryDate.split("T")[0]
        : "",
      Description: initialData?.Description || "",
      Items: initialData?.Items || [],
    };
  });

  const [loading, setLoading] = useState(false);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState<any[]>([]);
  const [loadingPRs, setLoadingPRs] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        PoId: initialData.PoId,
        PurchaseRequisitionId: initialData.PurchaseRequisitionId,
        SupplierId: initialData.SupplierId,
        Status: initialData.Status || "Draft",
        DeliveryDate: initialData.DeliveryDate.split("T")[0],
        Description: initialData.Description,
        Items: initialData.Items,
      });
    }
  }, [initialData]);

  useEffect(() => {
    fetchPurchaseRequisitions();
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const response = await api.get("Supplier");
      setSuppliers(response.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoadingSuppliers(false);
    }
  };

  // Update the fetchPurchaseRequisitions function
  const fetchPurchaseRequisitions = async () => {
    try {
      setLoadingPRs(true);
      const response = await api.get("PurchaseRequisitions/Dropdown-po");
      console.log("Fetched PRs:", response.data);

      // Ensure the data is in the correct format and filter approved PRs
      const formattedPRs = Array.isArray(response.data)
        ? response.data.filter((pr) => pr.status === "Approved")
        : [];
      setPurchaseRequisitions(formattedPRs);
    } catch (error) {
      console.error("Error fetching purchase requisitions:", error);
      toast.error("Failed to load purchase requisitions");
    } finally {
      setLoadingPRs(false);
    }
  };

  const handlePRChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prId = e.target.value;
    console.log("Selected PR ID:", prId);

    if (!prId) {
      setFormData((prev) => ({
        ...prev,
        PurchaseRequisitionId: "",
        SupplierId: 0,
        Items: [],
      }));
      return;
    }

    try {
      // Find the selected PR from the list
      const selectedPR = purchaseRequisitions.find(
        (pr) => pr.purchaseRequisitionId === prId
      );

      if (!selectedPR) {
        console.error("Selected PR not found in the list");
        return;
      }

      console.log("Selected PR:", selectedPR);
      setFormData((prev) => ({
        ...prev,
        PurchaseRequisitionId: selectedPR.purchaseRequisitionId,
        SupplierId: selectedPR.supplierId,
        DeliveryDate: selectedPR.deliveryDate.split("T")[0],
        Description: selectedPR.description,
        Items: Array.isArray(selectedPR.items)
          ? selectedPR.items.map((item: any) => ({
              ItemId: item.itemId,
              Quantity: item.quantity,
              SupplierId: selectedPR.supplierId,
              itemName: item.itemName,
              make: item.make,
              model: item.model,
              unitPrice: item.unitPrice,
              uomName: item.uomName,
              hsn: item.hsn,
              taxPercentage: item.taxPercentage,
              categoryName: item.categoryName,
              brand: item.brand,
              catNo: item.catNo,
            }))
          : [],
      }));
    } catch (error) {
      console.error("Error processing PR selection:", error);
      toast.error("Failed to process purchase requisition selection");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      toast.success(
        `Purchase Order ${
          mode === "create" ? "created" : "updated"
        } successfully`
      );
      onClose();
    } catch (error) {
      toast.error("Error saving purchase order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (value: string) => {
    const supplierId = value ? parseInt(value) : 0;
    console.log("Supplier changed to:", supplierId);
    setFormData((prev) => ({
      ...prev,
      SupplierId: supplierId,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "SupplierId") {
      handleSupplierChange(value);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === "create" ? "Create" : "Edit"} Purchase Order`}
    >
      <div className="w-full mx-auto">
        <div className="bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100 transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h3 className="text-xl font-bold text-blue-600">
                  Purchase Order Details
                </h3>
                {loading && (
                  <div className="flex items-center text-sm text-blue-600">
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Processing...</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hasFormFields(formConfig) &&
                  formConfig.formFields
                    .filter((field: FormField) => {
                      // Show PoId only in edit mode
                      if (field.id === "PoId") {
                        return mode === "edit";
                      }
                      return true;
                    })
                    .map((field: FormField) => (
                      <div
                        key={field.id}
                        className={`transition-all duration-200 hover:shadow-md p-4 rounded-lg ${
                          field.type === "textarea" ? "md:col-span-3" : ""
                        }`}
                      >
                        {field.type === "dropdown" ? (
                          <div className="space-y-2">
                            <DropDown
                              FieldName={field.label}
                              IdName={field.id}
                              handleOptionChange={(fieldName, value) =>
                                field.id === "PurchaseRequisitionId"
                                  ? handlePRChange({
                                      target: { value },
                                    } as React.ChangeEvent<HTMLSelectElement>)
                                  : handleChange({
                                      target: { name: fieldName, value },
                                    } as React.ChangeEvent<HTMLSelectElement>)
                              }
                              values={
                                field.id === "PurchaseRequisitionId"
                                  ? formData.PurchaseRequisitionId || "" // This ensures the selected value is shown
                                  : getFieldStringValue(
                                      formData[
                                        field.id as keyof PurchaseOrderFormData
                                      ],
                                      field.id
                                    )
                              }
                              Options={
                                field.id === "PurchaseRequisitionId"
                                  ? purchaseRequisitions.map((pr) => ({
                                      label: `${pr.purchaseRequisitionId}`,
                                      value: pr.purchaseRequisitionId,
                                    }))
                                  : field.id === "SupplierId"
                                  ? suppliers.map((supplier) => ({
                                      label: supplier.vendorName,
                                      value: supplier.id.toString(),
                                    }))
                                  : field.options || []
                              }
                              Disabled={
                                (field.disabled === "edit" &&
                                  mode === "edit") ||
                                (field.id === "PurchaseRequisitionId" &&
                                  (mode === "edit" || loadingPRs))
                              }
                              required={field.required}
                            />
                            {((field.id === "PurchaseRequisitionId" &&
                              loadingPRs) ||
                              (field.id === "SupplierId" &&
                                loadingSuppliers)) && (
                              <div className="flex items-center text-sm text-blue-600">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                {field.id === "PurchaseRequisitionId"
                                  ? "Loading purchase requisitions..."
                                  : "Loading suppliers..."}
                              </div>
                            )}
                          </div>
                        ) : (
                          <InputField
                            FieldName={field.label}
                            IdName={field.id}
                            Type={field.type}
                            Name={field.id}
                            value={getFieldStringValue(
                              formData[field.id as keyof PurchaseOrderFormData]
                            )}
                            handleInputChange={(fieldName, value) =>
                              handleChange({
                                target: { name: fieldName, value },
                              } as React.ChangeEvent<HTMLInputElement>)
                            }
                            Disabled={
                              field.disabled === "edit" && mode === "edit"
                            }
                            required={field.required}
                          />
                        )}
                      </div>
                    ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 transition-all duration-200 hover:shadow-xl">
              <div className="flex items-center justify-between mb-6 border-b pb-2">
                <h3 className="text-xl font-bold text-blue-600">Items</h3>
                <span className="text-sm text-gray-500">
                  {formData.Items.length} item(s)
                </span>
              </div>
              {formData.Items.length > 0 ? (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <PurchaseItemsTable items={formData.Items} />
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="mt-4 text-gray-500">
                    No items added yet. Select a Purchase Requisition to add
                    items.
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Order"
                  : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default PurchaseOrderForm;
