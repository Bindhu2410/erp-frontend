import api from "./api";

export interface IssueItemPayload {
  id?: number;
  sNo: number;
  make: string;
  category: string;
  product: string;
  model: string;
  item: string;
  equIns: string;
  batchNo: string;
  receiptNo: string;
  unit: string;
  qtyAvl?: number;
  qty: number;
  rate: number;
  amount: number;
  remarks: string;
}

export interface OptionalItemPayload {
  id?: number;
  sNo: number;
  optMake: string;
  optCategory: string;
  optProduct: string;
  optModel: string;
  optItem: string;
  optItemDesc: string;
  optQty: number;
  optRate: number;
  optAmount: number;
}

export interface IssuePayload {
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
  partyBranch: string;
  status: string;
  salesRepresentative: string;
  goodsConsignFrom: string;
  goodsConsignTo: string;
  deliveredBy: string;
  bookingAddress: string;
  bookingQty: number;
  appValue: number;
  receivedOn: string;
  bomName?: string;
  demoFrom?: string;
  demoReport?: string;
  demoRequest?: string;
  demoRemarks?: string;
  docId: string;
  issueDate: string;
  refNo: string;
  refDate: string;
  comments: string;
  narration: string;
  receiptId?: string;
  generateInvoice: string;
  billNo: string;
  billDate: string;
  doctorName: string;
  billingDescription: string;
  billingAmount: number;
  gross: number;
  totalQty: number;
  amountInWords: string;
  ewayBillNo?: string;
  ewayBillDate?: string;
  transporter?: string;
  vehicleNo?: string;
  hsn?: string;
  gstin?: string;
  optionalItems?: OptionalItemPayload[];
  issueItems?: IssueItemPayload[];
}

export interface BomChildItem {
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
  childItems: BomChildItem[];
}

export interface IssueResponse {
  issue: IssuePayload;
  bomDetails: BomDetail[];
}

const issueService = {
  getAll: async (): Promise<IssueResponse[]> => {
    const response = await api.get<IssueResponse[]>("Issues");
    return response.data;
  },

  getById: async (id: number): Promise<IssueResponse> => {
    const response = await api.get<IssueResponse>(`Issues/${id}`);
    return response.data;
  },

  create: async (data: IssuePayload): Promise<IssueResponse> => {
    const response = await api.post<IssueResponse>("Issues", data);
    return response.data;
  },

  update: async (id: number, data: IssuePayload): Promise<IssueResponse> => {
    const response = await api.put<IssueResponse>(`Issues/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`Issues/${id}`);
  },
};

export default issueService;
