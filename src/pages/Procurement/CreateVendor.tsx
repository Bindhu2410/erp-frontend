import React, { useState, ChangeEvent } from "react";
import InputField from "../../components/common/InputField";
import TagInput from "../../components/common/TagInput";
import api from "../../services/api";
import { toast } from "react-toastify";

interface Address {
  doorNo: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface BankDetail {
  bankName: string;
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
}

interface VendorFormData {
  vendorCode: string;
  vendorName: string;
  phone: string[];
  email: string[];
  gstNo: string;
  panNo: string;
  isRegistered: boolean;
  status: "active" | "inactive";
  address: Address;
  bankDetails: BankDetail;
}

interface CreateVendorProps {
  vendorData?: VendorFormData & { id?: string };
  onUpdate?: () => void; // Callback for when a vendor is updated
  onCreate?: () => void; // Callback for when a vendor is created
  onClose?: () => void; // Callback for when form should be closed
}

const CreateVendor: React.FC<CreateVendorProps> = ({
  vendorData,
  onUpdate,
  onCreate,
  onClose,
}) => {
  const [formData, setFormData] = useState<VendorFormData>({
    vendorCode: vendorData?.vendorCode || "",
    vendorName: vendorData?.vendorName || "",
    phone: vendorData?.phone || [],
    email: vendorData?.email || [],
    gstNo: vendorData?.gstNo || "",
    panNo: vendorData?.panNo || "",
    status: vendorData?.status || "active",
    isRegistered: vendorData?.isRegistered || true,
    address: {
      doorNo: vendorData?.address?.doorNo || "",
      street: vendorData?.address?.street || "",
      area: vendorData?.address?.area || "",
      city: vendorData?.address?.city || "",
      state: vendorData?.address?.state || "",
      country: vendorData?.address?.country || "",
      pincode: vendorData?.address?.pincode || "",
    },
    bankDetails: {
      bankName: vendorData?.bankDetails?.bankName || "",
      accountHolderName: vendorData?.bankDetails?.accountHolderName || "",
      bankAccountNumber: vendorData?.bankDetails?.bankAccountNumber || "",
      ifscCode: vendorData?.bankDetails?.ifscCode || "",
    },
  });

  // Configuration for main form fields
  const formFields = [
    {
      id: "vendorName",
      name: "Vendor Name",
      type: "text",
      required: true,
      colSpan: 1,
    },
    {
      id: "panNo",
      name: "PAN No.",
      type: "text",
      required: false,
      colSpan: 1,
    },
    {
      id: "noOfBills",
      name: "No. of Bills",
      type: "number",
      required: false,
      colSpan: 1,
    },
  ];

  // Configuration for address fields
  const addressFields = [
    { id: "doorNo", name: "Door No.", type: "text" },
    { id: "area", name: "Area", type: "text" },
    { id: "city", name: "City", type: "text" },
    { id: "state", name: "State", type: "text" },
    { id: "pincode", name: "Pincode", type: "text" },
  ];

  // Configuration for bank detail fields
  const bankDetailFields = [
    { id: "bankName", name: "Bank Name", type: "text" },
    { id: "accountHolderName", name: "Account Holder Name", type: "text" },
    { id: "bankAccountNumber", name: "Account Number", type: "text" },
    { id: "ifscCode", name: "IFSC Code", type: "text" },
  ];

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData((prev) => {
      if (field === "isRegistered" && value === false) {
        return {
          ...prev,
          [field]: value,
          gstNo: "",
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const handleBankDetailsChange = (field: keyof BankDetail, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const handlePhoneChange = (phones: string[]) => {
    setFormData((prev) => ({
      ...prev,
      phone: phones,
    }));
  };
  const handleEmailChange = (emails: string[]) => {
    setFormData((prev) => ({
      ...prev,
      email: emails,
    }));
  };

  const handleSubmit = () => {
    // Convert the form data to match the API request format
    const apiRequestBody = {
      // Use existing ID for updates, 0 for new vendors
      Id: vendorData?.id ? parseInt(vendorData.id) : 0,
      VendorCode: formData.vendorCode,
      VendorName: formData.vendorName,
      Phone: formData.phone,
      Email: formData.email,
      DoorNo: formData.address.doorNo,
      Street: formData.address.street,
      Area: formData.address.area,
      City: formData.address.city,
      State: formData.address.state,
      Country: formData.address.country,
      Pincode: formData.address.pincode,
      Address: `${formData.address.doorNo}, ${formData.address.street}, ${formData.address.area}, ${formData.address.city}, ${formData.address.state}, ${formData.address.country} - ${formData.address.pincode}`,
      GstNumber: formData.gstNo,
      PanNumber: formData.panNo,
      IsRegistered: formData.isRegistered,
      BankName: formData.bankDetails.bankName,
      AccountHolderName: formData.bankDetails.accountHolderName,
      BankAccountNumber: formData.bankDetails.bankAccountNumber,
      IfscCode: formData.bankDetails.ifscCode,
      IsActive: formData.status === "active",
      CreatedAt: vendorData?.id ? undefined : new Date().toISOString(), // Don't modify CreatedAt for existing records
      UpdatedAt: new Date().toISOString(),
    };

    console.log("API Request Body:", apiRequestBody);

    // Make API call here - POST for create, PUT for update
    if (vendorData?.id) {
      // Update existing vendor
      console.log(`Updating vendor with ID: ${vendorData.id}`, apiRequestBody);

      api
        .put(`Supplier/${vendorData.id}`, apiRequestBody)
        .then((response) => {
          console.log("Vendor updated successfully:", response.data);
          toast.success("Vendor updated successfully!");

          // Call the update callback and close modal if provided
          if (onUpdate) onUpdate();
          if (onClose) onClose();
        })
        .catch((error) => {
          console.error("Error updating vendor:", error);
          toast.error("Failed to update vendor. Please try again.");
        });
    } else {
      // Create new vendor
      console.log("Creating new vendor:", apiRequestBody);

      api
        .post("Supplier", apiRequestBody)
        .then((response) => {
          console.log("Vendor created successfully:", response.data);
          toast.success("Vendor created successfully!");

          // Reset form after creating
          setFormData({
            vendorCode: "",
            vendorName: "",
            phone: [],
            email: [],
            gstNo: "",
            panNo: "",
            status: "active",
            isRegistered: true,
            address: {
              doorNo: "",
              street: "",
              area: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            },
            bankDetails: {
              bankName: "",
              accountHolderName: "",
              bankAccountNumber: "",
              ifscCode: "",
            },
          });

          // Call the create callback and optionally close the modal
          if (onCreate) onCreate();
          if (onClose) onClose();
        })
        .catch((error) => {
          console.error("Error creating vendor:", error);
          toast.error("Failed to create vendor. Please try again.");
        });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md m-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create Vendor</h2>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <InputField
          FieldName="Vendor Code"
          IdName="vendorCode"
          Type="text"
          value={formData.vendorCode}
          handleInputChange={handleFormChange}
          required
        />

        <InputField
          FieldName="Vendor Name"
          IdName="vendorName"
          Type="text"
          value={formData.vendorName}
          handleInputChange={handleFormChange}
          required
        />

        <TagInput
          tags={formData.phone}
          setTags={handlePhoneChange}
          placeholder="Type phone number and press Enter"
          label="Phone Numbers"
        />

        <TagInput
          tags={formData.email}
          setTags={handleEmailChange}
          placeholder="Type Email and press Enter"
          label="Email"
        />

        <div className="flex flex-col">
          <label className="mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              handleFormChange("status", e.target.value)
            }
            className="border rounded px-3 py-2"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-2">Registration Status</label>
          <div className="flex items-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.isRegistered === true}
                onChange={() => handleFormChange("isRegistered", true)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Registered</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                checked={formData.isRegistered === false}
                onChange={() => handleFormChange("isRegistered", false)}
                className="form-radio h-5 w-5 text-blue-600"
              />
              <span className="ml-2">Unregistered</span>
            </label>
          </div>
        </div>

        {formData.isRegistered && (
          <InputField
            FieldName="GST No."
            IdName="gstNo"
            Type="text"
            value={formData.gstNo}
            handleInputChange={handleFormChange}
          />
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Supplier Address Details</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Render address fields from configuration */}
          {addressFields.map((field) => (
            <InputField
              key={field.id}
              FieldName={field.name}
              IdName={field.id}
              Type={field.type}
              value={formData.address[field.id as keyof Address]}
              handleInputChange={(_, value) =>
                handleAddressChange(field.id as keyof Address, value)
              }
            />
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Bank Details</h3>
        </div>
        <div className="border p-4 rounded-lg">
          <div className="grid grid-cols-4 gap-4 mb-4">
            {/* Render bank detail fields from configuration */}
            {bankDetailFields.map((field) => (
              <div
                key={field.id}
                className={field.id === "ifscCode" ? "flex gap-2" : ""}
              >
                <InputField
                  FieldName={field.name}
                  IdName={field.id}
                  Type={field.type}
                  value={formData.bankDetails[field.id as keyof BankDetail]}
                  handleInputChange={(_, value) =>
                    handleBankDetailsChange(field.id as keyof BankDetail, value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleSubmit}
        >
          {vendorData?.id ? "Update Vendor" : "Save Vendor"}
        </button>
      </div>
    </div>
  );
};

export default CreateVendor;
