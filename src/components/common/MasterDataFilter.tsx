import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../../services/api';

interface FilterOption {
  value: string | number;
  label: string;
}

interface MasterDataFilterProps {
  onFilterChange: (filters: {
    makeId?: string | number;
    modelId?: string | number;
    productId?: string | number;
    makeText?: string;
    modelText?: string;
    productText?: string;
    categoryId?: string | number;
    groupId?: string | number;
  }) => void;
  className?: string;
  showAdvancedFilters?: boolean;
}

const MasterDataFilter: React.FC<MasterDataFilterProps> = ({
  onFilterChange,
  className = '',
  showAdvancedFilters = true,
}) => {
  // Options for dropdowns
  const [makeOptions, setMakeOptions] = useState<FilterOption[]>([]);
  const [modelOptions, setModelOptions] = useState<FilterOption[]>([]);
  const [productOptions, setProductOptions] = useState<FilterOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<FilterOption[]>([]);
  const [groupOptions, setGroupOptions] = useState<FilterOption[]>([]);
  
  // Selected values
  const [selectedMake, setSelectedMake] = useState<FilterOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<FilterOption | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FilterOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FilterOption | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<FilterOption | null>(null);
  
  // Text-based filters for cases where Make/Model/Product are stored as text
  const [makeText, setMakeText] = useState('');
  const [modelText, setModelText] = useState('');
  const [productText, setProductText] = useState('');
  
  const [loading, setLoading] = useState({
    make: false,
    model: false,
    product: false,
    category: false,
    group: false,
  });

  // Fetch all master data on component mount
  useEffect(() => {
    fetchAllMasterData();
  }, []);

  const fetchAllMasterData = async () => {
    try {
      // Fetch all master data in parallel
      const [makeRes, modelRes, categoryRes, groupRes] = await Promise.all([
        api.get('Make').catch(() => ({ data: [] })),
        api.get('Model').catch(() => ({ data: [] })),
        api.get('Category').catch(() => ({ data: [] })),
        api.get('InventoryGroup').catch(() => ({ data: [] })),
      ]);

      setMakeOptions(makeRes.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || []);

      setModelOptions(modelRes.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || []);

      setCategoryOptions(categoryRes.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || []);

      setGroupOptions(groupRes.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || []);

    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  // Fetch products based on current filters
  const fetchFilteredProducts = async () => {
    setLoading(prev => ({ ...prev, product: true }));
    try {
      const response = await api.get('ItemMaster');
      let options = response.data?.map((item: any) => ({
        value: item.id,
        label: item.product || item.itemName || `Item ${item.id}`,
        data: item, // Store full item data for filtering
      })) || [];

      // Apply client-side filtering based on current selections
      if (selectedMake || selectedModel || selectedCategory || selectedGroup || makeText || modelText) {
        options = options.filter((option: any) => {
          const item = option.data;
          let matches = true;

          // Filter by Make (ID or text)
          if (selectedMake) {
            matches = matches && (
              item.makeId === selectedMake.value ||
              (item.make && item.make.toLowerCase() === selectedMake.label.toLowerCase())
            );
          }
          if (makeText && !selectedMake) {
            matches = matches && item.make && item.make.toLowerCase().includes(makeText.toLowerCase());
          }

          // Filter by Model (ID or text)
          if (selectedModel && matches) {
            matches = matches && (
              item.modelId === selectedModel.value ||
              (item.model && item.model.toLowerCase() === selectedModel.label.toLowerCase())
            );
          }
          if (modelText && !selectedModel && matches) {
            matches = matches && item.model && item.model.toLowerCase().includes(modelText.toLowerCase());
          }

          // Filter by Category
          if (selectedCategory && matches) {
            matches = matches && item.categoryId === selectedCategory.value;
          }

          // Filter by Group
          if (selectedGroup && matches) {
            matches = matches && item.groupId === selectedGroup.value;
          }

          return matches;
        });
      }

      setProductOptions(options);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, product: false }));
    }
  };

  // Update products when filters change
  useEffect(() => {
    fetchFilteredProducts();
  }, [selectedMake, selectedModel, selectedCategory, selectedGroup, makeText, modelText]);

  // Handle filter changes and notify parent
  const notifyFilterChange = () => {
    onFilterChange({
      makeId: selectedMake?.value,
      modelId: selectedModel?.value,
      productId: selectedProduct?.value,
      categoryId: selectedCategory?.value,
      groupId: selectedGroup?.value,
      makeText: makeText || undefined,
      modelText: modelText || undefined,
      productText: productText || undefined,
    });
  };

  // Update parent when any filter changes
  useEffect(() => {
    notifyFilterChange();
  }, [selectedMake, selectedModel, selectedProduct, selectedCategory, selectedGroup, makeText, modelText, productText]);

  // Clear all filters
  const clearFilters = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedProduct(null);
    setSelectedCategory(null);
    setSelectedGroup(null);
    setMakeText('');
    setModelText('');
    setProductText('');
    setProductOptions([]);
  };

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '38px',
      borderColor: '#d1d5db',
      '&:hover': {
        borderColor: '#9ca3af',
      },
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
    }),
  };

  const hasActiveFilters = selectedMake || selectedModel || selectedProduct || selectedCategory || selectedGroup || makeText || modelText || productText;

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
          disabled={!hasActiveFilters}
        >
          Clear All
        </button>
      </div>
      
      {/* Primary Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <Select
            value={selectedMake}
            onChange={(option) => {
              setSelectedMake(option);
              setSelectedModel(null); // Reset dependent filters
              setSelectedProduct(null);
              setMakeText(''); // Clear text filter when dropdown is used
            }}
            options={makeOptions}
            placeholder="Select Make..."
            isClearable
            isLoading={loading.make}
            styles={customSelectStyles}
            className="text-sm"
          />
          {/* Text input for Make (alternative to dropdown) */}
          <input
            type="text"
            placeholder="Or type Make name..."
            value={makeText}
            onChange={(e) => {
              setMakeText(e.target.value);
              if (e.target.value) {
                setSelectedMake(null); // Clear dropdown when typing
              }
            }}
            className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <Select
            value={selectedModel}
            onChange={(option) => {
              setSelectedModel(option);
              setSelectedProduct(null); // Reset dependent filters
              setModelText(''); // Clear text filter when dropdown is used
            }}
            options={modelOptions}
            placeholder="Select Model..."
            isClearable
            isLoading={loading.model}
            styles={customSelectStyles}
            className="text-sm"
          />
          {/* Text input for Model (alternative to dropdown) */}
          <input
            type="text"
            placeholder="Or type Model name..."
            value={modelText}
            onChange={(e) => {
              setModelText(e.target.value);
              if (e.target.value) {
                setSelectedModel(null); // Clear dropdown when typing
              }
            }}
            className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <Select
            value={selectedProduct}
            onChange={(option) => {
              setSelectedProduct(option);
              setProductText(''); // Clear text filter when dropdown is used
            }}
            options={productOptions}
            placeholder="Select Product..."
            isClearable
            isLoading={loading.product}
            styles={customSelectStyles}
            className="text-sm"
          />
          {/* Text input for Product (alternative to dropdown) */}
          <input
            type="text"
            placeholder="Or type Product name..."
            value={productText}
            onChange={(e) => {
              setProductText(e.target.value);
              if (e.target.value) {
                setSelectedProduct(null); // Clear dropdown when typing
              }
            }}
            className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={categoryOptions}
              placeholder="Select Category..."
              isClearable
              isLoading={loading.category}
              styles={customSelectStyles}
              className="text-sm"
            />
          </div>

          {/* Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inventory Group
            </label>
            <Select
              value={selectedGroup}
              onChange={setSelectedGroup}
              options={groupOptions}
              placeholder="Select Group..."
              isClearable
              isLoading={loading.group}
              styles={customSelectStyles}
              className="text-sm"
            />
          </div>
        </div>
      )}
      
      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Active Filters: </span>
            {selectedMake && <span className="mr-2">Make: {selectedMake.label}</span>}
            {makeText && <span className="mr-2">Make: "{makeText}"</span>}
            {selectedModel && <span className="mr-2">Model: {selectedModel.label}</span>}
            {modelText && <span className="mr-2">Model: "{modelText}"</span>}
            {selectedProduct && <span className="mr-2">Product: {selectedProduct.label}</span>}
            {productText && <span className="mr-2">Product: "{productText}"</span>}
            {selectedCategory && <span className="mr-2">Category: {selectedCategory.label}</span>}
            {selectedGroup && <span className="mr-2">Group: {selectedGroup.label}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataFilter;