import React, { useState } from "react";
import ReusableTable, {
  TableColumn,
  TableAction,
} from "../../../components/common/ReusableTable";
import CommonFilterSection, {
  FilterConfig,
  FilterValues,
  FilterField,
} from "../../../components/common/CommonFilterSection";
import AddPriceItemModal from "./components/AddPriceItemModal";
import ViewPriceItemModal from "./components/ViewPriceItemModal";
import EditPriceItemModal from "./components/EditPriceItemModal";
import RemovePriceItemModal from "./components/RemovePriceItemModal";

// Import the data from JSON file
import priceListData from "./json/priceListData.json";

const ItemPriceList: React.FC = () => {
  // Cast imported data to the correct type
  const data = priceListData as unknown as any;

  // State for product list
  const [priceItems, setPriceItems] = useState<any[]>(data.priceItems);
  // State for filters
  const [filters, setFilters] = useState<FilterValues>({
    searchTerm: "",
    category: "",
    minPrice: "",
    maxPrice: "",
  });

  // Filter configuration
  const filterConfig: FilterConfig = {
    fields: [
      {
        key: "searchTerm",
        label: "Product",
        type: "text",
        placeholder: "Search by product name or SKU...",
      },
      {
        key: "category",
        label: "Category",
        type: "select",
        options: [{ value: "", label: "All Categories" }, ...data.categories],
      },
      {
        key: "minPrice",
        label: "Min Price",
        type: "text",
        placeholder: "0",
      },
      {
        key: "maxPrice",
        label: "Max Price",
        type: "text",
        placeholder: "0",
      },
    ],
    columns: 4,
    showResetButton: true,
    showSearchButton: true,
  };

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // State for add/edit form
  const [enableTieredPricing, setEnableTieredPricing] = useState(false);
  const [priceTiers, setPriceTiers] = useState<any[]>([
    { minQuantity: 2, maxQuantity: 5, price: 0 },
  ]);
  const [editPriceTiers, setEditPriceTiers] = useState<any[]>([]);
  const [basePrice, setBasePrice] = useState<number | "">("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  // Handle form filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      category: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  // Filter items based on criteria
  const filteredItems = priceItems.filter((item) => {
    let matchesSearch = true;
    let matchesCategory = true;
    let matchesMinPrice = true;
    let matchesMaxPrice = true;

    // Filter by search term
    if (filters.searchTerm) {
      matchesSearch =
        item.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(filters.searchTerm.toLowerCase());
    }

    // Filter by category
    if (filters.category) {
      matchesCategory =
        item.category.toLowerCase() === filters.category.toLowerCase();
    }

    // Filter by min price
    if (filters.minPrice) {
      matchesMinPrice = item.basePrice >= parseFloat(filters.minPrice);
    }

    // Filter by max price
    if (filters.maxPrice) {
      matchesMaxPrice = item.basePrice <= parseFloat(filters.maxPrice);
    }

    return (
      matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
    );
  });

  // Handle view item
  const handleViewItem = (itemId: number) => {
    // In a real application, you'd fetch the item details from an API
    const productData = data.productDetails[itemId.toString()];
    if (productData) {
      setSelectedItem(productData);
      setIsViewModalOpen(true);
    }
  };

  // Handle edit item
  const handleEditItem = (itemId: number) => {
    // In a real application, you'd fetch the item details from an API
    const productData = data.productDetails[itemId.toString()];
    if (productData) {
      setSelectedItem(productData);
      setBasePrice(productData.basePrice);
      setEnableTieredPricing(productData.priceTiers.length > 0);
      setEditPriceTiers(productData.priceTiers);
      setIsEditModalOpen(true);
    }
  };

  // Handle remove item
  const handleRemoveItem = (itemId: number) => {
    const itemToRemove = priceItems.find((item) => item.id === itemId);
    if (itemToRemove) {
      setSelectedItem({
        id: itemToRemove.id,
        sku: itemToRemove.sku,
        name: itemToRemove.name,
        category: itemToRemove.category,
        basePrice: itemToRemove.basePrice,
        priceTiers: [],
      });
      setIsRemoveModalOpen(true);
    }
  };

  // Add new price tier
  const addPriceTier = () => {
    setPriceTiers([
      ...priceTiers,
      { minQuantity: 2, maxQuantity: 5, price: 0 },
    ]);
  };

  // Add new edit price tier
  const addEditPriceTier = () => {
    setEditPriceTiers([
      ...editPriceTiers,
      { minQuantity: 2, maxQuantity: 5, price: 0 },
    ]);
  };

  // Remove price tier
  const removePriceTier = (index: number) => {
    if (priceTiers.length <= 1) {
      alert("You must have at least one price tier");
      return;
    }

    const newTiers = priceTiers.filter((_, i) => i !== index);
    setPriceTiers(newTiers);
  };

  // Remove edit price tier
  const removeEditPriceTier = (index: number) => {
    if (editPriceTiers.length <= 1) {
      alert("You must have at least one price tier");
      return;
    }

    const newTiers = editPriceTiers.filter((_, i) => i !== index);
    setEditPriceTiers(newTiers);
  };

  // Update price tier
  const updatePriceTier = (
    index: number,
    field: keyof any,
    value: number | null
  ) => {
    const newTiers = [...priceTiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value,
    };
    setPriceTiers(newTiers);
  };

  // Update edit price tier
  const updateEditPriceTier = (
    index: number,
    field: keyof any,
    value: number | null
  ) => {
    const newTiers = [...editPriceTiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value,
    };
    setEditPriceTiers(newTiers);
  };

  // Handle form submission for adding a product to price list
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you'd make an API call to save the data
    console.log("Adding product with ID:", selectedProductId);
    console.log("Base price:", basePrice);
    console.log("Tiered pricing enabled:", enableTieredPricing);
    if (enableTieredPricing) {
      console.log("Price tiers:", priceTiers);
    }
    setIsAddModalOpen(false);
    // Reset form
    setSelectedProductId("");
    setBasePrice("");
    setEnableTieredPricing(false);
    setPriceTiers([{ minQuantity: 2, maxQuantity: 5, price: 0 }]);
  };

  // Handle form submission for editing a product in price list
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you'd make an API call to save the data
    console.log("Editing product:", selectedItem);
    console.log("New base price:", basePrice);
    console.log("Tiered pricing enabled:", enableTieredPricing);
    if (enableTieredPricing) {
      console.log("New price tiers:", editPriceTiers);
    }
    setIsEditModalOpen(false);
  };

  // Handle confirming removal of an item
  const confirmRemove = () => {
    // In a real application, you'd make an API call to delete the item
    if (selectedItem) {
      console.log("Removing item:", selectedItem.id);
      setPriceItems(priceItems.filter((item) => item.id !== selectedItem.id));
    }
    setIsRemoveModalOpen(false);
  };

  // Format price in INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Handle product change in add modal
  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProductId(e.target.value);
  };

  // Handle base price change
  const handleBasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBasePrice(e.target.value ? parseFloat(e.target.value) : "");
  };

  // Handle tiered pricing toggle
  const handleTieredPricingToggle = () => {
    setEnableTieredPricing(!enableTieredPricing);
  };

  // Helper function for search
  const onSearch = () => {
    // In a real application, this would trigger a search operation
    console.log("Search with filters:", filters);
  };

  // Table columns definition
  const columns: TableColumn<any[]>[] = [
    {
      key: "index",
      title: "#",
      dataIndex: "id",
      render: (_, __, index) => index + 1,
    },
    {
      key: "sku",
      title: "SKU",
      dataIndex: "sku",
    },
    {
      key: "name",
      title: "Product Name",
      dataIndex: "name",
    },
    {
      key: "category",
      title: "Category",
      dataIndex: "category",
    },
    {
      key: "basePrice",
      title: "Base Price",
      dataIndex: "basePrice",
      render: (value) => formatPrice(value),
    },
    {
      key: "hasTieredPricing",
      title: "Tiered Pricing",
      dataIndex: "hasTieredPricing",
      render: (value) => (value ? "Yes" : "No"),
    },
  ];

  // Table actions definition
  const actions: TableAction<any>[] = [
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          View
        </div>
      ),
      onClick: (record) => handleViewItem(record.id),
      className:
        "border border-gray-300 hover:border-blue-500 hover:text-blue-500 bg-white text-gray-700 px-2 py-1 text-sm rounded-md flex items-center gap-1 transition",
    },
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
      onClick: (record) => handleEditItem(record.id),
      className:
        "border border-gray-300 hover:border-blue-500 hover:text-blue-500 bg-white text-gray-700 px-2 py-1 text-sm rounded-md flex items-center gap-1 transition",
    },
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
      ),
      onClick: (record) => handleRemoveItem(record.id),
      className:
        "border border-gray-300 hover:border-red-500 hover:text-red-500 bg-white text-gray-700 px-2 py-1 text-sm rounded-md flex items-center gap-1 transition",
    },
  ];

  return (
    <div className="bg-gray-100">
      <main className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Price List Items - {data.priceListDetails.name}
          </h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
            onClick={() => setIsAddModalOpen(true)}
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
            Add Product to Price List
          </button>
        </div>
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              You are viewing items for the{" "}
              <strong>{data.priceListDetails.name}</strong>. This price list is
              currently <strong>{data.priceListDetails.status}</strong> and
              priced in <strong>{data.priceListDetails.currency}</strong>.
            </span>
          </div>
        </div>{" "}
        {/* Search & Filter Section */}
        <CommonFilterSection
          filters={filters}
          config={filterConfig}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          onSearch={onSearch}
        />
        {/* Products Table */}
        <ReusableTable
          columns={columns}
          data={filteredItems}
          actions={actions}
          emptyState={{
            message: "No products found",
            subMessage: "Try adjusting your search filters",
          }}
        />
        {/* Modals */}
        <AddPriceItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          availableProducts={data.availableProducts}
          basePrice={basePrice}
          selectedProductId={selectedProductId}
          enableTieredPricing={enableTieredPricing}
          priceTiers={priceTiers}
          onProductChange={handleProductChange}
          onBasePriceChange={handleBasePriceChange}
          onTieredPricingToggle={handleTieredPricingToggle}
          onAddTier={addPriceTier}
          onRemoveTier={removePriceTier}
          onUpdateTier={updatePriceTier}
        />
        <ViewPriceItemModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          item={selectedItem}
          formatPrice={formatPrice}
          onEdit={() => {
            setIsViewModalOpen(false);
            if (selectedItem) {
              handleEditItem(selectedItem.id);
            }
          }}
        />
        <EditPriceItemModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          item={selectedItem}
          basePrice={basePrice}
          enableTieredPricing={enableTieredPricing}
          priceTiers={editPriceTiers}
          onBasePriceChange={handleBasePriceChange}
          onTieredPricingToggle={handleTieredPricingToggle}
          onAddTier={addEditPriceTier}
          onRemoveTier={removeEditPriceTier}
          onUpdateTier={updateEditPriceTier}
        />
        <RemovePriceItemModal
          isOpen={isRemoveModalOpen}
          onClose={() => setIsRemoveModalOpen(false)}
          item={selectedItem}
          onConfirmRemove={confirmRemove}
        />
      </main>
    </div>
  );
};

export default ItemPriceList;
