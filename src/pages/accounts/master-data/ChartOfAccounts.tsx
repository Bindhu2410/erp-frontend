import React, { useState, useEffect } from "react";
import { FaPlus as Plus, FaEye as Eye } from "react-icons/fa";

import { LuTrash2 as Trash2 } from "react-icons/lu";
import { Account, AccountType, AccountCategory } from "../../../types/accounts";

const ChartOfAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<AccountType | "All">("All");
  const [filterCategory, setFilterCategory] = useState<AccountCategory | "All">(
    "All"
  );
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({
    accountCode: "",
    accountName: "",
    accountType: "Asset",
    category: "Bank & Cash",
    description: "",
    isActive: true,
    openingBalance: 0,
    debitOrCredit: "Debit",
  });

  // Sample data
  const sampleAccounts: Account[] = [
    {
      id: "ACC-001",
      accountCode: "1010",
      accountName: "Bank Account - Current",
      accountType: "Asset",
      category: "Bank & Cash",
      description: "Main operating bank account",
      isActive: true,
      openingBalance: 500000,
      debitOrCredit: "Debit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
    {
      id: "ACC-002",
      accountCode: "1020",
      accountName: "Cash in Hand",
      accountType: "Asset",
      category: "Bank & Cash",
      isActive: true,
      openingBalance: 50000,
      debitOrCredit: "Debit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
    {
      id: "ACC-003",
      accountCode: "1100",
      accountName: "Accounts Receivable",
      accountType: "Asset",
      category: "Accounts Receivable",
      description: "Customer invoices outstanding",
      isActive: true,
      openingBalance: 150000,
      debitOrCredit: "Debit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
    {
      id: "ACC-004",
      accountCode: "2010",
      accountName: "Accounts Payable",
      accountType: "Liability",
      category: "Accounts Payable",
      description: "Supplier invoices outstanding",
      isActive: true,
      openingBalance: 75000,
      debitOrCredit: "Credit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
    {
      id: "ACC-005",
      accountCode: "4010",
      accountName: "Sales Revenue",
      accountType: "Revenue",
      category: "Sales Revenue",
      description: "Income from product sales",
      isActive: true,
      openingBalance: 0,
      debitOrCredit: "Credit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
    {
      id: "ACC-006",
      accountCode: "4100",
      accountName: "Output GST (SGST)",
      accountType: "Liability",
      category: "Tax",
      isActive: true,
      openingBalance: 0,
      debitOrCredit: "Credit",
      createdAt: "2025-01-01",
      modifiedAt: "2025-01-01",
    },
  ];

  useEffect(() => {
    // TODO: Replace with API call
    // const fetchAccounts = async () => {
    //   const response = await api.get("/accounts/chart-of-accounts");
    //   setAccounts(response.data);
    // };
    // fetchAccounts();
    setAccounts(sampleAccounts);
  }, []);

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || acc.accountType === filterType;
    const matchesCategory =
      filterCategory === "All" || acc.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const handleAddAccount = () => {
    if (!formData.accountCode || !formData.accountName) {
      alert("Account Code and Name are required");
      return;
    }

    const newAccount: Account = {
      id: `ACC-${Date.now()}`,
      accountCode: formData.accountCode || "",
      accountName: formData.accountName || "",
      accountType: formData.accountType as AccountType,
      category: formData.category as AccountCategory,
      description: formData.description,
      isActive: formData.isActive ?? true,
      openingBalance: formData.openingBalance ?? 0,
      debitOrCredit: formData.debitOrCredit as "Debit" | "Credit",
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    };

    setAccounts([...accounts, newAccount]);
    setFormData({
      accountCode: "",
      accountName: "",
      accountType: "Asset",
      category: "Bank & Cash",
      description: "",
      isActive: true,
      openingBalance: 0,
      debitOrCredit: "Debit",
    });
    setShowForm(false);
    setSelectedAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This action cannot be undone."
      )
    ) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
      if (selectedAccount?.id === id) {
        setSelectedAccount(null);
      }
    }
  };

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<AccountType, string> = {
      Asset: "bg-blue-100 text-blue-800",
      Liability: "bg-red-100 text-red-800",
      Equity: "bg-purple-100 text-purple-800",
      Revenue: "bg-green-100 text-green-800",
      Expense: "bg-orange-100 text-orange-800",
      COGS: "bg-yellow-100 text-yellow-800",
      Tax: "bg-pink-100 text-pink-800",
    };
    return colors[type];
  };

  const accountTypes: AccountType[] = [
    "Asset",
    "Liability",
    "Equity",
    "Revenue",
    "Expense",
    "COGS",
    "Tax",
  ];
  const categories: AccountCategory[] = [
    "Bank & Cash",
    "Accounts Receivable",
    "Inventory",
    "Fixed Assets",
    "Accounts Payable",
    "Loans & Advances",
    "Capital",
    "Sales Revenue",
    "Other Income",
    "Purchases",
    "Operating Expenses",
    "Tax",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chart of Accounts
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your General Ledger (GL) accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Account List */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by code or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                    New Account
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={filterType}
                    onChange={(e) =>
                      setFilterType(e.target.value as AccountType | "All")
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Types</option>
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterCategory}
                    onChange={(e) =>
                      setFilterCategory(
                        e.target.value as AccountCategory | "All"
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* New Account Form */}
            {showForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  New Account
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Code *
                    </label>
                    <input
                      type="text"
                      value={formData.accountCode || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountCode: e.target.value,
                        })
                      }
                      placeholder="e.g., 1010"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Name *
                    </label>
                    <input
                      type="text"
                      value={formData.accountName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountName: e.target.value,
                        })
                      }
                      placeholder="e.g., Bank Account"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Type
                    </label>
                    <select
                      value={formData.accountType || "Asset"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          accountType: e.target.value as AccountType,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {accountTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category || "Bank & Cash"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as AccountCategory,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Optional description"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Normal Balance
                    </label>
                    <select
                      value={formData.debitOrCredit || "Debit"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          debitOrCredit: e.target.value as "Debit" | "Credit",
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Opening Balance
                    </label>
                    <input
                      type="number"
                      value={formData.openingBalance || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          openingBalance: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddAccount}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Save Account
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Accounts Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Account Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                      Opening Balance
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr
                      key={account.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {account.accountCode}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700">
                        {account.accountName}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(
                            account.accountType
                          )}`}
                        >
                          {account.accountType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {account.category}
                      </td>
                      <td className="px-6 py-3 text-sm text-right text-gray-900 font-medium">
                        ₹{account.openingBalance.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAccount(account);
                            }}
                            className="p-1 hover:bg-blue-100 rounded transition"
                            title="View"
                          >
                            <Eye size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAccount(account.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column - Account Details */}
          <div>
            {selectedAccount ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Account Details
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs uppercase">Code</p>
                    <p className="text-lg font-semibold">
                      {selectedAccount.accountCode}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs uppercase">Name</p>
                    <p className="font-medium">{selectedAccount.accountName}</p>
                  </div>

                  <div className="border-t pt-2">
                    <p className="text-gray-600 text-xs uppercase mb-1">Type</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(
                        selectedAccount.accountType
                      )}`}
                    >
                      {selectedAccount.accountType}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs uppercase">Category</p>
                    <p className="font-medium">{selectedAccount.category}</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs uppercase">
                      Normal Balance
                    </p>
                    <p className="font-medium">
                      {selectedAccount.debitOrCredit}
                    </p>
                  </div>

                  {selectedAccount.description && (
                    <div className="border-t pt-2">
                      <p className="text-gray-600 text-xs uppercase">
                        Description
                      </p>
                      <p>{selectedAccount.description}</p>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <p className="text-gray-600 text-xs uppercase">
                      Opening Balance
                    </p>
                    <p className="text-lg font-semibold">
                      ₹{selectedAccount.openingBalance.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-xs uppercase">Status</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedAccount.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedAccount.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
                <p>Select an account to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
