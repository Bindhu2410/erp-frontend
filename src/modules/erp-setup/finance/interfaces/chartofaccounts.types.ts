export interface IChartOfAccountCreate {
    AccountId: number;
    CompanyId: number;
    ParentAccountId: number;
    AccountCode: string;
    AccountName: string;
    AccountType: string;
    IsActive: boolean;
    CostCentreAllocationRequired: boolean;
    CreatedAt?: string;
    UpdatedAt?: string;
}

export interface IChartOfAccountResponse {
    accountId: number;
    companyId: number;
    companyName?: string;
    parentAccountId: number;
    parentAccountName?: string;
    accountCode: string;
    accountName: string;
    accountType: string;
    isActive: boolean;
    costCentreAllocationRequired: boolean;
    createdAt: string;
    updatedAt: string;
    balance?: number;
    level?: number;
}

export interface IChartOfAccountListResponse {
    message: string;
    statusCode: number;
    data: IChartOfAccountResponse[];
}

export interface IChartOfAccountDetailResponse {
    message: string;
    statusCode: number;
    data: IChartOfAccountResponse;
}

export interface IChartOfAccountUpdateRequest extends IChartOfAccountCreate {
    AccountId: number;
}
