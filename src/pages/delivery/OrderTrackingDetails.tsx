import React, { useState } from "react";
import {
  LuArrowLeft as ArrowLeft,
  LuPackage as Package,
  LuTruck as Truck,
  LuCheckCircle as CheckCircle,
  LuClock as Clock,
  LuMapPin as MapPin,
  LuPhone as Phone,
  LuStar as Star,
  LuCamera as Camera,
  LuMessageCircle as MessageCircle,
  LuRefreshCcw as RefreshCw,
  LuCalendar as Calendar,
  LuCopy as Copy,
  LuShare as Share,
} from "react-icons/lu";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  sku: string;
}

interface TrackingStep {
  id: number;
  title: string;
  description: string;
  timestamp: string;
  status: "completed" | "current" | "pending";
  location?: string;
  details?: string;
}

interface OrderTrackingProps {}

const OrderTrackingDetails: React.FC<OrderTrackingProps> = () => {
  const [activeTab, setActiveTab] = useState<"tracking" | "items" | "receipt">(
    "tracking"
  );

  const orderInfo = {
    orderId: "ORD-2024-12345",
    customerName: "John Smith",
    customerPhone: "+1 (555) 123-4567",
    customerEmail: "john.smith@email.com",
    orderDate: "2024-05-20",
    expectedDelivery: "2024-05-22",
    deliveryAddress: "123 Main Street, Apt 4B, New York, NY 10001",
    totalAmount: 247.99,
    paymentMethod: "Credit Card ****1234",
    driverName: "Mike Johnson",
    driverPhone: "+1 (555) 987-6543",
    driverRating: 4.8,
    vehicleInfo: "Honda Civic - ABC123",
  };

  const orderItems: OrderItem[] = [
    {
      id: "1",
      name: "Wireless Bluetooth Headphones",
      quantity: 1,
      price: 129.99,
      image: "/api/placeholder/80/80",
      sku: "WBH-001",
    },
    {
      id: "2",
      name: "Smartphone Case",
      quantity: 2,
      price: 24.99,
      image: "/api/placeholder/80/80",
      sku: "SPC-002",
    },
    {
      id: "3",
      name: "USB-C Charging Cable",
      quantity: 1,
      price: 19.99,
      image: "/api/placeholder/80/80",
      sku: "UCC-003",
    },
  ];

  const trackingSteps: TrackingStep[] = [
    {
      id: 1,
      title: "Order Placed",
      description: "Your order has been successfully placed",
      timestamp: "2024-05-20 10:30 AM",
      status: "completed",
      location: "Online",
      details: "Order confirmed and payment processed",
    },
    {
      id: 2,
      title: "Order Confirmed",
      description: "Order details verified and confirmed",
      timestamp: "2024-05-20 10:45 AM",
      status: "completed",
      location: "Processing Center",
      details: "Inventory checked and order validated",
    },
    {
      id: 3,
      title: "Preparing for Shipment",
      description: "Items are being picked and packed",
      timestamp: "2024-05-20 02:15 PM",
      status: "completed",
      location: "Warehouse - Section A",
      details: "All items collected and quality checked",
    },
    {
      id: 4,
      title: "Packed",
      description: "Your order has been securely packed",
      timestamp: "2024-05-20 04:30 PM",
      status: "completed",
      location: "Packing Station 12",
      details: "Items packed with protective materials",
    },
    {
      id: 5,
      title: "Dispatched",
      description: "Package handed over to delivery partner",
      timestamp: "2024-05-21 08:00 AM",
      status: "completed",
      location: "Distribution Hub",
      details: "Package loaded onto delivery vehicle",
    },
    {
      id: 6,
      title: "Out for Delivery",
      description: "Your package is on the way",
      timestamp: "2024-05-22 09:30 AM",
      status: "current",
      location: "Local Delivery Hub",
      details: "Driver Mike Johnson is delivering your package",
    },
    {
      id: 7,
      title: "Delivered",
      description: "Package successfully delivered",
      timestamp: "Expected by 2:00 PM",
      status: "pending",
      location: orderInfo.deliveryAddress,
      details: "Package will be delivered to your doorstep",
    },
  ];

  const getStepIcon = (step: TrackingStep) => {
    if (step.status === "completed") {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    } else if (step.status === "current") {
      return <Truck className="w-6 h-6 text-blue-500" />;
    } else {
      return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getCurrentStep = () => {
    return (
      trackingSteps.find((step) => step.status === "current") ||
      trackingSteps[trackingSteps.length - 1]
    );
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderInfo.orderId);
    // You could add a toast notification here
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className=" mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Order Tracking
                </h1>
                <div className="flex items-center mt-1">
                  <span className="text-gray-600">
                    Order ID: {orderInfo.orderId}
                  </span>
                  <button
                    onClick={copyOrderId}
                    className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-4 py-6">
        {/* Current Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {getStepIcon(getCurrentStep())}
              <div className="ml-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {getCurrentStep().title}
                </h2>
                <p className="text-gray-600">{getCurrentStep().description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Expected Delivery</p>
              <p className="font-semibold text-blue-600">
                {orderInfo.expectedDelivery}
              </p>
            </div>
          </div>

          {getCurrentStep().status === "current" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src="/api/placeholder/50/50"
                    alt="Driver"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">
                      {orderInfo.driverName}
                    </p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {orderInfo.driverRating}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {orderInfo.vehicleInfo}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full transition-colors">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: "tracking", label: "Tracking Details", icon: Package },
                { key: "items", label: "Order Items", icon: Package },
                { key: "receipt", label: "Order Receipt", icon: Calendar },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                    activeTab === key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tracking Details Tab */}
          {activeTab === "tracking" && (
            <div className="p-6">
              <div className="relative">
                {trackingSteps.map((step, index) => (
                  <div key={step.id} className="flex relative pb-8">
                    {/* Timeline Line */}
                    {index < trackingSteps.length - 1 && (
                      <div
                        className={`absolute left-3 top-8 w-0.5 h-16 ${
                          step.status === "completed"
                            ? "bg-green-300"
                            : "bg-gray-300"
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div className="flex-shrink-0 relative z-10">
                      {getStepIcon(step)}
                    </div>

                    {/* Step Content */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-semibold ${
                            step.status === "completed"
                              ? "text-gray-900"
                              : step.status === "current"
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {step.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      {step.location && (
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1" />
                          {step.location}
                        </div>
                      )}
                      {step.details && (
                        <p className="text-sm text-gray-500 mt-1">
                          {step.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Items Tab */}
          {activeTab === "items" && (
            <div className="p-6">
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="ml-4 flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Order Receipt Tab */}
          {activeTab === "receipt" && (
            <div className="p-6">
              <div className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Customer Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {orderInfo.customerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">
                        {orderInfo.customerPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">
                        {orderInfo.customerEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Delivery Address
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5 mr-2" />
                      <span>{orderInfo.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Order Summary
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>
                        $
                        {(
                          orderInfo.totalAmount -
                          15.99 -
                          orderInfo.totalAmount * 0.08
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>$15.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>${(orderInfo.totalAmount * 0.08).toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${orderInfo.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-medium">
                        {orderInfo.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
            Track on Map
          </button>
          <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingDetails;
