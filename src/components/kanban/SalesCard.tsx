import React, { useState } from "react";
import { SalesCard as SalesCardType } from "../models/Sales";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LuBanknote as Banknote,
  LuMoreVertical as MoreVertical,
} from "react-icons/lu";
import { FaCalendar as Calendar, FaUser as User } from "react-icons/fa";
import { LuFileText as FileText } from "react-icons/lu";
interface SalesCardProps {
  card: SalesCardType;
}

const SalesCard: React.FC<SalesCardProps> = ({ card }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "card",
      card,
    },
  });
  const [showTooltip, setShowTooltip] = useState(false);
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 cursor-grab 
                hover:shadow-md transition-all duration-200 select-none`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">{card.title}</h3>
          <p className="text-xs text-gray-600 mt-1">{card.company}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex items-center mt-3 text-sm">
        <Banknote size={14} className="text-gray-500 mr-1.5" />
        <span className="font-medium text-gray-900">
          {formatCurrency(card.amount)}
        </span>
      </div>

      {card.notes && (
        <div
          className="relative flex items-start mt-3 p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <FileText
            size={14}
            className="text-gray-500 mr-1.5 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-gray-600 line-clamp-2">{card.notes}</p>

          {/* Tooltip */}
          {showTooltip && card.notes && (
            <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-gray-900 text-white rounded-md shadow-lg max-w-xs w-full">
              <p className="text-xs">{card.notes}</p>
              <div className="absolute bottom-0 left-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          {card.avatar ? (
            <img
              src={card.avatar}
              alt={card.contactName}
              className="w-6 h-6 rounded-full mr-2 object-cover"
            />
          ) : (
            <User size={16} className="text-gray-400 mr-2" />
          )}
          <span className="text-xs text-gray-600">{card.contactName}</span>
        </div>

        {card.dueDate && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>{getFormattedDate(card.dueDate)}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(
            card.priority
          )}`}
        >
          {card.priority}
        </span>
        <span className="text-xs text-gray-500">
          Updated {getFormattedDate(card.lastUpdated)}
        </span>
      </div>
    </div>
  );
};

export default SalesCard;
