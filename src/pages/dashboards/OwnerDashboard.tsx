import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const OwnerDashboard: React.FC = () => {
  // State for dashboard data
  const [revenueData] = useState({
    currentQuarter: 50000000, // ₹5Cr
    previousQuarter: 41600000, // ₹4.16Cr
    growthRate: 20.2,
    monthlyTrend: [42000000, 45000000, 50000000],
    labels: ['Jan-Mar', 'Apr-Jun', 'Jul-Sep'],
  });

  const [topClients] = useState([
    { name: 'Apollo Hospitals', revenue: 12000000, region: 'South' },
    { name: 'Fortis Healthcare', revenue: 9500000, region: 'North' },
    { name: 'Max Super Specialty', revenue: 8500000, region: 'North' },
    { name: 'Manipal Hospitals', revenue: 7800000, region: 'South' },
    { name: 'Medanta Hospital', revenue: 6200000, region: 'West' },
  ]);

  const [productPerformance] = useState([
    { category: 'Imaging Devices', revenue: 22500000, share: 45 },
    { category: 'Surgical Tools', revenue: 15000000, share: 30 },
    { category: 'Diagnostic Equipment', revenue: 7500000, share: 15 },
    { category: 'Consumables', revenue: 5000000, share: 10 },
  ]);

  const [salesForecast] = useState({
    actual: [42000000, 45000000, 50000000],
    forecast: [40000000, 44000000, 48000000],
    labels: ['Q1', 'Q2', 'Q3'],
  });

  const [customerRetention] = useState({
    retentionRate: 78,
    repeatOrders: 145,
    newCustomers: 42,
  });

  const [paymentsStatus] = useState({
    outstanding: 12000000,
    overdue: 4500000,
    collected: 38000000,
  });

  const [marketInsights] = useState([
    { region: 'South', revenue: 22500000, growth: 22 },
    { region: 'North', revenue: 18000000, growth: 18 },
    { region: 'West', revenue: 6500000, growth: 12 },
    { region: 'East', revenue: 3000000, growth: 8 },
  ]);

  const [kpis] = useState({
    pipelineValue: 75000000,
    avgSalesCycle: 45,
    cac: 150000,
    marketingROI: 320,
  });

  // Format currency in Indian format
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  };

  // Chart configurations
  const revenueTrendChart = {
    options: {
      chart: {
        id: 'revenue-trend',
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: revenueData.labels,
      },
      colors: ['#4CAF50'],
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'Quarterly Revenue Trend',
        align: 'left' as 'left', // FIXED
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`,
        },
      },
    } as ApexOptions,
    series: [
      {
        name: 'Revenue',
        data: revenueData.monthlyTrend,
      },
    ],
  };

  const productPerformanceChart = {
    options: {
      chart: {
        id: 'product-performance',
        type: 'pie',
      },
      labels: productPerformance.map((item) => item.category),
      colors: ['#4361ee', '#3a0ca3', '#7209b7', '#f72585'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      title: {
        text: 'Product Line Performance',
        align: 'left' as 'left',
      },
    } as ApexOptions,
    series: productPerformance.map((item) => item.share),
  };

  const salesForecastChart = {
    options: {
      chart: {
        id: 'sales-forecast',
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: salesForecast.labels,
      },
      colors: ['#4CAF50', '#2196F3'],
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'Sales Forecast vs Actuals',
        align: 'left' as 'left',
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`,
        },
      },
    } as ApexOptions,
    series: [
      {
        name: 'Actual Sales',
        data: salesForecast.actual,
      },
      {
        name: 'Forecast',
        data: salesForecast.forecast,
      },
    ],
  };

  const regionalPerformanceChart = {
    options: {
      chart: {
        id: 'regional-performance',
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: marketInsights.map((item) => item.region),
      },
      colors: ['#FF9800'],
      dataLabels: {
        enabled: false,
      },
      title: {
        text: 'Regional Performance',
        align: 'left' as 'left',
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `₹${(value / 10000000).toFixed(1)}Cr`,
        },
      },
    } as ApexOptions,
    series: [
      {
        name: 'Revenue',
        data: marketInsights.map((item) => item.revenue),
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2 mt-8 md:mt-0">Owner Dashboard</h1>
      <p className="text-gray-600 mb-8 text-sm md:text-base">Welcome! Here you can monitor your company's performance, pipeline, revenue, and activities in real time. Use the insights below to drive your business strategy and support your teams.</p>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Performance Dashboard</h2>

      {/* Revenue & Growth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 col-span-2">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-gray-800">Total Revenue & Growth Trend</h3>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              +{revenueData.growthRate}% YoY
            </div>
          </div>
          <div className="mb-4">
            <p className="text-3xl font-bold text-gray-800">{formatCurrency(revenueData.currentQuarter)}</p>
            <p className="text-gray-600">Current Quarter</p>
          </div>
          <Chart options={revenueTrendChart.options} series={revenueTrendChart.series} type="line" height="300" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Top Hospitals / Clients by Revenue</h3>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-800">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.region} India</p>
                </div>
                <p className="font-semibold text-gray-800">{formatCurrency(client.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance & Sales Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Product Line Performance</h3>
          <div className="flex items-center justify-center">
            <Chart
              options={productPerformanceChart.options}
              series={productPerformanceChart.series}
              type="pie"
              width="380"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {productPerformance.map((product, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{product.category}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(product.revenue)}</p>
                <p className="text-sm text-gray-600">{product.share}% of total</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Sales Forecast vs Actuals</h3>
          <Chart options={salesForecastChart.options} series={salesForecastChart.series} type="bar" height="350" />
        </div>
      </div>

      {/* Customer Retention & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Customer Retention & Repeat Orders</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200 stroke-current"
                  strokeWidth="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                />
                <circle
                  className="text-green-500 stroke-current"
                  strokeWidth="10"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (customerRetention.retentionRate / 100) * 251.2}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-2xl font-bold text-gray-800">{customerRetention.retentionRate}%</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Repeat Orders</p>
              <p className="text-xl font-bold text-gray-800">{customerRetention.repeatOrders}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">New Customers</p>
              <p className="text-xl font-bold text-gray-800">{customerRetention.newCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Outstanding Payments & Collection Status</h3>
          <div className="mb-6">
            <p className="text-3xl font-bold text-red-600">{formatCurrency(paymentsStatus.outstanding)}</p>
            <p className="text-gray-600">Total Outstanding</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Overdue</span>
                <span className="text-sm font-medium text-gray-600">{formatCurrency(paymentsStatus.overdue)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-red-500 h-2.5 rounded-full"
                  style={{
                    width: `${(paymentsStatus.overdue / paymentsStatus.outstanding) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Collected</span>
                <span className="text-sm font-medium text-gray-600">{formatCurrency(paymentsStatus.collected)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full"
                  style={{
                    width: `${
                      (paymentsStatus.collected / (paymentsStatus.collected + paymentsStatus.outstanding)) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights & KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Market Insights</h3>
          <Chart
            options={regionalPerformanceChart.options}
            series={regionalPerformanceChart.series}
            type="bar"
            height="300"
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            {marketInsights.map((region, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{region.region} India</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(region.revenue)}</p>
                <p className="text-sm text-green-600">+{region.growth}% growth</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">High-Level KPIs</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(kpis.pipelineValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Avg. Sales Cycle</p>
                <p className="text-xl font-bold text-gray-800">{kpis.avgSalesCycle} days</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Customer Acquisition Cost</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(kpis.cac)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Marketing ROI</p>
                <p className="text-xl font-bold text-gray-800">{kpis.marketingROI}%</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Regional Performance Highlights</p>
              <p className="text-lg font-bold text-gray-800 mt-1">South India leads with {formatCurrency(22500000)} revenue</p>
              <p className="text-sm text-gray-600 mt-1">Imaging devices account for 45% of total sales</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
