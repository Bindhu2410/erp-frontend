export interface PurchaseOrderItem {
  Id: number;
  PurchaseOrderId: number;
  ItemId: number;
  SupplierId: number;
  Quantity: number;
  itemName?: string;
  make?: string;
  model?: string;
  unitPrice?: number;
  uomName?: string;
}

export interface PurchaseOrder {
  Id: number;
  UserCreated: number;
  DateCreated?: string;
  UserUpdated: number;
  DateUpdated?: string;
  PoId: string;
  PurchaseRequisitionId: string;
  Status: string;
  SupplierId: number;
  QuotationId: number;
  SalesOrderId: number;
  DeliveryDate: string;
  Description: string;
  Items: PurchaseOrderItem[];
}

export interface PurchaseOrderFormData {
  PoId: string;
  PurchaseRequisitionId: string;
  SupplierId: number;
  QuotationId?: number;
  Status: string;
  DeliveryDate: string;
  Description?: string;
  Items: PurchaseOrderItem[];
}
