import React from "react";
import { FiTrash2 } from "react-icons/fi";

interface EditableProductRowProps {
  name: string;
  icon: React.ReactNode;
  unitPrice?: number;
  qty?: number;
  uom?: string;
  taxPercentage?: number;
  onQtyChange?: (qty: number) => void;
  showQty?: boolean;
  showUnitPrice?: boolean;
  showUom?: boolean;
  showTax?: boolean;
  showTotal?: boolean;
  onDelete?: () => void;
  totalClass?: string;
  rowClass?: string;
  showDeleteOption?: boolean;
}

const EditableProductRow: React.FC<EditableProductRowProps> = ({
  name,
  icon,
  unitPrice,
  qty,
  uom,
  taxPercentage,
  onQtyChange,
  showQty = true,
  showUnitPrice = true,
  showUom = true,
  showTax = true,
  showTotal = true,
  onDelete,
  totalClass = "",
  rowClass = "",
  showDeleteOption,
}) => {
  const base = (unitPrice || 0) * (qty || 1);
  const tax = (base * (taxPercentage || 0)) / 100;

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center border-b px-4 py-3 md:py-2 gap-2 md:gap-0 ${rowClass}`}
      style={{ minHeight: "40px" }}
    >
      <div className="flex items-center gap-2 w-full md:flex-1 pl-2 md:pl-[68px]">
        {icon}
        <span className="text-gray-800 font-medium md:font-normal">{name}</span>
      </div>
      {showUnitPrice ? (
        <div className="flex w-full md:w-auto md:flex-[0.5] items-center justify-between md:justify-start text-gray-700 pl-8 md:pl-0">
          <span className="md:hidden text-xs text-gray-500">Price:</span>
          <span>{unitPrice}</span>
        </div>
      ) : (
        <div className="hidden md:block flex-[0.5]" />
      )}
      {showQty && onQtyChange ? (
        <div className="flex w-full md:w-auto md:flex-[0.5] items-center justify-between md:justify-start text-gray-700 pl-8 md:pl-0">
          <span className="md:hidden text-xs text-gray-500">Qty:</span>
          <input
            type="number"
            min={1}
            value={qty || 1}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            onChange={(e) => onQtyChange(Math.max(1, Number(e.target.value)))}
          />
        </div>
      ) : (
        <div className="flex-[0.5]" />
      )}
      {showUom ? (
        <div className="flex w-full md:w-auto md:flex-[0.5] items-center justify-between md:justify-start pl-8 md:pl-0">
          <span className="md:hidden text-xs text-gray-500">UOM:</span>
          <span>{uom ? uom : "Nos"}</span>
        </div>
      ) : (
        <div className="hidden md:block flex-[0.5]" />
      )}
      {showTax ? (
        <div className="flex w-full md:w-auto md:flex-[0.5] items-center justify-between md:justify-start text-gray-700 pl-8 md:pl-0">
          <span className="md:hidden text-xs text-gray-500">Tax:</span>
          <span>{taxPercentage || 0}%</span>
        </div>
      ) : (
        <div className="hidden md:block flex-[0.5]" />
      )}
      {showTotal ? (
        <div className={`flex w-full md:w-auto md:flex-[0.5] items-center justify-between md:justify-start text-green-600 font-bold pl-8 md:pl-0 ${totalClass}`}>
          <span className="md:hidden text-xs text-gray-500">Total:</span>
          <span>{(base + tax).toFixed(2)}</span>
        </div>
      ) : (
        <div className="hidden md:block flex-[0.5]" />
      )}
      <div className="flex items-center justify-end w-full md:w-auto md:flex-[0.5] mt-2 md:mt-0">
        {onDelete && showDeleteOption ? (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default EditableProductRow;
