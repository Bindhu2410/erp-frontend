import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type AP = {
  id: string;
  billNumber: string;
  supplierName: string;
  dueDate: string;
  amountDue: number;
};

const sampleData: AP[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `AP-${i+1}`,
  billNumber: `BILL-2026-${String(i+1).padStart(3,'0')}`,
  supplierName: ['MediSupplies','LabTech','EquipCo'][i%3],
  dueDate: new Date(Date.now() + (10 - i) * 86400000).toISOString().slice(0,10),
  amountDue: Math.round(2000 + Math.random()*60000),
}));

const PAGE_SIZE = 10;

const AccountsPayableList: React.FC = () => {
  const navigate = useNavigate();
  const [items,setItems] = useState<AP[]>([]);
  const [search,setSearch] = useState("");
  const [page,setPage] = useState(1);

  useEffect(()=> setItems(sampleData), []);
  const filtered = useMemo(()=> items.filter(i=> i.billNumber.toLowerCase().includes(search.toLowerCase()) || i.supplierName.toLowerCase().includes(search.toLowerCase())), [items,search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ if(page>totalPages) setPage(totalPages); }, [totalPages]);

  const exportCSV = ()=>{
    const headers=['Bill #','Supplier','Due','Amount Due'];
    const rows = filtered.map(r=>[r.billNumber,r.supplierName,r.dueDate,String(r.amountDue)]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='accounts-payable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts Payable</h1>
          <p className="text-sm text-gray-600">Open bills and supplier balances</p>
        </div>
        <div>
          <button onClick={()=>exportCSV()} className="px-4 py-2 bg-green-600 text-white rounded">Export</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search supplier or bill" className="px-3 py-2 border rounded w-64" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3">Supplier</th><th className="p-3">Bill #</th><th className="p-3">Due Date</th><th className="p-3 text-right">Amount Due</th></tr></thead>
          <tbody>
            {pageItems.map(it=> (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/accounts/accounts-payable/${it.id}`)}>
                <td className="p-3">{it.supplierName}</td>
                <td className="p-3 font-medium">{it.billNumber}</td>
                <td className="p-3">{it.dueDate}</td>
                <td className="p-3 text-right">₹{it.amountDue.toLocaleString()}</td>
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

export default AccountsPayableList;
