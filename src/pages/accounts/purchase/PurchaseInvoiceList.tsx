import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Purchase = {
  id: string;
  billNumber: string;
  supplierName: string;
  billDate: string;
  dueDate: string;
  totalAmount: number;
  status: "Open" | "Paid" | "Cancelled";
};

const sampleData: Purchase[] = Array.from({ length: 34 }).map((_, i) => ({
  id: `PI-${i + 1}`,
  billNumber: `PINV-2026-${String(i + 1).padStart(3, "0")}`,
  supplierName: ["MediSupplies", "LabTech", "EquipCo"][i % 3],
  billDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + (20 - i) * 86400000).toISOString().slice(0, 10),
  totalAmount: Math.round(5000 + Math.random() * 50000),
  status: i % 6 === 0 ? "Paid" : "Open",
}));

const PAGE_SIZE = 10;

const PurchaseInvoiceList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Purchase[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => setItems(sampleData), []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((it) => {
      const ms = it.billNumber.toLowerCase().includes(s) || it.supplierName.toLowerCase().includes(s);
      const mb = statusFilter === "All" || it.status === statusFilter;
      return ms && mb;
    });
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const exportCSV = () => {
    const headers = ["Bill #","Supplier","Date","Due","Amount","Status"];
    const rows = filtered.map(r => [r.billNumber,r.supplierName,r.billDate,r.dueDate,String(r.totalAmount),r.status]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="purchase-invoices.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Purchase Invoices</h1>
          <p className="text-sm text-gray-600">Supplier bills and purchase invoices</p>
        </div>
        <div>
          <button onClick={() => navigate("/accounts/purchase-invoices/new")} className="px-4 py-2 bg-blue-600 text-white rounded">New Purchase</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-2 items-center">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bill or supplier" className="px-3 py-2 border rounded w-64" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 border rounded"><option>All</option><option>Open</option><option>Paid</option><option>Cancelled</option></select>
          <button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">Bill #</th><th className="p-3">Supplier</th><th className="p-3">Date</th><th className="p-3">Due</th><th className="p-3 text-right">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {pageItems.map(it=> (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/accounts/purchase-invoices/${it.id}`)}>
                <td className="p-3 font-medium">{it.billNumber}</td>
                <td className="p-3">{it.supplierName}</td>
                <td className="p-3">{it.billDate}</td>
                <td className="p-3">{it.dueDate}</td>
                <td className="p-3 text-right">₹{it.totalAmount.toLocaleString()}</td>
                <td className="p-3">{it.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {(page-1)*PAGE_SIZE+1} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2"><button className="px-3 py-1 border rounded" onClick={()=>setPage(1)} disabled={page===1}>First</button><button className="px-3 py-1 border rounded" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button><div className="px-3 py-1">Page {page}/{totalPages}</div><button className="px-3 py-1 border rounded" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button><button className="px-3 py-1 border rounded" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Last</button></div>
      </div>
    </div>
  );
};

export default PurchaseInvoiceList;
