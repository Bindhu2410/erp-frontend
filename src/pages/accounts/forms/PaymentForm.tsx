import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    paymentNumber: "",
    party: "",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    paymentMethod: "Cash",
    reference: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/accounts/payments");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Record Payment</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Number</label>
            <input type="text" value={formData.paymentNumber} onChange={e => setFormData({ ...formData, paymentNumber: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Party Name</label>
            <input type="text" value={formData.party} onChange={e => setFormData({ ...formData, party: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border rounded">
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Cheque</option>
              <option>UPI</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input type="text" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} className="w-full px-3 py-2 border rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          <button type="button" onClick={() => navigate("/accounts/payments")} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;
