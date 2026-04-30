import React from "react";
import Modal from "./Modal";
import PriceTierComponent from "./PriceTierComponent";

interface EditPriceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  item: any | null;
  basePrice: number | "";
  enableTieredPricing: boolean;
  priceTiers: any[];
  onBasePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTieredPricingToggle: () => void;
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onUpdateTier: (index: number, field: keyof any, value: number | null) => void;
}

const EditPriceItemModal: React.FC<EditPriceItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  basePrice,
  enableTieredPricing,
  priceTiers,
  onBasePriceChange,
  onTieredPricingToggle,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
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
        type="submit"
        form="editPriceListItemForm"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Save Changes
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Edit Product Price"
      onClose={onClose}
      footer={footer}
    >
      <form id="editPriceListItemForm" onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">SKU:</p>
            <p className="text-gray-800">{item.sku}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">
              Product Name:
            </p>
            <p className="text-gray-800">{item.name}</p>
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="editBasePrice"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Base Price (INR)
          </label>
          <input
            type="number"
            id="editBasePrice"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            min="0"
            step="0.01"
            required
            value={basePrice}
            onChange={onBasePriceChange}
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            type="checkbox"
            id="editEnableTieredPricing"
            checked={enableTieredPricing}
            onChange={onTieredPricingToggle}
          />
          <label
            className="ml-2 text-sm font-medium text-gray-600"
            htmlFor="editEnableTieredPricing"
          >
            Enable Quantity-Based Tiered Pricing
          </label>
        </div>

        {enableTieredPricing && (
          <PriceTierComponent
            tiers={priceTiers}
            onAdd={onAddTier}
            onRemove={onRemoveTier}
            onUpdate={onUpdateTier}
          />
        )}
      </form>
    </Modal>
  );
};

export default EditPriceItemModal;
