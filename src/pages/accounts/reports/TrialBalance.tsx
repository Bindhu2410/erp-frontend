import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

const TrialBalance: React.FC = () => {
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-02-06");

  const data = [
    { code: "1000", account: "Cash", debit: 50000, credit: 0 },
    { code: "1100", account: "Accounts Receivable", debit: 128000, credit: 0 },
    { code: "2000", account: "Accounts Payable", debit: 0, credit: 85000 },
    { code: "3000", account: "Capital", debit: 0, credit: 500000 },
    { code: "4000", account: "Sales Revenue", debit: 0, credit: 452000 },
    { code: "5000", account: "Cost of Goods Sold", debit: 285000, credit: 0 },
    { code: "6000", account: "Salaries Expense", debit: 120000, credit: 0 },
    { code: "6100", account: "Rent Expense", debit: 45000, credit: 0 },
  ];

  const totalDebit = data.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = data.reduce((sum, row) => sum + row.credit, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trial Balance</h1>
        <p className="text-sm text-gray-600">Summary of all ledger accounts</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4 items-end">
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
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Account Name</th>
              <th className="p-3 text-right">Debit (₹)</th>
              <th className="p-3 text-right">Credit (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.code} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{row.code}</td>
                <td className="p-3">{row.account}</td>
                <td className="p-3 text-right">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                <td className="p-3 text-right">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold">
              <td colSpan={2} className="p-3 text-right">Total</td>
              <td className="p-3 text-right">₹{totalDebit.toLocaleString()}</td>
              <td className="p-3 text-right">₹{totalCredit.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialBalance;
