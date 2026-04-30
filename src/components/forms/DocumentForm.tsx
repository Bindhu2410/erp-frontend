import React, { useEffect, useState } from "react";
import { FaPaperclip } from "react-icons/fa";
import axios from "axios";

interface AttachmentData {
  setAttachmentData?: React.Dispatch<React.SetStateAction<any[]>>;
  setModal: (isOpen: boolean) => void;
  attachmentData?: any;
  editData?: any; // New prop for editing
  isEditMode?: boolean;
  onAddSuccess?: () => void;
  onClose?: () => void;
  stage?: string;
  stageItemId?: string;
  documentId?: string; // Add this new prop for document ID
}

const Attachments: React.FC<AttachmentData> = ({
  setModal,
  editData,
  isEditMode,
  onAddSuccess,
  stageItemId,
  stage,
  documentId,
}) => {
  const [contactFormData, setContactFormData] = useState<any>({});

  useEffect(() => {
    if (isEditMode && editData) {
      setContactFormData(editData);
    }
  }, [isEditMode, editData]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (documentId) {
        try {
          const response = await axios.get(
            `http://localhost:5104/api/SalesDocument/${documentId}`
          );
          setContactFormData(response.data);
        } catch (error) {
          console.error("Error fetching document:", error);
        }
      }
    };

    fetchDocument();
  }, [documentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accessToken = localStorage.getItem("access_token");

    try {
      let response;
      if (documentId) {
        // Update existing document
        response = await axios.put(
          `http://localhost:5104/api/SalesDocument/${documentId}`,
          {
            ...contactFormData,
            id: documentId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        // Create new document
        response = await axios.post(
          "http://localhost:5104/api/SalesDocument",
          {
            ...contactFormData,
            stage: stage,
            stageItemId: stageItemId,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      if (response) {
        onAddSuccess?.();

        setModal(false);
      }
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setContactFormData((prevData: any) => {
      const updatedData = { ...prevData, [field]: value };

      // Auto-fill fileType based on fileName extension
      if (field === "fileName") {
        const fileType = value.split(".").pop();
        updatedData.fileType = fileType || "";
      }

      return updatedData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const localUrl = URL.createObjectURL(file);
      setContactFormData((prevData: any) => ({
        ...prevData,
        fileName: file.name,
        fileType: file.name.split(".").pop() || "",
        fileUrl: localUrl, // Use local URL for preview
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Document Details
          </h2>

          {/* Title */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={contactFormData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter document title"
                />
              </div>

              {/* File Upload with Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={contactFormData.fileName || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md pr-12"
                    placeholder="Choose a file"
                    readOnly
                  />
                  <label
                    htmlFor="file-upload"
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <FaPaperclip className="h-5 w-5 text-gray-400 hover:text-orange-500" />
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={contactFormData.description || ""}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  rows={4}
                  placeholder="Enter document description"
                />
              </div>

              {/* File URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File URL
                </label>
                <input
                  type="text"
                  value={contactFormData.fileUrl || ""}
                  onChange={(e) => handleInputChange("fileUrl", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter file URL"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Save Document
          </button>
        </div>
      </form>
    </div>
  );
};

export default Attachments;
