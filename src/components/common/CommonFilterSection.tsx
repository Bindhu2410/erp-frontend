import React from "react";

export interface FilterField {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FilterConfig {
  fields: FilterField[];
  columns?: 2 | 3 | 4;
  showResetButton?: boolean;
  showSearchButton?: boolean;
}

export interface FilterValues {
  [key: string]: string;
}

export interface CommonFilterSectionProps {
  config: FilterConfig;
  filters: FilterValues;
  onFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSearch?: () => void;
  onResetFilters?: () => void;
}

const CommonFilterSection: React.FC<CommonFilterSectionProps> = ({
  config,
  filters,
  onFilterChange,
  onSearch,
  onResetFilters,
}) => {
  // Handle key press - search on Enter
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  // Get grid layout based on column count
  const getGridClass = () => {
    switch (config.columns) {
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className={`grid ${getGridClass()} gap-4`}>
        {config.fields.map((field) => (
          <div key={field.key} className="mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                name={field.key}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                value={filters[field.key] || ""}
                onChange={onFilterChange}
                onKeyPress={handleKeyPress}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                name={field.key}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
                placeholder={field.placeholder}
                value={filters[field.key] || ""}
                onChange={onFilterChange}
                onKeyPress={handleKeyPress}
              />
            )}
          </div>
        ))}
      </div>

      {/* Only show button section if there are buttons to display */}
      {(config.showResetButton || config.showSearchButton) && (
        <div className="flex justify-end mt-4 space-x-3">
          {config.showResetButton && onResetFilters && (
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
              onClick={onResetFilters}
              type="button"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>
          )}

          {config.showSearchButton && onSearch && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
              onClick={onSearch}
              type="button"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CommonFilterSection;
