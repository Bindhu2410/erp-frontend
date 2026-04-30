export interface GRNProduct {
  name: string;
  qtyDone: number;
  unitPrice: number;
  lotSerial?: string;
}

export interface GRN {
  vendor: string;
  products: GRNProduct[];
  location: string;
  lotSerial?: string;
  notes?: string;
}
