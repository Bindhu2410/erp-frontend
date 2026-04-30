import React from "react";
// Sample JSON payment data
interface paymentData {
  subTotal: number;
  discount: number;
  discountPercent: string; // changed from number to string
  tax: number;
  taxPercent: string; // changed from number to string

  freightCharges: number;
  grandTotal: number;
}

const PaymentSummary: React.FC<paymentData> = ({
  subTotal,
  discount,
  discountPercent,
  tax,
  taxPercent,
  freightCharges,
  grandTotal,
}) => {
  // Format currency to USD
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-md mt-2 bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-1">
      <div className="p-6">
        <div className="space-y-4">
          {/* Sub Total */}
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Sub Total:</span>
            <span className="font-medium">{formatCurrency(subTotal)}</span>
          </div>

          {/* Discount Row */}
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Discount ({discountPercent}):</span>
            <span className="font-medium text-green-600">
              -{formatCurrency(discount)}
            </span>
          </div>

          {/* GST Row */}
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">GST ({taxPercent})</span>
            <span className="font-medium">{formatCurrency(tax)}</span>
          </div>

          {/* Coupon */}

          {/* Freight Charges */}
          <div className="flex justify-between border-b pb-3">
            <span className="text-gray-600">Freight Charges:</span>
            <span className="font-medium">
              {formatCurrency(freightCharges)}
            </span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between pt-3">
            <span className="text-lg font-bold">Grand Total:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
