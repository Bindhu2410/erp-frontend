import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  invoiceDate: string;
  dueDate: string;

  totalAmount: number;
  status: "Open" | "Paid" | "Cancelled";
};

const sampleData: Invoice[] = Array.from({ length: 57 }).map((_, i) => ({
  id: `SI-${i + 1}`,
  invoiceNumber: `INV-2026-${String(i + 1).padStart(3, "0")}`,
  customerName: ["ABC Hospital", "XYZ Clinic", "MediCare Ltd"][
    i % 3
  ],
  invoiceDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + (30 - i) * 86400000)
    .toISOString()
    .slice(0, 10),
  totalAmount: Math.round(10000 + Math.random() * 90000),
  status: i % 5 === 0 ? "Paid" : i % 7 === 0 ? "Cancelled" : "Open",
}));

const PAGE_SIZE = 10;

const SalesInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    // Replace this with API call
    setInvoices(sampleData);
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(s) ||
        inv.customerName.toLowerCase().includes(s);
      const matchesStatus = statusFilter === "All" || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages]);

  const exportCSV = () => {
    const headers = ["Invoice #", "Customer", "Date", "Due", "Amount", "Status"];
    const rows = filtered.map((r) => [r.invoiceNumber, r.customerName, r.invoiceDate, r.dueDate, String(r.totalAmount), r.status]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales-invoices.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const lines = text.split(/\r?\n/).filter(Boolean);
      const items: Invoice[] = lines.slice(1).map((ln, idx) => {
        const cols = ln.split(",").map((c) => c.replace(/^"|"$/g, ""));
        return {
          id: `IMPORT-${idx + 1}-${Date.now()}`,
          invoiceNumber: cols[0] || `IMP-${idx + 1}`,
          customerName: cols[1] || "Imported",
          invoiceDate: cols[2] || new Date().toISOString().slice(0, 10),
          dueDate: cols[3] || new Date().toISOString().slice(0, 10),
          totalAmount: Number(cols[4] || 0),
          status: (cols[5] as Invoice["status"]) || "Open",
        };
      });
      setInvoices((prev) => [...items, ...prev]);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Sales Invoices</h1>
          <p className="text-sm text-gray-600">Invoice list with filters, pagination, export/import</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/accounts/sales-invoices/new")} className="px-4 py-2 bg-blue-600 text-white rounded">New Invoice</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-2 flex-wrap items-center">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice or customer" className="px-3 py-2 border rounded w-64" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option>All</option>
            <option>Open</option>
            <option>Paid</option>
            <option>Cancelled</option>
          </select>
          <button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded">Export CSV</button>
          <label className="px-3 py-2 bg-gray-100 border rounded cursor-pointer">
            Import CSV
            <input type="file" accept=".csv" onChange={(e) => importCSV(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Due</th>
              <th className="p-3 text-right">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/accounts/sales-invoices/${inv.id}`)}>
                <td className="p-3 font-medium">{inv.invoiceNumber}</td>
                <td className="p-3">{inv.customerName}</td>
                <td className="p-3">{inv.invoiceDate}</td>
                <td className="p-3">{inv.dueDate}</td>
                <td className="p-3 text-right">₹{inv.totalAmount.toLocaleString()}</td>
                <td className="p-3">{inv.status}</td>
              </tr>
            ))}
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setPage(1)} disabled={page === 1}>First</button>
          <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <div className="px-3 py-1">Page {page} / {totalPages}</div>
          <button className="px-3 py-1 border rounded" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          <button className="px-3 py-1 border rounded" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
        </div>
      </div>
    </div>
  );
};

export default SalesInvoiceList;
