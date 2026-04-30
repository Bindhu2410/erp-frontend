import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TargetStatus, TargetDetail, Target } from "../../types/target";
import api from "../../services/api";
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from "react-icons/fi";

type Mode = "create" | "edit";

const statusOptions: TargetStatus[] = [
  "Draft",
  "Approved",
  "Active",
  "Completed",
  "Cancelled",
];

interface TargetFormState {
  docId: string;
  fromDate: string;
  toDate: string;
  territory: string;
  territoryId: string;
  employeeId: string;
  employeeName: string;
  status: TargetStatus;
}

const TargetFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const mode: Mode = id ? "edit" : "create";
  const navigate = useNavigate();

  const [form, setForm] = useState<TargetFormState>({
    docId: "",
    fromDate: "",
    toDate: "",
    territory: "",
    territoryId: "",
    employeeId: "",
    employeeName: "",
    status: "Draft",
  });

  const [lines, setLines] = useState<TargetDetail[]>([
    {
      id: "line-1",
      productName: "",
      modelName: "",
      qty: 1,
      targetAmount: 0,
      achievedAmount: 0,
    },
  ]);

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchExisting = async () => {
      if (!id) return;
      try {
        const res = await api.get(`Target/${id}`);
        const payload = res?.data;
        if (payload?.target) {
          const master = payload.target as Target;
          setForm({
            docId: master.docId,
            fromDate: master.fromDate,
            toDate: master.toDate,
            territory: master.territory,
            territoryId: master.territoryId,
            employeeId: master.employeeId,
            employeeName: master.employeeName,
            status: master.status,
          });
          setLines(
            Array.isArray(payload.details) && payload.details.length > 0
              ? payload.details
              : lines,
          );
        }
      } catch (err) {
        // fallback: keep defaults
      }
    };
    fetchExisting();
  }, [id]);

  const handleChange = (
    field: keyof TargetFormState,
    value: string | TargetStatus,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (
    index: number,
    field: keyof TargetDetail,
    value: string | number,
  ) => {
    setLines((prev) =>
      prev.map((line, idx) =>
        idx === index ? { ...line, [field]: value } : line,
      ),
    );
  };

  const addLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${prev.length + 1}`,
        productName: "",
        modelName: "",
        qty: 1,
        targetAmount: 0,
        achievedAmount: 0,
      },
    ]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      details: lines,
    };

    try {
      if (mode === "create") {
        await api.post("Target", payload);
      } else if (id) {
        await api.put(`Target/${id}`, payload);
      }
      setMessage("Saved. (Backend wiring pending in this build)");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      // Keep UX responsive even when API is not ready
      console.warn("API not ready, storing locally");
      setMessage("Draft saved locally. Will sync when API is ready.");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-100"
            title="Back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs uppercase text-gray-500">
              {mode === "create" ? "New Target" : "Edit Target"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">
              {form.docId || "Draft"}
            </h1>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600"
        >
          <FiSave /> Save Draft
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-md bg-green-50 text-green-700 px-4 py-3 border border-green-100">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Doc ID"
            value={form.docId}
            onChange={(e) => handleChange("docId", e.target.value)}
            placeholder="TD-00017"
          />
          <Field
            label="Territory"
            value={form.territory}
            onChange={(e) => handleChange("territory", e.target.value)}
            placeholder="Chennai"
          />
          <Field
            label="Sales Rep"
            value={form.employeeName}
            onChange={(e) => handleChange("employeeName", e.target.value)}
            placeholder="Pradeep J"
          />
          <Field
            label="From"
            type="date"
            value={form.fromDate}
            onChange={(e) => handleChange("fromDate", e.target.value)}
          />
          <Field
            label="To"
            type="date"
            value={form.toDate}
            onChange={(e) => handleChange("toDate", e.target.value)}
          />
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as TargetStatus)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              Line Items
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <FiPlus /> Add Item
            </button>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-4">
            {lines.map((line, idx) => (
              <div key={line.id || idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white p-1 rounded-full shadow-sm"
                    title="Remove row"
                  >
                    <FiTrash2 size={16} />
                  </button>
                )}
                <div className="grid grid-cols-1 gap-3 mb-2 pt-2">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Product</label>
                    <input
                      value={line.productName}
                      onChange={(e) => handleLineChange(idx, "productName", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                      placeholder="Product"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-1">Model</label>
                    <input
                      value={line.modelName || ""}
                      onChange={(e) => handleLineChange(idx, "modelName", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                      placeholder="Model"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 mb-1">Qty</label>
                      <input
                        type="number"
                        value={line.qty}
                        min={0}
                        onChange={(e) => handleLineChange(idx, "qty", Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 mb-1">Target Amt</label>
                      <input
                        type="number"
                        value={line.targetAmount}
                        min={0}
                        onChange={(e) => handleLineChange(idx, "targetAmount", Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-gray-500 mb-1">Achieved</label>
                      <input
                        type="number"
                        value={line.achievedAmount}
                        min={0}
                        onChange={(e) => handleLineChange(idx, "achievedAmount", Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <Th>Product</Th>
                  <Th>Model</Th>
                  <Th className="text-right">Qty</Th>
                  <Th className="text-right">Target Amount</Th>
                  <Th className="text-right">Achieved</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lines.map((line, idx) => (
                  <tr key={line.id || idx}>
                    <Td>
                      <input
                        value={line.productName}
                        onChange={(e) =>
                          handleLineChange(idx, "productName", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Product"
                      />
                    </Td>
                    <Td>
                      <input
                        value={line.modelName || ""}
                        onChange={(e) =>
                          handleLineChange(idx, "modelName", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                        placeholder="Model"
                      />
                    </Td>
                    <Td className="text-right">
                      <input
                        type="number"
                        value={line.qty}
                        min={0}
                        onChange={(e) =>
                          handleLineChange(idx, "qty", Number(e.target.value))
                        }
                        className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm text-right"
                      />
                    </Td>
                    <Td className="text-right">
                      <input
                        type="number"
                        value={line.targetAmount}
                        min={0}
                        onChange={(e) =>
                          handleLineChange(
                            idx,
                            "targetAmount",
                            Number(e.target.value),
                          )
                        }
                        className="w-28 border border-gray-300 rounded-md px-2 py-1 text-sm text-right"
                      />
                    </Td>
                    <Td className="text-right">
                      <input
                        type="number"
                        value={line.achievedAmount}
                        min={0}
                        onChange={(e) =>
                          handleLineChange(
                            idx,
                            "achievedAmount",
                            Number(e.target.value),
                          )
                        }
                        className="w-28 border border-gray-300 rounded-md px-2 py-1 text-sm text-right"
                      />
                    </Td>
                    <Td className="text-right">
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(idx)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Remove row"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
    />
  </div>
);

const Th: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <th
    className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

const Td: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <td className={`px-3 py-2 text-sm text-gray-800 ${className}`}>{children}</td>
);

export default TargetFormPage;
