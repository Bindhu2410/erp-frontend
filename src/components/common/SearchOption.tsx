import React, { useState } from "react";
import { CiSearch as Search } from "react-icons/ci";
import { IoMdMic as Mic } from "react-icons/io";

interface SearchOptionsProps {
  handleSearch: (term: string) => void;
  placeholder?: string;
}

const SearchOptions: React.FC<SearchOptionsProps> = ({
  handleSearch,
  placeholder = "Search...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  return (
    <div className="flex items-center gap-3 px-3">
      <form
        onSubmit={handleSubmit}
        className="flex items-center w-full max-w-md"
      >
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                     focus:ring-orange-500 focus:border-orange-500 block w-full ps-10 p-2.5
                     dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
          />
          <button
            type="button"
            className="absolute inset-y-0 end-0 flex items-center pe-3"
          >
            <Mic className="w-4 h-4 text-gray-500 hover:text-orange-500 transition-colors cursor-pointer" />
          </button>
        </div>
        <button
          type="submit"
          className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white 
                   bg-orange-500 rounded-lg border border-orange-500 hover:bg-orange-600 
                   focus:ring-4 focus:outline-none focus:ring-orange-300 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchOptions;
