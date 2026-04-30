import React, { useState, useRef } from "react";
import { FaDownload } from "react-icons/fa";
import { FiUpload, FiX } from "react-icons/fi";

interface BulkLeadUploadProps {
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

const BulkLeadUpload: React.FC<BulkLeadUploadProps> = ({
  onUpload,
  onClose,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedFileTypes = [".xlsx", ".xls", ".csv"];
  const maxFileSize = 5; // 5MB

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  // Download template button handler (top-level, not inside another function)
  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = `${process.env.PUBLIC_URL || ""}/sample-lead-upload.csv`;
    link.download = "sample-lead-upload.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`File size should not exceed ${maxFileSize}MB`);
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      setError(`Only ${allowedFileTypes.join(", ")} files are allowed`);
      return false;
    }

    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedFile) {
      setUploading(true);
      try {
        await onUpload(selectedFile);
      } catch (error) {
        setError("Failed to upload file. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bulk Lead Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive
              ? "border-[#FF6B35] bg-orange-50"
              : "border-gray-300 hover:border-[#FF6B35]"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => openFileDialog()}
          style={{ cursor: "pointer" }}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept={allowedFileTypes.join(",")}
            onClick={(e) => e.stopPropagation()}
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <FiUpload size={48} className="text-gray-400" />
            </div>
            {selectedFile ? (
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)}MB
                </p>
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-gray-700">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500">
                  or{" "}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openFileDialog();
                    }}
                    className="text-[#FF6B35] hover:underline font-medium"
                  >
                    browse
                  </button>{" "}
                  to choose a file
                </p>
              </>
            )}
            <p className="text-xs text-gray-500">
              Supported formats: {allowedFileTypes.join(", ")} (Max{" "}
              {maxFileSize}MB)
            </p>
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className=" px-4 flex item-center place-items-center justify-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <FaDownload /> <span className="ml-2">Sample Lead</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 ${
              selectedFile && !uploading
                ? "bg-[#FF6B35] hover:bg-[#ff8657]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkLeadUpload;
