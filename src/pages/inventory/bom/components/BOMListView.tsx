import React from "react";

import { BOMType } from "./BOMProductDetail";

export type BOMListViewProps = {
  bomList: BOMType[];
  selectedIndex: number | null;
  onSelect: (idx: number) => void;
};

const BOMListView: React.FC<BOMListViewProps> = ({
  bomList,
  selectedIndex,
  onSelect,
}) => (
  <div className="mb-6">
    <h3 className="font-semibold mb-2">List View</h3>
    <div className="border rounded bg-gray-50 p-2 max-h-40 overflow-y-auto">
      {bomList.length === 0 && (
        <div className="text-gray-400">No BOMs found.</div>
      )}
      {bomList.map((bom, idx) => (
        <div
          key={bom.bomId + idx}
          className={`cursor-pointer px-2 py-1 rounded flex items-center justify-between ${
            selectedIndex === idx ? "bg-blue-100" : "hover:bg-gray-200"
          }`}
          onClick={() => onSelect(idx)}
        >
          <div className="flex-1">
            <span className="font-bold mr-2">{bom.bomId}</span>
            <span className="text-blue-700 font-semibold">{bom.bomName}</span>
            <div className="text-sm text-gray-600">
              <span className="mr-4">Type: {bom.bomType}</span>
              <span className="mr-4">Make: {bom.make}</span>
              <span>
                Valid: {bom.effectiveFrom} - {bom.effectiveTo}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default BOMListView;
