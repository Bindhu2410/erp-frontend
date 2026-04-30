import React from "react";
import Select, { MultiValue } from "react-select";
import { FiSearch } from "react-icons/fi";
import { TargetFilterState, Option } from "../../types/target";

interface TargetFiltersProps {
  filters: TargetFilterState;
  onFilterChange: (key: keyof TargetFilterState, value: MultiValue<Option>) => void;
  onDateChange: (key: "fromDate" | "toDate", value: string) => void;
  onApply: () => void;
  onReset: () => void;
  searchInput: string;
  setSearchInput: (value: string) => void;
  territoryOptions: Option[];
  employeeOptions: Option[];
  statusOptions: Option[];
}

const TargetFilters: React.FC<TargetFiltersProps> = ({
  filters,
  onFilterChange,
  onDateChange,
  onApply,
  onReset,
  searchInput,
  setSearchInput,
  territoryOptions,
  employeeOptions,
  statusOptions,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Filter Targets</h3>
          <p className="text-xs text-gray-500">Refine by territory, rep, status, date or search text</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 text-sm rounded-md bg-orange-500 text-white hover:bg-orange-600"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col w-full lg:w-72">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Doc ID, territory, employee, product"
              className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <FiSearch
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <div className="flex flex-col w-full md:w-60">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Territory
          </label>
          <Select
            isMulti
            value={filters.territory}
            onChange={(value) => onFilterChange("territory", value)}
            options={territoryOptions}
            classNamePrefix="react-select"
            placeholder="All territories"
          />
        </div>

        <div className="flex flex-col w-full md:w-60">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <Select
            isMulti
            value={filters.employee}
            onChange={(value) => onFilterChange("employee", value)}
            options={employeeOptions}
            classNamePrefix="react-select"
            placeholder="All sales reps"
          />
        </div>

        <div className="flex flex-col w-full md:w-60">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            isMulti
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            options={statusOptions}
            classNamePrefix="react-select"
            placeholder="All statuses"
          />
        </div>

        <div className="flex flex-col w-full sm:w-48">
          <label className="text-sm font-medium text-gray-700 mb-1">
            From
          </label>
          <input
            type="date"
            value={filters.fromDate || ""}
            onChange={(e) => onDateChange("fromDate", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="flex flex-col w-full sm:w-48">
          <label className="text-sm font-medium text-gray-700 mb-1">To</label>
          <input
            type="date"
            value={filters.toDate || ""}
            onChange={(e) => onDateChange("toDate", e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TargetFilters;

