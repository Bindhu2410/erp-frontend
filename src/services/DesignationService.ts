import api from "./api";

export interface Designation {
  id: number;
  code?: string;
  name: string;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number | null;
  dateUpdated?: string | null;
}

export interface DesignationResponse {
  success: boolean;
  message?: string;
  data?: Designation[];
}

class DesignationService {
  async getDesignations(): Promise<DesignationResponse> {
    try {
      const response = await api.get<Designation[]>("Designation");

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("getDesignations error:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }

  async getDesignationById(
    id: number | string
  ): Promise<DesignationResponse> {
    try {
      const response = await api.get<Designation>(`Designation/${id}`);

      return {
        success: true,
        data: [response.data],
      };
    } catch (error: any) {
      console.error("getDesignationById error:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }
}

const designationService = new DesignationService();
export default designationService;
export {};