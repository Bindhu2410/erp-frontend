import React, { useState } from "react";
import {
  Package, Search, Plus, ArrowLeftRight, CheckCircle,
  AlertCircle, Settings, XCircle, Edit2, X
} from "lucide-react";
import { assetRecords as initialAssets, employees } from "../dummyData";
import { AssetRecord } from "../types";

const statusConfig: Record<AssetRecord["status"], { bg: string; text: string; icon: React.ElementType }> = {
  Assigned: { bg: "bg-blue-100", text: "text-blue-700", icon: CheckCircle },
  Available: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
  "Under Maintenance": { bg: "bg-orange-100", text: "text-orange-700", icon: Settings },
  Retired: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle },
};

const categoryColors: Record<string, string> = {
  Laptop: "bg-blue-50 text-blue-700",
  Monitor: "bg-purple-50 text-purple-700",
  Mobile: "bg-green-50 text-green-700",
  Printer: "bg-yellow-50 text-yellow-700",
  Phone: "bg-pink-50 text-pink-700",
};

const InventoryManagement: React.FC = () => {
  const [assets, setAssets] = useState<AssetRecord[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignAsset, setAssignAsset] = useState<AssetRecord | null>(null);
  const [selectedEmployee, setSelectedEmployeeId] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState({ assetName: "", category: "Laptop", serialNumber: "" });

  const filtered = assets.filter(a => {
    const matchSearch =
      a.assetName.toLowerCase().includes(search.toLowerCase()) ||
      a.assetId.toLowerCase().includes(search.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const summary = {
    total: assets.length,
    assigned: assets.filter(a => a.status === "Assigned").length,
    available: assets.filter(a => a.status === "Available").length,
    maintenance: assets.filter(a => a.status === "Under Maintenance").length,
  };

  const handleAssign = () => {
    if (!assignAsset || !selectedEmployee) return;
    const emp = employees.find(e => e.id === selectedEmployee);
    if (!emp) return;
    setAssets(prev => prev.map(a =>
      a.assetId === assignAsset.assetId
        ? { ...a, status: "Assigned", assignedTo: emp.name, employeeId: emp.id, assignedDate: new Date().toISOString().split("T")[0], returnDate: undefined }
        : a
    ));
    setShowAssignModal(false);
    setAssignAsset(null);
    setSelectedEmployeeId("");
  };

  const handleReturn = (assetId: string) => {
    setAssets(prev => prev.map(a =>
      a.assetId === assetId
        ? { ...a, status: "Available", assignedTo: "Unassigned", employeeId: undefined, returnDate: new Date().toISOString().split("T")[0] }
        : a
    ));
  };

  const handleAddAsset = () => {
    if (!newAsset.assetName) return;
    const asset: AssetRecord = {
      assetId: `AST${String(assets.length + 1).padStart(3, "0")}`,
      assetName: newAsset.assetName,
      category: newAsset.category,
      assignedTo: "Unassigned",
      assignedDate: "",
      status: "Available",
      serialNumber: newAsset.serialNumber || `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    };
    setAssets(prev => [...prev, asset]);
    setShowAddModal(false);
    setNewAsset({ assetName: "", category: "Laptop", serialNumber: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-sm text-gray-500">Asset tracking and assignment management</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Assets", value: summary.total, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Assigned", value: summary.assigned, color: "text-blue-600", bg: "bg-blue-100" },
          { label: "Available", value: summary.available, color: "text-green-700", bg: "bg-green-50" },
          { label: "Maintenance", value: summary.maintenance, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-5`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-600 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-56">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-9 pr-4 py-2.5 w-full border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          {["All", "Assigned", "Available", "Under Maintenance", "Retired"].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Asset ID", "Asset Name", "Category", "Serial Number", "Assigned To", "Date", "Status", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((asset) => {
                const cfg = statusConfig[asset.status];
                const Icon = cfg.icon;
                const catColor = categoryColors[asset.category] || "bg-gray-100 text-gray-600";
                return (
                  <tr key={asset.assetId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.assetId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Package className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">{asset.assetName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${catColor}`}>{asset.category}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{asset.serialNumber}</td>
                    <td className="px-4 py-3">
                      {asset.assignedTo === "Unassigned" ? (
                        <span className="text-gray-400 italic text-xs">Unassigned</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                            {asset.assignedTo.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="font-medium text-gray-700 text-xs">{asset.assignedTo}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{asset.assignedDate || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                        <Icon className="w-3 h-3" /> {asset.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {asset.status === "Available" && (
                          <button
                            onClick={() => { setAssignAsset(asset); setShowAssignModal(true); setSelectedEmployeeId(""); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            <ArrowLeftRight className="w-3 h-3" /> Assign
                          </button>
                        )}
                        {asset.status === "Assigned" && (
                          <button
                            onClick={() => handleReturn(asset.assetId)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                          >
                            <ArrowLeftRight className="w-3 h-3" /> Return
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No assets found</p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
          Showing {filtered.length} of {assets.length} assets
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && assignAsset && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">Assign Asset</h2>
              <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
                <Package className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-800">{assignAsset.assetName}</p>
                  <p className="text-xs text-gray-500">{assignAsset.assetId} · {assignAsset.serialNumber}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={e => setSelectedEmployeeId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.filter(e => e.status === "Active").map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleAssign} disabled={!selectedEmployee} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <ArrowLeftRight className="w-4 h-4" /> Assign Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">Add New Asset</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
                <input
                  value={newAsset.assetName}
                  onChange={e => setNewAsset(p => ({ ...p, assetName: e.target.value }))}
                  placeholder="e.g. Dell Laptop"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newAsset.category}
                  onChange={e => setNewAsset(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  {["Laptop", "Monitor", "Mobile", "Printer", "Phone", "Other"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                <input
                  value={newAsset.serialNumber}
                  onChange={e => setNewAsset(p => ({ ...p, serialNumber: e.target.value }))}
                  placeholder="Enter serial number (optional)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleAddAsset} disabled={!newAsset.assetName} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">Add Asset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
