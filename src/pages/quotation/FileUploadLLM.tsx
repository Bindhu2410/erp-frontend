import React, { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

interface FileUploadLLMProps {
  onSuccess?: (fileName: string) => void;
  quotationId?: string | number;
}

const FileUploadLLM: React.FC<FileUploadLLMProps> = ({ onSuccess, quotationId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult("");
      setError("");
    }
  };

  const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    const sanitizedId = String(quotationId || "unknown").replace(/[/\\:*?"<>|]/g, "_");
    const fileExtension = file.name.split(".").pop();
    const originalName = file.name.replace(`.${fileExtension}`, "");
    const newFileName = `QTN_${sanitizedId}_${originalName}.${fileExtension}`;
    
    const renamedFile = new File([file], newFileName, { type: file.type });
    formData.append("file", renamedFile);

    const uploadUrl = `Storage/upload/PurchaseOrders`;
    const response = await api.post(uploadUrl, formData);
    return response.data?.storedFileName || response.data?.fileName || newFileName;
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const storedFileName = await uploadFileToServer(file);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const fileData = event.target?.result;
        setResult(
          typeof fileData === "string"
            ? fileData.substring(0, 100) + (fileData.length > 100 ? "..." : "")
            : "[Binary file uploaded]"
        );
        setLoading(false);
        toast.success("File uploaded successfully");
        if (onSuccess) onSuccess(storedFileName);
      };
      
      if (file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    } catch (err: any) {
      setError("Failed to process file.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <h2 className="text-lg font-semibold mb-2">
        Upload Purchase Order
      </h2>
      <div 
        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-gray-50 cursor-pointer transition-all"
        onClick={() => document.getElementById("qtn-po-upload")?.click()}
      >
        <input
          type="file"
          accept="image/*,.pdf,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="qtn-po-upload"
        />
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">
            {file ? `File: ${file.name}` : "Click to select PO file"}
          </span>
          <span className="text-xs text-gray-400">PDF, Images, or TXT</span>
        </div>
      </div>
      <button
        className="w-full py-3 bg-green-600 text-white rounded-md font-bold hover:bg-green-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
        onClick={handleUpload}
        disabled={!file || loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Processing...
          </span>
        ) : "Process & Generate PO"}
      </button>
      {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
      {result && (
        <div className="mt-4 w-full bg-gray-100 p-2 rounded text-xs break-all">
          <strong>LLM Output Preview:</strong>
          <div>{result}</div>
        </div>
      )}
    </div>
  );
};

export default FileUploadLLM;
