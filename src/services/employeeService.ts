import api from "./api";

export interface EmployeeData {
  id?: number | string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Mobile?: string;
  Active?: boolean;
  [key: string]: any;
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class EmployeeService {
  async uploadPhoto(file: File, employeeId?: string): Promise<any> {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = employeeId
        ? `Storage/upload/EmployeePhoto?employeeId=${encodeURIComponent(employeeId)}`
        : `Storage/upload/EmployeePhoto`;
      const response = await api.post<any>(url, fd);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("uploadPhoto error:", error);
      return { success: false, message: error?.message || "Upload failed" };
    }
  }

  async createEmployee(employeeData: EmployeeData, config?: any): Promise<EmployeeResponse> {
    try {
      const response = await api.post<any>(`SalesEmployee`, employeeData, config);
      return {
        success: response.status === 200 || response.status === 201,
        message: response.data?.message || "Employee created",
        data: response.data,
      };
    } catch (error: any) {
      console.error("createEmployee error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async getEmployees(
    page = 1,
    pageSize = 50,
    filters: Record<string, any> = {}
  ): Promise<EmployeeResponse> {
    try {
      const params = { Page: page, PageSize: pageSize, ...filters } as any;
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      ).toString();
      const endpoint = queryString
        ? `SalesEmployee?${queryString}`
        : `SalesEmployee`;
      const response = await api.get<any>(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("getEmployees error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async getEmployeeById(id: number | string): Promise<EmployeeResponse> {
    try {
      const response = await api.get<any>(`SalesEmployee/${id}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("getEmployeeById error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async updateEmployee(
    id: number | string,
    employeeData: Partial<EmployeeData>,
    config?: any
  ): Promise<EmployeeResponse> {
    try {
      const response = await api.put<any>(`SalesEmployee/${id}`, employeeData, config);
      return {
        success: response.status === 200 || response.status === 204,
        message: response.data?.message || "Employee updated",
        data: response.data,
      };
    } catch (error: any) {
      console.error("updateEmployee error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async deleteEmployee(id: number | string): Promise<EmployeeResponse> {
    try {
      const response = await api.delete<any>(`SalesEmployee/${id}`);
      return {
        success: response.status === 200 || response.status === 204,
        message: response.data?.message || "Employee deleted",
      };
    } catch (error: any) {
      console.error("deleteEmployee error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async searchEmployee(
    query: string,
    page = 1,
    pageSize = 50
  ): Promise<EmployeeResponse> {
    try {
      const params = { query, Page: page, PageSize: pageSize } as any;
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc: any, [k, v]) => {
          if (v !== undefined && v !== null) acc[k] = String(v);
          return acc;
        }, {})
      ).toString();
      const endpoint = queryString
        ? `SalesEmployee/search?${queryString}`
        : `SalesEmployee/search`;
      const response = await api.get<any>(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("searchEmployee error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async bulkCreateEmployees(list: EmployeeData[]): Promise<EmployeeResponse> {
    try {
      const response = await api.post<any>(`SalesEmployee/bulk`, list);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("bulkCreateEmployees error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async bulkUpdateEmployees(list: EmployeeData[]): Promise<EmployeeResponse> {
    try {
      const response = await api.put<any>(`SalesEmployee/bulk`, list);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("bulkUpdateEmployees error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }

  async getEmployeeCards(): Promise<EmployeeResponse> {
    try {
      const response = await api.get<any>(`Employee/cards`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("getEmployeeCards error:", error);
      return { success: false, message: error?.message || "Network error" };
    }
  }
}

const employeeService = new EmployeeService();
export default employeeService;
