import { ITdsRateFormData, ITdsRateApiResponse, ITdsRateApiRequest, ITdsRateApiResponseItem } from "../interfaces/tds.types";

const BASE_URL = "${process.env.REACT_APP_API_BASE_URL}";

export const tdsService = {
    getAll: async (companyId: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsTdsRates?CompanyId=${companyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch TDS rates');
            }

            const responseData: ITdsRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getAll TDS rates:', error);
            throw error;
        }
    },

    getById: async (id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsTdsRates/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch TDS rate');
            }

            const responseData: ITdsRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in getById TDS rate:', error);
            throw error;
        }
    },

    create: async (companyId: number, tds: ITdsRateFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: ITdsRateApiRequest = {
                TdsRateId: 0, // New rate
                CompanyId: companyId,
                SectionType: tds.tdsSection,
                Description: tds.tdsDescription,
                PaymentNature: tds.paymentNature,
                DeducteeType: tds.deducteeType,
                ThresholdAmount: tds.thresholdAmount,
                Rate: tds.tdsRate,
                SurchargeRate: tds.surchargeRate,
                EcessRate: tds.ecessRate,
                SheEcessRate: tds.sheEcessRate,
                EffectiveDate: tds.effectiveFromDate.toISOString(),
                EffectiveToDate: tds.effectiveToDate?.toISOString(),
                IsActive: tds.isActive
            };

            const response = await fetch(`${BASE_URL}CsTdsRates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create TDS rate');
            }

            const responseData: ITdsRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in create TDS rate:', error);
            throw error;
        }
    },

    update: async (companyId: number, id: number, tds: ITdsRateFormData) => {
        try {
            // Transform form data to API request format
            const apiRequest: ITdsRateApiRequest = {
                TdsRateId: id,
                CompanyId: companyId,
                SectionType: tds.tdsSection,
                Description: tds.tdsDescription,
                PaymentNature: tds.paymentNature,
                DeducteeType: tds.deducteeType,
                ThresholdAmount: tds.thresholdAmount,
                Rate: tds.tdsRate,
                SurchargeRate: tds.surchargeRate,
                EcessRate: tds.ecessRate,
                SheEcessRate: tds.sheEcessRate,
                EffectiveDate: tds.effectiveFromDate.toISOString(),
                EffectiveToDate: tds.effectiveToDate?.toISOString(),
                IsActive: tds.isActive
            };

            const response = await fetch(`${BASE_URL}CsTdsRates/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to update TDS rate');
            }

            const responseData: ITdsRateApiResponse = await response.json();
            return responseData;
        } catch (error) {
            console.error('Error in update TDS rate:', error);
            throw error;
        }
    },

    delete: async (companyId: number, id: number) => {
        try {
            const response = await fetch(`${BASE_URL}CsTdsRates/${id}?CompanyId=${companyId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete TDS rate');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in delete TDS rate:', error);
            throw error;
        }
    },
};
