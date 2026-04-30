import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import MultiSelectWithOther from "./common/MultiSelectWithOther";
import { toast } from "react-toastify";
import axios from "axios";
import Select from "react-select";
import { MdAddBusiness } from "react-icons/md";
import { Product } from "../types/product";
import api from "../services/api";

interface SalesLeadData {
  leadId: string;
  customerName: string;
  contactName?: string;
  contactMobileNo?: string;
  email?: string;
  territory?: string;
  status?: string;
  [key: string]: any;
}

interface SalesOpportunityData {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  status: string;
  expectedCompletion: string;
  opportunityType: string;
  opportunityFor: string;
  customerId: number | null;
  customerName: string;
  customerType: string | null;
  opportunityName: string;
  opportunityId: string;
  comments: string;
  isActive: boolean;
  leadId: string;
  salesRepresentativeId: number | null;
  contactName: string;
  contactMobileNo: string;
  items?: Array<{
    id: number;
    user_created: number;
    date_created: string;
    user_updated: number;
    date_updated: string;
    qty: number;
    amount: number;
    is_active: boolean;
    item_id: number;
    stage: string;
    unit_price: number;
    stage_item_id: string;
    make: string;
    model: string;
    product: string;
    category: string;
    itemname: string;
    itemcode: string;
  }>;
}

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
  hidden?: boolean;
  valueField?: string;
  labelField?: string;
}
interface GeneralInformationProps {
  config: Record<string, any>;
  onCancel?: () => void;
  onConvertToOpp?: (data: Record<string, any>) => void;
  type?: string;
  data?: any;
  onClose?: () => void;
  formData?: Record<string, any>;
  setFormData: (data: Record<string, any>) => void;
  setOpportunityId?: (id: string) => void;
  onSuccess?: () => void;
  setOptions?: (options: Product[]) => void;
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
export interface GeneralInformationRef {
  validateForm: () => boolean;
  getFormData: () => Record<string, any>;
}

const GeneralInformation = forwardRef<
  GeneralInformationRef,
  GeneralInformationProps
>(
  (
    {
      config,
      data,
      setFormData,
      onSuccess,
      setOpportunityId,
      formData = {},
      setOptions,
      type,
    },
    ref,
  ): JSX.Element => {
    const [filteredFields, setFilteredFields] = useState<Field[]>(
      config.fields,
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [locationOptions, setLocationOptions] = useState<LocationData[]>([]);
    const [isSearchingPincode, setIsSearchingPincode] =
      useState<boolean>(false);
    // Use per-field loading state to avoid disabling all dropdowns at once
    const [loadingFields, setLoadingFields] = useState<Record<string, boolean>>(
      {},
    );
    const [apiData, setApiData] = useState<SalesLeadData[]>([]);
    const [opportunityData, setOpportunityData] = useState<
      SalesOpportunityData[]
    >([]);
    const [presenterOptions, setPresenterOptions] = useState<
      { id: number; username: string }[]
    >([]);
    // Add state for currentAreaItems to fix ReferenceError
    const [currentAreaItems, setCurrentAreaItems] = useState<HierarchyData[]>(
      [],
    );
    // Track if pincode search was attempted for area validation
    const [areaSearchAttempted, setAreaSearchAttempted] = useState(false);
    // Assigned To dropdown state and effect (top-level, not in renderDropdown)
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const [assignedToOptions, setAssignedToOptions] = useState<any[]>([]);
    const [loadingAssignedTo, setLoadingAssignedTo] = useState(false);
    const [customApiData, setCustomApiData] = useState<Record<string, any[]>>(
      {},
    );

    // Utility: get request body with presenterIds as array of numbers
    const getRequestBody = () => {
      const payload = { ...formData };
      if (Array.isArray(formData.presenterId)) {
        payload.presenterIds = formData.presenterId.map((id: string | number) =>
          Number(id),
        );
      } else {
        payload.presenterIds = [];
      }
      return payload;
    };

    useImperativeHandle(ref, () => ({
      validateForm: () => validateForm(),
      getFormData: () => formData,
      getRequestBody, // expose for parent to use
    }));
    useEffect(() => {
      if (data) {
        setFormData((prev: any) => {
          if (Object.keys(prev).length === 0) {
            const initialFormData: Record<string, any> = {};
            Object.keys(data).forEach((key) => {
              initialFormData[key] = data[key];
            });
            // Parse comments field: if it's a string, convert to array
            if (initialFormData.comments && typeof initialFormData.comments === "string") {
              try {
                const parsed = JSON.parse(initialFormData.comments);
                initialFormData.comments = Array.isArray(parsed) ? parsed : initialFormData.comments.split(",").map((s: string) => s.trim()).filter(Boolean);
              } catch {
                initialFormData.comments = initialFormData.comments.split(",").map((s: string) => s.trim()).filter(Boolean);
              }
            }
            // Ensure customerName is set if present in data (handle different casings)
            if (
              !initialFormData.customerName &&
              (data.customerName || data.CustomerName)
            ) {
              initialFormData.customerName =
                data.customerName || data.CustomerName;
            }
            return initialFormData;
          }
          // Also patch for existing prev: if customerName is missing but present in data, set it
          if (!prev.customerName && (data.customerName || data.CustomerName)) {
            return {
              ...prev,
              customerName: data.customerName || data.CustomerName,
            };
          }
          return prev;
        });
      }
    }, [data, setFormData]);
    console.log(formData, "DDDD:::::");
    // Set default dates for new forms
    useEffect(() => {
      if (!data && config.fields) {
        const today = new Date().toISOString().split("T")[0];
        const defaultDateFields: Record<string, any> = {};

        config.fields.forEach((field: Field) => {
          const fieldId = field.idName || field.id || "";
          const fieldName = field.fieldName.toLowerCase();

          // Set default date for quotation date and similar fields
          if (
            field.type === "date" &&
            (fieldName.includes("quotation") ||
              fieldName.includes("created") ||
              (fieldName.includes("date") &&
                !fieldName.includes("expected") &&
                !fieldName.includes("completion")))
          ) {
            if (!formData[fieldId]) {
              defaultDateFields[fieldId] = today;
            }
          }
        });

        if (Object.keys(defaultDateFields).length > 0) {
          setFormData((prev: any) => ({
            ...prev,
            ...defaultDateFields,
          }));
        }
      }
    }, [config.fields, data, formData, setFormData]);

    // Function to fetch sales lead data
    const fetchSalesLeadData = useCallback(async () => {
      setLoadingFields((prev) => ({ ...prev, SalesLead: true }));
      try {
        const response = await axios.get<SalesLeadData[]>(
          "http://localhost:5104/api/SalesLead",
        );
        setApiData(response.data);
      } catch (err) {
        console.error("Failed to fetch sales lead data:", err);
        toast.error("Failed to load sales lead data. Please try again later.");
        setApiData([]);
      } finally {
        setLoadingFields((prev) => ({ ...prev, SalesLead: false }));
      }
    }, []);

    // Function to fetch opportunity data
    const fetchOpportunityData = useCallback(async () => {
      setLoadingFields((prev) => ({ ...prev, SalesOpportunity: true }));
      try {
        const response = await axios.get(
          "http://localhost:5104/api/SalesOpportunity/with-items",
        );

        // Transform the API response to match our interface
        const transformedData: SalesOpportunityData[] = response.data.map(
          (item: any) => ({
            id: item.opportunity.id,
            userCreated: item.opportunity.userCreated,
            dateCreated: item.opportunity.dateCreated,
            userUpdated: item.opportunity.userUpdated,
            dateUpdated: item.opportunity.dateUpdated,
            status: item.opportunity.status,
            expectedCompletion: item.opportunity.expectedCompletion,
            opportunityType: item.opportunity.opportunityType,
            opportunityFor: item.opportunity.opportunityFor,
            customerId: item.opportunity.customerId,
            customerName: item.opportunity.customerName,
            customerType: item.opportunity.customerType,
            opportunityName: item.opportunity.opportunityName,
            opportunityId: item.opportunity.opportunityId,
            comments: item.opportunity.comments,
            isActive: item.opportunity.isActive,
            leadId: item.opportunity.leadId,
            salesRepresentativeId: item.opportunity.salesRepresentativeId,
            contactName: item.opportunity.contactName,
            contactMobileNo: item.opportunity.contactMobileNo,
            items: item.items || [],
          }),
        );

        console.log("Transformed opportunity data:", transformedData);
        console.log("Sample opportunity items:", transformedData[0]?.items);
        setOpportunityData(transformedData);
      } catch (err) {
        console.error("Failed to fetch opportunity data:", err);
        // toast.error("Failed to load opportunity data. Please try again later.");
        setOpportunityData([]);
      } finally {
        setLoadingFields((prev) => ({ ...prev, SalesOpportunity: false }));
      }
    }, []);

    // Initialize API data
    useEffect(() => {
      // Only call fetchSalesLeadData if any field with id 'leadId' is present in config.fields
      const hasLeadIdField = config.fields.some(
        (field: any) => field.id === "leadId",
      );
      if (hasLeadIdField) {
        fetchSalesLeadData();
      }
      fetchOpportunityData(); // Always fetch opportunity data
    }, [fetchSalesLeadData, fetchOpportunityData, config.fields]);

    useEffect(() => {
      const fetchDynamicOptions = async () => {
        const updatedFields = await Promise.all(
          config.fields.map(async (field: any) => {
            // Do not fetch SalesLead here, options will be set from apiData in renderDropdown
            if (field.URL === "api/SalesLead") {
              return field;
            } else if (field.URL === "api/SalesOpportunity/with-items") {
              try {
                const response = await axios.get(
                  "http://localhost:5104/api/SalesOpportunity/with-items",
                );

                // Transform the API response to extract opportunity data
                const transformedData = response.data.map((item: any) => ({
                  opportunityId: item.opportunity.opportunity_id,
                  customerName: item.opportunity.customer_name,
                }));

                // For Opportunity ID dropdown
                if (field.id === "opportunityId") {
                  return {
                    ...field,
                    options: transformedData.map(
                      (item: any) => item.opportunityId,
                    ),
                  };
                }

                // For Customer Name dropdown
                if (field.id === "customerName") {
                  return {
                    ...field,
                    options: transformedData.map(
                      (item: any) => item.customerName,
                    ),
                  };
                }
                onSuccess?.();
              } catch (err) {
                console.error("Failed to fetch opportunity data", err);
                return field;
              }
            } else if (field.URL === "SalesLocation/search") {
              try {
                const response = await axios.post(
                  "http://localhost:5104/api/SalesLocation/search",
                );
                const locationData: LocationData[] = response.data;
                setLocationOptions(locationData);
                if (field.idName === "pincode" || field.id === "pincode") {
                  return {
                    ...field,
                    options: locationData.map((item) => item.pincode),
                  };
                }
              } catch (err) {
                console.error("Failed to fetch location options", err);
                return field;
              }
            }
            return field;
          }),
        );
        setFilteredFields(updatedFields);
      };
      fetchDynamicOptions();
    }, [config.fields, onSuccess]);

    useEffect(() => {
      if (data && locationOptions.length > 0) {
        const updates: Record<string, any> = {};
        if (data.pincodeId) {
          const matchedByPincode = locationOptions.find(
            (item) => item.pincodeId === data.pincodeId,
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
            updates.territory = matchedByPincode.territory;
            updates.territoryId = matchedByPincode.territoryId;
          }
        } else if (data.areaId) {
          const matchedByArea = locationOptions.find(
            (item) => item.areaId === data.areaId,
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
            updates.territory = matchedByArea.territory;
            updates.territoryId = matchedByArea.territoryId;
          }
        }
        if (Object.keys(updates).length > 0) {
          setFormData((prev: any) => ({
            ...prev,
            ...updates,
          }));
        }
      }
    }, [data, locationOptions, setFormData]);

    // Function to handle field visibility
    const handleFieldVisibility = useCallback(
      (fieldName: string, fieldValue: string) => {
        setFilteredFields((prevFields) =>
          config.fields.filter((field: any) => {
            if (!field.parentFldForVisible) return true;

            const isVisible =
              field.parentFldForVisible.toLowerCase() ===
                fieldName.toLowerCase() &&
              fieldValue.toLowerCase() ===
                field.parentFldValForVisible?.toLowerCase();
            // Removed fetchSalesLeadData to avoid extra API calls

            return (
              isVisible ||
              field.parentFldForVisible.toLowerCase() !==
                fieldName.toLowerCase()
            );
          }),
        );
      },
      [config.fields, fetchSalesLeadData],
    );

    useEffect(() => {
      if (data) {
        config.fields.forEach((field: Field) => {
          if (field.parentFldForVisible && data[field.parentFldForVisible]) {
            handleFieldVisibility(
              field.parentFldForVisible,
              data[field.parentFldForVisible],
            );
          }
        });
      }
    }, [data, config.fields, handleFieldVisibility]);

    const getFieldId = (field: Field): string => field.idName || field.id || "";

    // Real-time validation function
    const validateField = (
      fieldId: string,
      value: any,
      field: Field,
    ): string => {
      if (!value || value.toString().trim() === "") {
        if (field.required) {
          return `${field.fieldName} is required`;
        }
        return "";
      }

      const fieldName = field.fieldName.toLowerCase();
      const valueStr = value.toString();

      // Email validation
      if (fieldName.includes("email") || field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valueStr)) {
          return "Please enter a valid email address";
        }
      }

      // Website URL validation
      if (fieldName.includes("website") || fieldName.includes("url")) {
        const urlRegex =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlRegex.test(valueStr)) {
          return "Please enter a valid website URL";
        }
      }

      // Phone number validation - covers all telephone fields
      const isTelephoneField =
        field.type === "tel" ||
        fieldName.includes("phone") ||
        fieldName.includes("mobile") ||
        fieldName.includes("landline") ||
        fieldName.includes("fax") ||
        fieldName.includes("whatsapp") ||
        fieldId === "contactMobileNo" ||
        fieldId === "landlineNo" ||
        fieldId === "referralContactNo" ||
        fieldId === "mobileNo" ||
        fieldId === "whatsApp" ||
        fieldId === "landLineNo" ||
        fieldId === "fax";

      if (isTelephoneField) {
        const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits
        const cleanValue = valueStr.replace(/\D/g, "");
        if (cleanValue.length > 0 && !phoneRegex.test(cleanValue)) {
          if (cleanValue.length < 10) {
            return "Please enter exactly 10 digits for phone number";
          } else if (cleanValue.length > 10) {
            return "Phone number cannot exceed 10 digits";
          } else {
            return "Please enter a valid 10-digit phone number (numbers only)";
          }
        }
      }

      // Minimum character validation based on field names
      let minLength = 0;
      if (fieldName.includes("name") && !fieldName.includes("username")) {
        minLength = 2;
      } else if (
        fieldName.includes("address")
      ) {
        minLength = 5;
      } else if (fieldName.includes("description")) {
        minLength = 10;
      } else if (fieldName.includes("password")) {
        minLength = 8;
      }

      // Only show minLength error if the field is required
      if (field.required && minLength > 0 && valueStr.length < minLength) {
        return `${field.fieldName} must be at least ${minLength} characters long`;
      }

      // Maximum character validation
      let maxLength = 0;
      if (fieldName.includes("name") && !fieldName.includes("company")) {
        maxLength = 50;
      } else if (
        fieldName.includes("comment") ||
        fieldName.includes("description")
      ) {
        maxLength = 500;
      }

      if (maxLength > 0 && valueStr.length > maxLength) {
        return `${field.fieldName} cannot exceed ${maxLength} characters`;
      }

      // Date validation - prevent past dates for quotation and similar fields
      if (field.type === "date") {
        // Accept today or any future date (compare only yyyy-MM-dd)
        const todayStr = new Date().toISOString().split("T")[0];
        let inputStr = valueStr;
        if (inputStr.includes("T")) {
          inputStr = inputStr.split("T")[0];
        }
        // If input is dd-MM-yyyy, convert to yyyy-MM-dd
        const ddmmyyyy = inputStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (ddmmyyyy) {
          inputStr = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
        }
        if (inputStr < todayStr) {
          return "Please select today's date or a future date";
        }
      }

      // Numeric validation for specific fields
      if (
        fieldName.includes("age") ||
        fieldName.includes("quantity") ||
        fieldName.includes("amount")
      ) {
        const numValue = Number(valueStr);
        if (isNaN(numValue) || numValue < 0) {
          return `${field.fieldName} must be a valid positive number`;
        }
      }

      return "";
    };

    const handleInputChange = (id: string, value: any) => {
      // Find the field configuration for validation
      const field = filteredFields.find((f) => (f.idName || f.id) === id);

      // Check if this is a telephone field that should only accept numbers
      const isTelephoneField =
        field &&
        (field.type === "tel" ||
          field.fieldName.toLowerCase().includes("phone") ||
          field.fieldName.toLowerCase().includes("mobile") ||
          field.fieldName.toLowerCase().includes("landline") ||
          field.fieldName.toLowerCase().includes("fax") ||
          field.fieldName.toLowerCase().includes("whatsapp") ||
          id === "contactMobileNo" ||
          id === "landlineNo" ||
          id === "referralContactNo" ||
          id === "mobileNo" ||
          id === "whatsApp" ||
          id === "landLineNo" ||
          id === "fax");

      // For telephone fields, sanitize input to only allow numbers and limit to 10 digits
      if (isTelephoneField) {
        const safeValue = typeof value === "string" ? value : "";
        const sanitized = safeValue.replace(/[^0-9]/g, "").slice(0, 10);
        setFormData((prev: any) => ({
          ...prev,
          [id]: sanitized,
        }));

        // Use validateField for real-time validation
        if (field) {
          const validationError = validateField(id, sanitized, field);
          if (validationError) {
            setErrors((prev) => ({
              ...prev,
              [id]: validationError,
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors[id];
              return newErrors;
            });
          }
        }
        return;
      }

      // Handle area selection - find the corresponding areaId from currentAreaItems
      if (id === "area") {
        const selectedAreaItem = currentAreaItems.find(
          (item) => item.divisionName === value,
        );
        if (selectedAreaItem) {
          setFormData((prev: any) => ({
            ...prev,
            area: value,
            areaId: selectedAreaItem.divisionId,
          }));
          // Clear area error if area is valid
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors["area"];
            return newErrors;
          });
        } else {
          // Fallback: just update the area name
          setFormData((prev: any) => ({
            ...prev,
            [id]: value,
            areaId: undefined,
          }));
          // If area is cleared, set error
          if (!value) {
            setErrors((prev) => ({
              ...prev,
              area: "Area is required",
            }));
          }
        }
      } else if (id === "pincode") {
        // If pincode is cleared or not 6 digits, reset all related fields and area dropdown
        if (!value || value.length !== 6 || !/^[0-9]{6}$/.test(value)) {
          setFormData((prev: any) => ({
            ...prev,
            pincode: value,
            pincodeId: undefined,
            area: "",
            areaId: undefined,
            city: "",
            cityId: undefined,
            district: "",
            districtId: undefined,
            state: "",
            stateId: undefined,
            territory: "",
            territoryId: undefined,
          }));
          setCurrentAreaItems([]); // Reset area dropdown options
          // Clear area error when pincode is cleared
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors["area"];
            return newErrors;
          });
        } else {
          setFormData((prev: any) => ({
            ...prev,
            [id]: value,
            // Clear area and areaId if pincode changes
            area: "",
            areaId: undefined,
          }));
          // Clear area error when pincode is changed
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors["area"];
            return newErrors;
          });
        }
      } else {
        setFormData((prev: any) => ({
          ...prev,
          [id]: value,
          // Preserve area and areaId unless pincode or area is changed
          area: prev.area,
          areaId: prev.areaId,
        }));
      }

      // Real-time validation for all fields
      if (field) {
        const validationError = validateField(id, value, field);
        if (validationError) {
          setErrors((prev) => ({
            ...prev,
            [id]: validationError,
          }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
          });
        }
      } else {
        // Fallback: clear error if no field config found
        if (errors[id]) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
          });
        }
      }
    };

    const handlePincodeSearch = async (pincode: string) => {
      setAreaSearchAttempted(false); // Reset before search
      if (!pincode || pincode.length !== 6 || !/^[0-9]{6}$/.test(pincode)) {
        toast.error("Please enter a valid 6-digit pincode");
        return;
      }
      setIsSearchingPincode(true);
      try {
        const response = await axios.get(
          `http://localhost:5104/api/GeographicalDivision/hierarchy/pincode/${pincode}`,
        );
        const hierarchyData: HierarchyData[] = response.data;
        // Mark that search was attempted (for area validation)
        setAreaSearchAttempted(true);
        if (hierarchyData && hierarchyData.length > 0) {
          const updates: Record<string, any> = { pincode };
          // Extract area divisionNames from the response
          const areaItems = hierarchyData.filter(
            (item) => item.divisionType.toLowerCase() === "area",
          );
          const areaOptions = areaItems.map((item) => item.divisionName);

          // Store current area items in state for later use in dropdown selection
          setCurrentAreaItems(areaItems);
          hierarchyData.forEach((item) => {
            switch (item.divisionType.toLowerCase()) {
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
          setFilteredFields((prevFields) =>
            prevFields.map((field) => {
              const isAreaField =
                field.id === "area" || field.idName === "area";
              if (isAreaField) {
                const newOptions = areaItems.map((item) => item.divisionName);
                return {
                  ...field,
                  options: newOptions,
                  disabled: areaItems.length === 1, // Disable if only one option (auto-selected)
                  // Always visible if area options exist
                  hidden: false,
                };
              }
              return field;
            }),
          );
          setFormData((prev: any) => {
            let updatesCopy = { ...prev, ...updates };
            // Only update area/areaId if pincode is being changed
            if (typeof updates.pincode !== "undefined") {
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
            } else {
              // If pincode is not being changed, preserve area and areaId
              updatesCopy.area = prev.area;
              updatesCopy.areaId = prev.areaId;
            }
            return updatesCopy;
          });
          toast.success("Location details fetched successfully!");
        } else {
          setCurrentAreaItems([]); // Clear area items if no location data
          setAreaSearchAttempted(true); // Mark search attempted
          toast.error("No location data found for this pincode");
        }
      } catch (error) {
        setAreaSearchAttempted(true); // Mark search attempted on error
        console.error("Failed to fetch pincode hierarchy", error);
        toast.error("Failed to fetch location details");
      } finally {
        setIsSearchingPincode(false);
      }
    };
    // Update form data with location details
    const updateLocationData = (matched: LocationData) => {
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
        territory: matched.territory,
        territoryId: matched.territoryId,
      };

      setFormData((prev: any) => ({
        ...prev,
        ...updates,
      }));
    };

    const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      filteredFields.filter(isFieldVisible).forEach((field) => {
        const fieldId = getFieldId(field);
        if (
          field.required &&
          (!formData[fieldId] || formData[fieldId].toString().trim() === "")
        ) {
          newErrors[fieldId] = `${field.fieldName} is required`;
        }
      });

      // Special handling for area: if area is filled, remove error
      if (formData.area && formData.area.toString().trim() !== "") {
        delete newErrors["area"];
      }

      // Real-time validation already handles all field validation including phone and email
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const renderDropdown = (field: Field) => {
      const fieldId = getFieldId(field);
      const currentValue = formData[fieldId];
      let options: { label: string; value: string }[] = [];

      // Assigned To dropdown: show username as label, userId as value
      if (field.fieldName && field.fieldName.toLowerCase() === "assigned to") {
        options = assignedToOptions.map((u: any) => ({
          value: String(u.userId),
          label: u.username,
        }));
        return (
          <Select
            id={fieldId}
            value={options.find((opt) => opt.value === String(currentValue)) || null}
            onChange={(selectedOption) => {
              handleInputChange(fieldId, selectedOption?.value || "");
            }}
            options={options}
            isDisabled={loadingAssignedTo}
            isLoading={loadingAssignedTo}
            placeholder={
              loadingAssignedTo ? "Loading..." : `Select ${field.fieldName}`
            }
            classNamePrefix="react-select"
            isClearable
            menuShouldScrollIntoView={false}
            menuPlacement="auto"
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              menu: (base) => ({ ...base, zIndex: 9999 }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#e0e7ff" : "#fff",
                color: state.isSelected ? "#fff" : "#111827",
              }),
            }}
          />
        );
      }

      const handleSelectionChange = (value: string) => {
        handleInputChange(fieldId, value);
        handleFieldVisibility(fieldId, value);

        if (field.URL === "api/SalesLead" && value) {
          const selectedLead = apiData.find((item) => {
            if (field.id === "leadId") {
              return item.leadId === value;
            } else if (field.id === "customerName") {
              return item.customerName === value;
            }
            return false;
          });

          if (selectedLead) {
            handleInputChange("leadId", selectedLead.leadId);
            handleInputChange("customerName", selectedLead.customerName);
            if (selectedLead.contactName) {
              handleInputChange("contactName", selectedLead.contactName);
            }
            if (selectedLead.contactMobileNo) {
              handleInputChange(
                "contactMobileNo",
                selectedLead.contactMobileNo,
              );
            }
          }
        } else if (field.URL === "api/SalesOpportunity/with-items" && value) {
          let selectedOpportunity;

          if (field.id === "opportunityId") {
            selectedOpportunity = opportunityData.find(
              (item) => item.opportunityId === value,
            );
          } else if (field.id === "customerName") {
            selectedOpportunity = opportunityData.find(
              (item) => item.customerName === value,
            );
          } else if (field.id === "assignedTo") {
            selectedOpportunity = assignedToOptions.find(
              (item) => item.username === value,
            );
          }

          console.log("Selected opportunity:", selectedOpportunity);
          console.log("setOptions function available:", !!setOptions);

          if (selectedOpportunity) {
            // Auto-populate all related fields
            handleInputChange(
              "opportunityId",
              selectedOpportunity.opportunityId,
            );
            handleInputChange("assignedTo", selectedOpportunity.userId);
            handleInputChange("customerName", selectedOpportunity.customerName);
            handleInputChange("contactName", selectedOpportunity.contactName);
            handleInputChange(
              "contactMobileNo",
              selectedOpportunity.contactMobileNo,
            );

            if (selectedOpportunity.leadId) {
              handleInputChange("leadId", selectedOpportunity.leadId);
            }
            if (setOpportunityId && selectedOpportunity.id) {
              setOpportunityId(String(selectedOpportunity.id));
            }

            // Set options with itemNames from opportunity items
            if (selectedOpportunity.items && setOptions) {
              // Map items to include required Product fields
              const mappedItems = selectedOpportunity.items.map(
                (item: any) => ({
                  ...item,
                  itemName:
                    item.itemName || item.product || item.itemname || "",
                  itemCode: item.itemCode || item.itemcode || "",
                  unitPrice: item.unitPrice || item.unit_price || 0,
                  // add any other fields needed for downstream usage
                }),
              );
              setOptions(mappedItems);
            }
          }
        } else if (field.id === "pincode") {
          const matched = locationOptions.find(
            (item) => item.pincode === value,
          );
          if (matched) {
            updateLocationData(matched);
          }
        }
      };

      // Handle different types of dropdowns
      if (field.URL === "/api/SalesCustomer") {
        const customerData = customApiData[fieldId] || [];
        const valueField = field.valueField || "customerId";
        const labelField = field.labelField || "customerId";
        options = customerData.map((item: any) => ({
          label: item[labelField],
          value: item[valueField],
        }));
      } else if (field.URL === "api/SalesLead") {
        // Exclude leads with status 'Converted'
        const filteredLeads = apiData.filter(
          (item) => String(item.status).toLowerCase() !== "converted",
        );
        if (field.id === "leadId") {
          options = filteredLeads.map((item) => ({
            label: `${item.leadId}`,
            value: item.leadId,
          }));
        } else if (field.id === "customerName") {
          options = filteredLeads.map((item) => ({
            label: `${item.leadId}- ${item.customerName}`,
            value: item.customerName || item.CustomerName || "",
          }));
          // PATCH: If current value is not in options, add it as the first option (label is just the hospital name)
          if (
            currentValue &&
            !options.some((opt) => opt.value === currentValue)
          ) {
            options = [
              { label: currentValue, value: currentValue },
              ...options,
            ];
          }
        }
      } else if (field.URL === "api/SalesOpportunity/with-items") {
        if (field.id === "opportunityId") {
          // Show user-friendly opportunityId with opportunityId as value
          options = opportunityData.map((item) => ({
            label: `${item.opportunityId}`,
            value: item.opportunityId, // Use opportunityId as value
          }));
        } else if (field.id === "customerName") {
          // For customerName dropdown from opportunity data
          options = opportunityData.map((item) => ({
            label: item.customerName,
            value: item.customerName,
          }));
        }
      } else if (field.options) {
        options = field.options.map((option) => ({
          label: option,
          value: option,
        }));
      } else if (field.id === "presenterName") {
        options = presenterOptions.map((item) => ({
          label: item.username,
          value: String(item.id),
        }));
      }

      // Special handling for area field: use currentAreaItems if available
      let isAreaField = field.id === "area" || field.idName === "area";
      let areaFieldShouldBeDisabled = false;
      if (isAreaField && currentAreaItems.length > 0) {
        options = currentAreaItems.map((item) => ({
          label: item.divisionName,
          value: item.divisionName,
        }));
        if (currentAreaItems.length === 1) {
          areaFieldShouldBeDisabled = true;
        }
      }

      // If area field and options are empty, show error message only if search attempted
      let showNoAreaError = false;
      if (isAreaField && currentAreaItems.length === 0 && areaSearchAttempted) {
        showNoAreaError = true;
      }

      // --- PATCH: Ensure area dropdown always includes current value and shows all available options ---
      if (field.id === "area" || field.idName === "area") {
        // If more than one area and no area selected, set first as default
        if (options.length > 1 && !currentValue) {
          const firstArea = options[0];
          setFormData((prev: any) => ({
            ...prev,
            area: firstArea.value,
            areaId: currentAreaItems[0]?.divisionId,
          }));
        }
        if (
          currentValue &&
          !options.some((opt) => opt.value === currentValue)
        ) {
          options = [{ label: currentValue, value: currentValue }, ...options];
        }
      }
      // PATCH: Ensure status dropdown always includes current value (e.g., 'New')
      if (
        (field.id === "status" || field.idName === "status") &&
        currentValue
      ) {
        // Remove Draft if current status is not Draft
        if (String(currentValue).trim().toLowerCase() !== "draft") {
          options = options.filter(
            (opt) => String(opt.value).trim().toLowerCase() !== "draft",
          );
        }
        const normalizedCurrent = String(currentValue).trim().toLowerCase();
        if (
          !options.some(
            (opt) =>
              String(opt.value).trim().toLowerCase() === normalizedCurrent,
          )
        ) {
          options = [{ label: currentValue, value: currentValue }, ...options];
        }
      }
      // PATCH: Ensure leadId dropdown always includes current value (for edit mode)
      if (
        (field.id === "leadId" || field.idName === "leadId") &&
        currentValue
      ) {
        if (!options.some((opt) => opt.value === currentValue)) {
          options = [{ label: currentValue, value: currentValue }, ...options];
        }
      }
      // ---------------------------------------------------------------

      // For opportunityId and customerName, selectedOption should match by respective field
      let selectedOption;
      if (field.id === "presenterName") {
        selectedOption = options.find(
          (opt) => String(opt.value) === String(formData.presenterId),
        );
      } else if (field.id === "customerName" && field.URL === "api/SalesLead") {
        // Always show only the hospital name in the field, even if label is leadId-customerName
        selectedOption = currentValue
          ? { label: currentValue, value: currentValue }
          : null;
      } else if (field.URL === "api/SalesOpportunity/with-items") {
        if (field.id === "opportunityId") {
          // For opportunity dropdown, match by opportunityId string in formData
          const currentOpportunityId = formData[fieldId];
          selectedOption = currentOpportunityId
            ? options.find((opt) => opt.value === currentOpportunityId)
            : null;
        } else if (field.id === "customerName") {
          // For customerName dropdown, match by customerName string in formData
          const currentCustomerName = formData[fieldId];
          selectedOption = currentCustomerName
            ? options.find((opt) => opt.value === currentCustomerName)
            : null;
        }
      } else {
        selectedOption =
          options.find((opt) => opt.value === currentValue) || null;
      }

      // If area field should be disabled (only one option), force disabled and gray background
      // Use per-field loading state
      const isDisabled =
        isAreaField && areaFieldShouldBeDisabled
          ? true
          : field.disabled || loadingFields[field.id || field.idName || ""];
      const bgColor =
        isAreaField && areaFieldShouldBeDisabled
          ? "#e5e7eb"
          : field.disabled
            ? "#e5e7eb"
            : "#fff";

      return (
        <>
          <Select
            id={fieldId}
            value={selectedOption}
            onChange={(selectedOption) => {
              if (field.URL === "api/SalesOpportunity/with-items") {
                let selectedOpportunity;
                if (field.id === "opportunityId") {
                  selectedOpportunity = opportunityData.find(
                    (item) => item.opportunityId === selectedOption?.value,
                  );
                } else if (field.id === "customerName") {
                  selectedOpportunity = opportunityData.find(
                    (item) => item.customerName === selectedOption?.value,
                  );
                }
                if (selectedOpportunity) {
                  handleInputChange(
                    "opportunityId",
                    selectedOpportunity.opportunityId,
                  );
                  handleInputChange(
                    "customerName",
                    selectedOpportunity.customerName,
                  );
                  handleInputChange(
                    "contactName",
                    selectedOpportunity.contactName,
                  );
                  handleInputChange(
                    "contactMobileNo",
                    selectedOpportunity.contactMobileNo,
                  );
                  if (selectedOpportunity.leadId) {
                    handleInputChange("leadId", selectedOpportunity.leadId);
                  }
                  if (setOpportunityId && selectedOpportunity.id) {
                    setOpportunityId(String(selectedOpportunity.id));
                  }
                  if (selectedOpportunity.items && setOptions) {
                    const mappedItems = selectedOpportunity.items.map(
                      (item: any) => ({
                        ...item,
                        itemName: item.itemname ?? item.itemName ?? "",
                        itemCode: item.itemcode ?? item.itemCode ?? "",
                        unitPrice: item.unit_price ?? item.unitPrice ?? 0,
                        includedChildItems: item.includedChildItems ?? [],
                        accessoriesItems: item.accessoriesItems ?? [],
                      }),
                    );
                    setOptions(mappedItems);
                  }
                } else {
                  if (field.id === "opportunityId") {
                    handleInputChange("opportunityId", "");
                  } else if (field.id === "customerName") {
                    handleInputChange("customerName", "");
                  }
                  if (setOptions) {
                    setOptions([]);
                  }
                }
                handleFieldVisibility(fieldId, selectedOption?.value || "");
              } else if (isAreaField) {
                const selectedAreaItem = currentAreaItems.find(
                  (item) => item.divisionName === selectedOption?.value,
                );
                if (selectedAreaItem) {
                  handleInputChange("area", selectedOption?.value || "");
                  handleInputChange("areaId", selectedAreaItem.divisionId);
                } else {
                  handleInputChange("area", selectedOption?.value || "");
                }
                handleFieldVisibility(fieldId, selectedOption?.value || "");
              } else {
                handleSelectionChange(selectedOption?.value || "");
              }
            }}
            options={options}
            isDisabled={isDisabled}
            isLoading={!!loadingFields[field.id || field.idName || ""]}
            placeholder={
              !!loadingFields[field.id || field.idName || ""]
                ? "Loading..."
                : `Select ${field.fieldName}`
            }
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
                boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
                "&:hover": { borderColor: "#3b82f6" },
                backgroundColor: bgColor,
              }),
              placeholder: (base) => ({
                ...base,
                color: !!loadingFields[field.id || field.idName || ""]
                  ? "#9ca3af"
                  : "#6b7280",
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isSelected
                  ? "#3b82f6"
                  : state.isFocused
                    ? "#e0e7ff"
                    : "#fff",
                color: state.isSelected ? "#fff" : "#111827",
              }),
              singleValue: (base, state) => ({
                ...base,
                color: isDisabled ? "#111827" : "#111827",
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999,
                maxHeight: 150, // Limit height of dropdown
                overflowY: "auto",
                pointerEvents: "auto", // Enable vertical scrolling
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: 150,
                overflowY: "auto",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            isClearable
            menuShouldScrollIntoView={false}
            menuPlacement="auto"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </>
      );
    };

    // Multiselect field renderer
    const renderMultiSelectField = (field: Field) => {
      const fieldId = getFieldId(field);
      const currentValue = formData[fieldId] || [];
      let options: { label: string; value: string }[] = [];
      if (field.id === "presenterName") {
        // Use presenterOptions from API
        options = presenterOptions.map((item) => ({
          label: item.username,
          value: String(item.id),
        }));
      } else if (field.options) {
        options = field.options.map((option) => ({
          label: option,
          value: option,
        }));
      }
      return (
        <Select
          id={fieldId}
          value={options.filter(
            (opt) =>
              currentValue.includes(opt.value) ||
              currentValue.includes(opt.label),
          )}
          onChange={(selected) => {
            let values: any = [];
            if (field.id === "presenterName") {
              // selected is array of {label, value}
              const selectedArr = Array.isArray(selected) ? selected : [];
              const presenterIds = selectedArr.map((opt) => opt.value);
              const presenterNames = selectedArr.map((opt) => opt.label);
              setFormData((prev: any) => ({
                ...prev,
                presenterName: presenterNames,
                presenterId: presenterIds,
              }));
              values = presenterNames;
            } else {
              values = Array.isArray(selected)
                ? selected.map((opt) => opt.value)
                : [];
              handleInputChange(fieldId, values);
            }

            // Real-time validation for multi-select
            const validationError = validateField(fieldId, values, field);
            if (validationError) {
              setErrors((prev) => ({
                ...prev,
                [fieldId]: validationError,
              }));
            } else {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
              });
            }
          }}
          options={options}
          isMulti
          isDisabled={
            field.disabled || !!loadingFields[field.id || field.idName || ""]
          }
          placeholder={`Select ${field.fieldName}`}
          classNamePrefix="react-select"
          menuPortalTarget={document.body}
          menuPosition="fixed"
          styles={{
            control: (base, state) => ({
              ...base,
              borderColor: errors[fieldId] ? "#f87171" : "#d1d5db",
              boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : "none",
              "&:hover": { borderColor: "#3b82f6" },
              backgroundColor:
                field.disabled ||
                !!loadingFields[field.id || field.idName || ""]
                  ? "#f3f4f6"
                  : "#fff",
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? "#3b82f6"
                : state.isFocused
                  ? "#e0e7ff"
                  : "#fff",
              color: state.isSelected ? "#fff" : "#111827",
            }),
            multiValue: (base) => ({
              ...base,
              backgroundColor: "#e0e7ff",
              color: "#111827",
            }),
            multiValueLabel: (base) => ({
              ...base,
              color: "#111827",
            }),
            multiValueRemove: (base) => ({
              ...base,
              color: "#111827",
              "&:hover": {
                backgroundColor: "#dc2626",
                color: "#fff",
              },
            }),
          }}
        />
      );
    };

    const renderSearchTextField = (field: Field) => {
      const fieldId = getFieldId(field);
      // Auto-trigger pincode search when 6 digits are entered
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        // Only allow up to 6 digits for pincode
        if (fieldId === "pincode") {
          const safeValue = typeof value === "string" ? value : "";
          value = safeValue.replace(/[^0-9]/g, "").slice(0, 6);
        }
        handleInputChange(fieldId, value);
        if (
          fieldId === "pincode" &&
          value &&
          value.length === 6 &&
          /^[0-9]{6}$/.test(value)
        ) {
          handlePincodeSearch(value);
        }
      };
      return (
        <div className="relative">
          <input
            type="text"
            id={fieldId}
            value={formData[fieldId] || ""}
            onChange={handleChange}
            maxLength={fieldId === "pincode" ? 6 : undefined}
            className={`w-full border ${
              errors[fieldId] ? "border-red-500" : "border-gray-300"
            }
          ${
            field.disabled
              ? "bg-gray-200 text-black cursor-not-allowed"
              : "bg-white text-black"
          }
          rounded-sm py-1.5 px-3 text-gray-700 focus:outline-none 
          ${field.disabled ? "" : "focus:ring-2 focus:ring-blue-500"} 
          transition-all duration-200`}
            required={field.required}
            disabled={field.disabled}
            placeholder={`Enter ${field.fieldName}`}
          />
        </div>
      );
    };

    const renderTextField = (field: Field) => {
      const fieldId = getFieldId(field);
      // Special handling for date fields
      if (field.type === "date") {
        // Always normalize value to yyyy-MM-dd for input
        let value = formData[fieldId] || "";
        if (typeof value === "string") {
          // Convert T format (e.g. 2025-07-10T00:00:00) to yyyy-MM-dd
          if (value.includes("T")) {
            value = value.split("T")[0];
          }
          // Convert dd-MM-yyyy to yyyy-MM-dd
          const ddmmyyyy = value.match(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
          if (ddmmyyyy) {
            value = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
          }
        }
        // For quotation date and similar fields, use today's date as default if empty
        if (!value) {
          const fieldName = field.fieldName.toLowerCase();
          if (
            fieldName.includes("quotation") ||
            fieldName.includes("created") ||
            (fieldName.includes("date") &&
              !fieldName.includes("expected") &&
              !fieldName.includes("completion"))
          ) {
            value = new Date().toISOString().split("T")[0];
          }
        }
        // Always store normalized value in formData
        if (formData[fieldId] !== value) {
          setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
        }
        return (
          <input
            type="date"
            id={fieldId}
            value={value}
            onChange={(e) => handleInputChange(fieldId, e.target.value)}
            className={`w-full border ${
              errors[fieldId] ? "border-red-500" : "border-gray-300"
            } ${
              field.disabled
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-black"
            } rounded-sm py-1.5 px-3 text-gray-700 focus:outline-none ${
              field.disabled ? "" : "focus:ring-2 focus:ring-orange-500"
            } transition-all duration-200`}
            required={field.required}
            disabled={field.disabled}
            placeholder="Enter Date"
            style={{ color: "black" }}
            min={new Date().toISOString().split("T")[0]}
          />
        );
      }
      // PATCH: If status field and should be read-only, use same style as other read-only fields
      if (
        (fieldId.toLowerCase() === "status" ||
          field.fieldName.toLowerCase() === "status") &&
        field.disabled &&
        field.hidden
      ) {
        return (
          <input
            type="text"
            id={fieldId}
            value={formData[fieldId] || ""}
            readOnly
            className="w-full border border-gray-300 bg-gray-100 text-gray-800 rounded-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder={`Enter ${field.fieldName}`}
            style={{ color: "#111827" }}
          />
        );
      }
      return (
        <input
          type={field.type}
          id={fieldId}
          value={formData[fieldId] || ""}
          onChange={(e) => handleInputChange(fieldId, e.target.value)}
          className={`w-full border ${
            errors[fieldId] ? "border-red-500" : "border-gray-300"
          }
          ${
            field.disabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-white text-black"
          }
          rounded-sm py-1.5 px-3 text-gray-700 focus:outline-none 
          ${field.disabled ? "" : "focus:ring-2 focus:ring-blue-500"} 
          transition-all duration-200`}
          required={field.required}
          disabled={field.disabled}
          placeholder={`${
            field.id !== "salesRepresentative" ? `Enter ${field.fieldName}` : ""
          }`}
          style={{ color: "black" }}
        />
      );
    };

    const renderTextAreaField = (field: Field) => {
      const fieldId = getFieldId(field);
      return (
        <textarea
          id={fieldId}
          value={formData[fieldId] || ""}
          onChange={(e) => handleInputChange(fieldId, e.target.value)}
          rows={4}
          className={`w-full border ${
            errors[fieldId] ? "border-red-500" : "border-gray-300"
          }
        ${
          field.disabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-white"
        }
        rounded-sm py-1.5 px-3 text-gray-700 focus:outline-none 
        ${field.disabled ? "" : "focus:ring-2 focus:ring-blue-500"} 
        transition-all duration-200`}
          required={field.required}
          disabled={field.disabled}
          placeholder={`Enter ${field.fieldName}`}
        />
      );
    };

    const renderContactNameField = (contactNameField: Field) => {
      const contactNameId = getFieldId(contactNameField);
      const salutationValue = formData.salutation || "";
      const contactNameValue = formData[contactNameId] || "";
      // Unified disabled style for both dropdown and input
      const disabledStyle =
        "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300";
      const enabledSelectStyle = "bg-white text-gray-700 border-gray-300";
      const enabledInputStyle = "bg-white text-black border-gray-300";
      return (
        <div className="flex">
          <select
            value={salutationValue}
            onChange={(e) => handleInputChange("salutation", e.target.value)}
            disabled={contactNameField.disabled}
            className={`border rounded-l-sm py-1.5 px-3 min-w-[80px] focus:outline-none transition-all duration-200 border-r-0
              ${errors.salutation ? "border-red-500" : "border-gray-300"}
              ${contactNameField.disabled ? disabledStyle : enabledSelectStyle}
              ${
                contactNameField.disabled
                  ? ""
                  : "focus:ring-2 focus:ring-blue-500 focus:z-10"
              }`}
          >
            <option value="">Title</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Dr.">Dr.</option>
          </select>

          <input
            type="text"
            id={contactNameId}
            value={contactNameValue}
            onChange={(e) => handleInputChange(contactNameId, e.target.value)}
            className={`flex-1 border rounded-r-sm py-1.5 px-3 focus:outline-none transition-all duration-200
              ${errors[contactNameId] ? "border-red-500" : "border-gray-300"}
              ${contactNameField.disabled ? disabledStyle : enabledInputStyle}
              ${
                contactNameField.disabled
                  ? ""
                  : "focus:ring-2 focus:ring-blue-500 focus:z-10"
              }`}
            required={contactNameField.required}
            disabled={contactNameField.disabled}
            placeholder="Enter contact name"
          />
        </div>
      );
    };
    // Function to check field visibility
    const isFieldVisible = useCallback(
      (field: Field): boolean => {
        // Always show area field
        if (field.id === "area" || field.idName === "area") {
          return true;
        }
        // Only apply visibility if both parentFldForVisible and parentFldValForVisible are set
        if (!field.parentFldForVisible || !field.parentFldValForVisible) {
          return true;
        }
        // Do not hide any field if the parent is status (fix for area disappearing)
        if (field.parentFldForVisible.toLowerCase() === "status") {
          return true;
        }
        return (
          formData[field.parentFldForVisible] === field.parentFldValForVisible
        );
      },
      [formData],
    );

    useEffect(() => {
      // Fill area field in edit mode if areaId or area is present in data
      if (data && (data.areaId || data.area) && locationOptions.length > 0) {
        const matched = data.areaId
          ? locationOptions.find((item) => item.areaId === data.areaId)
          : locationOptions.find((item) => item.area === data.area);
        if (matched) {
          setFormData((prev: any) => ({
            ...prev,
            area: matched.area,
            areaId: matched.areaId,
            pincode: matched.pincode,
            pincodeId: matched.pincodeId,
            city: matched.city,
            cityId: matched.cityId,
            district: matched.district,
            districtId: matched.districtId,
            state: matched.state,
            stateId: matched.stateId,
            territory: matched.territory,
            territoryId: matched.territoryId,
          }));
        }
      }
    }, [data, locationOptions, setFormData]);

    // Fetch customer data when dataType changes to "Customer"
    useEffect(() => {
      const fetchCustomerData = async () => {
        if (formData.dataType === "Customer") {
          const customerField = config.fields.find(
            (f: any) => f.URL === "/api/SalesCustomer",
          );
          if (customerField) {
            const fieldId = customerField.idName || customerField.id;
            try {
              setLoadingFields((prev) => ({ ...prev, [fieldId]: true }));
              const response = await axios.get(
                "http://localhost:5104/api/SalesCustomer",
              );
              setCustomApiData((prev) => ({
                ...prev,
                [fieldId]: response.data || [],
              }));
            } catch (err) {
              console.error("Failed to fetch customer data", err);
              toast.error("Failed to load customer data");
              setCustomApiData((prev) => ({
                ...prev,
                [fieldId]: [],
              }));
            } finally {
              setLoadingFields((prev) => ({ ...prev, [fieldId]: false }));
            }
          }
        }
      };
      fetchCustomerData();
    }, [formData.dataType, config.fields]);

    // Fetch presenter dropdown options
    useEffect(() => {
      const fetchPresenters = async () => {
        try {
          const response = await axios.get(
            "http://localhost:5104/api/PresenterDropdown/presenterDropdown",
          );
          setPresenterOptions(response.data);
        } catch (err) {
          console.error("Failed to fetch presenter options", err);
          setPresenterOptions([]);
        }
      };
      fetchPresenters();
    }, [config.fields]);

    // Assigned To dropdown state and effect (top-level, not in renderDropdown)

    useEffect(() => {
      // Only fetch if the field is present in config
      if (
        config.fields.some(
          (f: any) =>
            f.fieldName && f.fieldName.toLowerCase() === "assigned to",
        )
      ) {
        const assignedToField = config.fields.find(
          (f: any) =>
            f.fieldName && f.fieldName.toLowerCase() === "assigned to",
        );

        setLoadingAssignedTo(true);

        // Check if using hierarchy-based URL
        if (assignedToField?.URL?.includes("UmTeamHierarchy/subordinates")) {
          const userRole = JSON.parse(localStorage.getItem("role") || "{}");
          const isAdmin = userRole?.roleName?.toLowerCase() === "admin";

          api
            .get("UmTeamHierarchy")
            .then((res) => {
              const hierarchyData = res.data?.data || res.data;
              const arr = Array.isArray(hierarchyData) ? hierarchyData : [];

              const normalize = (user: any) => ({
                userId: user.userId ?? user.UserId,
                username: user.username ?? user.Username,
                parentUserId: user.parentUserId ?? user.ParentUserId,
              });

              const normalized = arr.map(normalize);

              if (isAdmin) {
                setAssignedToOptions(normalized);
              } else {
                const buildSubordinates = (data: any[], parentId: number): any[] => {
                  const result: any[] = [];
                  data.forEach((item) => {
                    if (item.parentUserId === parentId && item.userId !== parentId) {
                      result.push(item);
                      result.push(...buildSubordinates(data, item.userId));
                    }
                  });
                  return result;
                };
                const subordinates = buildSubordinates(normalized, currentUser.userId);
                // fallback: if no subordinates found, show all users
                setAssignedToOptions(subordinates.length > 0 ? subordinates : normalized);
              }
            })
            .catch(() => {
              // fallback to assigned-to-dropdown endpoint
              api
                .get(`SalesLead/assigned-to-dropdown?userId=${currentUser.userId}`)
                .then((res) => setAssignedToOptions(res.data || []))
                .catch(() => setAssignedToOptions([]))
                .finally(() => setLoadingAssignedTo(false));
            })
            .finally(() => setLoadingAssignedTo(false));
        } else {
          // Use original endpoint
          api
            .get(`SalesLead/assigned-to-dropdown?userId=${currentUser.userId}`)
            .then((res) => setAssignedToOptions(res.data || []))
            .catch(() => setAssignedToOptions([]))
            .finally(() => setLoadingAssignedTo(false));
        }
      }
    }, [config.fields, currentUser.userId]);

    return (
      <div className="pb-2 bg-white shadow border-b">
        <div className="relative mb-3 border-b-2 border-gray-200">
          <div className="  relative z-10 flex items-center gap-3 p-2">
            <span className="bg-blue-100 p-2 rounded-lg">
              <MdAddBusiness className="w-6 h-6 text-blue-600" />
            </span>
            <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
              {config.title}
            </h2>
          </div>
        </div>
        <div className="px-6">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {filteredFields
                .filter(isFieldVisible)
                .filter((field) => field.type !== "textarea")
                .map((field) => {
                  const fieldId = getFieldId(field);
                  // Only for status field: if value is 'Converted', render as label and value
                  if (
                    (fieldId.toLowerCase() === "status" ||
                      field.fieldName.toLowerCase() === "status") &&
                    formData[fieldId] === "Converted"
                  ) {
                    return (
                      <div key={fieldId} className="form-field group">
                        <label className="block text-sm font-medium text-black mb-1.5 group-hover:text-blue-700 transition-colors">
                          {field.fieldName}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <span className="text-gray-700 pl-1">Converted</span>
                      </div>
                    );
                  }

                  if (
                    fieldId.toLowerCase() === "contactname" ||
                    field.fieldName.toLowerCase().includes("contact name")
                  ) {
                    return (
                      <div key={fieldId} className="form-field group">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 group-hover:text-blue-700 transition-colors">
                          {field.fieldName}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        {renderContactNameField(field)}
                        {(errors[fieldId] || errors.salutation) && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[fieldId] || errors.salutation}
                          </p>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={fieldId} className="form-field group">
                      <label className="block text-sm font-medium text-black mb-1.5 group-hover:text-blue-700 transition-colors">
                        {field.fieldName}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {field.type === "dropdown"
                        ? renderDropdown(field)
                        : field.type === "multiselect"
                          ? renderMultiSelectField(field)
                          : field.type === "multiselectwithother"
                            ? (
                              <MultiSelectWithOther
                                options={(field.options || []).map((o: any) =>
                                  typeof o === "object" && o !== null && "id" in o && "name" in o
                                    ? { id: String(o.id), name: String(o.name) }
                                    : { id: String(o), name: String(o) }
                                )}
                                selectedIds={(() => {
                                  const opts = (field.options || []).map((o: any) =>
                                    typeof o === "object" && o !== null && "id" in o && "name" in o
                                      ? { id: String(o.id), name: String(o.name) }
                                      : { id: String(o), name: String(o) }
                                  );
                                  const raw = Array.isArray(formData[fieldId]) ? formData[fieldId] : [];
                                  return raw.map((v: any) => {
                                    const strV = typeof v === "string" ? v.trim() : String(v).trim();
                                    // Match by name (case-insensitive), then by id
                                    const byName = opts.find(o => o.name.toLowerCase().trim() === strV.toLowerCase());
                                    if (byName) return byName.id;
                                    const byId = opts.find(o => o.id === strV);
                                    if (byId) return byId.id;
                                    return strV; // custom "other" value
                                  });
                                })()}
                                onChange={(selected: string[]) => {
                                  // Convert ids back to names for storage
                                  const opts = (field.options || []).map((o: any) =>
                                    typeof o === "object" && o !== null && "id" in o && "name" in o
                                      ? { id: String(o.id), name: String(o.name) }
                                      : { id: String(o), name: String(o) }
                                  );
                                  const names = selected.map(id => {
                                    const found = opts.find(o => o.id === id);
                                    return found ? found.name : id;
                                  });
                                  handleInputChange(fieldId, names);
                                }}
                                placeholder={`Select or enter ${field.fieldName}`}
                              />
                            )
                            : field.type === "searchtext"
                              ? renderSearchTextField(field)
                              : renderTextField(field)}
                      {errors[fieldId] && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors[fieldId]}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="mt-6">
              {filteredFields
                .filter(isFieldVisible)
                .filter((field) => field.type === "textarea")
                .map((field) => {
                  const fieldId = getFieldId(field);
                  return (
                    <div key={fieldId} className="form-field group mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 group-hover:text-blue-700 transition-colors">
                        {field.fieldName}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {field.type === "multiselectwithother" ? (
                        <MultiSelectWithOther
                          options={(field.options || []).map((o: any) =>
                            typeof o === "object" && o !== null && "id" in o && "name" in o
                              ? { id: String(o.id), name: String(o.name) }
                              : { id: String(o), name: String(o) }
                          )}
                          selectedIds={
                            Array.isArray(formData[fieldId])
                              ? formData[fieldId].map((v: any) =>
                                  typeof v === "string"
                                    ? v
                                    : typeof v === "object" && v !== null && "id" in v
                                      ? v.id
                                      : String(v)
                                )
                              : []
                          }
                          onChange={(selected: string[]) => handleInputChange(fieldId, selected)}
                          placeholder={`Select or enter ${field.fieldName}`}
                        />
                      ) : (
                        renderTextAreaField(field)
                      )}
                      {errors[fieldId] && (
                        <p className="text-red-600 text-xs mt-1">
                          {errors[fieldId]}
                        </p>
                      )}
                    </div>
                  );
                })}
            </div>
          </form>
        </div>
      </div>
    );
  },
);
export default GeneralInformation;
