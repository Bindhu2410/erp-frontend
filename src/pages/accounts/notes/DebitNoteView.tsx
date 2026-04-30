import React from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaPrint, FaDownload } from "react-icons/fa";

const DebitNoteView: React.FC = () => {
  const { id } = useParams();

  const debitNote = {
    noteNumber: "DN-2026-001",
    vendor: "XYZ Suppliers",
    vendorAddress: "456 Supply Road, Industrial Area",
    invoiceRef: "PINV-2026-032",
    amount: "₹10,000",
    date: "2026-02-05",
    status: "Applied",
    reason: "Quality issue",
    items: [
      { description: "Defective Equipment", quantity: 2, rate: "₹3,000", amount: "₹6,000" },
      { description: "Damaged Parts", quantity: 4, rate: "₹1,000", amount: "₹4,000" },
    ],
    subtotal: "₹10,000",
    tax: "₹0",
    total: "₹10,000",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/accounts/debit-notes"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft /> Back to Debit Notes
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
            <FaPrint /> Print
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FaDownload /> Download
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debit Note</h1>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-gray-600">Note Number</p>
              <p className="font-semibold text-gray-900">{debitNote.noteNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold text-gray-900">{debitNote.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Invoice Reference</p>
              <p className="font-semibold text-gray-900">{debitNote.invoiceRef}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                {debitNote.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Vendor Details</h2>
          <p className="font-semibold text-gray-900">{debitNote.vendor}</p>
          <p className="text-sm text-gray-600">{debitNote.vendorAddress}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Reason</h2>
          <p className="text-gray-700">{debitNote.reason}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {debitNote.items.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3 px-4 text-sm text-gray-900">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{item.quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{item.rate}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold text-gray-900">{debitNote.subtotal}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-700">Tax:</span>
              <span className="font-semibold text-gray-900">{debitNote.tax}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-50 px-4 rounded-lg mt-2">
              <span className="text-lg font-bold text-gray-900">Total:</span>
              <span className="text-lg font-bold text-blue-600">{debitNote.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebitNoteView;
