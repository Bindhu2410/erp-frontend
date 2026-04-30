import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";

interface DebitNote {
  id: string;
  noteNumber: string;
  vendor: string;
  invoiceRef: string;
  amount: string;
  date: string;
  status: "Draft" | "Approved" | "Applied";
  reason: string;
}

const DebitNoteList: React.FC = () => {
  const [debitNotes] = useState<DebitNote[]>([
    {
      id: "1",
      noteNumber: "DN-2026-001",
      vendor: "XYZ Suppliers",
      invoiceRef: "PINV-2026-032",
      amount: "₹10,000",
      date: "2026-02-05",
      status: "Applied",
      reason: "Quality issue",
    },
    {
      id: "2",
      noteNumber: "DN-2026-002",
      vendor: "Medical Supplies Co",
      invoiceRef: "PINV-2026-031",
      amount: "₹7,500",
      date: "2026-02-04",
      status: "Approved",
      reason: "Short delivery",
    },
    {
      id: "3",
      noteNumber: "DN-2026-003",
      vendor: "Tech Equipment Ltd",
      invoiceRef: "PINV-2026-030",
      amount: "₹15,000",
      date: "2026-02-03",
      status: "Draft",
      reason: "Price difference",
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Debit Notes</h1>
          <p className="text-gray-600 mt-1">Manage vendor debit notes</p>
        </div>
        <Link
          to="/accounts/debit-notes/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> New Debit Note
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Note Number
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Vendor
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Invoice Ref
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Reason
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {debitNotes.map((note) => (
                <tr
                  key={note.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    {note.noteNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {note.vendor}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {note.invoiceRef}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    {note.amount}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {note.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {note.reason}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        note.status === "Applied"
                          ? "bg-green-100 text-green-800"
                          : note.status === "Approved"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {note.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Link
                        to={`/accounts/debit-notes/${note.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye />
                      </Link>
                      <button className="text-green-600 hover:text-green-800">
                        <FaEdit />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DebitNoteList;
