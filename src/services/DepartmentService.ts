import api from "./api";

export interface Department {
  id: number;
  name: string;
  headOfDepartment?: string;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number | null;
  dateUpdated?: string | null;
}

export interface DepartmentResponse {
  success: boolean;
  message?: string;
  data?: Department[];
}

class DepartmentService {
  async getDepartments(): Promise<DepartmentResponse> {
    try {
      const response = await api.get<Department[]>(`Department`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error("getDepartments error:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }

  async getDepartmentById(id: number | string): Promise<DepartmentResponse> {
    try {
      const response = await api.get<Department>(`Department/${id}`);

      return {
        success: true,
        data: [response.data],
      };
    } catch (error: any) {
      console.error("getDepartmentById error:", error);
      return {
        success: false,
        message: error?.message || "Network error",
      };
    }
  }
}

const departmentService = new DepartmentService();
export default departmentService;
export {};