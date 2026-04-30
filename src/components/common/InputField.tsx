import React, { useEffect, useState } from "react";

interface InputFieldProps {
  FieldName: string;
  IdName: string;
  Type: string;
  Disabled?: boolean;
  readonly?: boolean;
  value?: string;
  TempForm?: boolean;
  Name?: string;
  handleInputChange: (field: string, value: string) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  FieldName,
  IdName,
  Name,
  Type,
  Disabled = false,
  readonly = false,
  value = "",
  TempForm = false,
  handleInputChange,
  required = false,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);
      handleInputChange(IdName, value);
    }
  }, [value]);

  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value);

      handleInputChange(IdName, value);
    }
  }, [value]);

  const handleInputChangeLocal = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    handleInputChange(IdName, newValue);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (Type === "tel" && (Name === "Mobile" || Name === "Phone")) {
      if (
        e.key &&
        /\D/.test(e.key) &&
        e.key !== "Backspace" &&
        e.key !== "Tab"
      ) {
        e.preventDefault();
      }
    }
  };

  return (
    <div
      className={`${
        TempForm ? "flex items-center gap-4 mb-4 " : ""
      } hover:border-blue-500 hover:dark:focus:ring-blue-500  transition-transform transform hover:scale-105`}
    >
      <label
        htmlFor={IdName}
        className={`block mb-2 text-sm font-normal text-gray-900 dark:text-white ${
          TempForm ? "lg:w-[10%] sm:w-[20%]" : ""
        }`}
      >
        {FieldName} {required && <span className="text-red-500"> *</span>}
      </label>

      {Type === "textarea" ? (
        <textarea
          name={Name}
          id={IdName}
          value={value}
          onChange={(e) => handleInputChange(IdName, e.target.value)}
          required={required}
          disabled={Disabled}
          readOnly={readonly}
          rows={4}
          className={`block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-orange-500 dark:focus:ring-orange-500 ${
            Disabled || readonly
              ? "bg-gray-200 cursor-not-allowed opacity-70 dark:bg-gray-800"
              : "bg-gray-50"
          }`}
        />
      ) : (
        <input
          type={Type}
          name={Name}
          id={IdName}
          value={value}
          onChange={(e) => handleInputChange(IdName, e.target.value)}
          required={required}
          disabled={Disabled}
          readOnly={readonly}
          className={`block w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-orange-500 dark:focus:ring-orange-500 ${
            Type === "email" ? "email-field" : ""
          } ${
            Disabled || readonly
              ? "bg-gray-200 cursor-not-allowed opacity-70 dark:bg-gray-800"
              : "bg-gray-50"
          }`}
        />
      )}
    </div>
  );
};

export default InputField;
