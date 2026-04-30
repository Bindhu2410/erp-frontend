import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

const GeneralLedgerReports: React.FC = () => {
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-02-06");
  const [account, setAccount] = useState("all");

  const data = [
    { date: "2026-01-05", ref: "INV-001", description: "Sales Invoice - ABC Hospital", debit: 125000, credit: 0, balance: 125000 },
    { date: "2026-01-10", ref: "PAY-001", description: "Payment Received", debit: 0, credit: 125000, balance: 0 },
    { date: "2026-01-15", ref: "INV-002", description: "Sales Invoice - XYZ Clinic", debit: 95000, credit: 0, balance: 95000 },
    { date: "2026-01-20", ref: "JE-001", description: "Adjustment Entry", debit: 5000, credit: 0, balance: 100000 },
    { date: "2026-02-01", ref: "INV-003", description: "Sales Invoice - MediCare", debit: 150000, credit: 0, balance: 250000 },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">General Ledger Report</h1>
        <p className="text-sm text-gray-600">Detailed transaction history by account</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <select value={account} onChange={e => setAccount(e.target.value)} className="px-3 py-2 border rounded w-48">
              <option value="all">All Accounts</option>
              <option value="1000">1000 - Cash</option>
              <option value="1100">1100 - Accounts Receivable</option>
              <option value="4000">4000 - Sales Revenue</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-3 py-2 border rounded" />
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
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Reference</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Debit (₹)</th>
              <th className="p-3 text-right">Credit (₹)</th>
              <th className="p-3 text-right">Balance (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">{row.date}</td>
                <td className="p-3 font-medium">{row.ref}</td>
                <td className="p-3">{row.description}</td>
                <td className="p-3 text-right">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right font-semibold">{row.balance.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneralLedgerReports;
