import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import KpiCard from "./components/KpiCard";
import ChartCard from "./components/ChartCard";
import AlertCard from "./components/AlertCard";
import QuickLinks from "./components/QuickLinks";

// Import chart components
import InventoryValueChart from "./components/charts/InventoryValueChart";
import LocationStockChart from "./components/charts/LocationStockChart";

import AgingInventoryChart from "./components/charts/AgingInventoryChart";
import TransactionTrendChart from "./components/charts/TransactionTrendChart";

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>("week");
  const [searchText, setSearchText] = useState<string>("");
  const [searchType, setSearchType] = useState<string>("all");

  // This would typically come from an API in a real application
  const kpiData = {
    inventoryValue: {
      value: "$2,458,750",
      change: 3.2,
      isIncrease: true,
    },
    onHandQuantity: {
      value: "428,562",
      change: 5.7,
      isIncrease: true,
    },
    turnoverRatio: {
      value: "4.2",
      change: 1.8,
      isIncrease: false,
    },
    wipValue: {
      value: "$342,180",
      change: 7.3,
      isIncrease: true,
    },
    stockoutItems: {
      value: "24",
      change: 8.3,
      isIncrease: false, // Decrease in stockouts is good
    },
    overstockItems: {
      value: "37",
      change: 12.1,
      isIncrease: true,
    },
    itemsAtVendor: {
      value: "192",
      change: 3.8,
      isIncrease: true,
    },
    demoStockItems: {
      value: "53",
      change: 4.2,
      isIncrease: false,
    },
  };

  // Quick links data
  const operationLinks = [
    {
      icon: "truck-loading",
      label: "New Goods Receipt",
      url: "goods-receipt.html",
    },
    { icon: "dolly", label: "New Goods Issue", url: "goods-issue.html" },
    {
      icon: "exchange-alt",
      label: "New Stock Transfer",
      url: "stock-transfer.html",
    },
    {
      icon: "truck-moving",
      label: "Transfer to Vendor",
      url: "transfer-to-vendor.html",
    },
    {
      icon: "box-open",
      label: "Receipt from Vendor",
      url: "receipt-from-vendor.html",
    },
    {
      icon: "clipboard-check",
      label: "New Cycle Count",
      url: "cycle-count.html",
    },
    {
      icon: "balance-scale",
      label: "New Adjustment",
      url: "inventory-adjustment.html",
    },
    {
      icon: "industry",
      label: "Issue to Production",
      url: "material-issue.html",
    },
  ];

  const reportLinks = [
    {
      icon: "chart-line",
      label: "Analytics Dashboard",
      url: "reports/analytics-dashboard.html",
    },
    {
      icon: "dollar-sign",
      label: "Inventory Valuation",
      url: "reports/inventory-valuation.html",
    },
    {
      icon: "hourglass-half",
      label: "Stock Aging",
      url: "reports/stock-aging.html",
    },
    {
      icon: "minus-circle",
      label: "Slow-Moving & Obsolete",
      url: "reports/slow-moving.html",
    },
    {
      icon: "sync",
      label: "Inventory Turnover",
      url: "reports/inventory-turnover.html",
    },
    {
      icon: "truck",
      label: "Items at Vendor",
      url: "reports/items-at-vendor.html",
    },
    { icon: "desktop", label: "Demo Stock", url: "reports/demo-stock.html" },
  ];

  // Alert data
  const stockoutAlerts = [
    {
      id: 1,
      title: "PCB-V2-001 - Circuit Board V2",
      subtitle: "Electronic Components",
      status: "0 pcs",
      badgeType: "danger",
    },
    {
      id: 2,
      title: "MEM-16GB-DDR4 - 16GB DDR4 RAM",
      subtitle: "Computer Components",
      status: "0 pcs",
      badgeType: "danger",
    },
    {
      id: 3,
      title: "CONN-USB-C - USB-C Connector",
      subtitle: "Electronic Components",
      status: "0 pcs",
      badgeType: "danger",
    },
    {
      id: 4,
      title: "SCREW-M4-10MM - M4x10mm Screws",
      subtitle: "Mechanical Components",
      status: "4 pcs",
      badgeType: "warning",
    },
    {
      id: 5,
      title: 'DISP-LCD-7 - 7" LCD Display',
      subtitle: "Electronic Components",
      status: "0 pcs",
      badgeType: "danger",
    },
  ];

  const pendingReceipts = [
    {
      id: 1,
      title: "PO-20250501-001",
      subtitle: "TechSupply Inc. - Expected: May 04, 2025",
      status: "Pending",
      badgeType: "warning",
    },
    {
      id: 2,
      title: "PO-20250429-008",
      subtitle: "ElectroMax - Expected: May 03, 2025",
      status: "In Transit",
      badgeType: "info",
    },
    {
      id: 3,
      title: "PO-20250428-015",
      subtitle: "MetalWorks Ltd. - Expected: May 05, 2025",
      status: "Pending",
      badgeType: "warning",
    },
    {
      id: 4,
      title: "PO-20250427-003",
      subtitle: "ComponentPro - Expected: May 04, 2025",
      status: "In Transit",
      badgeType: "info",
    },
    {
      id: 5,
      title: "PO-20250425-012",
      subtitle: "ChipSupply Inc. - Expected: May 03, 2025",
      status: "In Transit",
      badgeType: "info",
    },
  ];

  const cycleCounts = [
    {
      id: 1,
      title: "CC00124 - Tool Room Monthly Count",
      subtitle: "Scheduled: May 4, 2025",
      status: "Due Tomorrow",
      badgeType: "warning",
    },
    {
      id: 2,
      title: "CC00128 - ABC Analysis - A Items",
      subtitle: "In Progress (65%)",
      status: "In Progress",
      badgeType: "info",
    },
    {
      id: 3,
      title: "CC00129 - Plastics Storage Weekly Check",
      subtitle: "Scheduled: May 5, 2025",
      status: "Due Soon",
      badgeType: "warning",
    },
    {
      id: 4,
      title: "CC00130 - Finished Goods Spot Check",
      subtitle: "Scheduled: May 7, 2025",
      status: "Due Soon",
      badgeType: "warning",
    },
    {
      id: 5,
      title: "CC00131 - Electronics Department Check",
      subtitle: "Scheduled: May 8, 2025",
      status: "Due Soon",
      badgeType: "warning",
    },
  ];

  const handleSearch = () => {
    console.log(`Searching for: ${searchText} in ${searchType}`);
    // This would typically make an API call to search for items
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* <Navbar /> */}

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow">
            <svg
              className="h-5 w-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <select
              className="border-none text-sm font-medium text-gray-700 focus:outline-none bg-transparent cursor-pointer pr-8"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Search
          </h3>
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="Search by item code, description, serial, lot..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="item">Items</option>
              <option value="serial">Serial Numbers</option>
              <option value="lot">Lot Numbers</option>
              <option value="transaction">Transactions</option>
            </select>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="w-4 h-4 inline-block mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
              Search
            </button>
          </div>
        </div>

        {/* First Row of KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Total Inventory Value"
            value={kpiData.inventoryValue.value}
            change={kpiData.inventoryValue.change}
            isIncrease={kpiData.inventoryValue.isIncrease}
            icon="dollar-sign"
            color="blue"
          />
          <KpiCard
            title="Total On-Hand Quantity"
            value={kpiData.onHandQuantity.value}
            change={kpiData.onHandQuantity.change}
            isIncrease={kpiData.onHandQuantity.isIncrease}
            icon="boxes"
            color="green"
          />
          <KpiCard
            title="Inventory Turnover Ratio"
            value={kpiData.turnoverRatio.value}
            change={kpiData.turnoverRatio.change}
            isIncrease={kpiData.turnoverRatio.isIncrease}
            icon="sync"
            color="yellow"
          />
          <KpiCard
            title="WIP Value"
            value={kpiData.wipValue.value}
            change={kpiData.wipValue.change}
            isIncrease={kpiData.wipValue.isIncrease}
            icon="industry"
            color="sky"
          />
        </div>

        {/* Second Row of KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <KpiCard
            title="Stockout Items"
            value={kpiData.stockoutItems.value}
            change={kpiData.stockoutItems.change}
            isIncrease={kpiData.stockoutItems.isIncrease}
            icon="exclamation-triangle"
            color="red"
          />
          <KpiCard
            title="Overstock Items"
            value={kpiData.overstockItems.value}
            change={kpiData.overstockItems.change}
            isIncrease={kpiData.overstockItems.isIncrease}
            icon="warehouse"
            color="yellow"
          />
          <KpiCard
            title="Items At Vendor"
            value={kpiData.itemsAtVendor.value}
            change={kpiData.itemsAtVendor.change}
            isIncrease={kpiData.itemsAtVendor.isIncrease}
            icon="truck"
            color="sky"
          />
          <KpiCard
            title="Demo Stock Items"
            value={kpiData.demoStockItems.value}
            change={kpiData.demoStockItems.change}
            isIncrease={kpiData.demoStockItems.isIncrease}
            icon="desktop"
            color="green"
          />
        </div>

        {/* Quick Links */}
        <QuickLinks title="Quick Links" links={operationLinks} />

        {/* Report Quick Links */}
        <QuickLinks title="Reports" links={reportLinks} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Inventory Value by Category">
            <InventoryValueChart />
          </ChartCard>
          <ChartCard title="Stock Status by Location">
            <LocationStockChart />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <div className="lg:col-span-8">
            <ChartCard title="Transaction Trend (Last 30 Days)">
              <TransactionTrendChart />
            </ChartCard>
          </div>
          <div className="lg:col-span-4">
            <ChartCard title="Aging Inventory Summary">
              <div className="flex flex-wrap gap-4 mb-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-600">0-30 Days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-xs text-gray-600">31-60 Days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                  <span className="text-xs text-gray-600">61-90 Days</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span className="text-xs text-gray-600">90+ Days</span>
                </div>
              </div>
              <AgingInventoryChart />
            </ChartCard>
          </div>
        </div>

        {/* Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AlertCard
            title="Stockout Alert"
            icon="exclamation-circle"
            iconColor="text-red-600"
            count={stockoutAlerts.length}
            items={stockoutAlerts}
            borderColor="border-red-600"
            countBackground="bg-red-100 text-red-600"
            footerLink="#"
            footerText="View All Stockout Items"
          />
          <AlertCard
            title="Pending Goods Receipts"
            icon="truck-loading"
            iconColor="text-yellow-600"
            count={pendingReceipts.length}
            items={pendingReceipts}
            borderColor="border-yellow-600"
            countBackground="bg-yellow-100 text-yellow-600"
            footerLink="goods-receipt.html"
            footerText="Process Goods Receipts"
          />
          <AlertCard
            title="Cycle Counts Due"
            icon="clipboard-list"
            iconColor="text-green-600"
            count={cycleCounts.length}
            items={cycleCounts}
            borderColor="border-green-600"
            countBackground="bg-green-100 text-green-600"
            footerLink="cycle-count.html"
            footerText="View All Cycle Counts"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
