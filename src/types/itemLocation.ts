export interface ItemLocation {
  id: number;
  itemId: number;
  warehouseId: number;
  rack: string;
  shelf: string;
  columnNo: string;
  inPlace: string;
}

// References to items that can be used in dropdowns
export interface ItemReference {
  id: number;
  name: String;
  itemName?: string;
  code?: string;
}

export interface WarehouseReference {
  id: number;
  name: string;
}
