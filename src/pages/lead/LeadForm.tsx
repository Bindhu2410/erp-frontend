import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import generalConfig from "../configs/lead/generalInfo.json";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";
import OpportunityForm from "../opportunity/OpportunityForm";
import Modal from "../../components/common/Modal";
import { useUser } from "../../context/UserContext";

interface LeadFormProps {
  onClose?: () => void;
  leadData?: any;
  leadId?: string | undefined;
  onSuccess?: () => void;
  setLeadStatus?: (status: string) => void; // New prop to set lead status
}

const LeadForm: React.FC<LeadFormProps> = ({
  onClose,
  leadData,
  leadId,
  onSuccess,
  setLeadStatus,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const generalInfoRef = useRef<GeneralInformationRef>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    status: "New",
  });
  // Track if status has ever changed from 'New'
  const [statusChangedFromNew, setStatusChangedFromNew] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [savedLeadId, setSavedLeadId] = useState<string | undefined>(
    leadData?.leadId || undefined
  );
  const searchParams = new URLSearchParams(location.search);
  const [validationError, setValidationError] = useState(false);
  const [localId, setLocalId] = useState<string | null>(searchParams.get("id"));
  console.log(formData, "formData");

  const { user, role } = useUser();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  console.log(currentUser.userId, "lead");
  const handleSave = async (skipNavigate = false) => {
    if (!generalInfoRef.current?.validateForm()) {
      setValidationError(true);
      toast.error("Please fix the validation errors before saving.", {
        autoClose: 2000,
      });
      return false;
    } else {
      setValidationError(false);
    }
    setIsSubmitting(true);
    try {
      const currentFormData = generalInfoRef.current?.getFormData() || formData;
      const { title, fields, countryId, ...cleanedFormData } = currentFormData;
      // Keep status in the transformed data
      const transformedData = {
        ...cleanedFormData,
        isActive: true,
        score: "85",
        userCreated: user?.userId,
        UserUpdated: user?.userId,
        status: currentFormData.status || cleanedFormData.status,
      };
      const isEdit = Boolean(localId);
      const endpoint = `${process.env.REACT_APP_API_BASE_URL}SalesLead${
        isEdit ? `/${localId}` : ""
      }`;
      const method = isEdit ? "PUT" : "POST";
      console.log("Transformed Data:", transformedData);
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || `Failed to save data: ${response.status}`
        );
      }
      let responseData: any = {};
      const contentLength = response.headers.get("Content-Length");
      if (response.status !== 204 && contentLength !== "0") {
        try {
          responseData = await response.json();
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }
      // Always save the id from the response if available
      if (responseData?.leadId) {
        setSavedLeadId(responseData.leadId);
        setLocalId(responseData.id);
      }

      // First call onSuccess if provided
      if (onSuccess) {
        await onSuccess();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (skipNavigate) {
        // When creating opportunity, show special message
        toast.success(
          isEdit
            ? "The lead has been updated and is awaiting opportunity details."
            : "The lead has been created and is awaiting opportunity details.",
          { autoClose: 2000 }
        );
      } else {
        // Check the current status to decide whether to close the form
        const currentStatus = transformedData.status;

        if (currentStatus === "Qualified") {
          // Keep form open if status is Qualified
          toast.success(
            isEdit
              ? "Lead updated. You can now create an opportunity."
              : "Lead created. You can now create an opportunity.",
            { autoClose: 2000 }
          );
          // Don't close the form, allowing user to create opportunity
        } else {
          // For non-Qualified status, show success and close form
          toast.success(
            isEdit
              ? "Lead updated successfully!"
              : "Lead created successfully!",
            { autoClose: 2000 }
          );
          // Close form and navigate only for non-Qualified status
          onClose?.();
          navigate("/sales/leads");
        }
      }
      return true;
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save lead"
      );
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modified handleConvertToOpp to handle async save and modal logic for new leads
  const handleConvertToOpp = async () => {
    if (!generalInfoRef.current?.validateForm()) {
      setValidationError(true);
      toast.error(
        "Please fix the validation errors before converting to opportunity.",
        { autoClose: 2000 }
      );
      return;
    }
    // Always save before opening opportunity modal, use PUT if id exists
    setIsSubmitting(true);
    const saveResult = await handleSave(true); // skipNavigate = true
    setIsSubmitting(false);
    if (saveResult) {
      setLeadStatus?.("converted");
      setModal(true);
      setIsConverted(false);
    }
  };

  const handleCancel = () => {
    navigate("/sales/leads");
    onClose?.();
    setLeadStatus?.("Lead");
  };
  useEffect(() => {
    if (validationError) {
      const timeout = setTimeout(() => {
        setValidationError(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [validationError]);
  // Watch for status change from 'New' to something else
  useEffect(() => {
    if (formData.status && formData.status !== "New" && !statusChangedFromNew) {
      setStatusChangedFromNew(true);
    }
  }, [formData.status, statusChangedFromNew]);

  useEffect(() => {
    // If leadData is present (edit mode), set formData with area value
    if (leadData) {
      setFormData((prev: any) => ({
        ...prev,
        ...leadData,
        area: leadData.area || prev.area || "",
      }));
    }
  }, [leadData, setFormData]);

  return (
    <div className="p-4 bg-gray-100">
      {!modal && (
        <div>
          <div className="space-y-6">
            {/* Lead Form Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <GeneralInformation
                ref={generalInfoRef}
                config={{
                  ...generalConfig,
                  // Patch: Hide status dropdown if status was ever changed from 'New' in create mode
                  fields: generalConfig.fields
                    .filter((field: any) => {
                      // Omit Lead ID in new form, show in edit form
                      if (
                        (field.id === "leadId" || field.idName === "leadId") &&
                        !leadData
                      ) {
                        return false;
                      }
                      if (
                        (field.id === "assignedTo" ||
                          field.idName === "assignedTo") &&
                        role?.roleName?.toLowerCase() === "sales representative"
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((field: any) => {
                      if (field.id === "status" || field.idName === "status") {
                        if (!leadData) {
                          // New form: allow toggling between 'New' and 'Qualified' until save
                          return {
                            ...field,
                            options: ["New", "Qualified"],
                            hidden: false,
                            disabled: false,
                          };
                        } else if (formData.status === "Converted") {
                          // Hide dropdown, show as read-only for 'Converted'
                          return {
                            ...field,
                            options: [formData.status],
                            hidden: true,
                            disabled: true,
                          };
                        } else {
                          // Edit mode: show Qualified and Disqualified, only show 'New' if not yet saved as Qualified
                          let statusOptions = ["Qualified", "Disqualified"];
                          if (leadData.status !== "Qualified") {
                            statusOptions = ["New", ...statusOptions];
                          }
                          return {
                            ...field,
                            options: statusOptions,
                            hidden: false,
                            disabled: false,
                          };
                        }
                      }
                      return field;
                    }),
                }}
                type="Lead"
                data={leadData}
                formData={formData}
                setFormData={setFormData}
              />
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => handleSave()}
                  disabled={isSubmitting || isConverted || validationError}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>

                {formData?.status === "Qualified" && savedLeadId && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    onClick={() => {
                      setModal(true);
                      setFormData((prev: any) => ({
                        ...prev,
                        status: "Converted",
                      }));
                      setLeadStatus?.("Converted");
                      setIsConverted(true);
                    }}
                    disabled={isSubmitting || isConverted || validationError}
                  >
                    {isConverted
                      ? "Created Opportunity ✓"
                      : "Create Opportunity"}
                  </button>
                )}
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
                  onClick={handleCancel}
                  disabled={isConverted}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Opportunity Form Section */}
      {modal && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <OpportunityForm
              opportunityData={{
                ...(() => {
                  const { comments, status, ...rest } = formData || {};
                  return { ...rest, status: "Identified" };
                })(),
                opportunityFor: "Lead",
                leadId: savedLeadId || formData.leadId || leadId,
                fields: {
                  ...formData.fields,
                  leadId: savedLeadId || leadId,
                },
              }}
              onSuccess={() => {
                // On successful opportunity creation, set status to 'Converted'
                setFormData((prev: any) => ({
                  ...prev,
                  status: "Converted",
                }));
                setIsConverted(true);
                onSuccess && onSuccess(); // Call parent onSuccess (fetchOpportunityData in LeadView)
                setModal(false);
              }}
              onClose={() => setModal(false)}
              fromLead={true}
              isNew={true}
              setLeadStatus={setLeadStatus}
              isEdit={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadForm;
