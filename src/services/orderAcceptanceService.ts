import api from "./api";

export interface OrderAcceptanceResponse {
  success?: boolean;
  message?: string;
  data?: any;
}

const orderAcceptanceService = {
  async createFromPo(
    purchaseOrderId: string | number
  ): Promise<OrderAcceptanceResponse> {
    try {
      // POST to create-from-po/{purchaseOrderId} - no body expected
      const endpoint = `OrderAcceptance/create-from-po/${purchaseOrderId}`;
      // api.post expects a body param; send empty object
      const response = await api.post<any>(endpoint, {});
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("createFromPo error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  },
};

export default orderAcceptanceService;
