import React from "react";

import { PurchaseOrderItem } from "../../types/purchaseOrder";

interface PurchaseItemsTableProps {
  items: PurchaseOrderItem[];
  showSNo?: boolean;
  className?: string;
}

const PurchaseItemsTable: React.FC<PurchaseItemsTableProps> = ({
  items,
  showSNo = true,
  className = "",
}) => {
  // Function to safely handle undefined fields
  const getItemDisplayName = (item: PurchaseOrderItem) => {
    const parts = [];
    if (item.itemName) parts.push(item.itemName);
    if (item.make || item.model) {
      parts.push(`${[item.make, item.model].filter(Boolean).join(" - ")}`);
    }
    return parts.length > 0 ? parts : [`Item ${item.ItemId}`];
  };
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.Quantity || 0) * (item.unitPrice || 0),
    0
  );

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showSNo && (
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                S.No
              </th>
            )}
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Item Details
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Quantity
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              UOM
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Unit Price
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Total Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => {
            const rowTotal = (item.Quantity || 0) * (item.unitPrice || 0);
            return (
              <tr key={index} className="hover:bg-gray-50">
                {showSNo && (
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                )}
                <td className="px-4 py-3">
                  {getItemDisplayName(item).map((line, i) => (
                    <div
                      key={i}
                      className={
                        i === 0
                          ? "text-sm text-gray-900"
                          : "text-sm text-gray-500"
                      }
                    >
                      {line}
                    </div>
                  ))}
                  <div className="text-xs text-gray-500">
                    Item ID: {item.ItemId}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                  {item.Quantity}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {item.uomName}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-900">
                  {item.unitPrice
                    ? `₹${item.unitPrice.toLocaleString("en-IN")}`
                    : "N/A"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  {rowTotal > 0
                    ? `₹${rowTotal.toLocaleString("en-IN")}`
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td
              colSpan={showSNo ? 5 : 4}
              className="px-4 py-3 text-right text-sm font-medium text-gray-500"
            >
              Total Amount:
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-base font-semibold text-green-600">
              ₹{totalAmount.toLocaleString("en-IN")}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PurchaseItemsTable;
