// Preprocess image: convert to grayscale and increase contrast

import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";
import {
  FiUploadCloud,
  FiMail,
  FiPhone,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";
import { FaAddressCard } from "react-icons/fa";

type ExtractedData = {
  email: string | null;
  phone: string | null;
  hospital: string | null;
  customerName: string | null;
  contactName: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  district?: string | null;
  area?: string | null;
  territory?: string | null;
};

interface FileUploadProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onClose, onSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  function preprocessImage(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Grayscale and contrast
        for (let i = 0; i < imageData.data.length; i += 4) {
          // Grayscale
          const avg =
            (imageData.data[i] +
              imageData.data[i + 1] +
              imageData.data[i + 2]) /
            3;
          // Contrast (simple stretch)
          const contrast = 1.5; // 1 = no change, >1 = more contrast
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
          const adjust = (v: number) => factor * (v - 128) + 128;
          const gray = Math.max(0, Math.min(255, adjust(avg)));
          imageData.data[i] = gray;
          imageData.data[i + 1] = gray;
          imageData.data[i + 2] = gray;
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL());
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  // OCR extraction logic for visiting card images
  const [ocrResults, setOcrResults] = useState<(ExtractedData | null)[]>([]);
  const [editableResults, setEditableResults] = useState<
    (ExtractedData | null)[]
  >([]);
  const { user, role } = useUser();
  const [ocrLoading, setOcrLoading] = useState(false);
  const extractDataFromText = (text: string): ExtractedData => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    // Hospital: largest line from the first page (first half of lines)
    let hospital: string | null = null;
    if (lines.length > 0) {
      const firstPageLines = lines.slice(0, Math.ceil(lines.length / 2));
      let maxLen = 0;
      for (const line of firstPageLines) {
        if (
          line.length > maxLen &&
          !/@|\d|www|phone|Phone|mobile|ph\.?|mob\.?|address|e-mail|email|contact|dr[\s.]/i.test(
            line
          )
        ) {
          hospital = line;
          maxLen = line.length;
        }
      }
      if (!hospital) hospital = firstPageLines[0];
    }
    // Email: any email address
    const emailMatch = text.match(
      /[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    let email = emailMatch ? emailMatch[0] : null;
    // Phone: advanced extraction logic
    let phone: string | null = null;
    // Regex to capture possible phone numbers
    const phoneRegex =
      /((?:\+\d{1,3}[\s-]*)?(?:\(?\d{2,4}\)?[\s-]*)?(?:\d[\s-]*){6,})/g;
    const phoneCandidates: string[] = [];
    // Collect all phone-like patterns from the text
    let matches = text.match(phoneRegex);
    if (matches) phoneCandidates.push(...matches);
    // Collect from lines that explicitly mention phone/mobile
    for (const line of lines) {
      if (/phone|ph\.?no|mobile|mob\.?|tel\.?/i.test(line)) {
        let matches = line.match(phoneRegex);
        if (matches) phoneCandidates.push(...matches);
      }
    }
    // Normalize (remove non-digits except leading +)
    const cleaned = phoneCandidates.map((num) => num.replace(/(?!^\+)\D/g, ""));
    // 1️⃣ Prefer +91 numbers
    const plus91 = cleaned.find(
      (num) => num.startsWith("+91") && num.length >= 12
    );
    // 2️⃣ Else prefer 10-digit number
    const tenDigit = cleaned.find((num) => /^[0-9]{10}$/.test(num));
    // 3️⃣ Else fallback to first candidate
    if (plus91) {
      phone = plus91;
    } else if (tenDigit) {
      phone = tenDigit;
    } else if (cleaned.length > 0) {
      phone = cleaned[0];
    }
    // Customer name: largest line (by length, not containing email/phone/website)
    let customerName: string | null = null;
    let maxLen = 0;
    for (const line of lines) {
      if (
        line.length > maxLen &&
        !/@|\d|www|phone|mobile|ph\.?|mob\.?|address|e-mail|email|contact/i.test(
          line
        )
      ) {
        customerName = line;
        maxLen = line.length;
      }
    }
    // Contact name: line with 'Dr.' or 'Dr ' (case-insensitive)
    let contactName: string | null = null;
    for (const line of lines) {
      if (/dr[\s.]/i.test(line)) {
        contactName = line;
        break;
      }
    }

    // Address extraction (robust for various card types)
    let address: string | null = null;
    let city: string | null = null;
    let state: string | null = null;
    let pincode: string | null = null;
    let district: string | null = null;
    let area: string | null = null;
    let territory: string | null = null;
    // 1. Look for 'Address:' prefix (case-insensitive)
    for (const line of lines) {
      const match = line.match(/^address[:\-]?\s*(.*)$/i);
      if (match && match[1]) {
        address = match[1].trim();
        break;
      }
    }
    // 2. If not found, look for a line with pincode (6 digit number)
    if (!address) {
      let pinLineIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        const pinMatch = lines[i].match(/\b\d{6}\b/);
        if (pinMatch) {
          pincode = pinMatch[0];
          pinLineIdx = i;
          break;
        }
      }
      // Find the start of the address block (first line with a number and comma, before pincode)
      let addrStartIdx = -1;
      for (let i = 0; i <= pinLineIdx && i < lines.length; i++) {
        if (/\d+.*,/g.test(lines[i])) {
          addrStartIdx = i;
          break;
        }
      }
      if (
        addrStartIdx !== -1 &&
        pinLineIdx !== -1 &&
        addrStartIdx <= pinLineIdx
      ) {
        address = lines.slice(addrStartIdx, pinLineIdx + 1).join(", ");
      } else if (pinLineIdx !== -1) {
        address = lines[pinLineIdx];
      }
    }
    // 3. If still not found, look for a line with common address keywords
    if (!address) {
      const keywords =
        /street|road|avenue|block|sector|plaza|lane|main|cross|circle|park|vihar|colony|complex|market|building|tower/i;
      for (const line of lines) {
        if (keywords.test(line)) {
          address = line;
          break;
        }
      }
    }

    // 4. If still not found, use the first line with both a number and a comma (common in addresses)
    if (!address) {
      for (const line of lines) {
        if (/\d+.*,.+/i.test(line)) {
          address = line;
          break;
        }
      }
    }

    // Sanitize address: remove unwanted symbols, bullets, or leading letters like 'e)', '-', '•', etc.
    if (address) {
      address = address
        .replace(/^\s*[a-zA-Z]\)|^[-•]+/g, "") // Remove leading 'e)', 'd)', '-', '•', etc.
        .replace(/^[^\w\d]+|[^\w\d]+$/g, "")
        .replace(/^=+|=+$/g, "")
        .trim();
    }
    // Try to find state (common Indian states)
    const states = [
      "Andhra Pradesh",
      "Arunachal Pradesh",
      "Assam",
      "Bihar",
      "Chhattisgarh",
      "Goa",
      "Gujarat",
      "Haryana",
      "Himachal Pradesh",
      "Jharkhand",
      "Karnataka",
      "Kerala",
      "Madhya Pradesh",
      "Maharashtra",
      "Manipur",
      "Meghalaya",
      "Mizoram",
      "Nagaland",
      "Odisha",
      "Punjab",
      "Rajasthan",
      "Sikkim",
      "Tamil Nadu",
      "Telangana",
      "Tripura",
      "Uttar Pradesh",
      "Uttarakhand",
      "West Bengal",
      "Delhi",
      "Puducherry",
      "Jammu and Kashmir",
      "Ladakh",
    ];
    for (const line of lines) {
      for (const st of states) {
        if (line.toLowerCase().includes(st.toLowerCase())) {
          state = st;
          break;
        }
      }
      if (state) break;
    }
    // Try to find city (line before pincode or state)
    if (address) {
      const idx = lines.findIndex((l) => l === address);
      if (idx > 0) {
        city = lines[idx - 1];
      }
    }
    // Fallback: look for keywords
    for (const line of lines) {
      if (/city/i.test(line)) city = line;
      if (/district/i.test(line)) district = line;
      if (/area/i.test(line)) area = line;
      if (/territory/i.test(line)) territory = line;
    }
    return {
      email,
      phone,
      hospital,
      customerName,
      contactName,
      address,
      city,
      state,
      pincode,
      district,
      area,
      territory,
    };
  };

  // Run OCR on all image files with preprocessing
  const runOcrOnImages = async (imageFiles: File[]) => {
    setOcrLoading(true);
    const results: (ExtractedData | null)[] = await Promise.all(
      imageFiles.map(async (file, idx) => {
        if (!file.type.startsWith("image/")) return null;
        return new Promise<ExtractedData | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            // Preprocess image before OCR
            const processedDataUrl = await preprocessImage(dataUrl);
            try {
              const { data } = await Tesseract.recognize(
                processedDataUrl,
                "eng",
                {
                  logger: () => {},
                }
              );
              console.log(`File #${idx + 1} RAW OCR text:`, data.text); // Debug: print raw OCR text
              resolve(extractDataFromText(data.text));
            } catch {
              resolve(null);
            }
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      })
    );
    setOcrResults(results);
    setEditableResults(results.map((r) => (r ? { ...r } : r)));
    setOcrLoading(false);
    // Log the extracted results to the console
    results.forEach((res, idx) => {
      if (res) {
        console.log(`File #${idx + 1} OCR result:`, res);
      }
    });
  };

  const handleFiles = (newFiles: File[]) => {
    setFiles((prevFiles) => {
      const updated = [...prevFiles, ...newFiles];
      // Run OCR on all image files
      runOcrOnImages(updated);
      return updated;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      // Prepare the payload for /api/SalesLead/bulk
      const now = new Date().toISOString();
      const payload = (editableResults.filter(Boolean) as ExtractedData[]).map(
        (item) => ({
          UserCreated: user?.userId,
          DateCreated: now,
          UserUpdated: user?.userId,
          DateUpdated: now,
          Id: 0,
          CustomerName: item.customerName || "",
          LeadSource: "OCR Upload",
          ReferralSourceName: "",
          HospitalOfReferral: item.hospital || "",
          DepartmentOfReferral: "",
          SocialMedia: "",
          EventDate: now,
          EventName: "",
          LeadId: "",
          Status: "New",
          Score: "",
          IsActive: true,
          Comments: "",
          LeadType: "",
          ContactName: item.contactName || "",
          Salutation: "",
          ContactMobileNo: item.phone || "",
          LandLineNo: "",
          Email: item.email || "",
          Fax: "",
          DoorNo: "",
          Street: item.address || "",
          Landmark: "",
          Website: "",
          Territory: item.territory || "",
          Area: item.area || "",
          City: item.city || "",
          Pincode: item.pincode || "",
          District: item.district || "",
          State: item.state || "",
        })
      );

      const response = await api.post(
        "SalesTempLead",

        payload
      );

      // Adjust this check based on your api service's response structure
      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Upload failed");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error uploading files:", error);
      // You could add error handling/notification here
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl relative z-[10000]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">File Upload</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[#FF6B35] bg-orange-50"
              : "border-gray-300 hover:border-[#FF6B35]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            className="hidden"
            multiple
          />
          <FiUploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600">
            <span className="text-[#FF6B35]">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 10MB each
          </p>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Selected Files
            </h3>
            <div className="space-y-2 max-h-[21rem] overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-1 bg-gray-50 p-2 rounded"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(file.size / 1024)}KB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                  {/* OCR Results for image files */}
                  {ocrLoading && file.type.startsWith("image/") && (
                    <div className="text-xs text-blue-600">
                      Extracting data...
                    </div>
                  )}
                  {!ocrLoading &&
                    editableResults[index] &&
                    file.type.startsWith("image/") && (
                      <div className="bg-white border border-orange-200 rounded-lg shadow p-4 mt-2 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <FiMail className="text-orange-500 text-xl" />
                          <label className="w-32 text-gray-700 font-medium">
                            Email
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            value={editableResults[index]?.email || ""}
                            placeholder="Email address"
                            onChange={(e) => {
                              const updated = [...editableResults];
                              const prev: ExtractedData = updated[index] ?? {
                                email: null,
                                phone: null,
                                hospital: null,
                                customerName: null,
                                contactName: null,
                              };
                              updated[index] = {
                                email: e.target.value,
                                phone: prev.phone ?? null,
                                hospital: prev.hospital ?? null,
                                customerName: prev.customerName ?? null,
                                contactName: prev.contactName ?? null,
                              };
                              setEditableResults(updated);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-orange-500 text-xl" />
                          <label className="w-32 text-gray-700 font-medium">
                            Phone
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            value={editableResults[index]?.phone || ""}
                            placeholder="Phone number"
                            onChange={(e) => {
                              const updated = [...editableResults];
                              const prev: ExtractedData = updated[index] ?? {
                                email: null,
                                phone: null,
                                hospital: null,
                                customerName: null,
                                contactName: null,
                              };
                              updated[index] = {
                                email: prev.email ?? null,
                                phone: e.target.value,
                                hospital: prev.hospital ?? null,
                                customerName: prev.customerName ?? null,
                                contactName: prev.contactName ?? null,
                              };
                              setEditableResults(updated);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUserCheck className="text-orange-500 text-xl" />
                          <label className="w-32 text-gray-700 font-medium">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            value={editableResults[index]?.customerName || ""}
                            placeholder="Customer name"
                            onChange={(e) => {
                              const updated = [...editableResults];
                              const prev: ExtractedData = updated[index] ?? {
                                email: null,
                                phone: null,
                                hospital: null,
                                customerName: null,
                                contactName: null,
                              };
                              updated[index] = {
                                email: prev.email ?? null,
                                phone: prev.phone ?? null,
                                hospital: prev.hospital ?? null,
                                customerName: e.target.value,
                                contactName: prev.contactName ?? null,
                              };
                              setEditableResults(updated);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUser className="text-orange-500 text-xl" />
                          <label className="w-32 text-gray-700 font-medium">
                            Contact Name
                          </label>
                          <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-200 outline-none transition"
                            value={editableResults[index]?.contactName || ""}
                            placeholder="Contact name"
                            onChange={(e) => {
                              const updated = [...editableResults];
                              const prev: ExtractedData = updated[index] ?? {
                                email: null,
                                phone: null,
                                hospital: null,
                                customerName: null,
                                contactName: null,
                                address: null,
                              };
                              updated[index] = {
                                email: prev.email ?? null,
                                phone: prev.phone ?? null,
                                hospital: prev.hospital ?? null,
                                customerName: prev.customerName ?? null,
                                contactName: e.target.value,
                                address: prev.address ?? null,
                              };
                              setEditableResults(updated);
                            }}
                          />
                        </div>

                        {/* Address Field */}
                        <div className="flex col-span-2 items-center gap-2 items-start">
                          <span className="text-orange-500 text-xl mt-1">
                            <FaAddressCard />
                          </span>
                          <label className="w-32 text-gray-700 font-medium mt-1">
                            Address
                          </label>
                          <textarea
                            className="flex-1 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-orange-200 outline-none transition resize-y min-h-[40px]"
                            value={editableResults[index]?.address || ""}
                            placeholder="Address"
                            onChange={(e) => {
                              const updated = [...editableResults];
                              const prev: ExtractedData = updated[index] ?? {
                                email: null,
                                phone: null,
                                hospital: null,
                                customerName: null,
                                contactName: null,
                                address: null,
                              };
                              updated[index] = {
                                email: prev.email ?? null,
                                phone: prev.phone ?? null,
                                hospital: prev.hospital ?? null,
                                customerName: prev.customerName ?? null,
                                contactName: prev.contactName ?? null,
                                address: e.target.value,
                              };
                              setEditableResults(updated);
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#ff8657] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
