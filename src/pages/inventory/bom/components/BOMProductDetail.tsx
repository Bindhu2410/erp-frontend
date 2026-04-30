import React from "react";

export type BOMProductDetailProps = {
  bom: BOMType | null;
};
/**
 * BOMType represents the structure of a Bill of Materials (BOM).
 */
export type BOMRow = {
  make: string;
  category: string;
  product: string;
  model: string;
  itemId: string;
  qty: number;
  itemRate: number;
};

export type BOMType = {
  bomId: string;
  bomName: string;
  bomType: string;
  make: string;
  quotTitle: string;
  tcTemplate: string;
  effectiveFrom: string;
  effectiveTo: string;
  rows: BOMRow[];
};
const BOMProductDetail: React.FC<BOMProductDetailProps> = ({ bom }) => {
  if (!bom)
    return (
      <div className="text-gray-400">Select a product to view details.</div>
    );
  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <h3 className="text-lg font-bold mb-2 text-blue-700">{bom.bomName}</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="font-semibold">BOM Id:</span> {bom.bomId}
        </div>
        <div>
          <span className="font-semibold">Type:</span> {bom.bomType}
        </div>
        <div>
          <span className="font-semibold">Make:</span> {bom.make}
        </div>
        <div>
          <span className="font-semibold">Quot Title:</span> {bom.quotTitle}
        </div>
        <div>
          <span className="font-semibold">TC Template:</span> {bom.tcTemplate}
        </div>
        <div>
          <span className="font-semibold">Effective From:</span>{" "}
          {bom.effectiveFrom}
        </div>
        <div>
          <span className="font-semibold">Effective To:</span> {bom.effectiveTo}
        </div>
      </div>
      <h4 className="font-semibold mb-2">BOM Items</h4>
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">S No</th>
            <th className="px-2 py-1 border">Make</th>
            <th className="px-2 py-1 border">Category</th>
            <th className="px-2 py-1 border">Product</th>
            <th className="px-2 py-1 border">Model</th>
            <th className="px-2 py-1 border">Item Id</th>
            <th className="px-2 py-1 border">Qty</th>
            <th className="px-2 py-1 border">Item Rate</th>
          </tr>
        </thead>
        <tbody>
          {bom.rows.map((row: any, idx: number) => (
            <tr key={idx}>
              <td className="px-2 py-1 border text-center">{idx + 1}</td>
              <td className="px-2 py-1 border">{row.make}</td>
              <td className="px-2 py-1 border">{row.category}</td>
              <td className="px-2 py-1 border">{row.product}</td>
              <td className="px-2 py-1 border">{row.model}</td>
              <td className="px-2 py-1 border">{row.itemId}</td>
              <td className="px-2 py-1 border">{row.qty}</td>
              <td className="px-2 py-1 border">{row.itemRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BOMProductDetail;
