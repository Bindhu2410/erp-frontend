import axios from 'axios';

const API_BASE_URL = 'http://localhost:5104/api';

export interface IInventoryLocationDto {
  locationId: number;
  warehouseId: number;
  locationCode: string;
  locationName: string;
  locationCategory?: string;
  capacityWeight?: number;
  capacityWeightUom?: string;
  capacityVolume?: number;
  capacityVolumeUom?: string;
  capacityItemCount?: number;
}

export const inventoryLocationService = {
  getInventoryLocations: async () => {
    return await axios.get(`${API_BASE_URL}/CsInventoryLocation`);
  },
  
  getLocationsByWarehouse: async (warehouseId: number) => {
    // Note: The controller doesn't have a direct "by warehouse" endpoint in the snippets I saw, 
    // but typically it's needed. For now, we'll fetch all and filter in frontend if search is not used,
    // or use the search endpoint if available.
    return await axios.get(`${API_BASE_URL}/CsInventoryLocation/search?warehouseId=${warehouseId}&pageSize=1000`);
  },

  getLocationById: async (id: number) => {
    return await axios.get(`${API_BASE_URL}/CsInventoryLocation/${id}`);
  },

  createLocation: async (data: IInventoryLocationDto) => {
    return await axios.post(`${API_BASE_URL}/CsInventoryLocation`, data);
  },

  updateLocation: async (id: number, data: IInventoryLocationDto) => {
    return await axios.put(`${API_BASE_URL}/CsInventoryLocation/${id}`, data);
  },

  deleteLocation: async (id: number) => {
    return await axios.delete(`${API_BASE_URL}/CsInventoryLocation/${id}`);
  }
};
