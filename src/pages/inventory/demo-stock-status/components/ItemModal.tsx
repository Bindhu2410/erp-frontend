import React, { useState, useEffect } from "react";

import formFields from "../json/formFields.json";
import FormField from "./FormField";

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Item) => void;
  item: Item | null;
  onAddCostComponent: () => void;
}

export interface Item {
  id: string;
  name: string;
  baseUom: string;
  itemType: string;
  trackingMethod: "lot" | "serial" | "none";
  demoEligible: boolean;
  status: "active" | "inactive";
  defaultSalePrice?: number;
  defaultPurchasePrice?: number;
  targetProfitMargin?: number;
  calculatedLandedCost?: number;
  description?: string;
  costComponents?: CostComponent[];
  notes?: string;
}

export interface CostComponent {
  id: string;
  category: string;
  calculationMethod: "fixed" | "percentage";
  value: number;
  effectiveDate: string;
}

const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  onAddCostComponent,
}) => {
  const [formData, setFormData] = useState<Partial<Item>>({
    id: "",
    name: "",
    baseUom: "",
    itemType: "",
    description: "",
    trackingMethod: "none",
    demoEligible: false,
    status: "active",
    defaultSalePrice: 0,
    defaultPurchasePrice: 0,
    targetProfitMargin: 0,
    calculatedLandedCost: 0,
    notes: "",
    costComponents: [],
  });

  // Set form data when item prop changes
  useEffect(() => {
    if (item) {
      setFormData(item);
    } else {
      // Reset form for new item
      setFormData({
        id: "",
        name: "",
        baseUom: "",
        itemType: "",
        description: "",
        trackingMethod: "none",
        demoEligible: false,
        status: "active",
        defaultSalePrice: 0,
        defaultPurchasePrice: 0,
        targetProfitMargin: 0,
        calculatedLandedCost: 0,
        notes: "",
        costComponents: [],
      });
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      if (name === "activeItem") {
        setFormData({
          ...formData,
          status: checkbox.checked ? "active" : "inactive",
        });
      } else {
        setFormData({
          ...formData,
          [name]: checkbox.checked,
        });
      }
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Item);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {item ? "Edit Item" : "Add New Item"}
          </h3>
          <button
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {/* Basic Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {formFields.item.basicInfo.map((field: any) => (
                <div
                  key={field.name}
                  className={
                    field.gridColumn === "span 2" ? "md:col-span-2" : ""
                  }
                >
                  <FormField
                    field={field}
                    value={formData[field.name as keyof Item] || ""}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>

            {/* Tracking Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {formFields.item.trackingInfo.map((field: any) => {
                if (field.type === "checkboxGroup") {
                  // For checkbox groups like flags
                  return (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="space-y-2">
                        {field.options?.map((option: any) => (
                          <div key={option.name} className="flex items-center">
                            <input
                              type="checkbox"
                              id={option.name}
                              name={
                                option.name === "activeItem"
                                  ? "activeItem"
                                  : option.name
                              }
                              checked={
                                option.name === "activeItem"
                                  ? formData.status === "active"
                                  : !!formData[option.name as keyof Item]
                              }
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label
                              htmlFor={option.name}
                              className="ml-2 text-sm text-gray-700"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={field.name}>
                    <FormField
                      field={field}
                      value={
                        formData[field.name as keyof Item] ||
                        field.defaultValue ||
                        ""
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                );
              })}
            </div>

            <hr className="my-6" />

            {/* Pricing Information */}
            <h5 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              Pricing Information
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {formFields.item.pricingInfo.map((field: any) => (
                <div key={field.name}>
                  <FormField
                    field={field}
                    value={formData[field.name as keyof Item] || 0}
                    onChange={handleInputChange}
                  />
                </div>
              ))}
            </div>

            {/* Cost Components Table */}
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">
                Cost Components
              </label>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onAddCostComponent}
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Cost Component
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-md overflow-hidden mb-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                      Cost Category
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                      Cost Amount
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                      Calculation Method
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {formData.costComponents &&
                  formData.costComponents.length > 0 ? (
                    formData.costComponents.map((component, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {component.category}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          ₹{component.value.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {component.calculationMethod}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800"
                            // Add edit functionality here
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-2 text-sm text-gray-500 text-center"
                      >
                        No cost components added
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
              Save Item
            </button>
            <button
              type="button"
              className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 py-2 px-4 rounded-md flex items-center gap-2 transition"
              onClick={onClose}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemModal;
