export interface IHsnCode {
    id?: number;
    hsnCode: string;
    hsnDescription: string;
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

export interface IHsnCodeFormData {
    hsnCode: string;
    hsnDescription: string;
    gstRate: number;
    igstRate: number;
    cgstRate: number;
    sgstRate: number;
    utgstRate: number;
    cessRate: number;
    isActive: boolean;
}

export interface IHsnCodeApiRequest {
    HsnCodeId: number;
    CompanyId: number;
    Code: string;
    Description: string;
    DefaultGstRate?: number;
    IgstRate?: number;
    CgstRate?: number;
    SgstRate?: number;
    UtgstRate?: number;
    CessRate?: number;
    IsActive: boolean;
}

export interface IHsnCodeApiResponseItem {
    hsnCodeId?: number;
    companyId: number;
    code: string;
    description: string;
    defaultGstRate?: number;
    igstRate?: number;
    cgstRate?: number;
    sgstRate?: number;
    utgstRate?: number;
    cessRate?: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface IHsnCodeApiResponse {
    message: string;
    statusCode: number;
    data: IHsnCodeApiResponseItem | IHsnCodeApiResponseItem[];
}
