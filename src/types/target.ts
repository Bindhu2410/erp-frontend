export type TargetStatus =
  | "Draft"
  | "Approved"
  | "Active"
  | "Completed"
  | "Cancelled";

export interface Target {
  id: string;
  docId: string;
  fromDate: string;
  toDate: string;
  territory: string;
  territoryId: string;
  zoneId?: string;
  zoneName?: string;
  employeeId: string;
  employeeName: string;
  status: TargetStatus;
  createdDate?: string;
}

export interface TargetDetail {
  id?: string;
  targetId?: string;
  productId?: string;
  productName: string;
  modelName?: string;
  qty: number;
  targetAmount: number;
  achievedAmount: number;
  achievementPercentage?: number;
}

export interface TargetTableRow extends Target {
  targetId?: string; // master record id to navigate/delete/edit
  productName: string;
  modelName: string;
  qty: number;
  targetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;
}

export interface TargetGridResponse {
  target: Target;
  details?: TargetDetail[];
}

export interface TargetFilterState {
  territory: Option[];
  employee: Option[];
  status: Option[];
  fromDate?: string;
  toDate?: string;
}

export interface Option {
  value: string;
  label: string;
}
