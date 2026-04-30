import React from "react";
import { Product } from "../../types/product";

interface QuotationTotalProps {
  products: any[];
}

const QuotationTotal: React.FC<QuotationTotalProps> = ({ products }) => {
  const subTotal = products.reduce((sum, product) => sum + product.amount, 0);
  const discount = subTotal * 0.1; // 10% discount
  const gst = subTotal * 0.09; // 9% GST
  const freightCharges = 12.99; // Fixed amount
  const grandTotal = subTotal - discount + gst + freightCharges;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Order Summary
      </h3>
      <div className="space-y-4">
        {/* Cost Breakdown Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">
              ₹{subTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 text-red-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Discount (10%)
            </span>
            <span className="font-medium">
              -₹{discount.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 text-emerald-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              GST (9%)
            </span>
            <span className="font-medium">₹{gst.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between items-center py-2 text-blue-600">
            <span className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Freight Charges
            </span>
            <span className="font-medium">₹{freightCharges.toFixed(2)}</span>
          </div>
        </div>

        {/* Grand Total Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Grand Total</span>
            <div className="text-right">
              <span className="block text-2xl font-bold text-blue-600">
                ₹
                {grandTotal.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-sm text-gray-500">Including GST</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationTotal;
