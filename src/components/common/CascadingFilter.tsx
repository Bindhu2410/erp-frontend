import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../../services/api';

interface FilterOption {
  value: string | number;
  label: string;
}

interface CascadingFilterProps {
  onFilterChange: (filters: {
    makeId?: string | number;
    modelId?: string | number;
    productId?: string | number;
  }) => void;
  className?: string;
}

const CascadingFilter: React.FC<CascadingFilterProps> = ({
  onFilterChange,
  className = '',
}) => {
  const [makeOptions, setMakeOptions] = useState<FilterOption[]>([]);
  const [modelOptions, setModelOptions] = useState<FilterOption[]>([]);
  const [productOptions, setProductOptions] = useState<FilterOption[]>([]);
  
  const [selectedMake, setSelectedMake] = useState<FilterOption | null>(null);
  const [selectedModel, setSelectedModel] = useState<FilterOption | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FilterOption | null>(null);
  
  const [loading, setLoading] = useState({
    make: false,
    model: false,
    product: false,
  });

  // Fetch Make options on component mount
  useEffect(() => {
    fetchMakeOptions();
  }, []);

  const fetchMakeOptions = async () => {
    setLoading(prev => ({ ...prev, make: true }));
    try {
      const response = await api.get('Make');
      const options = response.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || [];
      setMakeOptions(options);
    } catch (error) {
      console.error('Error fetching Make options:', error);
      setMakeOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, make: false }));
    }
  };

  const fetchModelOptions = async (makeId: string | number) => {
    setLoading(prev => ({ ...prev, model: true }));
    try {
      // First try to get models filtered by make if the API supports it
      let response;
      try {
        response = await api.get(`Model/by-make/${makeId}`);
      } catch (error) {
        // Fallback: get all models and filter client-side
        response = await api.get('Model');
      }
      
      let options = response.data?.map((item: any) => ({
        value: item.id,
        label: item.name,
      })) || [];
      
      setModelOptions(options);
    } catch (error) {
      console.error('Error fetching Model options:', error);
      setModelOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, model: false }));
    }
  };

  const fetchProductOptions = async (makeId?: string | number, modelId?: string | number) => {
    setLoading(prev => ({ ...prev, product: true }));
    try {
      // Try to get products filtered by make and/or model if the API supports it
      let endpoint = 'ItemMaster';
      const params = new URLSearchParams();
      
      if (makeId) params.append('makeId', makeId.toString());
      if (modelId) params.append('modelId', modelId.toString());
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      let response: any;
      try {
        response = await api.get(endpoint);
      } catch (error) {
        // Fallback: get all products and filter client-side
        response = await api.get('ItemMaster');
      }
      
      let options = response.data?.map((item: any) => ({
        value: item.id,
        label: item.product || item.itemName || `Item ${item.id}`,
      })) || [];
      
      // Client-side filtering if API doesn't support server-side filtering
      if (makeId || modelId) {
        const makeData = makeOptions.find(m => m.value === makeId);
        const modelData = modelOptions.find(m => m.value === modelId);
        
        options = options.filter((option: any) => {
          const productData = response.data.find((item: any) => item.id === option.value);
          let matchesMake = !makeId;
          let matchesModel = !modelId;
          
          if (makeId && productData?.make && makeData) {
            matchesMake = productData.make.toLowerCase() === makeData.label.toLowerCase();
          }
          
          if (modelId && productData?.model && modelData) {
            matchesModel = productData.model.toLowerCase() === modelData.label.toLowerCase();
          }
          
          return (!makeId || matchesMake) && (!modelId || matchesModel);
        });
      }
      
      setProductOptions(options);
    } catch (error) {
      console.error('Error fetching Product options:', error);
      setProductOptions([]);
    } finally {
      setLoading(prev => ({ ...prev, product: false }));
    }
  };

  // Handle Make selection
  const handleMakeChange = (option: FilterOption | null) => {
    setSelectedMake(option);
    setSelectedModel(null);
    setSelectedProduct(null);
    setModelOptions([]);
    setProductOptions([]);
    
    if (option) {
      fetchModelOptions(option.value);
      fetchProductOptions(option.value);
    }
    
    onFilterChange({
      makeId: option?.value,
      modelId: undefined,
      productId: undefined,
    });
  };

  // Handle Model selection
  const handleModelChange = (option: FilterOption | null) => {
    setSelectedModel(option);
    setSelectedProduct(null);
    setProductOptions([]);
    
    if (option && selectedMake) {
      fetchProductOptions(selectedMake.value, option.value);
    }
    
    onFilterChange({
      makeId: selectedMake?.value,
      modelId: option?.value,
      productId: undefined,
    });
  };

  // Handle Product selection
  const handleProductChange = (option: FilterOption | null) => {
    setSelectedProduct(option);
    
    onFilterChange({
      makeId: selectedMake?.value,
      modelId: selectedModel?.value,
      productId: option?.value,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedProduct(null);
    setModelOptions([]);
    setProductOptions([]);
    onFilterChange({});
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

  return (
    <div className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Clear All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Make Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Make
          </label>
          <Select
            value={selectedMake}
            onChange={handleMakeChange}
            options={makeOptions}
            placeholder="Select Make..."
            isClearable
            isLoading={loading.make}
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Model Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model
          </label>
          <Select
            value={selectedModel}
            onChange={handleModelChange}
            options={modelOptions}
            placeholder="Select Model..."
            isClearable
            isLoading={loading.model}
            isDisabled={!selectedMake}
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>

        {/* Product Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <Select
            value={selectedProduct}
            onChange={handleProductChange}
            options={productOptions}
            placeholder="Select Product..."
            isClearable
            isLoading={loading.product}
            isDisabled={!selectedMake}
            styles={customSelectStyles}
            className="text-sm"
          />
        </div>
      </div>
      
      {/* Filter Summary */}
      {(selectedMake || selectedModel || selectedProduct) && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Active Filters: </span>
            {selectedMake && <span className="mr-2">Make: {selectedMake.label}</span>}
            {selectedModel && <span className="mr-2">Model: {selectedModel.label}</span>}
            {selectedProduct && <span className="mr-2">Product: {selectedProduct.label}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadingFilter;