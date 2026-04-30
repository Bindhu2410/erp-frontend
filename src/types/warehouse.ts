/**
 * Interface for warehouse data model
 */
export interface Warehouse {
  id: number | string;
  warehouseName: string;
  warehouseType: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  contactPerson: string;
  phone: string;
  email: string;
  isActive: boolean;
  parentWarehouseId: number | null;
  parentWarehouseName?: string;
  description?: string;
}

/**
 * Interface for warehouse form validation errors
 */
export interface WarehouseValidationErrors {
  warehouseName?: string;
  warehouseType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  description?: string;
  pincode?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

/**
 * Warehouse type options
 */
export const warehouseTypeOptions = [
  { value: "Main", label: "Main" },
  { value: "Sub", label: "Sub" },
  { value: "Transit", label: "Transit" },
  { value: "Production", label: "Production" },
  { value: "Returns", label: "Returns" },
];

/**
 * Status options for warehouse
 */
export const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" },
];

/**
 * Default empty warehouse object
 */
export const emptyWarehouse: Warehouse = {
  id: "",
  warehouseName: "",
  warehouseType: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pincode: "",
  contactPerson: "",
  phone: "",
  email: "",
  isActive: true,
  parentWarehouseId: null,
  description: "",
};
