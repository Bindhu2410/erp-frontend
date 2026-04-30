export interface ChildItem {
  childItemId: number;
  quantity: number;
  make: string;
  model: string;
  product: string;
  categoryName: string;
  valuationMethodName: string;
  inventoryMethodName: string;
  unitPrice: number;
  itemName: string;
  itemCode: string;
  catNo: string;
  uomName: string;
  hsn: string;
  tax: number;
}

export interface BomDetail {
  id: number;
  bomId: string;
  bomName: string;
  bomType: string;
  childItems: ChildItem[];
}

export interface Issue {
  id: number;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
  locationId: string;
  bomIds: string[];
  issTo: string;
  issueTo: string;
  customerName: string;
  salesRepresentative: string;
  demoFrom: string;
  demoReport: string;
  docId: string;
  issueDate: string;
  bookingAddress: string;
  bookingQty: number;
  comments: string;
  narration: string;
}

export interface ReceiptItem {
  id: number;
  itemId: string;
  itemName: string;
  issueNo: string;
  batchNo: string;
  accYN: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  make: string;
  model: string;
  hsn: string;
  tax: number;
}

export interface Receipt {
  id: number;
  locationId: string;
  docId: string;
  docDate: string;
  refNo: string;
  refDate: string;
  receivedFrom: string;
  customerName: string;

  salesRepresentative: string;
  hospitalName: string;
  status: string;
  items: ReceiptItem[];
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
}
