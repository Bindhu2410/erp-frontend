import React, { useState } from "react";
import {
  LuCreditCard as CreditCard,
  LuCalendar as Calendar,
  LuDollarSign as DollarSign,
  LuUser as User,
  LuCheckCircle as CheckCircle,
  LuAlertCircle as AlertCircle,
  LuClock as Clock,
  LuDownload as Download,
  LuSend as Send,
  LuMoreHorizontal as MoreHorizontal,
  LuArrowLeft as ArrowLeft,
  LuCopy as Copy,
  LuRefreshCcw as RefreshCw,
  LuFileText as FileText,
  LuMail as Mail,
  LuPhone as Phone,
  LuMapPin as MapPin,
  LuX as X,
  LuAlertTriangle as AlertTriangle,
} from "react-icons/lu";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  date: string;
  method: "credit_card" | "bank_transfer" | "paypal";
  customer: {
    name: string;
    email: string;
    id: string;
    phone: string;
    company: string;
    address: string;
  };
  description: string;
  transactionId: string;
  fee: number;
  netAmount: number;
  cardLast4?: string;
  invoice: {
    id: string;
    dueDate: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
  };
}

interface TimelineEvent {
  id: string;
  type: "payment" | "refund" | "dispute" | "note";
  title: string;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
}

interface RelatedItem {
  id: string;
  type: "invoice" | "subscription" | "order";
  title: string;
  amount: number;
  status: string;
  date: string;
}

const PaymentViewScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "details" | "timeline" | "related"
  >("details");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [notifications, setNotifications] = useState<
    Array<{ id: string; type: "success" | "error" | "info"; message: string }>
  >([]);

  // Sample payment data
  const payment: Payment = {
    id: "PAY-2024-001234",
    amount: 2499.99,
    currency: "USD",
    status: "completed",
    date: "2024-03-15T10:30:00Z",
    method: "credit_card",
    customer: {
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      id: "CUST-12345",
      phone: "+1 (555) 123-4567",
      company: "TechCorp Solutions",
      address: "123 Business Ave, Suite 100, New York, NY 10001",
    },
    description: "Enterprise Software License - Annual Subscription",
    transactionId: "txn_1P2Q3R4S5T6U7V8W",
    fee: 74.99,
    netAmount: 2424.0,
    cardLast4: "4242",
    invoice: {
      id: "INV-2024-5678",
      dueDate: "2024-03-15T00:00:00Z",
      items: [
        {
          description: "Enterprise Software License (Annual)",
          quantity: 1,
          unitPrice: 2199.99,
          total: 2199.99,
        },
        {
          description: "Priority Support Package",
          quantity: 1,
          unitPrice: 300.0,
          total: 300.0,
        },
      ],
    },
  };

  // Sample timeline data
  const timelineEvents: TimelineEvent[] = [
    {
      id: "1",
      type: "payment",
      title: "Payment Completed",
      description: "Payment successfully processed and funds captured",
      date: "2024-03-15T10:30:00Z",
      status: "completed",
    },
    {
      id: "2",
      type: "payment",
      title: "Payment Authorized",
      description: "Card authorization successful, funds reserved",
      date: "2024-03-15T10:28:00Z",
      status: "completed",
    },
    {
      id: "3",
      type: "payment",
      title: "Payment Initiated",
      description: "Customer submitted payment information",
      date: "2024-03-15T10:25:00Z",
      status: "completed",
    },
    {
      id: "4",
      type: "note",
      title: "Invoice Generated",
      description: "Invoice INV-2024-5678 created and sent to customer",
      date: "2024-03-10T14:15:00Z",
      status: "completed",
    },
  ];

  // Sample related items
  const relatedItems: RelatedItem[] = [
    {
      id: "INV-2024-5678",
      type: "invoice",
      title: "Enterprise Software License Invoice",
      amount: 2499.99,
      status: "paid",
      date: "2024-03-10T14:15:00Z",
    },
    {
      id: "SUB-2024-001",
      type: "subscription",
      title: "Annual Enterprise Subscription",
      amount: 2499.99,
      status: "active",
      date: "2024-03-15T10:30:00Z",
    },
  ];

  const addNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="w-5 h-5" />;
      case "bank_transfer":
        return <DollarSign className="w-5 h-5" />;
      case "paypal":
        return <DollarSign className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addNotification("success", "Copied to clipboard");
  };

  const handleDownloadReceipt = () => {
    addNotification("success", "Receipt download started");
    // Simulate download
    setTimeout(() => {
      addNotification("info", "Receipt downloaded successfully");
    }, 2000);
  };

  const handleSendReceipt = () => {
    if (!emailRecipient.trim()) {
      addNotification("error", "Please enter email address");
      return;
    }
    addNotification("success", `Receipt sent to ${emailRecipient}`);
    setShowSendModal(false);
    setEmailRecipient("");
  };

  const handleRefund = () => {
    if (!refundAmount || !refundReason.trim()) {
      addNotification("error", "Please fill in all refund details");
      return;
    }
    addNotification("success", `Refund of $${refundAmount} initiated`);
    setShowRefundModal(false);
    setRefundAmount("");
    setRefundReason("");
  };

  const handleGoBack = () => {
    addNotification("info", "Navigating back to payments list");
  };

  const handleViewCustomer = () => {
    addNotification("info", "Opening customer profile");
  };

  const handleCreateCreditNote = () => {
    addNotification("success", "Credit note created successfully");
  };

  const handleSendReminder = () => {
    addNotification("success", "Payment reminder sent to customer");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center gap-2 p-4 rounded-lg shadow-lg border max-w-sm ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : notification.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle className="w-5 h-5" />
            )}
            {notification.type === "error" && (
              <AlertTriangle className="w-5 h-5" />
            )}
            {notification.type === "info" && (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Payment Details
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage payment information
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownloadReceipt}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              onClick={() => setShowSendModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send Receipt
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
                More Actions
              </button>

              {showMoreActions && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      addNotification("info", "Dispute initiated");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Dispute Payment
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      addNotification(
                        "success",
                        "Payment marked as reconciled"
                      );
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Mark as Reconciled
                  </button>
                  <button
                    onClick={() => {
                      setShowMoreActions(false);
                      addNotification("info", "Exporting payment details");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                  >
                    Export Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Payment Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        ${payment.amount.toLocaleString()}
                      </h2>
                      <p className="text-gray-600">Payment Amount</p>
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    {payment.status.charAt(0).toUpperCase() +
                      payment.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-100">
                <nav className="flex">
                  {[
                    { id: "details", label: "Payment Details" },
                    { id: "timeline", label: "Timeline" },
                    { id: "related", label: "Related Items" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Payment ID
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-900 font-mono">
                              {payment.id}
                            </p>
                            <button
                              onClick={() => copyToClipboard(payment.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Transaction ID
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-gray-900 font-mono">
                              {payment.transactionId}
                            </p>
                            <button
                              onClick={() =>
                                copyToClipboard(payment.transactionId)
                              }
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Payment Method
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            {getMethodIcon(payment.method)}
                            <p className="text-gray-900">
                              {payment.method === "credit_card"
                                ? `Credit Card ending in ${payment.cardLast4}`
                                : payment.method
                                    .replace("_", " ")
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Date & Time
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-900">
                              {formatDate(payment.date)}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Description
                          </label>
                          <p className="text-gray-900 mt-1">
                            {payment.description}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Invoice
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <button
                              onClick={() =>
                                addNotification(
                                  "info",
                                  "Opening invoice details"
                                )
                              }
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {payment.invoice.id}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Invoice Items
                      </h3>
                      <div className="space-y-3">
                        {payment.invoice.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {item.description}
                              </p>
                              <p className="text-sm text-gray-600">
                                Qty: {item.quantity} × $
                                {item.unitPrice.toLocaleString()}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              ${item.total.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Amount Breakdown */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Amount Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Amount</span>
                          <span className="text-gray-900">
                            ${payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processing Fee</span>
                          <span className="text-gray-900">
                            -${payment.fee.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-gray-100 font-medium">
                          <span className="text-gray-900">Net Amount</span>
                          <span className="text-gray-900">
                            ${payment.netAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-4">
                    {timelineEvents.map((event) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-full ${
                            event.status === "completed"
                              ? "bg-green-100"
                              : event.status === "pending"
                              ? "bg-yellow-100"
                              : "bg-red-100"
                          }`}
                        >
                          {event.status === "completed" && (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          )}
                          {event.status === "pending" && (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                          {event.status === "failed" && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {formatDate(event.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "related" && (
                  <div className="space-y-4">
                    {relatedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            {item.type === "invoice" && (
                              <FileText className="w-4 h-4 text-gray-600" />
                            )}
                            {item.type === "subscription" && (
                              <RefreshCw className="w-4 h-4 text-gray-600" />
                            )}
                            {item.type === "order" && (
                              <CreditCard className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.id} • {formatDate(item.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${item.amount.toLocaleString()}
                          </p>
                          <p
                            className={`text-sm ${
                              item.status === "paid" || item.status === "active"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">
                      {payment.customer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.customer.company}
                    </p>
                    <p className="text-sm text-gray-500">
                      ID: {payment.customer.id}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {payment.customer.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {payment.customer.phone}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600">
                      {payment.customer.address}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleViewCustomer}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Customer Profile
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  Refund Payment
                </button>
                <button
                  onClick={handleCreateCreditNote}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  Create Credit Note
                </button>
                <button
                  onClick={handleSendReminder}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  Send Reminder
                </button>
              </div>
            </div>

            {/* Payment Summary Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Payments</span>
                  <span className="font-medium text-gray-900">$45,670</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Year</span>
                  <span className="font-medium text-gray-900">$12,450</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Payment</span>
                  <span className="font-medium text-gray-900">
                    Mar 15, 2024
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Count</span>
                  <span className="font-medium text-gray-900">18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Process Refund
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount (Max: ${payment.amount.toLocaleString()})
                </label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={payment.amount}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter reason for refund..."
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Process Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Receipt Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Receipt
              </h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={payment.customer.email}
                />
              </div>
              <div className="text-sm text-gray-600">
                Receipt will be sent for payment {payment.id}
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowSendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReceipt}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentViewScreen;
