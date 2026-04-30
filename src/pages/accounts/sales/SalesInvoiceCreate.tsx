import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SalesInvoiceCreate: React.FC = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [due, setDue] = useState("");
  const [amount, setAmount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to create invoice
    console.log("create invoice", { customer, date, due, amount });
    navigate("/accounts/sales-invoices");
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded shadow p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">New Sales Invoice</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer</label>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-3 py-2 border rounded" />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalesInvoiceCreate;
