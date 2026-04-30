import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Field, BusinessChallengeFormProps } from '../types/businessChallenge';
import businessChallengeJson from '../pages/configs/lead/businessChallenges.json';
import axios from 'axios';
import { toast } from 'react-toastify';
interface ApiProductItem {
  productName: string;
  [key: string]: any;
}

type SelectOption = { value: string; label: string };

const BusinessChallengesForm: React.FC<BusinessChallengeFormProps> = ({
  onSave,
  onClose,
  initialData = {},
  stageid,
  type,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, SelectOption[]>>({});

  const getFieldId = (field: Field) => field.id || '';

  useEffect(() => {
    const fetchOptions = async () => {
      const optionsMap: Record<string, SelectOption[]> = {};

      for (const section of businessChallengeJson.fields) {
        for (const field of section.fields) {
          if (field.type === 'multiselect' && 'URL' in field && field.URL) {
            try {
              const response = await axios.get<ApiProductItem[]>(`${process.env.REACT_APP_API_BASE_URL}/${field.URL}`);
              
              const uniqueProductNames = Array.from(
                new Set(response.data.map((item) => item.productName))
              );
              optionsMap[getFieldId(field)] = uniqueProductNames.map(productName => ({
                value: productName,
                label: productName
              }));
              
            } catch (error) {
              console.error(`Failed to load options for ${field.fieldName}`, error);
            }
          }
        }
      }
      setDropdownOptions(optionsMap);
    };
    fetchOptions();
  }, []);

  const handleInputChange = (field: Field, value: any) => {
    const id = getFieldId(field);
    const finalValue =
      field.type === 'multiselect'
        ? value?.map((v: any) => v.value)
        : field.type === 'select'
        ? value?.value
        : value;
    setFormData((prev) => ({ ...prev, [id]: finalValue }));
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    businessChallengeJson.fields.forEach((section) => {
      section.fields.forEach((field) => {
        const fieldId = getFieldId(field);
        const value = formData[fieldId];
        if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
          newErrors[fieldId] = `${field.fieldName} is required`;
        }
        if (field.type === 'number' && value && isNaN(Number(value))) {
          newErrors[fieldId] = `${field.fieldName} must be a number`;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSave = async () => {
  if (!validateForm()) return;

  try {
    const processedData = { ...formData };

    // Process multiselect fields into comma-separated string
    businessChallengeJson.fields.forEach(section => {
      section.fields.forEach(field => {
        if (field.type === 'multiselect' && Array.isArray(processedData[field.id])) {
          processedData[field.id] = processedData[field.id].join(',');
        }
      });
    });

    const isEdit = Boolean(processedData.id);
    const url = isEdit
      ? `${process.env.REACT_APP_API_BASE_URL}/SalesLeadsBusinessChallenge/${processedData.id}`
      : '${process.env.REACT_APP_API_BASE_URL}/SalesLeadsBusinessChallenge';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...processedData,salesLeadsId: stageid}),
    });

    if (!response.ok) throw new Error('Failed to save business challenge.');

    let result = {};
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      result = await response.json();
    }

    toast.success(
      isEdit ? 'Business challenge updated successfully! ✏️' : 'Business challenge saved successfully! 🧾'
    );

    onSave?.({
      ...processedData,
      id: result || processedData,
    });
  } catch (error) {
    console.error(error);
    toast.error('Error saving business challenge.');
  }
};


  const renderField = (field: Field) => {
    const fieldId = getFieldId(field);
    const isDisabled = field.disabled === true || field.disabled === 'true';
    if (field.type === 'multiselect') {
      const selectedValues = (formData[fieldId] || []).map((v: any) => ({
        value: v,
        label: v,
      }));
      return (
        <Select
          isMulti
          options={dropdownOptions[fieldId] || []}
          value={selectedValues}
          onChange={(selected) => handleInputChange(field, selected)}
          placeholder={`Select ${field.fieldName}`}
          classNamePrefix="react-select"
          isDisabled={isDisabled}
        />
      );
    }
   
    if (field.type === 'textarea') {
      return (
        <textarea
          id={fieldId}
          value={formData[fieldId] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full border rounded-lg py-2 px-3 min-h-32"
          disabled={isDisabled}
        />
      );
    }
    
    return (
      <input
        type="text"
        id={fieldId}
        value={formData[fieldId] || ''}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full border rounded-lg py-2 px-3"
        disabled={isDisabled}
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {initialData.id ? 'Edit Business Challenge' : 'Add Business Challenge'}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {businessChallengeJson.fields.map((section, idx) => (
        <div key={idx} className="mb-6">
          <h3 className="text-lg font-medium mb-3">{section.title}</h3>
          <div className="grid grid-cols-1 gap-4">
            {section.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-1">
                  {field.fieldName}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && (
                  <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Challenge
        </button>
      </div>
    </div>
  );
};

export default BusinessChallengesForm;
