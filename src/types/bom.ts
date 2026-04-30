export interface BomTypeResponse {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number | null;
  dateUpdated: string | null;
  name: string;
  type: string[];
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

export interface AccessoryItem {
  id: number;
  itemId: number;
  itemCode: string;
  itemName: string;
  make: string;
  model: string;
  unitPrice: number;
  categoryName: string;
  groupName: string;
  hsn: string;
  uomName: string;
  taxPercentage: number;
  quantity: number;
  saleRate: number | null;
  valuationMethodName: string;
  inventoryMethodName: string | null;
  inventoryTypeName: string | null;
}

export interface BomItem {
  bomId: string;
  bomName: string;
  bomType: string;
  bomChildItems: BomChildItem[];
  accessoryItemIds: number[];
  accessoryItems: AccessoryItem[];
  quantity: number;
  quoteRate?: number;
}

export interface Product {
  items: BomItem[];
}
