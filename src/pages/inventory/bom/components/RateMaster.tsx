import React, { useEffect, useState } from "react";

type ItemDetail = {
  id: string;
  supplier?: string;
  type?: string;
  purRate?: number | "";
  hsnCode?: string;
  tax?: string;
  salRate?: number | "";
  klRate?: number | "";
  quotRate?: number | "";
};

type RateRecord = {
  id: string;
  docId: string;
  docDate: string;
  effDate: string;
  itemGroup?: string;
  type?: string;
  make?: string;
  category?: string;
  product?: string;
  model?: string;
  state?: string;
  remarks?: string;
  items: ItemDetail[];
};

const defaultRecord = (): RateRecord => ({
  id: Date.now().toString(),
  docId: "",
  docDate: new Date().toISOString().slice(0, 10),
  effDate: new Date().toISOString().slice(0, 10),
  itemGroup: "",
  type: "",
  make: "",
  category: "",
  product: "",
  model: "",
  state: "",
  remarks: "",
  items: [],
});

function toCSV(records: RateRecord[]) {
  const header = [
    "Doc ID",
    "Doc Date",
    "Eff Date",
    "Item Group",
    "Type",
    "Make",
    "Category",
    "Product",
    "Model",
    "State",
    "S No",
    "Item ID",
    "Supplier",
    "Type(Item)",
    "Pur Rate",
    "HSN Code",
    "Tax",
    "Sal Rate",
    "KL Rate",
    "Quot Rate",
    "Remarks",
  ];

  const rows: string[][] = [header];

  records.forEach((r) => {
    if (r.items.length === 0) {
      rows.push([
        r.docId,
        r.docDate,
        r.effDate,
        r.itemGroup || "",
        r.type || "",
        r.make || "",
        r.category || "",
        r.product || "",
        r.model || "",
        r.state || "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        r.remarks || "",
      ]);
    } else {
      r.items.forEach((it, idx) => {
        rows.push([
          r.docId,
          r.docDate,
          r.effDate,
          r.itemGroup || "",
          r.type || "",
          r.make || "",
          r.category || "",
          r.product || "",
          r.model || "",
          r.state || "",
          String(idx + 1),
          it.id || "",
          it.supplier || "",
          it.type || "",
          String(it.purRate ?? ""),
          it.hsnCode || "",
          it.tax || "",
          String(it.salRate ?? ""),
          String(it.klRate ?? ""),
          String(it.quotRate ?? ""),
          r.remarks || "",
        ]);
      });
    }
  });

  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

const RateMaster: React.FC = () => {
  const [records, setRecords] = useState<RateRecord[]>(() => {
    try {
      const raw = localStorage.getItem("rate_master_records");
      return raw ? (JSON.parse(raw) as RateRecord[]) : [];
    } catch (e) {
      return [];
    }
  });

  const [current, setCurrent] = useState<RateRecord>(defaultRecord());
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("rate_master_records", JSON.stringify(records));
  }, [records]);

  const handleNew = () => {
    setCurrent(defaultRecord());
    setEditingId(null);
  };

  const handleSave = () => {
    if (!current.docId) {
      alert("Please provide Doc ID");
      return;
    }
    if (editingId) {
      setRecords((prev) => prev.map((r) => (r.id === editingId ? current : r)));
    } else {
      setRecords((prev) => [current, ...prev]);
    }
    handleNew();
  };

  const handleEdit = (id: string) => {
    const rec = records.find((r) => r.id === id);
    if (rec) {
      setCurrent(JSON.parse(JSON.stringify(rec)));
      setEditingId(id);
    }
  };

  const handleDelete = (id: string) => {
    // if (!confirm("Delete this record?")) return;
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) handleNew();
  };

  const addItemRow = () => {
    const newItem: ItemDetail = {
      id: "",
      supplier: "",
      type: "",
      purRate: "",
      hsnCode: "",
      tax: "",
      salRate: "",
      klRate: "",
      quotRate: "",
    };
    setCurrent((c) => ({ ...c, items: [...c.items, newItem] }));
  };

  const updateItem = (index: number, patch: Partial<ItemDetail>) => {
    setCurrent((c) => {
      const items = [...c.items];
      items[index] = { ...items[index], ...patch };
      return { ...c, items };
    });
  };

  const removeItem = (index: number) => {
    setCurrent((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }));
  };

  const exportCSV = () => {
    const csv = toCSV(records);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rate_master_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          {editingId ? "Edit Record" : "New Record"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Doc ID <span className="text-red-500">*</span>
            </label>
            <input
              value={current.docId}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, docId: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter document ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Doc Date
            </label>
            <input
              type="date"
              value={current.docDate}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, docDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Effective Date
            </label>
            <input
              type="date"
              value={current.effDate}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, effDate: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Item Group
            </label>
            <input
              value={current.itemGroup}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, itemGroup: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter item group"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Type
            </label>
            <input
              value={current.type}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, type: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Make
            </label>
            <input
              value={current.make}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, make: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter make"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <input
              value={current.category}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, category: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Product
            </label>
            <input
              value={current.product}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, product: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter product"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Model
            </label>
            <input
              value={current.model}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, model: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter model"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              State
            </label>
            <input
              value={current.state}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, state: e.target.value }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter state"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Remarks
            </label>
            <textarea
              value={current.remarks}
              onChange={(e) =>
                setCurrent((c) => ({ ...c, remarks: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter remarks"
            />
          </div>
        </div>

        {/* Item Details */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Item Details
            </h3>
            <button
              onClick={addItemRow}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    S No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Pur. Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    HSN Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tax
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Sal. Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    KL Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Quot Rate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {current.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No items added yet. Click "Add Item" to get started.
                    </td>
                  </tr>
                ) : (
                  current.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-center text-sm text-slate-700 font-medium">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.id}
                          onChange={(e) =>
                            updateItem(idx, { id: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.supplier}
                          onChange={(e) =>
                            updateItem(idx, { supplier: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.type}
                          onChange={(e) =>
                            updateItem(idx, { type: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={it.purRate as any}
                          onChange={(e) =>
                            updateItem(idx, {
                              purRate:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.hsnCode}
                          onChange={(e) =>
                            updateItem(idx, { hsnCode: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={it.tax}
                          onChange={(e) =>
                            updateItem(idx, { tax: e.target.value })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={it.salRate as any}
                          onChange={(e) =>
                            updateItem(idx, {
                              salRate:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={it.klRate as any}
                          onChange={(e) =>
                            updateItem(idx, {
                              klRate:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={it.quotRate as any}
                          onChange={(e) =>
                            updateItem(idx, {
                              quotRate:
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(idx)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Saved Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">
          Saved Records
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Doc ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Doc Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Eff Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {records.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No records saved yet. Create your first record above.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                      {r.docId}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {r.docDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {r.effDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {r.product}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {r.items.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(r.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-3 flex-wrap justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            Save
          </button>
          {editingId && (
            <button
              onClick={() => setEditingId(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-sm"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default RateMaster;
