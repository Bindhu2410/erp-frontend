import { ICompanySetup, ICompanyCreateRequest } from '../interfaces/company.types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '${process.env.REACT_APP_API_BASE_URL}';

export const companyService = {
    async createCompany(formData: ICompanySetup): Promise<any> {
        try {
            const requestData: ICompanyCreateRequest = {
                LegalCompanyName: formData.profile.LegalCompanyName,
                ParentCompanyId: formData.profile.ParentCompanyId || 0,
                RegisteredAddressLine1: formData.profile.RegisteredAddressLine1,
                RegisteredAddressLine2: formData.profile.RegisteredAddressLine2,
                City: formData.profile.City,
                State: formData.profile.State,
                Pincode: formData.profile.Pincode,
                PhoneNumber: formData.profile.PhoneNumber,
                EmailAddress: formData.profile.EmailAddress,
                WebsiteUrl: formData.profile.WebsiteUrl,
                CompanyLogoPath: "", // Add default empty string or get from formData if available
                BaseCurrency: formData.financialSettings.BaseCurrency,
                FinancialYearStartDate: formData.financialSettings.FinancialYearStartDate,
                FinancialYearEndDate: formData.financialSettings.FinancialYearEndDate,
                Pan: formData.taxInfo.PAN,
                Tan: formData.taxInfo.TAN,
                Gstin: formData.taxInfo.GSTIN,
                LegalEntityType: formData.profile.LegalEntityType,
                LegalNameAsPerPanTan: formData.taxInfo.LegalNameAsPerPANTAN
            };

            const response = await fetch(`${API_BASE_URL}CsCompany`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('Failed to create company');
            }

            return await response.json();
        } catch (error) {
            console.error('Error in createCompany:', error);
            throw error;
        }
    }
};