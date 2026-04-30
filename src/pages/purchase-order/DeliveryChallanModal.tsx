import React, { useRef } from "react";

interface ChallanItem {
  itemCode: string;
  description: string;
  itemName?: string;
  qty?: number;
  quantityDispatched: number;
  unitOfMeasure?: string;
  batchSerialNo?: string;
}

interface DeliveryChallanModalProps {
  challanData: any;
  onClose: () => void;
  onSave: () => void;
}

const DeliveryChallanModal: React.FC<DeliveryChallanModalProps> = ({
  challanData,
  onClose,
  onSave,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open("", "", "height=700,width=900");
      if (win) {
        win.document.write("<html><head><title>Delivery Challan</title>");
        win.document.write(`
          <style>

          @media print {
  body {
    -webkit-print-color-adjust: exact !important; /* For WebKit browsers */
    print-color-adjust: exact !important; /* Standard */
  }
  
  .your-modal-class {
    background-color: #f5f5f5 !important; /* Keep background */
    color: #000 !important;
  }
  
  /* Ensure all colors remain */
  * {
    color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
  }
}
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 10px; }
            /* Print-specific header background fix */
            .print-header-bg {
              background-image: linear-gradient(to right, #dbeafe, #ede9fe) !important;
              background-color: #dbeafe !important;
            }
            /* Tailwind utility classes for print window */
            .bg-gradient-to-r {
              background-image: linear-gradient(to right, #dbeafe, #ede9fe);
            }
            .from-blue-100 {
              /* Not needed, handled in gradient above */
            }
            .to-purple-100 {
              /* Not needed, handled in gradient above */
            }

            .print-header-bg {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    text-align: center !important;
    width: 100% !important;
    background: linear-gradient(to right, #bfdbfe, #e9d5ff) !important; /* blue-100 to purple-100 */
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    padding: 1rem !important;
  }

            .bg-blue-100 { background-color: #dbeafe; }
            .bg-purple-100 { background-color: #ede9fe; }
            .text-green-700 { color: #15803d; }
            .text-red-700 { color: #b91c1c; }
            .text-gray-700 { color: #374151; }
            .text-indigo-800 { color: #3730a3; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .rounded-t-xl { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
            .rounded { border-radius: 0.25rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .border { border-width: 1px; border-style: solid; border-color: #e5e7eb; }
            .border-b { border-bottom-width: 1px; border-color: #e5e7eb; }
            .border-gray-200 { border-color: #e5e7eb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .px-8 { padding-left: 2rem; padding-right: 2rem; }
            .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
            .pt-4 { padding-top: 1rem; }
            .pb-2 { padding-bottom: 0.5rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-2 { margin-top: 0.5rem; }
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .flex-row { flex-direction: row; }
            .flex-1 { flex: 1 1 0%; }
            .gap-8 { gap: 2rem; }
            .min-w-[220px] { min-width: 220px; }
            .whitespace-pre-line { white-space: pre-line; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background: #f3f3f3; text-align: left; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-2xl { font-size: 1.5rem; }
            .text-xl { font-size: 1.25rem; }
            .tracking-wide { letter-spacing: 0.05em; }
            .overflow-hidden { overflow: hidden; }
            .overflow-y-auto { overflow-y: auto; }
          </style>
        `);
        win.document.write("</head><body>");
        win.document.write(printContents);
        win.document.write("</body></html>");
        win.document.close();
        win.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-screen mt-8 border border-gray-200 flex flex-col relative overflow-auto">
        {/* Close Button at Top Right */}
        <button
          className="absolute top-3 right-3 text-gray-400 text-2xl font-bold hover:text-red-500 z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Print Content Start */}
        <div ref={printRef}>
          {/* Header Branding */}
          <div className="rounded-t-xl print-header-bg p-0 border-b border-gray-200">
            <div className="flex flex-col items-center py-4 bg-gradient-to-r from-blue-100 to-purple-100 print-header-bg">
              <div className="text-2xl font-bold text-green-700 tracking-wide">
                JBS <span className="text-red-700">meditec</span>{" "}
                <span className="text-gray-700">India Private Limited</span>
              </div>
              <div className="text-xs text-gray-700 mt-1">
                PAN : AABCJ6645C &nbsp; | &nbsp; CIN : U33112TZ2006PTC012703
                &nbsp; | &nbsp; GST:33AABCJ6645C1ZW
              </div>
              <div className="text-xs text-gray-700 mt-1">
                Laparoscope • Colposcope • Hysteroscope • Fetal Monitor • Fluid
                Management system
              </div>
            </div>
          </div>
          {/* Title */}
          <div className="flex justify-between items-center px-8 pt-4 pb-2">
            <div className="text-xl font-bold text-indigo-800">
              Delivery Challan
            </div>
          </div>
          {/* Info Section */}
          <div className="px-8 pb-2 flex flex-row flex-wrap gap-8">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold text-gray-700">Challan Number:</div>
              <div className="mb-2">{challanData.challanNumber}</div>
              <div className="font-semibold text-gray-700">
                Delivery Number:
              </div>
              <div className="mb-2">{challanData.deliveryNumber}</div>
              <div className="font-semibold text-gray-700">
                Consignee Address:
              </div>
              <div className="mb-2 whitespace-pre-line">
                {challanData.consigneeAddress}
              </div>
              <div className="font-semibold text-gray-700">
                Transporter Details:
              </div>
              <div className="mb-2">{challanData.transporterDetails}</div>
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold text-gray-700">Challan Date:</div>
              <div className="mb-2">{challanData.challanDate}</div>
              <div className="font-semibold text-gray-700">PO Number:</div>
              <div className="mb-2">{challanData.poNumber}</div>
              <div className="font-semibold text-gray-700">
                Purpose of Delivery:
              </div>
              <div className="mb-2">{challanData.purposeOfDelivery}</div>
            </div>
          </div>
          {/* Item Table */}
          <div className="px-8 pb-2 flex-1 overflow-y-auto">
            <div className="font-semibold text-gray-700 mb-1 mt-2">
              Item Details
            </div>
            <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border-b border-gray-200 text-left">
                    #
                  </th>
                  <th className="py-2 px-3 border-b border-gray-200 text-left">
                    Item Code
                  </th>
                  <th className="py-2 px-3 border-b border-gray-200 text-left">
                    Description
                  </th>
                  <th className="py-2 px-3 border-b border-gray-200 text-left">
                    Qty Dispatched
                  </th>
                  <th className="py-2 px-3 border-b border-gray-200 text-left">
                    Batch/Serial No
                  </th>
                </tr>
              </thead>
              <tbody>
                {challanData.itemDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-400 py-4">
                      No items available for delivery
                    </td>
                  </tr>
                ) : (
                  challanData.itemDetails.map(
                    (item: ChallanItem, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 px-3">{idx + 1}</td>
                        <td className="py-2 px-3">{item.itemCode}</td>
                        <td className="py-2 px-3">
                          {item.description || item.itemName}
                        </td>
                        <td className="py-2 px-3">
                          {item.quantityDispatched || item.qty}
                        </td>
                        <td className="py-2 px-3">{item.batchSerialNo}</td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Print Content End */}
        {/* Footer Buttons */}
        <div className="modal-footer flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            className="bg-gray-200 text-gray-700 rounded-full px-6 py-2 font-semibold"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* <button
            className="bg-blue-600 text-white rounded-full px-6 py-2 font-semibold"
            onClick={onSave}
          >
            Save
          </button> */}
          <button
            className="bg-green-600 text-white rounded-full px-6 py-2 font-semibold"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryChallanModal;
