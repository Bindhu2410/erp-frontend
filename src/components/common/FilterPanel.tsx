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
  zone: Option[];
  customerName: Option[];
  status: Option[];
  score: Option[];
  leadType: Option[];
}

interface LeadFiltersProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: MultiValue<Option>) => void;
  handleApplyFilters: () => void;
  handleResetFilters: () => void;
  handleSearchClick?: () => void;
  options: {
    statusOptions: Option[];
    leadTypeOptions?: Option[];
    sourceOptions?: Option[];
    interestLevelOptions?: Option[];
    assignedToOptions?: Option[];
    customerNameOptions?: Option[];
  };
  searchInput?: string;
  onSearchInputChange?: (value: string) => void;
  setSearchInput: (value: string) => void;
  // Order ID filter props (optional)
  orderIdFilter?: string;
  setOrderIdFilter?: (value: string) => void;
  showOrderIdFilter?: boolean;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onFilterChange,
  options,
  handleApplyFilters,
  handleResetFilters,
  handleSearchClick,
  searchInput = "",
  onSearchInputChange,
  setSearchInput,
  orderIdFilter = "",
  setOrderIdFilter,
  showOrderIdFilter = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter By</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative min-w-[300px]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by Name, Customer Name , Area, Email, Territory"
              name="Search by Name, Customer Name , Area, Email, Territory"
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

        {/* Order ID Filter - Only show if enabled */}
        {showOrderIdFilter && setOrderIdFilter && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
                placeholder="Enter Order ID"
                className="w-52 pl-4 pr-8 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]"
              />
              {orderIdFilter && (
                <button
                  onClick={() => setOrderIdFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear Order ID"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Customer Name Filter - Only show if options are provided */}
        {options.customerNameOptions && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <Select
              isMulti
              value={filters.customerName}
              onChange={(value) => onFilterChange("customerName", value)}
              options={options.customerNameOptions}
              className="w-52"
              classNamePrefix="react-select"
              placeholder="All Customers"
            />
          </div>
        )}

        {/* Lead Type Filter - Only show if options are provided */}
        {options.leadTypeOptions && (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Lead Type
            </label>
            <Select
              isMulti
              value={filters.leadType}
              onChange={(value) => onFilterChange("leadType", value)}
              options={options.leadTypeOptions}
              className="w-52"
              classNamePrefix="react-select"
              placeholder="All Lead Types"
            />
          </div>
        )}

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

export default LeadFilters;
