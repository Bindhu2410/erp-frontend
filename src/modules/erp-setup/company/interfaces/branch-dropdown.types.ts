export interface IBranchDropdownItem {
    branchId: number;
    branchCode: string;
    branchName: string;
    isHeadOffice: boolean;
    fullAddress: string;
}

export interface IBranchDropdownResponse {
    message: string;
    statusCode: number;
    data: IBranchDropdownItem[];
    count: number;
}
