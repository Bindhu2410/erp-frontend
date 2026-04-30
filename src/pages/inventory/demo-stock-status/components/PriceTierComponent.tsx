import React from "react";

interface PriceTierProps {
  tiers: any[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof any, value: number | null) => void;
}
const PriceTierComponent: React.FC<PriceTierProps> = ({
  tiers,
  onAdd,
  onRemove,
  onUpdate,
}) => {
  return (
    <div>
      <h6 className="text-gray-700 font-medium mb-3">
        Quantity-Based Price Tiers
      </h6>

      <div>
        {tiers.map((tier, index) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-3"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-medium text-gray-700">
                Price Tier {index + 1}
              </span>
              <button
                type="button"
                className="text-red-600 hover:bg-red-50 p-1 rounded-md"
                onClick={() => onRemove(index)}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Min Quantity
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={tier.minQuantity}
                  min="2"
                  step="1"
                  required
                  onChange={(e) =>
                    onUpdate(index, "minQuantity", parseInt(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Max Quantity
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={tier.maxQuantity || ""}
                  placeholder="Leave empty for unlimited"
                  min="2"
                  step="1"
                  onChange={(e) =>
                    onUpdate(
                      index,
                      "maxQuantity",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Price (INR)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-md py-2 px-3"
                  value={tier.price}
                  min="0"
                  step="0.01"
                  required
                  onChange={(e) =>
                    onUpdate(index, "price", parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md flex items-center text-sm gap-1 hover:bg-gray-50"
        onClick={onAdd}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add Another Price Tier
      </button>
    </div>
  );
};

export default PriceTierComponent;
