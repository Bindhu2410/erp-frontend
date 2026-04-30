import React, { useState, useRef, useEffect } from "react";

export interface SearchDropdownOption {
  label: string;
  value: string;
}

interface SearchDropdownProps {
  options: SearchDropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
  id?: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  disabled = false,
  error,
  id,
}) => {
  const selected = options.find((opt) => opt.value === value);
  const [inputText, setInputText] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep input text in sync with external value changes
  useEffect(() => {
    if (!open) {
      setInputText(selected?.label ?? "");
    }
  }, [value, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(inputText.toLowerCase()) ||
      opt.value.toLowerCase().includes(inputText.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        // Restore label if input was partially typed but no new selection made
        setInputText(selected?.label ?? "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setInputText("");
      setOpen(true);
    }
  };

  const handleSelect = (opt: SearchDropdownOption) => {
    onChange(opt.value);
    setInputText(opt.label);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setInputText("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleChevronClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    if (open) {
      setOpen(false);
      setInputText(selected?.label ?? "");
    } else {
      setInputText("");
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setInputText(selected?.label ?? "");
    } else if (e.key === "Tab") {
      setOpen(false);
      setInputText(selected?.label ?? "");
    }
  };

  const inputClass = [
    "flex-1 min-w-0 text-sm outline-none bg-transparent",
    disabled ? "cursor-not-allowed text-gray-400" : "text-gray-900",
    !open && !value ? "placeholder-gray-400" : "",
  ].join(" ");

  const wrapperClass = [
    "flex items-center w-full border rounded px-3 py-2 bg-white text-sm transition-colors",
    disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : "",
    open
      ? "border-blue-500 ring-2 ring-blue-100"
      : error
      ? "border-red-400"
      : "border-gray-300 hover:border-gray-400",
  ].join(" ");

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Combobox input */}
      <div className={wrapperClass}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id ?? "search-dropdown"}-listbox`}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={inputText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className={inputClass}
        />
        {/* Clear button — only when a value is selected */}
        {value && !disabled && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 mr-1 text-base leading-none"
            tabIndex={-1}
            aria-label="Clear"
          >
            ×
          </button>
        )}
        {/* Chevron toggle */}
        <button
          type="button"
          onMouseDown={handleChevronClick}
          disabled={disabled}
          tabIndex={-1}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          aria-label="Toggle dropdown"
        >
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Options list */}
      {open && (
        <ul
          id={`${id ?? "search-dropdown"}-listbox`}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto py-1"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400 text-center">No results found</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Error message */}
      {error && (
        <div className="text-red-600 text-xs mt-1 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
