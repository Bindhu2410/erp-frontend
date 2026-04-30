import React, { useState } from "react";
import Modal from "../../components/common/Modal";
import InvoiceDetails from "../invoice/InvoiceDetails";

export const InvoiceList = ({ invoices = [] }: { invoices: any[] }) => {
  // Defensive: ensure invoices is always an array
  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  // State for modal
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null);

  // Helper function to calculate item amount
  const calculateItemAmount = (item: any) => {
    const unitPrice = item.unitPrice || 0;
    const qty = item.qty || 1;
    const taxPercentage = item.taxPercentage || 0;

    const baseAmount = unitPrice * qty;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    return baseAmount + taxAmount;
  };

  // Helper function to calculate total invoice amount
  const calculateInvoiceTotal = (invoice: any) => {
    if (!invoice.items || !Array.isArray(invoice.items)) {
      return 0;
    }

    const itemsTotal = invoice.items.reduce((sum: number, item: any) => {
      return sum + calculateItemAmount(item);
    }, 0);

    // Apply discount if present
    const discount = parseFloat(invoice.quotationInfo?.discount || 0);
    const freightCharge = parseFloat(
      invoice.quotationInfo?.freight_charge || 0
    );

    let finalAmount = itemsTotal - discount + freightCharge;
    return Math.max(0, finalAmount); // Ensure amount is not negative
  };

  return (
    <div>
      {/* Invoice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {safeInvoices.length === 0 && (
          <div className="col-span-3 text-center text-gray-400">
            No invoices found.
          </div>
        )}
        {safeInvoices.map((inv, idx) => (
          <div
            key={inv.invoiceId || idx}
            className="rounded-lg border-2 border-green-600 bg-white shadow hover:shadow-lg transition"
          >
            <div className="bg-green-600 text-white px-5 py-3 rounded-t-lg">
              <span className="font-semibold text-lg">
                Invoice #{inv.invoiceId}
              </span>
            </div>
            <div className="px-5 py-4">
              <div className="text-green-600 text-2xl font-bold mb-2">
                ₹
                {calculateInvoiceTotal(inv).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-gray-600 mb-1">
                Generated:{" "}
                {inv.createdDate
                  ? new Date(inv.createdDate).toLocaleDateString()
                  : "-"}
              </div>
              <div className="text-gray-600 mb-1">
                Quotation: {inv.quotationInfo?.quotation_id || "-"}
              </div>
              <div className="text-gray-600 mb-3">
                Customer: {inv.quotationInfo?.customer_name || "-"}
              </div>
              <span
                className={`inline-block text-xs font-semibold rounded-full px-3 py-1 mb-3 ${
                  inv.status === "Draft"
                    ? "bg-yellow-400 text-gray-900"
                    : inv.status === "Paid"
                    ? "bg-green-600 text-white"
                    : "bg-blue-600 text-white"
                }`}
              >
                {inv.status || "-"}
              </span>
              <div className="flex gap-2">
                <button
                  className="border border-blue-600 text-blue-600 px-4 py-1 rounded font-medium hover:bg-blue-50 transition text-sm"
                  onClick={() => setOpenInvoiceId(inv.invoiceId)}
                >
                  View
                </button>
                {/* <button className="border border-gray-400 text-gray-700 px-4 py-1 rounded font-medium hover:bg-gray-100 transition text-sm">
                  Download
                </button> */}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Invoice Summary Table */}
      <div className="mt-4">
        <h5 className="font-bold text-lg mb-4">Invoice Summary</h5>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Invoice #</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Generated</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Items</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeInvoices.map((inv, idx) => (
                <tr key={inv.invoiceId || idx} className="hover:bg-gray-50">
                  <td className="border-t px-4 py-2 font-semibold">
                    <strong>{inv.invoiceId}</strong>
                  </td>
                  <td className="border-t px-4 py-2">
                    ₹
                    {calculateInvoiceTotal(inv).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="border-t px-4 py-2">
                    {new Date(inv.createdDate).toLocaleDateString()}
                  </td>
                  <td className="border-t px-4 py-2">
                    {inv.quotationInfo?.valid_till
                      ? new Date(
                          inv.quotationInfo.valid_till
                        ).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border-t px-4 py-2">
                    <span
                      className={`inline-block text-xs font-semibold rounded-full px-3 py-1 ${
                        inv.status === "Draft"
                          ? "bg-yellow-400 text-gray-900"
                          : inv.status === "Paid"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="border-t px-4 py-2">
                    {inv.items?.map((item: any) => item.itemName).join(", ") ||
                      "No items"}
                  </td>
                  <td className="border-t px-4 py-2">
                    <button
                      className="border border-blue-600 text-blue-600 px-4 py-1 rounded font-medium hover:bg-blue-50 transition text-sm"
                      onClick={() => setOpenInvoiceId(inv.invoiceId)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Invoice Details Modal */}
      <Modal
        isOpen={!!openInvoiceId}
        onClose={() => setOpenInvoiceId(null)}
        title={openInvoiceId ? `Invoice ` : "Invoice Details"}
        type="max"
      >
        {openInvoiceId && <InvoiceDetails id={openInvoiceId} />}
      </Modal>
    </div>
  );
};
