import React, { useState, useEffect } from "react";
import DropDown from "../../components/common/DropDown";
import InputField from "../../components/common/InputField";

interface PurchaseBillForm {
  location: string;
  docId: string;
  docDate: string;
  refNo: string;
  refDate: string;
  party: string;
  currencyType: string;
  purchaseType: string;
  template: string;
}

interface ItemDetail {
  sNo: number;
  grnNo: string;
  grnDate: string;
  make: string;
  category: string;
  product: string;
  model: string;
  item: string;
  hsnCode: string;
  batchNo: string;
  unit: string;
  pending: number;
  phillQty: number;
  rate: number;
  euro: number;
  amount: number;
  disper: number;
  disValue: number;
  taxper: number;
  taxValue: number;
  incTaxRate: number;
  warrantyYear: string;
  warrantySDate: string;
  warrantyEDate: string;
}

interface AdditionDeduction {
  amount: number;
  disper: number;
  disValue: number;
  taxper: number;
  taxValue: number;
  incTaxRate: number;
  warrantyYear: string;
  warrantySDate: string;
  warrantyEDate: string;
}

const Icon = ({ d }: { d: string }) => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

const formFields = [
  {
    name: "location",
    type: "dropdown",
    required: true,
    options: [{ value: "STORE", label: "STORE" }],
  },
  {
    name: "template",
    type: "dropdown",
    required: true,
    options: [{ value: "template1", label: "Template 1" }],
  },
  { name: "docId", type: "text", required: true },
  { name: "docDate", type: "date", required: true },
  { name: "refNo", type: "text" },
  { name: "refDate", type: "date" },
  {
    name: "party",
    type: "dropdown",
    required: true,
    options: [{ value: "party1", label: "Party 1" }],
  },
  {
    name: "currencyType",
    type: "dropdown",
    required: true,
    options: [
      { value: "INR", label: "INR" },
      { value: "USD", label: "USD" },
    ],
  },
  {
    name: "purchaseType",
    type: "dropdown",
    required: true,
    options: [
      { value: "local", label: "Local" },
      { value: "import", label: "Import" },
    ],
  },
];

const tableColumns = [
  { header: "S No", width: "60px" },
  { header: "GRN NO.", width: "120px" },
  { header: "GRN Date", width: "120px" },
  { header: "Make", width: "120px" },
  { header: "Category", width: "120px" },
  { header: "Product", width: "120px" },
  { header: "Model", width: "120px" },
  { header: "Item", width: "120px" },
  { header: "HSN Code", width: "100px" },
  { header: "Batch No", width: "100px" },
  { header: "Unit", width: "80px" },
  { header: "Pending", width: "100px" },
  { header: "Phill. Qty", width: "100px" },
  { header: "Rate", width: "120px" },
  { header: "Euro", width: "100px" },
  { header: "Amount", width: "120px" },
  { header: "Disper", width: "100px" },
  { header: "Dis. Value", width: "120px" },
  { header: "Taxper", width: "100px" },
  { header: "Tax value", width: "120px" },
  { header: "Inc. Tax Rate", width: "120px" },
  { header: "Warranty Year", width: "120px" },
  { header: "Warranty S.Date", width: "140px" },
  { header: "Warranty E.Date", width: "140px" },
];

const PurchaseBill: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "itemDetail" | "additionDeduction"
  >("itemDetail");

  const [formData, setFormData] = useState<PurchaseBillForm>({
    location: "",
    docId: "",
    docDate: "",
    refNo: "",
    refDate: "",
    party: "",
    currencyType: "",
    purchaseType: "",
    template: "",
  });

  const [itemDetails, setItemDetails] = useState<ItemDetail[]>([]);

  const [additionDeduction, setAdditionDeduction] = useState<AdditionDeduction>(
    {
      amount: 0,
      disper: 0,
      disValue: 0,
      taxper: 0,
      taxValue: 0,
      incTaxRate: 0,
      warrantyYear: "",
      warrantySDate: "",
      warrantyEDate: "",
    }
  );

  const handleFormChange = (field: keyof PurchaseBillForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addNewRow = () => {
    setItemDetails((prev) => [
      ...prev,
      {
        sNo: prev.length + 1,
        grnNo: "",
        grnDate: "",
        make: "",
        category: "",
        product: "",
        model: "",
        item: "",
        hsnCode: "",
        batchNo: "",
        unit: "",
        pending: 0,
        phillQty: 0,
        rate: 0,
        euro: 0,
        amount: 0,
        disper: 0,
        disValue: 0,
        taxper: 0,
        taxValue: 0,
        incTaxRate: 0,
        warrantyYear: "",
        warrantySDate: "",
        warrantyEDate: "",
      },
    ]);
  };

  const calculateAmount = (qty: number, rate: number) => {
    return qty * rate;
  };

  const calculateDisValue = (amount: number, disper: number) => {
    return (amount * disper) / 100;
  };

  const calculateTaxValue = (
    amount: number,
    disValue: number,
    taxper: number
  ) => {
    const amountAfterDiscount = amount - disValue;
    return (amountAfterDiscount * taxper) / 100;
  };

  const calculateIncTaxRate = (
    amount: number,
    disValue: number,
    taxValue: number
  ) => {
    const totalAmount = amount - disValue + taxValue;
    return totalAmount;
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemDetail,
    value: string | number
  ) => {
    setItemDetails((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updatedItem = { ...item, [field]: value };

        // Auto-calculate amount when quantity or rate changes
        if (field === "phillQty" || field === "rate") {
          updatedItem.amount = calculateAmount(
            updatedItem.phillQty,
            updatedItem.rate
          );
        }

        // Auto-calculate discount value when amount or discount percentage changes
        if (field === "amount" || field === "disper") {
          updatedItem.disValue = calculateDisValue(
            updatedItem.amount,
            updatedItem.disper
          );
        }

        // Auto-calculate tax value when relevant fields change
        if (field === "amount" || field === "disValue" || field === "taxper") {
          updatedItem.taxValue = calculateTaxValue(
            updatedItem.amount,
            updatedItem.disValue,
            updatedItem.taxper
          );
        }

        // Auto-calculate inclusive tax rate
        if (
          field === "amount" ||
          field === "disValue" ||
          field === "taxValue"
        ) {
          updatedItem.incTaxRate = calculateIncTaxRate(
            updatedItem.amount,
            updatedItem.disValue,
            updatedItem.taxValue
          );
        }

        return updatedItem;
      })
    );
  };

  useEffect(() => {
    if (itemDetails.length === 0) addNewRow();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            Purchase Bill
          </h1>
          <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
            New Entry
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Document Details
          </h2>
          <div className="ml-4 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
            Required Fields <span className="text-red-500">*</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {formFields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              {field.type === "dropdown" ? (
                <DropDown
                  Options={field.options || []}
                  FieldName={`${field.name
                    .charAt(0)
                    .toUpperCase()}${field.name.slice(1)}`}
                  IdName={field.name}
                  values={formData[field.name as keyof PurchaseBillForm]}
                  handleOptionChange={(_, value) =>
                    handleFormChange(
                      field.name as keyof PurchaseBillForm,
                      value
                    )
                  }
                  required={field.required}
                />
              ) : (
                <InputField
                  Type={field.type}
                  FieldName={`${field.name.charAt(0).toUpperCase()}${field.name
                    .slice(1)
                    .replace(/([A-Z])/g, " $1")}
                  `}
                  IdName={field.name}
                  Name={field.name}
                  value={formData[field.name as keyof PurchaseBillForm]}
                  handleInputChange={(_, value) =>
                    handleFormChange(
                      field.name as keyof PurchaseBillForm,
                      value
                    )
                  }
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-4 border-b-2 font-medium flex items-center gap-2 transition-colors duration-150
                ${
                  activeTab === "itemDetail"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("itemDetail")}
            >
              <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              Item Detail
            </button>
            <button
              className={`px-6 py-4 border-b-2 font-medium flex items-center gap-2 transition-colors duration-150
                ${
                  activeTab === "additionDeduction"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              onClick={() => setActiveTab("additionDeduction")}
            >
              <Icon d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              Addition Deduction
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "itemDetail" ? (
          <>
            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column.header}
                        className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        style={{ minWidth: column.width }}
                      >
                        {column.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {itemDetails.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500">
                        {item.sNo}
                      </td>
                      {[
                        { name: "grnNo", type: "text", editable: true },
                        { name: "grnDate", type: "date", editable: true },
                        { name: "make", type: "text", editable: true },
                        { name: "category", type: "text", editable: true },
                        { name: "product", type: "text", editable: true },
                        { name: "model", type: "text", editable: true },
                        { name: "item", type: "text", editable: true },
                        { name: "hsnCode", type: "text", editable: true },
                        { name: "batchNo", type: "text", editable: true },
                        { name: "unit", type: "text", editable: true },
                        { name: "pending", type: "number", editable: true },
                        { name: "phillQty", type: "number", editable: true },
                        { name: "rate", type: "number", editable: true },
                        { name: "euro", type: "number", editable: true },
                        { name: "amount", type: "number", editable: false },
                        { name: "disper", type: "number", editable: true },
                        { name: "disValue", type: "number", editable: false },
                        { name: "taxper", type: "number", editable: true },
                        { name: "taxValue", type: "number", editable: false },
                        { name: "incTaxRate", type: "number", editable: false },
                        { name: "warrantyYear", type: "text", editable: true },
                        { name: "warrantySDate", type: "date", editable: true },
                        { name: "warrantyEDate", type: "date", editable: true },
                      ].map((field) => (
                        <td
                          key={field.name}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <input
                            type={field.type}
                            className={`w-full min-w-[100px] px-2 py-1 text-sm border rounded 
                              ${
                                field.editable
                                  ? "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            value={
                              field.type === "number"
                                ? Number(
                                    item[field.name as keyof ItemDetail] || 0
                                  ).toFixed(2)
                                : String(
                                    item[field.name as keyof ItemDetail] || ""
                                  )
                            }
                            onChange={(e) =>
                              field.editable &&
                              handleItemChange(
                                index,
                                field.name as keyof ItemDetail,
                                field.type === "number"
                                  ? Number(e.target.value) || 0
                                  : e.target.value
                              )
                            }
                            readOnly={!field.editable}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t">
              <button
                onClick={addNewRow}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Row
              </button>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.amount}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount %
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.disper}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      disper: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.disValue}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      disValue: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax %
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.taxper}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      taxper: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Value
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.taxValue}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      taxValue: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inc Tax Rate
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.incTaxRate}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      incTaxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Year
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.warrantyYear}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      warrantyYear: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty Start Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.warrantySDate}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      warrantySDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty End Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={additionDeduction.warrantyEDate}
                  onChange={(e) =>
                    setAdditionDeduction({
                      ...additionDeduction,
                      warrantyEDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Financial Details
          </h2>
          <div className="ml-4 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
            Auto-calculated
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {["Gross Amount", "Net Amount", "Final Amount"].map((label) => (
              <div key={label}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">₹</span>
                  </div>
                  <input
                    type="number"
                    className="block w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium"
                    disabled
                    value="0.00"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Amount In Words
              </label>
              <input
                type="text"
                className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                disabled
                value="Zero Rupees Only"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Narration
              </label>
              <textarea
                rows={4}
                className="block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Enter any additional notes or comments..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all duration-200 flex items-center gap-2"
          onClick={() => {
            // Add cancel logic here
          }}
        >
          <Icon d="M6 18L18 6M6 6l12 12" />
          Cancel
        </button>
        <button
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-all duration-200 flex items-center gap-2 shadow-sm"
          onClick={() => {
            // Add save logic here
          }}
        >
          <Icon d="M5 13l4 4L19 7" />
          Save
        </button>
      </div>
    </div>
  );
};

export default PurchaseBill;
