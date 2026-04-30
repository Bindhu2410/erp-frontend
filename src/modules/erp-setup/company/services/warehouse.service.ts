import { 
  IWarehouseCreateRequest, 
  IWarehouseUpdateRequest, 
  IWarehouseResponse,
  IWarehouseItem
} from '../interfaces/warehouse.types';

const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '${process.env.REACT_APP_API_BASE_URL}').replace(/\/+$/, '');

export interface IWarehouseService {
  createWarehouse(warehouseData: any): Promise<any>;
  updateWarehouse(warehouseData: any): Promise<any>;
  deleteWarehouse(warehouseId: number): Promise<any>;
  getWarehouseById(warehouseId: number): Promise<any>;
  getWarehousesByCompany(companyId: number): Promise<any>;
  getWarehousesByBranch(branchId: number): Promise<any>;
  getWarehouses(): Promise<any>;
}

export const warehouseService: IWarehouseService = {
    async createWarehouse(warehouseData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(warehouseData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create warehouse');
            }
            return data;
        } catch (error) {
            console.error('Error in createWarehouse:', error);
            throw error;
        }
    },

    async updateWarehouse(warehouseData: any): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(warehouseData)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update warehouse');
            }
            return data;
        } catch (error) {
            console.error('Error in updateWarehouse:', error);
            throw error;
        }
    },

    async deleteWarehouse(warehouseId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse/${warehouseId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete warehouse');
            }
            return data;
        } catch (error) {
            console.error('Error in deleteWarehouse:', error);
            throw error;
        }
    },

    async getWarehouseById(warehouseId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse/${warehouseId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch warehouse details');
            }
            return data;
        } catch (error) {
            console.error('Error in getWarehouseById:', error);
            throw error;
        }
    },

    async getWarehousesByCompany(companyId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse/company/${companyId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch warehouses for company');
            }
            return data;
        } catch (error) {
            console.error('Error in getWarehousesByCompany:', error);
            throw error;
        }
    },

    async getWarehousesByBranch(branchId: number): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse/branch/${branchId}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch warehouses for branch');
            }
            return data;
        } catch (error) {
            console.error('Error in getWarehousesByBranch:', error);
            throw error;
        }
    },

    async getWarehouses(): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsWarehouse/all`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch all warehouses');
            }
            return data;
        } catch (error) {
            console.error('Error in getWarehouses:', error);
            throw error;
        }
    }
};

