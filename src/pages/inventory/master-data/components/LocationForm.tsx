import React, { useState, useEffect } from "react";
import InputField from "../../../../components/common/InputField";
import DropDown from "../../../../components/common/DropDown";
import { Warehouse } from "../../../../types/warehouse";
import {
  ItemLocation,
  ItemReference,
  WarehouseReference,
} from "../../../../types/itemLocation";
import api from "../../../../services/api";

interface LocationFormProps {
  itemLocation: ItemLocation | null;
  onSave: (itemLocation: ItemLocation) => void;
  onCancel: () => void;
  warehouses: WarehouseReference[];
  items: ItemReference[];
}

const LocationForm: React.FC<LocationFormProps> = ({
  itemLocation,
  onSave,
  onCancel,
  warehouses,
  items,
}) => {
  const [formData, setFormData] = useState<ItemLocation>({
    id: 0,
    itemId: 0,
    warehouseId: 0,
    rack: "",
    shelf: "",
    columnNo: "",
    inPlace: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (itemLocation) {
      setFormData(itemLocation);
    } else {
      setFormData({
        id: 0,
        itemId: 0,
        warehouseId: 0,
        rack: "",
        shelf: "",
        columnNo: "",
        inPlace: "",
      });
    }
    setErrors({});
    setTouched({});
  }, [itemLocation]);

  const handleInputChange = (
    name: string,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };

    switch (name) {
      case "itemId":
        if (!value || value === 0) {
          newErrors.itemId = "Item is required";
        } else {
          delete newErrors.itemId;
        }
        break;
      case "warehouseId":
        if (!value || value === 0) {
          newErrors.warehouseId = "Warehouse is required";
        } else {
          delete newErrors.warehouseId;
        }
        break;
      case "rack":
        if (!value?.toString().trim()) {
          newErrors.rack = "Rack is required";
        } else if (value.toString().length > 50) {
          newErrors.rack = "Rack must be less than 50 characters";
        } else {
          delete newErrors.rack;
        }
        break;
      case "shelf":
        if (!value?.toString().trim()) {
          newErrors.shelf = "Shelf is required";
        } else if (value.toString().length > 50) {
          newErrors.shelf = "Shelf must be less than 50 characters";
        } else {
          delete newErrors.shelf;
        }
        break;
      case "columnNo":
        if (!value?.toString().trim()) {
          newErrors.columnNo = "Column is required";
        } else if (value.toString().length > 50) {
          newErrors.columnNo = "Column must be less than 50 characters";
        } else {
          delete newErrors.columnNo;
        }
        break;
      case "inPlace":
        if (value && value.toString().length > 100) {
          newErrors.inPlace = "In Place must be less than 100 characters";
        } else {
          delete newErrors.inPlace;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const requiredFields = [
      "itemId",
      "warehouseId",
      "rack",
      "shelf",
      "columnNo",
    ];

    const newTouched = requiredFields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setTouched((prev) => ({ ...prev, ...newTouched }));

    requiredFields.forEach((field) =>
      validateField(field, formData[field as keyof ItemLocation])
    );

    if (formData.inPlace) validateField("inPlace", formData.inPlace);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let response;

        // Use PUT for update (when we have an existing item location with id)
        // Use POST for creating a new item location
        if (itemLocation && itemLocation.id) {
          response = await api.put(`ItemLocation/${itemLocation.id}`, formData);
        } else {
          response = await api.post("ItemLocation", formData);
        }

        // Call the onSave prop with the response data
        onSave(response.data);
        onCancel();
      } catch (err: any) {
        console.error("Error saving item location:", err);
        // You could add error handling here, such as displaying an error message
        alert(
          err.data?.message || "Failed to save item location. Please try again."
        );
      }
    }
  };

  const getWarehouseOptions = () =>
    warehouses.map((w) => ({
      value: w.id.toString(),
      label: w.name,
    }));

  const getItemOptions = () =>
    items.map((item) => ({
      value: item.id.toString(),
      label: item.code
        ? `${item.code} - ${item.name}`.toString()
        : String(item.name),
    }));

  const renderInputField = (
    field: keyof ItemLocation,
    config: {
      label: string;
      type?: string;
      required?: boolean;
      disabled?: boolean;
    }
  ) => (
    <div>
      <InputField
        FieldName={config.label}
        IdName={field}
        Name={field}
        Type={config.type || "text"}
        value={formData[field]?.toString() || ""}
        handleInputChange={(name, value) => handleInputChange(name, value)}
        required={config.required}
        Disabled={config.disabled || false}
      />
      {touched[field] && errors[field] && (
        <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
      )}
    </div>
  );

  const renderDropdown = (
    field: keyof ItemLocation,
    config: {
      label: string;
      options: Array<{ value: string; label: string }>;
      required?: boolean;
      disabled?: boolean;
    }
  ) => (
    <div>
      <DropDown
        FieldName={config.label}
        IdName={field}
        Options={config.options}
        values={formData[field]?.toString() || ""}
        handleOptionChange={(name, value) => handleInputChange(name, value)}
        required={config.required}
        Disabled={config.disabled || false}
      />
      {touched[field] && errors[field] && (
        <p className="text-red-500 text-xs mt-1">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 m-4 bg-white shadow-md p-4 rounded-lg">
        {renderDropdown("itemId", {
          label: "Item",
          options: getItemOptions(),
          required: true,
        })}

        {renderDropdown("warehouseId", {
          label: "Warehouse",
          options: getWarehouseOptions(),
          required: true,
        })}

        {renderInputField("rack", {
          label: "Rack",
          required: true,
        })}

        {renderInputField("shelf", {
          label: "Shelf",
          required: true,
        })}

        {renderInputField("columnNo", {
          label: "Column",
          required: true,
        })}

        {renderInputField("inPlace", {
          label: "In Place",
          required: false,
        })}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {itemLocation ? "Update Item Location" : "Add Item Location"}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;
