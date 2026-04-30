export interface ICompanyListItem {
  companyId: number;
  parentCompanyId: number | null;
  legalCompanyName: string;
  registeredAddressLine1: string;
  registeredAddressLine2: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  emailAddress: string;
  websiteUrl: string;
  companyLogoPath: string;
  baseCurrency: string;
  financialYearStartDate: string;
  financialYearEndDate: string;
  pan: string;
  tan: string;
  gstin: string;
  legalEntityType: string;
  legalNameAsPerPanTan: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICompanyListResponse {
  message: string;
  data: ICompanyListItem[];
}

export interface ICompanySingleResponse {
  message: string;
  data: ICompanyListItem;
}