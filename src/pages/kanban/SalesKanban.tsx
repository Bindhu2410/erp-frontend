import React, { useState } from "react";
import KanbanBoard from "../../components/kanban/KanbanBoard";
import { FiFilter as Filter } from "react-icons/fi";
import { CiSliderHorizontal as SlidersHorizontal } from "react-icons/ci";
import { FaPlus as Plus, FaSearch as Search } from "react-icons/fa";
import { initialSalesData } from "../../components/models/Data";
const SalesKanban: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Sales Pipeline
            </h1>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Plus size={16} className="mr-1" />
              <span>New Deal</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5 w-64">
          <Search size={16} className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search deals..."
            className="bg-transparent border-none p-0 text-sm outline-none flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Filter size={16} className="mr-1" />
            <span>Filter</span>
          </button>
          <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <SlidersHorizontal size={16} className="mr-1" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard initialData={initialSalesData} />
      </div>
    </div>
  );
};

export default SalesKanban;
