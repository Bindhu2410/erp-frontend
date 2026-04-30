import React from "react";
import Modal from "./Modal";

interface RemovePriceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any | null;
  onConfirmRemove: () => void;
}

const RemovePriceItemModal: React.FC<RemovePriceItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onConfirmRemove,
}) => {
  if (!item) return null;

  const footer = (
    <>
      <button
        type="button"
        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        type="button"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        onClick={onConfirmRemove}
      >
        Remove
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Remove Product from Price List"
      onClose={onClose}
      footer={footer}
      maxWidth="max-w-md"
    >
      <p className="mb-4">
        Are you sure you want to remove this product from the price list?
      </p>
      <p className="mb-2">
        <strong>SKU:</strong> {item.sku}
      </p>
      <p>
        <strong>Product:</strong> {item.name}
      </p>
    </Modal>
  );
};

export default RemovePriceItemModal;
