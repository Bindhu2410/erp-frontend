import React, { useEffect } from "react";
import { ModalProps } from "../../types/address";
import { FaTimes } from "react-icons/fa";

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  type = "max",
  title,
  setLeadStatus,
}) => {
  console.log("Modal rendered");
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setLeadStatus?.("Lead");
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-lg relative flex flex-col ${
          type === "sm"
            ? "max-w-2xl"
            : type === "max"
            ? "max-w-7xl"
            : "max-w-4xl"
        } w-full  max-h-[90vh] overflow-y-auto`}
      >
        <div className="bg-white sticky top-0 z-[70] flex items-center justify-between p-4 border-b rounded-t-lg">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight uppercase mx-auto">
            {title || "Modal Title"}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 m-2 bg-gray-200 bg-opacity-80 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 z-[60] shadow-sm"
            aria-label="Close modal"
          >
            <FaTimes className="h-5 w-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        <div
          className={`${
            type === "max" ? "p-0" : type === "sm" ? "px-4" : "p-6"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
