import React, { useState, useCallback } from "react";
import {
  FiUpload,
  FiDownload,
  FiEye,
  FiPrinter,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

interface StepInfoType {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const steps: StepInfoType[] = [
  { id: "request-po", title: "Request PO", icon: <FiClock className="mr-1" /> },
  { id: "upload-po", title: "Upload PO", icon: <FiUpload className="mr-1" /> },
  {
    id: "order-acceptance",
    title: "Order Acceptance",
    icon: <FiCheckCircle className="mr-1" />,
  },
  {
    id: "upload-oa",
    title: "Upload Signed OA",
    icon: <FiUpload className="mr-1" />,
  },
  {
    id: "create-so",
    title: "Create Sales Order",
    icon: <FiCheckCircle className="mr-1" />,
  },
];

interface FileState {
  file: File | null;
  preview: string | null;
  status: "pending" | "uploaded" | "error";
}

const SalesOrderWorkflow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [poRequested, setPoRequested] = useState(false);
  const [oaGenerated, setOaGenerated] = useState(false);
  const [salesOrderCreated, setSalesOrderCreated] = useState(false);

  // Enhanced file state with preview and status
  const [poFileState, setPoFileState] = useState<FileState>({
    file: null,
    preview: null,
    status: "pending",
  });

  const [oaFileState, setOaFileState] = useState<FileState>({
    file: null,
    preview: null,
    status: "pending",
  });

  const [signedOaFileState, setSignedOaFileState] = useState<FileState>({
    file: null,
    preview: null,
    status: "pending",
  });

  const [salesOrderFileState, setSalesOrderFileState] = useState<FileState>({
    file: null,
    preview: null,
    status: "pending",
  });

  // Get document status for the stepper
  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < activeStep) return "completed";
    if (stepIndex === activeStep) return "current";
    return "pending";
  };

  // File handling functions
  const handleFileChange = useCallback(
    (setState: React.Dispatch<React.SetStateAction<FileState>>, file: File) => {
      // Create a file preview URL
      const fileUrl = URL.createObjectURL(file);
      setState({
        file,
        preview: fileUrl,
        status: "uploaded",
      });
    },
    []
  );

  // Document handling functions
  const handlePrint = (type: string) => {
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ${type}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .content { border: 1px solid #ddd; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>JBS - ${type}</h2>
            </div>
            <div class="content">
              <h3>Print Preview: ${type}</h3>
              <p>Document ID: JBS-${Math.floor(Math.random() * 10000)}</p>
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>This is a simulated print preview for ${type}</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = (type: string, fileState?: FileState) => {
    if (fileState?.file) {
      // If we have an actual file, create a download link
      const url = URL.createObjectURL(fileState.file);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${type.replace(/\s+/g, "-")}-${Date.now()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } else {
      // Simulate download for demo
      alert(`Downloading ${type}... (simulation)`);
    }
  };

  const handleView = (type: string, fileState?: FileState) => {
    if (fileState?.preview) {
      // Open preview in new tab if available
      window.open(fileState.preview, "_blank");
    } else {
      // Simulation for demo
      const previewWindow = window.open("", "_blank", "width=800,height=600");
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head>
              <title>View ${type}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .document { border: 1px solid #ddd; padding: 40px; margin: 20px; min-height: 400px; }
              </style>
            </head>
            <body>
              <h2>${type} Preview</h2>
              <div class="document">
                <h3>${type}</h3>
                <p>Document ID: JBS-${Math.floor(Math.random() * 10000)}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p>This is a simulated document preview for ${type}</p>
              </div>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-gray-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 flex items-center justify-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Sales Order Workflow
        </span>
      </h2>

      {/* Enhanced Stepper */}
      <div className="relative mb-12">
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gray-200"></div>
        <div className="flex justify-between items-center relative">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx);
            const isCompleted = idx < activeStep;
            const isCurrent = idx === activeStep;

            return (
              <div key={step.id} className="flex flex-col items-center z-10">
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full 
                    border-2 shadow-md transition-all duration-300 transform 
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white scale-110"
                        : isCurrent
                        ? "bg-blue-600 border-blue-600 text-white scale-110 animate-pulse"
                        : "bg-white border-gray-300 text-gray-500"
                    }`}
                  style={{
                    boxShadow: isCurrent
                      ? "0 0 0 4px rgba(59, 130, 246, 0.3)"
                      : "",
                  }}
                >
                  {isCompleted ? (
                    <FiCheckCircle className="w-6 h-6" />
                  ) : (
                    <span className="text-md font-bold">{idx + 1}</span>
                  )}
                </div>
                <div className="flex flex-col items-center mt-2">
                  <span
                    className={`text-xs font-semibold mb-1 ${
                      isCurrent ? "text-blue-700" : "text-gray-600"
                    }`}
                  >
                    {step.title}
                  </span>
                  <div
                    className={`flex items-center text-xs 
                    ${
                      isCompleted
                        ? "text-green-600"
                        : isCurrent
                        ? "text-blue-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step.icon}
                    <span>
                      {isCompleted
                        ? "Completed"
                        : isCurrent
                        ? "In Progress"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content with enhanced UI */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8 transition-all duration-300">
        {/* Step 1: Request PO */}
        {activeStep === 0 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FiClock className="text-blue-600 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-xl mb-4 text-center">
              Request Purchase Order (PO)
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              Initiate the sales process by requesting a Purchase Order from the
              customer. Once requested, you'll be notified when the customer
              submits the PO.
            </p>

            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md
                transition-all duration-200 transform hover:scale-105 flex items-center"
              onClick={() => {
                setPoRequested(true);
                setActiveStep(1);
              }}
            >
              <FiCheckCircle className="mr-2" /> Request Purchase Order
            </button>

            {poRequested && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 w-full max-w-md">
                <div className="flex items-center text-blue-700 mb-2">
                  <FiCheckCircle className="mr-2" />
                  <span className="font-semibold">PO Request Sent</span>
                </div>
                <p className="text-sm text-gray-600">
                  Request has been sent to the customer. You'll be notified upon
                  receipt of the PO document.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Upload PO */}
        {activeStep === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiUpload className="text-green-600 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-xl mb-4">
              Upload Purchase Order
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              Upload the Purchase Order document received from the customer.
              Acceptable formats include PDF, DOC, DOCX, and image files.
            </p>

            <div className="w-full max-w-md mb-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all ${
                  poFileState.file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*,.doc,.docx"
                  className="hidden"
                  id="po-file-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(setPoFileState, e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="po-file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {poFileState.file ? (
                    <>
                      <FiCheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="font-medium text-green-700">
                        {poFileState.file.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(poFileState.file.size / 1024).toFixed(1)} KB •{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="font-medium text-gray-700">
                        Drop PO file here or click to upload
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200
                  ${
                    poFileState.file
                      ? "bg-green-600 hover:bg-green-700 text-white transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                disabled={!poFileState.file}
                onClick={() => {
                  setActiveStep(2);
                }}
              >
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Confirm PO Upload
                </div>
              </button>

              {poFileState.file && (
                <div className="flex gap-3">
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() => handleView("Purchase Order", poFileState)}
                  >
                    <FiEye className="mr-1" /> View
                  </button>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() =>
                      handleDownload("Purchase Order", poFileState)
                    }
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() => handlePrint("Purchase Order")}
                  >
                    <FiPrinter className="mr-1" /> Print
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Order Acceptance */}
        {activeStep === 2 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="text-yellow-600 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-xl mb-4">
              Order Acceptance (OA)
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              Generate the Order Acceptance document based on the received PO.
              This document will be sent to the customer for their approval.
            </p>

            <div className="w-full max-w-lg bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-medium text-yellow-800 mb-2">
                Order Acceptance Details
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">ACME Corporation</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">PO Number</p>
                  <p className="font-medium">
                    PO-{Math.floor(10000 + Math.random() * 90000)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Timeline</p>
                  <p className="font-medium">30 days</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold shadow-md
                  transition-all duration-200 transform hover:scale-105 flex items-center"
                onClick={() => {
                  setOaGenerated(true);
                  // Create a simulated OA file
                  handleFileChange(
                    setOaFileState,
                    new File(["OA Content"], "OrderAcceptance.pdf", {
                      type: "application/pdf",
                    })
                  );
                  setActiveStep(3);
                }}
              >
                <FiCheckCircle className="mr-2" /> Generate OA
              </button>

              {oaGenerated && (
                <div className="flex gap-3">
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() => handleView("Order Acceptance", oaFileState)}
                  >
                    <FiEye className="mr-1" /> View OA
                  </button>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() =>
                      handleDownload("Order Acceptance", oaFileState)
                    }
                  >
                    <FiDownload className="mr-1" /> Download OA
                  </button>
                  <button
                    className="flex items-center text-orange-600 hover:text-orange-800 px-3 py-2 rounded-md hover:bg-orange-50"
                    onClick={() => handlePrint("Order Acceptance")}
                  >
                    <FiPrinter className="mr-1" /> Print OA
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Upload Signed OA */}
        {activeStep === 3 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <FiUpload className="text-purple-600 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-xl mb-4">
              Upload Signed Order Acceptance
            </h3>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              Upload the Order Acceptance document that has been signed and
              returned by the customer.
            </p>

            <div className="w-full max-w-md mb-6">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-all ${
                  signedOaFileState.file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf,image/*,.doc,.docx"
                  className="hidden"
                  id="signed-oa-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(setSignedOaFileState, e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="signed-oa-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {signedOaFileState.file ? (
                    <>
                      <FiCheckCircle className="w-12 h-12 text-green-500 mb-2" />
                      <p className="font-medium text-green-700">
                        {signedOaFileState.file.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(signedOaFileState.file.size / 1024).toFixed(1)} KB •{" "}
                        {new Date().toLocaleDateString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="font-medium text-gray-700">
                        Drop signed OA here or click to upload
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200
                  ${
                    signedOaFileState.file
                      ? "bg-purple-600 hover:bg-purple-700 text-white transform hover:scale-105"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                disabled={!signedOaFileState.file}
                onClick={() => setActiveStep(4)}
              >
                <div className="flex items-center">
                  <FiCheckCircle className="mr-2" />
                  Confirm Signed OA Upload
                </div>
              </button>

              {signedOaFileState.file && (
                <div className="flex gap-3">
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() =>
                      handleView("Signed Order Acceptance", signedOaFileState)
                    }
                  >
                    <FiEye className="mr-1" /> View
                  </button>
                  <button
                    className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
                    onClick={() =>
                      handleDownload(
                        "Signed Order Acceptance",
                        signedOaFileState
                      )
                    }
                  >
                    <FiDownload className="mr-1" /> Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Create Sales Order */}
        {activeStep === 4 && (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <FiCheckCircle className="text-teal-600 w-8 h-8" />
            </div>
            <h3 className="font-semibold text-xl mb-4">Create Sales Order</h3>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              Create the internal Sales Order based on the approved documents.
              This completes the sales ordering process.
            </p>

            {!salesOrderCreated && (
              <div className="w-full max-w-lg bg-teal-50 border border-teal-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-medium text-teal-800 mb-2">
                  Sales Order Summary
                </h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">ACME Corporation</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">SO Number</p>
                    <p className="font-medium">
                      SO-{Math.floor(10000 + Math.random() * 90000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">PO Reference</p>
                    <p className="font-medium">
                      PO-{Math.floor(10000 + Math.random() * 90000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              {!salesOrderCreated ? (
                <button
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md
                    transition-all duration-200 transform hover:scale-105 flex items-center"
                  onClick={() => {
                    setSalesOrderCreated(true);
                    // Create a simulated Sales Order file
                    handleFileChange(
                      setSalesOrderFileState,
                      new File(["Sales Order Content"], "SalesOrder.pdf", {
                        type: "application/pdf",
                      })
                    );
                  }}
                >
                  <FiCheckCircle className="mr-2" /> Create Sales Order
                </button>
              ) : (
                <div className="w-full flex flex-col items-center">
                  <div className="p-4 bg-green-100 border border-green-300 rounded-lg mb-6 w-full max-w-md">
                    <div className="flex items-center text-green-700 mb-2">
                      <FiCheckCircle className="mr-2" />
                      <span className="font-semibold">
                        Sales Order Created Successfully!
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      The sales order has been created and is now ready for
                      processing. You can view, download, or print the document
                      using the buttons below.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center">
                    <button
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
                      onClick={() =>
                        handleView("Sales Order", salesOrderFileState)
                      }
                    >
                      <FiEye className="mr-2" /> View Sales Order
                    </button>
                    <button
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md"
                      onClick={() =>
                        handleDownload("Sales Order", salesOrderFileState)
                      }
                    >
                      <FiDownload className="mr-2" /> Download Sales Order
                    </button>
                    <button
                      className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
                      onClick={() => handlePrint("Sales Order")}
                    >
                      <FiPrinter className="mr-2" /> Print Sales Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Stepper Navigation */}
      <div className="flex justify-between items-center">
        <button
          className={`flex items-center px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200
            ${
              activeStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700 hover:scale-105"
            }`}
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Previous Step
        </button>

        <div className="text-sm text-gray-500">
          Step {activeStep + 1} of {steps.length}
        </div>

        <button
          className={`flex items-center px-5 py-2 rounded-lg font-semibold shadow-md transition-all duration-200
            ${
              activeStep === steps.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
            }`}
          disabled={activeStep === steps.length - 1}
          onClick={() =>
            setActiveStep((s) => Math.min(steps.length - 1, s + 1))
          }
        >
          Next Step
          <svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Helper component for file upload
const FileUploadCard: React.FC<{
  id: string;
  file: File | null;
  onFileChange: (file: File) => void;
  title: string;
  description: string;
  fileTypes?: string;
  maxSize?: number;
}> = ({
  id,
  file,
  onFileChange,
  title,
  description,
  fileTypes = "PDF, DOC, DOCX, JPG, PNG",
  maxSize = 10,
}) => {
  return (
    <div className="w-full max-w-md mb-6">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all ${
            file
              ? "border-green-300 bg-green-50"
              : "border-gray-300 hover:border-blue-400"
          }`}
      >
        <input
          type="file"
          accept="application/pdf,image/*,.doc,.docx"
          className="hidden"
          id={id}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onFileChange(e.target.files[0]);
            }
          }}
        />
        <label
          htmlFor={id}
          className="cursor-pointer flex flex-col items-center"
        >
          {file ? (
            <>
              <FiCheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <p className="font-medium text-green-700">{file.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / 1024).toFixed(1)} KB •{" "}
                {new Date().toLocaleDateString()}
              </p>
            </>
          ) : (
            <>
              <FiUpload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="font-medium text-gray-700">{title}</p>
              <p className="text-xs text-gray-500 mt-1">
                {fileTypes} (Max {maxSize}MB)
              </p>
            </>
          )}
        </label>
      </div>
    </div>
  );
};

// Document action buttons component
const DocumentActions: React.FC<{
  documentType: string;
  fileState?: FileState;
  onView: () => void;
  onDownload: () => void;
  onPrint?: () => void;
  className?: string;
}> = ({
  documentType,
  fileState,
  onView,
  onDownload,
  onPrint,
  className = "",
}) => {
  return (
    <div className={`flex gap-3 ${className}`}>
      <button
        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
        onClick={onView}
      >
        <FiEye className="mr-1" /> View
      </button>
      <button
        className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
        onClick={onDownload}
      >
        <FiDownload className="mr-1" /> Download
      </button>
      {onPrint && (
        <button
          className="flex items-center text-blue-600 hover:text-blue-800 px-3 py-2 rounded-md hover:bg-blue-50"
          onClick={onPrint}
        >
          <FiPrinter className="mr-1" /> Print
        </button>
      )}
    </div>
  );
};

export default SalesOrderWorkflow;
