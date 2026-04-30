import React, { useEffect, useState } from "react";

import axios from "axios";
import TripMap from "../../components/TripMap";
import { useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";

const SalesRepDashboard: React.FC = () => {
  // Top Selling Products State
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const { user, role } = useUser();
  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoadingProducts(true);
      setProductError(null);
      try {
        const response = await api.post("Dashboard/top-selling-products", {
          userId: user?.userId,
        });
        setTopProducts(response.data);
      } catch (err: any) {
        setProductError("Failed to load top selling products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchTopProducts();
  }, []);
  const targetOptions: ApexOptions = {
    chart: { type: "radialBar" as const },
    plotOptions: {
      radialBar: {
        hollow: { size: "60%" },
        dataLabels: {
          value: { formatter: (val: number) => `${val}%` },
        },
      },
    },
    labels: ["Target Achieved"],
  };
  const targetSeries = [65]; // Example: 65% achieved

  // Opportunities Pipeline State
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [loadingPipeline, setLoadingPipeline] = useState(false);
  const [pipelineError, setPipelineError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPipeline = async () => {
      setLoadingPipeline(true);
      setPipelineError(null);
      try {
        const response = await api.get(
          `Dashboard/salesrep-dashboard-pipeline?userId=${user?.userId}`
        );
        setPipelineData(response.data);
      } catch (err: any) {
        setPipelineError("Failed to load pipeline data.");
      } finally {
        setLoadingPipeline(false);
      }
    };
    fetchPipeline();
  }, []);

  // Chart options and series from API
  const pipelineOptions: ApexOptions = {
    chart: { type: "bar" as const, stacked: true, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: true } },
    xaxis: {
      categories: pipelineData?.stages?.map((s: any) => s.stage) || [
        "Demo Scheduled",
        "Quote Sent",
        "Negotiation",
      ],
    },
    legend: { position: "top" as const },
    fill: { opacity: 1 },
  };
  const pipelineSeries = [
    {
      name: "Opportunities",
      data: pipelineData?.stages?.map((s: any) => s.count) || [0, 0, 0],
    },
  ];

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white to-blue-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-8 md:mt-0">
          Sales Representative Dashboard
        </h1>
        <p className="text-gray-600 mb-8 text-sm md:text-base">
          Welcome! Here you can track your sales pipeline, appointments, leads,
          and top products in real time. Use the insights below to maximize your
          performance and stay on top of your goals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10">
          {/* Row 2: Centered Opportunities in Pipeline (spans both columns) */}
          <div className="col-span-1 md:col-span-2 xl:col-span-2">
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-lg p-10 border border-indigo-100 h-full flex flex-col min-h-[420px] w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h1m2 0h12m2 0h1M7 10v10m10-10v10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                  Opportunities in Pipeline
                </h3>
              </div>

              {/* Chart Row */}
              <div className="flex-1 flex items-center justify-center w-full bg-white rounded-xl shadow border border-indigo-50 p-6">
                {loadingPipeline ? (
                  <div className="text-center py-6 text-indigo-500">
                    Loading...
                  </div>
                ) : pipelineError ? (
                  <div className="text-center py-6 text-red-500">
                    {pipelineError}
                  </div>
                ) : (
                  <Chart
                    options={pipelineOptions}
                    series={pipelineSeries}
                    type="bar"
                    height={320}
                    width={undefined}
                    className="w-full"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Row 1: Two cards */}
          {/* Trip Tracking Card */}
          <div className="col-span-1">
            <TripMap />
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-8 border border-blue-100 min-h-[230px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                Today's Schedule & Appointments
              </h3>
            </div>
            <ul className="space-y-4 text-base font-normal">
              {/* Meeting 1 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Dr. Sharma"
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Dr. Sharma{" "}
                      <span className="text-gray-400 text-sm">
                        (Apollo Hospital)
                      </span>
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Meeting
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    10:00 AM – Conference Room 2
                  </div>
                </div>
              </li>
              {/* Meeting 2 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/women/44.jpg"
                    alt="Fortis Hospital"
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Demo at Fortis Hospital
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Demo
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    02:30 PM – Lab 1
                  </div>
                </div>
              </li>
              {/* Meeting 3 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/men/65.jpg"
                    alt="Dr. Verma"
                    className="w-10 h-10 rounded-full border-2 border-blue-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Call with Dr. Verma
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      Follow-up
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    04:00 PM – Phone Call
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl shadow-lg p-8 border border-green-100 min-h-[230px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                Leads Assigned & Follow-ups Due
              </h3>
            </div>
            <ul className="space-y-4 text-base font-normal">
              {/* Lead 1 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-green-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/men/45.jpg"
                    alt="Johnson Pharma"
                    className="w-10 h-10 rounded-full border-2 border-green-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Johnson Pharma
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                      Follow-up pending
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Assigned by: Priya Singh
                  </div>
                </div>
              </li>
              {/* Lead 2 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-green-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/women/51.jpg"
                    alt="MedEquip Co."
                    className="w-10 h-10 rounded-full border-2 border-green-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      MedEquip Co.
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      Proposal review
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Assigned by: Rahul Mehta
                  </div>
                </div>
              </li>
              {/* Lead 3 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-green-50 shadow-sm hover:shadow-md transition">
                <div className="flex-shrink-0">
                  <img
                    src="https://randomuser.me/api/portraits/men/77.jpg"
                    alt="City Clinic"
                    className="w-10 h-10 rounded-full border-2 border-green-200"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      City Clinic
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Call scheduled
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Assigned by: Anjali Rao
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Row 3: Two cards */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 border border-purple-100 flex flex-col justify-center min-h-[200px] w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-200 p-2 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.707 7.293a1 1 0 00-1.414 0L9 13.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l7-7a1 1 0 000-1.414z" />
                </svg>
              </div>
              <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                Top Selling Products
              </h3>
            </div>
            <div className="border-b border-purple-100 mb-3"></div>
            {loadingProducts ? (
              <div className="text-center py-6 text-purple-500">Loading...</div>
            ) : productError ? (
              <div className="text-center py-6 text-red-500">
                {productError}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No top selling products found.
              </div>
            ) : (
              <ul className="space-y-4 w-full max-w-md mx-auto text-base font-normal">
                {topProducts.map((product) => (
                  <li
                    key={product.itemId}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white border border-purple-50 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={
                        product.imageUrl ||
                        "https://via.placeholder.com/64x64?text=No+Image"
                      }
                      alt={product.itemName}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-purple-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800 truncate">
                          {product.itemName}
                        </span>
                        <span className="text-xs bg-purple-100 whitespace-nowrap text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          {product.unitsSold} units
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Last sold:{" "}
                        {product.lastSoldDate
                          ? new Date(product.lastSoldDate).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col justify-center min-h-[200px] w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gray-200 p-2 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                Quick Actions
              </h3>
            </div>
            <div className="border-b border-gray-200 mb-3"></div>
            <ul className="space-y-4 w-full max-w-md mx-auto text-base font-normal">
              {/* Action 1 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Create Opportunity
                    </span>
                    <button
                      className="ml-4 bg-blue-600 text-white font-normal px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-sm tracking-wide drop-shadow-md"
                      onClick={() => navigate("/sales/opportunities")}
                    >
                      Go
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Add a new sales opportunity to your pipeline.
                  </div>
                </div>
              </li>
              {/* Action 2 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Create Quotation
                    </span>
                    <button
                      className="ml-4 bg-green-600 text-white font-normal px-4 py-2 rounded-lg shadow hover:bg-green-700 transition text-sm tracking-wide drop-shadow-md"
                      onClick={() => navigate("/sales/quotations")}
                    >
                      Go
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Generate a new quote for a customer.
                  </div>
                </div>
              </li>
              {/* Action 3 */}
              <li className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 truncate">
                      Add Lead
                    </span>
                    <button
                      className="ml-4 bg-indigo-600 text-white font-normal px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition text-sm tracking-wide drop-shadow-md"
                      onClick={() => navigate("/sales/leads")}
                    >
                      Go
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Register a new lead in the system.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesRepDashboard;
