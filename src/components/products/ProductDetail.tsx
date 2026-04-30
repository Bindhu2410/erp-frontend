import React, { useState, useEffect } from "react";
import {
  LuPackage as Package,
  LuBarChart3 as BarChart3,
  LuTrendingUp as TrendingUp,
  LuAlertTriangle as AlertTriangle,
  LuCheckCircle as CheckCircle,
  LuClock as Clock,
  LuEye as Eye,
  LuCopy as Copy,
  LuShare2 as Share2,
  LuDownload as Download,
  LuPrinter as Printer,
  LuBox as Box,
  LuDollarSign as DollarSign,
  LuTarget as Target,
} from "react-icons/lu";
import { MdEdit as Edit } from "react-icons/md";

interface ProductImage {
  id: number;
  url: string;
  alt: string;
  type: "primary" | "gallery" | "technical";
}

interface StockLocation {
  warehouse: string;
  location: string;
  quantity: number;
  reserved: number;
  available: number;
  lastUpdated: string;
}

interface SalesData {
  period: string;
  unitsSold: number;
  revenue: number;
  profit: number;
}

const ERPProductDetail: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedVariant, setSelectedVariant] = useState("Standard");

  const product = {
    sku: "APM-2024-001",
    name: "AirPods Pro Max Elite",
    category: "Audio Equipment > Headphones > Premium",
    brand: "AudioTech Pro",
    model: "APM-Elite-2024",
    status: "Active",
    createdDate: "2024-01-15",
    lastModified: "2024-05-20",
    createdBy: "John Smith",
    modifiedBy: "Sarah Wilson",

    // Business Information
    costPrice: 245.5,
    wholesalePrice: 399.99,
    retailPrice: 549.99,
    msrp: 699.99,
    margin: 55.3,

    // Inventory
    totalStock: 1,
    availableStock: 856,
    reservedStock: 67,
    reorderLevel: 100,
    reorderQuantity: 500,

    // Sales Performance
    totalSold: 12847,
    monthlyAverage: 450,
    lastSaleDate: "2024-05-27",
    topSellingVariant: "Midnight Black",

    // Product Details
    description:
      "Premium over-ear wireless headphones featuring advanced noise cancellation technology, spatial audio, and luxury materials. Designed for professional audio applications and premium consumer market.",
    specifications: {
      weight: "384.8g",
      dimensions: "187.3 × 168.6 × 83.4 mm",
      batteryLife: "20 hours (ANC on)",
      connectivity: "Bluetooth 5.0, USB-C",
      warranty: "2 years",
      certification: "CE, FCC, IC",
    },

    variants: [
      { name: "Standard", sku: "APM-STD", stock: 345, price: 549.99 },
      { name: "Limited Edition", sku: "APM-LE", stock: 89, price: 649.99 },
      { name: "Professional", sku: "APM-PRO", stock: 178, price: 749.99 },
    ],

    suppliers: [
      {
        name: "AudioTech Manufacturing",
        leadTime: "14 days",
        moq: 100,
        lastOrder: "2024-05-10",
      },
      {
        name: "Premium Audio Ltd",
        leadTime: "21 days",
        moq: 50,
        lastOrder: "2024-04-15",
      },
    ],
  };

  const images: ProductImage[] = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
      alt: "Product main view",
      type: "primary",
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop&q=80",
      alt: "Side profile",
      type: "gallery",
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop&q=80",
      alt: "Detail view",
      type: "gallery",
    },
    {
      id: 4,
      url: "https://images.unsplash.com/photo-1524678714210-9917a6c619c2?w=800&h=800&fit=crop&q=80",
      alt: "Lifestyle",
      type: "gallery",
    },
    {
      id: 5,
      url: "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop&q=80",
      alt: "Technical diagram",
      type: "technical",
    },
  ];

  const stockLocations: StockLocation[] = [
    {
      warehouse: "Main Warehouse - NYC",
      location: "A-12-B",
      quantity: 450,
      reserved: 23,
      available: 427,
      lastUpdated: "2024-05-28 09:15",
    },
    {
      warehouse: "West Coast Hub - LA",
      location: "C-08-A",
      quantity: 312,
      reserved: 18,
      available: 294,
      lastUpdated: "2024-05-28 08:30",
    },
    {
      warehouse: "European Center - DE",
      location: "E-05-C",
      quantity: 189,
      reserved: 12,
      available: 177,
      lastUpdated: "2024-05-28 14:45",
    },
    {
      warehouse: "Asian Hub - SG",
      location: "B-15-D",
      quantity: 278,
      reserved: 14,
      available: 264,
      lastUpdated: "2024-05-28 16:20",
    },
  ];

  const salesData: SalesData[] = [
    { period: "Jan 2024", unitsSold: 432, revenue: 237584, profit: 89250 },
    { period: "Feb 2024", unitsSold: 398, revenue: 218902, profit: 82140 },
    { period: "Mar 2024", unitsSold: 567, revenue: 311883, profit: 117120 },
    { period: "Apr 2024", unitsSold: 445, revenue: 244755, profit: 91890 },
    { period: "May 2024", unitsSold: 523, revenue: 287652, profit: 108015 },
  ];

  const getStockStatus = (available: number, reorderLevel: number) => {
    if (available <= reorderLevel)
      return {
        status: "Low Stock",
        color: "text-red-600 bg-red-50",
        icon: AlertTriangle,
      };
    if (available <= reorderLevel * 1.5)
      return {
        status: "Moderate",
        color: "text-yellow-600 bg-yellow-50",
        icon: Clock,
      };
    return {
      status: "In Stock",
      color: "text-green-600 bg-green-50",
      icon: CheckCircle,
    };
  };

  const stockStatus = getStockStatus(
    product.availableStock,
    product.reorderLevel
  );
  const StatusIcon = stockStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Product Details
              </h1>
              <p className="text-gray-600">SKU: {product.sku}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stockStatus.color}`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Stock Status</p>
                <p className="font-semibold">{stockStatus.status}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Sales</p>
                <p className="font-semibold">{product.monthlyAverage} units</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Margin</p>
                <p className="font-semibold">{product.margin}%</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sold</p>
                <p className="font-semibold">
                  {product.totalSold.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4" />
                  <span>Print Product Label</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                  <span>Share with Team</span>
                </button>
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {product.name}
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {product.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Product Info
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{product.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-sm">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Pricing
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cost Price:</span>
                      <span className="font-medium">${product.costPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Wholesale:</span>
                      <span className="font-medium">
                        ${product.wholesalePrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Retail Price:</span>
                      <span className="font-medium">
                        ${product.retailPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">MSRP:</span>
                      <span className="font-medium">${product.msrp}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Inventory Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Inventory & Stock Locations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Box className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Total Stock
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {product.totalStock.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Available
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {product.availableStock}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Reserved
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">
                    {product.reservedStock}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Reorder Level
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-red-900">
                    {product.reorderLevel}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Warehouse
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Location
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Total
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Reserved
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Available
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLocations.map((location, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">
                          {location.warehouse}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {location.location}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {location.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-yellow-600">
                          {location.reserved}
                        </td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {location.available}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {location.lastUpdated}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sales Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Sales Performance
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">
                        Period
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Units Sold
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Revenue
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Profit
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((data, index) => {
                      const margin = (
                        (data.profit / data.revenue) *
                        100
                      ).toFixed(1);
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">
                            {data.period}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {data.unitsSold}
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            ${data.revenue.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-green-600 font-medium">
                            ${data.profit.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">{margin}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Technical Specifications
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center py-2 border-b border-gray-100"
                  >
                    <span className="text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}:
                    </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Supplier Information
              </h3>
              <div className="space-y-4">
                {product.suppliers.map((supplier, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {supplier.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Lead Time: {supplier.leadTime} • MOQ: {supplier.moq}{" "}
                        units
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Last Order</p>
                      <p className="font-medium">{supplier.lastOrder}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Audit Trail
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {product.createdDate} by {product.createdBy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Modified:</span>
                  <span className="font-medium">
                    {product.lastModified} by {product.modifiedBy}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last Sale:</span>
                  <span className="font-medium">{product.lastSaleDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPProductDetail;
