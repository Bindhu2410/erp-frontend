import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";
import DeliveryNoteTemplate from "../demo/DeliveryNote";

interface Props {
  onClose: () => void;
}

const DeliveryNotePreviewModal: React.FC<Props> = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center" style={{ backgroundColor: "rgba(107,114,128,0.6)" }}>
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-gray-200 my-6 mx-4 flex flex-col" style={{ maxHeight: "calc(100vh - 3rem)" }}>
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700 z-10"
          onClick={onClose}
        >
          <FiX />
        </button>
        <div className="flex-1 overflow-y-auto p-4">
          <DeliveryNoteTemplate />
        </div>
      </div>
    </div>
  );
};

export default DeliveryNotePreviewModal;
