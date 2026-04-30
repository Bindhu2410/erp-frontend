import { IHsnCodeFormData, IHsnCodeApiResponse, IHsnCodeApiRequest } from "../interfaces/hsn.types";

const BASE_URL = "${process.env.REACT_APP_API_BASE_URL}";

export const hsnService = {
    getAll: async (companyId: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsHsnCode?CompanyId=${companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch HSN codes');
            }

            const responseData: IHsnCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getAll HSN codes:', error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsHsnCode/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch HSN code');
            }

            const responseData: IHsnCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getById HSN code:', error);
            throw error;
        }
    },

    create: async (companyId: number, hsn: IHsnCodeFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: IHsnCodeApiRequest = {
                HsnCodeId: 0, // New code
                CompanyId: companyId,
                Code: hsn.hsnCode,
                Description: hsn.hsnDescription,
                DefaultGstRate: hsn.gstRate,
                IgstRate: hsn.igstRate,
                CgstRate: hsn.cgstRate,
                SgstRate: hsn.sgstRate,
                UtgstRate: hsn.utgstRate,
                CessRate: hsn.cessRate,
                IsActive: hsn.isActive
            };

            const response = await fetch(`${BASE_URL}CsHsnCode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create HSN code');
            }

            const responseData: IHsnCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in create HSN code:', error);
            throw error;
        }
    },

    update: async (companyId: number, id: number, hsn: IHsnCodeFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: IHsnCodeApiRequest = {
                HsnCodeId: id,
                CompanyId: companyId,
                Code: hsn.hsnCode,
                Description: hsn.hsnDescription,
                DefaultGstRate: hsn.gstRate,
                IgstRate: hsn.igstRate,
                CgstRate: hsn.cgstRate,
                SgstRate: hsn.sgstRate,
                UtgstRate: hsn.utgstRate,
                CessRate: hsn.cessRate,
                IsActive: hsn.isActive
            };

            const response = await fetch(`${BASE_URL}CsHsnCode/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to update HSN code');
            }

            const responseData: IHsnCodeApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in update HSN code:', error);
            throw error;
        }
    },

    delete: async (companyId: number, id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsHsnCode/${id}?CompanyId=${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete HSN code');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in delete HSN code:', error);
            throw error;
        }
    },
};
