import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import api from "../../services/api";
import { useUser } from "../../context/UserContext";

const SalesManagerDashboard: React.FC = () => {
  // ✅ Team Performance (Targets vs Achieved)
  const teamPerformance: { options: ApexOptions; series: any[] } = {
    options: {
      chart: { type: "bar" as const, stacked: false },
      plotOptions: { bar: { horizontal: false, columnWidth: "40%" } },
      xaxis: { categories: ["Rep A", "Rep B", "Rep C", "Rep D"] },
      colors: ["#3b82f6", "#10b981"],
      dataLabels: { enabled: false },
    },
    series: [
      { name: "Target", data: [100, 100, 100, 100] },
      { name: "Achieved", data: [80, 40, 90, 60] },
    ],
  };

  // ✅ Pipeline by Stage (bind to API)
  const [pipelineStage, setPipelineStage] = useState<{
    options: ApexOptions;
    series: any[];
  }>({
    options: {
      chart: { type: "bar" as const },
      plotOptions: { bar: { horizontal: true } },
      xaxis: { categories: [] },
      colors: ["#f59e0b"],
    },
    series: [{ name: "Deals", data: [] }],
  });
  const { user, role } = useUser();

  useEffect(() => {
    api
      .get(
        `Dashboard/salesmanager-dashboard-pipeline?managerId=${user?.userId}`
      )
      .then((res) => {
        const stages = res.data;
        const categories = stages.map((s: any) => s.stage);
        const data = stages.map((s: any) => s.count);
        setPipelineStage((prev) => ({
          ...prev,
          options: {
            ...prev.options,
            xaxis: { ...prev.options.xaxis, categories },
          },
          series: [{ name: "Deals", data }],
        }));
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Revenue Forecast (Line)
  const revenueForecast: { options: ApexOptions; series: any[] } = {
    options: {
      chart: { type: "line" as const },
      stroke: { curve: "smooth" },
      xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
      colors: ["#3b82f6"],
    },
    series: [{ name: "Forecast (₹L)", data: [5, 8, 12, 15, 20, 25] }],
  };

  // ✅ Customer Conversion Rate (bind to API)
  const [conversionRate, setConversionRate] = useState<{
    options: ApexOptions;
    series: any[];
  }>({
    options: {
      chart: { type: "donut" as const },
      labels: ["Leads", "Opportunities", "Closed Won"],
      colors: ["#3b82f6", "#f59e0b", "#10b981"],
    },
    series: [0, 0, 0],
  });

  useEffect(() => {
    api
      .get(
        `Dashboard/salesmanager-dashboard-conversion-counts?managerId=${user?.userId}`
      )
      .then((res) => {
        const { leads, opportunities, closedWon } = res.data;
        setConversionRate((prev) => ({
          ...prev,
          series: [leads, opportunities, closedWon],
        }));
      })
      .catch((err) => console.error(err));
  }, []);

  // ✅ Team Activities Heatmap
  const activityHeatmap: { options: ApexOptions; series: any[] } = {
    options: {
      chart: { type: "heatmap" as const },
      plotOptions: { heatmap: { shadeIntensity: 0.5, radius: 4 } },
      xaxis: { categories: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    },
    series: [
      { name: "Calls", data: [5, 8, 6, 10, 7] },
      { name: "Visits", data: [2, 4, 3, 5, 4] },
      { name: "Follow-ups", data: [3, 2, 4, 6, 5] },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-0 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-8 md:mt-0">
          Sales Manager Dashboard
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Welcome! Here you can monitor your team's performance, pipeline,
          revenue, and activities in real time. Use the insights below to drive
          your sales strategy and support your team.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
              Team Performance Overview
            </h3>
            <Chart
              options={teamPerformance.options}
              series={teamPerformance.series}
              type="bar"
              height={300}
            />
          </div>

          {/* Pipeline by Stage */}
          <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>
              Pipeline by Stage
            </h3>
            <Chart
              options={pipelineStage.options}
              series={pipelineStage.series}
              type="bar"
              height={300}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Revenue Forecast */}
          <div className="bg-white rounded-xl shadow-md p-6 col-span-2 transition hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              Revenue Forecast
            </h3>
            <Chart
              options={revenueForecast.options}
              series={revenueForecast.series}
              type="line"
              height={300}
            />
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
              Customer Conversion Rate
            </h3>
            <Chart
              options={conversionRate.options}
              series={conversionRate.series}
              type="donut"
              height={300}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Team Activities Heatmap */}
          <div className="bg-white rounded-xl shadow-md p-6 transition hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] border border-gray-100">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500"></span>
              Team Activities Heatmap
            </h3>
            <Chart
              options={activityHeatmap.options}
              series={activityHeatmap.series}
              type="heatmap"
              height={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManagerDashboard;
