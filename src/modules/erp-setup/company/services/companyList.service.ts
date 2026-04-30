import { ICompanyListResponse, ICompanySingleResponse } from "../interfaces/companyList.types";

export interface ICompanyUpdateRequest {
  companyId: number;
  legalCompanyName: string;
  parentCompanyId?: number | null;
  registeredAddressLine1: string;
  registeredAddressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber?: string;
  emailAddress?: string;
  websiteUrl?: string;
  companyLogoPath?: string;
  baseCurrency: string;
  financialYearStartDate: string;
  financialYearEndDate: string;
  pan: string;
  tan: string;
  gstin: string;
  legalEntityType: string;
  legalNameAsPerPanTan: string;
}

export interface ICompanyCreateRequest {
  legalCompanyName: string;
  parentCompanyId?: number | null;
  registeredAddressLine1: string;
  registeredAddressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber?: string;
  emailAddress?: string;
  websiteUrl?: string;
  companyLogoPath?: string;
  baseCurrency: string;
  financialYearStartDate: string;
  financialYearEndDate: string;
  pan: string;
  tan: string;
  gstin: string;
  legalEntityType: string;
  legalNameAsPerPanTan: string;
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "${process.env.REACT_APP_API_BASE_URL}";

export const companyListService = {
  async getCompanies(): Promise<ICompanyListResponse> {
    try {
      // Ensure no double slashes in URL
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const url = `${baseUrl}/CsCompany`;
      console.log("Making API call to:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        // If 404, try alternative endpoints
        if (response.status === 404) {
          console.log("Trying alternative endpoint: /api/companies");
          const altResponse = await fetch(`${baseUrl}/companies`);
          if (altResponse.ok) {
            const data = await altResponse.json();
            console.log("Alternative API Response data:", data);
            return data;
          }
        }

        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to fetch companies: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("API Response data:", data);
      return data;
    } catch (error) {
      console.error("Error in companyListService.getCompanies:", error);
      throw error;
    }
  },

  async getCompanyById(companyId: number): Promise<ICompanySingleResponse> {
    try {
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const url = `${baseUrl}/CsCompany/${companyId}`;
      console.log("Making API call to get company by ID:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `Failed to fetch company: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("API Response data:", data);
      return data;
    } catch (error) {
      console.error("Error in companyListService.getCompanyById:", error);
      throw error;
    }
  },

  async createCompany(companyData: ICompanyCreateRequest): Promise<any> {
    try {
      // Ensure no double slashes in URL
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const url = `${baseUrl}/CsCompany`;
      console.log("Making POST API call to:", url);
      console.log("Create data:", companyData);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      console.log("POST Response status:", response.status);
      console.log("POST Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("POST API Error Response:", errorText);
        let errorMessage = `Failed to create company: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) errorMessage = errorJson.message;
          else if (errorJson.error) errorMessage = errorJson.error;
        } catch {
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("POST API Response data:", data);
      return data;
    } catch (error) {
      console.error("Error in companyListService.createCompany:", error);
      throw error;
    }
  },

  async updateCompany(companyData: ICompanyUpdateRequest): Promise<any> {
    try {
      // Ensure no double slashes in URL
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const url = `${baseUrl}/CsCompany`;
      console.log("Making PUT API call to:", url);
      console.log("Update data:", companyData);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(companyData),
      });

      console.log("PUT Response status:", response.status);
      console.log("PUT Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PUT API Error Response:", errorText);
        throw new Error(
          `Failed to update company: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      console.log("PUT API Response data:", data);
      return data;
    } catch (error) {
      console.error("Error in companyListService.updateCompany:", error);
      throw error;
    }
  },

  async deleteCompany(companyId: number): Promise<any> {
    try {
      // Ensure no double slashes in URL
      const baseUrl = API_BASE_URL.endsWith("/")
        ? API_BASE_URL.slice(0, -1)
        : API_BASE_URL;
      const url = `${baseUrl}/CsCompany/${companyId}`;
      console.log("Making DELETE API call to:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("DELETE Response status:", response.status);
      console.log("DELETE Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DELETE API Error Response:", errorText);
        throw new Error(
          `Failed to delete company: ${response.status} ${response.statusText}`,
        );
      }

      // Some DELETE APIs return empty response, handle both cases
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("DELETE API Response data:", data);
        return data;
      } else {
        console.log("DELETE API Response: No content");
        return { success: true };
      }
    } catch (error) {
      console.error("Error in companyListService.deleteCompany:", error);
      throw error;
    }
  },
};
