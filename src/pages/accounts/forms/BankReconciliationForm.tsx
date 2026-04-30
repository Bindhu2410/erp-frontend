import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BankReconciliationForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bankAccount: "",
    statementDate: new Date().toISOString().slice(0, 10),
    openingBalance: "",
    closingBalance: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/accounts/bank-reconciliation");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">New Bank Reconciliation</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account</label>
            <input type="text" value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statement Date</label>
            <input type="date" value={formData.statementDate} onChange={e => setFormData({ ...formData, statementDate: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opening Balance</label>
            <input type="number" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Closing Balance</label>
            <input type="number" value={formData.closingBalance} onChange={e => setFormData({ ...formData, closingBalance: e.target.value })} className="w-full px-3 py-2 border rounded" required />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
          <button type="button" onClick={() => navigate("/accounts/bank-reconciliation")} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default BankReconciliationForm;
