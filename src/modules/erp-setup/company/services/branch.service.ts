import { 
    IBranchCreate, 
    IBranchUpdate, 
    IBranchListResponse, 
    IBranchResponse 
} from '../interfaces/branch.types';
import { IBranchDropdownResponse } from '../interfaces/branch-dropdown.types';

const API_BASE_URL = '${process.env.REACT_APP_API_BASE_URL}';

export const branchService = {
    async getBranches(companyId: number, includeInactive: boolean = true): Promise<IBranchListResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBranch/company/${companyId}?includeInactive=${includeInactive}`);
            if (!response.ok) {
                throw new Error('Failed to fetch branches');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in getBranches:', error);
            throw error;
        }
    },

    async getBranchesDropdown(companyId: number, activeOnly: boolean = true): Promise<IBranchDropdownResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBranch/dropdown/company/${companyId}?activeOnly=${activeOnly}`);
            if (!response.ok) {
                throw new Error('Failed to fetch branch dropdown');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in getBranchesDropdown:', error);
            throw error;
        }
    },

    async createBranch(branchData: IBranchCreate): Promise<IBranchResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBranch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(branchData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create branch');
            }

            return data;
        } catch (error) {
            console.error('Error in createBranch:', error);
            throw error;
        }
    },

    async updateBranch(branchData: IBranchUpdate): Promise<IBranchResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBranch`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(branchData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update branch');
            }

            return data;
        } catch (error) {
            console.error('Error in updateBranch:', error);
            throw error;
        }
    },

    async deleteBranch(branchId: number, companyId: number): Promise<IBranchResponse> {
        try {
            const response = await fetch(`${API_BASE_URL}/CsBranch/${branchId}/company/${companyId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete branch');
            }

            return data;
        } catch (error) {
            console.error('Error in deleteBranch:', error);
            throw error;
        }
    }
};