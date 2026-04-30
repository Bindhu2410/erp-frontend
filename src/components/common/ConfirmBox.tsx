import React from "react";

type confirmDeleteProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string | number) => void;
  id: string | number;
};
const ConfirmBox: React.FC<confirmDeleteProps> = ({
  title,
  isOpen,
  onClose,
  onDelete,
  id,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative bg-white max-w-md w-full rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center border border-gray-200">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-red-100 rounded-full p-3 mb-3">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Delete Confirmation
          </h2>
          <p className="text-gray-600 text-base">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{title}</span>?
          </p>
        </div>
        <div className="flex justify-center gap-4 mt-2 w-full">
          <button
            className="flex-1 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-400"
            onClick={() => onDelete(id)}
          >
            Delete
          </button>
          <button
            className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold shadow hover:bg-gray-200 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBox;
