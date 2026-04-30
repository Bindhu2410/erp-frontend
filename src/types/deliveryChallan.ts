export interface DeliveryChallan {
  id: number;
  deliveryChallanId: string;
  deliveryDate: string;
  salesOrderId?: number;
  salesmanId?: number;
  partyId?: number;
  deliveryStatus?: string;
  dispatchAddress?: string;
  priority?: string;
  transporterName?: string;
  vehicleNo?: string;
  driverName?: string;
  driverContact?: number;
  modeOfDelivery?: string;
  notes?: string;

  // Header Details from UI
  location?: string;
  dispatchedBy?: string;
  deliveredBy?: string;
  goodsConsignFrom?: string;
  goodsConsignTo?: string;
  bookingAddress?: string;
  bookingQty?: number;
  appValue?: number;
  deliveryAt?: string;
  deliveryAdd1?: string;
  deliveryAdd2?: string;
  documentThrough?: string;
  invoiceNo?: string;
  invoiceDate?: string;

  // Footer Details
  grossAmount?: number;
  netAmount?: number;
  totalQty?: number;
  amountInWords?: string;
  deliveryTo?: string;
  remarks?: string;
  preparedBy?: string;
  authorizedBy?: string;
  receivedBy?: string;

  // Mapped Values for Response
  salesOrderNo?: string;
  salesmanName?: string;
  partyName?: string;
  itemDetails?: DeliveryChallanItemResponse[];
}

export interface DeliveryChallanItem {
  id?: number;
  deliveryChallanId: number;
  itemId: number;
  qty: number;
  unitPrice?: number;
  amount?: number;

  // Item Grid Details
  soNo?: string;
  make?: string;
  category?: string;
  product?: string;
  model?: string;
  visualItemId?: string;
  equlIns?: string;
  matchNo?: string;
  ordQty?: number;
  currentStock?: number;
  unit?: string;
}

export interface DeliveryChallanItemResponse extends DeliveryChallanItem {
  itemName?: string;
  itemCode?: string;
}

export interface DeliveryChallanRequest {
  id?: number;
  deliveryDate: string;
  deliveryChallanId?: string;
  salesOrderId?: number;
  salesmanId?: number;
  partyId?: number;
  deliveryStatus?: string;
  dispatchAddress?: string;
  priority?: string;
  transporterName?: string;
  vehicleNo?: string;
  driverName?: string;
  driverContact?: number;
  modeOfDelivery?: string;
  notes?: string;

  // Header Details
  location?: string;
  dispatchedBy?: string;
  deliveredBy?: string;
  goodsConsignFrom?: string;
  goodsConsignTo?: string;
  bookingAddress?: string;
  bookingQty?: number;
  appValue?: number;
  deliveryAt?: string;
  deliveryAdd1?: string;
  deliveryAdd2?: string;
  documentThrough?: string;
  invoiceNo?: string;
  invoiceDate?: string;

  // Footer Details
  grossAmount?: number;
  netAmount?: number;
  totalQty?: number;
  amountInWords?: string;
  deliveryTo?: string;
  remarks?: string;
  preparedBy?: string;
  authorizedBy?: string;
  receivedBy?: string;

  userCreated?: number;
  userUpdated?: number;
  items: DeliveryChallanItemRequest[];
}

export interface DeliveryChallanItemRequest {
  itemId: number;
  qty: number;
  unitPrice?: number;
  amount?: number;
  soNo?: string;
  make?: string;
  category?: string;
  product?: string;
  model?: string;
  visualItemId?: string;
  equlIns?: string;
  matchNo?: string;
  ordQty?: number;
  currentStock?: number;
  unit?: string;
}

export interface DeliveryChallanGridRequest {
  page: number;
  pageSize: number;
  searchText?: string;
  status?: string;
}

export interface DeliveryChallanGridResponse {
  data: DeliveryChallan[];
  totalRecords: number;
}
