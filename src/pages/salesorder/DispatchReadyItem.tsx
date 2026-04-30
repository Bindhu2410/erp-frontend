import React, { useState, useEffect } from "react";
import { LuTruck as Truck } from "react-icons/lu";

interface DispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  fulfillment: Array<{
    product: string;
    ready: number;
  }>;
  onConfirm: (
    dispatchedItems: Array<{ product: string; quantity: number }>
  ) => void;
}

const DispatchReadyItemsModal: React.FC<DispatchModalProps> = ({
  isOpen,
  onClose,
  fulfillment,
  onConfirm,
}) => {
  const [dispatchItems, setDispatchItems] = useState<
    Array<{
      product: string;
      maxReady: number;
      quantity: number;
      selected: boolean;
    }>
  >([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize dispatch items when modal opens
      const items = fulfillment
        .filter((item) => item.ready > 0)
        .map((item) => ({
          product: item.product,
          maxReady: item.ready,
          quantity: 0,
          selected: false,
        }));
      setDispatchItems(items);
    }
  }, [isOpen, fulfillment]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const updated = [...dispatchItems];
    updated[index] = {
      ...updated[index],
      selected: checked,
      quantity: checked
        ? Math.min(updated[index].quantity || 0, updated[index].maxReady)
        : 0,
    };
    setDispatchItems(updated);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...dispatchItems];
    const clampedValue = Math.min(Math.max(value, 0), updated[index].maxReady);
    updated[index] = {
      ...updated[index],
      quantity: clampedValue,
    };
    setDispatchItems(updated);
  };

  const handleSubmit = () => {
    const dispatchedItems = dispatchItems
      .filter((item) => item.selected && item.quantity > 0)
      .map(({ product, quantity }) => ({ product, quantity }));

    onConfirm(dispatchedItems);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Dispatch Ready Items
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {dispatchItems.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium">{item.product}</div>
                <div className="text-sm text-gray-500">
                  Available: {item.maxReady}
                </div>
              </div>
              <input
                type="number"
                min="0"
                max={item.maxReady}
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(index, parseInt(e.target.value))
                }
                disabled={!item.selected}
                className="w-24 px-3 py-2 border rounded-md disabled:opacity-50"
              />
            </div>
          ))}
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchReadyItemsModal;
