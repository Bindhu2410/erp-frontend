import React from "react";

const TERMS_ORDER = ["Taxes", "Freight Charges", "Delivery", "Payment", "Warranty"];

interface ViewTermsAndConditionsProps {
  data?: Record<string, string>;
}

const ViewTermsAndConditions: React.FC<ViewTermsAndConditionsProps> = ({ data }) => {
  return (
    <div className="w-full mt-4 p-2 mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Terms and Conditions*</h2>
        </div>
        <div className="mt-4 space-y-4">
          {TERMS_ORDER.map((key) => (
            <div key={key} className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">{key}</h3>
              <textarea
                className="w-full p-2 border rounded-md min-h-[100px] bg-gray-50 text-gray-700"
                value={data?.[key] || "N/A"}
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTermsAndConditions;
