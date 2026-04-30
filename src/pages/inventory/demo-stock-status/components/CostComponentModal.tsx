import React, { useState, useEffect } from "react";

import FormField from "./FormField";
import formFields from "../json/formFields.json";

interface CostComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (costComponent: CostComponent) => void;
  costComponent: CostComponent | null;
}
export interface CostComponent {
  id: string;
  category: string;
  calculationMethod: "fixed" | "percentage";
  value: number;
  effectiveDate: string;
}

// Extended form data interface that includes additional fields not in CostComponent
interface FormDataType extends CostComponent {
  endDate?: string;
  notes?: string;
}

const CostComponentModal: React.FC<CostComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  costComponent,
}) => {
  const [formData, setFormData] = useState<FormDataType>({
    id: "",
    category: "",
    calculationMethod: "fixed",
    value: 0,
    effectiveDate: new Date().toISOString().split("T")[0],
    endDate: "",
    notes: "",
  });

  // Set form data when costComponent prop changes
  useEffect(() => {
    if (costComponent) {
      setFormData({
        ...costComponent,
        endDate: "",
        notes: "",
      });
    } else {
      // Reset form for new cost component
      setFormData({
        id: "",
        category: "",
        calculationMethod: "fixed",
        value: 0,
        effectiveDate: new Date().toISOString().split("T")[0],
        endDate: "",
        notes: "",
      });
    }
  }, [costComponent]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
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
    // Omit the extra fields before saving
    const { endDate, notes, ...costComponentData } = formData;
    onSave(costComponentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {costComponent ? "Edit Cost Component" : "Add Cost Component"}
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
            {formFields.costComponent.fields.map((field: any) => (
              <FormField
                key={field.name}
                field={field}
                value={formData[field.name as keyof FormDataType] || ""}
                onChange={handleInputChange}
                additionalInfo={
                  field.dynamicHelpText ? formData.calculationMethod : undefined
                }
              />
            ))}
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
              Save Cost Component
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

export default CostComponentModal;
