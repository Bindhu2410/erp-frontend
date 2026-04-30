import React from "react";
import ewaybillData from "../../components/json/ewaybill.json";
import Barcode from "react-barcode";

interface EWayBillProps {
  data?: any;
}

const EWayBill: React.FC<EWayBillProps> = ({ data: propData }) => {
  const data = propData || ewaybillData;
  return (
    <div className="bg-white print:bg-white max-w-2xl mx-auto border border-gray-300 rounded-xl shadow-lg print:shadow-none print:border-none p-8 print:p-4 text-gray-900">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-center text-2xl font-extrabold text-gray-800 tracking-wide">
          Part - A Slip
        </h2>
      </div>
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-2 gap-y-2 gap-x-6">
          <div className="font-semibold text-gray-700">Unique No.</div>
          <div className="font-bold text-lg text-gray-900">{data.uniqueNo}</div>
          <div className="font-semibold text-gray-700">Entered Date</div>
          <div>{data.enteredDate}</div>
          <div className="font-semibold text-gray-700">Entered By</div>
          <div className="text-gray-900">{data.enteredBy}</div>
          <div className="font-semibold text-gray-700">Valid From</div>
          <div className="font-bold text-red-600">{data.validFrom}</div>
        </div>
      </div>
      <div className="font-bold text-lg mb-2 text-gray-800">Part - A</div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-6">
        <div className="grid grid-cols-2 gap-y-2 gap-x-6">
          <div className="font-semibold text-gray-700">GSTIN of Supplier</div>
          <div className="text-gray-900">{data.gstinSupplier}</div>
          <div className="font-semibold text-gray-700">Place of Dispatch</div>
          <div className="text-gray-900">{data.placeDispatch}</div>
          <div className="font-semibold text-gray-700">GSTIN of Recipient</div>
          <div className="text-gray-900">{data.gstinRecipient}</div>
          <div className="font-semibold text-gray-700">Place of Delivery</div>
          <div className="text-gray-900">{data.placeDelivery}</div>
          <div className="font-semibold text-gray-700">Document No.</div>
          <div className="text-gray-900">{data.documentNo}</div>
          <div className="font-semibold text-gray-700">Document Date</div>
          <div className="text-gray-900">{data.documentDate}</div>
          <div className="font-semibold text-gray-700">Transaction Type</div>
          <div className="font-bold text-green-700">{data.transactionType}</div>
          <div className="font-semibold text-gray-700">Value of Goods</div>
          <div className="font-bold text-blue-700">{data.valueGoods}</div>
          <div className="font-semibold text-gray-700">HSN Code</div>
          <div className="text-gray-900">{data.hsnCode}</div>
          <div className="font-semibold text-gray-700">
            Reason for Transportation
          </div>
          <div className="font-bold text-gray-900">{data.reasonTransport}</div>
          <div className="font-semibold text-gray-700">Transporter</div>
          <div className="text-gray-900">{data.transporter}</div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-8 mb-4">
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <Barcode
            value={data.barcode}
            width={2}
            height={60}
            fontSize={16}
            displayValue={true}
          />
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-2 border-t pt-2 text-center">
        Note*: If any discrepancy in information please try after sometime.
      </div>
    </div>
  );
};

export default EWayBill;
