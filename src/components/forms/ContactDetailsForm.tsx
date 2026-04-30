import InputField from "../common/InputField";
import { useEffect, useState } from "react";
import DropDown from "../common/DropDown";
import Select from "react-select";
import axios from "axios";
import { ContactFormData } from "../models/ViewModel";

const LeadContactInfo: React.FC<ContactFormData> = ({
  setContactData,
  setModal,
  editData,
  oppId,
  isEditMode,
  onAddSuccess,
  sectionData,
  apiCall = false,
  leadId,
}) => {
  const [contactFormData, setContactFormData] = useState<any>({});
  console.log(contactFormData, "contactFormData");

  useEffect(() => {
    setContactFormData((prev: any) => ({
      ...prev,
      whatsApp: prev.mobileNo,
    }));
  }, [contactFormData.mobileNo]);

  useEffect(() => {
    if (isEditMode && editData) {
      // Convert string values to arrays for multiselect fields
      const formattedData = {
        ...editData,
        visitingHours: editData.visitingHours?.split(", ") || [],
        clinicVisitingHours: editData.clinicVisitingHours?.split(", ") || [],
        degree: editData.degree?.split(", ") || [],
        ownClinic: editData.ownClinic ? "Yes" : "No", // Convert boolean to Yes/No
      };
      setContactFormData(formattedData);
    }
  }, [isEditMode, editData]);

  const handleInputChange = (field: string, value: any) => {
    console.log(value, field, "ppppp");
    setContactFormData((prevData: any) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submitted:", contactFormData);

    if (!!apiCall) {
      const getUpdatedFields = (newData: any, oldData: any) => {
        const updatedFields = Object.keys(newData).reduce((acc, key) => {
          if (newData[key] !== oldData[key]) {
            acc[key] = newData[key];
          }
          return acc;
        }, {} as Record<string, any>);

        // Always include leadId
        updatedFields.leadId = leadId;
        return updatedFields;
      };
      const accessToken = localStorage.getItem("access_token");
      if (isEditMode && editData) {
        const updatedFields = getUpdatedFields(contactFormData, editData);

        if (Object.keys(updatedFields).length === 0) {
          console.log("No changes to update.");
          return; // Exit if no changes
        }

        try {
          const response = await axios.put(
            `${process.env.REACT_APP_API_BASE_URL}/SalesContact/${editData.id}`,
            {
              id: editData.id,
              contactName: contactFormData.contactName,
              contactMobileNo: contactFormData.mobileNo,
              departmentName: contactFormData.departmentName,
              specialist: contactFormData.specialist,
              degree: Array.isArray(contactFormData.degree)
                ? contactFormData.degree.join(", ")
                : contactFormData.degree,
              email: contactFormData.email,
              mobileNo: contactFormData.mobileNo.toString(),
              isActive: true,
              ownClinic:
                typeof contactFormData.ownClinic === "boolean"
                  ? contactFormData.ownClinic
                  : contactFormData.ownClinic === "Yes",
              visitingHours: Array.isArray(contactFormData.visitingHours)
                ? contactFormData.visitingHours.join(", ")
                : contactFormData.visitingHours,
              clinicVisitingHours: Array.isArray(
                contactFormData.clinicVisitingHours
              )
                ? contactFormData.clinicVisitingHours.join(", ")
                : contactFormData.clinicVisitingHours,
              landLineNo: contactFormData.landLineNo || "",
              fax: contactFormData.fax || "",
              website: contactFormData.website || "",
              salutation: contactFormData.salutation,
              jobTitle: contactFormData.jobTitle || "",
              defaultContact: false,
              salesLeadsId: Number(leadId),
              salesCustomersId: null,
            },

            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          if (response) {
            onAddSuccess && onAddSuccess();
          }

          console.log("Lead address updated successfully:", response.data);
        } catch (error) {
          console.error("Error updating lead address:", error);
        }
      } else {
        // New entry
        try {
          const response = await axios.post(
            "${process.env.REACT_APP_API_BASE_URL}/SalesContact",
            {
              contactName: contactFormData.contactName,
              contactMobileNo: contactFormData.mobileNo,
              departmentName: contactFormData.departmentName,
              specialist: contactFormData.specialist,
              degree: Array.isArray(contactFormData.degree)
                ? contactFormData.degree.join(", ")
                : contactFormData.degree,
              email: contactFormData.email,
              mobileNo: contactFormData.mobileNo,
              isActive: true,
              ownClinic: contactFormData.ownClinic === "Yes" ? true : false,
              visitingHours: Array.isArray(contactFormData.visitingHours)
                ? contactFormData.visitingHours.join(", ")
                : contactFormData.visitingHours,
              clinicVisitingHours: Array.isArray(
                contactFormData.clinicVisitingHours
              )
                ? contactFormData.clinicVisitingHours.join(", ")
                : contactFormData.clinicVisitingHours,
              landLineNo: contactFormData.landLineNo || "",
              fax: contactFormData.fax || "",
              website: contactFormData.website || "",
              salutation: contactFormData.salutation,
              jobTitle: contactFormData.jobTitle || "",
              defaultContact: false,
              salesLeadsId: leadId,
              salesCustomersId: null,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          console.log("Lead address added successfully:", response.data);
        } catch (error) {
          console.error("Error adding lead address:", error);
        }
      }
      onAddSuccess && onAddSuccess();
    } else {
      if (setContactData) {
        if (isEditMode && editData) {
          setContactData((prevData: any[]) =>
            prevData.map((item) =>
              item.id === editData.id
                ? { ...contactFormData, action: "update" }
                : item
            )
          );
        } else {
          setContactData((prevData: any[]) => [
            ...prevData,
            { ...contactFormData, action: "add", leadId: leadId },
          ]);
        }
      }
    }
    setModal(false);
    setContactFormData({});
  };

  const getValidationKey = (Name: string) => {
    return Name === "Hospital Name" ||
      Name === "Hospital/Department of Referral"
      ? "HospitalName"
      : Name === "Address 1" || Name === "Address 2"
      ? "Address"
      : Name === "Contact Name" ||
        Name === "Referral Source Name" ||
        Name === "Product Name"
      ? "Name"
      : Name === "Model" || Name === "Make" || Name === "Job Title"
      ? "Job"
      : Name === "Product ID"
      ? "Id"
      : Name === "Website" || Name === "LinkedIn"
      ? "Link"
      : Name === "Contact Mobile No" ||
        Name === "Mobile Number" ||
        Name === "WhatsApp"
      ? "Mobile"
      : Name === "Phone Number"
      ? "Phone"
      : Name === "Email"
      ? "Email"
      : Name === "Phone Ext"
      ? "extension"
      : "Pincode";
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {sectionData.map((section, index) => (
          <fieldset
            key={index}
            className="w-full p-6 bg-white border rounded-lg border-gray-300 shadow-lg dark:bg-gray-800 mb-6"
          >
            <legend className="px-4 py-2 w-75 flex justify-center text-white font-bold bg-gray-600 border border-gray-300 shadow-md dark:bg-gray-800 rounded-lg">
              {section.title}
            </legend>
            <div className="grid gap-8 mb-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
              {"fields" in section &&
                section.fields.map((field: any, idx: number) => {
                  if (field.type === "select") {
                    return (
                      <DropDown
                        key={idx}
                        Options={field.options?.map((option: any) => ({
                          value: option,
                          label: option,
                        }))}
                        FieldName={field.fieldName}
                        IdName={field.id}
                        values={contactFormData[field.id]}
                        handleOptionChange={handleInputChange}
                        required={field.required}
                        Disabled={field.disabled}
                      />
                    );
                  } else if (field.type === "multiselect") {
                    return (
                      <div>
                        <label
                          htmlFor={field.id}
                          className="block text-md min-w-[120px] font-normal text-gray-900 dark:text-white mb-1"
                        >
                          {field.fieldName}
                        </label>
                        <Select
                          key={idx}
                          options={field.options?.map((option: any) => ({
                            value: option,
                            label: option,
                          }))}
                          isMulti
                          className="basic-multi-select rounded-none"
                          classNamePrefix="select"
                          placeholder="Select"
                          id={field.id}
                          value={
                            Array.isArray(contactFormData[field.id])
                              ? contactFormData[field.id]?.map(
                                  (option: any) => ({
                                    value: option,
                                    label: option,
                                  })
                                )
                              : contactFormData[field.id]
                                  ?.split(", ")
                                  .map((option: string) => ({
                                    value: option,
                                    label: option,
                                  })) || []
                          }
                          onChange={(selectedOptions) => {
                            const selectedValues = selectedOptions.map(
                              (option: any) => option.value
                            );
                            handleInputChange(field.id, selectedValues);
                          }}
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderRadius: 0,
                            }),
                            menu: (base) => ({
                              ...base,
                              borderRadius: 0,
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: 0,
                            }),
                          }}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <InputField
                        key={idx}
                        FieldName={field.fieldName}
                        IdName={field.id}
                        Name={getValidationKey(field.fieldName)}
                        Type={field.type}
                        value={contactFormData[field.id]}
                        handleInputChange={handleInputChange}
                        required={field.required}
                      />
                    );
                  }
                })}
            </div>
          </fieldset>
        ))}
        <div className="flex gap-4 justify-end py-4">
          <button
            type="submit"
            className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-orange-500 rounded-lg border border-orange-500 hover:bg-orange-800 focus:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {isEditMode ? "Update" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadContactInfo;
