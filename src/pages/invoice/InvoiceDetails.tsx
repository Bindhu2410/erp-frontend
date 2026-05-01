import React, { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  LuDownload as Download,
  LuMail as Mail,
  LuCalendar as Calendar,
  LuHash as Hash,
  LuSend as Send,
  LuTruck as Truck,
  LuFileText as FileText,
  LuUser as User,
  LuMapPin as MapPin,
  LuPrinter as Printer,
} from "react-icons/lu";

interface InvoiceItem {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string | null;
  qty: number;
  amount: number;
  isActive: boolean;
  itemId: number;
  stage: string;
  unitPrice: number;
  stageItemId: string;
  make: string;
  model: string;
  product: string;
  category: string;
  itemName: string;
  itemCode: string;
}

interface QuotationInfo {
  id: number;
  user_created: number;
  date_created: string;
  user_updated: number | null;
  date_updated: string | null;
  version: string;
  terms: string;
  valid_till: string;
  quotation_for: string;
  status: string;
  lost_reason: string;
  customer_id: number;
  quotation_type: string;
  quotation_date: string;
  order_type: string;
  comments: string;
  delivery_within: string;
  delivery_after: string | null;
  is_active: boolean;
  quotation_id: string;
  customer_name: string;
  taxes: any;
  delivery: string;
  payment: string;
  warranty: string;
  freight_charge: any;
  is_current: boolean;
  parent_sales_quotations_id: any;
  lead_id: string | null;
  opportunity_id: string;
  tax: any;
  discount: any;
  freight_charges: any;
}

interface DeliveryInfo {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  salesOrderId: string;
  poId: string;
  deliveryId: string;
  deliveryDate: string;
  deliveryStatus: string;
  dispatchAddress: string;
  priority: string;
  transporterName: string;
  vehicleNo: string;
  driverName: string;
  driverContact: number;
  modeOfDelivery: string;
  invoiceId: string | null;
  items: any;
  totalRecords: any;
}

interface InvoiceResponse {
  id: number;
  invoiceId: string;
  totalAmount: number;
  status: string;
  createdDate: string;
  po_id: string;
  sales_order_id: string;
  quotation_id: number;
  delivery_id: string;
  purchaseOrderInfo: any[];
  quotationInfo: QuotationInfo;
  items: InvoiceItem[];
  termsAndConditions: any[];
  delivery: DeliveryInfo;
}

interface InvoiceDetailsProps {
  id?: string;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ id }) => {
  const { id: routeInvoiceId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const queryInvoiceId = searchParams.get("id");
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  // Use prop id if provided, otherwise use query or route parameter
  const invoiceId = id || queryInvoiceId || routeInvoiceId;
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("Invoice ID from query:", queryInvoiceId);
  console.log("Invoice ID from route:", routeInvoiceId);
  console.log("Final Invoice ID:", invoiceId);
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError("Invoice ID is required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}Invoice/${invoiceId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch invoice data");
        }
        const data = await response.json();
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const subtotal = invoice?.items.reduce(
    (sum, item) => sum + item.qty * item.amount,
    0
  );

  const taxRate = Number(invoice?.quotationInfo?.tax) || 0; // percentage
  const discountRate = Number(invoice?.quotationInfo?.discount) || 0; // percentage
  const freight = Number(invoice?.quotationInfo?.freight_charge) || 0;

  const taxAmount = ((subtotal ?? 0) * taxRate) / 100;
  const discountAmount = ((subtotal ?? 0) * discountRate) / 100;

  const grandTotal = (subtotal ?? 0) + taxAmount + freight - discountAmount;
  const handleDownloadInvoice = () => {
    if (invoicePrintRef.current) {
      const printContent = invoicePrintRef.current;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${invoice?.invoiceId || ""}</title>
              <link id="twcss" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @media print {
                  body { margin: 0; padding: 0; background: #f8fafc; }
                  .shadow-2xl, .shadow { box-shadow: none !important; }
                }
              </style>
            </head>
            <body class="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        // Wait for Tailwind CSS to load before printing
        const link = printWindow.document.getElementById("twcss");
        if (link) {
          link.onload = () => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          };
        } else {
          // fallback if link not found
          setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
          }, 700);
        }
      }
    }
  };

  const sendInvoice = () => {
    const to = "customer@example.com";
    const subject = "Invoice from JBS Meditec";
    const body =
      "Dear Customer,\n\nPlease find your invoice attached.\n\nBest regards,\nJBS Meditec";

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        to
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8 flex justify-center items-center">
        <div className="text-red-600">
          Error: {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Invoice
            </h1>
          </div>
        </div>

        {/* Main Invoice Container */}
        <div
          ref={invoicePrintRef}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 lg:p-8 text-white">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Hash size={28} />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold flex flex-col">
                    INVOICE
                    <span
                      className={`rounded-full text-sm w-fit font-semibold px-2 capitalize ${
                        typeof invoice.status === "string" &&
                        invoice.status.toLowerCase() === "paid"
                          ? "bg-green-100 text-green-800"
                          : typeof invoice.status === "string" &&
                            invoice.status.toLowerCase() === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {typeof invoice.status === "string"
                        ? invoice.status
                        : "-"}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                      <Hash size={16} />
                      <span className="text-sm font-medium">
                        Invoice Number
                      </span>
                    </div>
                    <div className="text-xl font-bold">{invoice.invoiceId}</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">Created Date</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {formatDate(invoice.createdDate)}
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-100">
                      <Hash size={16} />
                      <span className="text-sm font-medium">Reference</span>
                    </div>
                    <div className="text-lg font-semibold">
                      {invoice.po_id
                        ? `PO: ${invoice.po_id}`
                        : invoice.quotation_id
                        ? `Quote: ${invoice.quotation_id}`
                        : invoice.sales_order_id
                        ? `SO: ${invoice.sales_order_id}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To Address Section */}
          <div className="px-6 lg:px-8 py-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin size={24} />
              Bill To Address
            </h3>
            {invoice.quotationInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <p className="font-semibold text-lg text-blue-800">
                      {invoice.quotationInfo.customer_name || "Customer Name"}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Customer ID:</span>{" "}
                      {invoice.quotationInfo.customer_id}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Quotation For:</span>{" "}
                      {invoice.quotationInfo.quotation_for || "Lead"}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Delivery Address
                  </h4>
                  <div className="space-y-2">
                    <p className="text-gray-700 leading-relaxed">
                      {invoice.quotationInfo.delivery ||
                        "Delivery address not specified"}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Payment Terms:</span>{" "}
                        {invoice.quotationInfo.payment || "Net 30"}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery Within:</span>{" "}
                        {invoice.quotationInfo.delivery_within || "Standard"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  No Address Information
                </h4>
                <p className="text-gray-500">
                  Customer address information is not available for this
                  invoice.
                </p>
              </div>
            )}
          </div>

          {/* Items Section */}
          <div className="px-6 lg:px-8 py-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText size={24} />
              Items
            </h3>

            {invoice.items && invoice.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-700">
                        Item Details
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="text-right p-4 font-semibold text-gray-700">
                        Unit Price
                      </th>
                      <th className="text-right p-4 font-semibold text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {item.itemName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.itemCode} - {item.make} {item.model}
                          </div>
                          <div className="text-xs text-gray-400">
                            {item.category}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {item.qty}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-700">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="p-4 text-right font-bold text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-600 mb-2">
                  No Items Found
                </h4>
                <p className="text-gray-500">
                  This invoice doesn't have any items associated with it yet.
                </p>
              </div>
            )}

            {/* Grand Total Section */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Hash size={20} />
                Invoice Summary
              </h4>

              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-800">
                    {formatCurrency(
                      invoice.items.reduce(
                        (sum, item) => sum + item.qty * item.amount,
                        0
                      )
                    )}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold text-gray-800">
                    {invoice.quotationInfo?.tax
                      ? formatCurrency(Number(invoice.quotationInfo.tax) || 0)
                      : "₹0.00"}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold text-green-600">
                    -
                    {invoice.quotationInfo?.discount
                      ? formatCurrency(
                          Number(invoice.quotationInfo.discount) || 0
                        )
                      : "₹0.00"}
                  </span>
                </div>

                {/* Freight Charges */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Freight Charges:</span>
                  <span className="font-semibold text-gray-800">
                    {invoice.quotationInfo?.freight_charge
                      ? formatCurrency(
                          Number(invoice.quotationInfo.freight_charge) || 0
                        )
                      : "₹0.00"}
                  </span>
                </div>

                <hr className="border-gray-300" />

                {/* Grand Total */}
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl">
                  <span className="text-xl font-bold">Grand Total:</span>
                  <span className="text-2xl font-bold">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Section */}
          <div className="px-6 lg:px-8 py-6 border-t border-gray-200 bg-gray-50">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText size={24} />
              Terms and Conditions
            </h3>

            {invoice.termsAndConditions &&
            invoice.termsAndConditions.length > 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-4">
                  {invoice.termsAndConditions.map((term, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-blue-500 pl-4"
                    >
                      <p className="text-gray-700 leading-relaxed">{term}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      1. Payment Terms
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      Payment terms:{" "}
                      {invoice.quotationInfo?.payment || "Net 30 days"}. All
                      payments should be made within the specified period.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      2. Warranty
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      Warranty period:{" "}
                      {invoice.quotationInfo?.warranty ||
                        "As per manufacturer standards"}
                      . All products are covered under standard warranty terms.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      3. Delivery Terms
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      Delivery within:{" "}
                      {invoice.quotationInfo?.delivery_within ||
                        "Standard delivery timeframe"}
                      . Delivery charges may apply as per the freight terms
                      mentioned above.
                    </p>
                  </div>

                  {/* <div className="border-l-4 border-purple-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      4. General Terms
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      This invoice is computer generated and does not require a
                      signature. All disputes are subject to local jurisdiction.
                      Goods once sold will not be taken back.
                    </p>
                  </div> */}

                  {/* <div className="border-l-4 border-red-500 pl-4">
                    <h5 className="font-semibold text-gray-800 mb-2">
                      5. Contact Information
                    </h5>
                    <p className="text-gray-700 leading-relaxed">
                      For any queries regarding this invoice, please contact our
                      customer service team. We appreciate your business and
                      look forward to serving you again.
                    </p>
                  </div> */}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-900 text-white p-6">
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Generated on {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2 gap-3">
        <button
          onClick={handleDownloadInvoice}
          className="flex items-center  gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <Printer size={18} />
          Download PDF
        </button>
        <button
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all duration-200"
          onClick={sendInvoice}
        >
          <Send size={18} />
          Send Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetails;
