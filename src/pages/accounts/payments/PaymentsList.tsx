import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Payment = {
  id: string;
  paymentNumber: string;
  party: string;
  date: string;
  amount: number;
  status: "Pending" | "Cleared" | "Cancelled";
};

const sampleData: Payment[] = Array.from({ length: 28 }).map((_, i) => ({
  id: `PAY-${i + 1}`,
  paymentNumber: `PAY-2026-${String(i + 1).padStart(3, "0")}`,
  party: ["ABC Hospital", "XYZ Supplier"][i % 2],
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  amount: Math.round(2000 + Math.random() * 80000),
  status: i % 4 === 0 ? "Cleared" : "Pending",
}));

const PAGE_SIZE = 10;

const PaymentsList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => setItems(sampleData), []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((it) => (it.paymentNumber.toLowerCase().includes(s) || it.party.toLowerCase().includes(s)) && (statusFilter === "All" || it.status === statusFilter));
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  const exportCSV = () => {
    const headers = ["Payment #","Party","Date","Amount","Status"];
    const rows = filtered.map(r => [r.paymentNumber,r.party,r.date,String(r.amount),r.status]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="payments.csv"; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Payments & Receipts</h1>
          <p className="text-sm text-gray-600">Record payments and receipts</p>
        </div>
        <div>
          <button onClick={() => navigate("/accounts/payments/new")} className="px-4 py-2 bg-blue-600 text-white rounded">Record Payment</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-2 items-center">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search payment or party" className="px-3 py-2 border rounded w-64" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 border rounded"><option>All</option><option>Pending</option><option>Cleared</option><option>Cancelled</option></select>
          <button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">Payment #</th><th className="p-3">Party</th><th className="p-3">Date</th><th className="p-3 text-right">Amount</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {pageItems.map(it=> (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/accounts/payments/${it.id}`)}>
                <td className="p-3 font-medium">{it.paymentNumber}</td>
                <td className="p-3">{it.party}</td>
                <td className="p-3">{it.date}</td>
                <td className="p-3 text-right">₹{it.amount.toLocaleString()}</td>
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

export default PaymentsList;
