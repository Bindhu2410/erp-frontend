import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { IoMdClose } from "react-icons/io";
import { FaSearch, FaChevronDown } from "react-icons/fa";

interface OptionType {
  id: string;
  name: string;
  department?: string;
}

interface MultiSelectWithOtherProps {
  options: OptionType[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder: string;
  otherLabel?: string;
}

const OTHER_OPTION_ID = "__other__";

const MultiSelectWithOther: React.FC<MultiSelectWithOtherProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder,
  otherLabel = "Other",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<OptionType[]>(options);
  const [otherValue, setOtherValue] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filtered = options.filter(
      (option) =>
        String(option.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [searchTerm, options]);

  useEffect(() => {
    if (!selectedIds.includes(OTHER_OPTION_ID)) {
      setOtherValue("");
      setShowOtherInput(false);
    }
  }, [selectedIds]);

  const openDropdown = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setIsOpen(true);
  };

  const handleOptionClick = (id: string) => {
    if (id === OTHER_OPTION_ID) {
      setShowOtherInput(true);
      if (!selectedIds.includes(OTHER_OPTION_ID)) {
        onChange([...selectedIds, OTHER_OPTION_ID]);
      }
    } else {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((sid) => sid !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    }
  };

  const handleOtherValueConfirm = () => {
    if (otherValue.trim()) {
      const newSelected = selectedIds.filter((id) => id !== OTHER_OPTION_ID);
      onChange([...newSelected, otherValue.trim()]);
      setShowOtherInput(false);
      setOtherValue("");
    }
  };

  const dropdown = isOpen
    ? ReactDOM.createPortal(
        <>
          <div
            className="fixed inset-0"
            style={{ zIndex: 99998 }}
            onClick={() => setIsOpen(false)}
          />
          <div
            className="bg-white border border-gray-300 rounded-md shadow-lg"
            style={dropdownStyle}
          >
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
            <div className="max-h-52 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                    selectedIds.includes(option.id) ? "bg-blue-50" : ""
                  }`}
                  onMouseDown={(e) => { e.preventDefault(); handleOptionClick(option.id); }}
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
                      <div className="text-sm text-gray-500">{option.department}</div>
                    )}
                  </div>
                </div>
              ))}
              <div
                className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                  selectedIds.includes(OTHER_OPTION_ID) ? "bg-blue-50" : ""
                }`}
                onMouseDown={(e) => { e.preventDefault(); handleOptionClick(OTHER_OPTION_ID); }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(OTHER_OPTION_ID)}
                  readOnly
                  className="mr-2"
                />
                <div>{otherLabel}</div>
              </div>
              {showOtherInput && (
                <div className="flex items-center p-2">
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                    placeholder="Type your option..."
                    value={otherValue}
                    onChange={(e) => setOtherValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => { if (e.key === "Enter") handleOtherValueConfirm(); }}
                  />
                  <button
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
                    onMouseDown={(e) => { e.preventDefault(); handleOtherValueConfirm(); }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <div className="relative">
      <div
        ref={triggerRef}
        className="min-h-[42px] p-2 border border-gray-300 rounded-md bg-white cursor-pointer flex items-center justify-between"
        onClick={openDropdown}
      >
        <div className="flex-1 flex flex-wrap gap-1">
          {selectedIds.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedIds.map((id) => {
                if (id === OTHER_OPTION_ID) {
                  return (
                    <span key={id} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded">
                      {otherLabel}
                      <button onClick={(e) => { e.stopPropagation(); onChange(selectedIds.filter((sId) => sId !== id)); }} className="ml-1">
                        <IoMdClose size={14} />
                      </button>
                    </span>
                  );
                }
                const option = options.find((o) => o.id === id);
                return (
                  <span key={id} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded">
                    {option ? option.name : id}
                    <button onClick={(e) => { e.stopPropagation(); onChange(selectedIds.filter((sId) => sId !== id)); }} className="ml-1">
                      <IoMdClose size={14} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`} />
      </div>
      {dropdown}
    </div>
  );
};

export default MultiSelectWithOther;
