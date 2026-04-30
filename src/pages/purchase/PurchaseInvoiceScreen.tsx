import React, { useState } from "react";

// Types
interface Supplier {
  id: string;
  name: string;
  currency: string;
  paymentTerms: string;
}
interface GRNItem {
  id: string;
  code: string;
  name: string;
  uom: string;
  qtyOrdered: number;
  qtyReceived: number;
  qtyInvoiced: number;
  rate: number;
  total: number;
}
interface GRN {
  id: string;
  grnNo: string;
  date: string;
  supplierId: string;
  items: GRNItem[];
}
interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  supplier: Supplier;
  grn: GRN;
  refNo: string;
  currency: string;
  paymentTerms: string;
  status: string;
  items: GRNItem[];
  subTotal: number;
  taxes: number;
  freight: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  preparedBy: string;
  approvedBy: string;
  notes: string;
}

// Mock data
const suppliers: Supplier[] = [
  {
    id: "1",
    name: "Tech Components Inc.",
    currency: "USD",
    paymentTerms: "Net 30",
  },
  {
    id: "2",
    name: "Global Electronics Ltd.",
    currency: "EUR",
    paymentTerms: "Net 15",
  },
];

const grns: GRN[] = [
  {
    id: "1",
    grnNo: "GRN-001",
    date: "2023-05-15",
    supplierId: "1",
    items: [
      {
        id: "1",
        code: "RES-100",
        name: "Resistor 10K Ohm",
        uom: "pcs",
        qtyOrdered: 100,
        qtyReceived: 100,
        qtyInvoiced: 0,
        rate: 0.15,
        total: 0,
      },
      {
        id: "2",
        code: "CAP-050",
        name: "Capacitor 50V 10uF",
        uom: "pcs",
        qtyOrdered: 200,
        qtyReceived: 200,
        qtyInvoiced: 0,
        rate: 0.25,
        total: 0,
      },
    ],
  },
];

const PurchaseInvoiceScreen: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    id: "1",
    invoiceNo: "PI-2023-001",
    date: new Date().toISOString().split("T")[0],
    supplier: {} as Supplier,
    grn: {} as GRN,
    refNo: "",
    currency: "",
    paymentTerms: "",
    status: "Draft",
    items: [],
    subTotal: 0,
    taxes: 0,
    freight: 0,
    discount: 0,
    total: 0,
    paid: 0,
    due: 0,
    preparedBy: "John Smith",
    approvedBy: "",
    notes: "",
  });

  const [activeTab, setActiveTab] = useState("details");

  const handleSupplierChange = (id: string) => {
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier)
      setInvoice((prev) => ({
        ...prev,
        supplier,
        currency: supplier.currency,
        paymentTerms: supplier.paymentTerms,
      }));
  };

  const handleGRNChange = (id: string) => {
    const grn = grns.find((g) => g.id === id);
    if (grn) {
      const items = grn.items.map((i) => ({
        ...i,
        qtyInvoiced: i.qtyReceived,
        total: i.qtyReceived * i.rate,
      }));
      const subTotal = items.reduce((sum, item) => sum + item.total, 0);
      setInvoice((prev) => ({
        ...prev,
        grn,
        items,
        subTotal,
        total: subTotal,
      }));
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    const items = invoice.items.map((item) =>
      item.id === id
        ? {
            ...item,
            qtyInvoiced: Math.min(qty, item.qtyReceived),
            total: Math.min(qty, item.qtyReceived) * item.rate,
          }
        : item
    );
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    setInvoice((prev) => ({
      ...prev,
      items,
      subTotal,
      total: subTotal - prev.discount + prev.taxes + prev.freight,
    }));
  };

  const handleSave = (status: string) => {
    alert(
      `Invoice ${
        status === "Draft" ? "saved as draft" : "submitted for approval"
      }`
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-gray-200 text-gray-800",
      Approved: "bg-blue-100 text-blue-800",
      Paid: "bg-green-100 text-green-800",
    };
    return colors[status] || "bg-gray-200 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Purchase Invoice</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
            <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm">
              Cancel
            </button>
            <button
              onClick={() => handleSave("Draft")}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave("Approved")}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          {["details", "items", "summary", "notes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Invoice Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice No.
                </label>
                <input
                  value={invoice.invoiceNo}
                  onChange={(e) =>
                    setInvoice({ ...invoice, invoiceNo: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={(e) =>
                    setInvoice({ ...invoice, date: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reference No.
                </label>
                <input
                  value={invoice.refNo}
                  onChange={(e) =>
                    setInvoice({ ...invoice, refNo: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="Supplier Invoice No."
                />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Supplier Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <select
                  value={invoice.supplier.id || ""}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GRN No.
                </label>
                <select
                  value={invoice.grn.id || ""}
                  onChange={(e) => handleGRNChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="">Select GRN</option>
                  {grns.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.grnNo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <input
                    value={invoice.currency}
                    readOnly
                    className="w-full rounded-md border border-gray-300 p-2 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <input
                    value={invoice.paymentTerms}
                    onChange={(e) =>
                      setInvoice({ ...invoice, paymentTerms: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === "items" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Item Details
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    {[
                      "Item Code",
                      "Item Name",
                      "UOM",
                      "Qty Ordered",
                      "Qty Received",
                      "Qty Invoiced",
                      "Rate",
                      "Total",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left p-3 text-sm font-medium text-gray-700"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.code}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.uom}</td>
                      <td className="p-3">{item.qtyOrdered}</td>
                      <td className="p-3">{item.qtyReceived}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          max={item.qtyReceived}
                          value={item.qtyInvoiced}
                          onChange={(e) =>
                            handleQtyChange(item.id, parseInt(e.target.value))
                          }
                          className="w-20 border rounded p-1"
                        />
                      </td>
                      <td className="p-3">${item.rate.toFixed(2)}</td>
                      <td className="p-3">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Financial Summary
              </h2>
              <div className="space-y-3">
                {[
                  { label: "Sub Total:", value: invoice.subTotal },
                  { label: "Taxes:", value: invoice.taxes, editable: true },
                  {
                    label: "Freight/Other Charges:",
                    value: invoice.freight,
                    editable: true,
                  },
                  {
                    label: "Discounts:",
                    value: invoice.discount,
                    editable: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-600">{item.label}</span>
                    {item.editable ? (
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          let newInvoice = { ...invoice };
                          if (item.label.includes("Taxes"))
                            newInvoice.taxes = val;
                          if (item.label.includes("Freight"))
                            newInvoice.freight = val;
                          if (item.label.includes("Discount"))
                            newInvoice.discount = val;
                          newInvoice.total =
                            newInvoice.subTotal -
                            newInvoice.discount +
                            newInvoice.taxes +
                            newInvoice.freight;
                          newInvoice.due = newInvoice.total - newInvoice.paid;
                          setInvoice(newInvoice);
                        }}
                        className="w-24 border rounded p-1 text-right"
                      />
                    ) : (
                      <span>${item.value.toFixed(2)}</span>
                    )}
                  </div>
                ))}
                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">
                    ${invoice.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Payment Information
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <input
                    type="number"
                    value={invoice.paid}
                    onChange={(e) =>
                      setInvoice({
                        ...invoice,
                        paid: parseFloat(e.target.value),
                        due: invoice.total - parseFloat(e.target.value),
                      })
                    }
                    className="w-24 border rounded p-1 text-right"
                  />
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Balance Due:</span>
                  <span
                    className={
                      invoice.due > 0 ? "text-red-600" : "text-green-600"
                    }
                  >
                    ${invoice.due.toFixed(2)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved By
                  </label>
                  <input
                    value={invoice.approvedBy}
                    onChange={(e) =>
                      setInvoice({ ...invoice, approvedBy: e.target.value })
                    }
                    className="w-full border rounded p-2"
                    placeholder="Enter approver name"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notes & Attachments
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes / Remarks
                </label>
                <textarea
                  value={invoice.notes}
                  onChange={(e) =>
                    setInvoice({ ...invoice, notes: e.target.value })
                  }
                  rows={4}
                  className="w-full border rounded p-2"
                  placeholder="Add any additional notes here..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attach Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <p className="text-gray-500">
                    Drag files here or click to upload
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, JPG, PNG (MAX. 5MB each)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseInvoiceScreen;
