import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface Bom {
  id?: number;
  name: string;
  type: string[];
}

const emptyBom: Bom = { name: "", type: [] };

const AddBom: React.FC = () => {
  const [boms, setBoms] = useState<Bom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Bom>(emptyBom);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [typeInput, setTypeInput] = useState("");

  // Fetch BOMs
  const fetchBoms = () => {
    setLoading(true);
    setError(null);
    api
      .get<Bom[]>("BomName")
      .then((res: any) => {
        setBoms(Array.isArray(res.data) ? res.data : [res.data]);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load BOMs");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  // Add or Edit BOM
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload = { ...form, type: form.type.filter((t) => t) };
    if (editingId) {
      api
        .put(`BomName/${editingId}`, payload)
        .then(() => {
          fetchBoms();
          setForm(emptyBom);
          setEditingId(null);
        })
        .catch(() => setError("Failed to update BOM"))
        .finally(() => setLoading(false));
    } else {
      api
        .post("BomName", payload)
        .then(() => {
          fetchBoms();
          setForm(emptyBom);
        })
        .catch(() => setError("Failed to add BOM"))
        .finally(() => setLoading(false));
    }
  };

  // Delete BOM
  const handleDelete = (id?: number) => {
    if (!id) return;
    setLoading(true);
    api
      .delete(`BomName/${id}`)
      .then(() => fetchBoms())
      .catch(() => setError("Failed to delete BOM"))
      .finally(() => setLoading(false));
  };

  // Edit BOM
  const handleEdit = (bom: Bom) => {
    setForm({ ...bom });
    setEditingId(bom.id || null);
    setTypeInput("");
  };

  // Add type to BOM
  const handleAddType = () => {
    if (typeInput.trim()) {
      setForm((prev) => ({ ...prev, type: [...prev.type, typeInput.trim()] }));
      setTypeInput("");
    }
  };

  // Remove type from BOM
  const handleRemoveType = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      type: prev.type.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">BOM Management</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form
        onSubmit={handleSubmit}
        className="mb-6 space-y-4 bg-white p-4 rounded shadow"
      >
        <div>
          <label className="block font-medium mb-1">BOM Name</label>
          <input
            className="border px-3 py-2 rounded w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Types</label>
          <div className="flex gap-2 mb-2">
            <input
              className="border px-3 py-2 rounded flex-1"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
              placeholder="Add type and press +"
            />
            <button
              type="button"
              onClick={handleAddType}
              className="bg-blue-600 text-white px-3 py-2 rounded"
            >
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.type.map((t, idx) => (
              <span
                key={idx}
                className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
              >
                {t}
                <button
                  type="button"
                  onClick={() => handleRemoveType(idx)}
                  className="text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {editingId ? "Update BOM" : "Add BOM"}
          </button>
          {editingId && (
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => {
                setForm(emptyBom);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
      <h2 className="text-xl font-semibold mb-2">BOM List</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Types</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {boms.map((bom) => (
              <tr key={bom.id}>
                <td className="border px-2 py-1">{bom.id}</td>
                <td className="border px-2 py-1">{bom.name}</td>
                <td className="border px-2 py-1">
                  {(bom.type || []).join(", ")}
                </td>
                <td className="border px-2 py-1 flex gap-2">
                  <button
                    className="text-blue-600"
                    onClick={() => handleEdit(bom)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(bom.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {boms.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-2">
                  No BOMs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddBom;
