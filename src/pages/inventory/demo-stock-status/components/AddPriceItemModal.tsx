import React from "react";
import Modal from "./Modal";
import PriceTierComponent from "./PriceTierComponent";

interface AddPriceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  availableProducts: any[];
  basePrice: number | "";
  selectedProductId: string;
  enableTieredPricing: boolean;
  priceTiers: any[];
  onProductChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBasePriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTieredPricingToggle: () => void;
  onAddTier: () => void;
  onRemoveTier: (index: number) => void;
  onUpdateTier: (index: number, field: keyof any, value: number | null) => void;
}

const AddPriceItemModal: React.FC<AddPriceItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableProducts,
  basePrice,
  selectedProductId,
  enableTieredPricing,
  priceTiers,
  onProductChange,
  onBasePriceChange,
  onTieredPricingToggle,
  onAddTier,
  onRemoveTier,
  onUpdateTier,
}) => {
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
        form="addPriceListItemForm"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Add to Price List
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Add Product to Price List"
      onClose={onClose}
      footer={footer}
    >
      <form id="addPriceListItemForm" onSubmit={onSubmit}>
        <div className="mb-4">
          <label
            htmlFor="addProduct"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Select Product
          </label>
          <select
            id="addProduct"
            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            required
            value={selectedProductId}
            onChange={onProductChange}
          >
            <option value="" disabled>
              Choose a product...
            </option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.sku}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="addBasePrice"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Base Price (INR)
          </label>
          <input
            type="number"
            id="addBasePrice"
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
            id="enableTieredPricing"
            checked={enableTieredPricing}
            onChange={onTieredPricingToggle}
          />
          <label
            className="ml-2 text-sm font-medium text-gray-600"
            htmlFor="enableTieredPricing"
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

export default AddPriceItemModal;
