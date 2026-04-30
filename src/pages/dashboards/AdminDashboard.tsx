import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import api from "../../services/api";

interface MetricData {
  leads: { total: number; growth: number; new: number };
  opportunity: { total: number; growth: number; pipeline: number };
  demo: { total: number; growth: number; scheduled: number };
  quotation: { total: number; growth: number; accepted: number };
  purchaseOrder: { total: number; growth: number; value: number };
  salesOrder: { total: number; growth: number; revenue: number };
  invoices: { total: number; growth: number; collected: number };
  deliveries: { total: number; growth: number; onTime: number };
  payments: { total: number; growth: number; pending: number };
  tasks: { total: number; growth: number; completed: number };
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Weekly" | "Monthly" | "Yearly">("Weekly");
  const [metrics, setMetrics] = useState<MetricData>({
    leads: { total: 1240, growth: 12, new: 45 },
    opportunity: { total: 850, growth: 8, pipeline: 2500000 },
    demo: { total: 320, growth: 15, scheduled: 28 },
    quotation: { total: 450, growth: 18, accepted: 82 },
    purchaseOrder: { total: 280, growth: 5, value: 1800000 },
    salesOrder: { total: 620, growth: 22, revenue: 4200000 },
    invoices: { total: 890, growth: 10, collected: 789 },
    deliveries: { total: 1050, growth: 9, onTime: 95 },
    payments: { total: 2300000, growth: 14, pending: 450000 },
    tasks: { total: 540, growth: 11, completed: 320 },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulate API calls with timeout
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Chart configurations
  const pipelineStages = [
    { stage: "Prospecting", count: 145, color: "#8b5cf6" },
    { stage: "Qualification", count: 89, color: "#a78bfa" },
    { stage: "Proposal", count: 56, color: "#c4b5fd" },
    { stage: "Negotiation", count: 34, color: "#ddd6fe" },
    { stage: "Closing", count: 12, color: "#f3e8ff" },
  ];

  const revenueChartOptions: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
      dropShadow: { enabled: true, top: 8, left: 0, blur: 10, opacity: 0.08 },
    },
    xaxis: {
      categories: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#94a3b8", fontSize: "11px" },
        formatter: (v: number) => `₹${v}k`,
      },
    },
    stroke: { curve: "smooth", width: 3 },
    colors: ["#6366f1"],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.02,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#f1f5f9",
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    },
    markers: { size: 0, hover: { size: 5 } },
    tooltip: {
      theme: "light",
      y: { formatter: (v: number) => `₹${v}k` },
    },
    dataLabels: { enabled: false },
  };

  const revenueChartSeries = [
    {
      name: "Sales Revenue",
      data: [320, 450, 380, 520, 680, 750, 920, 850, 1020, 1150, 1320, 1480],
    },
  ];

  const topPerformersData = {
    labels: ["Kathryn", "Richards", "Robert", "Bessie", "Floyd"],
    series: [{ name: "Sales", data: [72, 65, 60, 55, 40] }],
  };

  const collectionStatusOptions: ApexOptions = {
    chart: { type: "donut", toolbar: { show: false } },
    labels: ["Collected", "Pending", "Overdue"],
    colors: ["#10b981", "#f59e0b", "#ef4444"],
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: { show: true, fontSize: "13px", color: "#64748b", offsetY: 4 },
            value: {
              show: true,
              fontSize: "22px",
              fontWeight: 700,
              color: "#0f172a",
              formatter: (v: string) => `₹${(Number(v) / 100000).toFixed(1)}L`,
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              color: "#64748b",
              formatter: (w: any) => {
                const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                return `₹${(sum / 100000).toFixed(1)}L`;
              },
            },
          },
        },
      },
    },
    stroke: { width: 0 },
    legend: { show: false },
    tooltip: {
      y: { formatter: (v: number) => `₹${(v / 100000).toFixed(1)}L` },
    },
  };

  const collectionStatusSeries = [2890000, 450000, 180000];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Sales Performance Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Real-time insights across all business modules
        </p>
      </div>

      {/* Main Executive Metrics - 10 Topics */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Main Executive Metrics
        </h2>
        <p className="text-sm text-gray-500">Executive top 10 KPIs overview</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {(
          [
            {
              id: "leads",
              name: "Leads",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              iconBg: "bg-green-100",
              iconColor: "text-green-500",
              value: metrics.leads.total.toLocaleString(),
              valueColor: "text-green-500",
              trend: metrics.leads.growth,
              sparkColor: "#22c55e",
              sparkData: [30, 40, 35, 50, 49, 60, 70, 91, 125],
            },
            {
              id: "opportunity",
              name: "Opportunity",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              ),
              iconBg: "bg-purple-100",
              iconColor: "text-purple-600",
              value: metrics.opportunity.total.toLocaleString(),
              valueColor: "text-purple-600",
              trend: metrics.opportunity.growth,
              sparkColor: "#9333ea",
              sparkData: [20, 35, 30, 45, 40, 55, 60, 75, 85],
            },
            {
              id: "demo",
              name: "Demos",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                </svg>
              ),
              iconBg: "bg-orange-100",
              iconColor: "text-orange-500",
              value: metrics.demo.total.toLocaleString(),
              valueColor: "text-orange-500",
              trend: metrics.demo.growth,
              sparkColor: "#f97316",
              sparkData: [10, 20, 15, 30, 25, 40, 35, 50, 60],
            },
            {
              id: "quotation",
              name: "Quotations",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
              iconBg: "bg-blue-100",
              iconColor: "text-blue-500",
              value: metrics.quotation.total.toLocaleString(),
              valueColor: "text-blue-500",
              trend: metrics.quotation.growth,
              sparkColor: "#3b82f6",
              sparkData: [40, 55, 50, 65, 60, 75, 70, 85, 95],
            },
            {
              id: "purchaseOrder",
              name: "Purchase Orders",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              ),
              iconBg: "bg-teal-100",
              iconColor: "text-teal-500",
              value: metrics.purchaseOrder.total.toLocaleString(),
              valueColor: "text-teal-500",
              trend: metrics.purchaseOrder.growth,
              sparkColor: "#14b8a6",
              sparkData: [15, 25, 20, 35, 30, 45, 40, 55, 65],
            },
            {
              id: "salesOrder",
              name: "Sales Orders",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              ),
              iconBg: "bg-indigo-100",
              iconColor: "text-indigo-500",
              value: metrics.salesOrder.total.toLocaleString(),
              valueColor: "text-indigo-500",
              trend: metrics.salesOrder.growth,
              sparkColor: "#6366f1",
              sparkData: [50, 65, 60, 75, 70, 85, 80, 95, 110],
            },
            {
              id: "invoices",
              name: "Invoices",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              ),
              iconBg: "bg-pink-100",
              iconColor: "text-pink-500",
              value: metrics.invoices.total.toLocaleString(),
              valueColor: "text-pink-500",
              trend: metrics.invoices.growth,
              sparkColor: "#ec4899",
              sparkData: [60, 75, 70, 85, 80, 95, 90, 105, 120],
            },
            {
              id: "deliveries",
              name: "Deliveries",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <rect x="1" y="3" width="15" height="13" />
                  <path d="M16 8h4l3 5v3h-7V8z" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
              iconBg: "bg-cyan-100",
              iconColor: "text-cyan-500",
              value: metrics.deliveries.total.toLocaleString(),
              valueColor: "text-cyan-500",
              trend: metrics.deliveries.growth,
              sparkColor: "#06b6d4",
              sparkData: [70, 85, 80, 95, 90, 105, 100, 115, 130],
            },
            {
              id: "payments",
              name: "Payments",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              ),
              iconBg: "bg-amber-100",
              iconColor: "text-amber-500",
              value: `₹${(metrics.payments.total / 100000).toFixed(0)}L`,
              valueColor: "text-amber-500",
              trend: metrics.payments.growth,
              sparkColor: "#f59e0b",
              sparkData: [80, 95, 90, 105, 100, 115, 110, 125, 140],
            },
            {
              id: "tasks",
              name: "Tasks",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <polyline points="9 11 12 14 22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              ),
              iconBg: "bg-rose-100",
              iconColor: "text-rose-500",
              value: metrics.tasks.total.toLocaleString(),
              valueColor: "text-rose-500",
              trend: metrics.tasks.growth,
              sparkColor: "#f43f5e",
              sparkData: [25, 40, 35, 50, 45, 60, 55, 70, 85],
            },
          ] as const
        ).map((metric) => {
          const isUp = metric.trend >= 0;
          const sparkOptions: ApexOptions = {
            chart: {
              type: "area",
              sparkline: { enabled: true },
              animations: { enabled: false },
            },
            stroke: { curve: "smooth", width: 2 },
            fill: {
              type: "gradient",
              gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
              },
            },
            colors: [metric.sparkColor],
            tooltip: {
              enabled: true,
              fixed: { enabled: true, position: "topRight", offsetX: 0, offsetY: -60 },
              x: { show: false },
              y: { formatter: (val: number) => `${val}` },
              marker: { show: true },
            },
          };
          return (
            <div
              key={metric.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              {/* Top row: icon box + title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.iconBg} ${metric.iconColor}`}
                >
                  {metric.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {metric.name}
                </span>
              </div>
              {/* Inner card */}
              <div className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-2xl font-extrabold ${metric.valueColor}`}
                    >
                      {metric.value}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isUp ? "text-green-500" : "text-red-500"}`}
                    >
                      {isUp ? "+" : ""}
                      {metric.trend}% vs Last Year
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-lg ${isUp ? "text-green-500" : "text-red-500"}`}
                    >
                      {isUp ? "▲" : "▼"}
                    </span>
                    <Chart
                      type="area"
                      options={sparkOptions}
                      series={[{ data: [...metric.sparkData] }]}
                      width={80}
                      height={45}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* ── Sales Revenue Trend ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Gradient header bar */}
          <div className="bg-gradient-to-r from-indigo-500 to-violet-500 px-6 pt-5 pb-10 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-indigo-100 text-xs font-semibold uppercase tracking-widest mb-1">Annual Overview</p>
                <h2 className="text-white text-xl font-bold">Sales Revenue Trend</h2>
              </div>
              <div className="text-right">
                <p className="text-indigo-100 text-xs">Total YTD</p>
                <p className="text-white text-2xl font-extrabold">₹1,480k</p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                  ▲ 24% vs last year
                </span>
              </div>
            </div>
          </div>
          {/* Chart pulled up over the header */}
          <div className="-mt-6 px-4 pb-4">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 pt-2">
              <Chart
                type="area"
                options={revenueChartOptions}
                series={revenueChartSeries}
                height={260}
              />
            </div>
          </div>
        </div>

        {/* ── Payment Collection Status ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 pt-5 pb-10 relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-emerald-100 text-xs font-semibold uppercase tracking-widest mb-1">Payments</p>
                <h2 className="text-white text-xl font-bold">Collection Status</h2>
              </div>
              <div className="text-right">
                <p className="text-emerald-100 text-xs">Total Billed</p>
                <p className="text-white text-2xl font-extrabold">₹35.2L</p>
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                  ▲ 10% collected
                </span>
              </div>
            </div>
          </div>
          <div className="-mt-6 px-4 pb-4">
            <div className="bg-white rounded-xl shadow-md border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Donut */}
                <div className="flex-shrink-0">
                  <Chart
                    type="donut"
                    options={collectionStatusOptions}
                    series={collectionStatusSeries}
                    width={220}
                    height={220}
                  />
                </div>
                {/* Legend + stats */}
                <div className="flex-1 space-y-3">
                  {[
                    { label: "Collected", value: 2890000, color: "bg-emerald-500", text: "text-emerald-600", pct: "82%" },
                    { label: "Pending",   value: 450000,  color: "bg-amber-400",   text: "text-amber-600",   pct: "13%" },
                    { label: "Overdue",   value: 180000,  color: "bg-red-500",     text: "text-red-600",     pct: "5%"  },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                          <span className="text-sm font-medium text-gray-600">{item.label}</span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${item.text}`}>
                            ₹{(item.value / 100000).toFixed(1)}L
                          </span>
                          <span className="text-xs text-gray-400 ml-1">({item.pct})</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${item.color}`}
                          style={{ width: item.pct }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-gray-400">
                    <span>Last updated: today</span>
                    <span className="font-semibold text-slate-600">FY 2026–27</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* ── Pipeline Stages ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest">Sales Funnel</p>
              <h2 className="text-white text-base font-bold mt-0.5">Pipeline Stages</h2>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
              <p className="text-white text-lg font-extrabold">336</p>
              <p className="text-violet-200 text-xs">Total Deals</p>
            </div>
          </div>

          {/* Stage rows */}
          <div className="p-5 space-y-4">
            {pipelineStages.map((item, idx) => {
              const pct = Math.round((item.count / 145) * 100);
              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {/* Step badge */}
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-gray-700">{item.stage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{pct}%</span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: item.color }}
                      >
                        {item.count} Deals
                      </span>
                    </div>
                  </div>
                  {/* Segmented track */}
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mx-5 mb-5 rounded-xl bg-violet-50 border border-violet-100 px-4 py-2.5 flex items-center gap-2">
            <span className="text-violet-500 text-base">↑</span>
            <p className="text-sm text-violet-600 font-semibold">30% performance vs last week</p>
          </div>
        </div>

        {/* ── Top Performers ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest">Leaderboard</p>
              <h2 className="text-white text-base font-bold mt-0.5">Top Performers</h2>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
              <p className="text-white text-lg font-extrabold">5</p>
              <p className="text-blue-100 text-xs">Reps</p>
            </div>
          </div>

          {/* Performer rows */}
          <div className="p-5 space-y-3">
            {topPerformersData.labels.map((name, idx) => {
              const val = topPerformersData.series[0].data[idx];
              const max = 72;
              const medals = ["🥇", "🥈", "🥉"];
              const barColors = ["#3b82f6", "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"];
              return (
                <div key={name} className="flex items-center gap-3">
                  {/* Rank */}
                  <span className="text-lg w-6 text-center flex-shrink-0">
                    {idx < 3 ? medals[idx] : <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>}
                  </span>
                  {/* Avatar initial */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: barColors[idx] }}
                  >
                    {name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700 truncate">{name}</span>
                      <span className="text-sm font-bold text-gray-900 ml-2">₹{val}L</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${(val / max) * 100}%`, backgroundColor: barColors[idx] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer total */}
          <div className="mx-5 mb-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-blue-600 font-medium">Team Total</span>
            <span className="text-sm font-extrabold text-blue-700">₹292L</span>
          </div>
        </div>

        {/* ── Activity Count ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-xs font-semibold uppercase tracking-widest">This Month</p>
              <h2 className="text-white text-base font-bold mt-0.5">Activity Count</h2>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
              <p className="text-white text-lg font-extrabold">951</p>
              <p className="text-rose-100 text-xs">Total</p>
            </div>
          </div>

          {/* Activity cards */}
          <div className="p-5 space-y-3">
            {[
              {
                emoji: "📞",
                label: "Calls",
                count: 342,
                pct: 36,
                bg: "bg-green-50",
                border: "border-green-100",
                bar: "bg-green-400",
                text: "text-green-600",
                badge: "bg-green-100 text-green-700",
              },
              {
                emoji: "📧",
                label: "Emails",
                count: 567,
                pct: 60,
                bg: "bg-blue-50",
                border: "border-blue-100",
                bar: "bg-blue-400",
                text: "text-blue-600",
                badge: "bg-blue-100 text-blue-700",
              },
              {
                emoji: "👥",
                label: "Meetings",
                count: 42,
                pct: 4,
                bg: "bg-purple-50",
                border: "border-purple-100",
                bar: "bg-purple-400",
                text: "text-purple-600",
                badge: "bg-purple-100 text-purple-700",
              },
            ].map((act) => (
              <div
                key={act.label}
                className={`rounded-xl border ${act.border} ${act.bg} px-4 py-3`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{act.emoji}</span>
                    <span className="text-sm font-semibold text-gray-700">{act.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${act.badge}`}>
                      {act.pct}%
                    </span>
                    <span className={`text-base font-extrabold ${act.text}`}>{act.count}</span>
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${act.bar} transition-all duration-500`}
                    style={{ width: `${act.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mx-5 mb-5 rounded-xl bg-rose-50 border border-rose-100 px-4 py-2.5 flex items-center justify-between">
            <span className="text-sm text-rose-600 font-medium">Total Activities</span>
            <span className="text-sm font-extrabold text-rose-700">951</span>
          </div>
        </div>

      </div>

      {/* Summary Stats — Sales Dashboard Style */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sales Dashboard</h2>
            <p className="text-sm text-gray-400 mt-0.5">26 Jan 2026 – 26 Jan 2027</p>
          </div>
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {[
              "from-orange-400 to-yellow-400",
              "from-purple-500 to-pink-400",
              "from-yellow-400 to-orange-300",
              "from-red-500 to-rose-400",
              "from-slate-600 to-slate-400",
            ].map((g, i) => (
              <div key={i} className={`w-9 h-9 rounded-full bg-gradient-to-br ${g} border-2 border-white shadow`} />
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-end gap-2 mb-6">
          {(["Weekly", "Monthly", "Yearly"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold border transition ${
                activeTab === tab
                  ? "bg-red-500 text-white border-red-500 shadow"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {([
            {
              label: "Total MTD Revenue",
              badge: "MTD",
              badgeBg: "bg-amber-400",
              chevronBg: "bg-amber-500",
              value: activeTab === "Weekly" ? "$18,50,800.00" : activeTab === "Monthly" ? "$42,30,000.00" : "$1,85,08,000.00",
              trend: "+2.5%",
              trendUp: true,
              trendLabel: "Month Till Date",
              barHeights: [30, 45, 35, 55, 40, 60, 50],
              barColor: "bg-indigo-300",
            },
            {
              label: "Total YTD Revenue",
              badge: "YTD",
              badgeBg: "bg-red-500",
              chevronBg: "bg-red-600",
              value: activeTab === "Weekly" ? "$85,25,800.00" : activeTab === "Monthly" ? "$3,20,00,000.00" : "$12,50,00,000.00",
              trend: "-5.0%",
              trendUp: false,
              trendLabel: "Year Till Date",
              barHeights: [50, 35, 60, 40, 55, 30, 65],
              barColor: "bg-indigo-300",
            },
            {
              label: "Active Deals",
              badge: "MTD",
              badgeBg: "bg-blue-500",
              chevronBg: "bg-blue-600",
              value: activeTab === "Weekly" ? "336" : activeTab === "Monthly" ? "1,240" : "4,820",
              trend: "+18%",
              trendUp: true,
              trendLabel: "Pipeline Growth",
              barHeights: [40, 55, 45, 60, 35, 50, 65],
              barColor: "bg-blue-300",
            },
            {
              label: "Conversion Rate",
              badge: "YTD",
              badgeBg: "bg-purple-500",
              chevronBg: "bg-purple-600",
              value: activeTab === "Weekly" ? "32.8%" : activeTab === "Monthly" ? "35.2%" : "38.6%",
              trend: "+3.2%",
              trendUp: true,
              trendLabel: "vs Last Quarter",
              barHeights: [35, 50, 40, 60, 45, 55, 70],
              barColor: "bg-purple-300",
            },
          ]).map((card, i) => (
            <div key={i} className="flex rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
              {/* Left badge with chevron arrow */}
              <div className={`relative flex items-center justify-center w-20 ${card.badgeBg} text-white font-bold text-sm select-none flex-shrink-0`}>
                <span className="z-10 tracking-wide">{card.badge}</span>
                {/* Chevron arrow pointing right */}
                <div
                  className={`absolute right-0 top-0 h-full w-5 ${card.chevronBg}`}
                  style={{
                    clipPath: "polygon(0 0, 0% 100%, 100% 50%)",
                  }}
                />
              </div>

              {/* Content */}
              <div className="flex-1 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-tight">{card.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-sm font-bold ${card.trendUp ? "text-green-500" : "text-red-500"}`}>
                      {card.trend}
                    </span>
                    <span className="text-xs text-gray-400">{card.trendLabel}</span>
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1 h-14 ml-4">
                  {card.barHeights.map((h, idx) => (
                    <div
                      key={idx}
                      className={`w-2 rounded-sm ${card.barColor} opacity-80`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
