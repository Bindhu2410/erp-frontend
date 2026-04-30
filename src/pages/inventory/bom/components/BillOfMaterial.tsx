import React, { useState } from "react";
import BOMProductDetail from "./BOMProductDetail";
// import BOMListView from "./BOMListView";

const bomTabs = ["BOM Detail", "BOM Optional Detail", "Footer"];

const makes = ["Alan", "Gyrus", "Combi"];
const categories = ["Equipments", "Instruments", "Accessories"];
const products = ["Combi", "Gyrus", "Ceramic"];
const models = ["Mbxvp", "Working Element", "Ceramic", "None"];

const initialRows: BOMRowType[] = [
  {
    make: "Alan",
    category: "Equipments",
    product: "Combi",
    model: "Mbxxp",
    itemId: "COMBI -MAX UNIT (MBXVP)...",
    qty: 1,
    itemRate: 0,
  },
  {
    make: "Alan",
    category: "Instruments",
    product: "Gyrus",
    model: "Working Element",
    itemId: "AH-004 WORK...",
    qty: 1,
    itemRate: 0,
  },
  {
    make: "Alan",
    category: "Accessories",
    product: "Gyrus",
    model: "Ceramic",
    itemId: "AE-024 GYRUS CERAMIC...",
    qty: 5,
    itemRate: 0,
  },
  {
    make: "Alan",
    category: "Accessories",
    product: "Gyrus",
    model: "Ceramic",
    itemId: "AE-047 CERAMIC GYRUS...",
    qty: 1,
    itemRate: 0,
  },
  {
    make: "Alan",
    category: "Accessories",
    product: "Gyrus",
    model: "None",
    itemId: "AE-038 GYRUS VAPOUR...",
    qty: 1,
    itemRate: 0,
  },
  {
    make: "Alan",
    category: "Accessories",
    product: "Gyrus",
    model: "None",
    itemId: "AC-009 GYRUS CABLE...",
    qty: 1,
    itemRate: 0,
  },
];

const emptyRow = {
  make: "",
  category: "",
  product: "",
  model: "",
  itemId: "",
  qty: 1,
  itemRate: 0,
};

type BOMRowType = {
  make: string;
  category: string;
  product: string;
  model: string;
  itemId: string;
  qty: number;
  itemRate: number;
};

type BOMType = {
  bomId: string;
  bomName: string;
  bomType: string;
  make: string;
  quotTitle: string;
  tcTemplate: string;
  effectiveFrom: string;
  effectiveTo: string;
  rows: BOMRowType[];
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

const BillOfMaterial: React.FC = () => {
  const [activeTab, setActiveTab] = useState(bomTabs[0]);
  const [bomList, setBomList] = useState<BOMType[]>([]);
  const [currentBOM, setCurrentBOM] = useState<BOMType>({ ...defaultBOM });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);

  // For demo, preload one BOM
  React.useEffect(() => {
    if (bomList.length === 0) {
      setBomList([
        {
          bomId: "MBM-22-23/009",
          bomName: "COMBI MAX",
          bomType: "MBXXP",
          make: "Alan",
          quotTitle: "ADVANCED MODEL DIATHERMY WITH BI-TURP",
          tcTemplate: "All item (except Hys) GST",
          effectiveFrom: "2022-01-04",
          effectiveTo: "2025-03-31",
          rows: initialRows,
        },
      ]);
    }
  }, []);

  // Form change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentBOM((prev) => ({ ...prev, [name]: value }));
  };

  // Add/Edit row logic (for brevity, only add row)
  const handleAddRow = () => {
    setCurrentBOM((prev: any) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          make: makes[0],
          category: categories[0],
          product: products[0],
          model: models[0],
          itemId: "",
          qty: 1,
        },
      ],
    }));
  };

  // Save BOM
  const handleSave = () => {
    if (selectedIndex !== null) {
      // Update existing
      const updatedList = [...bomList];
      updatedList[selectedIndex] = currentBOM;
      setBomList(updatedList);
    } else {
      // Add new
      setBomList([...bomList, currentBOM]);
    }
    setSelectedIndex(null);
    setCurrentBOM({ ...defaultBOM });
  };

  // New BOM
  const handleNew = () => {
    setSelectedIndex(null);
    setCurrentBOM({ ...defaultBOM });
  };

  // Select BOM from list
  const handleSelectBOM = (idx: number) => {
    setSelectedIndex(idx);
    setCurrentBOM({ ...bomList[idx] });
    setSelectedProductIndex(idx);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-6xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Marketing Bill Of Material</h2>

      {/* BOM List View as separate component */}
      {/* <BOMListView
        bomList={bomList.map((bom) => ({
          bomId: bom.bomId,
          bomName: bom.bomName,
        }))}
        selectedIndex={selectedIndex}
        onSelect={handleSelectBOM}
      /> */}

      {/* BOM Product Detail as separate component */}
      <BOMProductDetail
        bom={
          selectedProductIndex !== null ? bomList[selectedProductIndex] : null
        }
      />

      {/* BOM Form */}
      <form className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">BOM Id</label>
          <input
            className="w-full border px-3 py-2 rounded"
            name="bomId"
            value={currentBOM.bomId}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">BOM Name</label>
          <input
            className="w-full border px-3 py-2 rounded"
            name="bomName"
            value={currentBOM.bomName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">BOM Type</label>
          <input
            className="w-full border px-3 py-2 rounded"
            name="bomType"
            value={currentBOM.bomType}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <select
            className="w-full border px-3 py-2 rounded"
            name="make"
            value={currentBOM.make}
            onChange={handleChange}
          >
            {makes.map((make) => (
              <option key={make}>{make}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Quot Title</label>
          <input
            className="w-full border px-3 py-2 rounded"
            name="quotTitle"
            value={currentBOM.quotTitle}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">TC Template</label>
          <input
            className="w-full border px-3 py-2 rounded"
            name="tcTemplate"
            value={currentBOM.tcTemplate}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Effective From
          </label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            name="effectiveFrom"
            value={currentBOM.effectiveFrom}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Effective To</label>
          <input
            type="date"
            className="w-full border px-3 py-2 rounded"
            name="effectiveTo"
            value={currentBOM.effectiveTo}
            onChange={handleChange}
          />
        </div>
      </form>

      {/* Tabs */}
      <div className="border-b mb-4 flex gap-2">
        {bomTabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded p-4 min-h-[120px]">
        {activeTab === "BOM Detail" && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border font-semibold text-base rounded-tl-lg">
                    S No
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Child Item Make
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Category
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Product
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Model
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Item Id
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base">
                    Qty
                  </th>
                  <th className="px-4 py-2 border font-semibold text-base rounded-tr-lg">
                    Item Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentBOM.rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-50 transition rounded-lg"
                  >
                    <td className="px-4 py-2 border text-center rounded-l-lg">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="w-full border rounded-lg px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.make}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].make = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {makes.map((make) => (
                          <option key={make}>{make}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="w-full border rounded-lg px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.category}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].category = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {categories.map((cat) => (
                          <option key={cat}>{cat}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="w-full border rounded-lg px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.product}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].product = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {products.map((product) => (
                          <option key={product}>{product}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="w-full border rounded-lg px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.model}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].model = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                      >
                        <option value="">Select</option>
                        {models.map((model) => (
                          <option key={model}>{model}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        className="w-full border rounded-lg px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.itemId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].itemId = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Enter Item Id"
                      />
                    </td>
                    <td className="px-4 py-2 border">
                      <input
                        type="number"
                        className="w-16 border rounded-lg text-right px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.qty}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].qty = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Qty"
                      />
                    </td>
                    <td className="px-4 py-2 border rounded-r-lg">
                      <input
                        type="number"
                        className="w-20 border rounded-lg text-right px-2 py-1 focus:ring focus:ring-blue-200"
                        value={row.itemRate}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCurrentBOM((prev) => {
                            const newRows = [...prev.rows];
                            newRows[idx].itemRate = value;
                            return { ...prev, rows: newRows };
                          });
                        }}
                        placeholder="Rate"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="mt-4 px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition"
              type="button"
              onClick={handleAddRow}
            >
              + Add Row
            </button>
          </div>
        )}
        {activeTab !== "BOM Detail" && (
          <span className="text-gray-500">
            {activeTab} content goes here...
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-8 justify-end">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          type="button"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          type="button"
          onClick={handleNew}
        >
          New
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          type="button"
        >
          Search
        </button>
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          type="button"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default BillOfMaterial;
