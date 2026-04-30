export interface ITdsRate {
    id?: number;
    tdsSection: string;
    tdsDescription: string;
    paymentNature: string;
    deducteeType: string;
    thresholdAmount: number;
    tdsRate: number;
    surchargeRate: number;
    ecessRate: number;
    sheEcessRate: number;
    effectiveFromDate: Date;
    effectiveToDate?: Date;
    isActive: boolean;
    companyId?: number;
    createdBy?: string;
    createdDate?: Date;
    modifiedBy?: string;
    modifiedDate?: Date;
}

export interface ITdsRateFormData {
    tdsSection: string;
    tdsDescription: string;
    paymentNature: string;
    deducteeType: string;
    thresholdAmount: number;
    tdsRate: number;
    surchargeRate: number;
    ecessRate: number;
    sheEcessRate: number;
    effectiveFromDate: Date;
    effectiveToDate?: Date;
    isActive: boolean;
}

export interface ITdsRateApiRequest {
    TdsRateId: number;
    CompanyId: number;
    SectionType: string;
    Description?: string;
    PaymentNature?: string;
    DeducteeType?: string;
    ThresholdAmount: number;
    Rate: number;
    SurchargeRate?: number;
    EcessRate?: number;
    SheEcessRate?: number;
    EffectiveDate: string;
    EffectiveToDate?: string;
    IsActive?: boolean;
}

export interface ITdsRateApiResponseItem {
    tdsRateId?: number;
    companyId: number;
    sectionType: string;
    description?: string;
    paymentNature?: string;
    deducteeType?: string;
    thresholdAmount: number;
    rate: number;
    surchargeRate?: number;
    ecessRate?: number;
    sheEcessRate?: number;
    effectiveDate: string;
    effectiveToDate?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ITdsRateApiResponse {
    message: string;
    statusCode: number;
    data: ITdsRateApiResponseItem | ITdsRateApiResponseItem[];
}
