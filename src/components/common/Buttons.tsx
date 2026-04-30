import React from "react";
interface InputFieldProps {
  label: string | React.ReactNode;
  type?: string;
  size?: string;
  onClick?: () => void;
}

const Button: React.FC<InputFieldProps> = ({ label, type, size, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };
  return (
    <button
      type="button"
      className={`border-gray-300 py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-400 hover:text-white focus:bg-gray-400  ${
        type === "primary"
          ? `inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-orange-500 rounded-lg border border-orange-500 hover:bg-orange-800 focus:bg-orange-800  focus:ring-4 focus:outline-none focus:ring-orange-300 dark:bg-orange-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"`
          : type === "secondary"
          ? `bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 `
          : type === "tertiary"
          ? `bg-red-500 text-white hover:bg-red-600 focus:bg-green-600 `
          : "border text-black-2"
      }   ${
        size === "small"
          ? `text-xs `
          : size === "medium"
          ? `text-sm`
          : size === "large"
          ? `text-md`
          : "border text-black-2"
      }`}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};

export default Button;
