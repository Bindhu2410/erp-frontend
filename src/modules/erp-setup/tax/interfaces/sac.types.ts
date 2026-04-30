export interface ISacCode {
    id?: number;
    sacCode: string;
    sacDescription: string;
    gstRate: number;
    igstRate: number;
    cgstRate: number;
    sgstRate: number;
    utgstRate: number;
    cessRate: number;
    isActive: boolean;
    companyId?: number;
    createdBy?: string;
    createdDate?: Date;
    modifiedBy?: string;
    modifiedDate?: Date;
}

export interface ISacCodeFormData {
    sacCode: string;
    sacDescription: string;
    gstRate: number;
    igstRate: number;
    cgstRate: number;
    sgstRate: number;
    utgstRate: number;
    cessRate: number;
    isActive: boolean;
}

export interface ISacCodeApiRequest {
    SacCodeId: number;
    CompanyId: number;
    SacCode: string;
    Description: string;
    DefaultGstRate: number;
    IgstRate?: number;
    CgstRate?: number;
    SgstRate?: number;
    UtgstRate?: number;
    CessRate?: number;
    IsActive?: boolean;
}

export interface ISacCodeApiResponseItem {
    sacCodeId?: number;
    companyId: number;
    sacCode: string;
    description: string;
    defaultGstRate: number;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    utgstRate?: number;
    cessRate?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ISacCodeApiResponse {
    message: string;
    statusCode: number;
    data: ISacCodeApiResponseItem | ISacCodeApiResponseItem[];
}
