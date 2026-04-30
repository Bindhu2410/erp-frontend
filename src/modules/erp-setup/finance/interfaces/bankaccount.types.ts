export interface IBankAccountCreate {
    CompanyId: number;
    BankName: string;
    BankBranchName: string;
    AccountNumber: string;
    IFSCCode: string;
    SwiftCode: string;
    Purpose: string;
    Currency: string;
    IsActive?: boolean;
}

export interface IBankAccountResponse {
    bankAccountId: number;
    companyId: number;
    bankName: string;
    bankBranchName: string;
    accountNumber: string;
    ifscCode: string;
    swiftCode: string;
    purpose: string;
    currency: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    companyName?: string;
}

export interface IBankAccountListResponse {
    message: string;
    statusCode: number;
    data: IBankAccountResponse[];
}

export interface IBankAccountDetailResponse {
    message: string;
    statusCode: number;
    data: IBankAccountResponse;
}

// Alias for backward compatibility
export type IBankAccountResponseData = IBankAccountListResponse;
