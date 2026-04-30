import React, { useRef, useState } from "react";
import { FaFileImport as Import } from "react-icons/fa";

// Add animation keyframes
const style = document.createElement("style");
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "tags" // for array of free-form values
  | "textarea"
  | "date"
  | "checkbox";

export interface DynamicFormField {
  name: string; // field name (label)
  id: string; // field id (key in data)
  type: FieldType;
  options?: { label: string; value: string | number }[]; // for select
  placeholder?: string;
  required?: boolean;
  helperText?: string; // Additional help text below the field
  error?: string; // Error message to display
  icon?: React.ReactNode; // Optional icon for the field
  disabled?: boolean; // Whether the field is disabled
}

export interface DynamicFormProps {
  fields: DynamicFormField[];
  data: Record<string, any>;
  onChange: (id: string, value: any) => void;
  onSubmit: (data: Record<string, any>) => void;
  submitLabel?: string;
  loading?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  onImport?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importLabel?: string;
  columns?: 1 | 2 | 3; // number of columns in the grid, default 1
}

// TagsInput component for free-form array input
const TagsInput: React.FC<{
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder }) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput("");
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
    inputRef.current?.focus();
  };

  return (
    <div className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, idx) => (
          <span
            key={tag + idx}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {tag}
            <button
              type="button"
              className="ml-1 inline-flex items-center p-0.5 hover:bg-blue-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => handleRemove(idx)}
              tabIndex={-1}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          className="flex-1 min-w-[120px] border-none bg-transparent outline-none py-1 text-sm placeholder-gray-400"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type and press Enter to add tags..."}
        />
      </div>
    </div>
  );
};

const DynamicForm: React.FC<DynamicFormProps> = ({
  fields,
  data,
  onChange,
  onSubmit,
  submitLabel = "Submit",
  loading,
  onCancel,
  cancelLabel = "Cancel",
  onImport,
  importLabel = "Import CSV",
  columns = 1,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleChange = (id: string, value: any) => {
    onChange(id, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  // Defensive: ensure data is always an object
  const safeData = data && typeof data === "object" ? data : {};
  // Responsive grid: 1 or 2 columns
  const gridClass =
    columns === 3
      ? "grid grid-cols-3 gap-4"
      : columns === 2
      ? "grid grid-cols-2 gap-4"
      : "space-y-4";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white rounded-lg shadow-sm p-6"
    >
      <div className={`${gridClass} mb-6`}>
        {fields.map((field) => {
          // Defensive: always provide a default value
          let value = safeData[field.id];
          if (field.type === "multiselect" || field.type === "tags") {
            value = Array.isArray(value) ? value : [];
          } else if (field.type === "checkbox") {
            value = !!value;
          } else {
            value = value ?? "";
          }
          // For checkboxes, don't use grid item styling
          const fieldClass =
            field.type === "checkbox"
              ? "flex items-center gap-2 col-span-full bg-gray-50 p-3 rounded"
              : "flex flex-col space-y-1.5";
          return (
            <div key={field.id} className={fieldClass}>
              {field.type === "checkbox" ? (
                <>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleChange(field.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {field.name}
                  </label>
                </>
              ) : (
                <label className="text-sm font-medium text-gray-700">
                  {field.name}
                  {field.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}

              {field.type === "select" ? (
                <div className="relative">
                  {field.icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {field.icon}
                      </span>
                    </div>
                  )}
                  <select
                    className={`
                      mt-1 block w-full py-2 ${
                        field.icon ? "pl-10" : "pl-3"
                      } pr-10
                      border border-gray-300 bg-white rounded-md shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      text-sm transition-all ease-in-out duration-150
                      ${
                        field.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                      ${field.disabled ? "bg-gray-50 cursor-not-allowed" : ""}
                      appearance-none
                    `}
                    value={value}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      handleChange(field.id, selectedId);
                    }}
                    required={field.required}
                    disabled={field.disabled}
                  >
                    <option value="" className="text-gray-400">
                      Select {field.name}
                    </option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {field.error && (
                    <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ) : field.type === "multiselect" ? (
                <select
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  multiple
                  value={value}
                  onChange={(e) => {
                    const selected = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    handleChange(field.id, selected);
                  }}
                  required={field.required}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none min-h-[100px]"
                  value={value}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : field.type === "tags" ? (
                <TagsInput
                  value={value}
                  onChange={(tags) => handleChange(field.id, tags)}
                  placeholder={field.placeholder}
                />
              ) : field.type !== "checkbox" ? (
                <div className="relative">
                  {field.icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {field.icon}
                      </span>
                    </div>
                  )}
                  <input
                    type={field.type}
                    className={`
                      mt-1 block w-full py-2 ${
                        field.icon ? "pl-10" : "pl-3"
                      } pr-3 
                      border border-gray-300 bg-white rounded-md shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      text-sm transition-colors ease-in-out duration-150
                      ${
                        field.error
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }
                      ${field.disabled ? "bg-gray-50 cursor-not-allowed" : ""}
                    `}
                    value={value}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    disabled={field.disabled}
                  />
                  {field.error && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        )}
        {onImport && (
          <div className="flex justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={onImport}
            />
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-md text-sm font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Import className="w-4 h-4" />
              {importLabel}
            </button>
          </div>
        )}
        <button
          type="submit"
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
            loading ? "opacity-75 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading && (
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;
