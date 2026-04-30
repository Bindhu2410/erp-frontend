import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { FaSearch, FaChevronDown } from "react-icons/fa";

interface MultiSelectProps {
  options: Array<{ id: string; name: string; department?: string }>;
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);

  useEffect(() => {
    const filtered = options.filter(
      (option) =>
        option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  return (
    <div className="relative">
      <div
        className="min-h-[42px] p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedIds.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedIds.map((id) => {
                const option = options.find((o) => o.id === id);
                return option ? (
                  <span
                    key={id}
                    className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded"
                  >
                    {option.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onChange(selectedIds.filter((sId) => sId !== id));
                      }}
                      className="ml-1"
                    >
                      <IoMdClose size={14} />
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        <FaChevronDown
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <>
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2 border-b">
              <div className="relative">
                <input
                  type="text"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                    selectedIds.includes(option.id) ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    onChange(
                      selectedIds.includes(option.id)
                        ? selectedIds.filter((id) => id !== option.id)
                        : [...selectedIds, option.id]
                    );
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(option.id)}
                    readOnly
                    className="mr-2"
                  />
                  <div>
                    <div>{option.name}</div>
                    {option.department && (
                      <div className="text-sm text-gray-500">
                        {option.department}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default MultiSelect;
