import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type Account = { id:string; code:string; name:string; type:string; balance:number };
const sampleData: Account[] = Array.from({length:50}).map((_,i)=>({id:`ACC-${i+1}`, code:`${1000+i}`, name:`Account ${i+1}`, type: ['Asset','Liability','Equity','Revenue','Expense'][i%5], balance: Math.round((Math.random()-0.5)*100000)}));
const PAGE_SIZE=12;
const ChartOfAccountsList: React.FC = ()=>{
  const navigate=useNavigate();
  const [items,setItems]=useState<Account[]>([]);
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  useEffect(()=>setItems(sampleData),[]);
  const filtered = useMemo(()=> items.filter(a=> a.code.includes(search)|| a.name.toLowerCase().includes(search.toLowerCase())|| a.type.toLowerCase().includes(search.toLowerCase())), [items,search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length/PAGE_SIZE));
  const pageItems=filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  useEffect(()=>{ if(page>totalPages) setPage(totalPages); },[totalPages]);
  const exportCSV=()=>{ const headers=['Code','Name','Type','Balance']; const rows=filtered.map(r=>[r.code,r.name,r.type,String(r.balance)]); const csv=[headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const u=URL.createObjectURL(b); const a=document.createElement('a'); a.href=u; a.download='chart-of-accounts.csv'; a.click(); URL.revokeObjectURL(u); };
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div><h1 className="text-2xl font-bold">Chart of Accounts</h1><p className="text-sm text-gray-600">Manage account master list</p></div>
        <div><button onClick={()=>navigate('/accounts/chart-of-accounts/new')} className="px-4 py-2 bg-blue-600 text-white rounded">New Account</button></div>
      </div>
      <div className="bg-white p-4 rounded shadow mb-4"><div className="flex gap-2 items-center"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search code or name" className="px-3 py-2 border rounded w-64" /><button onClick={exportCSV} className="px-3 py-2 bg-green-600 text-white rounded">Export CSV</button></div></div>
      <div className="bg-white rounded shadow overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr><th className="p-3">Code</th><th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3 text-right">Balance</th></tr></thead><tbody>{pageItems.map(a=>(<tr key={a.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>navigate(`/accounts/chart-of-accounts/${a.id}`)}><td className="p-3 font-medium">{a.code}</td><td className="p-3">{a.name}</td><td className="p-3">{a.type}</td><td className="p-3 text-right">₹{a.balance.toLocaleString()}</td></tr>))}</tbody></table></div>
      <div className="flex items-center justify-between mt-4"><div className="text-sm text-gray-600">Showing {(page-1)*PAGE_SIZE+1} - {Math.min(page*PAGE_SIZE, filtered.length)} of {filtered.length}</div><div className="flex items-center gap-2"><button className="px-3 py-1 border rounded" onClick={()=>setPage(1)} disabled={page===1}>First</button><button className="px-3 py-1 border rounded" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</button><div className="px-3 py-1">Page {page}/{totalPages}</div><button className="px-3 py-1 border rounded" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Next</button><button className="px-3 py-1 border rounded" onClick={()=>setPage(totalPages)} disabled={page===totalPages}>Last</button></div></div>
    </div>
  );
};
export default ChartOfAccountsList;
