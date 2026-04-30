import { ISacCodeFormData, ISacCodeApiResponse, ISacCodeApiRequest } from "../interfaces/sac.types";

const BASE_URL = "http://localhost:5104/api";

export const sacService = {
    getAll: async (companyId: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsSacCode?CompanyId=${companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch SAC codes');
            }

            const responseData: ISacCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getAll SAC codes:', error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsSacCode/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch SAC code');
            }

            const responseData: ISacCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getById SAC code:', error);
            throw error;
        }
    },

    create: async (companyId: number, sac: ISacCodeFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: ISacCodeApiRequest = {
                SacCodeId: 0, // New code
                CompanyId: companyId,
                SacCode: sac.sacCode,
                Description: sac.sacDescription,
                DefaultGstRate: sac.gstRate,
                IgstRate: sac.igstRate,
                CgstRate: sac.cgstRate,
                SgstRate: sac.sgstRate,
                UtgstRate: sac.utgstRate,
                CessRate: sac.cessRate,
                IsActive: sac.isActive
            };

            const response = await fetch(`${BASE_URL}CsSacCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create SAC code');
            }

            const responseData: ISacCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in create SAC code:', error);
            throw error;
        }
    },

    update: async (companyId: number, id: number, sac: ISacCodeFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: ISacCodeApiRequest = {
                SacCodeId: id,
                CompanyId: companyId,
                SacCode: sac.sacCode,
                Description: sac.sacDescription,
                DefaultGstRate: sac.gstRate,
                IgstRate: sac.igstRate,
                CgstRate: sac.cgstRate,
                SgstRate: sac.sgstRate,
                UtgstRate: sac.utgstRate,
                CessRate: sac.cessRate,
                IsActive: sac.isActive
            };

            const response = await fetch(`${BASE_URL}CsSacCode/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to update SAC code');
            }

            const responseData: ISacCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in update SAC code:', error);
            throw error;
        }
    },

    delete: async (companyId: number, id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsSacCode/${id}?CompanyId=${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete SAC code');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in delete SAC code:', error);
            throw error;
        }
    },
};
