import React, { useState } from "react";
import {
  FaFileInvoice,
  FaMoneyBillWave,
  FaChartBar,
  FaBook,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";

interface KPICard {
  title: string;
  value: string;
  subtext: string;
  icon: JSX.Element;
  trend: "up" | "down";
  trendValue: string;
  bgGradient: string;
}

const AccountingDashboard: React.FC = () => {
  // Sample data for dashboard KPIs
  const kpis: KPICard[] = [
    {
      title: "Total Revenue",
      value: "₹45.2L",
      subtext: "This month",
      icon: <FaFileInvoice size={24} />,
      trend: "up",
      trendValue: "+18%",
      bgGradient: "from-blue-500 to-blue-700",
    },
    {
      title: "Outstanding Receivables",
      value: "₹12.8L",
      subtext: "Pending collection",
      icon: <FaMoneyBillWave size={24} />,
      trend: "down",
      trendValue: "-5%",
      bgGradient: "from-orange-500 to-orange-700",
    },
    {
      title: "Total Expenses",
      value: "₹28.5L",
      subtext: "This month",
      icon: <FaChartBar size={24} />,
      trend: "up",
      trendValue: "+8%",
      bgGradient: "from-green-500 to-green-700",
    },
    {
      title: "Net Profit",
      value: "₹16.7L",
      subtext: "This month",
      icon: <FaBook size={24} />,
      trend: "up",
      trendValue: "+12%",
      bgGradient: "from-purple-500 to-purple-700",
    },
  ];

  const recentTransactions = [
    {
      id: "INV-2026-045",
      description: "Sales Invoice - ABC Hospital",
      amount: "₹125,000",
      date: "2026-02-05",
      status: "Paid",
    },
    {
      id: "PINV-2026-032",
      description: "Purchase Invoice - XYZ Suppliers",
      amount: "₹85,000",
      date: "2026-02-04",
      status: "Pending",
    },
    {
      id: "JE-2026-018",
      description: "Monthly depreciation entry",
      amount: "₹15,000",
      date: "2026-02-03",
      status: "Posted",
    },
    {
      id: "PAY-2026-067",
      description: "Payment received - MediCare Ltd",
      amount: "₹250,000",
      date: "2026-02-02",
      status: "Received",
    },
    {
      id: "INV-2026-044",
      description: "Sales Invoice - City Clinic",
      amount: "₹95,000",
      date: "2026-02-01",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Accounting Dashboard
        </h1>
        <p className="text-gray-600">
          Financial overview and quick access to accounting modules
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div
            key={index}
            className={`bg-gradient-to-br ${kpi.bgGradient} rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${kpi.bgGradient} bg-opacity-20 rounded-lg`}>
                {kpi.icon}
              </div>
              <div
                className={`flex items-center space-x-1 text-sm font-semibold ${
                  kpi.trend === "up" ? "text-green-200" : "text-red-200"
                }`}
              >
                {kpi.trend === "up" ? (
                  <FaArrowUp size={14} />
                ) : (
                  <FaArrowDown size={14} />
                )}
                <span>{kpi.trendValue}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-white text-opacity-90 mb-1">
              {kpi.title}
            </h3>
            <p className="text-3xl font-bold mb-2">{kpi.value}</p>
            <p className="text-xs text-white text-opacity-80">{kpi.subtext}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link
                to="/accounts/sales-invoices"
                className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-center group"
              >
                <FaFileInvoice className="text-2xl text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Sales Invoices
                </p>
              </Link>

              <Link
                to="/accounts/payments"
                className="p-4 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors text-center group"
              >
                <FaMoneyBillWave className="text-2xl text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Payments</p>
              </Link>

              <Link
                to="/accounts/purchase-invoices"
                className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition-colors text-center group"
              >
                <FaFileInvoice className="text-2xl text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Purchase Invoices
                </p>
              </Link>

              <Link
                to="/accounts/chart-of-accounts"
                className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors text-center group"
              >
                <FaChartBar className="text-2xl text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Chart of Accounts
                </p>
              </Link>

              <Link
                to="/accounts/journals"
                className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors text-center group"
              >
                <FaBook className="text-2xl text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Journal Entries
                </p>
              </Link>

              <Link
                to="/accounts/bank-reconciliation"
                className="p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors text-center group"
              >
                <FaMoneyBillWave className="text-2xl text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Bank Reconciliation
                </p>
              </Link>

              <Link
                to="/accounts/credit-notes"
                className="p-4 border border-gray-200 rounded-lg hover:bg-teal-50 transition-colors text-center group"
              >
                <FaFileInvoice className="text-2xl text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Credit Notes
                </p>
              </Link>

              <Link
                to="/accounts/debit-notes"
                className="p-4 border border-gray-200 rounded-lg hover:bg-pink-50 transition-colors text-center group"
              >
                <FaFileInvoice className="text-2xl text-pink-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Debit Notes
                </p>
              </Link>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Financial Summary
          </h2>
          <div className="space-y-4">
            <div className="border-b pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Cash & Bank
                </span>
                <span className="text-lg font-bold text-blue-600">₹35.2L</span>
              </div>
              <p className="text-xs text-gray-500">Available balance</p>
            </div>
            <div className="border-b pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Accounts Receivable
                </span>
                <span className="text-lg font-bold text-orange-600">₹12.8L</span>
              </div>
              <p className="text-xs text-gray-500">Outstanding from customers</p>
            </div>
            <div className="border-b pb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Accounts Payable
                </span>
                <span className="text-lg font-bold text-red-600">₹8.5L</span>
              </div>
              <p className="text-xs text-gray-500">Outstanding to vendors</p>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Working Capital
                </span>
                <span className="text-lg font-bold text-green-600">₹39.5L</span>
              </div>
              <p className="text-xs text-gray-500">Current assets - liabilities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions
          </h2>
          <Link
            to="/accounts/sales-invoices"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Reference
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    {transaction.id}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.description}
                  </td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    {transaction.amount}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {transaction.date}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        transaction.status === "Paid" ||
                        transaction.status === "Received"
                          ? "bg-green-100 text-green-800"
                          : transaction.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {transaction.status}
                    </span>
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

export default AccountingDashboard;
