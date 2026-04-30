export interface ItemMasterPayload {
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  groupId?: number;
  categoryId?: number;
  inventoryMethodId?: number;
  uomId?: number;
  valuationMethodId?: number;
  itemName?: string;
  longItemName?: string;
  itemCode?: string;
  itemDescription?: string;
  makeId?: number;
  modelId?: number;
  productId?: number;
  brand?: string;
  inventoryType?: string;
  specification?: string;
  criticality?: string;
  stockToBank?: string;
  lpRate?: number;
  unitPrice?: number;
  taxPercentage?: number;
  valuationMethod?: string;
  relatedStockAccount?: string;
  cf?: number;
  hsn?: string;
  bomApplicable?: boolean;
  isActive?: boolean;
  imageUrl?: string;
  catNo?: string;
}

export interface ItemPlanning {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  itemId?: number;
  safetyStockPrimaryUom?: number;
  minimumOrderQtyPrimary?: number;
  maximumOrderQtyPrimaryUom?: number;
  standardCostPrice?: number;
  orderDays?: number;
  averageLeadTime?: number;
  reorderQtyPrimary?: number;
  minimumStockPrimary?: number;
  purchaseReceivedQty?: number;
  purchaseIssuedQty?: number;
}

export interface ItemUomPackingDetails {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  itemId?: number;
  primaryUom?: string;
  buyingUom?: string;
  consumptionUom?: string;
  conversionToPrimary?: number;
  conversionToSecondary?: number;
}

export interface ItemAccountingInfo {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  itemId?: number;
  assetAccount?: string;
  depreciationAccount?: string;
  purchaseAccount?: string;
  salesAccount?: string;
}

export interface LocationStock {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  itemId?: number;
  rack?: string;
  shelf?: string;
  columnNo?: string;
  inPlace?: string;
  openingStock?: number;
  openingStockValue?: number;
  openingCostRate?: number;
  reorderLevel?: number;
  minLevel?: number;
  maxLevel?: number;
  sellingRate?: number;
  receivedQtyPrimary?: number;
  issuedQtyPrimary?: number;
  purchaseUnit?: string;
  euroPurchaseRate?: number;
  inclusiveTaxPrice?: number;
}

export interface ItemQualityControl {
  id?: number;
  userCreated?: number;
  dateCreated?: string;
  userUpdated?: number;
  dateUpdated?: string;
  itemId?: number;
  qcFlag?: boolean;
  qcTemplateId?: number;
  openingStockQty?: number;
}

export interface SupplierInfo {
  vendorName?: string;
  vendorCode?: string;
  description?: string;
  rate?: number;
}

export interface ItemAggregate {
  itemMaster?: ItemMasterPayload;
  itemPlanning?: ItemPlanning;
  itemUomPackingDetails?: ItemUomPackingDetails;
  itemAccountingInfo?: ItemAccountingInfo;
  locationStocks?: LocationStock[];
  itemQualityControl?: ItemQualityControl;
  suppliers?: SupplierInfo[];
}

export type ItemMasterArray = ItemMasterPayload[];

export default ItemAggregate;
