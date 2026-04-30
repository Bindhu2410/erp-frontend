import React, { useState } from "react";
import { FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";

const FinancialStatements: React.FC = () => {
  const [reportType, setReportType] = useState("balance-sheet");
  const [asOfDate, setAsOfDate] = useState("2026-02-06");

  const balanceSheet = {
    assets: [
      { name: "Current Assets", items: [
        { name: "Cash & Bank", amount: 352000 },
        { name: "Accounts Receivable", amount: 128000 },
        { name: "Inventory", amount: 245000 },
      ]},
      { name: "Fixed Assets", items: [
        { name: "Property & Equipment", amount: 850000 },
        { name: "Less: Depreciation", amount: -120000 },
      ]},
    ],
    liabilities: [
      { name: "Current Liabilities", items: [
        { name: "Accounts Payable", amount: 85000 },
        { name: "Short-term Loans", amount: 150000 },
      ]},
      { name: "Long-term Liabilities", items: [
        { name: "Long-term Debt", amount: 300000 },
      ]},
    ],
    equity: [
      { name: "Capital", amount: 500000 },
      { name: "Retained Earnings", amount: 420000 },
    ],
  };

  const totalAssets = 1455000;
  const totalLiabilities = 535000;
  const totalEquity = 920000;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Statements</h1>
        <p className="text-sm text-gray-600">Balance Sheet and Profit & Loss statements</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Statement Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value)} className="px-3 py-2 border rounded">
              <option value="balance-sheet">Balance Sheet</option>
              <option value="profit-loss">Profit & Loss</option>
              <option value="cash-flow">Cash Flow</option>
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

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-blue-700">Assets</h2>
          {balanceSheet.assets.map((section, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">{section.name}</h3>
              {section.items.map((item, j) => (
                <div key={j} className="flex justify-between py-1 pl-4">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="border-t-2 pt-2 mt-4 flex justify-between font-bold">
            <span>Total Assets</span>
            <span>₹{totalAssets.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-bold mb-4 text-orange-700">Liabilities & Equity</h2>
          {balanceSheet.liabilities.map((section, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">{section.name}</h3>
              {section.items.map((item, j) => (
                <div key={j} className="flex justify-between py-1 pl-4">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700 mb-2">Equity</h3>
            {balanceSheet.equity.map((item, i) => (
              <div key={i} className="flex justify-between py-1 pl-4">
                <span className="text-sm">{item.name}</span>
                <span className="text-sm">₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 pt-2 mt-4 flex justify-between font-bold">
            <span>Total Liabilities & Equity</span>
            <span>₹{(totalLiabilities + totalEquity).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatements;
