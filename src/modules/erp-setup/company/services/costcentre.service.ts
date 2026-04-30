import {
  ICostCentreCreate,
  ICostCentreResponse,
} from "../interfaces/costcentre.types";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5104/api";

// Ensure URL ends with a slash for consistent concatenation
const getBaseUrl = () =>
  API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

export interface ICostCentreService {
  createCostCentre(companyId: number, costCentreData: ICostCentreCreate): Promise<any>;
  getAllCostCentres(): Promise<ICostCentreResponse[]>;
  getCostCentres(companyId: number): Promise<ICostCentreResponse[]>;
  getCostCentreById(costCentreId: number): Promise<any>;
  updateCostCentre(costCentreId: number, costCentreData: ICostCentreCreate): Promise<any>;
  deleteCostCentre(costCentreId: number): Promise<void>;
  getCostCentreDropdown(companyId: number, activeOnly?: boolean): Promise<ICostCentreResponse[]>;
}

export const costCentreService: ICostCentreService = {
  async createCostCentre(
    companyId: number,
    costCentreData: ICostCentreCreate
  ): Promise<any> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/company/${companyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(costCentreData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create cost centre");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in createCostCentre:", error);
      throw error;
    }
  },

  async getAllCostCentres(): Promise<ICostCentreResponse[]> {
    try {
      const response = await fetch(`${getBaseUrl()}CsCostCentre/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch all cost centres");
      }

      const responseData = await response.json();
      const content = responseData.data;
      return Array.isArray(content) ? content : (content?.items || []);
    } catch (error) {
      console.error("Error in getAllCostCentres:", error);
      throw error;
    }
  },

  async getCostCentres(companyId: number): Promise<ICostCentreResponse[]> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/company/${companyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cost centres");
      }

      const responseData = await response.json();
      const content = responseData.data;
      return Array.isArray(content) ? content : (content?.items || []);
    } catch (error) {
      console.error("Error in getCostCentres:", error);
      throw error;
    }
  },

  async getCostCentreById(costCentreId: number): Promise<any> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/${costCentreId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cost centre details");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in getCostCentreById:", error);
      throw error;
    }
  },

  async updateCostCentre(
    costCentreId: number,
    costCentreData: ICostCentreCreate
  ): Promise<any> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/${costCentreId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(costCentreData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update cost centre");
      }

      return await response.json();
    } catch (error) {
      console.error("Error in updateCostCentre:", error);
      throw error;
    }
  },

  async deleteCostCentre(costCentreId: number): Promise<void> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/${costCentreId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete cost centre");
      }
    } catch (error) {
      console.error("Error in deleteCostCentre:", error);
      throw error;
    }
  },

  async getCostCentreDropdown(
    companyId: number,
    activeOnly: boolean = true
  ): Promise<ICostCentreResponse[]> {
    try {
      const response = await fetch(
        `${getBaseUrl()}CsCostCentre/company/${companyId}/dropdown?activeOnly=${activeOnly}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cost centre dropdown");
      }

      const responseData = await response.json();
      return responseData.data || [];
    } catch (error) {
      console.error("Error in getCostCentreDropdown:", error);
      throw error;
    }
  },
};
