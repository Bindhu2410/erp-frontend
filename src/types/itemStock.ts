export interface ItemStock {
  id: number;
  itemId: number;
  warehouseId: number;
  locationId: number;
  quantityOnHand: number;
  allocatedQty: number;
  stockValue: number;
  reorderQty: number;
  lastUpdated: string;
}

export interface ItemStockWithDetails extends ItemStock {
  itemName?: string;
  itemCode?: string;
  warehouseName?: string;
  locationName?: string;
}

export interface StockTransaction {
  id: number;
  itemId: number;
  warehouseId: number;
  locationId: number | null;
  transactionType: string; // e.g. GRN, ISSUE, TRANSFER, ADJUSTMENT
  referenceNo: string; // e.g. GRN No, Invoice No, Transfer Note
  quantity: number; // Positive = IN, Negative = OUT
  unitPrice: number | null; // Cost per unit at transaction time
  totalValue: number | null; // quantity * unit_price
  transactionDate: string; // ISO date string
  createdBy: number | null;
  remarks: string | null;
}

export interface StockTransactionWithDetails extends StockTransaction {
  itemName?: string;
  itemCode?: string;
  warehouseName?: string;
  locationName?: string;
  createdByName?: string;
}
