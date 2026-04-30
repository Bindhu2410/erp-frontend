import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface UserAnalyticsChartsProps {
  userDistributionData?: number[];
  permissionsData?: {
    name: string;
    data: number[];
  }[];
}

const UserAnalyticsCharts: React.FC<UserAnalyticsChartsProps> = ({
  userDistributionData = [60, 20, 10, 7, 3],
  permissionsData = [
    {
      name: 'View',
      data: [1, 1, 1, 1, 1]
    },
    {
      name: 'Edit',
      data: [1, 1, 1, 1, 1]
    },
    {
      name: 'Approve',
      data: [0, 1, 1, 1, 1]
    },
    {
      name: 'Admin',
      data: [0, 0, 0, 0, 1]
    }
  ]
}) => {
  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 300
    },
    labels: ['Field Sales Agent', 'Area Manager', 'Territory Manager', 'General Manager', 'Administrator'],
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#06b6d4', '#ef4444'],
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " users"
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val.toFixed(1) + "%"
      }
    }
  };

  const barChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '55%'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Field Sales Agent', 'Area Manager', 'Territory Manager', 'General Manager', 'Administrator'],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Roles'
      },
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " permissions"
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    },
    colors: ['#3b82f6', '#eab308', '#22c55e', '#ef4444'],
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* User Distribution by Role - Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-base font-medium text-gray-700">User Distribution by Role</h3>
        </div>
        <div className="p-6">
          <Chart
            options={pieChartOptions}
            series={userDistributionData}
            type="pie"
            height={300}
          />
        </div>
      </div>

      {/* Permissions Overview - Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gray-50 px-4 py-3 border-b">
          <h3 className="text-base font-medium text-gray-700">Permissions Overview</h3>
        </div>
        <div className="p-6">
          <Chart
            options={barChartOptions}
            series={permissionsData}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsCharts;
