import React, { useState, useEffect } from "react";
import InputField from "../../components/common/InputField";
import Select from "react-select";

interface PaymentFormProps {
  onClose: () => void;
  onSave?: (data: PaymentData) => Promise<void>;
}

interface PaymentData {
  InvoiceId: string;
  PaymentDate: string;
  DueDate: string;
  PaymentMethod: string;
  AmountPaid: number;
  PaymentStatus: string;
  OutstandingAmount: number;
  TotalAmount: number;
}

const statusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
  { value: "Completed", label: "Completed" },
];

const paymentMethodOptions = [
  { value: "Cash", label: "Cash" },
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Cheque", label: "Cheque" },
];

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentData>({
    InvoiceId: "",
    PaymentDate: "",
    DueDate: "",
    PaymentMethod: "",
    AmountPaid: 0,
    PaymentStatus: "Pending",
    OutstandingAmount: 0,
    TotalAmount: 0,
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  // Additional fields for payment method
  const [chequeNumber, setChequeNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  useEffect(() => {
    // Fetch invoices from API
    const fetchInvoices = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_BASE_URL}/Invoice");
        if (!res.ok) throw new Error("Failed to fetch invoices");
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        setError("Could not load invoices");
      }
    };
    fetchInvoices();
  }, []);
  const handleInputChange = (fieldName: string, value: string) => {
    setPayment((prev) => {
      // If AmountPaid changes, recalculate OutstandingAmount
      if (fieldName === "AmountPaid") {
        const amountPaid = value === "" ? 0 : parseFloat(value) || 0;
        const outstanding = (prev.TotalAmount || 0) - amountPaid;
        return {
          ...prev,
          AmountPaid: amountPaid,
          OutstandingAmount: outstanding >= 0 ? outstanding : 0,
        };
      }
      // If OutstandingAmount or TotalAmount is changed directly
      if (["OutstandingAmount", "TotalAmount"].includes(fieldName)) {
        return {
          ...prev,
          [fieldName]: value === "" ? 0 : parseFloat(value) || 0,
        };
      }
      // If InvoiceId is changed, set TotalAmount from selected invoice and recalc OutstandingAmount
      if (fieldName === "InvoiceId") {
        const selectedInvoice = invoices.find((inv) => inv.invoiceId === value);
        const total = selectedInvoice ? selectedInvoice.totalAmount : 0;
        const outstanding = total - (prev.AmountPaid || 0);
        return {
          ...prev,
          InvoiceId: value,
          TotalAmount: total,
          OutstandingAmount: outstanding >= 0 ? outstanding : 0,
        };
      }
      return {
        ...prev,
        [fieldName]: value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Ensure number fields are numbers in the payload
      const payload = {
        ...payment,
        AmountPaid: Number(payment.AmountPaid),
        OutstandingAmount: Number(payment.OutstandingAmount),
        TotalAmount: Number(payment.TotalAmount),
        ChequeNumber:
          payment.PaymentMethod === "Cheque" ? chequeNumber : undefined,
        TransactionId:
          payment.PaymentMethod === "Bank Transfer" ? transactionId : undefined,
        CardNumber:
          payment.PaymentMethod === "Credit Card" ? cardNumber : undefined,
      };
      const response = await fetch("${process.env.REACT_APP_API_BASE_URL}/Payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment");
      }
      if (onSave) {
        await onSave(payment);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-0">
      <form
        onSubmit={handleSubmit}
        className="px-8 py-6 grid grid-cols-2 gap-x-6 gap-y-4"
      >
        {/* Invoice ID and Payment Status in the same row */}
        <div>
          <label
            htmlFor="InvoiceId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Invoice ID*
          </label>
          <Select
            id="InvoiceId"
            name="InvoiceId"
            options={invoices.map((inv) => ({
              value: inv.invoiceId,
              label: inv.invoiceId,
            }))}
            value={
              payment.InvoiceId
                ? { value: payment.InvoiceId, label: payment.InvoiceId }
                : null
            }
            onChange={(option) =>
              handleInputChange("InvoiceId", option ? option.value : "")
            }
            placeholder="Select Invoice"
            isClearable
            required
          />
        </div>
        <div>
          <label
            htmlFor="PaymentStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Status*
          </label>
          <Select
            id="PaymentStatus"
            name="PaymentStatus"
            options={statusOptions}
            value={
              statusOptions.find(
                (opt) => opt.value === payment.PaymentStatus
              ) || null
            }
            onChange={(option) =>
              handleInputChange("PaymentStatus", option ? option.value : "")
            }
            placeholder="Select Status"
            isClearable
            required
          />
        </div>

        <div>
          <label
            htmlFor="PaymentDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Date*
          </label>
          <input
            id="PaymentDate"
            name="PaymentDate"
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={payment.PaymentDate}
            onChange={(e) => handleInputChange("PaymentDate", e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="DueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date*
          </label>
          <input
            id="DueDate"
            name="DueDate"
            type="date"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={payment.DueDate}
            onChange={(e) => handleInputChange("DueDate", e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="PaymentMethod"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Payment Method*
          </label>
          <Select
            id="PaymentMethod"
            name="PaymentMethod"
            options={paymentMethodOptions}
            value={
              paymentMethodOptions.find(
                (opt) => opt.value === payment.PaymentMethod
              ) || null
            }
            onChange={(option) => {
              handleInputChange("PaymentMethod", option ? option.value : "");
              // Reset additional fields when payment method changes
              setChequeNumber("");
              setTransactionId("");
              setCardNumber("");
            }}
            placeholder="Select Method"
            isClearable
            required
          />
        </div>

        {/* Show additional fields based on payment method */}
        {payment.PaymentMethod === "Cheque" && (
          <div>
            <InputField
              FieldName="Cheque Number*"
              IdName="ChequeNumber"
              Type="text"
              value={chequeNumber}
              handleInputChange={(_, value) => setChequeNumber(value)}
              required
            />
          </div>
        )}
        {payment.PaymentMethod === "Bank Transfer" && (
          <div>
            <InputField
              FieldName="Transaction ID*"
              IdName="TransactionId"
              Type="text"
              value={transactionId}
              handleInputChange={(_, value) => setTransactionId(value)}
              required
            />
          </div>
        )}
        {payment.PaymentMethod === "Credit Card" && (
          <div>
            <InputField
              FieldName="Card Number*"
              IdName="CardNumber"
              Type="text"
              value={cardNumber}
              handleInputChange={(_, value) => setCardNumber(value)}
              required
            />
          </div>
        )}
        <div>
          <InputField
            FieldName="Amount Paid*"
            IdName="AmountPaid"
            Type="number"
            value={payment.AmountPaid.toString()}
            handleInputChange={handleInputChange}
            required
          />
        </div>
        <div>
          <InputField
            FieldName="Outstanding Amount*"
            IdName="OutstandingAmount"
            Type="number"
            value={payment.OutstandingAmount.toString()}
            handleInputChange={handleInputChange}
            required
            Disabled
          />
        </div>
        <div>
          <InputField
            FieldName="Total Amount*"
            IdName="TotalAmount"
            Type="number"
            value={payment.TotalAmount.toString()}
            handleInputChange={handleInputChange}
            required
            Disabled
          />
        </div>
        {error && (
          <div className="col-span-2 text-red-500 text-sm mt-2 text-center">
            {error}
          </div>
        )}
        <div className="col-span-2 flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium text-gray-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
