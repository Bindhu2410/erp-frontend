import React, { useState, useEffect } from "react";

import { UOM } from "../../../../types/uom";

interface UOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (uom: UOM) => void;
  uom: UOM | null;
  existingUOMs: UOM[];
}

const UOMModal: React.FC<UOMModalProps> = ({
  isOpen,
  onClose,
  onSave,
  uom,
  existingUOMs,
}) => {
  const [formData, setFormData] = useState<UOM>({
    id: "",
    code: "",
    name: "",
    type: "Base",
    baseUOM: "",
    conversionFactor: undefined,
    status: "active",
    description: "",
  });

  const [errors, setErrors] = useState<{
    code?: string;
    name?: string;
    baseUOM?: string;
    conversionFactor?: string;
  }>({});

  // Initialize form with existing UOM data if editing
  useEffect(() => {
    if (uom) {
      setFormData({
        ...uom,
      });
    } else {
      setFormData({
        id: "",
        code: "",
        name: "",
        type: "Base",
        baseUOM: "",
        conversionFactor: undefined,
        status: "active",
        description: "",
      });
    }
  }, [uom]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for number inputs
    if (name === "conversionFactor") {
      setFormData({
        ...formData,
        [name]: value === "" ? undefined : parseFloat(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear the error for this field when it changes
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors: {
      code?: string;
      name?: string;
      baseUOM?: string;
      conversionFactor?: string;
    } = {};

    // Validate UOM Code
    if (!formData.code.trim()) {
      newErrors.code = "UOM Code is required";
      valid = false;
    } else if (
      existingUOMs.some(
        (item) =>
          item.code.toLowerCase() === formData.code.toLowerCase() &&
          item.id !== formData.id
      )
    ) {
      newErrors.code = "UOM Code already exists";
      valid = false;
    }

    // Validate UOM Name
    if (!formData.name.trim()) {
      newErrors.name = "UOM Name is required";
      valid = false;
    }

    // Validate Base UOM and Conversion Factor for Group type
    if (formData.type === "Group") {
      if (!formData.baseUOM) {
        newErrors.baseUOM = "Base UOM is required for Group type";
        valid = false;
      }

      if (!formData.conversionFactor && formData.conversionFactor !== 0) {
        newErrors.conversionFactor =
          "Conversion Factor is required for Group type";
        valid = false;
      } else if (
        formData.conversionFactor !== undefined &&
        formData.conversionFactor <= 0
      ) {
        newErrors.conversionFactor = "Conversion Factor must be greater than 0";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    }
  };

  // Get base UOM options (only UOMs with type 'Base')
  const baseUOMOptions = existingUOMs
    .filter((item) => item.type === "Base" && item.id !== formData.id)
    .map((item) => ({
      value: item.name,
      label: item.name,
    }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              {uom ? "Edit UOM" : "Add New UOM"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 grid grid-cols-2 gap-4">
            {/* UOM Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UOM Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter UOM code"
                maxLength={10}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-500">{errors.code}</p>
              )}
            </div>

            {/* UOM Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UOM Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter UOM name"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* UOM Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UOM Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Base">Base</option>
                <option value="Group">Group</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Base UOM - Only shown for Group type */}
            {formData.type === "Group" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base UOM <span className="text-red-500">*</span>
                </label>
                <select
                  name="baseUOM"
                  value={formData.baseUOM || ""}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.baseUOM ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select Base UOM</option>
                  {baseUOMOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.baseUOM && (
                  <p className="mt-1 text-xs text-red-500">{errors.baseUOM}</p>
                )}
              </div>
            )}

            {/* Conversion Factor - Only shown for Group type */}
            {formData.type === "Group" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conversion Factor <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  name="conversionFactor"
                  value={
                    formData.conversionFactor === undefined
                      ? ""
                      : formData.conversionFactor
                  }
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.conversionFactor
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter conversion factor"
                />
                {errors.conversionFactor && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.conversionFactor}
                  </p>
                )}
              </div>
            )}

            {/* Description - Full width */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter description (optional)"
              />
            </div>
          </div>

          {/* Modal Footer - Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {uom ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UOMModal;
