import api from "./api";
import { 
  DeliveryChallan, 
  DeliveryChallanGridRequest, 
  DeliveryChallanGridResponse, 
  DeliveryChallanRequest 
} from "../types/deliveryChallan";

const deliveryChallanService = {
  getGrid: async (params: DeliveryChallanGridRequest): Promise<DeliveryChallanGridResponse> => {
    const response = await api.post<DeliveryChallanGridResponse>("DeliveryChallan/grid", params);
    return response.data;
  },

  getAll: async (): Promise<DeliveryChallan[]> => {
    const response = await api.get<DeliveryChallan[]>("DeliveryChallan");
    return response.data;
  },

  getById: async (id: number): Promise<DeliveryChallan> => {
    const response = await api.getById<DeliveryChallan>("DeliveryChallan", id);
    return response.data;
  },

  create: async (data: DeliveryChallanRequest): Promise<DeliveryChallan> => {
    const response = await api.post<DeliveryChallan>("DeliveryChallan", data);
    return response.data;
  },

  update: async (id: number, data: DeliveryChallanRequest): Promise<DeliveryChallan> => {
    const response = await api.put<DeliveryChallan>(`DeliveryChallan/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`DeliveryChallan/${id}`);
  }
};

export default deliveryChallanService;
