import React, { useState, useEffect } from "react";
import api from "../../services/api";

type IssueItem = {
  sNo?: number | string;
  docId?: string;
  issueTo?: string;
  locationId?: string;
  status?: string;
  partyName?: string;
  partyBranch?: string;
  salesMan?: string;
  goodsConsignFrom?: string;
  goodsConsignTo?: string;
  deliveredBy?: string;
  bookingAddress?: string;
  bookingQty?: string | number;
  appValue?: string | number;
  receivedOn?: string;
  bomName?: string;
  demoFrom?: string;
  demoReport?: string;
  demoRequest?: string;
  demoRemarks?: string;
  make?: string;
  category?: string;
  product?: string;
  model?: string;
  item?: string;
  equIns?: string;
  equlIns?: string;
  batchNo?: string;
  receiptNo?: string;
  unit?: string;
  qtyAvl?: string | number;
  qty?: string | number;
  rate?: string | number;
  amount?: string | number;
  isParent?: boolean;
};

const IssuesScreen: React.FC = () => {
  const [items, setItems] = useState<IssueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api.getIssues()
      .then(res => {
        // Support both array and single object API responses
        let issuesArr = [];
        if (Array.isArray(res.data)) {
          issuesArr = res.data;
        } else if (res.data && typeof res.data === 'object' && (res.data as any).issue) {
          issuesArr = [res.data];
        }

        // For each issue, add a parent row and then child rows for each issueItem
        const allItems: IssueItem[] = [];
        issuesArr.forEach((row: any, idx) => {
          // Robust mapping: handle both nested and flattened structures
          const issue = row.issue || row;
          const id = issue.id || row.id || idx + 1;

          // Parent row (main issue)
          allItems.push({
            sNo: idx + 1,
            docId: issue.docId || row.docId || `#${id}`,
            issueTo: issue.issueTo || row.issueTo,
            locationId: issue.locationId || row.locationId,
            status: issue.status || row.status,
            partyName: issue.customerName || row.customerName,
            partyBranch: issue.partyBranch || row.partyBranch,
            salesMan: issue.salesRepresentative || row.salesRepresentative,
            goodsConsignFrom: issue.goodsConsignFrom || row.goodsConsignFrom,
            goodsConsignTo: issue.goodsConsignTo || row.goodsConsignTo,
            deliveredBy: issue.deliveredBy || row.deliveredBy,
            bookingAddress: issue.bookingAddress || row.bookingAddress,
            bookingQty: issue.bookingQty ?? row.bookingQty,
            appValue: issue.appValue ?? row.appValue,
            receivedOn: issue.receivedOn || row.receivedOn,
            bomName: issue.bomName || row.bomName,
            demoFrom: issue.demoFrom || row.demoFrom,
            demoReport: issue.demoReport || row.demoReport,
            demoRequest: issue.demoRequest || row.demoRequest,
            demoRemarks: issue.demoRemarks || row.demoRemarks,
            isParent: true,
          });

          // Child rows (issueItems)
          const itemsList = issue.issueItems || row.issueItems;
          if (Array.isArray(itemsList)) {
            itemsList.forEach((item: any) => {
              allItems.push({
                ...item,
                sNo: '',
                docId: '',
                issueTo: '',
                locationId: '',
                status: '',
                partyName: '',
                partyBranch: '',
                salesMan: '',
                goodsConsignFrom: '',
                goodsConsignTo: '',
                deliveredBy: '',
                bookingAddress: '',
                bookingQty: '',
                appValue: '',
                receivedOn: '',
                bomName: '',
                demoFrom: '',
                demoReport: '',
                demoRequest: '',
                demoRemarks: '',
                isParent: false,
              });
            });
          }
        });
        setItems(allItems);
        setError("");
      })
      .catch(err => {
        console.error("IssuesScreen error:", err);
        setError("Failed to load issues");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow max-w-7xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Issues</h2>
      {loading && <div>Loading issues...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">S No</th>
              <th className="border p-2">Doc Id</th>
              <th className="border p-2">Issue To</th>
              <th className="border p-2">Location Id</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Party Name</th>
              <th className="border p-2">Party Branch</th>
              <th className="border p-2">Sales Man</th>
              <th className="border p-2 text-xs">Goods From</th>
              <th className="border p-2 text-xs">Goods To</th>
              <th className="border p-2">Delivered By</th>
              <th className="border p-2">Booking Qty</th>
              <th className="border p-2">App Value</th>
              <th className="border p-2">Make</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Model</th>
              <th className="border p-2">Item</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Rate</th>
              <th className="border p-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={21} className="text-center py-10">No issue items found.</td>
              </tr>
            )}
            {items.map((item, idx) => (
              <tr key={idx} className={item.isParent ? "font-bold bg-blue-50" : "hover:bg-gray-50 text-sm"}>
                <td className="border p-1 text-center">{item.sNo}</td>
                <td className="border p-1">{item.docId}</td>
                <td className="border p-1">{item.issueTo}</td>
                <td className="border p-1">{item.locationId}</td>
                <td className="border p-1">{item.status}</td>
                <td className="border p-1">{item.partyName}</td>
                <td className="border p-1">{item.partyBranch}</td>
                <td className="border p-1">{item.salesMan}</td>
                <td className="border p-1">{item.goodsConsignFrom}</td>
                <td className="border p-1">{item.goodsConsignTo}</td>
                <td className="border p-1">{item.deliveredBy}</td>
                <td className="border p-1 text-center">{item.bookingQty}</td>
                <td className="border p-1 text-center">{item.appValue}</td>
                <td className="border p-1">{item.make}</td>
                <td className="border p-1">{item.category}</td>
                <td className="border p-1">{item.product}</td>
                <td className="border p-1">{item.model}</td>
                <td className="border p-1">{item.item}</td>
                <td className="border p-1 text-center">{item.qty}</td>
                <td className="border p-1 text-right">{item.rate}</td>
                <td className="border p-1 text-right">{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssuesScreen;
