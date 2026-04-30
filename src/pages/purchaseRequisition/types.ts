export interface Item {
  itemId: number;
  quantity: number;
  quoteRate?: number;
  purchaseRate?: number;
  make: string;
  model: string;
  categoryName: string;
  product: string;
  brand: string;
  itemName: string;
  itemCode: string;
  unitPrice: number;
  hsn: string;
  taxPercentage: number;
  uomName: string;
  catNo: string;
  valuationMethodName: string;
}

export interface PurchaseRequisitionData {
  id?: number;
  purchaseRequisitionId?: string;
  requesterName: string;
  description: string;
  supplierId: number;
  vendorName: string;
  deliveryDate: string;
  budgetAmount: number;
  status: string;
  userCreated: number;
  userUpdated: number;
  items: Item[];
}
