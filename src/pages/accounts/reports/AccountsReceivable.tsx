import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

const AccountsReceivable: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState("2026-02-06");

  const data = [
    { customer: "ABC Hospital", invoices: 3, totalDue: 125000, overdue: 25000, status: "Partial" },
    { customer: "XYZ Clinic", invoices: 2, totalDue: 95000, overdue: 0, status: "Current" },
    { customer: "MediCare Ltd", invoices: 4, totalDue: 180000, overdue: 45000, status: "Overdue" },
    { customer: "City Clinic", invoices: 1, totalDue: 50000, overdue: 0, status: "Current" },
  ];

  const totals = data.reduce((acc, row) => ({
    invoices: acc.invoices + row.invoices,
    totalDue: acc.totalDue + row.totalDue,
    overdue: acc.overdue + row.overdue,
  }), { invoices: 0, totalDue: 0, overdue: 0 });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable Report</h1>
        <p className="text-sm text-gray-600">Outstanding customer invoices</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">As of Date</label>
            <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Generate</button>
          <div className="flex gap-2 ml-auto">
            <button className="px-3 py-2 bg-green-600 text-white rounded flex items-center gap-2"><FaFileExcel /> Excel</button>
            <button className="px-3 py-2 bg-red-600 text-white rounded flex items-center gap-2"><FaFilePdf /> PDF</button>
            <button className="px-3 py-2 bg-gray-600 text-white rounded flex items-center gap-2"><FaPrint /> Print</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <div className="text-sm text-gray-600">Total Receivable</div>
          <div className="text-2xl font-bold text-blue-700">₹{totals.totalDue.toLocaleString()}</div>
        </div>
        <div className="bg-orange-50 p-4 rounded">
          <div className="text-sm text-gray-600">Overdue Amount</div>
          <div className="text-2xl font-bold text-orange-700">₹{totals.overdue.toLocaleString()}</div>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <div className="text-sm text-gray-600">Current Amount</div>
          <div className="text-2xl font-bold text-green-700">₹{(totals.totalDue - totals.overdue).toLocaleString()}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-purple-700">{totals.invoices}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-center">Invoices</th>
              <th className="p-3 text-right">Total Due (₹)</th>
              <th className="p-3 text-right">Overdue (₹)</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{row.customer}</td>
                <td className="p-3 text-center">{row.invoices}</td>
                <td className="p-3 text-right">₹{row.totalDue.toLocaleString()}</td>
                <td className="p-3 text-right">{row.overdue > 0 ? `₹${row.overdue.toLocaleString()}` : '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    row.status === 'Current' ? 'bg-green-100 text-green-800' :
                    row.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="p-3">Total</td>
              <td className="p-3 text-center">{totals.invoices}</td>
              <td className="p-3 text-right">₹{totals.totalDue.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totals.overdue.toLocaleString()}</td>
              <td className="p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsReceivable;
