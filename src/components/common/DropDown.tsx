import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import { RiRadarFill } from "react-icons/ri";
import { Field } from "../models/ViewModel";

interface Options {
  value: string;
  label: string;
}

interface DropDownProps {
  Options?: Options[];
  FieldName: string;
  setOption?: (value: string) => void;
  IdName: string;
  Disabled?: boolean;
  values?: string;
  TempForm?: boolean;
  handleOptionChange: (field: string, value: string) => void;
  required?: boolean;
  stageType?: boolean;
  addButton?: boolean;
  onFocus?: () => void;
}

const DropDown: React.FC<DropDownProps> = ({
  Options = [],
  FieldName,
  IdName,
  Disabled = false,
  setOption,
  values,
  TempForm = false,
  required = false,
  handleOptionChange,
  stageType = false,
  addButton = false,
  onFocus,
}) => {
  const [modal, setModal] = useState(false);

  const handleNavigate = () => {
    setModal(true);
  };

  const selectedOption =
    Options.find((option) => option.value === values) || null;

  const handleChange = (selected: SingleValue<Options>) => {
    const value = selected?.value || "";
    handleOptionChange(IdName, value);
    setOption?.(value);
  };
  useEffect(() => {
    console.log(Options, "Opt");
  }, []);

  return (
    <div
      className={`transition-transform transform hover:scale-105 ${
        TempForm ? "w-1/3" : "w-full"
      }`}
    >
      {!stageType && (
        <label
          htmlFor={IdName}
          className="block text-sm font-normal text-gray-900 dark:text-white mb-2"
        >
          {FieldName} {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <Select
        onMenuOpen={onFocus}
        options={Options}
        value={selectedOption}
        onChange={handleChange}
        isDisabled={Disabled}
        className="bg-gray-50 rounded-lg"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: "#d1d5db",
            borderRadius: "0.5rem",
            backgroundColor: "#F9FAFB",
          }),
          placeholder: (base) => ({
            ...base,
            color: "#6b7280",
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
          singleValue: (base, state) => ({
            ...base,
            color: "#111827",
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
          }),
          menuList: (base) => ({
            ...base,
            maxHeight: 300,
            overflowY: "auto",
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        menuPortalTarget={document.body}
      />
      {addButton && IdName === "contactName" && (
        <button
          onClick={handleNavigate}
          type="button"
          className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-orange-500 rounded-lg border border-orange-500 hover:bg-orange-800 focus:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-orange-700 dark:focus:ring-orange-800"
        >
          <RiRadarFill />
        </button>
      )}
    </div>
  );
};

export default DropDown;
