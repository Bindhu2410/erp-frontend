export interface StockOpeningBalanceItem {
  id?: number;
  sNo: number;
  make: string;
  category: string;
  product: string;
  model: string;
  itemId: number;
  uom: string;
  batch: string;
  quantity: number;
  rate: number;
  stockValue: number;
}

export interface StockOpeningBalance {
  id?: number;
  documentNo: string;
  location: string;
  locationId?: number;
  items: StockOpeningBalanceItem[];
  total?: number;
  remarks?: string;
  createdDate?: string;
  createdBy?: string;
  status?: string;
}

export interface StockOpeningBalanceListItem {
  id: number;
  documentNo: string;
  location: string;
  total: number;
  itemCount: number;
  status: string;
  createdDate: string;
  createdBy: string;
}
