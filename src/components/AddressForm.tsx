import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AddressFormProps } from "../types/address";
import addressConfigjson from "../pages/configs/lead/addresses.json";
import Select from "react-select";

interface Field {
  fieldName: string;
  type: string;
  idName?: string;
  id?: string;
  options?: string[];
  required?: boolean;
  URL?: string;
  parentFldForVisible?: string;
  parentFldValForVisible?: string;
  disabled?: boolean;
}

interface LocationData {
  pincode: string;
  pincodeId: number;
  city: string;
  cityId: number;
  area: string;
  areaId: number;
  district: string;
  districtId: number;
  state: string;
  stateId: number;
  country: string;
  countryId: number;
  territory: string;
  territoryId: number;
}

interface HierarchyData {
  divisionId: number;
  parentDivisionId: number | null;
  divisionName: string;
  divisionType: string;
  level: number;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSave,
  onClose,
  initialData = {},
  stageid,
  type,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(
    initialData || {}
  );
  const [filteredFields, setFilteredFields] = useState<Field[]>(
    addressConfigjson.fields
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locationOptions, setLocationOptions] = useState<LocationData[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [currentPincodeAreas, setCurrentPincodeAreas] = useState<string[]>([]);
  const [currentAreaItems, setCurrentAreaItems] = useState<HierarchyData[]>([]);
  const [isSearchingPincode, setIsSearchingPincode] = useState<boolean>(false);

  useEffect(() => {
    const fetchDynamicOptions = async () => {
      const updatedFields = await Promise.all(
        addressConfigjson.fields.map(async (field: any) => {
          if (field.URL === "SalesLocation/search") {
            try {
              const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}SalesLocation/search`
              );
              const data: LocationData[] = response.data;
              setLocationOptions(data);
              const uniqueAreas = Array.from(
                new Set(data.map((item) => item.area))
              );
              setAreaOptions(uniqueAreas);
              if (field.idName === "pincode" || field.id === "pincode") {
                return {
                  ...field,
                  options: data.map((item) => item.pincode),
                };
              }
            } catch (err) {
              console.error("Failed to fetch location options", err);
              return field;
            }
          }
          return field;
        })
      );
      setFilteredFields(updatedFields);
    };

    fetchDynamicOptions();
  }, []);

  useEffect(() => {
    if (initialData && locationOptions.length > 0) {
      const updates: Record<string, any> = {};

      if (initialData.pincodeId) {
        const matchedByPincode = locationOptions.find(
          (item) => item.pincodeId === initialData.pincodeId
        );
        if (matchedByPincode) {
          updates.pincode = matchedByPincode.pincode;
          updates.pincodeId = matchedByPincode.pincodeId;
          updates.city = matchedByPincode.city;
          updates.cityId = matchedByPincode.cityId;
          updates.area = matchedByPincode.area;
          updates.areaId = matchedByPincode.areaId;
          updates.district = matchedByPincode.district;
          updates.districtId = matchedByPincode.districtId;
          updates.state = matchedByPincode.state;
          updates.stateId = matchedByPincode.stateId;
          updates.country = matchedByPincode.country;
          updates.countryId = matchedByPincode.countryId;
          updates.territory = matchedByPincode.territory;
          updates.territoryId = matchedByPincode.territoryId;
        }
      } else if (initialData.areaId) {
        const matchedByArea = locationOptions.find(
          (item) => item.areaId === initialData.areaId
        );
        if (matchedByArea) {
          updates.pincode = matchedByArea.pincode;
          updates.pincodeId = matchedByArea.pincodeId;
          updates.city = matchedByArea.city;
          updates.cityId = matchedByArea.cityId;
          updates.area = matchedByArea.area;
          updates.areaId = matchedByArea.areaId;
          updates.district = matchedByArea.district;
          updates.districtId = matchedByArea.districtId;
          updates.state = matchedByArea.state;
          updates.stateId = matchedByArea.stateId;
          updates.country = matchedByArea.country;
          updates.countryId = matchedByArea.countryId;
          updates.territory = matchedByArea.territory;
          updates.territoryId = matchedByArea.territoryId;
        }
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({
          ...prev,
          ...updates,
        }));
      }
    }
  }, [initialData, locationOptions]);

  const getFieldId = (field: Field) => field.idName || field.id || "";

  const handleInputChange = (id: string, value: any) => {
    // Handle area selection - find the corresponding areaId from currentAreaItems
    if (id === "area") {
      const selectedAreaItem = currentAreaItems.find(
        (item) => item.divisionName === value
      );
      if (selectedAreaItem) {
        setFormData((prev) => ({
          ...prev,
          area: value,
          areaId: selectedAreaItem.divisionId,
        }));
      } else {
        // Fallback: just update the area name
        setFormData((prev) => ({
          ...prev,
          [id]: value,
          areaId: undefined,
        }));
      }
    } else if (id === "pincode") {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
        // Clear area and areaId if pincode changes
        area: "",
        areaId: undefined,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }

    if (errors[id]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handlePincodeSearch = async (pincode: string) => {
    if (!pincode || pincode.length !== 6 || !/^[0-9]{6}$/.test(pincode)) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setIsSearchingPincode(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}GeographicalDivision/hierarchy/pincode/${pincode}`
      );
      const hierarchyData: HierarchyData[] = response.data;

      if (hierarchyData && hierarchyData.length > 0) {
        const updates: Record<string, any> = { pincode };

        // Extract area items from the response
        const areaItems = hierarchyData.filter(
          (item) => item.divisionType.toLowerCase() === "area"
        );
        const areaOptions = areaItems.map((item) => item.divisionName);

        // Store current area items in state for later use in dropdown selection
        setCurrentAreaItems(areaItems);
        setCurrentPincodeAreas(areaOptions);

        // Map hierarchy data to form fields
        hierarchyData.forEach((item) => {
          switch (item.divisionType.toLowerCase()) {
            case "country":
              updates.country = item.divisionName;
              updates.countryId = item.divisionId;
              break;
            case "state":
              updates.state = item.divisionName;
              updates.stateId = item.divisionId;
              break;
            case "district":
              updates.district = item.divisionName;
              updates.districtId = item.divisionId;
              break;
            case "city":
              updates.city = item.divisionName;
              updates.cityId = item.divisionId;
              break;
            case "pincode":
              updates.pincodeId = item.divisionId;
              break;
          }
        });

        setFormData((prev) => {
          let updatesCopy = { ...prev, ...updates };

          // Auto-select area if only one option, clear if multiple options and current area is invalid
          if (areaOptions.length === 1) {
            // Auto-select the single area option
            updatesCopy.area = areaOptions[0];
            updatesCopy.areaId = areaItems[0].divisionId;
          } else if (
            areaOptions.length > 1 &&
            prev.area &&
            !areaOptions.includes(prev.area)
          ) {
            // Clear area if current area is not in the new options (multiple areas case)
            updatesCopy.area = "";
            updatesCopy.areaId = undefined;
          }

          return updatesCopy;
        });

        toast.success("Location details fetched successfully!");
      } else {
        toast.error("No location data found for this pincode");
      }
    } catch (error) {
      console.error("Failed to fetch pincode hierarchy", error);
      toast.error("Failed to fetch location details");
    } finally {
      setIsSearchingPincode(false);
    }
  };

  const handlePincodeChange = (pincode: string) => {
    const matched = locationOptions.find((item) => item.pincode === pincode);

    if (!matched) return;

    const updates: Record<string, any> = {
      pincode: matched.pincode,
      pincodeId: matched.pincodeId,
      city: matched.city,
      cityId: matched.cityId,
      area: matched.area,
      areaId: matched.areaId,
      district: matched.district,
      districtId: matched.districtId,
      state: matched.state,
      stateId: matched.stateId,
      country: matched.country,
      countryId: matched.countryId,
      territory: matched.territory,
      territoryId: matched.territoryId,
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleAreaChange = (area: string) => {
    // Find the corresponding areaId from currentAreaItems
    const selectedAreaItem = currentAreaItems.find(
      (item) => item.divisionName === area
    );

    if (selectedAreaItem) {
      setFormData((prev) => ({
        ...prev,
        area: area,
        areaId: selectedAreaItem.divisionId,
      }));
    } else {
      // Fallback: try to find from locationOptions or just update area name
      const foundLocation = locationOptions.find((item) => item.area === area);
      setFormData((prev) => ({
        ...prev,
        area: area,
        areaId: foundLocation?.areaId || prev.areaId,
      }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    filteredFields.forEach((field) => {
      const id = getFieldId(field);
      if (field.required && (!formData[id] || formData[id].trim() === "")) {
        newErrors[id] = `${field.fieldName} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const renderDropdown = (field: Field) => {
    const fieldId = getFieldId(field);

    if (fieldId === "area") {
      // Use currentAreaItems if available from pincode search, otherwise fallback to all area options
      const availableAreas =
        currentPincodeAreas.length > 0 ? currentPincodeAreas : areaOptions;

      // Disable dropdown if only one area is available
      const isDisabled = field.disabled || availableAreas.length === 1;

      return (
        <Select
          id={fieldId}
          value={
            availableAreas
              .map((option: string) => ({ label: option, value: option }))
              .find((opt) => opt.value === formData[fieldId]) || null
          }
          onChange={(selectedOption) => {
            const value = selectedOption?.value || "";
            handleInputChange(fieldId, value);
            handleAreaChange(value);
          }}
          options={availableAreas.map((option: string) => ({
            label: option,
            value: option,
          }))}
          isDisabled={isDisabled}
          placeholder={
            isDisabled && availableAreas.length === 1
              ? `Auto-selected: ${availableAreas[0]}`
              : `Select ${field.fieldName}`
          }
          classNamePrefix="react-select"
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
              "&:hover": {
                borderColor: "#3b82f6",
              },
              backgroundColor: isDisabled ? "#f3f4f6" : "#f9fafb",
            }),
            placeholder: (base) => ({
              ...base,
              color: isDisabled ? "#9ca3af" : "#6b7280",
            }),
            singleValue: (base) => ({
              ...base,
              color: isDisabled ? "#9ca3af" : "#111827",
            }),
          }}
          isClearable={!isDisabled}
        />
      );
    }

    return (
      <Select
        id={fieldId}
        value={
          field.options
            ?.map((option: string) => ({ label: option, value: option }))
            .find((opt) => opt.value === formData[fieldId]) || null
        }
        onChange={(selectedOption) => {
          const value = selectedOption?.value || "";
          handleInputChange(fieldId, value);

          if (fieldId === "pincode") {
            handlePincodeChange(value);
          }
        }}
        options={field.options?.map((option: string) => ({
          label: option,
          value: option,
        }))}
        isDisabled={field.disabled}
        placeholder={`Select ${field.fieldName}`}
        classNamePrefix="react-select"
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
            boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
            "&:hover": {
              borderColor: "#3b82f6",
            },
          }),
        }}
        isClearable
      />
    );
  };

  const renderSearchTextField = (field: Field) => {
    const fieldId = getFieldId(field);
    return (
      <div className="relative">
        <input
          type="text"
          id={fieldId}
          value={formData[fieldId] || ""}
          onChange={(e) => handleInputChange(fieldId, e.target.value)}
          className={`w-full border ${
            errors[fieldId] ? "border-red-500" : "border-gray-300"
          }
            ${
              field.disabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-gray-50 hover:bg-white"
            }
            rounded-sm py-1.5 px-3 pr-10 text-gray-700 focus:outline-none 
            ${field.disabled ? "" : "focus:ring-2 focus:ring-blue-500"} 
            transition-all duration-200`}
          required={field.required}
          disabled={field.disabled}
          placeholder={`Enter ${field.fieldName}`}
        />
        <button
          type="button"
          onClick={() => handlePincodeSearch(formData[fieldId])}
          disabled={isSearchingPincode || field.disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50"
          title="Search Location Details"
        >
          {isSearchingPincode ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </button>
      </div>
    );
  };

  const renderInput = (field: Field) => {
    const id = getFieldId(field);
    return (
      <input
        id={id}
        type={field.type}
        value={formData[id] || ""}
        onChange={(e) => handleInputChange(id, e.target.value)}
        className={`w-full border ${
          errors[id] ? "border-red-500" : "border-gray-300"
        }
          ${
            field.disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-50 hover:bg-white"
          }
          rounded-sm py-1.5 px-3 text-gray-700 focus:outline-none 
          ${field.disabled ? "" : "focus:ring-2 focus:ring-blue-500"} 
          transition-all duration-200`}
        disabled={field.disabled}
      />
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const { title, fields, ...dataToSend } = formData;

      const isEdit = Boolean(dataToSend.id);
      const url = isEdit
        ? `${process.env.REACT_APP_API_BASE_URL}SalesAddress/${dataToSend.id}`
        : "${process.env.REACT_APP_API_BASE_URL}SalesAddress";

      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ContactName: dataToSend.contactName || "string",
          Type: dataToSend.type || "string",
          IsActive: true,
          Block: dataToSend.block || "string",
          Department: dataToSend.department || "string",
          Area: dataToSend.area || "string",
          City: dataToSend.city || "string",
          State: dataToSend.state || "string",
          Pincode: dataToSend.pincode || "string",
          OpportunityId: "string",
          DoorNo: dataToSend.doorNo || "string",
          Street: dataToSend.street || "string",
          Landmark: dataToSend.landmark || "string",
          IsDefault: true,
          salesLeadId: stageid,
        }),
      });

      if (!response.ok) throw new Error("Failed to save address.");

      let result;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      }

      // Show toast only if onSave is not provided (component is used standalone)
      if (!onSave) {
        toast.success(
          isEdit
            ? "Address updated successfully! ✏️"
            : "Address saved successfully! 🏡"
        );
      }

      // Format the response data before passing it to parent
      const formattedData = {
        ...dataToSend,
        id: isEdit ? dataToSend.id : result?.id || result,
        salesLeadId: stageid,
        // Ensure all required fields are properly formatted
        doorNo: dataToSend.doorNo || "",
        street: dataToSend.street || "",
        landmark: dataToSend.landmark || "",
        isDefault: true,
      };

      // Only call onSave if it exists and with properly formatted data
      if (onSave) {
        onSave(formattedData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error saving address.");
    }
  };

  return (
    <div className="bg-white  p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {addressConfigjson.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFields.map((field) => {
          const fieldId = getFieldId(field);

          return (
            <div key={fieldId}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.fieldName}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              {field.type === "dropdown"
                ? renderDropdown(field)
                : field.type === "searchtext"
                ? renderSearchTextField(field)
                : renderInput(field)}
              {errors[fieldId] && (
                <p className="text-red-500 text-sm mt-1">{errors[fieldId]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end mt-6 space-x-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddressForm;
