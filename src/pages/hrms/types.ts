export type HRMSModule =
  | "dashboard"
  | "employees"
  | "attendance"
  | "timesheets"
  | "payroll"
  | "performance"
  | "letters"
  | "inventory"
  | "reports"
  | "settings";

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  email: string;
  phone: string;
  status: "Active" | "Inactive" | "On Leave";
  avatar?: string;
  joinDate: string;
  salary: number;
}

export interface AttendanceRecord {
  date: string;
  employeeId: string;
  employeeName: string;
  status: "Present" | "Absent" | "Leave" | "Late" | "Half Day";
  checkIn?: string;
  checkOut?: string;
  hours?: number;
}

export interface TimesheetEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  weekStart: string;
  project: string;
  task: string;
  hours: { mon: number; tue: number; wed: number; thu: number; fri: number; sat: number; sun: number };
  status: "Pending" | "Approved" | "Rejected";
  totalHours: number;
  managerComment?: string;
}

export interface PayrollRecord {
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  basic: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  providentFund: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;
  netSalary: number;
  status: "Processed" | "Pending" | "On Hold";
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  goal: string;
  kpi: string;
  weightage: number;
  targetDate: string;
  selfRating: number;
  managerRating: number;
  status: "On Track" | "At Risk" | "Completed" | "Not Started";
  managerFeedback?: string;
}

export interface HRLetter {
  id: string;
  type: "Offer Letter" | "Appointment Letter" | "Relieving Letter" | "Experience Letter";
  employeeId: string;
  employeeName: string;
  generatedDate: string;
  status: "Draft" | "Issued";
}

export interface AssetRecord {
  assetId: string;
  assetName: string;
  category: string;
  assignedTo: string;
  employeeId?: string;
  assignedDate: string;
  returnDate?: string;
  status: "Assigned" | "Available" | "Under Maintenance" | "Retired";
  serialNumber: string;
}
