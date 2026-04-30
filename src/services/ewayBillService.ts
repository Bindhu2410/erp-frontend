import api from "./api";

export interface EWayBillCancelRequest {
  ewayBillNo: number;
  cancelRsnCode: number;
  cancelRmrk: string;
}

export interface EWayBillUpdateVehicleRequest {
  ewayBillNo: number;
  vehicleNo: string;
  fromPlace: string;
  fromState: number;
  reasonCode: number;
  reasonRem: string;
  transMode: string;
  transDocNo: string;
  transDocDate: string;
  vehicleType: string;
}

export interface EWayBillResponse {
  success: boolean;
  ewayBillNo: string;
  ewayBillDate: string;
  validUpto: string;
  errorDetails?: string;
  infoDetails?: string;
}

const ewayBillService = {
  generate: async (issueId: number): Promise<EWayBillResponse> => {
    const response = await api.post<EWayBillResponse>(`EWayBill/generate/${issueId}`, {});
    return response.data;
  },

  get: async (ewayBillNo: string): Promise<EWayBillResponse> => {
    const response = await api.get<EWayBillResponse>(`EWayBill/${ewayBillNo}`);
    return response.data;
  },

  cancel: async (request: EWayBillCancelRequest): Promise<EWayBillResponse> => {
    const response = await api.post<EWayBillResponse>(`EWayBill/cancel`, request);
    return response.data;
  },

  updateVehicle: async (request: EWayBillUpdateVehicleRequest): Promise<EWayBillResponse> => {
    const response = await api.post<EWayBillResponse>(`EWayBill/update-vehicle`, request);
    return response.data;
  },
};

export default ewayBillService;
