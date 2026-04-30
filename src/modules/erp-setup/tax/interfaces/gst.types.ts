export interface IGstRate {
    id?: number | string;
    code: string;
    description: string;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    status: 'active' | 'inactive';
    applicableFrom: string;
    companyId?: number;
    hsnSacCode?: string;
    isHsn?: boolean;
}

export interface IGstRateFormData {
    code: string;
    description: string;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    status: 'active' | 'inactive';
    applicableFrom: string;
    hsnSacCode?: string;
    isHsn?: boolean;
}

export interface IGstRateApiRequest {
    GstRateId: number;
    CompanyId: number;
    HsnSacCode: string;
    IsHsn: boolean;
    GstRate: number;
    EffectiveDate: string;
    CreatedAt?: string;
    UpdatedAt?: string;
    Description?: string;
    CgstRate?: number;
    SgstRate?: number;
    IsActive?: boolean;
}

export interface IGstRateApiResponseItem {
    gstRateId?: number;
    companyId: number;
    hsnSacCode: string;
    isHsn: boolean;
    gstRate: number;
    effectiveDate: string;
    description?: string;
    cgstRate?: number;
    sgstRate?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IGstRateApiResponse {
    message: string;
    statusCode: number;
    data: IGstRateApiResponseItem | IGstRateApiResponseItem[];
}
