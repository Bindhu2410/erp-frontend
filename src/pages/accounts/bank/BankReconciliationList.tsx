import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type BankReconciliation = {
  id: string;
  reconciliationNumber: string;
  bankAccount: string;
  statementDate: string;
  openingBalance: number;
  closingBalance: number;
  status: "Pending" | "Reconciled" | "Partial";
};

const sampleData: BankReconciliation[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `BR-${i + 1}`,
  reconciliationNumber: `BR-2026-${String(i + 1).padStart(3, "0")}`,
  bankAccount: ["HDFC Bank - 1234", "ICICI Bank - 5678", "SBI - 9012"][i % 3],
  statementDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  openingBalance: Math.round(100000 + Math.random() * 400000),
  closingBalance: Math.round(100000 + Math.random() * 400000),
  status: i % 3 === 0 ? "Reconciled" : i % 5 === 0 ? "Partial" : "Pending",
}));

const PAGE_SIZE = 10;

const BankReconciliationList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<BankReconciliation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => setItems(sampleData), []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((it) => (it.reconciliationNumber.toLowerCase().includes(s) || it.bankAccount.toLowerCase().includes(s)) && (statusFilter === "All" || it.status === statusFilter));
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Bank Reconciliation</h1>
          <p className="text-sm text-gray-600">Reconcile bank statements</p>
        </div>
        <button onClick={() => navigate("/accounts/bank-reconciliation/new")} className="px-4 py-2 bg-blue-600 text-white rounded">New Reconciliation</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-2 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reconciliation or bank" className="px-3 py-2 border rounded w-64" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded"><option>All</option><option>Pending</option><option>Reconciled</option><option>Partial</option></select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">Reconciliation #</th><th className="p-3">Bank Account</th><th className="p-3">Statement Date</th><th className="p-3 text-right">Opening Balance</th><th className="p-3 text-right">Closing Balance</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {pageItems.map(it => (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/accounts/bank-reconciliation/${it.id}`)}>
                <td className="p-3 font-medium">{it.reconciliationNumber}</td>
                <td className="p-3">{it.bankAccount}</td>
                <td className="p-3">{it.statementDate}</td>
                <td className="p-3 text-right">₹{it.openingBalance.toLocaleString()}</td>
                <td className="p-3 text-right">₹{it.closingBalance.toLocaleString()}</td>
                <td className="p-3">{it.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</div>
        <div className="flex items-center gap-2"><button className="px-3 py-1 border rounded" onClick={() => setPage(1)} disabled={page === 1}>First</button><button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button><div className="px-3 py-1">Page {page}/{totalPages}</div><button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button><button className="px-3 py-1 border rounded" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button></div>
      </div>
    </div>
  );
};

export default BankReconciliationList;
