import React from "react";
import { SalesColumn as SalesColumnType } from "../models/Sales";
import SalesCard from "./SalesCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  FaChevronDown as ChevronDown,
  FaChevronUp as ChevronUp,
  FaPlus as Plus,
} from "react-icons/fa";

interface SalesColumnProps {
  column: SalesColumnType;
  isCollapsed: boolean;
  onToggleCollapse: (columnId: string) => void;
}

const SalesColumn: React.FC<SalesColumnProps> = ({
  column,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const getColumnHeaderClass = (columnId: string) => {
    switch (columnId) {
      case "leads":
        return "bg-blue-50 border-blue-300 text-blue-700";
      case "qualified":
        return "bg-indigo-50 border-indigo-300 text-indigo-700";
      case "proposal":
        return "bg-purple-50 border-purple-300 text-purple-700";
      case "negotiation":
        return "bg-amber-50 border-amber-300 text-amber-700";
      case "closed":
        return "bg-green-50 border-green-300 text-green-700";
      case "lost":
        return "bg-gray-50 border-gray-300 text-gray-700";
      default:
        return "bg-gray-50 border-gray-300 text-gray-700";
    }
  };

  return (
    <div className="flex flex-col bg-gray-50 rounded-lg min-w-[280px] max-w-[280px] h-full">
      <div
        className={`flex items-center justify-between p-3 border-b ${getColumnHeaderClass(
          column.id
        )}`}
      >
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-sm">{column.title}</h3>
          <span className="bg-white bg-opacity-50 text-xs font-medium px-2 py-0.5 rounded-full">
            {column.cards.length}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            onClick={() => onToggleCollapse(column.id)}
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className="flex-1 p-2 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 230px)" }}
        >
          <SortableContext
            items={column.cards.map((card) => card.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <SalesCard key={card.id} card={card} />
            ))}
          </SortableContext>

          {column.cards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 mt-2">
              <p className="text-xs text-center">Drop sales card here</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesColumn;
