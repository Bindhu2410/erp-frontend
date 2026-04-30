import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  FaDollarSign,
  FaBoxes,
  FaSync,
  FaIndustry,
  FaExclamationTriangle,
  FaWarehouse,
  FaTruck,
  FaDesktop,
  FaTruckLoading,
  FaDolly,
  FaExchangeAlt,
  FaTruckMoving,
  FaBoxOpen,
  FaClipboardCheck,
  FaBalanceScale,
  FaChartLine,
  FaHourglassHalf,
  FaMinusCircle,
  FaClipboardList,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import api from "../../services/api";

const kpis = [
  {
    title: "Total Inventory Value",
    value: "$2,458,750",
    change: "+3.2% since last month",
    icon: <FaDollarSign className="text-gray-300 text-2xl" />,
    changeType: "increase",
    barClass: "bg-blue-500",
  },
  {
    title: "Total On-Hand Quantity",
    value: "428,562",
    change: "+5.7% since last month",
    icon: <FaBoxes className="text-gray-300 text-2xl" />,
    changeType: "increase",
    barClass: "bg-green-500",
  },
  {
    title: "Inventory Turnover Ratio",
    value: "4.2",
    change: "-1.8% since last month",
    icon: <FaSync className="text-gray-300 text-2xl" />,
    changeType: "decrease",
    barClass: "bg-yellow-500",
  },
  {
    title: "WIP Value",
    value: "$342,180",
    change: "+7.3% since last month",
    icon: <FaIndustry className="text-gray-300 text-2xl" />,
    changeType: "increase",
    barClass: "bg-blue-300",
  },
  {
    title: "Stockout Items",
    value: "24",
    change: "-8.3% since last month",
    icon: <FaExclamationTriangle className="text-gray-300 text-2xl" />,
    changeType: "decrease",
    barClass: "bg-red-500",
  },
  {
    title: "Overstock Items",
    value: "37",
    change: "+12.1% since last month",
    icon: <FaWarehouse className="text-gray-300 text-2xl" />,
    changeType: "increase",
    barClass: "bg-yellow-500",
  },
  {
    title: "Items At Vendor",
    value: "192",
    change: "+3.8% since last month",
    icon: <FaTruck className="text-gray-300 text-2xl" />,
    changeType: "increase",
    barClass: "bg-blue-400",
  },
  {
    title: "Demo Stock Items",
    value: "53",
    change: "-4.2% since last month",
    icon: <FaDesktop className="text-gray-300 text-2xl" />,
    changeType: "decrease",
    barClass: "bg-green-400",
  },
];

const quickLinks = [
  { label: "New Goods Receipt", icon: <FaTruckLoading />, href: "#" },
  { label: "New Goods Issue", icon: <FaDolly />, href: "#" },
  { label: "New Stock Transfer", icon: <FaExchangeAlt />, href: "#" },
  { label: "Transfer to Vendor", icon: <FaTruckMoving />, href: "#" },
  { label: "Receipt from Vendor", icon: <FaBoxOpen />, href: "#" },
  { label: "New Cycle Count", icon: <FaClipboardCheck />, href: "#" },
  { label: "New Adjustment", icon: <FaBalanceScale />, href: "#" },
  { label: "Issue to Production", icon: <FaIndustry />, href: "#" },
];

const reportLinks = [
  { label: "Analytics Dashboard", icon: <FaChartLine />, href: "#" },
  { label: "Inventory Valuation", icon: <FaDollarSign />, href: "#" },
  { label: "Stock Aging", icon: <FaHourglassHalf />, href: "#" },
  { label: "Slow-Moving & Obsolete", icon: <FaMinusCircle />, href: "#" },
  { label: "Inventory Turnover", icon: <FaSync />, href: "#" },
  { label: "Items at Vendor", icon: <FaTruck />, href: "#" },
  { label: "Demo Stock", icon: <FaDesktop />, href: "#" },
];

interface Task {
  id: number;
  taskId: number | null;
  taskName: string;
  description: string;
  taskType: string;
  status: string;
  priority: string;
  dueDate: string | null;
  stage: string | null;
  stageItemId: string | null;
  ownerId: number;
  assigneeId: number;
  createdAt: string;
  updatedAt: string;
  userCreated: number | null;
  userUpdated: number | null;
  parentTaskId: number | null;
  ownerName: string | null;
  assigneeName: string | null;
}

const InventoryDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("week");
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [demoTasks, setDemoTasks] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);

  // Chart data
  const inventoryValueOptions = {
    chart: { type: "donut" as const, toolbar: { show: false } },
    labels: [
      "Raw Materials",
      "Finished Goods",
      "Components",
      "Work in Progress",
      "Tools & Equipment",
    ],
    colors: ["#2563eb", "#16a34a", "#ca8a04", "#0ea5e9", "#dc2626"],
    legend: { position: "right" as const },
    dataLabels: { enabled: true },
    plotOptions: { pie: { donut: { size: "65%" } } },
    tooltip: { enabled: true },
  };
  const inventoryValueSeries = [845000, 1086000, 356000, 342180, 178500];

  const locationStockOptions = {
    chart: { type: "bar" as const, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true, borderRadius: 6 } },
    xaxis: {
      categories: [
        "Main Warehouse",
        "Raw Materials Store",
        "Component Store",
        "Finished Goods Store",
        "Tool Room",
      ],
      title: { text: "Quantity" },
    },
    colors: ["#2563eb", "#16a34a", "#ca8a04", "#0ea5e9", "#dc2626"],
    dataLabels: { enabled: false },
    grid: { borderColor: "#e2e8f0" },
  };
  const locationStockSeries = [
    {
      name: "Quantity",
      data: [185240, 96320, 82450, 54780, 9772],
    },
  ];

  const transactionTrendOptions = {
    chart: { type: "line" as const, toolbar: { show: false } },
    xaxis: {
      categories: [
        "Apr 3",
        "Apr 6",
        "Apr 9",
        "Apr 12",
        "Apr 15",
        "Apr 18",
        "Apr 21",
        "Apr 24",
        "Apr 27",
        "Apr 30",
        "May 3",
      ],
      title: { text: "Date" },
    },
    colors: ["#16a34a", "#dc2626", "#0ea5e9"],
    stroke: { curve: "smooth" as const, width: 3 },
    legend: { position: "top" as const },
    grid: { borderColor: "#e2e8f0" },
  };
  const transactionTrendSeries = [
    { name: "Receipts", data: [12, 14, 10, 15, 9, 8, 16, 11, 13, 18, 15] },
    { name: "Issues", data: [8, 9, 11, 6, 12, 15, 10, 13, 9, 14, 12] },
    { name: "Transfers", data: [5, 7, 4, 8, 6, 9, 7, 5, 8, 10, 6] },
  ];

  const agingInventoryOptions = {
    chart: { type: "bar" as const, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    xaxis: {
      categories: ["0-30 Days", "31-60 Days", "61-90 Days", "90+ Days"],
      title: { text: "Age Category" },
    },
    colors: ["#22c55e", "#eab308", "#f97316", "#ef4444"],
    dataLabels: { enabled: false },
    grid: { borderColor: "#e2e8f0" },
  };
  const agingInventorySeries = [
    {
      name: "Value ($)",
      data: [1250000, 650000, 350000, 208750],
    },
  ];

  // Fetch tasks and filter for today's date with stage "demo"
  useEffect(() => {
    const fetchDemoTasks = async () => {
      try {
        const response = await api.get("Task");
        const tasks = Array.isArray(response.data) ? response.data : [];

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];

        // Filter tasks created today with stage "demo"
        const todayDemoTasks = tasks.filter((task: Task) => {
          const taskCreatedDate = task.createdAt.split("T")[0];
          return (
            taskCreatedDate === today && task.stage?.toLowerCase() === "demo"
          );
        });

        if (todayDemoTasks.length > 0) {
          setDemoTasks(todayDemoTasks);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchDemoTasks();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Dashboard
        </h1>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
          <FaSearch className="text-gray-400" />
          <select
            className="bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none"
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

      {/* Quick Search */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Quick Search</h3>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm"
            placeholder="Search by item code, description, serial, lot..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="item">Items</option>
            <option value="serial">Serial Numbers</option>
            <option value="lot">Lot Numbers</option>
            <option value="transaction">Transactions</option>
          </select>
          <button className="bg-blue-600 text-white rounded-lg px-6 py-2 flex items-center gap-2 hover:bg-blue-700 transition">
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.slice(0, 4).map((kpi, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl shadow p-6 pt-5 hover:shadow-lg transition"
            style={{ minHeight: 140 }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl ${kpi.barClass}`}
            ></div>
            <div className="absolute top-5 right-5 text-3xl">{kpi.icon}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wide">
              {kpi.title}
            </div>
            <div className="text-3xl font-extrabold text-gray-800 mb-2">
              {kpi.value}
            </div>
            <div
              className={`text-xs flex items-center gap-1 ${
                kpi.changeType === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {kpi.changeType === "increase" ? (
                <FaChevronRight className="rotate-[-90deg]" />
              ) : (
                <FaChevronRight className="rotate-90" />
              )}{" "}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.slice(4).map((kpi, idx) => (
          <div
            key={idx}
            className="relative bg-white rounded-2xl shadow p-6 pt-5 hover:shadow-lg transition"
            style={{ minHeight: 140 }}
          >
            <div
              className={`absolute top-0 left-0 w-full h-2 rounded-t-2xl ${kpi.barClass}`}
            ></div>
            <div className="absolute top-5 right-5 text-3xl">{kpi.icon}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase mb-1 tracking-wide">
              {kpi.title}
            </div>
            <div className="text-3xl font-extrabold text-gray-800 mb-2">
              {kpi.value}
            </div>
            <div
              className={`text-xs flex items-center gap-1 ${
                kpi.changeType === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {kpi.changeType === "increase" ? (
                <FaChevronRight className="rotate-[-90deg]" />
              ) : (
                <FaChevronRight className="rotate-90" />
              )}{" "}
              {kpi.change}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Report Links */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">Reports</h3>
        <div className="flex flex-wrap gap-3">
          {reportLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              {link.icon} {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-base mb-4">
            Inventory Value by Category
          </h3>
          <Chart
            options={inventoryValueOptions}
            series={inventoryValueSeries}
            type="donut"
            height={300}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="font-semibold text-base mb-4">
            Stock Status by Location
          </h3>
          <Chart
            options={locationStockOptions}
            series={locationStockSeries}
            type="bar"
            height={300}
          />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1">
          <h3 className="font-semibold text-base mb-4">
            Transaction Trend (Last 30 Days)
          </h3>
          <Chart
            options={transactionTrendOptions}
            series={transactionTrendSeries}
            type="line"
            height={300}
          />
        </div>
        <div className="bg-white rounded-xl shadow p-6 lg:col-span-1">
          <h3 className="font-semibold text-base mb-4">
            Aging Inventory Summary
          </h3>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
              0-30 Days
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
              31-60 Days
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
              61-90 Days
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
              90+ Days
            </div>
          </div>
          <Chart
            options={agingInventoryOptions}
            series={agingInventorySeries}
            type="bar"
            height={250}
          />
        </div>
      </div>

      {/* Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Stockout Alert */}
        <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-red-200 bg-red-50">
            <h3 className="font-semibold text-base flex items-center gap-2 text-red-700">
              <FaExclamationTriangle /> Stockout Alert{" "}
              <span className="bg-red-100 text-red-700 rounded-full px-3 py-1 text-xs font-bold ml-2">
                24
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {/* Example alert items */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  PCB-V2-001 - Circuit Board V2
                </div>
                <div className="text-xs text-gray-500">
                  Electronic Components
                </div>
              </div>
              <span className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">
                0 pcs
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  MEM-16GB-DDR4 - 16GB DDR4 RAM
                </div>
                <div className="text-xs text-gray-500">Computer Components</div>
              </div>
              <span className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">
                0 pcs
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CONN-USB-C - USB-C Connector
                </div>
                <div className="text-xs text-gray-500">
                  Electronic Components
                </div>
              </div>
              <span className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">
                0 pcs
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  SCREW-M4-10MM - M4x10mm Screws
                </div>
                <div className="text-xs text-gray-500">
                  Mechanical Components
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                4 pcs
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  DISP-LCD-7 - 7" LCD Display
                </div>
                <div className="text-xs text-gray-500">
                  Electronic Components
                </div>
              </div>
              <span className="bg-red-100 text-red-700 rounded px-2 py-1 text-xs font-semibold">
                0 pcs
              </span>
            </div>
          </div>
          <div className="px-6 py-3 border-t text-center bg-gray-50">
            <button
              type="button"
              className="text-blue-600 text-sm font-medium hover:underline flex items-center"
            >
              View All Stockout Items <FaChevronRight className="inline ml-1" />
            </button>
          </div>
        </div>

        {/* Pending Goods Receipts */}
        <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-200 bg-yellow-50">
            <h3 className="font-semibold text-base flex items-center gap-2 text-yellow-700">
              <FaTruckLoading /> Pending Goods Receipts{" "}
              <span className="bg-yellow-100 text-yellow-700 rounded-full px-3 py-1 text-xs font-bold ml-2">
                18
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">PO-20250501-001</div>
                <div className="text-xs text-gray-500">
                  TechSupply Inc. - Expected: May 04, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">PO-20250429-008</div>
                <div className="text-xs text-gray-500">
                  ElectroMax - Expected: May 03, 2025
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">
                In Transit
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">PO-20250428-015</div>
                <div className="text-xs text-gray-500">
                  MetalWorks Ltd. - Expected: May 05, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">PO-20250427-003</div>
                <div className="text-xs text-gray-500">
                  ComponentPro - Expected: May 04, 2025
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">
                In Transit
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">PO-20250425-012</div>
                <div className="text-xs text-gray-500">
                  ChipSupply Inc. - Expected: May 03, 2025
                </div>
              </div>
              <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">
                In Transit
              </span>
            </div>
          </div>
          <div className="px-6 py-3 border-t text-center bg-gray-50">
            <button
              type="button"
              className="text-blue-600 text-sm font-medium hover:underline flex items-center"
            >
              Process Goods Receipts <FaChevronRight className="inline ml-1" />
            </button>
          </div>
        </div>

        {/* Cycle Counts Due */}
        <div className="bg-white rounded-xl shadow p-0 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-green-200 bg-green-50">
            <h3 className="font-semibold text-base flex items-center gap-2 text-green-700">
              <FaClipboardList /> Cycle Counts Due{" "}
              <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-bold ml-2">
                7
              </span>
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CC00124 - Tool Room Monthly Count
                </div>
                <div className="text-xs text-gray-500">
                  Scheduled: May 4, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Due Tomorrow
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CC00128 - ABC Analysis - A Items
                </div>
                <div className="text-xs text-gray-500">In Progress (65%)</div>
              </div>
              <span className="bg-blue-100 text-blue-700 rounded px-2 py-1 text-xs font-semibold">
                In Progress
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CC00129 - Plastics Storage Weekly Check
                </div>
                <div className="text-xs text-gray-500">
                  Scheduled: May 5, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Due Soon
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CC00130 - Finished Goods Spot Check
                </div>
                <div className="text-xs text-gray-500">
                  Scheduled: May 7, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Due Soon
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition">
              <div>
                <div className="font-medium text-sm">
                  CC00131 - Electronics Department Check
                </div>
                <div className="text-xs text-gray-500">
                  Scheduled: May 8, 2025
                </div>
              </div>
              <span className="bg-yellow-100 text-yellow-700 rounded px-2 py-1 text-xs font-semibold">
                Due Soon
              </span>
            </div>
          </div>
          <div className="px-6 py-3 border-t text-center bg-gray-50">
            <button
              type="button"
              className="text-blue-600 text-sm font-medium hover:underline flex items-center"
            >
              View All Cycle Counts <FaChevronRight className="inline ml-1" />
            </button>
          </div>
        </div>
      </div>
      {/* Popup Modal for Demo Stage Tasks */}
      {/* Demo Tasks Card - Inline Display */}
      {showModal && demoTasks.length > 0 && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
            {/* Green Header with Checkmark */}
            <div className="bg-gradient-to-b from-green-400 to-green-500 p-3 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-white mb-1">
                {demoTasks.length === 1 ? "New Demo Task" : "New Demo Tasks"}
              </h2>
              <p className="text-green-50 text-xs text-center">
                {demoTasks.length} task{demoTasks.length !== 1 ? "s" : ""}{" "}
                created today
              </p>
            </div>

            {/* Content */}
            <div className="px-5 py-5 max-h-[45vh] overflow-y-auto space-y-3">
              {demoTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-indigo-50 border-l-4 border-green-500 pl-4 py-3 rounded-lg"
                >
                  <h3 className="text-sm font-bold text-gray-800 mb-2">
                    {task.taskName}
                  </h3>

                  {/* Description with parsed demo data */}
                  <div className="text-xs text-gray-700 space-y-1 mb-3">
                    {task.description && (
                      <>
                        {task.description.includes("Demo scheduled") ? (
                          <>
                            <p>
                              <span className="font-semibold">
                                📅 Schedule:
                              </span>{" "}
                              {task.description
                                .split("|")[0]
                                ?.replace("Demo scheduled for customer: ", "")
                                .trim()}
                            </p>
                            <p>
                              <span className="font-semibold">
                                📆 Demo Date:
                              </span>{" "}
                              {(() => {
                                const dateStr = task.description
                                  .split("Demo Date:")[1]
                                  ?.split("|")[0]
                                  ?.trim();
                                if (dateStr) {
                                  const date = new Date(dateStr);
                                  return date.toLocaleDateString();
                                }
                                return dateStr;
                              })()}
                            </p>
                            <p>
                              <span className="font-semibold">
                                ⏰ Demo Time:
                              </span>{" "}
                              {task.description
                                .split("Demo Time:")[1]
                                ?.split("|")[0]
                                ?.trim()}
                            </p>
                            <p>
                              <span className="font-semibold">🔑 Demo ID:</span>{" "}
                              {task.description.split("Demo ID:")[1]?.trim()}
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-600">{task.description}</p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                      {task.status}
                    </span>
                    <span
                      className={`inline-block px-2 py-1 text-white rounded text-xs font-semibold ${
                        task.priority === "High"
                          ? "bg-red-500"
                          : task.priority === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="inline-block px-2 py-1 bg-indigo-200 text-indigo-700 rounded text-xs font-semibold">
                      {task.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="px-5 py-4 bg-gray-50 flex justify-center border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white font-semibold rounded-full hover:shadow-lg transition-all hover:scale-105 text-sm"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
