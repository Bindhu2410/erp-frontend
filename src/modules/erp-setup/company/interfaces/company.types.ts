export interface ICompanyProfile {
    LegalCompanyName: string;
    ParentCompanyId?: number;
    RegisteredAddressLine1: string;
    RegisteredAddressLine2?: string;
    City: string;
    State: string;
    Pincode: string;
    PhoneNumber?: string;
    EmailAddress?: string;
    WebsiteUrl?: string;
    LegalEntityType: string;
}

export interface ITaxInformation {
    PAN: string;
    TAN: string;
    GSTIN: string;
    LegalNameAsPerPANTAN: string;
}

export interface IFinancialSettings {
    BaseCurrency: string;
    FinancialYearStartDate: string;
    FinancialYearEndDate: string;
}

export interface ICompanySetup {
    profile: ICompanyProfile;
    taxInfo: ITaxInformation;
    financialSettings: IFinancialSettings;
}

export interface ICompanyCreateRequest {
    LegalCompanyName: string;
    ParentCompanyId?: number;
    RegisteredAddressLine1: string;
    RegisteredAddressLine2?: string;
    City: string;
    State: string;
    Pincode: string;
    PhoneNumber?: string;
    EmailAddress?: string;
    WebsiteUrl?: string;
    CompanyLogoPath?: string;
    BaseCurrency: string;
    FinancialYearStartDate: string;
    FinancialYearEndDate: string;
    Pan: string;
    Tan: string;
    Gstin: string;
    LegalEntityType: string;
    LegalNameAsPerPanTan: string;
}