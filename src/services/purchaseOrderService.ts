import api from "./api";

export interface PurchaseOrderData {
  id?: number;
  poId?: string;
  status?: string;
  customerId?: number;
  quotationId?: number;
  salesOrderId?: string;
  dateCreated?: string;
  totalAmount?: number;
  customerName?: string;
  [key: string]: any;
}

export interface PurchaseOrderResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class PurchaseOrderService {
  async getPurchaseOrders(): Promise<PurchaseOrderResponse> {
    try {
      const response = await api.get<any>("purchaseorder");
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("getPurchaseOrders error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async getPurchaseOrderById(id: number | string): Promise<PurchaseOrderResponse> {
    try {
      const response = await api.get<any>(`purchaseorder/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("getPurchaseOrderById error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async createPurchaseOrder(data: PurchaseOrderData): Promise<PurchaseOrderResponse> {
    try {
      const response = await api.post<any>("purchaseorder", data);
      return {
        success: response.status === 200 || response.status === 201,
        message: response.data?.message || "Purchase order created",
        data: response.data,
      };
    } catch (error: any) {
      console.error("createPurchaseOrder error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async updatePurchaseOrder(id: number | string, data: Partial<PurchaseOrderData>): Promise<PurchaseOrderResponse> {
    try {
      const response = await api.put<any>(`purchaseorder/${id}`, data);
      return {
        success: response.status === 200 || response.status === 204,
        message: response.data?.message || "Purchase order updated",
        data: response.data,
      };
    } catch (error: any) {
      console.error("updatePurchaseOrder error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async updateStatus(id: number | string, status: string): Promise<PurchaseOrderResponse> {
    try {
      const response = await api.patch<any>("purchaseorder/update-status", {
        id: Number(id),
        status,
      });
      return {
        success: response.status === 200 || response.status === 204,
        message: response.data?.message || "Status updated successfully.",
        data: response.data,
      };
    } catch (error: any) {
      console.error("updateStatus error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }
}

const purchaseOrderService = new PurchaseOrderService();
export default purchaseOrderService;