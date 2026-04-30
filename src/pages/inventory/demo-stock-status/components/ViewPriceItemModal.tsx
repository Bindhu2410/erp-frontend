import React from "react";
import Modal from "./Modal";

import { ProductDetails } from "./types/PriceListTypes";
interface ViewPriceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ProductDetails | null;
  formatPrice: (price: number) => string;
  onEdit: () => void;
}

const ViewPriceItemModal: React.FC<ViewPriceItemModalProps> = ({
  isOpen,
  onClose,
  item,
  formatPrice,
  onEdit,
}) => {
  if (!item) return null;

  const footer = (
    <>
      <button
        type="button"
        className="border border-gray-300 bg-white text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
        onClick={onClose}
      >
        Close
      </button>
      <button
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        onClick={onEdit}
      >
        Edit Price
      </button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      title="View Product Price Details"
      onClose={onClose}
      footer={footer}
    >
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
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">Category:</p>
          <p className="text-gray-800">{item.category}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            Base Price (INR):
          </p>
          <p className="text-gray-800">{formatPrice(item.basePrice)}</p>
        </div>
      </div>

      {item.priceTiers.length > 0 && (
        <div className="mt-6">
          <h6 className="text-gray-700 font-medium mb-3">
            Quantity-Based Price Tiers:
          </h6>
          <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Min Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Max Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Price (INR)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {item.priceTiers.map((tier: any, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tier.minQuantity}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {tier.maxQuantity || "-"}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatPrice(tier.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ViewPriceItemModal;
