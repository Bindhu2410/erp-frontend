import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

interface RolePermissionsChartsProps {
  roles?: Role[];
  userDistributionData?: number[];
  permissionsData?: {
    name: string;
    data: number[];
  }[];
}

const RolePermissionsCharts: React.FC<RolePermissionsChartsProps> = ({
  roles = [],
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
  const roleNames = roles.length > 0 
    ? roles.map(role => role.name) 
    : ['Field Sales Agent', 'Area Manager', 'Territory Manager', 'General Manager', 'Administrator'];

  const pieChartOptions: ApexOptions = {
    chart: {
      type: 'pie',
      height: 300
    },
    labels: roleNames,
    colors: ['#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#EF4444'],
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
          return val + " people"
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
      stacked: true,
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
    xaxis: {
      categories: roleNames,
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
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
    colors: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* User Distribution by Role - Pie Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution by Role</h3>
        <Chart
          options={pieChartOptions}
          series={userDistributionData}
          type="pie"
          height={300}
        />
      </div>

      {/* Permissions Overview - Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Permissions Overview</h3>
        <Chart
          options={barChartOptions}
          series={permissionsData}
          type="bar"
          height={300}
        />
      </div>
    </div>
  );
};

export default RolePermissionsCharts;
