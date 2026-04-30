
import React, { useEffect, useState } from "react";
import api from "../../services/api";

interface DemoItem {
  itemId: number;
  itemName: string;
  itemCode: string;
  groupName?: string;
  // Add other fields as needed
}

const DemoAvailability: React.FC = () => {
  const [demoItems, setDemoItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DemoItem | null>(null);

  useEffect(() => {
    const fetchDemoItems = async () => {
      setLoading(true);
      setError(null);
      try {
        // GET /demo-items (should map to /api/ItemMaster filtered by groupName = 'Demo')
        const response = await api.get("ItemMaster");
        const filtered = (response.data || []).filter(
          (item: DemoItem) => item.groupName === "Demo"
        );
        setDemoItems(filtered);
      } catch (err) {
        setError("Failed to load demo items");
        setDemoItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDemoItems();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const itemId = Number(e.target.value);
    const item = demoItems.find((i) => i.itemId === itemId) || null;
    setSelectedItem(item);
    // Here you would trigger GET /booked-dates?itemId and GET /availability as needed
  };

  return (
    <div>
      <h2>Demo Product Availability</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ margin: "1em 0" }}>
        <label htmlFor="demo-item-select">Select Demo Item: </label>
        <select
          id="demo-item-select"
          onChange={handleSelectChange}
          value={selectedItem?.itemId || ""}
        >
          <option value="">-- Select --</option>
          {demoItems.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.itemName} ({item.itemCode})
            </option>
          ))}
        </select>
      </div>
      {selectedItem && (
        <div>
          <h3>Selected Item Details</h3>
          <p>
            <strong>Name:</strong> {selectedItem.itemName} <br />
            <strong>Code:</strong> {selectedItem.itemCode}
          </p>
          {/* Here you would show calendar and availability info for the selected item */}
        </div>
      )}
    </div>
  );
};

export default DemoAvailability;
