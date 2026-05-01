import React, { useEffect, useState } from "react";
import axios from "axios";

interface AddressFormProps {
  onCancel: () => void;
  initialData?: any;
  leadId?: string;
  onSuccess?: () => void;
  editId?: string;
}

interface FieldError {
  [key: string]: string;
}

// Update the Pincode interface to match the API response
interface Pincode {
  id: string;
  code: string;
  pincode: string; // Add this if your API returns pincode instead of code
}

const AddressForm: React.FC<AddressFormProps> = ({
  onCancel,
  initialData,
  leadId,
  onSuccess,
  editId,
}) => {
  const [formData, setFormData] = useState({
    addressType: "",
    contactName: "",
    department: "",
    pincode: "",
    city: "",
    area: "",
    block: "",
    doorNo: "",
    street: "",
    landmark: "",
    district: "",
    state: "",
    territory: "",
  });

  const [options, setOptions] = useState<{
    cities: { id: string; name: string }[];
    areas: { id: string; name: string }[];
    districts: { id: string; name: string }[];
    states: { id: string; name: string }[];
    territories: { id: string; name: string }[];
    pincodes: { id: string; code: string }[];
  }>({
    cities: [],
    areas: [],
    districts: [],
    states: [],
    territories: [],
    pincodes: [],
  });
  const [allPincodes, setAllPincodes] = useState<Pincode[]>([]);
  const [showPincodeResults, setShowPincodeResults] = useState(false);
  const [errors, setErrors] = useState<FieldError>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredPincodes, setFilteredPincodes] = useState<Pincode[]>([]);
  const [selectedPincodeId, setSelectedPincodeId] = useState("");

  // Fetch initial data for dropdowns
  useEffect(() => {
    const fetchInitialData = async () => {
      const [states, territories, districts, cities, areas, pincodes] =
        await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesState`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesTerritory`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesDistrict`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesCity`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesArea`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}SalesPincode`),
        ]);
      setOptions((prev) => ({
        ...prev,
        states: states.data,
        territories: territories.data,
        districts: districts.data,
        cities: cities.data,
        areas: areas.data,
      }));
      setAllPincodes(pincodes.data);
    };
    fetchInitialData();
  }, []);

  const handlePincodeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, pincode: value }));
    setSelectedPincodeId(""); // Reset selected pincode ID when typing

    if (value.length >= 3) {
      const filtered = allPincodes.filter((p) =>
        // Check for both code and pincode properties
        (p.code || p.pincode || "").toString().startsWith(value)
      );
      setFilteredPincodes(filtered);
      setShowPincodeResults(true);
    } else {
      setShowPincodeResults(false);
    }
  };

  const handleInputChange = async (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    try {
      switch (field) {
        case "state":
          const territories = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}SalesTerritory/state/${value}`
          );
          setOptions((prev) => ({ ...prev, territories: territories.data }));
          break;
        case "district":
          const cities = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}SalesCity/district/${value}`
          );
          setOptions((prev) => ({ ...prev, cities: cities.data }));
          break;
        case "city":
          const areas = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}SalesArea/city/${value}`
          );
          setOptions((prev) => ({ ...prev, areas: areas.data }));
          break;
        case "pincode":
          if (value.length >= 3) {
            const pincodes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}SalesPincode`
            );
            const filtered = pincodes.data.filter((p: any) =>
              p.code.startsWith(value)
            );
            setOptions((prev) => ({ ...prev, pincodes: filtered }));
            setShowPincodeResults(true);
          }
          break;
      }
    } catch (error) {
      console.error("Error fetching dependent data:", error);
    }
  };

  const validateForm = () => {
    const newErrors: FieldError = {};
    const requiredFields = {
      addressType: "Address Type",
      contactName: "Contact Name",
      pincode: "Pincode",
      city: "City",
      state: "State",
      district: "District",
    };

    // Required field validation
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (
        !formData[field as keyof typeof formData] ||
        formData[field as keyof typeof formData].toString().trim() === ""
      ) {
        newErrors[field] = `${label} is required`;
      }
    });

    // Pincode validation
    if (formData.pincode) {
      if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Pincode must be 6 digits";
      }
    }

    // Contact Name validation
    if (formData.contactName && formData.contactName.length < 3) {
      newErrors.contactName = "Contact Name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show error toast or scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id: editId ? editId : "",
        leadId: leadId,
        type: formData.addressType,
        contactName: formData.contactName,
        department: formData.department,
        doorNo: formData.doorNo,
        block: formData.block,
        street: formData.street,
        landmark: formData.landmark,
        areaId: formData.area,
        cityId: formData.city,
        districtId: formData.district,
        stateId: formData.state,
        territoryId: formData.territory,
        pincode: formData.pincode,
        pincodeId: selectedPincodeId,
        isActive: true,
        userCreated: 1,
        salesLeadsId: leadId,
        dateCreated: new Date().toISOString(),
      };

      const response = await axios({
        method: editId ? "put" : "post",
        url: `${process.env.REACT_APP_API_BASE_URL}SalesAddress${
          editId ? `/${editId}` : ""
        }`,
        data: payload,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.status === 201) {
        onSuccess?.();
        onCancel();
      }
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || "Failed to save address",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchaddressById = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}SalesAddress/${editId}`
      );

      console.log("Fetched address data:", response.data);
      const fetchedData = response.data;

      const editAddress = {
        ...fetchedData,
        id: editId,
        city: fetchedData.cityId,
        addressType: fetchedData.type,
        district: fetchedData.districtId,
        area: fetchedData.areaId,
        state: fetchedData.stateId,
        territory: fetchedData.territoryId,
        pincode: allPincodes.find((p) => p.id == fetchedData.pincodeId)
          ?.pincode, 
      };
      console.log(editAddress, "editAddress");
      setFormData(editAddress || {});
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  useEffect(() => {
    editId && fetchaddressById(editId);
  }, [editId]);

  const handlePincodeSelect = (pincode: Pincode) => {
    setFormData((prev) => ({
      ...prev,
      pincode: pincode.code || pincode.pincode || "", // Handle both properties
    }));
    setSelectedPincodeId(pincode.id);
    setShowPincodeResults(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg">
      {errors.submit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        {/* Address Type */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Type
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.addressType}
            onChange={(e) => handleInputChange("addressType", e.target.value)}
          >
            <option value="">Select</option>
            <option value="Shipping">Shipping</option>
            <option value="demo">Demo</option>
            <option value="other">Other</option>
          </select>
          {errors.addressType && (
            <p className="text-red-500 text-xs mt-1">{errors.addressType}</p>
          )}
        </div>

        {/* Contact Name */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Name
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.contactName}
            onChange={(e) => handleInputChange("contactName", e.target.value)}
          />
          {errors.contactName && (
            <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
          )}
        </div>

        {/* Department */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.department}
            onChange={(e) => handleInputChange("department", e.target.value)}
          />
        </div>

        {/* Pincode with Autocomplete */}
        <div className="form-group relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.pincode}
            onChange={(e) => handlePincodeChange(e.target.value)}
          />
          {showPincodeResults && filteredPincodes.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredPincodes.map((pincode) => (
                <div
                  key={pincode.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePincodeSelect(pincode)}
                >
                  {pincode.code || pincode.pincode}
                </div>
              ))}
            </div>
          )}
          {errors.pincode && (
            <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
          )}
        </div>

        {/* City */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.city}
            onChange={(e) => handleInputChange("city", e.target.value)}
          >
            <option value="">Select</option>
            {options.cities.map((city: any) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>

        {/* Area */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Area
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
          >
            <option value="">Select</option>
            {options.areas.map((area: any) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Block */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Block
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.block}
            onChange={(e) => handleInputChange("block", e.target.value)}
          />
        </div>

        {/* Door No */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Door No
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.doorNo}
            onChange={(e) => handleInputChange("doorNo", e.target.value)}
          />
        </div>

        {/* Street */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Street
          </label>
          <input
            type="text"
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
          />
        </div>

        {/* District */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.district}
            onChange={(e) => handleInputChange("district", e.target.value)}
          >
            <option value="">Select</option>
            {options.districts.map((district: any) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
          >
            <option value="">Select</option>
            {options.states.map((state: any) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-500 text-xs mt-1">{errors.state}</p>
          )}
        </div>

        {/* Territory */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Territory
          </label>
          <select
            className="w-full h-10 border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={formData.territory}
            onChange={(e) => handleInputChange("territory", e.target.value)}
          >
            <option value="">Select</option>
            {options.territories.map((territory: any) => (
              <option key={territory.id} value={territory.id}>
                {territory.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
};

export default AddressForm;
