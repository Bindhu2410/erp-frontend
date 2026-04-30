import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type JournalEntry = {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  status: "Draft" | "Posted" | "Cancelled";
};

const sampleData: JournalEntry[] = Array.from({ length: 38 }).map((_, i) => ({
  id: `JE-${i + 1}`,
  entryNumber: `JE-2026-${String(i + 1).padStart(3, "0")}`,
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  description: ["Monthly closing", "Adjustment entry", "Accrual entry"][i % 3],
  debitAmount: Math.round(5000 + Math.random() * 45000),
  creditAmount: Math.round(5000 + Math.random() * 45000),
  status: i % 4 === 0 ? "Posted" : i % 6 === 0 ? "Cancelled" : "Draft",
}));

const PAGE_SIZE = 10;

const JournalEntriesList: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [page, setPage] = useState(1);

  useEffect(() => setItems(sampleData), []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter((it) => (it.entryNumber.toLowerCase().includes(s) || it.description.toLowerCase().includes(s)) && (statusFilter === "All" || it.status === statusFilter));
  }, [items, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-sm text-gray-600">Manage general ledger entries</p>
        </div>
        <button onClick={() => navigate("/accounts/journals/new")} className="px-4 py-2 bg-blue-600 text-white rounded">New Journal Entry</button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-2 items-center">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entry or description" className="px-3 py-2 border rounded w-64" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded"><option>All</option><option>Draft</option><option>Posted</option><option>Cancelled</option></select>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3 text-left">Entry #</th><th className="p-3">Date</th><th className="p-3">Description</th><th className="p-3 text-right">Debit</th><th className="p-3 text-right">Credit</th><th className="p-3">Status</th></tr></thead>
          <tbody>
            {pageItems.map(it => (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/accounts/journals/${it.id}`)}>
                <td className="p-3 font-medium">{it.entryNumber}</td>
                <td className="p-3">{it.date}</td>
                <td className="p-3">{it.description}</td>
                <td className="p-3 text-right">₹{it.debitAmount.toLocaleString()}</td>
                <td className="p-3 text-right">₹{it.creditAmount.toLocaleString()}</td>
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

export default JournalEntriesList;
