export interface Product {
  includedChildItems: any;
  bomId: number;
  bomName: string;
  bomType: string;
  bomChildItems: BomChildItem[];
  accessoryItemIds: number[];
  accessoryItems: any[];
  quantity: number;
  // Legacy fields maintained for backward compatibility
  id?: number;
  itemId?: number;
  itemName?: string;
  category?: string;
  unitPrice?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  isActive?: boolean;
  make?: string;
  model?: string;
  hsn?: string;
  taxPercentage?: number;
  itemCode?: string;
}

export interface ProductOption {
  itemId: number;
  itemCode: string;
  itemName: string;
  unitPrice?: number;
  referencedBy?: any[];
  category?: string;
  includedChildItems?: any[];
  accessoriesItems?: any[];
  hsn?: string;
  taxPercentage?: number;
  uom?: string;
  make?: string;
  model?: string;
  parentId?: number; // Added to fix compile error
}

export interface BomChildItem {
  id: number;
  make: string;
  model: string;
  product: string;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  quoteRate?: number;
  hsn: string;
  taxPercentage: number;
  categoryName: string;
}

export interface EnhancedProduct {
  bomId: string;
  bomName: string;
  bomType: string;
  bomChildItems: BomChildItem[];
  accessoryItemIds: number[];
  accessoryItems: any[];
  quantity: number;
  // Additional fields that might be needed from the old interface
  itemId?: number;
  itemName?: string;
  category?: string;
  unitPrice?: number;
  hsn?: string;
  taxPercentage?: number;
  make?: string;
  model?: string;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  isActive?: boolean;
  itemCode?: string;
}

export interface SalesProductsProps {
  onProductsChange: (products: EnhancedProduct[]) => void;
  products: EnhancedProduct[];
  showButton?: boolean;
  onSaveProducts?: (products: EnhancedProduct[]) => void;
  showProductForm?: boolean;
  showActions?: boolean;
}
