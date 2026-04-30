import React, { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import api from "../../services/api";
import { Item } from "../../pages/purchaseRequisition/types";

interface ItemSelectionTableProps {
  onItemsChange: (
    items: {
      ItemId: number;
      Quantity: number;
      QuoteRate: number;
      PurchaseRate: number;
    }[],
  ) => void;
  onTotalChange: (total: number) => void;
  initialItems?: Item[];
}

const ItemSelectionTable: React.FC<ItemSelectionTableProps> = ({
  onItemsChange,
  onTotalChange,
  initialItems = [],
}) => {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    (Item & { quantity: number; rowId: number })[]
  >([]);
  const rowIdCounter = useRef(0);
  const [makes, setMakes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [itemNames, setItemNames] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Item> & { quantity: number }>({
    itemId: 0,
    itemName: "",
    make: "",
    model: "",
    categoryName: "",
    quantity: 1,
    quoteRate: 0,
    purchaseRate: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    if (initialItems.length > 0) {
      setSelectedItems(
        initialItems.map((item) => {
          rowIdCounter.current += 1;
          return {
            ...item,
            quantity: item.quantity || 1,
            rowId: rowIdCounter.current,
          };
        }),
      );
    }
  }, [initialItems]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await api.get("ItemDropdown/item-list");
        const itemsData = response.data || [];
        setItems(itemsData);

        const uniqueMakes = Array.from(
          new Set(itemsData.map((item: Item) => item.make)),
        ).filter((make): make is string => make !== null && make !== undefined);

        const uniqueCategories = Array.from(
          new Set(itemsData.map((item: Item) => item.categoryName)),
        ).filter(
          (category): category is string =>
            category !== null && category !== undefined,
        );

        const uniqueModels = Array.from(
          new Set(itemsData.map((item: Item) => item.model)),
        ).filter(
          (model): model is string => model !== null && model !== undefined,
        );

        const uniqueItemNames = Array.from(
          new Set(itemsData.map((item: Item) => item.itemName)),
        ).filter((name): name is string => name !== null && name !== undefined);

        setMakes(uniqueMakes);
        setCategories(uniqueCategories);
        setModels(uniqueModels);
        setItemNames(uniqueItemNames);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const getFilteredItems = (currentItem: Partial<Item>) => {
    return items.filter((item) => {
      if (currentItem.make && item.make !== currentItem.make) return false;
      if (currentItem.model && item.model !== currentItem.model) return false;
      if (
        currentItem.categoryName &&
        item.categoryName !== currentItem.categoryName
      ) {
        return false;
      }
      if (currentItem.itemName && item.itemName !== currentItem.itemName) {
        return false;
      }
      return true;
    });
  };

  const getFilteredOptions = (
    currentItem: Partial<Item>,
    field: keyof Item,
  ) => {
    const filteredItems = getFilteredItems(currentItem);

    switch (field) {
      case "itemName":
        return Array.from(
          new Set(filteredItems.map((item) => item.itemName)),
        ).filter(Boolean);
      case "make":
        return Array.from(
          new Set(filteredItems.map((item) => item.make)),
        ).filter(Boolean);
      case "model":
        return Array.from(
          new Set(filteredItems.map((item) => item.model)),
        ).filter(Boolean);
      case "categoryName":
        return Array.from(
          new Set(filteredItems.map((item) => item.categoryName)),
        ).filter(Boolean);
      default:
        return [];
    }
  };

  const autoFillItem = (currentItem: Partial<Item>) => {
    const filteredItems = getFilteredItems(currentItem);

    if (filteredItems.length === 1) {
      const matchedItem = filteredItems[0];
      return {
        ...matchedItem,
          quantity: currentItem.quantity || 1,
          quoteRate: matchedItem.quoteRate ?? 0,
          purchaseRate: matchedItem.purchaseRate ?? 0,
        };
    }

    return currentItem;
  };

  const handleAddItem = (item: Item) => {
    rowIdCounter.current += 1;
    setSelectedItems((prev) => [
      ...prev,
      { ...item, quantity: 1, rowId: rowIdCounter.current },
    ]);
  };

  const handleQuantityChange = (rowId: number, quantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.rowId === rowId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleItemFieldUpdate = (
    currentRowId: number,
    field: keyof Item,
    value: string,
  ) => {
    if (currentRowId === 0) {
      const updatedNewItem = { ...newItem, [field]: value };
      const autoFilledItem = autoFillItem(updatedNewItem);

      setNewItem(autoFilledItem as Partial<Item> & { quantity: number });

      if (autoFilledItem.itemId && autoFilledItem.itemId !== 0) {
        rowIdCounter.current += 1;
        setSelectedItems((prev) => [
          ...prev,
          {
            ...(autoFilledItem as Item),
            quantity: newItem.quantity,
            quoteRate: (autoFilledItem as Item).quoteRate ?? 0,
            purchaseRate: (autoFilledItem as Item).purchaseRate ?? 0,
            rowId: rowIdCounter.current,
          },
        ]);
        setIsAddingNew(false);
        setNewItem({
          itemId: 0,
          itemName: "",
          make: "",
          model: "",
          categoryName: "",
          quantity: 1,
          quoteRate: 0,
          purchaseRate: 0,
          unitPrice: 0,
        });
      }
    } else {
      setSelectedItems((prev) =>
        prev.map((item) => {
          if (item.rowId === currentRowId) {
            if (field === "itemName") {
              const matched = items.find((i) => i.itemName === value);
              if (matched) {
                return {
                  ...matched,
                  quantity: item.quantity,
                  purchaseRate: matched.purchaseRate ?? 0,
                  rowId: item.rowId,
                };
              }
            }

            const updatedItem = { ...item, [field]: value };
            const autoFilledItem = autoFillItem(updatedItem);
            return {
              ...(autoFilledItem as Item),
              quantity: item.quantity,
              rowId: item.rowId,
            };
          }
          return item;
        }),
      );
    }
  };

  const handleRemoveItem = (rowId: number) => {
    setSelectedItems((prev) => prev.filter((item) => item.rowId !== rowId));
  };

  useEffect(() => {
    const formattedItems = selectedItems.map((item) => ({
      ItemId: item.itemId,
      Quantity: item.quantity,
      QuoteRate: item.quoteRate ?? 0,
      PurchaseRate: item.purchaseRate ?? 0,
    }));
    onItemsChange(formattedItems);

    const total = selectedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    onTotalChange(total);
  }, [selectedItems]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <button
          onClick={() => setIsAddingNew(true)}
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Line Item
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3">Item Name</th>
            <th className="text-left p-3">Make</th>
            <th className="text-left p-3">Model</th>
            <th className="text-left p-3">Category</th>
            <th className="text-left p-3">Quantity</th>
            <th className="text-left p-3">Quote Rate</th>
            <th className="text-left p-3">Purchase Rate</th>
            <th className="text-center p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {isAddingNew && (
            <tr className="border-b bg-blue-50">
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded"
                  value={newItem.itemName}
                  onChange={(e) =>
                    handleItemFieldUpdate(0, "itemName", e.target.value)
                  }
                >
                  <option value="">Select Item</option>
                  {itemNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={newItem.make}
                  onChange={(e) =>
                    handleItemFieldUpdate(0, "make", e.target.value)
                  }
                  disabled={!!newItem.itemName}
                >
                  <option value="">Select Make</option>
                  {getFilteredOptions(newItem, "make").map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={newItem.model}
                  onChange={(e) =>
                    handleItemFieldUpdate(0, "model", e.target.value)
                  }
                  disabled={!!newItem.itemName}
                >
                  <option value="">Select Model</option>
                  {getFilteredOptions(newItem, "model").map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={newItem.categoryName}
                  onChange={(e) =>
                    handleItemFieldUpdate(0, "categoryName", e.target.value)
                  }
                  disabled={!!newItem.itemName}
                >
                  <option value="">Select Category</option>
                  {getFilteredOptions(newItem, "categoryName").map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ),
                  )}
                </select>
              </td>
              <td className="p-3">
                <input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({
                      ...prev,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="border p-1 w-20 rounded"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  value={newItem.quoteRate ?? 0}
                  readOnly
                  className="w-full border border-gray-300 p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  value={newItem.purchaseRate ?? 0}
                  readOnly
                  className="border p-1 w-24 rounded bg-gray-100 cursor-not-allowed"
                />
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewItem({
                      itemId: 0,
                      itemName: "",
                      make: "",
                      model: "",
                      categoryName: "",
                      quantity: 1,
                      quoteRate: 0,
                      purchaseRate: 0,
                      unitPrice: 0,
                    });
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </td>
            </tr>
          )}
          {selectedItems.map((item) => (
            <tr key={item.rowId} className="border-b">
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded"
                  value={item.itemName}
                  onChange={(e) =>
                    handleItemFieldUpdate(
                      item.rowId,
                      "itemName",
                      e.target.value,
                    )
                  }
                >
                  <option value="">Select Item</option>
                  {itemNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={item.make}
                  onChange={(e) =>
                    handleItemFieldUpdate(item.rowId, "make", e.target.value)
                  }
                  disabled={!!item.itemName}
                >
                  <option value="">Select Make</option>
                  {getFilteredOptions(item, "make").map((make) => (
                    <option key={make} value={make}>
                      {make}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={item.model}
                  onChange={(e) =>
                    handleItemFieldUpdate(item.rowId, "model", e.target.value)
                  }
                  disabled={!!item.itemName}
                >
                  <option value="">Select Model</option>
                  {getFilteredOptions(item, "model").map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <select
                  className="w-full border border-gray-300 p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-100"
                  value={item.categoryName}
                  onChange={(e) =>
                    handleItemFieldUpdate(
                      item.rowId,
                      "categoryName",
                      e.target.value,
                    )
                  }
                  disabled={!!item.itemName}
                >
                  <option value="">Select Category</option>
                  {getFilteredOptions(item, "categoryName").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-3">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.rowId, Number(e.target.value))
                  }
                  className="border p-1 w-20 rounded"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  value={item.quoteRate ?? 0}
                  readOnly
                  className="w-full border border-gray-300 p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  value={item.purchaseRate ?? 0}
                  readOnly
                  className="border p-1 w-24 rounded bg-gray-100 cursor-not-allowed"
                />
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => handleRemoveItem(item.rowId)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemSelectionTable;
