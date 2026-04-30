import React, { useState, useMemo } from "react";
import ItemModal from "./components/ItemModal";
import Navbar from "./components/Navbar";
import CostComponentModal from "./components/CostComponentModal";

import ReusableTable, {
  TableColumn,
  TableAction,
} from "../../../components/common/ReusableTable";
import CommonFilterSection, {
  FilterConfig,
  FilterValues,
} from "../../../components/common/CommonFilterSection";
import sampleData from "./json/sampleData.json";
import formFields from "./json/formFields.json";

export interface CostComponent {
  id: string;
  category: string;
  calculationMethod: "fixed" | "percentage";
  value: number;
  effectiveDate: string;
}

export interface Item {
  id: string;
  name: string;
  baseUom: string;
  itemType: string;
  trackingMethod: "lot" | "serial" | "none";
  demoEligible: boolean;
  status: "active" | "inactive";
  defaultSalePrice?: number;
  defaultPurchasePrice?: number;
  targetProfitMargin?: number;
  calculatedLandedCost?: number;
  description?: string;
  costComponents?: CostComponent[];
  notes?: string;
}

const ItemMasterPage: React.FC = () => {
  const [isItemModalOpen, setIsItemModalOpen] = useState<boolean>(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [currentCostComponent, setCurrentCostComponent] =
    useState<CostComponent | null>(null);
  const [filters, setFilters] = useState<FilterValues>({
    itemType: "",
    trackingMethod: "",
    status: "active",
    searchTerm: "",
  });

  // Filter configuration for ItemMaster
  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "itemType",
        label: "Item Type",
        type: "select",
        options: formFields.filterOptions.itemType,
      },
      {
        key: "trackingMethod",
        label: "Tracking Method",
        type: "select",
        options: formFields.filterOptions.trackingMethod,
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: formFields.filterOptions.status,
      },
      {
        key: "searchTerm",
        label: "Search",
        type: "text",
        placeholder: "SKU, Name, Description",
      },
    ],
    columns: 4,
  };

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Convert the sample data from the JSON file
  const items: Item[] = useMemo(() => {
    return sampleData.items.map((item: any) => ({
      ...item,
      trackingMethod: (["lot", "serial", "none"].includes(item.trackingMethod)
        ? item.trackingMethod
        : "none") as "lot" | "serial" | "none",
      status: (item.status === "active" ? "active" : "inactive") as
        | "active"
        | "inactive",
      costComponents: (item.costComponents || []).map((cc: any) => ({
        ...cc,
        calculationMethod:
          cc.calculationMethod === "fixed"
            ? "fixed"
            : cc.calculationMethod === "percentage"
              ? "percentage"
              : "fixed",
      })),
    }));
  }, []);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by item type
      if (
        filters.itemType &&
        item.itemType.toLowerCase() !== filters.itemType.toLowerCase() &&
        !item.itemType.toLowerCase().includes(filters.itemType.toLowerCase())
      ) {
        return false;
      }

      // Filter by tracking method
      if (
        filters.trackingMethod &&
        item.trackingMethod !== filters.trackingMethod
      ) {
        return false;
      }

      // Filter by status
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          item.id.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          (item.description &&
            item.description.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [items, filters]);

  // Render the tracking method badge
  const renderTrackingBadge = (method: string) => {
    switch (method) {
      case "lot":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-600">
            Lot Tracked
          </span>
        );
      case "serial":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-yellow-100 text-yellow-600">
            Serial Tracked
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
            None
          </span>
        );
    }
  };

  // Function to render status badge
  const renderStatusBadge = (status: any) => {
    const s = typeof status === "string" ? status.toLowerCase() : String(status ?? "").toLowerCase();
    if (s === "active") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-md bg-green-100 text-green-600">
          Active
        </span>
      );
    }
    if (s === "inactive") {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-md bg-red-100 text-red-600">
          Inactive
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-600">
        {status ?? "N/A"}
      </span>
    );
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Define table columns
  const columns: TableColumn<Item>[] = [
    {
      key: "id",
      title: "SKU",
      dataIndex: "id",
      render: (value, record) => (
        <button
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          onClick={() => showItemModal(record)}
        >
          {value}
        </button>
      ),
    },
    {
      key: "name",
      title: "Item Name",
      dataIndex: "name",
    },
    {
      key: "baseUom",
      title: "Base UOM",
      dataIndex: "baseUom",
    },
    {
      key: "itemType",
      title: "Item Type",
      dataIndex: "itemType",
    },
    {
      key: "trackingMethod",
      title: "Tracking",
      dataIndex: "trackingMethod",
      render: (value) => renderTrackingBadge(value),
    },
    {
      key: "demoEligible",
      title: "Demo Eligible",
      dataIndex: "demoEligible",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "status",
      render: (value) => renderStatusBadge(value),
    },
  ];

  // Define table actions
  const actions: TableAction<Item>[] = [
    {
      label: (
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit
        </div>
      ),
      onClick: (record) => showItemModal(record),
      className:
        "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded-md flex items-center gap-1 transition",
    },
  ];

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const renderItemsTable = () => {
    return (
      <ReusableTable
        columns={columns}
        data={currentItems}
        actions={actions}
        pagination={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredItems.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        emptyState={{
          message: "No items match the current filters",
          subMessage: "Try adjusting your search criteria",
        }}
      />
    );
  };

  const showItemModal = (item?: Item) => {
    if (item) {
      setCurrentItem(item);
    } else {
      setCurrentItem(null);
    }
    setIsItemModalOpen(true);
  };

  const showCostModal = (costComponent?: CostComponent) => {
    if (costComponent) {
      setCurrentCostComponent(costComponent);
    } else {
      setCurrentCostComponent(null);
    }
    setIsCostModalOpen(true);
  };

  const handleSaveItem = (item: Item) => {
    console.log("Saving item:", item);
    // API call to save item would go here
    setIsItemModalOpen(false);
  };

  const handleSaveCostComponent = (costComponent: CostComponent) => {
    console.log("Saving cost component:", costComponent);
    // Logic to update item with new cost component
    setIsCostModalOpen(false);
  };
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("Filtering items with:", updated);
      return updated;
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* <Navbar /> */}

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Item Master</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
            onClick={() => showItemModal()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Item
          </button>
        </div>

        <CommonFilterSection
          filters={filters}
          config={filterConfig}
          onFilterChange={handleFilterChange}
        />
        {renderItemsTable()}

        {isItemModalOpen && (
          <ItemModal
            isOpen={isItemModalOpen}
            onClose={() => setIsItemModalOpen(false)}
            onSave={handleSaveItem}
            item={currentItem}
            onAddCostComponent={() => showCostModal()}
          />
        )}

        {isCostModalOpen && (
          <CostComponentModal
            isOpen={isCostModalOpen}
            onClose={() => setIsCostModalOpen(false)}
            onSave={handleSaveCostComponent}
            costComponent={currentCostComponent}
          />
        )}
      </main>
    </div>
  );
};

export default ItemMasterPage;
