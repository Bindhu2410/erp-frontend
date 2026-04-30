import api from "./api";

export interface LeadsDropdownRequest {
  searchText?: string;
  pageNumber: number;
  pageSize: number;
}

export interface LeadsDropdownResult {
  id: number;
  leadId: string;
  customerName: string;
}

export interface LeadsDropdownResponse {
  results: LeadsDropdownResult[];
  totalRecords: number;
}

const salesLeadService = {
  getDropdown: async (request: LeadsDropdownRequest): Promise<LeadsDropdownResponse> => {
    const response = await api.post<LeadsDropdownResponse>("SalesLead/dropdown", request);
    return response.data;
  }
};

export default salesLeadService;
