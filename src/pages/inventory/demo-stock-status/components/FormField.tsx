import React from "react";

interface Option {
  value: string;
  label: string;
  default?: boolean;
}

interface CheckboxOption {
  value: string;
  label: string;
}

interface FormFieldProps {
  field: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    placeholder?: string;
    prefix?: string;
    suffix?: string;
    options?: Option[];
    checkboxOptions?: CheckboxOption[];
    step?: string;
    min?: number;
    max?: number;
    rows?: number;
    readonly?: boolean;
    helpText?: string;
    dynamicHelpText?: Record<string, string>;
    defaultValue?: string | number | boolean;
  };
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  additionalInfo?: any;
}

const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  additionalInfo,
}) => {
  const {
    name,
    label,
    type,
    required = false,
    placeholder = "",
    prefix,
    suffix,
    options = [],
    step,
    min,
    max,
    rows = 3,
    readonly = false,
    helpText,
    dynamicHelpText,
  } = field;

  // Dynamic help text based on another field's value
  const currentHelpText =
    dynamicHelpText && additionalInfo
      ? dynamicHelpText[additionalInfo] || helpText
      : helpText;

  const renderField = () => {
    switch (type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "date":
        return (
          <div
            className={`relative ${
              prefix || suffix ? "flex rounded-md shadow-sm" : ""
            }`}
          >
            {prefix && (
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {prefix}
              </span>
            )}
            <input
              type={type}
              name={name}
              id={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              className={`block w-full ${
                prefix ? "rounded-r-md" : suffix ? "rounded-l-md" : "rounded-md"
              } border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                readonly ? "bg-gray-100" : ""
              }`}
              required={required}
              step={step}
              min={min}
              max={max}
              readOnly={readonly}
            />
            {suffix && (
              <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                {suffix}
              </span>
            )}
          </div>
        );

      case "textarea":
        return (
          <textarea
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            rows={rows}
            placeholder={placeholder}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required={required}
          />
        );

      case "select":
        return (
          <select
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required={required}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${name}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case "checkboxGroup":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={option.value}
                  name={option.value}
                  checked={value?.[option.value] || false}
                  onChange={onChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor={option.value}
                  className="ml-2 text-sm text-gray-700"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <p>Unsupported field type: {type}</p>;
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {currentHelpText && (
        <p className="mt-1 text-xs text-gray-500">{currentHelpText}</p>
      )}
    </div>
  );
};

export default FormField;
