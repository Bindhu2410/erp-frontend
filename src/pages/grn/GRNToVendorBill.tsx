import React, { useState, useEffect } from "react";
import DropDown from "../../components/common/DropDown";
import InputField from "../../components/common/InputField";
import api from "../../services/api";

interface ItemMasterData {
  make: string;
  category: string;
  model: string;
  product: string;
  item: string;
}

interface TableItem {
  grnNo?: string;
  grnDate?: string;
  make?: string;
  category?: string;
  model?: string;
  product?: string;
  item?: string;
}

const GRNToVendorBill: React.FC = () => {
  const [makes, setMakes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItemMasterData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/item-master");
        const data = response.data as ItemMasterData[];

        // Extract unique values
        const uniqueMakes = Array.from(new Set(data.map((item) => item.make)));
        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.category))
        );
        const uniqueModels = Array.from(
          new Set(data.map((item) => item.model))
        );
        const uniqueProducts = Array.from(
          new Set(data.map((item) => item.product))
        );
        const uniqueItems = Array.from(new Set(data.map((item) => item.item)));

        setMakes(uniqueMakes);
        setCategories(uniqueCategories);
        setModels(uniqueModels);
        setProducts(uniqueProducts);
        setItems(uniqueItems);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch item data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchItemMasterData();
  }, []);

  const handleAddRow = () => {
    setSelectedItems([...selectedItems, {}]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Purchase Bill</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GRN No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GRN Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Make
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {selectedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InputField
                      Type="text"
                      Name={`grnNo-${idx}`}
                      IdName={`grnNo-${idx}`}
                      FieldName="GRN No"
                      value={item.grnNo || ""}
                      handleInputChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], grnNo: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InputField
                      Type="date"
                      Name={`grnDate-${idx}`}
                      IdName={`grnDate-${idx}`}
                      FieldName="GRN Date"
                      value={item.grnDate || ""}
                      handleInputChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], grnDate: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropDown
                      Options={makes.map((make) => ({
                        value: make,
                        label: make,
                      }))}
                      FieldName="Make"
                      IdName={`make-${idx}`}
                      values={item.make || ""}
                      handleOptionChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], make: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropDown
                      Options={categories.map((cat) => ({
                        value: cat,
                        label: cat,
                      }))}
                      FieldName="Category"
                      IdName={`category-${idx}`}
                      values={item.category || ""}
                      handleOptionChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], category: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropDown
                      Options={products.map((prod) => ({
                        value: prod,
                        label: prod,
                      }))}
                      FieldName="Product"
                      IdName={`product-${idx}`}
                      values={item.product || ""}
                      handleOptionChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], product: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropDown
                      Options={models.map((model) => ({
                        value: model,
                        label: model,
                      }))}
                      FieldName="Model"
                      IdName={`model-${idx}`}
                      values={item.model || ""}
                      handleOptionChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], model: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DropDown
                      Options={items.map((item) => ({
                        value: item,
                        label: item,
                      }))}
                      FieldName="Item"
                      IdName={`item-${idx}`}
                      values={item.item || ""}
                      handleOptionChange={(_field: string, value: string) => {
                        const newItems = [...selectedItems];
                        newItems[idx] = { ...newItems[idx], item: value };
                        setSelectedItems(newItems);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={handleAddRow}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Row
          </button>
        </div>
      </div>
    </div>
  );
};

export default GRNToVendorBill;
