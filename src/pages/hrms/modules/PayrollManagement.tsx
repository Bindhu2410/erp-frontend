import React, { useState } from "react";
import { DollarSign, Download, Printer, Search, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import { payrollRecords } from "../dummyData";
import { PayrollRecord } from "../types";

const statusConfig = {
  Processed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  Pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  "On Hold": { bg: "bg-orange-100", text: "text-orange-700", icon: AlertCircle },
};

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const PayrollManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = payrollRecords.filter(
    r => r.employeeName.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const totalNetSalary = payrollRecords.reduce((a, r) => a + r.netSalary, 0);
  const totalGross = payrollRecords.reduce((a, r) => a + r.basic + r.hra + r.transportAllowance + r.medicalAllowance + r.otherAllowances, 0);
  const totalDeductions = payrollRecords.reduce((a, r) => a + r.providentFund + r.professionalTax + r.incomeTax + r.otherDeductions, 0);

  const gross = (r: PayrollRecord) => r.basic + r.hra + r.transportAllowance + r.medicalAllowance + r.otherAllowances;
  const deductions = (r: PayrollRecord) => r.providentFund + r.professionalTax + r.incomeTax + r.otherDeductions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll</h1>
          <p className="text-sm text-gray-500">Salary processing for March 2026</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">
          <DollarSign className="w-4 h-4" /> Run Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white rounded-xl p-5">
          <p className="text-blue-200 text-sm font-medium">Total Net Salary</p>
          <p className="text-2xl font-bold mt-1">{formatINR(totalNetSalary)}</p>
          <p className="text-blue-200 text-xs mt-1">{payrollRecords.length} employees</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-gray-500 text-sm font-medium">Gross Earnings</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatINR(totalGross)}</p>
          <p className="text-gray-400 text-xs mt-1">Before deductions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <p className="text-gray-500 text-sm font-medium">Total Deductions</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatINR(totalDeductions)}</p>
          <p className="text-gray-400 text-xs mt-1">PF + Tax + Others</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or employee ID..."
          className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-800">
          Payroll Records — March 2026
        </div>
        <div className="divide-y divide-gray-50">
          {filtered.map((record) => {
            const cfg = statusConfig[record.status];
            const Icon = cfg.icon;
            const isExpanded = expandedId === record.employeeId;
            const grossAmt = gross(record);
            const deductAmt = deductions(record);

            return (
              <div key={record.employeeId}>
                <div className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        {record.employeeName.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{record.employeeName}</p>
                        <p className="text-xs text-gray-500">{record.employeeId} · {record.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Gross</p>
                        <p className="font-semibold text-gray-700">{formatINR(grossAmt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Deductions</p>
                        <p className="font-semibold text-red-600">-{formatINR(deductAmt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Net Salary</p>
                        <p className="font-bold text-blue-700 text-lg">{formatINR(record.netSalary)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <Icon className="w-3 h-3" /> {record.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedRecord(record)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Payslip">
                          <Printer className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExpandedId(isExpanded ? null : record.employeeId)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="px-5 pb-5 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-green-700 text-sm mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" /> Earnings
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: "Basic Salary", amount: record.basic },
                            { label: "House Rent Allowance (HRA)", amount: record.hra },
                            { label: "Transport Allowance", amount: record.transportAllowance },
                            { label: "Medical Allowance", amount: record.medicalAllowance },
                            { label: "Other Allowances", amount: record.otherAllowances },
                          ].map(({ label, amount }) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span className="text-gray-600">{label}</span>
                              <span className="font-medium text-gray-800">{formatINR(amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-green-200">
                            <span className="text-green-700">Gross Earnings</span>
                            <span className="text-green-700">{formatINR(grossAmt)}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-600 text-sm mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Deductions
                        </h4>
                        <div className="space-y-2">
                          {[
                            { label: "Provident Fund (EPF)", amount: record.providentFund },
                            { label: "Professional Tax", amount: record.professionalTax },
                            { label: "Income Tax (TDS)", amount: record.incomeTax },
                            { label: "Other Deductions", amount: record.otherDeductions },
                          ].map(({ label, amount }) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span className="text-gray-600">{label}</span>
                              <span className="font-medium text-red-600">-{formatINR(amount)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm font-bold pt-2 border-t border-red-200">
                            <span className="text-red-600">Total Deductions</span>
                            <span className="text-red-600">-{formatINR(deductAmt)}</span>
                          </div>
                        </div>
                        <div className="mt-4 bg-blue-600 text-white rounded-xl p-3 flex justify-between items-center">
                          <span className="font-bold">Net Take Home</span>
                          <span className="text-xl font-extrabold">{formatINR(record.netSalary)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
              <div className="text-white">
                <p className="font-bold text-lg">Payslip</p>
                <p className="text-blue-200 text-sm">{selectedRecord.month}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white hover:bg-blue-700 rounded-lg" title="Download"><Download className="w-4 h-4" /></button>
                <button className="p-2 text-white hover:bg-blue-700 rounded-lg" title="Print"><Printer className="w-4 h-4" /></button>
                <button onClick={() => setSelectedRecord(null)} className="p-2 text-white hover:bg-blue-700 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                  {selectedRecord.employeeName.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{selectedRecord.employeeName}</h3>
                  <p className="text-gray-500 text-sm">{selectedRecord.employeeId} · {selectedRecord.department}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pay Period</span><span className="font-medium">{selectedRecord.month}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Date</span><span className="font-medium">Apr 1, 2026</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="font-semibold text-green-700 text-sm mb-3">Earnings</p>
                  {[["Basic", selectedRecord.basic], ["HRA", selectedRecord.hra], ["Transport", selectedRecord.transportAllowance], ["Medical", selectedRecord.medicalAllowance], ["Others", selectedRecord.otherAllowances]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600">{l}</span>
                      <span className="font-medium">{formatINR(Number(v))}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-green-200 flex justify-between text-sm font-bold text-green-700 mt-2">
                    <span>Gross</span><span>{formatINR(gross(selectedRecord))}</span>
                  </div>
                </div>
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="font-semibold text-red-600 text-sm mb-3">Deductions</p>
                  {[["EPF", selectedRecord.providentFund], ["Prof. Tax", selectedRecord.professionalTax], ["TDS", selectedRecord.incomeTax], ["Others", selectedRecord.otherDeductions]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600">{l}</span>
                      <span className="font-medium text-red-600">-{formatINR(Number(v))}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-red-200 flex justify-between text-sm font-bold text-red-600 mt-2">
                    <span>Total</span><span>-{formatINR(deductions(selectedRecord))}</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-600 text-white rounded-xl p-4 mt-4 flex justify-between items-center">
                <div>
                  <p className="text-blue-200 text-sm">Net Take Home</p>
                  <p className="text-3xl font-extrabold">{formatINR(selectedRecord.netSalary)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-blue-300" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
