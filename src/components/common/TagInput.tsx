import React, { useState, KeyboardEvent } from "react";
import { FaTimes } from "react-icons/fa";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder: string;
  label: string;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  setTags,
  placeholder,
  label,
}) => {
  const [input, setInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim() !== "") {
      e.preventDefault();
      // Avoid adding duplicates
      if (!tags.includes(input.trim())) {
        setTags([...tags, input.trim()]);
      }
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col">
      <label className="mb-2">{label}</label>
      <div className="border rounded px-2 py-1 flex flex-wrap gap-2 bg-gray-50">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded px-2 py-1 flex items-center gap-1 text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaTimes size={12} />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          className="outline-none flex-grow min-w-[100px] py-1 bg-gray-50"
        />
      </div>
    </div>
  );
};

export default TagInput;
