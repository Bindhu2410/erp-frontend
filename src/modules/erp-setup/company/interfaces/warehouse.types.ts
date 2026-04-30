export interface IWarehouseItem {
  warehouseId: number;
  companyId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseAddressLine1: string;
  warehouseAddressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  description?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  isActive: boolean;
  defaultInventoryLocationId?: number;
  createdAt?: string;
  updatedAt?: string;
  // Join fields
  companyName?: string;
  branchName?: string;
  branchCode?: string;
}

export interface IWarehouseCreateRequest {
  companyId: number;
  branchId: number;
  warehouseCode: string;
  warehouseName: string;
  warehouseAddressLine1: string;
  warehouseAddressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  description?: string;
  contactPerson?: string;
  contactNumber?: string;
  email?: string;
  isActive: boolean;
  defaultInventoryLocationId?: number;
}

export interface IWarehouseUpdateRequest extends IWarehouseCreateRequest {
  warehouseId: number;
}

export interface IWarehouseResponse {
  message: string;
  data: IWarehouseItem | IWarehouseItem[] | any;
}

