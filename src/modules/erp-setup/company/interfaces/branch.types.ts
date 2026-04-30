export interface IBranchCreate {
    CompanyId: number;
    BranchName: string;
    BranchCode: string;
    AddressLine1: string;
    AddressLine2?: string;
    City: string;
    State: string;
    Pincode: string;
    PhoneNumber?: string;
    EmailAddress?: string;
    Gstin: string;
    IsHeadOffice: boolean;
    IsActive: boolean;
}

export interface IBranchUpdate extends IBranchCreate {
    BranchId: number;
}

export interface IBranchListItem {
    branchId: number;
    companyId: number;
    branchName: string;
    branchCode: string;
    branchAddressLine1: string;
    branchAddressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    branchPhoneNumber?: string;
    branchEmailAddress?: string;
    branchGstin: string;
    isHeadOffice: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    companyName?: string;
    companyCode?: string;
}

export interface IBranchListResponse {
    message: string;
    data: IBranchListItem[];
    count: number;
}

export interface IBranchResponse {
    message: string;
    data: any;
}