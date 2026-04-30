import React, { useState, useEffect } from "react";
import { useUser } from '../../context/UserContext';
import AuthService from '../../services/authService';

export interface ExpenseItem {
  id: string;
  expensesName: string;
  totalKM: string;
  amount: string;
  fromPlace: string;
  toPlace: string;
  date?: string;
  remarks: string;
}

export interface ClaimFormData {
  salesMan: string;
  claimNo?: string;
  billAttach: File[];
  type: string;
  modeOfTravel: string;
  claimDate: string;
  expenses: ExpenseItem[];
}

const initialForm: ClaimFormData = {
  salesMan: "",
  billAttach: [],
  type: "",
  modeOfTravel: "",
  claimDate: new Date().toISOString().split('T')[0],
  expenses: [],
};

const initialExpense = {
  expensesName: "",
  date: "",
  totalKM: "",
  amount: "",
  fromPlace: "",
  toPlace: "",
  remarks: "",
};

interface ClaimFormProps {
  onSubmit?: (data: ClaimFormData) => void;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
type ExpenseCategory = "TRAVEL" | "LOCAL" | "BOARDING" | "SUNDRIES";

// Canonical mapping for expense types -> category. Keys are the canonical displayed labels.
const expenseCategoryMap: Record<string, ExpenseCategory> = {
  "Travelling Expenses": "TRAVEL",
  "Car Expenses": "TRAVEL",
  "Auto Expenses": "TRAVEL",
  "Tollgate Expenses": "TRAVEL",

  "Conveyance Expenses": "LOCAL",

  "Boarding Expenses": "BOARDING",
  "Lodging Expenses": "BOARDING",

  "Booking Expenses": "SUNDRIES",
  "Daily Allowance": "SUNDRIES",
  "Summer Allowance": "SUNDRIES",
  "Printing and Stationery": "SUNDRIES",
  "Others": "SUNDRIES",
};

// Normalized lookup map to make matching resilient to casing, plurals and common misspellings
const normalizedExpenseCategoryMap: Record<string, ExpenseCategory> = (() => {
  const map: Record<string, ExpenseCategory> = {};
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ").replace(/expenses?/g, "").replace(/allowances?/g, "allowance").replace(/stationary/g, "stationery").trim();

  Object.keys(expenseCategoryMap).forEach(key => {
    map[normalize(key)] = expenseCategoryMap[key];
    // Also add some common aliases
  });

  // Add explicit aliases
  [
    ["printing and stationery", "Printing and Stationery"],
    ["printing and stationary", "Printing and Stationery"],
    ["printing stationery", "Printing and Stationery"],
    ["daily allowance", "Daily Allowance"],
    ["daily allowances", "Daily Allowance"],
    ["summer allowance", "Summer Allowance"],
    ["summer allowances", "Summer Allowance"],
    ["booking", "Booking Expenses"],
    ["booking expenses", "Booking Expenses"],
    ["tollgate", "Tollgate Expenses"],
    ["travelling", "Travelling Expenses"],
    ["travelling expenses", "Travelling Expenses"],
  ].forEach(([alias, canonical]) => {
    map[normalize(alias as string)] = expenseCategoryMap[canonical as string];
  });

  return map;
})();


const ClaimForm: React.FC<ClaimFormProps> = ({ onSubmit, onSuccess, onClose }) => {
  const { user } = useUser();
  const [form, setForm] = useState(initialForm);
  const [currentExpense, setCurrentExpense] = useState(initialExpense);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // whether the form was auto populated (unused) - removed to avoid linter warnings

  // Auto-populate salesMan field with username
  useEffect(() => {
    const userDisplayName = AuthService.getUserDisplayName() || (user?.firstName + ' ' + user?.lastName) || 'Guest User';
    setForm(prev => ({ ...prev, salesMan: userDisplayName }));
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "type" && value === "LOCAL") {
      setForm({ ...form, [name]: value, modeOfTravel: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    
    setForm({ ...form, billAttach: [...form.billAttach, ...files] });
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const removeFile = (index: number) => {
    const newFiles = form.billAttach.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    
    // Revoke the removed URL
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    setForm({ ...form, billAttach: newFiles });
    setPreviewUrls(newUrls);
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCurrentExpense({ ...currentExpense, [e.target.name]: e.target.value });
  };

 
const handleAddExpense = () => {
  const category = getExpenseCategory(currentExpense.expensesName);

  if (!category) {
    showToast("Please select Expenses Type", "error");
    return;
  }

  if (!currentExpense.amount) {
    showToast("Amount is required", "error");
    return;
  }

  if (category === "TRAVEL" && (!currentExpense.fromPlace || !currentExpense.toPlace)) {
    showToast("From & To places are required for Travel", "error");
    return;
  }

  if (category === "LOCAL" && !currentExpense.remarks) {
    showToast("Details are required for Local Conveyance", "error");
    return;
  }

  const expenseToSave: ExpenseItem = {
    id: editingExpenseId ?? crypto.randomUUID(),
    expensesName: currentExpense.expensesName,
    date: currentExpense.date,
    fromPlace: currentExpense.fromPlace,
    toPlace: currentExpense.toPlace,
    totalKM: currentExpense.totalKM,
    amount: currentExpense.amount,
    remarks: currentExpense.remarks,
  };

  if (editingExpenseId) {
    // UPDATE
    setForm(prev => ({
      ...prev,
      expenses: prev.expenses.map(exp =>
        exp.id === editingExpenseId ? expenseToSave : exp
      ),
    }));
    showToast("Expense updated successfully", "success");
  } else {
    // ADD
    setForm(prev => ({
      ...prev,
      expenses: [...prev.expenses, expenseToSave],
    }));
    showToast("Expense added successfully", "success");
  }

  setCurrentExpense(initialExpense);
  setEditingExpenseId(null);
};

  const handleEditExpense = (expense: ExpenseItem) => {
    setCurrentExpense({
      expensesName: expense.expensesName,
      date: expense.date || "",
      totalKM: expense.totalKM,
      amount: expense.amount,
      fromPlace: expense.fromPlace,
      toPlace: expense.toPlace,
      remarks: expense.remarks,
    });
    setEditingExpenseId(expense.id);
  };

  const handleDeleteExpense = (id: string) => {
    setForm({
      ...form,
      expenses: form.expenses.filter(exp => exp.id !== id)
    });
    showToast("Expense deleted successfully", "info");
  };

  const handleClearExpense = () => {
    setCurrentExpense(initialExpense);
    setEditingExpenseId(null);
  };

  const uploadFiles = async () => {
    const filePaths: string[] = [];
    
    if (!form.billAttach || form.billAttach.length === 0) {
      return filePaths;
    }
    
    for (const file of form.billAttach) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Storage/upload/Claims`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          filePaths.push(result.filePath);
          console.log('File uploaded:', result.fileName, 'Path:', result.filePath);
        } else {
          console.error('Failed to upload file:', file.name);
        }
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
      }
    }
    
    return filePaths;
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.salesMan || !form.type) {
      showToast("Please fill in all required fields (Sales Man, Type)", "error");
      return;
    }

    if (form.type === "OUT STATION" && !form.modeOfTravel) {
      showToast("Please select Mode of Travel for OUT STATION claims", "error");
      return;
    }

    if (form.expenses.length === 0) {
      showToast("Please add at least one expense", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload files first
      const filePaths = await uploadFiles();
      
      // Transform expenses to match API's Items structure
      const Items = form.expenses.map(expense => ({
        FromPlace: expense.fromPlace || "",
        ToPlace: expense.toPlace || "",
        ModeOfTravel: form.type === "OUT STATION" ? (form.modeOfTravel || "") : "",
        Date: expense.date || "",
        ExpenseType: expense.expensesName,
        Amount: parseFloat(expense.amount) || 0,
        ActualKm: parseFloat(expense.totalKM) || 0,
        Comments: expense.remarks || "",
        BillUrl: filePaths.join(', ')
      }));

      // Format date to match working API format (YYYY-MM-DDT00:00:00.000Z)
      const claimDate = new Date(form.claimDate);
      claimDate.setHours(0, 0, 0, 0);
      const formattedDate = claimDate.toISOString();

      // Build the payload matching the EXACT working API structure
      const payload = {
        ClaimDate: formattedDate,
        UserName: form.salesMan,
        ClaimType: form.type,
        ModeOfTravel: form.type === "OUT STATION" ? (form.modeOfTravel || "") : "",
        Items
      };

      console.log("Payload to save:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/Claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create claim: ${response.statusText}. ${errorText}`);
      }

      const result = await response.json();
      console.log("Claim created successfully:", result);

      // Success notification
      showToast("🎉 Claim created successfully!", "success");
      
      // Call callbacks
      if (onSubmit) {
        onSubmit(form);
      }
      if (onSuccess) {
        onSuccess();
      }

      // Reset form but keep salesMan populated
      const userDisplayName = AuthService.getUserDisplayName() || (user?.firstName + ' ' + user?.lastName) || 'Guest User';
      
      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setForm({ ...initialForm, salesMan: userDisplayName });
      setCurrentExpense(initialExpense);
      setEditingExpenseId(null);
      setPreviewUrls([]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create claim";
      setError(errorMessage);
      showToast(`Error: ${errorMessage}`, "error");
      console.error("Error creating claim:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(initialForm);
    setCurrentExpense(initialExpense);
    setEditingExpenseId(null);
    if (onClose) {
      onClose();
    }
  };
    const getExpenseCategory = (expenseName: string): ExpenseCategory | null => {
      if (!expenseName) return null;
      const normalized = expenseName.toLowerCase().trim().replace(/\s+/g, " ");
      // Try exact canonical match first
      if (expenseCategoryMap[expenseName]) return expenseCategoryMap[expenseName];
      // Then try normalized lookup
      const key = normalized.replace(/expenses?/g, "").replace(/allowances?/g, "allowance").replace(/stationary/g, "stationery").trim();
      return normalizedExpenseCategoryMap[key] ?? null;
    };
const fieldsByCategory: Record<ExpenseCategory, string[]> = {
  TRAVEL: ["date", "fromPlace", "toPlace", "modeOfTravel", "totalKM", "amount"],
  LOCAL: ["date", "fromPlace", "toPlace", "remarks", "amount"],
  BOARDING: ["date","remarks", "amount"],
  // Sundries may have Date, From and To as well (e.g., Booking, Printing)
  SUNDRIES: ["expensesName", "date", "fromPlace", "toPlace", "remarks", "totalKM", "amount"],
};
const currentCategory = getExpenseCategory(currentExpense.expensesName);
  const totalAmount = form.expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* Toast Container */}
        <div className="fixed top-4 right-4 z-[9999] space-y-2">

        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <div className="flex-1 font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

    <div className="p-4 bg-gray-100 min-h-screen">

        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">Claim Form</h2>
        
        <div>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* General Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Sales Man <span className="text-red-500">*</span>
                </label>
                <input
                  name="salesMan"
                  value={form.salesMan}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  required
                  readOnly
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Claim Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="claimDate"
                  value={form.claimDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Please Select Type</option>
                  <option value="LOCAL">LOCAL</option>
                  <option value="OUT STATION">OUT STATION</option>
                </select>
              </div>
              {form.type === "OUT STATION" && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Mode Of Travel <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="modeOfTravel"
                    value={form.modeOfTravel}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Please select Mode Of Travel</option>
                    <option value="Car">Car</option>
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Flight">Flight</option>
                    <option value="Two Wheeler">Two Wheeler</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Bill Attach
                </label>
                <input
                  type="file"
                  name="billAttach"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                />
                {form.billAttach && form.billAttach.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {form.billAttach.length} file(s)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Bill Preview Section */}
          {form.billAttach && form.billAttach.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Bill Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.billAttach.map((file, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border relative">
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove file"
                    >
                      ×
                    </button>
                    {file.type.startsWith('image/') ? (
                      <img 
                        src={previewUrls[index]} 
                        alt={`Bill Preview ${index + 1}`} 
                        className="w-full h-48 object-cover rounded border shadow"
                      />
                    ) : file.type === 'application/pdf' ? (
                      <iframe 
                        src={previewUrls[index]} 
                        className="w-full h-48 border rounded"
                        title={`PDF Preview ${index + 1}`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500 text-center">Preview not available</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expenses Details Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Expenses Details</h3>
            
            {/* Expenses Table */}
            {form.expenses.length > 0 && (
              <div className="overflow-x-auto mb-6 border rounded-lg">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Expense Type</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">From Place</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">To Place</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Total KM</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                      <th className="border-b px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.expenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="border-b px-4 py-3 text-sm">{expense.expensesName}</td>
                        <td className="border-b px-4 py-3 text-sm">{expense.fromPlace || '-'}</td>
                        <td className="border-b px-4 py-3 text-sm">{expense.toPlace || '-'}</td>
                        <td className="border-b px-4 py-3 text-sm">{expense.totalKM || '-'}</td>
                        <td className="border-b px-4 py-3 text-sm">₹{parseFloat(expense.amount).toFixed(2)}</td>
                        <td className="border-b px-4 py-3 text-sm">{expense.remarks || '-'}</td>
                        <td className="border-b px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditExpense(expense)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-50 font-semibold">
                      <td colSpan={4} className="border-b px-4 py-3 text-right text-sm">Total Amount:</td>
                      <td className="border-b px-4 py-3 text-sm">₹{totalAmount.toFixed(2)}</td>
                      <td colSpan={2} className="border-b"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Add/Edit Expense Form */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h4 className="text-md font-semibold mb-3 text-gray-700">
                {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Expenses Name <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="expensesName"
                    value={currentExpense.expensesName}
                    onChange={handleExpenseChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Please select Expenses Type</option>
                    <option value="Travelling Expenses">Travelling Expenses</option>
                    <option value="Car Expenses">Car Expenses</option>
                    <option value="Auto Expenses">Auto Expenses</option>
                    <option value="Boarding Expenses">Boarding Expenses</option>
                    <option value="Booking Expenses">Booking Expenses</option>
                    <option value="Lodging Expenses">Lodging Expenses</option>
                    <option value="Tollgate Expenses">Tollgate Expenses</option>
                    <option value="Conveyance Expenses">Conveyance Expenses</option>
                    <option value="Daily Allowance">Daily Allowance</option>
                    <option value="Summer Allowance">Summer Allowance</option>
                    <option value="Printing and Stationery">Printing and Stationery</option>
                    <option value="Others">Others</option>
                 
                    
                    
                   
                  </select>
                </div>
                {currentCategory && fieldsByCategory[currentCategory].includes("fromPlace") && (
  <div>
    <label className="block text-sm font-medium mb-1">From Place</label>
    <input
      type="text"
      name="fromPlace"
      value={currentExpense.fromPlace}
      onChange={handleExpenseChange}
      className="w-full border rounded px-3 py-2"
    />
  </div>
)}
{currentCategory && fieldsByCategory[currentCategory].includes("date") && (
  <div>
    <label className="block text-sm font-medium mb-1">Date</label>
    <input
      type="date"
      name="date"
      value={currentExpense.date || ''}
      onChange={handleExpenseChange}
      className="w-full border rounded px-3 py-2"
    />
  </div>
)}
               {currentCategory && fieldsByCategory[currentCategory].includes("toPlace") && (
  <div>
    <label className="block text-sm font-medium mb-1">To Place</label>
    <input
      type="text"
      name="toPlace"
      value={currentExpense.toPlace}
      onChange={handleExpenseChange}
      className="w-full border rounded px-3 py-2"
    />
  </div>
)}
{currentCategory && fieldsByCategory[currentCategory].includes("totalKM") && (
  <div>
    <label className="block text-sm font-medium mb-1">Total KM</label>
    <input
      type="number"
      name="totalKM"
      value={currentExpense.totalKM}
      onChange={handleExpenseChange}
      className="w-full border rounded px-3 py-2"
    />
  </div>
)}
              {currentCategory && fieldsByCategory[currentCategory].includes("remarks") && (
  <div>
    <label className="block text-sm font-medium mb-1">Details <span className="text-red-500">*</span></label>
    <input
      type="text"
      name="remarks"
      value={currentExpense.remarks}
      onChange={handleExpenseChange}
      className="w-full border rounded px-3 py-2"
    />
  </div>
)}
<div>
  <label className="block text-sm font-medium mb-1">
    Amount <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    name="amount"
    value={currentExpense.amount}
    onChange={handleExpenseChange}
    className="w-full border rounded px-3 py-2"
  />
</div>


              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleClearExpense}
                  className="bg-gray-500 text-white px-5 py-2 rounded shadow hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="bg-green-600 text-white px-5 py-2 rounded shadow hover:bg-green-700 transition-colors"
                >
                  {editingExpenseId ? "Update" : "+ Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Form */}
          <div className="mt-6 flex justify-end gap-3 border-t pt-6">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded shadow hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || form.expenses.length === 0}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit Claim"
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClaimForm;