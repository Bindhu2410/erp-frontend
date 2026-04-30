import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type AR = {
  id: string;
  invoiceNumber: string;
  customerName: string;
  dueDate: string;
  amountDue: number;
};

const sampleData: AR[] = Array.from({ length: 40 }).map((_, i) => ({
  id: `AR-${i+1}`,
  invoiceNumber: `INV-2026-${String(i+1).padStart(3,'0')}`,
  customerName: ['ABC Hospital','XYZ Clinic','CarePlus'][i%3],
  dueDate: new Date(Date.now() + (15 - i) * 86400000).toISOString().slice(0,10),
  amountDue: Math.round(2000 + Math.random()*50000),
}));

const PAGE_SIZE = 10;

const AccountsReceivableList: React.FC = () => {
  const navigate = useNavigate();
  const [items,setItems] = useState<AR[]>([]);
  const [search,setSearch] = useState("");
  const [page,setPage] = useState(1);

  useEffect(()=> setItems(sampleData), []);
  const filtered = useMemo(()=> items.filter(i=> i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || i.customerName.toLowerCase().includes(search.toLowerCase())), [items,search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ if(page>totalPages) setPage(totalPages); }, [totalPages]);

  const exportCSV = ()=>{
    const headers=['Invoice #','Customer','Due','Amount Due'];
    const rows = filtered.map(r=>[r.invoiceNumber,r.customerName,r.dueDate,String(r.amountDue)]);
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='accounts-receivable.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Accounts Receivable</h1>
          <p className="text-sm text-gray-600">AR aging and open invoices</p>
        </div>
        <div>
          <button onClick={()=>navigate('/accounts/accounts-receivable/export')} className="px-4 py-2 bg-green-600 text-white rounded" onClickCapture={exportCSV}>Export</button>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customer or invoice" className="px-3 py-2 border rounded w-64" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b"><tr><th className="p-3">Invoice #</th><th className="p-3">Customer</th><th className="p-3">Due Date</th><th className="p-3 text-right">Amount Due</th></tr></thead>
          <tbody>
            {pageItems.map(it=> (
              <tr key={it.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/accounts/accounts-receivable/${it.id}`)}>
                <td className="p-3 font-medium">{it.invoiceNumber}</td>
                <td className="p-3">{it.customerName}</td>
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

export default AccountsReceivableList;
