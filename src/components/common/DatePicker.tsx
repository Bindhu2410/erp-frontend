import React from "react";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  FieldName: string;
  required?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  FieldName,
  required,
}) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {FieldName} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          min={today}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          hover:border-blue-400 transition-all duration-200 cursor-pointer text-gray-700 
          appearance-none"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
