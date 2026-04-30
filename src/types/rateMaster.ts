export interface RateMasterItem {
  id: number;
  rateMasterId: number;
  itemId: number;
  supplierId: number;
  currencyType: string;
  purchaseRate: number;
  hsnCode: string;
  tax: number;
  salesRate: number;
  klRate: number;
  quotationRate: number;
}

export interface RateMaster {
  id: number;
  rateMasterId: string;
  docDate: string;
  effectiveDate: string;
  inventoryGroupId: number;
  type: string;
  remarks: string;
  userCreated: number;
  dateCreated: string;
  userUpdated: number;
  dateUpdated: string;
  items: RateMasterItem[];
}

export interface CreateRateMasterRequest {
  rateMasterId: string;
  docDate: string;
  effectiveDate: string;
  inventoryGroupId: number;
  type: string;
  remarks: string;
  items: Omit<RateMasterItem, 'id' | 'rateMasterId'>[];
}
