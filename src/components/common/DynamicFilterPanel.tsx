import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSearch } from 'react-icons/fi';

interface Option {
  value: string | number;
  label: string;
}

interface Field {
  fieldName: string;
  id: string;
  type: 'text' | 'date' | 'dropdown' | 'decimal' | 'number' | 'textarea' | 'multiple';
  options?: string[];
  required?: boolean;
  URL?: string;
  placeholder?: string;
  multiple?: boolean;
  minValue?: number;
  maxValue?: number;
  defaultValue?: any;
}

interface FilterConfig {
  title?: string;
  fields: Field[];
}

interface DynamicFilterPanelProps {
  config: FilterConfig;
  onApplyFilters: (filters: Record<string, any>) => void;
  onResetFilters: () => void;
  initialFilters?: Record<string, any>;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const DynamicFilterPanel: React.FC<DynamicFilterPanelProps> = ({
  config,
  onApplyFilters,
  onResetFilters,
  initialFilters = {},
  showSearch = false,
  searchPlaceholder = 'Search...'
}) => {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [apiOptions, setApiOptions] = useState<Record<string, Option[]>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [searchInput, setSearchInput] = useState('');

  // Fetch options from API for dropdown fields with URLs
  useEffect(() => {
    const fetchOptions = async (field: Field) => {
      if (field.URL && !apiOptions[field.id]) {
        setIsLoading(prev => ({ ...prev, [field.id]: true }));
        try {
          const response = await axios.get(`http://localhost:5104/${field.URL}`);
          const options = response.data.map((item: any) => ({
            value: item[field.id],
            label: item[field.id]
          }));
          setApiOptions(prev => ({ ...prev, [field.id]: options }));
        } catch (error) {
          console.error(`Error fetching options for ${field.id}:`, error);
          toast.error(`Failed to load ${field.fieldName} options`);
        } finally {
          setIsLoading(prev => ({ ...prev, [field.id]: false }));
        }
      }
    };

    config.fields
      .filter(field => field.type === 'dropdown' && field.URL)
      .forEach(fetchOptions);
  }, [config.fields]);

  const handleFilterChange = (fieldId: string, value: any, isMultiple?: boolean) => {
    setFilters(prev => ({
      ...prev,
      [fieldId]: isMultiple ? value : value
    }));
  };

  const handleReset = () => {
    setFilters({});
    setSearchInput('');
    onResetFilters();
  };

  const handleApply = () => {
    const filterData = { ...filters };
    if (searchInput) {
      filterData.search = searchInput;
    }
    onApplyFilters(filterData);
  };

  const renderField = (field: Field) => {
    const fieldOptions: Option[] = field.URL
      ? apiOptions[field.id] || []
      : field.options?.map(opt => ({ value: opt, label: opt })) || [];

    switch (field.type) {
      case 'dropdown':
      case 'multiple':
        return (
          <Select
            isMulti={field.multiple}
            value={field.multiple 
              ? fieldOptions.filter(opt => filters[field.id]?.includes(opt.value))
              : fieldOptions.find(opt => opt.value === filters[field.id])}
            onChange={(selected: any) => {
              const value = field.multiple
                ? selected?.map((item: Option) => item.value) || []
                : selected?.value;
              handleFilterChange(field.id, value, field.multiple);
            }}
            options={fieldOptions}
            isLoading={isLoading[field.id]}
            className="min-w-[200px]"
            classNamePrefix="react-select"
            placeholder={field.placeholder || `Select ${field.fieldName}`}
            isClearable
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={filters[field.id] || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
          />
        );

      case 'decimal':
      case 'number':
        return (
          <input
            type="number"
            value={filters[field.id] || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
            min={field.minValue}
            max={field.maxValue}
            step={field.type === 'decimal' ? '0.01' : '1'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            placeholder={field.placeholder || `Enter ${field.fieldName}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={filters[field.id] || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            placeholder={field.placeholder || `Enter ${field.fieldName}`}
            rows={3}
          />
        );

      default:
        return (
          <input
            type="text"
            value={filters[field.id] || ''}
            onChange={(e) => handleFilterChange(field.id, e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            placeholder={field.placeholder || `Enter ${field.fieldName}`}
          />
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="text-lg font-semibold mb-4">{config.title || 'Filters'}</h3>
      
      <div className="flex flex-wrap gap-4">
        {showSearch && (
          <div className="flex flex-col w-full md:w-auto">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative min-w-[300px]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]"
              />
              <button
                onClick={handleApply}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiSearch size={20} />
              </button>
            </div>
          </div>
        )}

        {config.fields.map((field) => (
          <div key={field.id} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.fieldName}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <button
          onClick={handleReset}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
        >
          Reset Filters
        </button>
        <button
          onClick={handleApply}
          className="bg-[#FF6B35] text-white px-4 py-2 rounded hover:bg-[#FF8355] transition"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default DynamicFilterPanel;
