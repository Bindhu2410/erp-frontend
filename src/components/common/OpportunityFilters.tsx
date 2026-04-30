import React from "react";
import { MultiValue } from "react-select";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";

interface Option {
  value: string;
  label: string;
}

interface FilterState {
  territory: Option[];
  customerName: Option[];
  status: Option[];
  stage: Option[];
  opportunityType: Option[];
}

interface OpportunityFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: MultiValue<Option>) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  handleSearchClick?: () => void;
  options: {
    statusOptions: Option[];
  };
  searchInput?: string;
  setSearchInput: (value: string) => void;
}

const OpportunityFilters: React.FC<OpportunityFiltersProps> = ({
  filters,
  onFilterChange,
  options,
  handleApplyFilters,
  handleResetFilters,
  handleSearchClick,
  searchInput = "",
  setSearchInput,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter By</h3>
      <div className="flex flex-wrap gap-4">
        {/* Search by Name */}
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative min-w-[300px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Name, Customer Name, Territory"
              className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]"
            />
            <button
              onClick={handleSearchClick}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </div>

        {/* Opportunity Type */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Opportunity Type
          </label>
          <Select
            isMulti
            value={filters.opportunityType}
            onChange={(value) => onFilterChange("opportunityType", value)}
            options={options.opportunityTypeOptions}
            className="w-52"
            classNamePrefix="react-select"
            placeholder="All Types"
          />
        </div> */}

        {/* Status */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            isMulti
            value={filters.status}
            onChange={(value) => onFilterChange("status", value)}
            options={options.statusOptions}
            className="w-52"
            classNamePrefix="react-select"
            placeholder="All Statuses"
          />
        </div>

        {/* Stage */}
        {/* <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Stage
          </label>
          <Select
            isMulti
            value={filters.stage}
            onChange={(value) => onFilterChange("stage", value)}
            options={options.stageOptions}
            className="w-52"
            classNamePrefix="react-select"
            placeholder="All Stages"
          />
        </div> */}
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={handleResetFilters}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApplyFilters}
          className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#FF8355] transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default OpportunityFilters;
