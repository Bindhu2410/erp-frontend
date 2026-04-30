import React, { useState } from "react";
import { BOMType, BOMRow } from "./BOMProductDetail";

const makes = ["Alan", "Gyrus", "Combi"];
const categories = ["Equipments", "Instruments", "Accessories"];
const products = ["Combi", "Gyrus", "Ceramic"];
const models = ["Mbxvp", "Working Element", "Ceramic", "None"];

const emptyRow: BOMRow = {
  make: "",
  category: "",
  product: "",
  model: "",
  itemId: "",
  qty: 1,
  itemRate: 0,
};

const defaultBOM: BOMType = {
  bomId: "",
  bomName: "",
  bomType: "",
  make: makes[0],
  quotTitle: "",
  tcTemplate: "",
  effectiveFrom: "",
  effectiveTo: "",
  rows: [emptyRow],
};

const BOMFormModal: React.FC<{
  onAdd: (bom: BOMType) => void;
  onClose: () => void;
}> = ({ onAdd, onClose }) => {
  const [bom, setBOM] = useState<BOMType>({ ...defaultBOM });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBOM((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    setBOM((prev) => ({
      ...prev,
      rows: [...prev.rows, { ...emptyRow }],
    }));
  };

  const handleDeleteRow = (index: number) => {
    setBOM((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, idx) => idx !== index),
    }));
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full  relative border border-gray-200   w-auto animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl font-light"
          onClick={onClose}
        >
          ×
        </button>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">BOM ID</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="bomId"
              value={bom.bomId}
              onChange={handleChange}
              placeholder="Enter BOM ID"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              BOM Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="bomName"
              value={bom.bomName}
              onChange={handleChange}
              placeholder="Enter BOM name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              BOM Type
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="bomType"
              value={bom.bomType}
              onChange={handleChange}
              placeholder="Enter BOM type"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Make</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
              name="make"
              value={bom.make}
              onChange={handleChange}
            >
              <option value="">Select Make</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Quote Title
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="quotTitle"
              value={bom.quotTitle}
              onChange={handleChange}
              placeholder="Enter quote title"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              TC Template
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="tcTemplate"
              value={bom.tcTemplate}
              onChange={handleChange}
              placeholder="Enter TC template"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Effective From
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="effectiveFrom"
              value={bom.effectiveFrom}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Effective To
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              name="effectiveTo"
              value={bom.effectiveTo}
              onChange={handleChange}
            />
          </div>
        </form>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            BOM Items
          </h4>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Make
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Id
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {bom.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        value={row.make}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].make = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {makes.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        value={row.category}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].category = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1 border">
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        value={row.product}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].product = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1 border">
                      <select
                        className="border rounded px-2 py-1"
                        value={row.model}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].model = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {models.map((mo) => (
                          <option key={mo}>{mo}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="w-full border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
                        value={row.itemId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].itemId = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Enter Item Id"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-24 border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-right"
                        value={row.qty}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].qty = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Qty"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        className="w-32 border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-right"
                        value={row.itemRate}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].itemRate = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Rate"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <button
          className="mb-6 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors duration-200 font-medium flex items-center gap-2"
          type="button"
          onClick={handleAddRow}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Row
        </button>
        <div className="flex gap-4 justify-end border-t border-gray-200 pt-6">
          <button
            className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            type="button"
            onClick={() => onAdd(bom)}
          >
            Add BOM
          </button>
        </div>
      </div>
    </div>
  );
};

export default BOMFormModal;
