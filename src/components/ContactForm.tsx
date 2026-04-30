import React, { useState } from "react";
import contactInfojson from "../pages/configs/lead/contactInfo.json";
import { ContactField, ContactFormProps } from "../types/contact";
import Select from "react-select";
import { toast } from "react-toastify";

interface Option {
  label: string;
  value: string;
}

const ContactForm: React.FC<ContactFormProps> = ({
  onSave,
  onClose,
  initialData = {},
  stageid,
  type,
}) => {
  const initializeFormData = () => {
    const data: Record<string, any> = { ...initialData };

    contactInfojson.fields.forEach((field) => {
      if (field.type === "multiselect") {
        const rawValue = data[field.id];
        if (typeof rawValue === "string") {
          const selectedValues = rawValue.split(",").map((val) => val.trim());
          data[field.id] = selectedValues.map((val) => ({
            label: val,
            value: val,
          }));
        }
      }
    });

    return data;
  };

  const [formData, setFormData] = useState<Record<string, any>>(
    initializeFormData()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time validation function
  const validateField = (field: ContactField, value: any): string => {
    const fieldName = field.fieldName.toLowerCase();

    if (!value || value.toString().trim() === "") {
      if (field.required) {
        return `${field.fieldName} is required`;
      }
      return "";
    }

    const valueStr = value.toString();

    // Email validation
    if (field.type === "email" || fieldName.includes("email")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(valueStr)) {
        return "Please enter a valid email address";
      }
    }

    // Telephone field validation
    if (
      field.type === "tel" ||
      fieldName.includes("phone") ||
      fieldName.includes("mobile") ||
      fieldName.includes("landline") ||
      fieldName.includes("fax")
    ) {
      const cleanValue = valueStr.replace(/\D/g, "");
      if (cleanValue.length > 0) {
        if (cleanValue.length < 10) {
          return "Please enter exactly 10 digits for phone number";
        } else if (cleanValue.length > 10) {
          return "Phone number cannot exceed 10 digits";
        } else if (!/^[0-9]{10}$/.test(cleanValue)) {
          return "Please enter a valid 10-digit phone number (numbers only)";
        }
      }
    }

    // Minimum character validation for names
    if (fieldName.includes("name") && !fieldName.includes("username")) {
      if (valueStr.length < 2) {
        return `${field.fieldName} must be at least 2 characters long`;
      }
    }

    // Address validation
    if (fieldName.includes("address")) {
      if (valueStr.length < 5) {
        return `${field.fieldName} must be at least 5 characters long`;
      }
    }

    return "";
  };

  const handleInputChange = (field: ContactField, value: any) => {
    const id = field.id;

    if (field.type === "multiselect") {
      setFormData((prev) => ({ ...prev, [id]: value || [] }));

      // Real-time validation for multiselect
      const validationError = validateField(field, value);
      if (validationError) {
        setErrors((prev) => ({ ...prev, [id]: validationError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    } else if (field.type === "select") {
      const selectedValue = value?.value || "";
      setFormData((prev) => ({ ...prev, [id]: selectedValue }));

      // Real-time validation for select
      const validationError = validateField(field, selectedValue);
      if (validationError) {
        setErrors((prev) => ({ ...prev, [id]: validationError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    } else if (field.type === "tel") {
      // Filter out non-numeric characters and limit to 10 digits
      const sanitized = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [id]: sanitized }));

      // Real-time validation for telephone fields
      const validationError = validateField(field, sanitized);
      if (validationError) {
        setErrors((prev) => ({ ...prev, [id]: validationError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));

      // Real-time validation for other field types
      const validationError = validateField(field, value);
      if (validationError) {
        setErrors((prev) => ({ ...prev, [id]: validationError }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[id];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    contactInfojson.fields.forEach((field) => {
      const fieldId = field.id;
      const value = formData[fieldId];

      // Use the centralized validation function
      const validationError = validateField(field, value);
      if (validationError) {
        newErrors[fieldId] = validationError;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const processedData = { ...formData };

      contactInfojson.fields.forEach((field) => {
        if (
          field.type === "multiselect" &&
          Array.isArray(processedData[field.id])
        ) {
          processedData[field.id] = processedData[field.id]
            .map((opt: Option) => opt.value)
            .join(",");
        }
      });

      if (processedData.ownClinic === "Yes") {
        processedData.ownClinic = true;
      } else if (processedData.ownClinic === "No") {
        processedData.ownClinic = false;
      }

      const { title, fields, ...dataToSend } = processedData;

      const isEdit = Boolean(dataToSend.id);
      const url = isEdit
        ? `http://localhost:5104/api/SalesContact/${dataToSend.id}`
        : "http://localhost:5104/api/SalesContact";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...dataToSend,
          UserCreated: 1,
          UserUpdated: 1,
          salesLeadId: Number(stageid),
        }),
      });

      if (!response.ok) throw new Error("Failed to save contact.");

      let result;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      }

      // Show toast only if onSave is not provided (component is used standalone)
      if (!onSave) {
        toast.success(
          isEdit
            ? "Contact updated successfully! ✏️"
            : "Contact saved successfully! 🧾"
        );
      }

      // Format the data before passing it to onSave
      const formattedData = {
        ...dataToSend,
        id: isEdit ? dataToSend.id : result?.id || result,
      };

      if (onSave) {
        onSave(formattedData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving contact.");
    }
  };

  const renderField = (field: ContactField) => {
    const fieldId = field.id;

    if (field.type === "multiselect") {
      const options =
        field.options?.map((opt) => ({ value: opt, label: opt })) || [];
      const value = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];

      return (
        <Select
          isMulti
          id={fieldId}
          value={value}
          onChange={(selected) => handleInputChange(field, selected)}
          options={options}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder={`Select ${field.fieldName}`}
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
              "&:hover": { borderColor: "#3b82f6" },
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                ? "#e0e7ff"
                : "#fff",
              color: state.isSelected ? "#fff" : "#111827",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#e0e7ff",
              color: "#111827",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "#111827",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "#111827",
              "&:hover": {
                backgroundColor: "#dc2626",
                color: "#fff",
              },
            }),
          }}
        />
      );
    }

    if (field.type === "select") {
      const options =
        field.options?.map((opt) => ({ value: opt, label: opt })) || [];
      const rawValue = formData[fieldId];
      let value = null;

      if (fieldId === "ownClinic") {
        const stringVal =
          rawValue === true ? "Yes" : rawValue === false ? "No" : rawValue;
        value = options.find((opt) => opt.value === stringVal);
      } else {
        value = options.find((opt) => opt.value === rawValue);
      }
      return (
        <Select
          id={fieldId}
          value={value}
          onChange={(selected) => handleInputChange(field, selected)}
          options={options}
          className="react-select-container"
          classNamePrefix="react-select"
          placeholder={`Select ${field.fieldName}`}
          isClearable
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
              "&:hover": { borderColor: "#3b82f6" },
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                ? "#e0e7ff"
                : "#fff",
              color: state.isSelected ? "#fff" : "#111827",
            }),
            singleValue: (base) => ({
              ...base,
              color: "#111827",
            }),
          }}
        />
      );
    }

    const inputType =
      field.type === "email"
        ? "email"
        : field.type === "tel"
        ? "tel"
        : field.type === "date"
        ? "date"
        : "text";

    return (
      <input
        type={inputType}
        id={fieldId}
        value={formData[fieldId] || ""}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`w-full border ${
          errors[fieldId] ? "border-red-500" : "border-gray-300"
        } rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
        placeholder={`Enter ${field.fieldName}`}
      />
    );
  };

  return (
    <div className="bg-white   p-2 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Add Contact Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contactInfojson.fields.map((field) => (
          <div
            key={field.id}
            className={field.type === "multiselect" ? "col-span-2" : ""}
          >
            <label className="block text-sm font-medium mb-1">
              {field.fieldName}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Contact
        </button>
      </div>
    </div>
  );
};

export default ContactForm;
