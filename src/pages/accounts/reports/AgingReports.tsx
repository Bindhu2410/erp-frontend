import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

const AgingReports: React.FC = () => {
  const [asOfDate, setAsOfDate] = useState("2026-02-06");
  const [reportType, setReportType] = useState("receivable");

  const receivableData = [
    { customer: "ABC Hospital", current: 50000, days30: 25000, days60: 0, days90: 0, total: 75000 },
    { customer: "XYZ Clinic", current: 30000, days30: 15000, days60: 10000, days90: 5000, total: 60000 },
    { customer: "MediCare Ltd", current: 45000, days30: 0, days60: 0, days90: 0, total: 45000 },
  ];

  const totals = receivableData.reduce((acc, row) => ({
    current: acc.current + row.current,
    days30: acc.days30 + row.days30,
    days60: acc.days60 + row.days60,
    days90: acc.days90 + row.days90,
    total: acc.total + row.total,
  }), { current: 0, days30: 0, days60: 0, days90: 0, total: 0 });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aging Reports</h1>
        <p className="text-sm text-gray-600">Accounts receivable and payable aging analysis</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="px-3 py-2 border rounded">
              <option value="receivable">Accounts Receivable</option>
              <option value="payable">Accounts Payable</option>
            </select>
          </div>
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

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-right">Current</th>
              <th className="p-3 text-right">1-30 Days</th>
              <th className="p-3 text-right">31-60 Days</th>
              <th className="p-3 text-right">61-90 Days</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {receivableData.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{row.customer}</td>
                <td className="p-3 text-right">₹{row.current.toLocaleString()}</td>
                <td className="p-3 text-right">₹{row.days30.toLocaleString()}</td>
                <td className="p-3 text-right">₹{row.days60.toLocaleString()}</td>
                <td className="p-3 text-right">₹{row.days90.toLocaleString()}</td>
                <td className="p-3 text-right font-semibold">₹{row.total.toLocaleString()}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td className="p-3">Total</td>
              <td className="p-3 text-right">₹{totals.current.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totals.days30.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totals.days60.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totals.days90.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totals.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgingReports;
