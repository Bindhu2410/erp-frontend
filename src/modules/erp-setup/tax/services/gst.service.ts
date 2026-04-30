import { IGstRateFormData, IGstRateApiResponse, IGstRateApiRequest } from "../interfaces/gst.types";

const BASE_URL = "http://localhost:5104/api";

export const gstService = {
    getAll: async (companyId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/CsGstRate?CompanyId=${companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch GST rates');
            }

            const responseData: IGstRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getAll GST rates:', error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await fetch(`${BASE_URL}/CsGstRate/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch GST rate');
            }

            const responseData: IGstRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getById GST rate:', error);
            throw error;
        }
    },

    create: async (companyId: number, gst: IGstRateFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: IGstRateApiRequest = {
                GstRateId: 0, // New rate
                CompanyId: companyId,
                HsnSacCode: gst.hsnSacCode || gst.code,
                IsHsn: gst.isHsn ?? true,
                GstRate: gst.igstRate, // Using IGST as total GST rate
                EffectiveDate: gst.applicableFrom,
                Description: gst.description,
                CgstRate: gst.cgstRate,
                SgstRate: gst.sgstRate,
                IsActive: gst.status === 'active'
            };

            const response = await fetch(`${BASE_URL}/CsGstRate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create GST rate');
            }

            const responseData: IGstRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in create GST rate:', error);
            throw error;
        }
    },

    update: async (id: number, companyId: number, gst: IGstRateFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: IGstRateApiRequest = {
                GstRateId: id as number,
                CompanyId: companyId,
                HsnSacCode: gst.hsnSacCode || gst.code,
                IsHsn: gst.isHsn ?? true,
                GstRate: gst.igstRate, // Using IGST as total GST rate
                EffectiveDate: gst.applicableFrom,
                Description: gst.description,
                CgstRate: gst.cgstRate,
                SgstRate: gst.sgstRate,
                IsActive: gst.status === 'active'
            };

            const response = await fetch(`${BASE_URL}/CsGstRate/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to update GST rate');
            }

            const responseData: IGstRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in update GST rate:', error);
            throw error;
        }
    },

    delete: async (id: number, companyId: number) => {
        try {
            const response = await fetch(`${BASE_URL}/CsGstRate/${id}?CompanyId=${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete GST rate');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in delete GST rate:', error);
            throw error;
        }
    },
};
