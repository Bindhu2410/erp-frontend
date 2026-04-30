import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import generalConfig from "../configs/preLead/generalInfo.json";
import GeneralInformation, {
  GeneralInformationRef,
} from "../../components/GeneralInformation";

interface PreLeadFormProps {
  onClose?: () => void;
  preLeadData?: any;
  preLeadId?: string | undefined;
  onSuccess?: () => void;
}

const PreLeadForm: React.FC<PreLeadFormProps> = ({
  onClose,
  preLeadData,
  preLeadId,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const generalInfoRef = useRef<GeneralInformationRef>(null);
  const [preLeadStatus, setPreLeadStatus] = useState<string>("New");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const handleSave = async () => {
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentFormData = generalInfoRef.current?.getFormData() || formData;
      const { title, fields, ...cleanedFormData } = currentFormData;

      const transformedData = {
        ...cleanedFormData,
        status: preLeadStatus,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const isEdit = Boolean(id);
      const endpoint = `http://localhost:5104/api/PreLead${
        isEdit ? `/${id}` : ""
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

      let responseData = {};
      const contentLength = response.headers.get("Content-Length");
      if (response.status !== 204 && contentLength !== "0") {
        try {
          responseData = await response.json();
        } catch (error) {
          console.error("Error parsing response:", error);
        }
      }

      toast.success(
        isEdit
          ? "PreLead updated successfully! ✅"
          : "PreLead created successfully! 🎉",
        { autoClose: 2000 }
      );

      if (onSuccess) {
        await onSuccess();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      onClose?.();
      navigate("/sales/pre-leads");
    } catch (error) {
      console.error("Error saving pre-lead:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save pre-lead"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToLead = () => {
    if (!generalInfoRef.current?.validateForm()) {
      toast.error("Please fix the validation errors before converting to lead.");
      return;
    }
    // Implement the conversion logic here
    toast.info("Converting to lead...");
  };

  const handleCancel = () => {
    onClose?.();
  };

  return (
    <div className="p-8 bg-gray-100">
      <div className="relative top-0 right-0">
        <div className="bg-gradient-to-r from-white to-gray-50 shadow-md p-4 mb-2">
          <div className="relative flex items-center justify-center">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight uppercase mx-auto">
              Pre-Lead
            </h2>
            <div className="absolute right-0 flex items-center gap-2">
              <span className="text-gray-600 text-sm font-medium">Status:</span>
              <div
                className={`text-sm px-4 py-1.5 rounded-full shadow-sm min-w-[140px] text-center ${
                  preLeadStatus === "Converted"
                    ? "bg-green-100 text-green-700"
                    : preLeadStatus === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : preLeadStatus === "New"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {preLeadStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <GeneralInformation
          ref={generalInfoRef}
          config={generalConfig}
          type="PreLead"
          data={preLeadData}
          formData={formData}
          setFormData={setFormData}
        />

        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            onClick={handleConvertToLead}
            disabled={isSubmitting}
          >
            Convert to Lead
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreLeadForm;