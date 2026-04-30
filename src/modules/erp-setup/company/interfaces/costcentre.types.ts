export interface ICostCentreCreate {
    costCentreId?: number;
    companyId: number;
    parentCostCentreId?: number | null;
    costCentreCode: string;
    costCentreName: string;
    isActive: boolean;
}

export interface ICostCentreResponse {
    costCentreId: number;
    companyId: number;
    parentCostCentreId: number | null;
    costCentreCode: string;
    costCentreName: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    parentCostCentreName: string | null;
    companyName?: string;
    parentCostCentreCode?: string | null;
}

export interface ICostCentreResponseData {
    message: string;
    statusCode: number;
    data: ICostCentreResponse[];
}
