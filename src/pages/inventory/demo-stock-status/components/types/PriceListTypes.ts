// Types for Price List components
export interface PriceItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  hasTieredPricing: boolean;
}

export interface PriceTier {
  minQuantity: number;
  maxQuantity: number | null;
  price: number;
}

export interface ProductDetails {
  id: number;
  sku: string;
  name: string;
  category: string;
  basePrice: number;
  priceTiers: PriceTier[];
}

export interface PriceListInfo {
  id: string;
  name: string;
  status: string;
  currency: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface ProductOption {
  id: string;
  sku: string;
  name: string;
}

export interface FilterState {
  searchTerm: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

export interface PriceListData {
  priceItems: PriceItem[];
  priceListDetails: PriceListInfo;
  productDetails: Record<string, ProductDetails>;
  categories: CategoryOption[];
  availableProducts: ProductOption[];
}
